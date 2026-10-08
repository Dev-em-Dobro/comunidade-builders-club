// Testes de integração para allowlist.ts — testa código REAL com Prisma fake.
// Cobre: B2 (não sobrescreve paidAt existente).

import assert from "node:assert/strict";
import { describe, it, before, beforeEach } from "node:test";

// Banco fake em memória
let allowedEmails: Map<string, {
  email: string;
  paidAt: Date | null;
  source: string;
  note: string | null;
}>;

let users: Map<string, { id: string; email: string }>;
let memberships: Map<string, {
  id: string;
  userId: string;
  tier: string;
  status: string;
}>;

// Argumentos capturados das chamadas ao Prisma
let capturedUpsertArgs: unknown[] = [];

function resetDb() {
  allowedEmails = new Map();
  users = new Map();
  memberships = new Map();
  capturedUpsertArgs = [];
}

// Prisma fake
const fakePrisma = {
  allowedEmail: {
    findUnique: async (args: { where: { email: string }; select?: unknown }) => {
      return allowedEmails.get(args.where.email) ?? null;
    },
    upsert: async (args: { where: { email: string }; create: unknown; update: unknown }) => {
      capturedUpsertArgs.push(args);
      const email = args.where.email;
      const create = args.create as Record<string, unknown>;
      const update = args.update as Record<string, unknown>;
      
      const existing = allowedEmails.get(email);
      if (!existing) {
        const newRow = {
          email,
          paidAt: create.paidAt as Date | null ?? null,
          source: create.source as string,
          note: create.note as string | null,
        };
        allowedEmails.set(email, newRow);
        return newRow;
      }
      
      // Aplica update
      if (update.source) existing.source = update.source as string;
      if (update.note !== undefined) existing.note = update.note as string | null;
      if (update.paidAt !== undefined) existing.paidAt = update.paidAt as Date;
      
      return existing;
    },
  },
  user: {
    findFirst: async (args: { where: { email: { equals: string; mode: string } } }) => {
      const email = args.where.email.equals.toLowerCase();
      return Array.from(users.values()).find(u => u.email.toLowerCase() === email) ?? null;
    },
  },
  membership: {
    findUnique: async (args: { where: { userId: string } }) => {
      return Array.from(memberships.values()).find(m => m.userId === args.where.userId) ?? null;
    },
    update: async (args: { where: { userId: string }; data: unknown }) => {
      const m = Array.from(memberships.values()).find(m => m.userId === args.where.userId);
      if (!m) throw new Error("Not found");
      Object.assign(m, args.data);
      return m;
    },
  },
};

// Injeta Prisma fake ANTES de importar os módulos
(globalThis as unknown as { prisma: unknown }).prisma = fakePrisma;

// Função importada dinamicamente
let addAllowedEmail: (opts: {
  email: string;
  source?: string;
  note?: string | null;
  tier?: "pro" | "elite";
  paidAt?: Date;
}) => Promise<unknown>;

describe("B2: addAllowedEmail — código REAL com Prisma fake", () => {
  before(async () => {
    // Importa o módulo de produção DEPOIS de injetar o fake
    const allowlist = await import("./allowlist.js");
    addAllowedEmail = allowlist.addAllowedEmail;
  });

  beforeEach(() => resetDb());

  it("grava paidAt quando allowedEmail não existe", async () => {
    const paidAt = new Date("2026-10-05T10:00:00Z");
    
    await addAllowedEmail({
      email: "novo@test.com",
      paidAt,
      source: "hubla",
    });
    
    const row = allowedEmails.get("novo@test.com");
    assert.ok(row, "deve criar o registro");
    assert.deepEqual(row.paidAt, paidAt, "deve ter paidAt definido");
  });

  it("grava paidAt quando existente.paidAt é null", async () => {
    allowedEmails.set("exist@test.com", {
      email: "exist@test.com",
      paidAt: null,
      source: "manual",
      note: null,
    });
    
    const novoPaidAt = new Date("2026-10-05T10:00:00Z");
    await addAllowedEmail({
      email: "exist@test.com",
      paidAt: novoPaidAt,
      source: "hubla",
    });
    
    const row = allowedEmails.get("exist@test.com");
    assert.deepEqual(row!.paidAt, novoPaidAt, "deve atualizar paidAt quando era null");
  });

  it("NÃO sobrescreve paidAt existente (B2)", async () => {
    const paidAtOriginal = new Date("2026-01-01T10:00:00Z");
    allowedEmails.set("exist@test.com", {
      email: "exist@test.com",
      paidAt: paidAtOriginal,
      source: "hubla",
      note: null,
    });
    
    const novoPaidAt = new Date("2026-10-05T10:00:00Z");
    capturedUpsertArgs = [];
    await addAllowedEmail({
      email: "exist@test.com",
      paidAt: novoPaidAt,
      source: "hubla",
    });
    
    // Verifica que o update NÃO inclui paidAt
    const upsertCall = capturedUpsertArgs[0] as { update: Record<string, unknown> };
    assert.ok(!("paidAt" in upsertCall.update), "update NÃO deve incluir paidAt quando já existe");
  });

  it("normaliza email para lowercase", async () => {
    await addAllowedEmail({
      email: "  TEST@Example.COM  ",
      source: "hubla",
    });
    
    assert.ok(allowedEmails.has("test@example.com"), "email deve ser normalizado");
  });
});
