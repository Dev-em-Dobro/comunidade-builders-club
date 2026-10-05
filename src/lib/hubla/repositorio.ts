// F014 / F041 / F081 — persistência Hubla → AllowedEmail + Membership (+ dinheiro).

import type { MembershipTier, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { addAllowedEmail, findUserByEmail, removeAllowedEmail } from "@/lib/membership/allowlist";
import { interpretarEventoHubla } from "./interpretar";
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
  });
  return row !== null;
}

export type DadosEntregaWebhook = {
  idempotencyKey: string;
  eventType: string;
  payload?: unknown;
  productId?: string;
  offerId?: string;
  email?: string;
  membershipId?: string;
};

export async function registrarEntrega(dados: DadosEntregaWebhook): Promise<void> {
  await prisma.hublaWebhookDelivery.create({
    data: {
      idempotencyKey: dados.idempotencyKey,
      eventType: dados.eventType,
      ...(dados.payload !== undefined
        ? { payload: dados.payload as Prisma.InputJsonValue }
        : {}),
      ...(dados.productId ? { productId: dados.productId } : {}),
      ...(dados.offerId ? { offerId: dados.offerId } : {}),
      ...(dados.email ? { email: dados.email } : {}),
      ...(dados.membershipId ? { membershipId: dados.membershipId } : {}),
    },
  });
}

function isPago(tier: MembershipTier | PlanoPagoHubla): boolean {
  return tier === "pro" || tier === "elite" || tier === "paid";
}

type ResultadoConcessao = {
  membershipId: string | null;
  conversao: boolean;
};

async function concederPago(
  emails: string[],
  plan: PlanoPagoHubla,
  cobranca: CobrancaHubla,
): Promise<ResultadoConcessao> {
  const user = await findUserPorEmails(emails);
  if (!user) return { membershipId: null, conversao: false };

  const dinheiro = dadosCobrancaMembership(cobranca, plan);
  const m = await prisma.membership.findUnique({ where: { userId: user.id } });

  if (!m) {
    const created = await prisma.membership.create({
      data: {
        userId: user.id,
        status: "active",
        tier: plan,
        role: "member",
        convertedToPaidAt: new Date(),
        ...dinheiro,
      },
    });
    return { membershipId: created.id, conversao: true };
  }

  const eraGratuito = !isPago(m.tier);
  const jaTinhaConversao = m.convertedToPaidAt !== null;
  const deveMarcarConversao = eraGratuito && !jaTinhaConversao;

  const nextTier = rankPago(plan) >= rankPago(m.tier) ? plan : m.tier;

  await prisma.membership.update({
    where: { userId: user.id },
    data: {
      status: "active",
      tier: nextTier,
      ...dinheiro,
      ...(deveMarcarConversao ? { convertedToPaidAt: new Date() } : {}),
    },
  });

  return { membershipId: m.id, conversao: deveMarcarConversao };
}

async function findUserPorEmails(emails: string[]) {
  for (const email of emails) {
    const user = await findUserByEmail(email);
    if (user) return user;
  }
  return null;
}

/** F041 — cancelamento Hubla desce para free (não revoga o login). */
async function downgradeParaFree(email: string): Promise<void> {
  const user = await findUserByEmail(email);
  if (!user) return;
  const m = await prisma.membership.findUnique({ where: { userId: user.id } });
  if (!m || m.role === "admin") return;
  await prisma.membership.update({
    where: { userId: user.id },
    data: { status: "active", tier: "free" },
  });
}

export type ResultadoAcaoAllowlist = {
  membershipId: string | null;
  conversao: boolean;
};

export async function aplicarAcaoAllowlist(acao: AcaoAllowlist): Promise<ResultadoAcaoAllowlist> {
  if (acao.acao === "ignorar") return { membershipId: null, conversao: false };

  if (acao.acao === "conceder") {
    await addAllowedEmail({
      email: acao.email,
      source: "hubla",
      note: acao.offerId
        ? `product:${acao.productId} offer:${acao.offerId}; plan=${acao.plan}`
        : `product:${acao.productId}; plan=${acao.plan}`,
      tier: acao.plan,
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
  await downgradeParaFree(acao.email);
  return { membershipId: null, conversao: false };
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
  if (opts.idempotencyKey) {
    if (await jaProcessouIdempotency(opts.idempotencyKey)) {
      return { ignorado: true, motivo: "idempotency duplicada" };
    }
  }

  const acao = interpretarEventoHubla(payload as HublaWebhookPayload, {
    productPlanMap: opts.productPlanMap,
    offerPlanMap: opts.offerPlanMap,
  });

  if (acao.acao === "ignorar") {
    if (opts.idempotencyKey) {
      await registrarEntrega({
        idempotencyKey: opts.idempotencyKey,
        eventType: opts.eventType,
        payload,
      });
    }
    return { ignorado: true, motivo: acao.motivo };
  }

  const resultado = await aplicarAcaoAllowlist(acao);

  if (opts.idempotencyKey) {
    await registrarEntrega({
      idempotencyKey: opts.idempotencyKey,
      eventType: opts.eventType,
      payload,
      productId: acao.acao === "conceder" ? acao.productId : undefined,
      offerId: acao.acao === "conceder" ? acao.offerId : undefined,
      email: acao.email,
      membershipId: resultado.membershipId ?? undefined,
    });
  }

  return { ignorado: false, conversao: resultado.conversao };
}
