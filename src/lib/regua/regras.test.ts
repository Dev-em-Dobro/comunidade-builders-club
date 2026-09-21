import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  entradaCs,
  isElegivelReguaMember,
  lastSeenNeedsTouch,
  LAST_SEEN_THROTTLE_MS,
  MS_48H,
  MS_7D,
  MS_14D,
  shouldSendSemAcesso48h,
  shouldSendSemAmostra7d,
  shouldSendSemAtividade14d,
} from "./regras";

const now = new Date("2026-09-02T15:00:00.000Z");

describe("shouldSendSemAcesso48h — F075", () => {
  it("não dispara sem lastSeenAt (evita blast no deploy)", () => {
    assert.equal(
      shouldSendSemAcesso48h({
        lastSeenAt: null,
        lastSendAt: null,
        now,
      }),
      false,
    );
  });

  it("não dispara antes de 48h", () => {
    assert.equal(
      shouldSendSemAcesso48h({
        lastSeenAt: new Date(now.getTime() - MS_48H + 60_000),
        lastSendAt: null,
        now,
      }),
      false,
    );
  });

  it("dispara na primeira ausência de 48h", () => {
    assert.equal(
      shouldSendSemAcesso48h({
        lastSeenAt: new Date(now.getTime() - MS_48H),
        lastSendAt: null,
        now,
      }),
      true,
    );
  });

  it("não dispara de novo se continua sumido", () => {
    const seen = new Date(now.getTime() - 5 * MS_48H);
    assert.equal(
      shouldSendSemAcesso48h({
        lastSeenAt: seen,
        lastSendAt: new Date(seen.getTime() + 60_000),
        now,
      }),
      false,
    );
  });

  it("dispara de novo depois que voltou e sumiu outra vez", () => {
    const lastSend = new Date(now.getTime() - 10 * MS_48H);
    const lastSeen = new Date(now.getTime() - MS_48H);
    assert.equal(
      shouldSendSemAcesso48h({
        lastSeenAt: lastSeen,
        lastSendAt: lastSend,
        now,
      }),
      true,
    );
  });
});

describe("isElegivelReguaMember — F075", () => {
  it("aceita member ativo, free ou pago", () => {
    assert.equal(
      isElegivelReguaMember({ status: "active", role: "member" }),
      true,
    );
  });

  it("rejeita staff e membership inativa", () => {
    assert.equal(
      isElegivelReguaMember({ status: "active", role: "admin" }),
      false,
    );
    assert.equal(
      isElegivelReguaMember({ status: "revoked", role: "member" }),
      false,
    );
  });
});

describe("lastSeenNeedsTouch — F075", () => {
  it("grava o primeiro heartbeat", () => {
    assert.equal(lastSeenNeedsTouch(null, now), true);
  });

  it("respeita o throttle de 15 min", () => {
    assert.equal(
      lastSeenNeedsTouch(new Date(now.getTime() - LAST_SEEN_THROTTLE_MS + 1), now),
      false,
    );
    assert.equal(
      lastSeenNeedsTouch(new Date(now.getTime() - LAST_SEEN_THROTTLE_MS), now),
      true,
    );
  });
});

describe("shouldSendSemAmostra7d — F084", () => {
  const entrada = new Date(now.getTime() - MS_7D);

  it("não dispara antes de 7 dias", () => {
    assert.equal(
      shouldSendSemAmostra7d({
        entrada: new Date(now.getTime() - MS_7D + 60_000),
        temAmostra: false,
        lastSendAt: null,
        now,
      }),
      false,
    );
  });

  it("não dispara se já publicou amostra", () => {
    assert.equal(
      shouldSendSemAmostra7d({
        entrada,
        temAmostra: true,
        lastSendAt: null,
        now,
      }),
      false,
    );
  });

  it("dispara uma vez quando o prazo passou e não há amostra", () => {
    assert.equal(
      shouldSendSemAmostra7d({
        entrada,
        temAmostra: false,
        lastSendAt: null,
        now,
      }),
      true,
    );
  });

  it("não dispara de novo depois do primeiro envio", () => {
    assert.equal(
      shouldSendSemAmostra7d({
        entrada,
        temAmostra: false,
        lastSendAt: new Date(now.getTime() - 60_000),
        now,
      }),
      false,
    );
  });
});

describe("shouldSendSemAtividade14d — F084", () => {
  it("não dispara antes de 14 dias da última atividade", () => {
    assert.equal(
      shouldSendSemAtividade14d({
        entrada: new Date(now.getTime() - 30 * MS_7D),
        lastActivityAt: new Date(now.getTime() - MS_14D + 60_000),
        lastSendAt: null,
        now,
      }),
      false,
    );
  });

  it("usa a entrada quando nunca interagiu", () => {
    assert.equal(
      shouldSendSemAtividade14d({
        entrada: new Date(now.getTime() - MS_14D),
        lastActivityAt: null,
        lastSendAt: null,
        now,
      }),
      true,
    );
  });

  it("não dispara de novo no mesmo episódio", () => {
    const lastActivityAt = new Date(now.getTime() - MS_14D);
    assert.equal(
      shouldSendSemAtividade14d({
        entrada: new Date(now.getTime() - 40 * MS_7D),
        lastActivityAt,
        lastSendAt: new Date(lastActivityAt.getTime() + 60_000),
        now,
      }),
      false,
    );
  });

  it("dispara de novo depois que voltou a interagir e sumiu", () => {
    assert.equal(
      shouldSendSemAtividade14d({
        entrada: new Date(now.getTime() - 40 * MS_7D),
        lastActivityAt: new Date(now.getTime() - MS_14D),
        lastSendAt: new Date(now.getTime() - 2 * MS_14D),
        now,
      }),
      true,
    );
  });
});

describe("entradaCs — F084", () => {
  const loginAt = new Date("2026-09-01T15:00:00.000Z");

  it("usa a compra quando a allowlist da loja veio até 24h depois do login", () => {
    const compra = new Date("2026-08-31T12:00:00.000Z");
    assert.equal(
      entradaCs({
        loginAt,
        allowlistAt: compra,
        allowlistSource: "hubla",
      }).getTime(),
      compra.getTime(),
    );
  });

  it("usa o login quando não veio da loja", () => {
    assert.equal(
      entradaCs({
        loginAt,
        allowlistAt: null,
        allowlistSource: null,
      }).getTime(),
      loginAt.getTime(),
    );
  });
});

