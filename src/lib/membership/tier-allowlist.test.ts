import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  mesclarTierPago,
  tierPagoDaNotaAllowlist,
} from "./tier-allowlist";

describe("tierPagoDaNotaAllowlist — F053 hotfix", () => {
  const envAntes = { ...process.env };

  afterEach(() => {
    process.env = { ...envAntes };
  });

  it("default pro sem note", () => {
    assert.equal(tierPagoDaNotaAllowlist(null), "pro");
    assert.equal(tierPagoDaNotaAllowlist(""), "pro");
  });

  it("TMB plan=elite", () => {
    assert.equal(
      tierPagoDaNotaAllowlist(
        "productId=3XB272209KV; plan=elite; pedido=123",
      ),
      "elite",
    );
  });

  it("Hubla offer Elite via env", () => {
    process.env.HUBLA_OFFER_ID_ELITE = "v1SsMcVXNip7Mn5A2pNH";
    process.env.HUBLA_OFFER_ID_PRO = "XaY8QNfZlOO1XBgjzMfY";
    assert.equal(
      tierPagoDaNotaAllowlist(
        "product:VL3e0iDO3A32SyjJWr9S offer:v1SsMcVXNip7Mn5A2pNH",
      ),
      "elite",
    );
  });

  it("Hubla offer PRO via env", () => {
    process.env.HUBLA_OFFER_ID_ELITE = "v1SsMcVXNip7Mn5A2pNH";
    process.env.HUBLA_OFFER_ID_PRO = "XaY8QNfZlOO1XBgjzMfY,6p9QTyJDVj2oAIzHx74E";
    assert.equal(
      tierPagoDaNotaAllowlist(
        "product:VL3e0iDO3A32SyjJWr9S offer:XaY8QNfZlOO1XBgjzMfY",
      ),
      "pro",
    );
  });

  it("TMB productId elite sem plan=", () => {
    process.env.TMB_ELITE_CODES = "3XB272209KV,9DW254247E5";
    assert.equal(
      tierPagoDaNotaAllowlist("productId=9DW254247E5; pedido=99"),
      "elite",
    );
  });
});

describe("mesclarTierPago — F053 hotfix", () => {
  it("não rebaixa elite", () => {
    assert.equal(mesclarTierPago("elite", "pro"), "elite");
  });

  it("sobe pro → elite", () => {
    assert.equal(mesclarTierPago("pro", "elite"), "elite");
  });

  it("mantém pro", () => {
    assert.equal(mesclarTierPago("free", "pro"), "pro");
  });
});
