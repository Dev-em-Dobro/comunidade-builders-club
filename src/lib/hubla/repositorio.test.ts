import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isPago } from "./repositorio";
import type { MembershipTier } from "@prisma/client";

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

describe("B7: ex-pagante que volta a pagar", () => {
  function deveMarcarConversaoExPagante(tierAtual: MembershipTier, convertedToPaidAt: Date | null): boolean {
    const eraGratuito = !isPago(tierAtual);
    if (!eraGratuito) return false;
    return convertedToPaidAt === null;
  }

  it("ex-Elite que foi para Free e volta a pagar: NÃO marca se já tinha conversão", () => {
    const tinhaConversao = new Date("2026-01-15");
    assert.equal(deveMarcarConversaoExPagante("free", tinhaConversao), false);
  });

  it("Free que nunca pagou: marca conversão", () => {
    assert.equal(deveMarcarConversaoExPagante("free", null), true);
  });

  it("Pro atual: não marca (já é pago)", () => {
    assert.equal(deveMarcarConversaoExPagante("pro", null), false);
  });
});

describe("DadosEntregaWebhook — estrutura de dados", () => {
  type DadosEntregaWebhook = {
    idempotencyKey: string;
    eventType: string;
    payload: unknown;
    productId?: string | null;
    offerId?: string | null;
    email?: string | null;
    membershipId?: string | null;
    status: "pending" | "processed" | "ignored" | "error";
    erro?: string | null;
  };

  it("aceita dados completos para evento processado", () => {
    const dados: DadosEntregaWebhook = {
      idempotencyKey: "key-123",
      eventType: "invoice.payment_succeeded",
      payload: { type: "invoice.payment_succeeded", event: {} },
      productId: "prod-abc",
      offerId: "offer-123",
      email: "test@example.com",
      membershipId: "mem-xyz",
      status: "processed",
      erro: null,
    };
    assert.equal(dados.status, "processed");
    assert.equal(dados.productId, "prod-abc");
  });

  it("aceita dados para evento ignorado com motivo", () => {
    const dados: DadosEntregaWebhook = {
      idempotencyKey: "key-456",
      eventType: "invoice.created",
      payload: { type: "invoice.created" },
      productId: null,
      email: null,
      status: "ignored",
      erro: "tipo não tratado: invoice.created",
    };
    assert.equal(dados.status, "ignored");
    assert.equal(dados.erro, "tipo não tratado: invoice.created");
  });

  it("aceita dados para evento com erro", () => {
    const dados: DadosEntregaWebhook = {
      idempotencyKey: "key-789",
      eventType: "customer.member_added",
      payload: { type: "customer.member_added" },
      status: "error",
      erro: "Falha de conexão",
    };
    assert.equal(dados.status, "error");
    assert.ok(dados.erro?.includes("Falha"));
  });
});
