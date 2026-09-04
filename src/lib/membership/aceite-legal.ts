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
 * F058 — extração única para os dois caminhos que registram aceite.
 *
 * Existem dois, e é isso que criava o buraco: o hook `user.create.after` do
 * Better Auth grava o aceite na **criação da conta**, antes de qualquer request
 * passar por `requireActiveMember`. Como o hook não passava contexto, a linha
 * nascia com `ip`/`userAgent` nulos — e o `requireActiveMember`, logo depois,
 * via `termosVersao` já em dia e não regravava. Resultado: todo cadastro novo
 * ficava sem prova de origem, que é exatamente o que a F058 existe para ter.
 *
 * Sem `next/headers` de propósito: recebe o `Headers` de quem tem acesso a ele.
 */
export function contextoAceiteDeHeaders(
  h: Headers | null | undefined,
): ContextoAceite {
  if (!h) return {};
  return {
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: h.get("user-agent"),
  };
}

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
