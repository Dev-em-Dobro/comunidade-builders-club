import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { interpretarEventoHubla } from "./interpretar";
import { emailsDoEvento } from "./normalizar";
import type { HublaWebhookPayload } from "./tipos";

const PRODUCT_ID = "prod-club";

function payload(
  type: string,
  extra: NonNullable<HublaWebhookPayload["event"]> = {},
): HublaWebhookPayload {
  return {
    type,
    event: {
      product: { id: PRODUCT_ID },
      user: { email: "user@example.com" },
      ...extra,
    },
  };
}

describe("interpretarEventoHubla — F014 / F059", () => {
  it("invoice.payment_succeeded concede plano", () => {
    const acao = interpretarEventoHubla(payload("invoice.payment_succeeded"));
    assert.equal(acao.acao, "conceder");
    if (acao.acao !== "conceder") return;
    assert.equal(acao.email, "user@example.com");
    assert.deepEqual(acao.emails, ["user@example.com"]);
    assert.equal(acao.plan, "pro");
  });

  it("subscription.activated concede plano", () => {
    const acao = interpretarEventoHubla(payload("subscription.activated"));
    assert.equal(acao.acao, "conceder");
  });

  it("member_added com status completed concede (venda avulsa)", () => {
    const acao = interpretarEventoHubla(
      payload("customer.member_added", {
        subscription: { status: "completed" },
      }),
    );
    assert.equal(acao.acao, "conceder");
  });

  it("member_added sem status de assinatura concede", () => {
    const acao = interpretarEventoHubla(payload("customer.member_added"));
    assert.equal(acao.acao, "conceder");
  });

  it("member_added com assinatura canceled é ignorado", () => {
    const acao = interpretarEventoHubla(
      payload("customer.member_added", {
        subscription: { status: "canceled" },
      }),
    );
    assert.equal(acao.acao, "ignorar");
    if (acao.acao !== "ignorar") return;
    assert.equal(acao.motivo, "subscription não paga");
  });

  it("tipo desconhecido é ignorado", () => {
    const acao = interpretarEventoHubla(payload("invoice.created"));
    assert.equal(acao.acao, "ignorar");
    if (acao.acao !== "ignorar") return;
    assert.equal(acao.motivo, "tipo não tratado: invoice.created");
  });

  it("reúne e-mails do user, pagador da assinatura e da fatura", () => {
    const emails = emailsDoEvento({
      user: { email: "User@Example.com" },
      subscription: { payer: { email: "pagador@hubla.com" } },
      invoice: { payer: { email: "  FATURA@hubla.com  " } },
    });
    assert.deepEqual(emails, [
      "user@example.com",
      "pagador@hubla.com",
      "fatura@hubla.com",
    ]);
  });
});
