import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AULA_ABERTURA_HREF,
  POPUP_DELAY_MS,
  subheadPopup,
  tituloPopup,
} from "./popup-aula";

describe("copy por número de aulas (F078)", () => {
  it("usa o número quando a contagem veio do banco", () => {
    assert.match(tituloPopup(5), /5 primeiras aulas/);
    assert.match(subheadPopup(5), /as 5 primeiras aulas/);
  });

  it("cai na forma sem número quando a contagem falha ou vem zero", () => {
    // Melhor uma copy mais fraca do que uma que promete "0 aulas".
    assert.match(tituloPopup(0), /às primeiras aulas/);
    assert.doesNotMatch(tituloPopup(0), /\d/);
    assert.match(subheadPopup(0), /as primeiras aulas/);
    assert.doesNotMatch(subheadPopup(0), /\b\d+ primeiras\b/);
  });

  it("número negativo é tratado como ausência de contagem", () => {
    assert.doesNotMatch(tituloPopup(-3), /-3/);
  });

  it("não promete aula tática que o módulo não entrega", () => {
    // Decisão 4: a promessa dos 90 dias é do Club, não título de aula. O
    // módulo gratuito é a porta de entrada, e a copy não pode inverter isso.
    for (const texto of [tituloPopup(5), subheadPopup(5)]) {
      assert.doesNotMatch(texto, /90 dias/);
    }
  });
});

describe("destino do cadastro pela modal (F078)", () => {
  it("aponta para a aula de abertura do módulo gratuito", () => {
    assert.equal(
      AULA_ABERTURA_HREF,
      "/aulas/fase-1-m01-comece-por-aqui/aula-introducao-builders-club",
    );
  });
});

describe("delay da modal (F078)", () => {
  it("é positivo e não dispara na abertura da página", () => {
    // Guarda contra alguém zerar o delay: modal instantânea é o pedágio que a
    // F063 proíbe, sem nenhuma leitura antes para justificá-lo.
    assert.ok(POPUP_DELAY_MS >= 10_000, `delay curto demais: ${POPUP_DELAY_MS}`);
  });
});
