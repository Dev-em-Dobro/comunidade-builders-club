/**
 * F090 — ciente da Lista da garantia (Elite).
 * Usa `legal_acceptance` com documento `garantia` e `VERSAO_GARANTIA`.
 */

import { prisma } from "@/lib/db";
import {
  DOCUMENTO_GARANTIA,
  VERSAO_GARANTIA,
} from "@/lib/legal/garantia";
import type { ContextoAceite } from "./aceite-legal";

export async function temAceiteGarantiaVigente(userId: string): Promise<boolean> {
  const row = await prisma.legalAcceptance.findUnique({
    where: {
      userId_documento_versao: {
        userId,
        documento: DOCUMENTO_GARANTIA,
        versao: VERSAO_GARANTIA,
      },
    },
    select: { id: true },
  });
  return Boolean(row);
}

export async function registrarAceiteGarantia(
  userId: string,
  contexto: ContextoAceite = {},
): Promise<void> {
  await prisma.legalAcceptance.createMany({
    data: [
      {
        userId,
        documento: DOCUMENTO_GARANTIA,
        versao: VERSAO_GARANTIA,
        ip: contexto.ip ?? null,
        userAgent: contexto.userAgent ?? null,
      },
    ],
    skipDuplicates: true,
  });
}
