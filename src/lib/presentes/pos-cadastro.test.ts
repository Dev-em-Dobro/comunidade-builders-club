import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CADASTRO_LANDING_SLUG } from "@/lib/gifts/origem";
import {
  consumePosCadastroPresente,
  encodePosCadastroPresente,
  giftPublicPath,
  parsePosCadastroPresente,
  POS_CADASTRO_PENDING_KEY,
  POS_CADASTRO_SHOWN_KEY,
  rememberPosCadastroPresente,
  shouldShowPosCadastroPopup,
  tituloPosCadastro,
  type StorageLike,
} from "./pos-cadastro";

function mem(initial: Record<string, string> = {}): StorageLike {
  const m = new Map(Object.entries(initial));
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => {
      m.set(k, v);
    },
    removeItem: (k) => {
      m.delete(k);
    },
  };
}

describe("giftPublicPath (F118)", () => {
  it("resolve o presente público pelo slug sanitizado", () => {
    assert.equal(giftPublicPath("agent-reach"), "/presentes/agent-reach");
    assert.equal(giftPublicPath("Eu-Quero-26-08-2026"), "/presentes/eu-quero-26-08-2026");
  });

  it("não aponta cadastro genérico nem slug inválido para /presentes", () => {
    assert.equal(giftPublicPath(CADASTRO_LANDING_SLUG), null);
    assert.equal(giftPublicPath(""), null);
    assert.equal(giftPublicPath("não é slug"), null);
    assert.equal(giftPublicPath(null), null);
  });
});

describe("parse/encode do pending (F118)", () => {
  it("roundtrip guarda slug, título e href", () => {
    const raw = encodePosCadastroPresente({
      slug: "agent-reach",
      title: "Agent Reach",
    });
    const parsed = parsePosCadastroPresente(raw);
    assert.deepEqual(parsed, {
      slug: "agent-reach",
      title: "Agent Reach",
      href: "/presentes/agent-reach",
    });
  });

  it("título ausente ou vazio vira null, slug continua", () => {
    assert.equal(
      parsePosCadastroPresente(
        encodePosCadastroPresente({ slug: "agent-reach", title: "   " }),
      )?.title,
      null,
    );
  });

  it("rejeita JSON, slug de cadastro e lixo", () => {
    assert.equal(parsePosCadastroPresente("{"), null);
    assert.equal(parsePosCadastroPresente('{"slug":"cadastro"}'), null);
    assert.equal(encodePosCadastroPresente({ slug: "cadastro" }), null);
  });
});

describe("show-once do lembrete (F118)", () => {
  it("mostra só com pending e sem shown", () => {
    const pending = parsePosCadastroPresente(
      encodePosCadastroPresente({ slug: "agent-reach", title: "Agent Reach" }),
    );
    assert.equal(shouldShowPosCadastroPopup({ pending, shownRaw: null }), true);
    assert.equal(shouldShowPosCadastroPopup({ pending, shownRaw: "1" }), false);
    assert.equal(shouldShowPosCadastroPopup({ pending: null, shownRaw: null }), false);
  });

  it("consume uma vez: segunda leitura na mesma storage some", () => {
    const storage = mem();
    assert.equal(
      rememberPosCadastroPresente(storage, {
        slug: "agent-reach",
        title: "Agent Reach",
      }),
      true,
    );
    const first = consumePosCadastroPresente(storage);
    assert.equal(first?.href, "/presentes/agent-reach");
    assert.equal(first?.title, "Agent Reach");
    assert.equal(storage.getItem(POS_CADASTRO_SHOWN_KEY), "1");
    assert.equal(storage.getItem(POS_CADASTRO_PENDING_KEY), null);
    assert.equal(consumePosCadastroPresente(storage), null);
  });

  it("novo remember depois de shown volta a mostrar (uma vez por cadastro)", () => {
    const storage = mem();
    rememberPosCadastroPresente(storage, { slug: "agent-reach", title: "A" });
    consumePosCadastroPresente(storage);
    rememberPosCadastroPresente(storage, { slug: "hermes", title: "Hermes" });
    const again = consumePosCadastroPresente(storage);
    assert.equal(again?.slug, "hermes");
    assert.equal(again?.title, "Hermes");
  });

  it("signup genérico não grava pending", () => {
    const storage = mem();
    assert.equal(
      rememberPosCadastroPresente(storage, { slug: CADASTRO_LANDING_SLUG }),
      false,
    );
    assert.equal(consumePosCadastroPresente(storage), null);
  });

  it("título entra na copy quando existe, e cai no genérico se não", () => {
    assert.match(tituloPosCadastro("Agent Reach"), /Agent Reach/);
    assert.equal(tituloPosCadastro(null), "Quer ver seu presente agora?");
    assert.equal(tituloPosCadastro("  "), "Quer ver seu presente agora?");
  });
});
