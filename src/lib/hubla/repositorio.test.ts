import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isPago,
  deveMarcarConversao,
  deveMarcarConversaoBootstrap,
  deveAtualizarPaidAtAllowlist,
  buildUpdatePaidAt,
  statusEhReprocessavel,
  statusEhFinal,
  podeSerClaimado,
  processingEstaTravado,
  calcularProximoTier,
  rankPago,
  TIMEOUT_PROCESSING_MS,
  type StatusWebhook,
} from "./regras-conversao";
import {
  dataConversaoSegura,
  escolherOfferIdOficial,
} from "./repositorio";
import type { MembershipTier } from "@prisma/client";
import type { PlanoPagoHubla } from "./produtos";

describe("isPago — lógica de conversão (B5: importado de regras-conversao)", () => {
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

describe("rankPago — hierarquia de tiers (B5: importado)", () => {
  it("elite > pro > free", () => {
    assert.ok(rankPago("elite") > rankPago("pro"));
    assert.ok(rankPago("pro") > rankPago("free"));
  });

  it("paid == pro (legado)", () => {
    assert.equal(rankPago("paid"), rankPago("pro"));
  });
});

describe("deveMarcarConversao — lógica de conversão Free→Pago (B5: importado)", () => {
  it("sem membership existente → marca conversão", () => {
    assert.equal(deveMarcarConversao(null), true);
  });

  it("free sem conversão prévia → marca conversão", () => {
    const m = { tier: "free" as MembershipTier, convertedToPaidAt: null };
    assert.equal(deveMarcarConversao(m), true);
  });

  it("free COM conversão prévia → NÃO marca (idempotente)", () => {
    const m = { tier: "free" as MembershipTier, convertedToPaidAt: new Date() };
    assert.equal(deveMarcarConversao(m), false);
  });

  it("pro sem conversão prévia → NÃO marca (já era pago)", () => {
    const m = { tier: "pro" as MembershipTier, convertedToPaidAt: null };
    assert.equal(deveMarcarConversao(m), false);
  });

  it("elite com conversão prévia → NÃO marca", () => {
    const m = { tier: "elite" as MembershipTier, convertedToPaidAt: new Date() };
    assert.equal(deveMarcarConversao(m), false);
  });

  it("paid (legado) sem conversão → NÃO marca (já era pago)", () => {
    const m = { tier: "paid" as MembershipTier, convertedToPaidAt: null };
    assert.equal(deveMarcarConversao(m), false);
  });
});

describe("B7: ex-pagante que volta a pagar (usa deveMarcarConversao)", () => {
  it("ex-Elite que foi para Free e volta a pagar: NÃO marca se já tinha conversão", () => {
    const m = { tier: "free" as MembershipTier, convertedToPaidAt: new Date("2026-01-15") };
    assert.equal(deveMarcarConversao(m), false);
  });

  it("Free que nunca pagou: marca conversão", () => {
    const m = { tier: "free" as MembershipTier, convertedToPaidAt: null };
    assert.equal(deveMarcarConversao(m), true);
  });

  it("Pro atual: não marca (já é pago)", () => {
    const m = { tier: "pro" as MembershipTier, convertedToPaidAt: null };
    assert.equal(deveMarcarConversao(m), false);
  });

  it("ex-pagante de ANTES da feature (sem conversão prévia) que volta: marca", () => {
    const m = { tier: "free" as MembershipTier, convertedToPaidAt: null };
    assert.equal(deveMarcarConversao(m), true);
  });
});

describe("N2: deveMarcarConversaoBootstrap — só hubla/tmb com paidAt (B5: importado)", () => {
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

describe("N4: dataConversaoSegura — paidAt da fatura, senão recebimento do webhook", () => {
  const recebidoEm = new Date("2026-10-08T12:34:56.000Z");

  it("usa pagoEm (invoice.paidAt) quando disponível", () => {
    const result = dataConversaoSegura({ pagoEm: new Date("2026-10-05T10:00:00Z") }, recebidoEm);
    assert.equal(result.toISOString(), "2026-10-05T10:00:00.000Z");
  });

  it("sem pagoEm usa a hora de recebimento do webhook", () => {
    const result = dataConversaoSegura({ pagoEm: null }, recebidoEm);
    assert.equal(result.toISOString(), recebidoEm.toISOString());
  });

  it("ignora cobradoEm (billingDate/createdAt) mesmo quando presente", () => {
    const cobranca = {
      valorCentavos: 9900,
      moeda: "BRL",
      cobradoEm: new Date("2025-01-10T00:00:00Z"),
      pagoEm: null,
    };
    const result = dataConversaoSegura(cobranca, recebidoEm);
    assert.equal(result.toISOString(), recebidoEm.toISOString());
  });

  it("sem recebidoEm explícito usa now()", () => {
    const antes = Date.now();
    const result = dataConversaoSegura({ pagoEm: null });
    assert.ok(result.getTime() >= antes && result.getTime() <= Date.now());
  });
});

describe("B3: escolherOfferIdOficial — prefere ofertas mapeadas (B5: importado)", () => {
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

describe("N1: statusEhReprocessavel — error é reprocessável (B5: importado)", () => {
  it("pending é reprocessável", () => {
    assert.equal(statusEhReprocessavel("pending"), true);
  });

  it("error é reprocessável", () => {
    assert.equal(statusEhReprocessavel("error"), true);
  });

  it("processing NÃO é reprocessável (precisa verificar timeout)", () => {
    assert.equal(statusEhReprocessavel("processing"), false);
  });

  it("processed NÃO é reprocessável", () => {
    assert.equal(statusEhReprocessavel("processed"), false);
  });

  it("ignored NÃO é reprocessável", () => {
    assert.equal(statusEhReprocessavel("ignored"), false);
  });
});

describe("N1: statusEhFinal — processed/ignored são finais (B5: importado)", () => {
  it("processed é final", () => {
    assert.equal(statusEhFinal("processed"), true);
  });

  it("ignored é final", () => {
    assert.equal(statusEhFinal("ignored"), true);
  });

  it("pending não é final", () => {
    assert.equal(statusEhFinal("pending"), false);
  });

  it("processing não é final", () => {
    assert.equal(statusEhFinal("processing"), false);
  });

  it("error não é final", () => {
    assert.equal(statusEhFinal("error"), false);
  });
});

describe("N5: processingEstaTravado — timeout de processing (B5: importado)", () => {
  it("sem claimedAt não está travado", () => {
    assert.equal(processingEstaTravado(null), false);
  });

  it("claimedAt recente não está travado", () => {
    const agora = new Date();
    const recente = new Date(agora.getTime() - 60_000); // 1 minuto atrás
    assert.equal(processingEstaTravado(recente, agora), false);
  });

  it("claimedAt > TIMEOUT_PROCESSING_MS está travado", () => {
    const agora = new Date();
    const antigo = new Date(agora.getTime() - TIMEOUT_PROCESSING_MS - 1000);
    assert.equal(processingEstaTravado(antigo, agora), true);
  });

  it("claimedAt exatamente no limite NÃO está travado", () => {
    const agora = new Date();
    const limite = new Date(agora.getTime() - TIMEOUT_PROCESSING_MS);
    assert.equal(processingEstaTravado(limite, agora), false);
  });
});

describe("N5: podeSerClaimado — lógica completa de claim (B5: importado)", () => {
  const agora = new Date();
  const recente = new Date(agora.getTime() - 60_000);
  const antigo = new Date(agora.getTime() - TIMEOUT_PROCESSING_MS - 1000);

  it("pending pode ser claimado", () => {
    assert.equal(podeSerClaimado("pending", null, agora), true);
  });

  it("error pode ser claimado (N1 retry)", () => {
    assert.equal(podeSerClaimado("error", null, agora), true);
  });

  it("processing recente NÃO pode ser claimado", () => {
    assert.equal(podeSerClaimado("processing", recente, agora), false);
  });

  it("processing travado PODE ser claimado", () => {
    assert.equal(podeSerClaimado("processing", antigo, agora), true);
  });

  it("processed NÃO pode ser claimado", () => {
    assert.equal(podeSerClaimado("processed", null, agora), false);
  });

  it("ignored NÃO pode ser claimado", () => {
    assert.equal(podeSerClaimado("ignored", null, agora), false);
  });
});

describe("calcularProximoTier — nunca rebaixa (B5: importado)", () => {
  it("free + pro = pro", () => {
    assert.equal(calcularProximoTier("free", "pro"), "pro");
  });

  it("free + elite = elite", () => {
    assert.equal(calcularProximoTier("free", "elite"), "elite");
  });

  it("pro + elite = elite (upgrade)", () => {
    assert.equal(calcularProximoTier("pro", "elite"), "elite");
  });

  it("elite + pro = elite (não rebaixa)", () => {
    assert.equal(calcularProximoTier("elite", "pro"), "elite");
  });

  it("pro + pro = pro", () => {
    assert.equal(calcularProximoTier("pro", "pro"), "pro");
  });
});

describe("upgrade pro→elite sem marcar conversão (usa deveMarcarConversao)", () => {
  it("pro→elite: não marca (já era pago)", () => {
    const m1 = { tier: "pro" as MembershipTier, convertedToPaidAt: new Date() };
    const m2 = { tier: "pro" as MembershipTier, convertedToPaidAt: null };
    assert.equal(deveMarcarConversao(m1), false);
    assert.equal(deveMarcarConversao(m2), false);
  });

  it("paid→elite: não marca (já era pago)", () => {
    const m = { tier: "paid" as MembershipTier, convertedToPaidAt: null };
    assert.equal(deveMarcarConversao(m), false);
  });

  it("elite→elite: não marca", () => {
    const m = { tier: "elite" as MembershipTier, convertedToPaidAt: new Date() };
    assert.equal(deveMarcarConversao(m), false);
  });
});

describe("B2: buildUpdatePaidAt — só grava quando nulo (B5: importado)", () => {
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

describe("B2: deveAtualizarPaidAtAllowlist — regra pura (B5: importado)", () => {
  it("true quando novoPaidAt definido e existente é null", () => {
    assert.equal(deveAtualizarPaidAtAllowlist(new Date(), null), true);
  });

  it("false quando existente não é null", () => {
    assert.equal(deveAtualizarPaidAtAllowlist(new Date(), new Date()), false);
  });

  it("false quando novoPaidAt é undefined", () => {
    assert.equal(deveAtualizarPaidAtAllowlist(undefined, null), false);
  });
});

describe("N6: revogação — verificação via regras de produção", () => {
  it("após revogação, tier=free mas isPago retorna false", () => {
    assert.equal(isPago("free"), false);
  });

  it("deveMarcarConversao com free + conversão prévia = false (preserva histórico)", () => {
    const membro = {
      tier: "free" as MembershipTier,
      convertedToPaidAt: new Date("2026-10-01"),
    };
    assert.equal(deveMarcarConversao(membro), false);
  });

  it("reativação de ex-pagante não marca nova conversão (B7)", () => {
    const membro = {
      tier: "free" as MembershipTier,
      convertedToPaidAt: new Date("2026-01-01"),
    };
    assert.equal(deveMarcarConversao(membro), false);
  });
});

describe("N5: DadosEntregaWebhook — validação de status com regras de produção", () => {
  it("status processing não é reprocessável (claim ativo)", () => {
    assert.equal(statusEhReprocessavel("processing"), false);
    assert.equal(statusEhFinal("processing"), false);
  });

  it("status error é reprocessável (N1: retry após 500)", () => {
    assert.equal(statusEhReprocessavel("error"), true);
    assert.equal(podeSerClaimado("error", null), true);
  });

  it("status pending é reprocessável", () => {
    assert.equal(statusEhReprocessavel("pending"), true);
    assert.equal(podeSerClaimado("pending", null), true);
  });

  it("status processed/ignored são finais", () => {
    assert.equal(statusEhFinal("processed"), true);
    assert.equal(statusEhFinal("ignored"), true);
    assert.equal(podeSerClaimado("processed", null), false);
    assert.equal(podeSerClaimado("ignored", null), false);
  });
});
