// F014 / F041 — persistência Hubla → AllowedEmail + Membership.tier.

import type { MembershipTier } from "@prisma/client";
import { prisma } from "@/lib/db";
import { addAllowedEmail, removeAllowedEmail } from "@/lib/membership/allowlist";
import { interpretarEventoHubla } from "./interpretar";
import type { PlanoPagoHubla } from "./produtos";
import type { AcaoAllowlist, HublaWebhookPayload } from "./tipos";

function rankPago(tier: MembershipTier | PlanoPagoHubla): number {
  if (tier === "elite") return 3;
  if (tier === "pro" || tier === "paid") return 2;
  return 1;
}

export async function jaProcessouIdempotency(key: string): Promise<boolean> {
  const row = await prisma.hublaWebhookDelivery.findUnique({
    where: { idempotencyKey: key },
  });
  return row !== null;
}

export async function registrarEntrega(
  idempotencyKey: string,
  eventType: string,
): Promise<void> {
  await prisma.hublaWebhookDelivery.create({
    data: {
      idempotencyKey,
      eventType,
    },
  });
}

async function concederPago(
  email: string,
  plan: PlanoPagoHubla,
): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;
  const m = await prisma.membership.findUnique({ where: { userId: user.id } });
  if (!m) {
    await prisma.membership.create({
      data: {
        userId: user.id,
        status: "active",
        tier: plan,
        role: "member",
      },
    });
    return;
  }
  const nextTier =
    rankPago(plan) >= rankPago(m.tier) ? plan : m.tier;
  await prisma.membership.update({
    where: { userId: user.id },
    data: { status: "active", tier: nextTier },
  });
}

/** F041 — cancelamento Hubla desce para free (não revoga o login). */
async function downgradeParaFree(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;
  const m = await prisma.membership.findUnique({ where: { userId: user.id } });
  if (!m || m.role === "admin") return;
  await prisma.membership.update({
    where: { userId: user.id },
    data: { status: "active", tier: "free" },
  });
}

export async function aplicarAcaoAllowlist(acao: AcaoAllowlist): Promise<void> {
  if (acao.acao === "ignorar") return;

  if (acao.acao === "conceder") {
    await addAllowedEmail({
      email: acao.email,
      source: "hubla",
      note: acao.offerId
        ? `product:${acao.productId} offer:${acao.offerId}`
        : `product:${acao.productId}`,
    });
    await concederPago(acao.email, acao.plan);
    return;
  }

  try {
    await removeAllowedEmail(acao.email);
  } catch {
    // já ausente — ok
  }
  await downgradeParaFree(acao.email);
}

export async function processarWebhookHubla(
  payload: unknown,
  opts: {
    productPlanMap?: Map<string, PlanoPagoHubla> | null;
    offerPlanMap?: Map<string, PlanoPagoHubla> | null;
    idempotencyKey?: string | null;
    eventType: string;
  },
): Promise<{ ignorado: boolean; motivo?: string }> {
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
      await registrarEntrega(opts.idempotencyKey, opts.eventType);
    }
    return { ignorado: true, motivo: acao.motivo };
  }

  await aplicarAcaoAllowlist(acao);

  if (opts.idempotencyKey) {
    await registrarEntrega(opts.idempotencyKey, opts.eventType);
  }

  return { ignorado: false };
}
