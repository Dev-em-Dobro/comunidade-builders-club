import { prisma } from "@/lib/db";
import { DOCUMENTO_TERMOS_ELITE, versaoAceiteTermosElite } from "@/lib/legal/termos-elite";
import type { ContextoAceite } from "./aceite-legal";

export async function temAceiteTermosEliteVigente(
  userId: string,
  eliteStartedAt: Date | null,
): Promise<boolean> {
  const row = await prisma.legalAcceptance.findUnique({
    where: {
      userId_documento_versao: {
        userId,
        documento: DOCUMENTO_TERMOS_ELITE,
        versao: versaoAceiteTermosElite(eliteStartedAt),
      },
    },
    select: { id: true },
  });
  return Boolean(row);
}

export async function registrarAceiteTermosElite(
  userId: string,
  eliteStartedAt: Date | null,
  contexto: ContextoAceite = {},
): Promise<void> {
  await prisma.legalAcceptance.createMany({
    data: [{
      userId,
      documento: DOCUMENTO_TERMOS_ELITE,
      versao: versaoAceiteTermosElite(eliteStartedAt),
      ip: contexto.ip ?? null,
      userAgent: contexto.userAgent ?? null,
    }],
    skipDuplicates: true,
  });
}
