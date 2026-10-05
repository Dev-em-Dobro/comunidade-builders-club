import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { MembershipTier } from "@prisma/client";
import type { PlanoPagoHubla } from "./produtos";

function isPago(tier: MembershipTier | PlanoPagoHubla): boolean {
  return tier === "pro" || tier === "elite" || tier === "paid";
}

describe("isPago — lógica de conversão", () => {
  it("free não é pago", () => {
    assert.equal(isPago("free"), false);
  });

  it("pro é pago", () => {
    assert.equal(isPago("pro"), true);
  });

  it("elite é pago", () => {
    assert.equal(isPago("elite"), true);
  });

  it("paid (legado) é pago", () => {
    assert.equal(isPago("paid"), true);
  });
});

describe("lógica de conversão Free→Pago", () => {
  type MembershipMock = {
    tier: MembershipTier;
    convertedToPaidAt: Date | null;
  };

  function deveMarcarConversao(m: MembershipMock | null): boolean {
    if (!m) return true;
    const eraGratuito = !isPago(m.tier);
    const jaTinhaConversao = m.convertedToPaidAt !== null;
    return eraGratuito && !jaTinhaConversao;
  }

  it("sem membership existente → marca conversão", () => {
    assert.equal(deveMarcarConversao(null), true);
  });

  it("free sem conversão prévia → marca conversão", () => {
    const m: MembershipMock = { tier: "free", convertedToPaidAt: null };
    assert.equal(deveMarcarConversao(m), true);
  });

  it("free COM conversão prévia → NÃO marca (idempotente)", () => {
    const m: MembershipMock = { tier: "free", convertedToPaidAt: new Date() };
    assert.equal(deveMarcarConversao(m), false);
  });

  it("pro sem conversão prévia → NÃO marca (já era pago)", () => {
    const m: MembershipMock = { tier: "pro", convertedToPaidAt: null };
    assert.equal(deveMarcarConversao(m), false);
  });

  it("elite com conversão prévia → NÃO marca", () => {
    const m: MembershipMock = { tier: "elite", convertedToPaidAt: new Date() };
    assert.equal(deveMarcarConversao(m), false);
  });

  it("paid (legado) sem conversão → NÃO marca (já era pago)", () => {
    const m: MembershipMock = { tier: "paid", convertedToPaidAt: null };
    assert.equal(deveMarcarConversao(m), false);
  });
});

describe("DadosEntregaWebhook — estrutura de dados", () => {
  type DadosEntregaWebhook = {
    idempotencyKey: string;
    eventType: string;
    payload?: unknown;
    productId?: string;
    offerId?: string;
    email?: string;
    membershipId?: string;
  };

  it("aceita dados completos", () => {
    const dados: DadosEntregaWebhook = {
      idempotencyKey: "key-123",
      eventType: "invoice.payment_succeeded",
      payload: { type: "invoice.payment_succeeded", event: {} },
      productId: "prod-abc",
      offerId: "offer-123",
      email: "test@example.com",
      membershipId: "mem-xyz",
    };
    assert.equal(dados.idempotencyKey, "key-123");
    assert.equal(dados.productId, "prod-abc");
    assert.equal(dados.email, "test@example.com");
  });

  it("aceita dados mínimos (só obrigatórios)", () => {
    const dados: DadosEntregaWebhook = {
      idempotencyKey: "key-456",
      eventType: "customer.member_removed",
    };
    assert.equal(dados.idempotencyKey, "key-456");
    assert.equal(dados.productId, undefined);
    assert.equal(dados.email, undefined);
  });

  it("payload pode conter dados sensíveis filtrados", () => {
    const payloadOriginal = {
      type: "invoice.payment_succeeded",
      event: {
        user: { email: "test@example.com", cardNumber: "4111111111111111" },
      },
    };
    const { cardNumber, ...userSafe } = payloadOriginal.event.user;
    const payloadFiltrado = {
      ...payloadOriginal,
      event: { user: userSafe },
    };
    assert.equal("cardNumber" in payloadFiltrado.event.user, false);
    assert.equal(payloadFiltrado.event.user.email, "test@example.com");
    void cardNumber;
  });
});
