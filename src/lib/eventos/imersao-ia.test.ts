import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { IMERSAO_IA, imersaoAtiva, imersaoFechaEm, imersaoHref } from "./imersao-ia";

describe("imersaoAtiva — prazo da faixa (F077)", () => {
  it("está ativa dias antes da primeira noite", () => {
    assert.equal(imersaoAtiva(new Date("2026-09-02T10:00:00-03:00")), true);
  });

  it("está ativa até uma hora e um minuto antes da primeira noite", () => {
    assert.equal(imersaoAtiva(new Date("2026-09-22T18:29:00-03:00")), true);
  });

  it("fecha exatamente uma hora antes da primeira noite", () => {
    assert.equal(imersaoAtiva(new Date("2026-09-22T18:30:00-03:00")), false);
  });

  it("não volta no intervalo entre as duas noites", () => {
    // Regra de 24/09/2026: quem compra no dia 23 já perdeu a primeira aula.
    assert.equal(imersaoAtiva(new Date("2026-09-23T12:00:00-03:00")), false);
  });

  it("respeita o fuso do Brasil, não o UTC do servidor", () => {
    // 22/09 18h em Brasília é 22/09 21h em UTC. Sem o -03:00 no literal, a
    // faixa fecharia três horas cedo demais.
    assert.equal(imersaoAtiva(new Date("2026-09-22T21:00:00Z")), true);
  });

  it("o fechamento é derivado do início, não escrito à mão", () => {
    assert.equal(
      imersaoFechaEm().getTime(),
      IMERSAO_IA.comecaEm.getTime() - 60 * 60 * 1000,
    );
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

  it("F088 — banner do Club usa utm_medium=club-banner", () => {
    const p = new URL(imersaoHref(null, { medium: "club-banner" })).searchParams;
    assert.equal(p.get("utm_source"), "builders-club");
    assert.equal(p.get("utm_medium"), "club-banner");
    assert.equal(p.get("utm_campaign"), "imersao-ia");
    assert.equal(p.has("utm_content"), false);
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
