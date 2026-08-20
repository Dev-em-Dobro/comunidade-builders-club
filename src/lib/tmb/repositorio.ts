// F047 — TMB vendas → AllowedEmail + Membership.tier.

import { prisma } from "@/lib/db";
import { addAllowedEmail, removeAllowedEmail } from "@/lib/membership/allowlist";
import {
  idempotencyKeyTmb,
  interpretarVendaTmb,
} from "./interpretar";
import type { AcaoTmb } from "./tipos";

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

async function concederPaid(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;
  const m = await prisma.membership.findUnique({ where: { userId: user.id } });
  if (!m) {
    await prisma.membership.create({
      data: {
        userId: user.id,
        status: "active",
        tier: "paid",
        role: "member",
      },
    });
    return;
  }
  await prisma.membership.update({
    where: { userId: user.id },
    data: { status: "active", tier: "paid" },
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
    ].filter(Boolean);
    await addAllowedEmail({
      email: acao.email,
      source: "tmb",
      note: noteParts.join("; "),
    });
    await concederPaid(acao.email);
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
