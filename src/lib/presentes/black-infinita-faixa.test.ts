import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import {
  BLACK_INFINITA_FAIXA_COPY,
  BLACK_INFINITA_FAIXA_HREF,
  BLACK_INFINITA_FAIXA_KEY,
  dismissBlackInfinitaFaixa,
  shouldShowBlackInfinitaFaixa,
  type StorageLike,
} from "./black-infinita-faixa";

function mem(initial: Record<string, string> = {}): StorageLike {
  const m = new Map(Object.entries(initial));
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => {
      m.set(k, v);
    },
  };
}

describe("visibilidade da faixa Black Infinita no Presente (F119)", () => {
  it("visitante deslogado vê a faixa", () => {
    assert.equal(
      shouldShowBlackInfinitaFaixa({ loggedIn: false, dismissedRaw: null }),
      true,
    );
  });

  it("logado não vê a faixa", () => {
    assert.equal(
      shouldShowBlackInfinitaFaixa({ loggedIn: true, dismissedRaw: null }),
      false,
    );
  });

  it("dispensada não volta", () => {
    assert.equal(
      shouldShowBlackInfinitaFaixa({ loggedIn: false, dismissedRaw: "1" }),
      false,
    );
    const storage = mem();
    dismissBlackInfinitaFaixa(storage);
    assert.equal(storage.getItem(BLACK_INFINITA_FAIXA_KEY), "1");
    assert.equal(
      shouldShowBlackInfinitaFaixa({
        loggedIn: false,
        dismissedRaw: storage.getItem(BLACK_INFINITA_FAIXA_KEY),
      }),
      false,
    );
  });
});

describe("copy, destino e markup da faixa (F119)", () => {
  const pagina = readFileSync("src/app/presentes/presente-publico.tsx", "utf8");
  const faixa = readFileSync(
    "src/app/presentes/presente-black-infinita-faixa.tsx",
    "utf8",
  );

  it("a copy e o destino são os da campanha, sem UTM", () => {
    assert.equal(
      BLACK_INFINITA_FAIXA_COPY,
      "Black em Dobro Infinita: a melhor condição da história da Dev em Dobro. Live gratuita 05/11 às 20h.",
    );
    assert.equal(
      BLACK_INFINITA_FAIXA_HREF,
      "https://blackinfinita.devemdobro.com/",
    );
    assert.equal(BLACK_INFINITA_FAIXA_KEY, "bc_black_infinita_dismissed");
    assert.doesNotMatch(BLACK_INFINITA_FAIXA_HREF, /utm_/);
  });

  it("só monta no Presente quando a sessão é anônima", () => {
    assert.match(pagina, /!user \? <PresenteBlackInfinitaFaixa \/>/);
    assert.match(pagina, /getOptionalUser/);
  });

  it("o X tem 44px, aria-label, e o link abre em nova aba", () => {
    assert.match(faixa, /h-11 w-11/);
    assert.match(faixa, /aria-label=\{BLACK_INFINITA_FAIXA_FECHAR\}/);
    assert.match(faixa, /target="_blank"/);
    assert.match(faixa, /rel="noopener noreferrer"/);
    assert.doesNotMatch(faixa, /z-\[60\]/);
    assert.doesNotMatch(faixa, /z-50/);
    assert.doesNotMatch(faixa, /fixed|sticky/);
    assert.match(faixa, /useState\(false\)/);
  });
});
