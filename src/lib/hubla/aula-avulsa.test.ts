import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { interpretarAulaAvulsa } from "./aula-avulsa";
import type { HublaWebhookPayload } from "./tipos";

function payload(
  type: string,
  extra: NonNullable<HublaWebhookPayload["event"]> = {},
): HublaWebhookPayload {
  return {
    type,
    event: {
      product: { id: "prod-aula" },
      user: { email: " Comprador@Example.com " },
      ...extra,
    },
  };
}

describe("interpretarAulaAvulsa — F126", () => {
  it("pagamento libera com e-mail normalizado", () => {
    assert.deepEqual(interpretarAulaAvulsa(payload("invoice.payment_succeeded")), {
      acao: "liberar",
      emails: ["comprador@example.com"],
    });
  });

  it("reembolso retira", () => {
    const acao = interpretarAulaAvulsa(payload("invoice.refunded"));
    assert.equal(acao.acao, "retirar");
  });

  it("assinatura bloqueada não libera", () => {
    const acao = interpretarAulaAvulsa(
      payload("subscription.activated", { subscription: { status: "past_due" } }),
    );
    assert.equal(acao.acao, "ignorar");
  });

  it("sem e-mail ignora", () => {
    const acao = interpretarAulaAvulsa({
      type: "invoice.payment_succeeded",
      event: { product: { id: "prod-aula" } },
    });
    assert.equal(acao.acao, "ignorar");
  });
});
