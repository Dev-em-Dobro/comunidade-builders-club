// Testes de integração para repositorio.ts — testa código REAL com Prisma fake.
// Cobre: N1/N5 (claim/retry), N3 (P2002), B3 (membershipId), B7 (ex-pagante).

import assert from "node:assert/strict";
import { describe, it, before, beforeEach } from "node:test";

// Banco fake em memória
let deliveries: Map<string, {
  idempotencyKey: string;
  status: string;
  claimedAt: Date | null;
  email: string | null;
  membershipId: string | null;
  eventType: string;
  payload: unknown;
  productId: string | null;
  offerId: string | null;
  erro: string | null;
}>;

let memberships: Map<string, {
  id: string;
  oderId: string;
  tier: string;
  status: string;
  convertedToPaidAt: Date | null;
  role: string;
}>;

let users: Map<string, { id: string; email: string }>;

// Argumentos capturados das chamadas ao Prisma
let capturedUpdateManyArgs: unknown[] = [];
let capturedUpsertArgs: unknown[] = [];

// Flags para simular erros
let shouldThrowP2002 = false;

function resetDb() {
  deliveries = new Map();
  memberships = new Map();
  users = new Map();
  capturedUpdateManyArgs = [];
  capturedUpsertArgs = [];
  shouldThrowP2002 = false;
}

// Prisma fake
const fakePrisma = {
  hublaWebhookDelivery: {
    findUnique: async (args: { where: { idempotencyKey: string }; select?: unknown }) => {
      const row = deliveries.get(args.where.idempotencyKey);
      if (!row) return null;
      return row;
    },
    updateMany: async (args: { where: unknown; data: unknown }) => {
      capturedUpdateManyArgs.push(args);
      const where = args.where as { idempotencyKey: string; OR?: unknown[] };
      const data = args.data as { status: string; claimedAt: Date };
      const row = deliveries.get(where.idempotencyKey);
      if (!row) return { count: 0 };
      
      // Simula lógica do WHERE
      const orConditions = where.OR as Array<{ status?: { in?: string[] }; claimedAt?: { lt?: Date } }> | undefined;
      if (!orConditions) return { count: 0 };
      
      let matches = false;
      for (const cond of orConditions) {
        if (cond.status?.in?.includes(row.status)) {
          matches = true;
          break;
        }
        if (row.status === "processing" && cond.claimedAt?.lt && row.claimedAt && row.claimedAt < cond.claimedAt.lt) {
          matches = true;
          break;
        }
      }
      
      if (matches) {
        row.status = data.status;
        row.claimedAt = data.claimedAt;
        return { count: 1 };
      }
      return { count: 0 };
    },
    upsert: async (args: { where: { idempotencyKey: string }; create: unknown; update: unknown }) => {
      capturedUpsertArgs.push(args);
      const create = args.create as Record<string, unknown>;
      const existing = deliveries.get(args.where.idempotencyKey);
      if (!existing) {
        const newRow = {
          idempotencyKey: args.where.idempotencyKey,
          status: create.status as string,
          claimedAt: null,
          email: create.email as string | null,
          membershipId: create.membershipId as string | null,
          eventType: create.eventType as string,
          payload: create.payload,
          productId: create.productId as string | null,
          offerId: create.offerId as string | null,
          erro: create.erro as string | null,
        };
        deliveries.set(args.where.idempotencyKey, newRow);
        return newRow;
      }
      return existing;
    },
    update: async (args: { where: { idempotencyKey: string }; data: unknown }) => {
      const row = deliveries.get(args.where.idempotencyKey);
      if (!row) throw new Error("Not found");
      Object.assign(row, args.data);
      return row;
    },
  },
  membership: {
    findUnique: async (args: { where: { userId: string }; select?: unknown }) => {
      return Array.from(memberships.values()).find(m => m.oderId === args.where.userId) ?? null;
    },
    create: async (args: { data: Record<string, unknown> }) => {
      if (shouldThrowP2002) {
        shouldThrowP2002 = false;
        const e = new Error("Unique constraint") as Error & { code: string };
        e.code = "P2002";
        throw e;
      }
      const id = `mem-${Date.now()}`;
      const m = {
        id,
        oderId: args.data.userId as string,
        tier: args.data.tier as string,
        status: args.data.status as string,
        convertedToPaidAt: args.data.convertedToPaidAt as Date | null ?? null,
        role: args.data.role as string,
      };
      memberships.set(id, m);
      return m;
    },
    update: async (args: { where: { userId: string }; data: unknown }) => {
      const m = Array.from(memberships.values()).find(m => m.oderId === args.where.userId);
      if (!m) throw new Error("Not found");
      Object.assign(m, args.data);
      return m;
    },
    updateMany: async (args: { where: { userId: string; convertedToPaidAt?: unknown }; data: unknown }) => {
      capturedUpdateManyArgs.push(args);
      const m = Array.from(memberships.values()).find(m => m.oderId === args.where.userId);
      if (!m) return { count: 0 };
      
      // B7: verifica se WHERE inclui convertedToPaidAt: null
      if (args.where.convertedToPaidAt === null && m.convertedToPaidAt !== null) {
        return { count: 0 };
      }
      
      Object.assign(m, args.data);
      return { count: 1 };
    },
  },
  user: {
    findFirst: async (args: { where: { email: { equals: string; mode: string } } }) => {
      const email = args.where.email.equals.toLowerCase();
      return Array.from(users.values()).find(u => u.email.toLowerCase() === email) ?? null;
    },
  },
  allowedEmail: {
    findUnique: async () => null,
    upsert: async (args: { where: { email: string }; create: unknown; update: unknown }) => {
      return { email: args.where.email, paidAt: null };
    },
  },
};

// Injeta Prisma fake ANTES de importar os módulos
(globalThis as unknown as { prisma: unknown }).prisma = fakePrisma;

// Funções importadas dinamicamente
let tentarClaimEntrega: (key: string) => Promise<boolean>;
let registrarEntregaInicial: (dados: {
  idempotencyKey: string;
  eventType: string;
  payload: unknown;
  status: "pending" | "processing" | "processed" | "ignored" | "error";
  erro: string | null;
  productId?: string | null;
  offerId?: string | null;
  email?: string | null;
  membershipId?: string | null;
}) => Promise<void>;
let concederPago: (
  emails: string[],
  plan: "pro" | "elite",
  cobranca: { valorCentavos: number | null; moeda: string; cobradoEm: Date | null; pagoEm: Date | null },
) => Promise<{ membershipId: string | null; conversao: boolean }>;
let buscarMembershipIdPorEmail: (email: string | null) => Promise<string | null>;
let TIMEOUT_PROCESSING_MS: number;

describe("Testes de repositorio.ts com Prisma fake", () => {
  before(async () => {
    // Importa os módulos de produção DEPOIS de injetar o fake
    const repo = await import("./repositorio.js");
    const regras = await import("./regras-conversao.js");
    
    tentarClaimEntrega = repo.tentarClaimEntrega;
    registrarEntregaInicial = repo.registrarEntregaInicial;
    concederPago = repo.concederPago;
    buscarMembershipIdPorEmail = repo.buscarMembershipIdPorEmail;
    TIMEOUT_PROCESSING_MS = regras.TIMEOUT_PROCESSING_MS;
  });

  describe("N1/N5: tentarClaimEntrega — código REAL", () => {
    beforeEach(() => resetDb());

    it("claim de pending retorna true", async () => {
      deliveries.set("key-1", {
        idempotencyKey: "key-1",
        status: "pending",
        claimedAt: null,
        email: null,
        membershipId: null,
        eventType: "test",
        payload: {},
        productId: null,
        offerId: null,
        erro: null,
      });
      
      const result = await tentarClaimEntrega("key-1");
      assert.equal(result, true);
      assert.equal(deliveries.get("key-1")!.status, "processing");
    });

    it("claim de error retorna true (N1: retry após 500)", async () => {
      deliveries.set("key-2", {
        idempotencyKey: "key-2",
        status: "error",
        claimedAt: null,
        email: null,
        membershipId: null,
        eventType: "test",
        payload: {},
        productId: null,
        offerId: null,
        erro: "erro anterior",
      });
      
      const result = await tentarClaimEntrega("key-2");
      assert.equal(result, true);
      assert.equal(deliveries.get("key-2")!.status, "processing");
    });

    it("claim de processing recente retorna false", async () => {
      const agora = new Date();
      deliveries.set("key-3", {
        idempotencyKey: "key-3",
        status: "processing",
        claimedAt: new Date(agora.getTime() - 60_000), // 1 min atrás
        email: null,
        membershipId: null,
        eventType: "test",
        payload: {},
        productId: null,
        offerId: null,
        erro: null,
      });
      
      const result = await tentarClaimEntrega("key-3");
      assert.equal(result, false);
    });

    it("claim de processing travado retorna true (N5: timeout)", async () => {
      const agora = new Date();
      deliveries.set("key-4", {
        idempotencyKey: "key-4",
        status: "processing",
        claimedAt: new Date(agora.getTime() - TIMEOUT_PROCESSING_MS - 1000),
        email: null,
        membershipId: null,
        eventType: "test",
        payload: {},
        productId: null,
        offerId: null,
        erro: null,
      });
      
      const result = await tentarClaimEntrega("key-4");
      assert.equal(result, true);
    });

    it("claim de processed retorna false", async () => {
      deliveries.set("key-5", {
        idempotencyKey: "key-5",
        status: "processed",
        claimedAt: null,
        email: null,
        membershipId: null,
        eventType: "test",
        payload: {},
        productId: null,
        offerId: null,
        erro: null,
      });
      
      const result = await tentarClaimEntrega("key-5");
      assert.equal(result, false);
    });

    it("WHERE do updateMany inclui error (N1)", async () => {
      deliveries.set("key-6", {
        idempotencyKey: "key-6",
        status: "error",
        claimedAt: null,
        email: null,
        membershipId: null,
        eventType: "test",
        payload: {},
        productId: null,
        offerId: null,
        erro: null,
      });
      
      capturedUpdateManyArgs = [];
      await tentarClaimEntrega("key-6");
      
      const args = capturedUpdateManyArgs[0] as { where: { OR: Array<{ status?: { in?: string[] } }> } };
      const statusIn = args.where.OR.find(c => c.status?.in)?.status?.in;
      assert.ok(statusIn?.includes("error"), "WHERE deve incluir error");
    });
  });

  describe("N5: registrarEntregaInicial — código REAL", () => {
    beforeEach(() => resetDb());

    it("NÃO chama upsert quando status é processing", async () => {
      deliveries.set("key-1", {
        idempotencyKey: "key-1",
        status: "processing",
        claimedAt: new Date(),
        email: null,
        membershipId: null,
        eventType: "test",
        payload: {},
        productId: null,
        offerId: null,
        erro: null,
      });
      
      capturedUpsertArgs = [];
      await registrarEntregaInicial({
        idempotencyKey: "key-1",
        eventType: "test",
        payload: {},
        status: "pending",
        erro: null,
      });
      
      assert.equal(capturedUpsertArgs.length, 0, "não deve chamar upsert quando processing");
    });

    it("NÃO chama upsert quando status é processed", async () => {
      deliveries.set("key-2", {
        idempotencyKey: "key-2",
        status: "processed",
        claimedAt: null,
        email: null,
        membershipId: null,
        eventType: "test",
        payload: {},
        productId: null,
        offerId: null,
        erro: null,
      });
      
      capturedUpsertArgs = [];
      await registrarEntregaInicial({
        idempotencyKey: "key-2",
        eventType: "test",
        payload: {},
        status: "pending",
        erro: null,
      });
      
      assert.equal(capturedUpsertArgs.length, 0, "não deve chamar upsert quando processed");
    });

    it("NÃO chama upsert quando status é ignored", async () => {
      deliveries.set("key-3", {
        idempotencyKey: "key-3",
        status: "ignored",
        claimedAt: null,
        email: null,
        membershipId: null,
        eventType: "test",
        payload: {},
        productId: null,
        offerId: null,
        erro: null,
      });
      
      capturedUpsertArgs = [];
      await registrarEntregaInicial({
        idempotencyKey: "key-3",
        eventType: "test",
        payload: {},
        status: "pending",
        erro: null,
      });
      
      assert.equal(capturedUpsertArgs.length, 0, "não deve chamar upsert quando ignored");
    });

    it("chama upsert quando status é pending", async () => {
      deliveries.set("key-4", {
        idempotencyKey: "key-4",
        status: "pending",
        claimedAt: null,
        email: null,
        membershipId: null,
        eventType: "test",
        payload: {},
        productId: null,
        offerId: null,
        erro: null,
      });
      
      capturedUpsertArgs = [];
      await registrarEntregaInicial({
        idempotencyKey: "key-4",
        eventType: "test",
        payload: {},
        status: "pending",
        erro: null,
      });
      
      assert.equal(capturedUpsertArgs.length, 1, "deve chamar upsert quando pending");
    });

    it("chama upsert quando registro não existe", async () => {
      capturedUpsertArgs = [];
      await registrarEntregaInicial({
        idempotencyKey: "key-novo",
        eventType: "test",
        payload: {},
        status: "pending",
        erro: null,
      });
      
      assert.equal(capturedUpsertArgs.length, 1, "deve chamar upsert quando não existe");
    });
  });

  describe("B7: concederPago — código REAL", () => {
    beforeEach(() => resetDb());

    it("free sem conversão prévia marca conversão", async () => {
      users.set("u1", { id: "u1", email: "free@test.com" });
      memberships.set("m1", {
        id: "m1",
        oderId: "u1",
        tier: "free",
        status: "active",
        convertedToPaidAt: null,
        role: "member",
      });
      
      const result = await concederPago(
        ["free@test.com"],
        "pro",
        { valorCentavos: 9900, moeda: "BRL", cobradoEm: new Date(), pagoEm: new Date() },
      );
      
      assert.ok(result.conversao, "deve marcar conversão para free sem conversão prévia");
      assert.equal(result.membershipId, "m1");
    });

    it("free COM conversão prévia NÃO marca (B7: ex-pagante)", async () => {
      users.set("u1", { id: "u1", email: "ex@test.com" });
      memberships.set("m1", {
        id: "m1",
        oderId: "u1",
        tier: "free",
        status: "active",
        convertedToPaidAt: new Date("2026-01-01"),
        role: "member",
      });
      
      const result = await concederPago(
        ["ex@test.com"],
        "pro",
        { valorCentavos: 9900, moeda: "BRL", cobradoEm: new Date(), pagoEm: new Date() },
      );
      
      assert.ok(!result.conversao, "NÃO deve marcar conversão para ex-pagante");
      assert.equal(result.membershipId, "m1");
    });

    it("updateMany usa WHERE com convertedToPaidAt: null (B7)", async () => {
      users.set("u1", { id: "u1", email: "test@test.com" });
      memberships.set("m1", {
        id: "m1",
        oderId: "u1",
        tier: "free",
        status: "active",
        convertedToPaidAt: null,
        role: "member",
      });
      
      capturedUpdateManyArgs = [];
      await concederPago(
        ["test@test.com"],
        "pro",
        { valorCentavos: 9900, moeda: "BRL", cobradoEm: new Date(), pagoEm: new Date() },
      );
      
      const membershipUpdateMany = capturedUpdateManyArgs.find(
        (a) => (a as { where: { userId?: string } }).where.userId !== undefined
      ) as { where: { convertedToPaidAt: unknown } } | undefined;
      
      assert.ok(membershipUpdateMany, "deve chamar membership.updateMany");
      assert.equal(membershipUpdateMany.where.convertedToPaidAt, null, "WHERE deve ter convertedToPaidAt: null");
    });

    it("pro→elite retorna conversao: false", async () => {
      users.set("u1", { id: "u1", email: "pro@test.com" });
      memberships.set("m1", {
        id: "m1",
        oderId: "u1",
        tier: "pro",
        status: "active",
        convertedToPaidAt: new Date("2026-01-01"),
        role: "member",
      });
      
      const result = await concederPago(
        ["pro@test.com"],
        "elite",
        { valorCentavos: 19900, moeda: "BRL", cobradoEm: new Date(), pagoEm: new Date() },
      );
      
      assert.ok(!result.conversao, "upgrade não deve marcar conversão");
      assert.equal(result.membershipId, "m1");
    });

    it("N3: P2002 relê e aplica tier", async () => {
      users.set("u1", { id: "u1", email: "p2002@test.com" });
      // Não tem membership inicialmente
      
      // Simula outra instância criando a membership durante a corrida
      shouldThrowP2002 = true;
      memberships.set("m-race", {
        id: "m-race",
        oderId: "u1",
        tier: "free",
        status: "active",
        convertedToPaidAt: null,
        role: "member",
      });
      
      const result = await concederPago(
        ["p2002@test.com"],
        "pro",
        { valorCentavos: 9900, moeda: "BRL", cobradoEm: new Date(), pagoEm: new Date() },
      );
      
      assert.equal(result.membershipId, "m-race");
      assert.ok(result.conversao, "após P2002 deve aplicar tier e marcar conversão");
    });
  });

  describe("B3: buscarMembershipIdPorEmail — código REAL", () => {
    beforeEach(() => resetDb());

    it("retorna null para email null", async () => {
      const result = await buscarMembershipIdPorEmail(null);
      assert.equal(result, null);
    });

    it("retorna null para usuário inexistente", async () => {
      const result = await buscarMembershipIdPorEmail("nao@existe.com");
      assert.equal(result, null);
    });

    it("retorna membershipId para usuário com membership", async () => {
      users.set("u1", { id: "u1", email: "com@membership.com" });
      memberships.set("m1", {
        id: "m1",
        oderId: "u1",
        tier: "pro",
        status: "active",
        convertedToPaidAt: null,
        role: "member",
      });
      
      const result = await buscarMembershipIdPorEmail("com@membership.com");
      assert.equal(result, "m1");
    });
  });
});
