// F014 / F041 / F081 — persistência Hubla → AllowedEmail + Membership (+ dinheiro).
//
// B7: Ex-pagante que volta a pagar NÃO conta como nova conversão. O campo
// convertedToPaidAt é gravado apenas na primeira vez que o membro vira pago
// (seja Free→Pago ou conta nova com pagamento). Renovações, upgrades (Pro→Elite)
// e reativações de ex-pagantes não sobrescrevem a data original.

import { randomUUID } from "node:crypto";
import type { MembershipTier, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { addAllowedEmail, findUserByEmail, removeAllowedEmail } from "@/lib/membership/allowlist";
import { interpretarEventoHubla } from "./interpretar";
import { emailDoEvento, offerIdsDoEvento, productIdDoEvento } from "./normalizar";
import type { PlanoPagoHubla } from "./produtos";
import type { AcaoAllowlist, CobrancaHubla, HublaWebhookPayload } from "./tipos";

function rankPago(tier: MembershipTier | PlanoPagoHubla): number {
  if (tier === "elite") return 3;
  if (tier === "pro" || tier === "paid") return 2;
  return 1;
}

function dadosCobrancaMembership(cobranca: CobrancaHubla, plan: PlanoPagoHubla) {
  return {
    valorCentavos: cobranca.valorCentavos,
    planoPago: plan,
    moeda: cobranca.moeda,
    ultimaCobrancaEm: cobranca.cobradoEm ?? new Date(),
  };
}

export async function jaProcessouIdempotency(key: string): Promise<boolean> {
  const row = await prisma.hublaWebhookDelivery.findUnique({
    where: { idempotencyKey: key },
    select: { status: true },
  });
  return row !== null && row.status !== "pending";
}

export type DadosEntregaWebhook = {
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

export async function registrarOuAtualizarEntrega(dados: DadosEntregaWebhook): Promise<void> {
  await prisma.hublaWebhookDelivery.upsert({
    where: { idempotencyKey: dados.idempotencyKey },
    create: {
      idempotencyKey: dados.idempotencyKey,
      eventType: dados.eventType,
      payload: dados.payload as Prisma.InputJsonValue,
      productId: dados.productId ?? null,
      offerId: dados.offerId ?? null,
      email: dados.email ?? null,
      membershipId: dados.membershipId ?? null,
      status: dados.status,
      erro: dados.erro ?? null,
    },
    update: {
      status: dados.status,
      erro: dados.erro ?? null,
      membershipId: dados.membershipId ?? null,
    },
  });
}

export function isPago(tier: MembershipTier | PlanoPagoHubla): boolean {
  return tier === "pro" || tier === "elite" || tier === "paid";
}

export type ResultadoConcessao = {
  membershipId: string | null;
  conversao: boolean;
};

/**
 * Concede plano pago a um usuário existente.
 * B6: Usa updateMany com condição atômica e upsert para evitar corrida.
 * B7: Só marca convertedToPaidAt se era gratuito E não tinha conversão prévia.
 */
export async function concederPago(
  emails: string[],
  plan: PlanoPagoHubla,
  cobranca: CobrancaHubla,
): Promise<ResultadoConcessao> {
  const user = await findUserPorEmails(emails);
  if (!user) return { membershipId: null, conversao: false };

  const dinheiro = dadosCobrancaMembership(cobranca, plan);
  const convertedAt = cobranca.cobradoEm ?? new Date();

  const m = await prisma.membership.findUnique({ where: { userId: user.id } });

  if (!m) {
    try {
      const created = await prisma.membership.create({
        data: {
          userId: user.id,
          status: "active",
          tier: plan,
          role: "member",
          convertedToPaidAt: convertedAt,
          ...dinheiro,
        },
      });
      return { membershipId: created.id, conversao: true };
    } catch (e) {
      if ((e as { code?: string }).code === "P2002") {
        const existing = await prisma.membership.findUnique({ where: { userId: user.id } });
        if (existing) {
          return { membershipId: existing.id, conversao: false };
        }
      }
      throw e;
    }
  }

  const eraGratuito = !isPago(m.tier);
  const nextTier = rankPago(plan) >= rankPago(m.tier) ? plan : m.tier;

  if (eraGratuito) {
    const updated = await prisma.membership.updateMany({
      where: {
        userId: user.id,
        convertedToPaidAt: null,
      },
      data: {
        status: "active",
        tier: nextTier,
        convertedToPaidAt: convertedAt,
        ...dinheiro,
      },
    });

    if (updated.count === 0) {
      await prisma.membership.update({
        where: { userId: user.id },
        data: {
          status: "active",
          tier: nextTier,
          ...dinheiro,
        },
      });
    }

    return { membershipId: m.id, conversao: updated.count > 0 };
  }

  await prisma.membership.update({
    where: { userId: user.id },
    data: {
      status: "active",
      tier: nextTier,
      ...dinheiro,
    },
  });

  return { membershipId: m.id, conversao: false };
}

async function findUserPorEmails(emails: string[]) {
  for (const email of emails) {
    const user = await findUserByEmail(email);
    if (user) return user;
  }
  return null;
}

/** F041 — cancelamento Hubla desce para free (não revoga o login). */
async function downgradeParaFree(email: string): Promise<string | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const m = await prisma.membership.findUnique({ where: { userId: user.id } });
  if (!m || m.role === "admin") return m?.id ?? null;
  await prisma.membership.update({
    where: { userId: user.id },
    data: { status: "active", tier: "free" },
  });
  return m.id;
}

export type ResultadoAcaoAllowlist = {
  membershipId: string | null;
  conversao: boolean;
};

export async function aplicarAcaoAllowlist(acao: AcaoAllowlist): Promise<ResultadoAcaoAllowlist> {
  if (acao.acao === "ignorar") return { membershipId: null, conversao: false };

  if (acao.acao === "conceder") {
    const paidAt = acao.cobranca.cobradoEm ?? new Date();
    await addAllowedEmail({
      email: acao.email,
      source: "hubla",
      note: acao.offerId
        ? `product:${acao.productId} offer:${acao.offerId}; plan=${acao.plan}`
        : `product:${acao.productId}; plan=${acao.plan}`,
      tier: acao.plan,
      paidAt,
    });
    const resultado = await concederPago(
      acao.emails.length > 0 ? acao.emails : [acao.email],
      acao.plan,
      acao.cobranca,
    );
    return resultado;
  }

  try {
    await removeAllowedEmail(acao.email);
  } catch {
    // já ausente — ok
  }
  const membershipId = await downgradeParaFree(acao.email);
  return { membershipId, conversao: false };
}

function extrairDadosDoPayload(payload: unknown): {
  productId: string | null;
  offerId: string | null;
  email: string | null;
} {
  const p = payload as HublaWebhookPayload | null;
  const event = p?.event;
  if (!event) {
    return { productId: null, offerId: null, email: null };
  }
  return {
    productId: productIdDoEvento(event),
    offerId: offerIdsDoEvento(event)[0] ?? null,
    email: emailDoEvento(event),
  };
}

export async function processarWebhookHubla(
  payload: unknown,
  opts: {
    productPlanMap?: Map<string, PlanoPagoHubla> | null;
    offerPlanMap?: Map<string, PlanoPagoHubla> | null;
    idempotencyKey?: string | null;
    eventType: string;
  },
): Promise<{ ignorado: boolean; motivo?: string; conversao?: boolean }> {
  const idempotencyKey = opts.idempotencyKey || `fallback-${randomUUID()}`;

  if (opts.idempotencyKey && (await jaProcessouIdempotency(opts.idempotencyKey))) {
    return { ignorado: true, motivo: "idempotency duplicada" };
  }

  const dadosPayload = extrairDadosDoPayload(payload);

  await registrarOuAtualizarEntrega({
    idempotencyKey,
    eventType: opts.eventType,
    payload,
    productId: dadosPayload.productId,
    offerId: dadosPayload.offerId,
    email: dadosPayload.email,
    membershipId: null,
    status: "pending",
    erro: null,
  });

  let status: "processed" | "ignored" | "error" = "processed";
  let erro: string | null = null;
  let membershipId: string | null = null;
  let resultado: { ignorado: boolean; motivo?: string; conversao?: boolean };

  try {
    const acao = interpretarEventoHubla(payload as HublaWebhookPayload, {
      productPlanMap: opts.productPlanMap,
      offerPlanMap: opts.offerPlanMap,
    });

    if (acao.acao === "ignorar") {
      status = "ignored";
      erro = acao.motivo;
      resultado = { ignorado: true, motivo: acao.motivo };
    } else {
      const res = await aplicarAcaoAllowlist(acao);
      membershipId = res.membershipId;
      status = "processed";
      resultado = { ignorado: false, conversao: res.conversao };
    }
  } catch (e) {
    status = "error";
    erro = e instanceof Error ? e.message : "Erro desconhecido";
    throw e;
  } finally {
    await registrarOuAtualizarEntrega({
      idempotencyKey,
      eventType: opts.eventType,
      payload,
      productId: dadosPayload.productId,
      offerId: dadosPayload.offerId,
      email: dadosPayload.email,
      membershipId,
      status,
      erro,
    }).catch((err) => {
      console.error("[hubla/webhook] falha ao atualizar entrega", err);
    });
  }

  return resultado!;
}
