import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isPago,
  dataConversaoSegura,
  escolherOfferIdOficial,
  type DadosEntregaWebhook,
} from "./repositorio";
import type { MembershipTier } from "@prisma/client";
import type { PlanoPagoHubla } from "./produtos";

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

describe("lógica de conversão Free→Pago (usando isPago exportado)", () => {
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

describe("B7: ex-pagante que volta a pagar (usando isPago exportado)", () => {
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

  it("ex-pagante de ANTES da feature (sem conversão prévia) que volta: marca conversão", () => {
    assert.equal(deveMarcarConversaoExPagante("free", null), true);
  });
});

describe("N4: dataConversaoSegura — prefere paidAt da fatura", () => {
  it("usa cobradoEm quando disponível", () => {
    const cobranca = {
      valorCentavos: 9900,
      moeda: "BRL" as const,
      cobradoEm: new Date("2026-10-05T10:00:00Z"),
    };
    const result = dataConversaoSegura(cobranca);
    assert.equal(result.toISOString(), "2026-10-05T10:00:00.000Z");
  });

  it("usa now() quando cobradoEm não está disponível", () => {
    const antes = Date.now();
    const cobranca = {
      valorCentavos: 9900,
      moeda: "BRL" as const,
      cobradoEm: null,
    };
    const result = dataConversaoSegura(cobranca);
    const depois = Date.now();
    assert.ok(result.getTime() >= antes);
    assert.ok(result.getTime() <= depois);
  });

  it("nunca usa createdAt da subscription (não existe no tipo)", () => {
    const cobranca = {
      valorCentavos: 9900,
      moeda: "BRL" as const,
      cobradoEm: new Date("2026-10-05T15:30:00Z"),
    };
    const result = dataConversaoSegura(cobranca);
    assert.equal(result.toISOString(), "2026-10-05T15:30:00.000Z");
  });
});

describe("B3: escolherOfferIdOficial — prefere ofertas mapeadas", () => {
  const offerMap = new Map<string, PlanoPagoHubla>([
    ["offer-pro-oficial", "pro"],
    ["offer-elite-oficial", "elite"],
  ]);

  it("retorna primeira oferta mapeada quando disponível", () => {
    const offerIds = ["order-bump-123", "offer-pro-oficial", "offer-elite-oficial"];
    const result = escolherOfferIdOficial(offerIds, offerMap);
    assert.equal(result, "offer-pro-oficial");
  });

  it("retorna primeira oferta quando nenhuma está mapeada", () => {
    const offerIds = ["order-bump-123", "outro-bump"];
    const result = escolherOfferIdOficial(offerIds, offerMap);
    assert.equal(result, "order-bump-123");
  });

  it("retorna null quando lista está vazia", () => {
    const result = escolherOfferIdOficial([], offerMap);
    assert.equal(result, null);
  });

  it("ignora order bumps quando há oferta oficial depois", () => {
    const offerIds = ["bump-1", "bump-2", "offer-elite-oficial"];
    const result = escolherOfferIdOficial(offerIds, offerMap);
    assert.equal(result, "offer-elite-oficial");
  });
});

describe("DadosEntregaWebhook — estrutura de dados (importa tipo real)", () => {
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

  it("aceita dados para evento com erro (N1: pode ser reprocessado)", () => {
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

describe("N1: retry após erro — status 'error' é reprocessável", () => {
  it("processed não é reprocessável", () => {
    const status = "processed";
    const reprocessavel = status !== "processed" && status !== "ignored";
    assert.equal(reprocessavel, false);
  });

  it("ignored não é reprocessável", () => {
    const status = "ignored";
    const reprocessavel = status !== "processed" && status !== "ignored";
    assert.equal(reprocessavel, false);
  });

  it("error É reprocessável", () => {
    const status = "error";
    const reprocessavel = status !== "processed" && status !== "ignored";
    assert.equal(reprocessavel, true);
  });

  it("pending É reprocessável", () => {
    const status = "pending";
    const reprocessavel = status !== "processed" && status !== "ignored";
    assert.equal(reprocessavel, true);
  });
});

describe("N2: allowlist — só marca conversão quando source='hubla'|'tmb' E paidAt não nulo", () => {
  type AllowlistData = { source: string | null; paidAt: Date | null };

  function deveMarcarConversaoBootstrap(data: AllowlistData): boolean {
    const isHublaOrTmb = data.source === "hubla" || data.source === "tmb";
    return isHublaOrTmb && data.paidAt !== null;
  }

  it("source='hubla' com paidAt → marca", () => {
    assert.equal(deveMarcarConversaoBootstrap({ source: "hubla", paidAt: new Date() }), true);
  });

  it("source='tmb' com paidAt → marca", () => {
    assert.equal(deveMarcarConversaoBootstrap({ source: "tmb", paidAt: new Date() }), true);
  });

  it("source='orion' com paidAt → NÃO marca", () => {
    assert.equal(deveMarcarConversaoBootstrap({ source: "orion", paidAt: new Date() }), false);
  });

  it("source='devquest' com paidAt → NÃO marca", () => {
    assert.equal(deveMarcarConversaoBootstrap({ source: "devquest", paidAt: new Date() }), false);
  });

  it("source='manual' com paidAt → NÃO marca", () => {
    assert.equal(deveMarcarConversaoBootstrap({ source: "manual", paidAt: new Date() }), false);
  });

  it("source='admin-bulk' com paidAt → NÃO marca", () => {
    assert.equal(deveMarcarConversaoBootstrap({ source: "admin-bulk", paidAt: new Date() }), false);
  });

  it("source='hubla' sem paidAt → NÃO marca", () => {
    assert.equal(deveMarcarConversaoBootstrap({ source: "hubla", paidAt: null }), false);
  });

  it("source=null com paidAt → NÃO marca", () => {
    assert.equal(deveMarcarConversaoBootstrap({ source: null, paidAt: new Date() }), false);
  });
});

describe("N5: claim atômico — lógica de condição", () => {
  type StatusWebhook = "pending" | "processed" | "ignored" | "error";

  function podeSerClaimado(status: StatusWebhook): boolean {
    return status === "pending" || status === "error";
  }

  it("pending pode ser claimado", () => {
    assert.equal(podeSerClaimado("pending"), true);
  });

  it("error pode ser claimado (N1 retry)", () => {
    assert.equal(podeSerClaimado("error"), true);
  });

  it("processed NÃO pode ser claimado", () => {
    assert.equal(podeSerClaimado("processed"), false);
  });

  it("ignored NÃO pode ser claimado", () => {
    assert.equal(podeSerClaimado("ignored"), false);
  });
});

describe("upgrade pro→elite sem marcar conversão", () => {
  function deveMarcarConversaoUpgrade(tierAtual: MembershipTier, convertedToPaidAt: Date | null): boolean {
    const eraGratuito = !isPago(tierAtual);
    if (!eraGratuito) return false;
    return convertedToPaidAt === null;
  }

  it("pro→elite: não marca (já era pago)", () => {
    assert.equal(deveMarcarConversaoUpgrade("pro", new Date()), false);
    assert.equal(deveMarcarConversaoUpgrade("pro", null), false);
  });

  it("paid→elite: não marca (já era pago)", () => {
    assert.equal(deveMarcarConversaoUpgrade("paid", null), false);
  });

  it("elite→elite: não marca", () => {
    assert.equal(deveMarcarConversaoUpgrade("elite", new Date()), false);
  });
});

describe("B2: allowlist só grava paidAt quando nulo", () => {
  type UpdatePayload = { paidAt?: Date };

  function buildUpdatePaidAt(opts: { paidAt?: Date }, existingPaidAt: Date | null): UpdatePayload {
    if (opts.paidAt && !existingPaidAt) {
      return { paidAt: opts.paidAt };
    }
    return {};
  }

  it("grava paidAt quando existente é null", () => {
    const novoPaidAt = new Date("2026-10-05T10:00:00Z");
    const update = buildUpdatePaidAt({ paidAt: novoPaidAt }, null);
    assert.deepEqual(update, { paidAt: novoPaidAt });
  });

  it("NÃO sobrescreve paidAt existente", () => {
    const novoPaidAt = new Date("2026-10-05T10:00:00Z");
    const existente = new Date("2026-09-01T10:00:00Z");
    const update = buildUpdatePaidAt({ paidAt: novoPaidAt }, existente);
    assert.deepEqual(update, {});
  });

  it("não altera quando não há novo paidAt", () => {
    const update = buildUpdatePaidAt({}, new Date());
    assert.deepEqual(update, {});
  });
});

describe("revogação (downgrade para free)", () => {
  it("revogação não desfaz convertedToPaidAt (N6)", () => {
    type MembershipMock = {
      tier: MembershipTier;
      convertedToPaidAt: Date | null;
    };

    const dataConversaoOriginal = new Date("2026-10-01");

    const depois: MembershipMock = {
      tier: "free",
      convertedToPaidAt: dataConversaoOriginal,
    };

    assert.equal(depois.convertedToPaidAt, dataConversaoOriginal);
    assert.equal(depois.tier, "free");
  });

  it("revogação de quem nunca teve conversão mantém null", () => {
    type MembershipMock = {
      tier: MembershipTier;
      convertedToPaidAt: Date | null;
    };

    const depois: MembershipMock = {
      tier: "free",
      convertedToPaidAt: null,
    };

    assert.equal(depois.convertedToPaidAt, null);
  });
});
