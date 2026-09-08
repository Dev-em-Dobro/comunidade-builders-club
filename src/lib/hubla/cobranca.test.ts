import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { extrairCobrancaHubla, paraCentavos } from "./cobranca";
import type { HublaWebhookPayload } from "./tipos";

describe("paraCentavos — F081", () => {
  it("inteiro permanece centavos", () => {
    assert.equal(paraCentavos(19700), 19700);
  });

  it("decimal vira reais → centavos", () => {
    assert.equal(paraCentavos(197.5), 19750);
  });
});

describe("extrairCobrancaHubla — F081", () => {
  it("lê amountInCents da invoice", () => {
    const payload: HublaWebhookPayload = {
      type: "invoice.payment_succeeded",
      event: {
        invoice: { amountInCents: 29700, currency: "brl", paidAt: "2026-09-08T12:00:00.000Z" },
      },
    };
    const c = extrairCobrancaHubla(payload);
    assert.equal(c.valorCentavos, 29700);
    assert.equal(c.moeda, "BRL");
    assert.equal(c.cobradoEm?.toISOString(), "2026-09-08T12:00:00.000Z");
  });

  it("lê amount inteiro como centavos", () => {
    const payload: HublaWebhookPayload = {
      type: "customer.member_added",
      event: { invoice: { amount: 9700 } },
    };
    assert.equal(extrairCobrancaHubla(payload).valorCentavos, 9700);
    assert.equal(extrairCobrancaHubla(payload).moeda, "BRL");
  });

  it("lê amount decimal como reais", () => {
    const payload: HublaWebhookPayload = {
      type: "invoice.payment_succeeded",
      event: { payment: { amount: 97.9, currencyCode: "BRL" } },
    };
    assert.equal(extrairCobrancaHubla(payload).valorCentavos, 9790);
  });

  it("sem valor → nulls (não inventa)", () => {
    const payload: HublaWebhookPayload = {
      type: "customer.member_removed",
      event: { user: { email: "a@b.com" }, product: { id: "x" } },
    };
    assert.deepEqual(extrairCobrancaHubla(payload), {
      valorCentavos: null,
      moeda: null,
      cobradoEm: null,
    });
  });
});
