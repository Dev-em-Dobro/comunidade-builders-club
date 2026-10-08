// R3 — Teste que falha se a rota parar de passar recebidoEm para processarWebhookHubla.
// Garante que a hora de recebimento do webhook é propagada até a lógica de conversão.

import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { describe, it, before, beforeEach } from "node:test";
import { NextRequest } from "next/server";

type Delivery = {
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
};
type Membership = {
  id: string;
  userId: string;
  tier: string;
  status: string;
  role: string;
  convertedToPaidAt: Date | null;
  [k: string]: unknown;
};
type Allowed = { email: string; source: string; note: string | null; paidAt: Date | null };

let deliveries: Map<string, Delivery>;
let memberships: Map<string, Membership>;
let users: Map<string, { id: string; email: string }>;
let allowed: Map<string, Allowed>;
let seq = 0;
let capturedRecebidoEm: Date | undefined;

function resetDb() {
  deliveries = new Map();
  memberships = new Map();
  users = new Map();
  allowed = new Map();
  capturedRecebidoEm = undefined;
}

const fakePrisma = {
  hublaWebhookDelivery: {
    findUnique: async (args: { where: { idempotencyKey: string } }) =>
      deliveries.get(args.where.idempotencyKey) ?? null,
    updateMany: async (args: {
      where: { idempotencyKey: string; OR?: unknown[]; status?: string };
      data: Partial<Delivery>;
    }) => {
      const row = deliveries.get(args.where.idempotencyKey);
      if (!row) return { count: 0 };
      if (!args.where.OR && args.data.status === "error") {
        return { count: 1 };
      }
      const okOr = args.where.OR ? true : false;
      const okStatus = args.where.status === undefined || row.status === args.where.status;
      if (args.where.OR) {
        const orConds = args.where.OR as Array<{ status?: { in?: string[] }; claimedAt?: { lt?: Date } }>;
        for (const c of orConds) {
          if (c.status?.in?.includes(row.status)) {
            Object.assign(row, args.data);
            return { count: 1 };
          }
          if (row.status === "processing" && c.claimedAt?.lt && row.claimedAt && row.claimedAt < c.claimedAt.lt) {
            Object.assign(row, args.data);
            return { count: 1 };
          }
        }
      }
      if (!okOr || !okStatus) return { count: 0 };
      Object.assign(row, args.data);
      return { count: 1 };
    },
    upsert: async (args: {
      where: { idempotencyKey: string };
      create: Omit<Delivery, "claimedAt">;
      update: Partial<Delivery>;
    }) => {
      const existing = deliveries.get(args.where.idempotencyKey);
      if (existing) {
        Object.assign(existing, args.update);
        return existing;
      }
      const row: Delivery = { ...args.create, claimedAt: null };
      deliveries.set(args.where.idempotencyKey, row);
      return row;
    },
    update: async (args: { where: { idempotencyKey: string }; data: Partial<Delivery> }) => {
      const row = deliveries.get(args.where.idempotencyKey);
      if (!row) throw new Error("Not found");
      Object.assign(row, args.data);
      return row;
    },
  },
  membership: {
    findUnique: async (args: { where: { userId: string } }) =>
      [...memberships.values()].find((m) => m.userId === args.where.userId) ?? null,
    create: async (args: { data: Membership }) => {
      const m = { ...args.data, id: `mem-${++seq}` };
      memberships.set(m.id, m);
      return m;
    },
    update: async (args: { where: { userId: string }; data: Partial<Membership> }) => {
      const m = [...memberships.values()].find((x) => x.userId === args.where.userId);
      if (!m) throw new Error("Not found");
      Object.assign(m, args.data);
      return m;
    },
    updateMany: async (args: {
      where: { userId: string; convertedToPaidAt?: null };
      data: Partial<Membership>;
    }) => {
      const m = [...memberships.values()].find((x) => x.userId === args.where.userId);
      if (!m) return { count: 0 };
      if (args.where.convertedToPaidAt === null && m.convertedToPaidAt !== null) return { count: 0 };
      Object.assign(m, args.data);
      return { count: 1 };
    },
  },
  user: {
    findFirst: async (args: { where: { email: { equals: string } } }) => {
      const e = args.where.email.equals.toLowerCase();
      return [...users.values()].find((u) => u.email.toLowerCase() === e) ?? null;
    },
  },
  allowedEmail: {
    findUnique: async (args: { where: { email: string } }) => allowed.get(args.where.email) ?? null,
    upsert: async (args: {
      where: { email: string };
      create: Allowed;
      update: Partial<Allowed>;
    }) => {
      const existing = allowed.get(args.where.email);
      if (existing) {
        Object.assign(existing, args.update);
        return existing;
      }
      const row = { ...args.create };
      allowed.set(args.where.email, row);
      capturedRecebidoEm = row.paidAt ?? undefined;
      return row;
    },
    delete: async (args: { where: { email: string } }) => {
      const row = allowed.get(args.where.email);
      if (!row) throw new Error("Not found");
      allowed.delete(args.where.email);
      return row;
    },
  },
};

(globalThis as unknown as { prisma: unknown }).prisma = fakePrisma;

type Route = typeof import("../../app/api/webhooks/hubla/route");
let route: Route;

const PRODUTO = "prod-builders";
const OFERTA_PRO = "offer-pro";
const TOKEN_TESTE = "token-ficticio-de-teste";
const ASSINATURA_ANTIGA = "2025-01-10T00:00:00.000Z";

function payloadFatura(email: string) {
  return {
    type: "invoice.payment_succeeded",
    version: "2.0.0",
    event: {
      product: { id: PRODUTO, offers: [{ id: OFERTA_PRO }] },
      user: { id: "hubla-user-1", email },
      subscription: { id: "sub-1", status: "active", createdAt: ASSINATURA_ANTIGA },
      invoice: {
        amountInCents: 29700,
        currency: "BRL",
        billingDate: "2025-02-10T00:00:00.000Z",
        createdAt: "2025-02-09T00:00:00.000Z",
      },
    },
  };
}

function usuarioFree(email: string) {
  const userId = `u-${++seq}`;
  users.set(userId, { id: userId, email });
  const id = `m-${seq}`;
  memberships.set(id, {
    id,
    userId,
    tier: "free",
    status: "active",
    role: "member",
    convertedToPaidAt: null,
  });
  return { userId, membershipId: id };
}

function req(body: unknown, headers: Record<string, string>) {
  return new NextRequest("http://localhost/api/webhooks/hubla", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json", ...headers },
  });
}

describe("R3: recebidoEm pass-through", () => {
  before(async () => {
    process.env.HUBLA_WEBHOOK_TOKEN = TOKEN_TESTE;
    process.env.HUBLA_PRODUCT_ID = PRODUTO;
    process.env.HUBLA_OFFER_ID_PRO = OFERTA_PRO;
    route = await import("../../app/api/webhooks/hubla/route.js");
  });

  beforeEach(() => resetDb());

  it("a rota captura recebidoEm e passa para o processamento (paidAt na allowlist)", async () => {
    usuarioFree("passthrough@teste.com");
    const antes = Date.now();

    const res = await route.POST(
      req(payloadFatura("passthrough@teste.com"), {
        "x-hubla-token": TOKEN_TESTE,
        "x-hubla-idempotency": "passthrough-1",
      }),
    );

    const depois = Date.now();
    assert.equal(res.status, 200);

    const row = allowed.get("passthrough@teste.com");
    assert.ok(row, "deve criar allowed_email");
    assert.ok(row.paidAt, "paidAt não pode ser null — recebidoEm deve ser passado");

    const paidAtMs = row.paidAt.getTime();
    assert.ok(
      paidAtMs >= antes && paidAtMs <= depois,
      `paidAt (${row.paidAt.toISOString()}) deve estar entre antes e depois do request — prova que recebidoEm foi passado, não a data da assinatura (${ASSINATURA_ANTIGA})`,
    );
  });

  it("membership.convertedToPaidAt usa recebidoEm (não a data antiga da assinatura)", async () => {
    const { membershipId } = usuarioFree("membership@teste.com");
    const antes = Date.now();

    const res = await route.POST(
      req(payloadFatura("membership@teste.com"), {
        "x-hubla-token": TOKEN_TESTE,
        "x-hubla-idempotency": "membership-1",
      }),
    );

    const depois = Date.now();
    assert.equal(res.status, 200);

    const m = memberships.get(membershipId)!;
    assert.ok(m.convertedToPaidAt, "convertedToPaidAt não pode ser null");

    const convertedMs = m.convertedToPaidAt.getTime();
    assert.ok(
      convertedMs >= antes && convertedMs <= depois,
      `convertedToPaidAt (${m.convertedToPaidAt.toISOString()}) deve ser ~agora, não ${ASSINATURA_ANTIGA}`,
    );
  });

  it("R3: a chamada processarWebhookHubla na rota inclui recebidoEm explicitamente", () => {
    const routePath = path.resolve(__dirname, "../../app/api/webhooks/hubla/route.ts");
    const source = fs.readFileSync(routePath, "utf-8");

    const callPattern = /processarWebhookHubla\s*\(\s*payload\s*,\s*\{[^}]*\}/s;
    const match = source.match(callPattern);
    assert.ok(match, "não encontrou chamada processarWebhookHubla na rota");

    const argsBlock = match[0];
    const lines = argsBlock.split("\n").filter((line) => !line.trim().startsWith("//"));
    const codeOnly = lines.join("\n");
    const hasRecebidoEmKey = /recebidoEm\s*[,}]/.test(codeOnly);
    assert.ok(
      hasRecebidoEmKey,
      "a chamada processarWebhookHubla deve passar recebidoEm como propriedade — remover esse parâmetro faz o webhook usar a hora do processamento em vez da hora de recebimento",
    );
  });
});
