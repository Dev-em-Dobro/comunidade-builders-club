import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { BLACK_INFINITA_FAIXA_COPY } from "./black-infinita-faixa";
import { POPUP_DELAY_MS } from "./popup-aula";
import {
  aulaPopupLiberouABlack,
  BLACK_INFINITA_POPUP_AULA_WAIT_MS,
  BLACK_INFINITA_POPUP_COPY,
  BLACK_INFINITA_POPUP_CTA,
  BLACK_INFINITA_POPUP_HREF,
  BLACK_INFINITA_POPUP_KEY,
  dismissBlackInfinitaPopup,
  shouldShowBlackInfinitaPopup,
} from "./black-infinita-popup";
import type { StorageLike } from "./black-infinita-faixa";

function mem(initial: Record<string, string> = {}): StorageLike {
  const m = new Map(Object.entries(initial));
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => {
      m.set(k, v);
    },
  };
}

const base = {
  loggedIn: false,
  dismissedRaw: null as string | null,
  aulaPopupAberta: false,
  aulaPopupEncerrada: false,
};

describe("visibilidade da pop-up Black Infinita (F121)", () => {
  it("deslogado não vê enquanto a pop-up da aula está na frente", () => {
    assert.equal(
      shouldShowBlackInfinitaPopup({
        ...base,
        aulaPopupAberta: true,
        aulaPopupEncerrada: false,
      }),
      false,
    );
  });

  it("deslogado vê depois que a pop-up da aula fecha", () => {
    assert.equal(
      shouldShowBlackInfinitaPopup({
        ...base,
        aulaPopupAberta: false,
        aulaPopupEncerrada: true,
      }),
      true,
    );
  });

  it("deslogado vê se a pop-up da aula não for aparecer", () => {
    assert.equal(
      aulaPopupLiberouABlack({
        viuAulaPopup: false,
        aulaPopupAberta: false,
        esperaDaAulaExpirou: true,
      }),
      true,
    );
    assert.equal(
      shouldShowBlackInfinitaPopup({
        ...base,
        aulaPopupAberta: false,
        aulaPopupEncerrada: true,
      }),
      true,
    );
  });

  it("espera o delay da aula antes de assumir que ela não vem", () => {
    assert.equal(
      aulaPopupLiberouABlack({
        viuAulaPopup: false,
        aulaPopupAberta: false,
        esperaDaAulaExpirou: false,
      }),
      false,
    );
    assert.equal(
      aulaPopupLiberouABlack({
        viuAulaPopup: true,
        aulaPopupAberta: true,
        esperaDaAulaExpirou: true,
      }),
      false,
    );
    assert.equal(
      aulaPopupLiberouABlack({
        viuAulaPopup: true,
        aulaPopupAberta: false,
        esperaDaAulaExpirou: true,
      }),
      true,
    );
    assert.ok(BLACK_INFINITA_POPUP_AULA_WAIT_MS > POPUP_DELAY_MS);
  });

  it("logado nunca vê", () => {
    assert.equal(
      shouldShowBlackInfinitaPopup({
        ...base,
        loggedIn: true,
        aulaPopupEncerrada: true,
      }),
      false,
    );
  });

  it("dispensada não volta, mesmo depois da aula", () => {
    assert.equal(
      shouldShowBlackInfinitaPopup({
        ...base,
        dismissedRaw: "1",
        aulaPopupEncerrada: true,
      }),
      false,
    );
    const storage = mem();
    dismissBlackInfinitaPopup(storage);
    assert.equal(storage.getItem(BLACK_INFINITA_POPUP_KEY), "1");
    assert.equal(
      shouldShowBlackInfinitaPopup({
        ...base,
        dismissedRaw: storage.getItem(BLACK_INFINITA_POPUP_KEY),
        aulaPopupEncerrada: true,
      }),
      false,
    );
  });

  it("não abre no intervalo antes da aula aparecer", () => {
    assert.equal(shouldShowBlackInfinitaPopup(base), false);
  });
});

describe("copy, destino e markup da pop-up Black (F121)", () => {
  const pagina = readFileSync("src/app/presentes/presente-publico.tsx", "utf8");
  const modal = readFileSync(
    "src/app/presentes/presente-black-infinita-popup.tsx",
    "utf8",
  );
  const aula = readFileSync("src/app/presentes/presente-aula-popup.tsx", "utf8");
  const banner = readFileSync("src/components/cookie-consent.tsx", "utf8");

  it("reusa copy e destino da faixa / F117, sem UTM", () => {
    assert.equal(BLACK_INFINITA_POPUP_COPY, BLACK_INFINITA_FAIXA_COPY);
    assert.equal(
      BLACK_INFINITA_POPUP_HREF,
      "https://blackinfinita.devemdobro.com/",
    );
    assert.equal(BLACK_INFINITA_POPUP_CTA, "Entrar na lista da live");
    assert.equal(BLACK_INFINITA_POPUP_KEY, "bc_black_infinita_popup_dismissed");
    assert.doesNotMatch(BLACK_INFINITA_POPUP_HREF, /utm_/);
  });

  it("só monta no Presente quando a sessão é anônima", () => {
    assert.match(pagina, /!user \? <PresenteBlackInfinitaPopup \/>/);
    assert.match(pagina, /getOptionalUser/);
  });

  it("X 44px, CTA em nova aba, fade, z entre cookies e a aula", () => {
    assert.match(modal, /h-11 w-11/);
    assert.match(modal, /aria-label=\{BLACK_INFINITA_POPUP_FECHAR\}/);
    assert.match(modal, /target="_blank"/);
    assert.match(modal, /rel="noopener noreferrer"/);
    assert.match(modal, /onClick=\{fechar\}/);
    assert.match(modal, /POPUP_FADE_CLASS/);
    assert.match(modal, /z-\[55\]/);
    assert.match(modal, /BLACK_INFINITA_POPUP_AULA_WAIT_MS/);
    assert.doesNotMatch(modal, /z-\[60\]/);
    assert.doesNotMatch(modal, /z-50/);
    assert.match(modal, /useState\(false\)/);
  });

  it("não mexe na pop-up da aula nem no aviso de cookies", () => {
    assert.doesNotMatch(aula, /BlackInfinita/);
    assert.doesNotMatch(aula, /BLACK_INFINITA_POPUP/);
    assert.doesNotMatch(banner, /BlackInfinita/);
    assert.doesNotMatch(banner, /bc_black_infinita_popup/);
  });
});
