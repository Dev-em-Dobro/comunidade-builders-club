import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AULA_ABERTURA_HREF,
  POPUP_DISPENSA_MS,
  dispensaAtiva,
  subheadPopup,
  tituloPopup,
} from "./popup-aula";

const AGORA = new Date("2026-09-04T12:00:00-03:00").getTime();

describe("dispensaAtiva — memória do 'Agora não' (F078)", () => {
  it("nunca dispensou: a modal pode abrir", () => {
    assert.equal(dispensaAtiva(null, AGORA), false);
  });

  it("dispensou agora: não abre", () => {
    assert.equal(dispensaAtiva(String(AGORA), AGORA), true);
  });

  it("dispensou há 29 dias: ainda não abre", () => {
    const vinteENove = AGORA - 29 * 24 * 60 * 60 * 1000;
    assert.equal(dispensaAtiva(String(vinteENove), AGORA), true);
  });

  it("dispensou há mais de 30 dias: volta a abrir", () => {
    const expirada = AGORA - POPUP_DISPENSA_MS - 1;
    assert.equal(dispensaAtiva(String(expirada), AGORA), false);
  });

  it("valor corrompido não esconde a modal para sempre", () => {
    for (const lixo of ["", "abc", "NaN", "0", "-1", "{}"]) {
      assert.equal(dispensaAtiva(lixo, AGORA), false, `falhou em ${lixo}`);
    }
  });

  it("timestamp no futuro não prende a modal", () => {
    // Relógio adiantado gravaria uma dispensa que só expira depois da data
    // futura — na prática, para sempre.
    const futuro = AGORA + 10 * 24 * 60 * 60 * 1000;
    assert.equal(dispensaAtiva(String(futuro), AGORA), false);
  });
});

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
});

describe("destino do cadastro pela modal (F078)", () => {
  it("aponta para a aula de abertura do módulo gratuito", () => {
    assert.equal(
      AULA_ABERTURA_HREF,
      "/aulas/fase-1-m01-comece-por-aqui/aula-introducao-builders-club",
    );
  });
});
