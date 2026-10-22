import assert from "node:assert/strict";
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

  it("direciona alunos pagos ao grupo e não alunos à live", () => {
    assert.equal(blackBannerFor(true).href, "https://sndflw.com/i/sBjl9OjmppA8znba2jc3");
    assert.match(blackBannerFor(true).descricao, /28\/10/);
    assert.equal(blackBannerFor(false).href, "https://blackinfinita.devemdobro.com/");
    assert.match(blackBannerFor(false).descricao, /05\/11 às 20h/);
  });
});
