import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  BLACK_INFINITA_POPUP_COPY,
  BLACK_INFINITA_POPUP_CTA,
  BLACK_INFINITA_POPUP_HREF,
} from "../presentes/black-infinita-popup";
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
    assert.ok(BLACK_INFINITA_POPUP_COPY.toLowerCase().includes(subtitulo.toLowerCase()));
    assert.equal(aluno.cta, BLACK_INFINITA_POPUP_CTA);
    assert.equal(aluno.cta, "Entrar na lista da live");
    assert.equal(aluno.href, BLACK_INFINITA_POPUP_HREF);
    assert.equal(aluno.href, "https://blackinfinita.devemdobro.com/");
    assert.equal(aluno.etiqueta, "BLACK EM DOBRO INFINITA · ALUNOS");

    const banner = readFileSync("src/components/black-infinita-banner.tsx", "utf8");
    assert.match(banner, /campanha\.data \?/);
    assert.doesNotMatch(banner, /28 OUT|28\/10|28 de outubro/);

    assert.equal(blackBannerFor(false).href, "https://blackinfinita.devemdobro.com/");
    assert.equal(blackBannerFor(false).data, "05 NOV · 20H");
    assert.equal(blackBannerFor(false).cta, "Entrar na lista da live");
    assert.match(blackBannerFor(false).descricao, /05\/11 às 20h/);
  });
});
