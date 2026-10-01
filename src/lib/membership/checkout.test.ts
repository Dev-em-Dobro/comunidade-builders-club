import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ofertaElite } from "./checkout";

describe("ofertaElite", () => {
  it("não oferece boleto na página de planos", () => {
    const elite = ofertaElite();

    assert.equal(elite.pricing.installmentPrice, "R$ 131,79");
    assert.equal(elite.pricing.fullPrice, "R$ 1.297");
    assert.equal(elite.pricing.boletoPrice, undefined);
    assert.equal(elite.boletoCheckouts, undefined);
  });
});
