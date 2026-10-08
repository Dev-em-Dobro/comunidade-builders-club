// B5 / N4 / Q1 — processarWebhookHubla (código REAL) com Prisma fake em memória.
// Técnica: injeta o fake em globalThis.prisma (src/lib/db.ts reaproveita) e só
// depois importa os módulos de produção (import dinâmico).
// Cobre: fluxo completo (allowlist + membership + entrega), data de conversão (N4),
// gravação do status final, erro → 'error' + retry, 'em processamento' → 409 (Q1),
// falha ao gravar status final (Q1) e a rota POST (401 / 409).

import assert from "node:assert/strict";
import { before, beforeEach, describe, it } from "node:test";
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
let falhas: {
  allowedUpsert: boolean;
  deliveryUpdate: boolean;
  deliveryLiberar: boolean;
};
let seq = 0;

function resetDb() {
  deliveries = new Map();
  memberships = new Map();
  users = new Map();
  allowed = new Map();
  falhas = { allowedUpsert: false, deliveryUpdate: false, deliveryLiberar: false };
}

type OrCond = { status?: { in?: string[] } | string; claimedAt?: { lt?: Date } };

function casaCond(row: Delivery, cond: OrCond): boolean {
  if (typeof cond.status === "string" && row.status !== cond.status) return false;
  if (typeof cond.status === "object" && cond.status?.in && !cond.status.in.includes(row.status)) {
    return false;
  }
  if (cond.claimedAt?.lt) {
    if (!row.claimedAt || !(row.claimedAt < cond.claimedAt.lt)) return false;
  }
  return true;
}

const fakePrisma = {
  hublaWebhookDelivery: {
    findUnique: async (args: { where: { idempotencyKey: string } }) =>
      deliveries.get(args.where.idempotencyKey) ?? null,
    updateMany: async (args: {
      where: { idempotencyKey: string; OR?: OrCond[]; status?: string };
      data: Partial<Delivery>;
    }) => {
      const row = deliveries.get(args.where.idempotencyKey);
      if (!row) return { count: 0 };
      // liberarEntregaAposFalha: where { status: "processing" } sem OR
      if (!args.where.OR && args.data.status === "error" && falhas.deliveryLiberar) {
        throw new Error("banco fora (liberar)");
      }
      const okOr = args.where.OR ? args.where.OR.some((c) => casaCond(row, c)) : true;
      const okStatus = args.where.status === undefined || row.status === args.where.status;
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
      if (falhas.deliveryUpdate) throw new Error("banco fora (update final)");
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
      if (falhas.allowedUpsert) throw new Error("falha simulada na allowlist");
      const existing = allowed.get(args.where.email);
      if (existing) {
        Object.assign(existing, args.update);
        return existing;
      }
      const row = { ...args.create };
      allowed.set(args.where.email, row);
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
type Repo = typeof import("./repositorio");
type Resposta = typeof import("./resposta");
let route: Route;
let repo: Repo;
let resposta: Resposta;
let TIMEOUT_PROCESSING_MS: number;

const PRODUTO = "prod-builders";
const OFERTA_PRO = "offer-pro";
const productPlanMap = new Map([[PRODUTO, "pro" as const]]);
const offerPlanMap = new Map([[OFERTA_PRO, "pro" as const]]);

const RECEBIDO_EM = new Date("2026-10-08T12:20:28.000Z");
const ASSINATURA_ANTIGA = "2025-01-10T00:00:00.000Z";

function payloadFatura(opts: { email: string; paidAt?: string; productId?: string; offerId?: string }) {
  return {
    type: "invoice.payment_succeeded",
    version: "2.0.0",
    event: {
      product: { id: opts.productId ?? PRODUTO, offers: [{ id: opts.offerId ?? OFERTA_PRO }] },
      user: { id: "hubla-user-1", email: opts.email },
      subscription: { id: "sub-1", status: "active", createdAt: ASSINATURA_ANTIGA },
      invoice: {
        amountInCents: 29700,
        currency: "BRL",
        billingDate: "2025-02-10T00:00:00.000Z",
        createdAt: "2025-02-09T00:00:00.000Z",
        ...(opts.paidAt ? { paidAt: opts.paidAt } : {}),
      },
    },
  };
}

function processar(
  payload: unknown,
  idempotencyKey: string | null,
  recebidoEm: Date | null = RECEBIDO_EM,
) {
  return repo.processarWebhookHubla(payload, {
    productPlanMap,
    offerPlanMap,
    idempotencyKey,
    eventType: (payload as { type: string }).type,
    ...(recebidoEm ? { recebidoEm } : {}),
  });
}

function usuarioFree(email: string, convertedToPaidAt: Date | null = null) {
  const userId = `u-${++seq}`;
  users.set(userId, { id: userId, email });
  const id = `m-${seq}`;
  memberships.set(id, {
    id,
    userId,
    tier: "free",
    status: "active",
    role: "member",
    convertedToPaidAt,
  });
  return { userId, membershipId: id };
}

function silenciarConsoleError<T>(fn: () => Promise<T>): Promise<T> {
  const original = console.error;
  console.error = () => {};
  return fn().finally(() => {
    console.error = original;
  });
}

describe("processarWebhookHubla — código REAL com Prisma fake", () => {
  before(async () => {
    repo = await import("./repositorio.js");
    resposta = await import("./resposta.js");
    TIMEOUT_PROCESSING_MS = (await import("./regras-conversao.js")).TIMEOUT_PROCESSING_MS;
    route = await import("../../app/api/webhooks/hubla/route.js");
  });

  beforeEach(() => resetDb());

  describe("N4: data da conversão", () => {
    it("fatura SEM paidAt + assinatura createdAt=2025-01-10 → grava a hora do webhook", async () => {
      const { membershipId } = usuarioFree("free@teste.com");

      const r = await processar(payloadFatura({ email: "free@teste.com" }), "n4-sem-paidat");

      assert.deepEqual(r, { ignorado: false, conversao: true });
      const m = memberships.get(membershipId)!;
      assert.equal(m.tier, "pro");
      assert.equal(m.convertedToPaidAt?.toISOString(), RECEBIDO_EM.toISOString());
      assert.notEqual(m.convertedToPaidAt?.toISOString(), ASSINATURA_ANTIGA);
      assert.equal(allowed.get("free@teste.com")?.paidAt?.toISOString(), RECEBIDO_EM.toISOString());
    });

    it("fatura COM paidAt → grava o paidAt da fatura (allowlist e membership)", async () => {
      const { membershipId } = usuarioFree("pago@teste.com");
      const paidAt = "2026-10-08T11:59:00.000Z";

      await processar(payloadFatura({ email: "pago@teste.com", paidAt }), "n4-com-paidat");

      assert.equal(memberships.get(membershipId)!.convertedToPaidAt?.toISOString(), paidAt);
      assert.equal(allowed.get("pago@teste.com")?.paidAt?.toISOString(), paidAt);
    });

    it("comprador sem conta: allowed_email.paid_at = hora do webhook (não 2025-01-10)", async () => {
      await processar(payloadFatura({ email: "novo@teste.com" }), "n4-sem-conta");

      const row = allowed.get("novo@teste.com");
      assert.ok(row, "deve criar allowed_email");
      assert.equal(row.source, "hubla");
      assert.equal(row.paidAt?.toISOString(), RECEBIDO_EM.toISOString());
      assert.equal(deliveries.get("n4-sem-conta")!.status, "processed");
    });

    it("sem recebidoEm explícito usa o instante do processamento (nunca a assinatura)", async () => {
      const { membershipId } = usuarioFree("agora@teste.com");
      const antes = Date.now();

      await processar(payloadFatura({ email: "agora@teste.com" }), "n4-agora", null);

      const t = memberships.get(membershipId)!.convertedToPaidAt!.getTime();
      assert.ok(t >= antes && t <= Date.now(), "deve ser ~agora");
    });
  });

  describe("fluxo completo + status final da entrega", () => {
    it("processa, grava status processed + membershipId + offerId", async () => {
      const { membershipId } = usuarioFree("fluxo@teste.com");

      await processar(payloadFatura({ email: "fluxo@teste.com" }), "fluxo-1");

      const d = deliveries.get("fluxo-1")!;
      assert.equal(d.status, "processed");
      assert.equal(d.membershipId, membershipId);
      assert.equal(d.offerId, OFERTA_PRO);
      assert.equal(d.productId, PRODUTO);
      assert.equal(d.email, "fluxo@teste.com");
      assert.equal(d.erro, null);
    });

    it("produto fora do filtro → status ignored com motivo, HTTP 200", async () => {
      const r = await processar(
        payloadFatura({ email: "x@teste.com", productId: "outro-produto", offerId: "outra-oferta" }),
        "ignorado-1",
      );

      assert.equal(r.ignorado, true);
      assert.equal(deliveries.get("ignorado-1")!.status, "ignored");
      assert.equal(deliveries.get("ignorado-1")!.erro, r.motivo);
      assert.equal(resposta.respostaWebhookHubla(r).status, 200);
      assert.equal(allowed.size, 0);
    });

    it("reenvio duplicado após processed → 'idempotency duplicada', HTTP 200, sem reprocessar", async () => {
      usuarioFree("dup@teste.com");
      await processar(payloadFatura({ email: "dup@teste.com" }), "dup-1");
      allowed.delete("dup@teste.com");

      const r = await processar(payloadFatura({ email: "dup@teste.com" }), "dup-1");

      assert.deepEqual(r, { ignorado: true, motivo: "idempotency duplicada" });
      assert.equal(resposta.respostaWebhookHubla(r).status, 200);
      assert.equal(allowed.has("dup@teste.com"), false, "não deve reprocessar");
    });

    it("erro no processamento → status error (finally grava) e rejeita; reenvio reprocessa", async () => {
      usuarioFree("erro@teste.com");
      falhas.allowedUpsert = true;

      await assert.rejects(
        processar(payloadFatura({ email: "erro@teste.com" }), "erro-1"),
        /falha simulada na allowlist/,
      );
      const d = deliveries.get("erro-1")!;
      assert.equal(d.status, "error");
      assert.equal(d.erro, "falha simulada na allowlist");

      falhas.allowedUpsert = false;
      const r = await processar(
        payloadFatura({ email: "erro@teste.com" }),
        "erro-1",
        new Date("2026-10-08T12:30:00.000Z"),
      );
      assert.equal(r.ignorado, false);
      assert.equal(deliveries.get("erro-1")!.status, "processed");
      assert.equal(deliveries.get("erro-1")!.erro, null);
      assert.ok(allowed.has("erro@teste.com"), "reenvio completa a allowlist");
      // conversão já marcada na 1ª tentativa não é sobrescrita pelo reenvio
      const m = [...memberships.values()].find((x) => x.tier === "pro")!;
      assert.equal(m.convertedToPaidAt?.toISOString(), RECEBIDO_EM.toISOString());
    });
  });

  describe("Q1: evento em processamento", () => {
    function deliveryEmProcessamento(key: string, claimedHaMs: number) {
      deliveries.set(key, {
        idempotencyKey: key,
        status: "processing",
        claimedAt: new Date(Date.now() - claimedHaMs),
        email: "proc@teste.com",
        membershipId: null,
        eventType: "invoice.payment_succeeded",
        payload: {},
        productId: PRODUTO,
        offerId: OFERTA_PRO,
        erro: null,
      });
    }

    it("reenvio enquanto outra execução está em processing → emProcessamento, HTTP 409", async () => {
      deliveryEmProcessamento("proc-1", 60_000);

      const r = await processar(payloadFatura({ email: "proc@teste.com" }), "proc-1");

      assert.equal(r.emProcessamento, true);
      assert.equal(r.motivo, "evento em processamento");
      const http = resposta.respostaWebhookHubla(r);
      assert.equal(http.status, 409);
      assert.equal(http.body.ok, false);
      assert.equal(allowed.size, 0, "não processa em paralelo");
      assert.equal(deliveries.get("proc-1")!.status, "processing");
    });

    it("processing travado (> timeout) é retomado e processado", async () => {
      usuarioFree("proc@teste.com");
      deliveryEmProcessamento("proc-2", TIMEOUT_PROCESSING_MS + 1_000);

      const r = await processar(payloadFatura({ email: "proc@teste.com" }), "proc-2");

      assert.equal(r.emProcessamento, undefined);
      assert.equal(resposta.respostaWebhookHubla(r).status, 200);
      assert.equal(deliveries.get("proc-2")!.status, "processed");
    });

    it("falha ao gravar status final → rejeita (500), libera a linha para 'error' e o reenvio reprocessa", async () => {
      usuarioFree("final@teste.com");
      falhas.deliveryUpdate = true;

      await silenciarConsoleError(() =>
        assert.rejects(
          processar(payloadFatura({ email: "final@teste.com" }), "final-1"),
          (e: Error) => e.name === "ErroAtualizarEntregaHubla",
        ),
      );
      const d = deliveries.get("final-1")!;
      assert.equal(d.status, "error", "não fica preso em processing nem vira sucesso falso");
      assert.match(d.erro ?? "", /falha ao gravar status final \(processed\)/);

      falhas.deliveryUpdate = false;
      const r = await processar(payloadFatura({ email: "final@teste.com" }), "final-1");
      assert.equal(r.ignorado, false);
      assert.equal(deliveries.get("final-1")!.status, "processed");
    });

    it("falha ao gravar status final E ao liberar → rejeita; reenvio em < 5 min recebe 409", async () => {
      usuarioFree("final2@teste.com");
      falhas.deliveryUpdate = true;
      falhas.deliveryLiberar = true;

      await silenciarConsoleError(() =>
        assert.rejects(processar(payloadFatura({ email: "final2@teste.com" }), "final-2")),
      );
      assert.equal(deliveries.get("final-2")!.status, "processing");

      falhas.deliveryUpdate = false;
      falhas.deliveryLiberar = false;
      const r = await processar(payloadFatura({ email: "final2@teste.com" }), "final-2");
      assert.equal(resposta.respostaWebhookHubla(r).status, 409);
    });

    it("erro do processamento tem prioridade sobre a falha ao gravar o status final", async () => {
      usuarioFree("ambos@teste.com");
      falhas.allowedUpsert = true;
      falhas.deliveryUpdate = true;

      await silenciarConsoleError(() =>
        assert.rejects(
          processar(payloadFatura({ email: "ambos@teste.com" }), "ambos-1"),
          /falha simulada na allowlist/,
        ),
      );
      assert.equal(deliveries.get("ambos-1")!.status, "error");
    });
  });

  describe("rota POST /api/webhooks/hubla (código REAL)", () => {
    // Valor fictício só deste teste — nunca o token real.
    const TOKEN_TESTE = "token-ficticio-de-teste";
    const envOriginal = {
      token: process.env.HUBLA_WEBHOOK_TOKEN,
      produto: process.env.HUBLA_PRODUCT_ID,
      ofertaPro: process.env.HUBLA_OFFER_ID_PRO,
    };

    beforeEach(() => {
      process.env.HUBLA_WEBHOOK_TOKEN = TOKEN_TESTE;
      process.env.HUBLA_PRODUCT_ID = PRODUTO;
      process.env.HUBLA_OFFER_ID_PRO = OFERTA_PRO;
    });

    function restaurarEnv() {
      for (const [k, v] of [
        ["HUBLA_WEBHOOK_TOKEN", envOriginal.token],
        ["HUBLA_PRODUCT_ID", envOriginal.produto],
        ["HUBLA_OFFER_ID_PRO", envOriginal.ofertaPro],
      ] as const) {
        if (v === undefined) delete process.env[k];
        else process.env[k] = v;
      }
    }

    function req(body: unknown, headers: Record<string, string>) {
      return new NextRequest("http://localhost/api/webhooks/hubla", {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "content-type": "application/json", ...headers },
      });
    }

    it("sem x-hubla-token → 401 e não grava nada", async () => {
      const res = await route.POST(req(payloadFatura({ email: "r@teste.com" }), {}));
      assert.equal(res.status, 401);
      assert.equal(deliveries.size, 0);
      restaurarEnv();
    });

    it("token inválido → 401 e não grava nada", async () => {
      const res = await route.POST(
        req(payloadFatura({ email: "r@teste.com" }), { "x-hubla-token": "errado" }),
      );
      assert.equal(res.status, 401);
      assert.equal(deliveries.size, 0);
      restaurarEnv();
    });

    it("token ok + fatura sem paidAt → 200 e conversão com a hora de recebimento", async () => {
      const { membershipId } = usuarioFree("rota@teste.com");
      const antes = Date.now();
      const res = await route.POST(
        req(payloadFatura({ email: "rota@teste.com" }), {
          "x-hubla-token": TOKEN_TESTE,
          "x-hubla-idempotency": "rota-1",
        }),
      );
      assert.equal(res.status, 200);
      assert.deepEqual(await res.json(), { ok: true, ignorado: false });
      const t = memberships.get(membershipId)!.convertedToPaidAt!.getTime();
      assert.ok(t >= antes && t <= Date.now(), "hora de recebimento, não 2025-01-10");
      assert.equal(deliveries.get("rota-1")!.status, "processed");
      restaurarEnv();
    });

    it("reenvio enquanto processing → HTTP 409", async () => {
      deliveries.set("rota-2", {
        idempotencyKey: "rota-2",
        status: "processing",
        claimedAt: new Date(Date.now() - 30_000),
        email: "rota2@teste.com",
        membershipId: null,
        eventType: "invoice.payment_succeeded",
        payload: {},
        productId: PRODUTO,
        offerId: OFERTA_PRO,
        erro: null,
      });
      const res = await route.POST(
        req(payloadFatura({ email: "rota2@teste.com" }), {
          "x-hubla-token": TOKEN_TESTE,
          "x-hubla-idempotency": "rota-2",
        }),
      );
      assert.equal(res.status, 409);
      const body = await res.json();
      assert.equal(body.ok, false);
      assert.equal(body.motivo, "evento em processamento");
      restaurarEnv();
    });

    it("falha ao gravar status final → HTTP 500 (Hubla reenvia)", async () => {
      usuarioFree("rota3@teste.com");
      falhas.deliveryUpdate = true;
      const res = await silenciarConsoleError(() =>
        route.POST(
          req(payloadFatura({ email: "rota3@teste.com" }), {
            "x-hubla-token": TOKEN_TESTE,
            "x-hubla-idempotency": "rota-3",
          }),
        ),
      );
      assert.equal(res.status, 500);
      assert.equal(deliveries.get("rota-3")!.status, "error");
      restaurarEnv();
    });
  });

  describe("respostaWebhookHubla", () => {
    it("processado → 200 ok", () => {
      const r = resposta.respostaWebhookHubla({ ignorado: false, conversao: true });
      assert.equal(r.status, 200);
      assert.deepEqual(r.body, { ok: true, ignorado: false });
    });

    it("em processamento → 409", () => {
      const r = resposta.respostaWebhookHubla({
        ignorado: true,
        motivo: "evento em processamento",
        emProcessamento: true,
      });
      assert.equal(r.status, 409);
      assert.deepEqual(r.body, { ok: false, ignorado: true, motivo: "evento em processamento" });
    });
  });
});
