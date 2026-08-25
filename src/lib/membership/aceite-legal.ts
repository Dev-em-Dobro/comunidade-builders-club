/**
 * F058 — registro do aceite dos Termos e da Política.
 *
 * O aceite é implícito: a tela de login diz "Ao continuar, você concorda…".
 * O que este módulo faz é deixar prova de quem entrou sob qual versão.
 */

import { prisma } from "@/lib/db";
import { DOCUMENTOS_LEGAIS, VERSAO_LEGAL } from "@/lib/legal";

export type ContextoAceite = {
  ip?: string | null;
  userAgent?: string | null;
};

/**
 * Grava o aceite da versão atual, se ainda não houver.
 *
 * Idempotente por `@@unique([userId, documento, versao])`: dois requests
 * simultâneos do mesmo login não geram linha duplicada.
 */
export async function registrarAceiteLegal(
  userId: string,
  contexto: ContextoAceite = {},
): Promise<void> {
  await prisma.legalAcceptance.createMany({
    data: DOCUMENTOS_LEGAIS.map((documento) => ({
      userId,
      documento,
      versao: VERSAO_LEGAL,
      ip: contexto.ip ?? null,
      userAgent: contexto.userAgent ?? null,
    })),
    skipDuplicates: true,
  });

  await prisma.membership.updateMany({
    where: { userId },
    data: { termosVersao: VERSAO_LEGAL },
  });
}

/** Versão registrada difere da atual — precisa gravar aceite. */
export function precisaRegistrarAceite(termosVersao: string | null): boolean {
  return termosVersao !== VERSAO_LEGAL;
}
