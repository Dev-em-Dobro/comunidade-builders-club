// F126 — produto Hubla que vende um módulo avulso (low ticket).
//
// Nunca passa pelo fluxo do Club: sem allowed_email, sem tier. A compra fica
// por e-mail porque costuma chegar antes do cadastro.

import { prisma } from "@/lib/db";
import { emailsDoEvento } from "./normalizar";
import {
  EVENTOS_CONCEDER,
  EVENTOS_REVOGAR,
  STATUS_ASSINATURA_BLOQUEADOS,
  type HublaWebhookPayload,
} from "./tipos";

export type AcaoAulaAvulsa =
  | { acao: "liberar" | "retirar"; emails: string[] }
  | { acao: "ignorar"; motivo: string };

export function interpretarAulaAvulsa(payload: HublaWebhookPayload): AcaoAulaAvulsa {
  const tipo = payload.type?.trim() ?? "";
  const event = payload.event;
  if (!event) return { acao: "ignorar", motivo: "event ausente" };

  const emails = emailsDoEvento(event);
  if (emails.length === 0) return { acao: "ignorar", motivo: "email ausente" };

  if (EVENTOS_CONCEDER.has(tipo)) {
    const subStatus = event.subscription?.status?.toLowerCase();
    if (subStatus && STATUS_ASSINATURA_BLOQUEADOS.has(subStatus)) {
      return { acao: "ignorar", motivo: "subscription não paga" };
    }
    return { acao: "liberar", emails };
  }
  if (EVENTOS_REVOGAR.has(tipo)) return { acao: "retirar", emails };
  return { acao: "ignorar", motivo: `tipo não tratado: ${tipo}` };
}

/** Módulo vendido por este produto, ou null se o produto não é aula avulsa. */
export async function moduloDaAulaAvulsa(productId: string | null) {
  if (!productId) return null;
  return prisma.module.findUnique({
    where: { hublaProductId: productId },
    select: { id: true },
  });
}

export async function aplicarAulaAvulsa(
  moduleId: string,
  acao: Extract<AcaoAulaAvulsa, { emails: string[] }>,
): Promise<void> {
  if (acao.acao === "liberar") {
    await prisma.modulePurchase.createMany({
      data: acao.emails.map((email) => ({ email, moduleId })),
      skipDuplicates: true,
    });
    return;
  }
  // Reembolso retira só o módulo. Tier e allowlist ficam como estão.
  await prisma.modulePurchase.deleteMany({
    where: { moduleId, email: { in: acao.emails } },
  });
}
