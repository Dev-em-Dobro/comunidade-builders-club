// F047 — TMB vendas → AllowedEmail + Membership.tier.

import { prisma } from "@/lib/db";
import { addAllowedEmail, removeAllowedEmail } from "@/lib/membership/allowlist";
import {
  idempotencyKeyTmb,
  interpretarVendaTmb,
} from "./interpretar";
import type { AcaoTmb, PlanoTmb } from "./tipos";
import type { MembershipTier } from "@prisma/client";

function rankPago(tier: MembershipTier | PlanoTmb): number {
  if (tier === "elite") return 3;
  if (tier === "pro" || tier === "paid") return 2;
  return 1;
}

async function jaProcessouIdempotency(key: string): Promise<boolean> {
  const row = await prisma.hublaWebhookDelivery.findUnique({
    where: { idempotencyKey: key },
  });
  return row !== null;
}

async function registrarEntrega(
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

async function concederPago(email: string, plan: PlanoTmb): Promise<void> {
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
  const nextTier = rankPago(plan) >= rankPago(m.tier) ? plan : m.tier;
  await prisma.membership.update({
    where: { userId: user.id },
    data: { status: "active", tier: nextTier },
  });
}

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

async function aplicarAcao(acao: AcaoTmb): Promise<void> {
  if (acao.acao === "ignorar") return;

  if (acao.acao === "conceder") {
    const noteParts = [
      `productId=${acao.productId}`,
      acao.lancamentoId ? `lancamento_id=${acao.lancamentoId}` : null,
      acao.nome ? `name=${acao.nome}` : null,
      `pedido=${acao.pedido}`,
      `plan=${acao.plan}`,
    ].filter(Boolean);
    await addAllowedEmail({
      email: acao.email,
      source: "tmb",
      note: noteParts.join("; "),
    });
    await concederPago(acao.email, acao.plan);
    return;
  }

  try {
    await removeAllowedEmail(acao.email);
  } catch {
    // já ausente
  }
  await downgradeParaFree(acao.email);
}

export async function processarWebhookTmb(
  payload: unknown,
): Promise<{ ignorado: boolean; motivo?: string; acao?: string }> {
  const acao = interpretarVendaTmb(payload);
  const key = idempotencyKeyTmb(acao, payload);
  const eventType =
    acao.acao === "ignorar"
      ? `tmb.ignore`
      : acao.acao === "conceder"
        ? "tmb.grant"
        : "tmb.revoke";

  if (await jaProcessouIdempotency(key)) {
    return { ignorado: true, motivo: "idempotency duplicada", acao: acao.acao };
  }

  if (acao.acao === "ignorar") {
    await registrarEntrega(key, eventType);
    return { ignorado: true, motivo: acao.motivo, acao: "ignorar" };
  }

  await aplicarAcao(acao);
  await registrarEntrega(key, eventType);
  return { ignorado: false, acao: acao.acao };
}
