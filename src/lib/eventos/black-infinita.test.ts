import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { blackAtiva, blackBannerFor } from "./black-infinita";
import { faixaDoTopo } from "./bastidores";

describe("F117 — Black em Dobro no topo", () => {
  it("mostra a Black somente durante a campanha", () => {
    assert.equal(blackAtiva(new Date("2026-10-20T23:59:59-03:00")), false);
    assert.equal(blackAtiva(new Date("2026-10-21T00:00:00-03:00")), true);
    assert.equal(blackAtiva(new Date("2026-11-05T23:59:59-03:00")), true);
    assert.equal(blackAtiva(new Date("2026-11-06T00:00:00-03:00")), false);
    assert.equal(faixaDoTopo({ isElite: true, agora: new Date("2026-10-28T12:00:00-03:00") }), "black");
    assert.equal(faixaDoTopo({ isElite: false, agora: new Date("2026-11-06T00:00:00-03:00") }), "bastidores");
  });

  it("a faixa de aluno reusa a copy da pop-up F121, sem a data 28", () => {
    const aluno = blackBannerFor(true);
    const subtitulo = `${aluno.titulo}. ${aluno.descricao}`;
    const texto = [
      aluno.etiqueta,
      aluno.titulo,
      aluno.descricao,
      aluno.data,
      aluno.cta,
    ].join(" ");

    assert.equal(aluno.data, "");
    assert.doesNotMatch(texto, /28/);
    assert.doesNotMatch(texto, /outubro/i);
    assert.equal(
      subtitulo,
      "A melhor condição da história da Dev em Dobro. Live gratuita 05/11 às 20h.",
    );
    assert.equal(aluno.cta, "Acessar a oferta");
    assert.equal(aluno.href, "https://blackinfinita.devemdobro.com/alunos-dq");
    const popupAlunos = readFileSync("public/black-popup.js", "utf8");
    assert.match(popupAlunos, /https:\/\/blackinfinita\.devemdobro\.com\/alunos-dq/);
    assert.equal(aluno.etiqueta, "BLACK EM DOBRO INFINITA · ALUNOS");

    const banner = readFileSync("src/components/black-infinita-banner.tsx", "utf8");
    assert.match(banner, /campanha\.data \?/);
    assert.doesNotMatch(banner, /28 OUT|28\/10|28 de outubro/);

    assert.equal(blackBannerFor(false).href, "https://blackinfinita.devemdobro.com/");
    assert.equal(blackBannerFor(false).data, "05 NOV · 20H");
    assert.equal(blackBannerFor(false).cta, "Acessar oferta");
    assert.match(blackBannerFor(false).descricao, /05\/11 às 20h/);
  });
});
