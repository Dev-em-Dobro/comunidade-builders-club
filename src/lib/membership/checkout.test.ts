import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ofertaElite,
  ofertaPro,
  ofertaProMensal,
  PLANOS_VISIVEIS_NA_VITRINE,
  vitrineMostra,
} from "./checkout";

describe("ofertaElite", () => {
  it("não oferece boleto na página de planos", () => {
    const elite = ofertaElite();

    assert.equal(elite.pricing.installmentPrice, "R$ 131,79");
    assert.equal(elite.pricing.fullPrice, "R$ 1.297");
    assert.equal(elite.pricing.boletoPrice, undefined);
    assert.equal(elite.boletoCheckouts, undefined);
  });
});

describe("vitrine de /planos (F114)", () => {
  it("mostra só o Elite — PRO e mensal continuam no checkout, fora da página", () => {
    assert.deepEqual(PLANOS_VISIVEIS_NA_VITRINE, ["elite"]);
    assert.equal(vitrineMostra("elite"), true);
    assert.equal(vitrineMostra("pro"), false);
    assert.equal(vitrineMostra("proMensal"), false);
  });

  it("não apaga as ofertas PRO/mensal — só esconde na vitrine", () => {
    assert.match(ofertaPro().checkoutUrl, /pay\.hub\.la\//);
    assert.match(ofertaProMensal().checkoutUrl, /pay\.hub\.la\//);
    assert.equal(ofertaPro().id, "pro");
    assert.equal(ofertaProMensal().id, "pro");
    assert.equal(ofertaElite().id, "elite");
  });
});
