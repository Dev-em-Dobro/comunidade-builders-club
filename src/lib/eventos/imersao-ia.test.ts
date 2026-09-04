import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { IMERSAO_IA, imersaoAtiva, imersaoHref } from "./imersao-ia";

describe("imersaoAtiva — prazo da faixa (F077)", () => {
  it("está ativa antes da primeira aula", () => {
    assert.equal(imersaoAtiva(new Date("2026-09-02T10:00:00-03:00")), true);
  });

  it("continua ativa durante a segunda aula", () => {
    assert.equal(imersaoAtiva(new Date("2026-09-23T20:30:00-03:00")), true);
  });

  it("some depois da meia-noite seguinte à segunda aula", () => {
    assert.equal(imersaoAtiva(new Date("2026-09-24T00:01:00-03:00")), false);
  });

  it("respeita o fuso do Brasil, não o UTC do servidor", () => {
    // 23/09 22h em Brasília é 24/09 01h em UTC. Sem o -03:00 no literal, a
    // faixa sumiria com a imersão ainda no ar.
    assert.equal(imersaoAtiva(new Date("2026-09-24T01:00:00Z")), true);
  });

  it("o prazo é meia-noite de 24/09 no horário de Brasília", () => {
    assert.equal(IMERSAO_IA.terminaEm.toISOString(), "2026-09-24T03:00:00.000Z");
  });
});

describe("imersaoHref — link e atribuição (F077)", () => {
  it("aponta para a landing, nunca para o checkout", () => {
    const url = new URL(imersaoHref());
    assert.equal(url.origin + url.pathname, "https://imersao-ia.devemdobro.com/v1");
  });

  it("carrega as três UTMs fixas do Club", () => {
    const p = new URL(imersaoHref()).searchParams;
    assert.equal(p.get("utm_source"), "builders-club");
    assert.equal(p.get("utm_medium"), "presente");
    assert.equal(p.get("utm_campaign"), "imersao-ia");
  });

  it("sem utm_content no path, não inventa um", () => {
    const p = new URL(imersaoHref(null)).searchParams;
    assert.equal(p.has("utm_content"), false);
  });

  it("propaga o utm_content do Presente (F059)", () => {
    const p = new URL(imersaoHref("eu-quero-22-09-2026")).searchParams;
    assert.equal(p.get("utm_content"), "eu-quero-22-09-2026");
  });

  it("recusa utm_content que não passa no saneamento do funil", () => {
    const p = new URL(imersaoHref("um valor com espaço & '")).searchParams;
    assert.equal(p.has("utm_content"), false);
  });
});
