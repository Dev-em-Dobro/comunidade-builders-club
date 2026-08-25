/**
 * F059 — exclusão de conta pelo próprio membro.
 *
 * Anonimiza em vez de apagar: `User` tem `onDelete: Cascade` para posts e
 * comentários, e apagar a linha levaria junto conversas em que outras pessoas
 * participaram. O dado pessoal sai; a conversa da comunidade fica.
 */

import { prisma } from "@/lib/db";

export const NOME_MEMBRO_REMOVIDO = "Membro removido";

/** Único admin ativo não pode se excluir — comunidade ficaria sem quem administre. */
export class UltimoAdminError extends Error {
  constructor() {
    super(
      "Você é o único administrador ativo. Promova outro membro a administrador antes de excluir sua conta.",
    );
    this.name = "UltimoAdminError";
  }
}

/** E-mail descartável que mantém a unicidade da coluna sem guardar o real. */
function emailAnonimo(userId: string): string {
  return `removido+${userId}@invalido.local`;
}

export async function excluirConta(userId: string): Promise<void> {
  const membership = await prisma.membership.findUnique({
    where: { userId },
    select: { role: true, status: true },
  });

  if (membership?.role === "admin" && membership.status === "active") {
    const outrosAdmins = await prisma.membership.count({
      where: { role: "admin", status: "active", userId: { not: userId } },
    });
    if (outrosAdmins === 0) throw new UltimoAdminError();
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        name: NOME_MEMBRO_REMOVIDO,
        email: emailAnonimo(userId),
        emailVerified: false,
        image: null,
      },
    }),
    prisma.profile.updateMany({
      where: { userId },
      data: { displayName: NOME_MEMBRO_REMOVIDO, bio: null, avatarUrl: null },
    }),
    prisma.membership.updateMany({
      where: { userId },
      data: { status: "revoked" },
    }),
    // Mantém a prova do aceite (F058), sem os dados pessoais da coleta.
    prisma.legalAcceptance.updateMany({
      where: { userId },
      data: { ip: null, userAgent: null },
    }),
    // Encerra o acesso e desfaz o vínculo OAuth.
    prisma.session.deleteMany({ where: { userId } }),
    prisma.account.deleteMany({ where: { userId } }),
  ]);
}
