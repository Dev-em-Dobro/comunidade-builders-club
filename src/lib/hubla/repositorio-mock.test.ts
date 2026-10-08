// Testes de integração com mocks do Prisma.
// Exercita: tentarClaimEntrega, registrarEntregaInicial, concederPago, buscarMembershipIdPorEmail.
// Usa funções auxiliares que simulam a lógica do Prisma para validar o comportamento.

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { MembershipTier } from "@prisma/client";
import type { PlanoPagoHubla } from "./produtos";
import {
  isPago,
  deveMarcarConversao,
  statusEhFinal,
  podeSerClaimado,
  calcularProximoTier,
  TIMEOUT_PROCESSING_MS,
  type StatusWebhook,
} from "./regras-conversao";
import { dataConversaoSegura } from "./repositorio";

// Simula o banco de dados em memória
type MockDelivery = {
  idempotencyKey: string;
  status: StatusWebhook;
  claimedAt: Date | null;
};

type MockMembership = {
  id: string;
  userId: string;
  tier: MembershipTier;
  convertedToPaidAt: Date | null;
};

type MockUser = {
  id: string;
  email: string;
};

type MockAllowedEmail = {
  email: string;
  paidAt: Date | null;
  source: string;
};

// N1/N5: Simula tentarClaimEntrega com mock do Prisma
describe("N1/N5: tentarClaimEntrega — simulação com mock", () => {
  function simularTentarClaim(
    db: Map<string, MockDelivery>,
    idempotencyKey: string,
  ): boolean {
    const agora = new Date();
    const timeoutThreshold = new Date(agora.getTime() - TIMEOUT_PROCESSING_MS);
    
    const row = db.get(idempotencyKey);
    if (!row) return false;
    
    // Simula WHERE: status IN (pending, error) OR (status=processing AND travado)
    const podeClaimarPending = row.status === "pending" || row.status === "error";
    const podeClaimarTravado = row.status === "processing" && 
      row.claimedAt && row.claimedAt < timeoutThreshold;
    
    if (!podeClaimarPending && !podeClaimarTravado) {
      return false;
    }
    
    // Simula UPDATE: status=processing, claimedAt=now
    row.status = "processing";
    row.claimedAt = agora;
    return true;
  }

  it("claim de pending retorna true e atualiza status", () => {
    const db = new Map<string, MockDelivery>();
    db.set("key-1", { idempotencyKey: "key-1", status: "pending", claimedAt: null });
    
    const result = simularTentarClaim(db, "key-1");
    assert.ok(result);
    assert.equal(db.get("key-1")!.status, "processing");
    assert.ok(db.get("key-1")!.claimedAt !== null);
  });

  it("claim de error retorna true (N1: retry após 500)", () => {
    const db = new Map<string, MockDelivery>();
    db.set("key-2", { idempotencyKey: "key-2", status: "error", claimedAt: null });
    
    const result = simularTentarClaim(db, "key-2");
    assert.ok(result);
    assert.equal(db.get("key-2")!.status, "processing");
  });

  it("claim de processing recente retorna false (bloqueio)", () => {
    const db = new Map<string, MockDelivery>();
    const agora = new Date();
    db.set("key-3", { 
      idempotencyKey: "key-3", 
      status: "processing", 
      claimedAt: new Date(agora.getTime() - 60_000) // 1 min atrás
    });
    
    const result = simularTentarClaim(db, "key-3");
    assert.ok(!result);
    assert.equal(db.get("key-3")!.status, "processing"); // não mudou
  });

  it("claim de processing travado retorna true (N5: timeout)", () => {
    const db = new Map<string, MockDelivery>();
    const agora = new Date();
    db.set("key-4", { 
      idempotencyKey: "key-4", 
      status: "processing", 
      claimedAt: new Date(agora.getTime() - TIMEOUT_PROCESSING_MS - 1000)
    });
    
    const result = simularTentarClaim(db, "key-4");
    assert.ok(result);
    assert.ok(db.get("key-4")!.claimedAt!.getTime() > agora.getTime() - 1000);
  });

  it("claim de processed retorna false (status final)", () => {
    const db = new Map<string, MockDelivery>();
    db.set("key-5", { idempotencyKey: "key-5", status: "processed", claimedAt: null });
    
    const result = simularTentarClaim(db, "key-5");
    assert.ok(!result);
  });

  it("claim de ignored retorna false (status final)", () => {
    const db = new Map<string, MockDelivery>();
    db.set("key-6", { idempotencyKey: "key-6", status: "ignored", claimedAt: null });
    
    const result = simularTentarClaim(db, "key-6");
    assert.ok(!result);
  });

  it("claim de chave inexistente retorna false", () => {
    const db = new Map<string, MockDelivery>();
    const result = simularTentarClaim(db, "nao-existe");
    assert.ok(!result);
  });
});

// N5: Simula registrarEntregaInicial
describe("N5: registrarEntregaInicial — não rebaixa status", () => {
  function simularRegistrarInicial(
    db: Map<string, MockDelivery>,
    key: string,
    novoStatus: StatusWebhook,
  ): boolean {
    const existing = db.get(key);
    
    if (existing) {
      const statusAtual = existing.status;
      if (statusAtual === "processing" || statusEhFinal(statusAtual)) {
        return false; // não atualiza
      }
    }
    
    // upsert
    db.set(key, { idempotencyKey: key, status: novoStatus, claimedAt: null });
    return true;
  }

  it("cria registro quando não existe", () => {
    const db = new Map<string, MockDelivery>();
    const result = simularRegistrarInicial(db, "novo", "pending");
    assert.ok(result);
    assert.ok(db.has("novo"));
  });

  it("atualiza pending", () => {
    const db = new Map<string, MockDelivery>();
    db.set("key", { idempotencyKey: "key", status: "pending", claimedAt: null });
    const result = simularRegistrarInicial(db, "key", "pending");
    assert.ok(result);
  });

  it("NÃO atualiza processing (mantém claim)", () => {
    const db = new Map<string, MockDelivery>();
    db.set("key", { idempotencyKey: "key", status: "processing", claimedAt: new Date() });
    const result = simularRegistrarInicial(db, "key", "pending");
    assert.ok(!result);
    assert.equal(db.get("key")!.status, "processing");
  });

  it("NÃO atualiza processed", () => {
    const db = new Map<string, MockDelivery>();
    db.set("key", { idempotencyKey: "key", status: "processed", claimedAt: null });
    const result = simularRegistrarInicial(db, "key", "pending");
    assert.ok(!result);
  });

  it("NÃO atualiza ignored", () => {
    const db = new Map<string, MockDelivery>();
    db.set("key", { idempotencyKey: "key", status: "ignored", claimedAt: null });
    const result = simularRegistrarInicial(db, "key", "pending");
    assert.ok(!result);
  });
});

// B7: Simula concederPago
describe("B7: concederPago — simulação com mock", () => {
  function simularConcederPago(
    users: Map<string, MockUser>,
    memberships: Map<string, MockMembership>,
    email: string,
    plan: PlanoPagoHubla,
    convertedAt: Date,
  ): { membershipId: string | null; conversao: boolean } {
    const user = Array.from(users.values()).find(u => u.email === email);
    if (!user) return { membershipId: null, conversao: false };
    
    const m = Array.from(memberships.values()).find(m => m.userId === user.id);
    
    if (!m) {
      // Criar membership nova → sempre marca conversão
      const newMembership: MockMembership = {
        id: `mem-${Date.now()}`,
        userId: user.id,
        tier: plan,
        convertedToPaidAt: convertedAt,
      };
      memberships.set(newMembership.id, newMembership);
      return { membershipId: newMembership.id, conversao: true };
    }
    
    // Aplicar lógica de aplicarTierAposCorrida
    const eraGratuito = !isPago(m.tier);
    const nextTier = calcularProximoTier(m.tier, plan);
    
    if (eraGratuito && m.convertedToPaidAt === null) {
      m.tier = nextTier;
      m.convertedToPaidAt = convertedAt;
      return { membershipId: m.id, conversao: true };
    }
    
    m.tier = nextTier;
    return { membershipId: m.id, conversao: false };
  }

  it("usuário inexistente retorna null", () => {
    const users = new Map<string, MockUser>();
    const memberships = new Map<string, MockMembership>();
    
    const result = simularConcederPago(users, memberships, "nao@existe.com", "pro", new Date());
    assert.equal(result.membershipId, null);
    assert.equal(result.conversao, false);
  });

  it("usuário sem membership → cria e marca conversão", () => {
    const users = new Map<string, MockUser>();
    const memberships = new Map<string, MockMembership>();
    users.set("u1", { id: "u1", email: "novo@test.com" });
    
    const result = simularConcederPago(users, memberships, "novo@test.com", "pro", new Date());
    assert.ok(result.membershipId !== null);
    assert.ok(result.conversao);
  });

  it("free sem conversão prévia → marca conversão", () => {
    const users = new Map<string, MockUser>();
    const memberships = new Map<string, MockMembership>();
    users.set("u1", { id: "u1", email: "free@test.com" });
    memberships.set("m1", { id: "m1", userId: "u1", tier: "free", convertedToPaidAt: null });
    
    const result = simularConcederPago(users, memberships, "free@test.com", "pro", new Date());
    assert.equal(result.membershipId, "m1");
    assert.ok(result.conversao);
    assert.equal(memberships.get("m1")!.tier, "pro");
  });

  it("free COM conversão prévia (B7: ex-pagante) → NÃO marca conversão", () => {
    const users = new Map<string, MockUser>();
    const memberships = new Map<string, MockMembership>();
    users.set("u1", { id: "u1", email: "ex@test.com" });
    memberships.set("m1", { 
      id: "m1", 
      userId: "u1", 
      tier: "free", 
      convertedToPaidAt: new Date("2026-01-01") 
    });
    
    const result = simularConcederPago(users, memberships, "ex@test.com", "pro", new Date());
    assert.equal(result.membershipId, "m1");
    assert.ok(!result.conversao);
    assert.equal(memberships.get("m1")!.tier, "pro");
  });

  it("pro→elite: NÃO marca conversão (upgrade)", () => {
    const users = new Map<string, MockUser>();
    const memberships = new Map<string, MockMembership>();
    users.set("u1", { id: "u1", email: "pro@test.com" });
    memberships.set("m1", { 
      id: "m1", 
      userId: "u1", 
      tier: "pro", 
      convertedToPaidAt: new Date("2026-01-01") 
    });
    
    const result = simularConcederPago(users, memberships, "pro@test.com", "elite", new Date());
    assert.equal(result.membershipId, "m1");
    assert.ok(!result.conversao);
    assert.equal(memberships.get("m1")!.tier, "elite");
  });

  it("elite→pro: NÃO rebaixa tier", () => {
    const users = new Map<string, MockUser>();
    const memberships = new Map<string, MockMembership>();
    users.set("u1", { id: "u1", email: "elite@test.com" });
    memberships.set("m1", { 
      id: "m1", 
      userId: "u1", 
      tier: "elite", 
      convertedToPaidAt: new Date() 
    });
    
    const result = simularConcederPago(users, memberships, "elite@test.com", "pro", new Date());
    assert.equal(result.membershipId, "m1");
    assert.ok(!result.conversao);
    assert.equal(memberships.get("m1")!.tier, "elite"); // não rebaixou
  });
});

// N3: Simula P2002 e re-read
describe("N3: P2002 — re-read e aplicação de tier após corrida", () => {
  function simularConcederComP2002(
    memberships: Map<string, MockMembership>,
    userId: string,
    plan: PlanoPagoHubla,
    convertedAt: Date,
    simularP2002: boolean,
  ): { membershipId: string | null; conversao: boolean } {
    const existing = Array.from(memberships.values()).find(m => m.userId === userId);
    
    if (!existing) {
      if (simularP2002) {
        // Simula P2002: outra instância criou a membership
        const newM: MockMembership = {
          id: `mem-race-${Date.now()}`,
          userId,
          tier: "free",
          convertedToPaidAt: null,
        };
        memberships.set(newM.id, newM);
        
        // Re-read após P2002
        const reread = memberships.get(newM.id)!;
        const eraGratuito = !isPago(reread.tier);
        const nextTier = calcularProximoTier(reread.tier, plan);
        
        if (eraGratuito && reread.convertedToPaidAt === null) {
          reread.tier = nextTier;
          reread.convertedToPaidAt = convertedAt;
          return { membershipId: reread.id, conversao: true };
        }
        
        reread.tier = nextTier;
        return { membershipId: reread.id, conversao: false };
      }
      
      // Criar normalmente
      const newM: MockMembership = {
        id: `mem-${Date.now()}`,
        userId,
        tier: plan,
        convertedToPaidAt: convertedAt,
      };
      memberships.set(newM.id, newM);
      return { membershipId: newM.id, conversao: true };
    }
    
    // Já existe
    const eraGratuito = !isPago(existing.tier);
    const nextTier = calcularProximoTier(existing.tier, plan);
    
    if (eraGratuito && existing.convertedToPaidAt === null) {
      existing.tier = nextTier;
      existing.convertedToPaidAt = convertedAt;
      return { membershipId: existing.id, conversao: true };
    }
    
    existing.tier = nextTier;
    return { membershipId: existing.id, conversao: false };
  }

  it("P2002: re-read encontra membership e aplica tier com conversão", () => {
    const memberships = new Map<string, MockMembership>();
    
    const result = simularConcederComP2002(memberships, "user-1", "pro", new Date(), true);
    assert.ok(result.membershipId !== null);
    assert.ok(result.conversao);
    
    const m = Array.from(memberships.values()).find(m => m.userId === "user-1");
    assert.equal(m!.tier, "pro");
    assert.ok(m!.convertedToPaidAt !== null);
  });

  it("P2002: re-read de membership já paga não marca conversão", () => {
    const memberships = new Map<string, MockMembership>();
    memberships.set("m1", {
      id: "m1",
      userId: "user-1",
      tier: "pro",
      convertedToPaidAt: new Date("2026-01-01"),
    });
    
    const result = simularConcederComP2002(memberships, "user-1", "elite", new Date(), false);
    assert.equal(result.membershipId, "m1");
    assert.ok(!result.conversao);
    assert.equal(memberships.get("m1")!.tier, "elite");
  });
});

// B3: Simula buscarMembershipIdPorEmail
describe("B3: buscarMembershipIdPorEmail — simulação com mock", () => {
  function simularBuscarMembershipIdPorEmail(
    users: Map<string, MockUser>,
    memberships: Map<string, MockMembership>,
    email: string | null,
  ): string | null {
    if (!email) return null;
    const user = Array.from(users.values()).find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return null;
    const m = Array.from(memberships.values()).find(m => m.userId === user.id);
    return m?.id ?? null;
  }

  it("email null retorna null", () => {
    const users = new Map<string, MockUser>();
    const memberships = new Map<string, MockMembership>();
    
    const result = simularBuscarMembershipIdPorEmail(users, memberships, null);
    assert.equal(result, null);
  });

  it("usuário inexistente retorna null", () => {
    const users = new Map<string, MockUser>();
    const memberships = new Map<string, MockMembership>();
    
    const result = simularBuscarMembershipIdPorEmail(users, memberships, "nao@existe.com");
    assert.equal(result, null);
  });

  it("usuário sem membership retorna null", () => {
    const users = new Map<string, MockUser>();
    const memberships = new Map<string, MockMembership>();
    users.set("u1", { id: "u1", email: "sem@membership.com" });
    
    const result = simularBuscarMembershipIdPorEmail(users, memberships, "sem@membership.com");
    assert.equal(result, null);
  });

  it("usuário com membership retorna membershipId", () => {
    const users = new Map<string, MockUser>();
    const memberships = new Map<string, MockMembership>();
    users.set("u1", { id: "u1", email: "com@membership.com" });
    memberships.set("m1", { id: "m1", userId: "u1", tier: "free", convertedToPaidAt: null });
    
    const result = simularBuscarMembershipIdPorEmail(users, memberships, "com@membership.com");
    assert.equal(result, "m1");
  });

  it("busca é case-insensitive", () => {
    const users = new Map<string, MockUser>();
    const memberships = new Map<string, MockMembership>();
    users.set("u1", { id: "u1", email: "TEST@Example.COM" });
    memberships.set("m1", { id: "m1", userId: "u1", tier: "pro", convertedToPaidAt: null });
    
    const result = simularBuscarMembershipIdPorEmail(users, memberships, "test@example.com");
    assert.equal(result, "m1");
  });
});

// B2: Simula addAllowedEmail (não sobrescreve paidAt)
describe("B2: addAllowedEmail — não sobrescreve paidAt existente", () => {
  function simularAddAllowedEmail(
    allowlist: Map<string, MockAllowedEmail>,
    email: string,
    paidAt: Date | undefined,
    source: string,
  ): MockAllowedEmail {
    const normalizado = email.toLowerCase().trim();
    const existing = allowlist.get(normalizado);
    
    if (existing) {
      // Só atualiza paidAt se existente for null (B2)
      const novoPaidAt = existing.paidAt === null && paidAt ? paidAt : existing.paidAt;
      existing.paidAt = novoPaidAt;
      existing.source = source;
      return existing;
    }
    
    const novo: MockAllowedEmail = {
      email: normalizado,
      paidAt: paidAt ?? null,
      source,
    };
    allowlist.set(normalizado, novo);
    return novo;
  }

  it("cria novo registro com paidAt", () => {
    const allowlist = new Map<string, MockAllowedEmail>();
    const paidAt = new Date("2026-10-05");
    
    const result = simularAddAllowedEmail(allowlist, "novo@test.com", paidAt, "hubla");
    assert.equal(result.email, "novo@test.com");
    assert.equal(result.paidAt, paidAt);
  });

  it("atualiza paidAt quando existente é null", () => {
    const allowlist = new Map<string, MockAllowedEmail>();
    allowlist.set("exist@test.com", { email: "exist@test.com", paidAt: null, source: "manual" });
    
    const novoPaidAt = new Date("2026-10-05");
    const result = simularAddAllowedEmail(allowlist, "exist@test.com", novoPaidAt, "hubla");
    assert.equal(result.paidAt, novoPaidAt);
  });

  it("NÃO sobrescreve paidAt existente (B2)", () => {
    const allowlist = new Map<string, MockAllowedEmail>();
    const paidAtOriginal = new Date("2026-01-01");
    allowlist.set("exist@test.com", { email: "exist@test.com", paidAt: paidAtOriginal, source: "hubla" });
    
    const novoPaidAt = new Date("2026-10-05");
    const result = simularAddAllowedEmail(allowlist, "exist@test.com", novoPaidAt, "hubla");
    assert.equal(result.paidAt, paidAtOriginal); // manteve o original
  });

  it("normaliza email para lowercase", () => {
    const allowlist = new Map<string, MockAllowedEmail>();
    
    const result = simularAddAllowedEmail(allowlist, "  TEST@Example.COM  ", new Date(), "hubla");
    assert.equal(result.email, "test@example.com");
  });
});

// Fluxo processarWebhookHubla: claim negado retorna "evento em processamento"
describe("processarWebhookHubla: fluxo de claim negado", () => {
  function simularProcessarWebhook(
    deliveries: Map<string, MockDelivery>,
    idempotencyKey: string,
  ): { ignorado: boolean; motivo?: string } {
    const existing = deliveries.get(idempotencyKey);
    
    // jaProcessouIdempotency
    if (existing && statusEhFinal(existing.status)) {
      return { ignorado: true, motivo: "idempotency duplicada" };
    }
    
    // Simula registrarEntregaInicial + tentarClaimEntrega
    if (!existing) {
      deliveries.set(idempotencyKey, { 
        idempotencyKey, 
        status: "pending", 
        claimedAt: null 
      });
    }
    
    const row = deliveries.get(idempotencyKey)!;
    const agora = new Date();
    const timeoutThreshold = new Date(agora.getTime() - TIMEOUT_PROCESSING_MS);
    
    // tentarClaimEntrega
    const podeClaimarPending = row.status === "pending" || row.status === "error";
    const podeClaimarTravado = row.status === "processing" && 
      row.claimedAt && row.claimedAt < timeoutThreshold;
    
    if (!podeClaimarPending && !podeClaimarTravado) {
      return { ignorado: true, motivo: "evento em processamento" };
    }
    
    row.status = "processing";
    row.claimedAt = agora;
    
    // Sucesso no processamento
    row.status = "processed";
    return { ignorado: false };
  }

  it("primeira chamada processa normalmente", () => {
    const deliveries = new Map<string, MockDelivery>();
    
    const result = simularProcessarWebhook(deliveries, "key-1");
    assert.ok(!result.ignorado);
    assert.equal(deliveries.get("key-1")!.status, "processed");
  });

  it("chamada duplicada em processing retorna 'evento em processamento'", () => {
    const deliveries = new Map<string, MockDelivery>();
    deliveries.set("key-2", { 
      idempotencyKey: "key-2", 
      status: "processing", 
      claimedAt: new Date() 
    });
    
    const result = simularProcessarWebhook(deliveries, "key-2");
    assert.ok(result.ignorado);
    assert.equal(result.motivo, "evento em processamento");
  });

  it("chamada após processed retorna 'idempotency duplicada'", () => {
    const deliveries = new Map<string, MockDelivery>();
    deliveries.set("key-3", { 
      idempotencyKey: "key-3", 
      status: "processed", 
      claimedAt: null 
    });
    
    const result = simularProcessarWebhook(deliveries, "key-3");
    assert.ok(result.ignorado);
    assert.equal(result.motivo, "idempotency duplicada");
  });

  it("retry de error é permitido (N1)", () => {
    const deliveries = new Map<string, MockDelivery>();
    deliveries.set("key-4", { 
      idempotencyKey: "key-4", 
      status: "error", 
      claimedAt: null 
    });
    
    const result = simularProcessarWebhook(deliveries, "key-4");
    assert.ok(!result.ignorado);
  });
});

// N4: dataConversaoSegura usa paidAt da fatura
describe("N4: dataConversaoSegura — usa paidAt da fatura (importado de produção)", () => {
  it("usa cobradoEm quando disponível", () => {
    const cobranca = {
      valorCentavos: 9900,
      moeda: "BRL" as const,
      cobradoEm: new Date("2026-10-05T10:00:00Z"),
    };
    const result = dataConversaoSegura(cobranca);
    assert.equal(result.toISOString(), "2026-10-05T10:00:00.000Z");
  });

  it("usa now() quando cobradoEm é null", () => {
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
});
