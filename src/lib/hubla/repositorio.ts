// F014 — persistência Hubla → AllowedEmail + Membership.

import { prisma } from "@/lib/db";
import { addAllowedEmail, removeAllowedEmail } from "@/lib/membership/allowlist";
import { interpretarEventoHubla } from "./interpretar";
import type { AcaoAllowlist, HublaWebhookPayload } from "./tipos";

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

async function ativarPendingSeExistir(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;
  const m = await prisma.membership.findUnique({ where: { userId: user.id } });
  if (m?.status === "pending") {
    await prisma.membership.update({
      where: { userId: user.id },
      data: { status: "active" },
    });
  }
}

async function revogarSeExistir(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;
  const m = await prisma.membership.findUnique({ where: { userId: user.id } });
  if (m && m.status !== "revoked" && m.role !== "admin") {
    await prisma.membership.update({
      where: { userId: user.id },
      data: { status: "revoked" },
    });
  }
}

export async function aplicarAcaoAllowlist(acao: AcaoAllowlist): Promise<void> {
  if (acao.acao === "ignorar") return;

  if (acao.acao === "conceder") {
    await addAllowedEmail({
      email: acao.email,
      source: "hubla",
      note: `product:${acao.productId}`,
    });
    await ativarPendingSeExistir(acao.email);
    return;
  }

  try {
    await removeAllowedEmail(acao.email);
  } catch {
    // já ausente — ok
  }
  await revogarSeExistir(acao.email);
}

export async function processarWebhookHubla(
  payload: unknown,
  opts: {
    productIdFiltro?: string | null;
    idempotencyKey?: string | null;
    eventType: string;
  },
): Promise<{ ignorado: boolean; motivo?: string }> {
  if (opts.idempotencyKey) {
    if (await jaProcessouIdempotency(opts.idempotencyKey)) {
      return { ignorado: true, motivo: "idempotency duplicada" };
    }
  }

  const acao = interpretarEventoHubla(
    payload as HublaWebhookPayload,
    opts.productIdFiltro,
  );

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
