import assert from "node:assert/strict";
import { describe, it } from "node:test";
import React, { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";

// tsx compila JSX do app com o runtime clássico (`React.createElement`)
// e os componentes não importam React (Next usa o runtime automático).
(globalThis as typeof globalThis & { React: typeof React }).React = React;

const ORDEM = [
  "Entrar no grupo de WhatsApp",
  "Completar o perfil",
  "Assistir as aulas do método",
  "Praticar e postar na comunidade",
] as const;

const CADEADO = "M7 11V7a5 5 0 0 1 10 0v4";

async function html(opts: { isElite: boolean; whatsappUrl: string | null }) {
  const { MetodoView } = (await import("@/components/metodo-view")) as {
    MetodoView: ComponentType<{
      isElite: boolean;
      whatsappUrl: string | null;
    }>;
  };
  const { UpgradeProvider } = (await import(
    "@/components/upgrade-modal"
  )) as {
    UpgradeProvider: ComponentType<{
      isPaid: boolean;
      isElite: boolean;
      children?: React.ReactNode;
    }>;
  };
  return renderToStaticMarkup(
    createElement(
      UpgradeProvider,
      { isPaid: opts.isElite, isElite: opts.isElite },
      createElement(MetodoView, opts),
    ),
  );
}

function ordemDosPassos(markup: string) {
  const pos = ORDEM.map((label) => {
    const i = markup.indexOf(label);
    assert.ok(i >= 0, `passo ausente: ${label}`);
    return { label, i };
  });
  return pos.sort((a, b) => a.i - b.i).map((p) => p.label);
}

describe("MetodoView — ordem e cadeado", () => {
  it("coloca o grupo de WhatsApp no passo 1", async () => {
    const markup = await html({ isElite: false, whatsappUrl: null });
    assert.deepEqual(ordemDosPassos(markup), [...ORDEM]);
    const primeiro = markup.slice(
      markup.indexOf("<ol"),
      markup.indexOf("</button>"),
    );
    assert.match(primeiro, />1<\/span>/);
    assert.match(primeiro, /Entrar no grupo de WhatsApp/);
    assert.doesNotMatch(primeiro, />2<\/span>/);
  });

  it("mostra cadeado para não-Elite e esconde o link do grupo", async () => {
    const markup = await html({
      isElite: false,
      whatsappUrl: "https://chat.whatsapp.com/elite",
    });
    const grupo = markup.slice(
      markup.indexOf("<ol"),
      markup.indexOf("</button>"),
    );
    const botao = grupo.match(/<button[^>]*>/)?.[0] ?? "";
    assert.match(botao, /\btext-left\b/);
    assert.match(botao, /\bw-full\b/);
    assert.doesNotMatch(botao, /inline-flex|text-center|justify-center|items-center/);
    assert.match(grupo, /Entrar no grupo de WhatsApp<svg/);
    assert.match(grupo, new RegExp(CADEADO));
    assert.doesNotMatch(grupo, /chat\.whatsapp\.com/);
    assert.doesNotMatch(grupo, /href=/);
    assert.doesNotMatch(markup, /Peça o link do grupo/);
  });

  it("Elite com URL recebe o link e sem cadeado", async () => {
    const markup = await html({
      isElite: true,
      whatsappUrl: "https://chat.whatsapp.com/elite",
    });
    assert.match(
      markup,
      /href="https:\/\/chat\.whatsapp\.com\/elite"[^>]*target="_blank"[^>]*class="[^"]*\btext-left\b[^"]*"/,
    );
    assert.match(
      markup,
      /href="https:\/\/chat\.whatsapp\.com\/elite"[^>]*class="[^"]*\bw-full\b[^"]*"/,
    );
    assert.doesNotMatch(markup, new RegExp(CADEADO));
  });

  it("Elite sem URL vê o aviso e sem cadeado", async () => {
    const markup = await html({ isElite: true, whatsappUrl: null });
    assert.match(
      markup,
      /Peça o link do grupo no plantão ou no suporte Elite\./,
    );
    assert.doesNotMatch(markup, new RegExp(CADEADO));
    assert.doesNotMatch(markup, /target="_blank"/);
  });
});
