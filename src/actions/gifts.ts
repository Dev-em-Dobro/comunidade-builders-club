"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireActiveMember } from "@/lib/membership/require-member";

/**
 * F078 — nome vira opcional. A pop-up do Presente pede **só o e-mail**: cada
 * campo a menos é conversão no topo do funil, e é lá que o número dói (142
 * visitas, 3 cadastros).
 *
 * Quem não manda nome não fica sem identidade: `ensureMemberBootstrap` já cai
 * em `email.split("@")[0]` para o `displayName`, e "Completar o perfil" é o
 * passo 1 da trilha de Boas-vindas (F063).
 *
 * O formulário do rodapé continua mandando os dois.
 */
const schema = z.object({
  firstName: z.string().trim().max(60).optional(),
  lastName: z.string().trim().max(60).optional(),
});

export async function completarCadastroPresenteAction(raw: {
  firstName?: string;
  lastName?: string;
}): Promise<{ alreadyHadAccount: boolean }> {
  const { firstName, lastName } = schema.parse(raw);
  const member = await requireActiveMember();
  const isNew =
    Date.now() - member.membership.createdAt.getTime() < 2 * 60 * 1000;

  if (!isNew) {
    return { alreadyHadAccount: true };
  }

  const displayName = [firstName, lastName]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  /**
   * Sem nome, não escreve: sobrescrever com string vazia apagaria o fallback
   * que o bootstrap acabou de gravar e deixaria a pessoa anônima no feed.
   */
  if (!displayName) {
    return { alreadyHadAccount: false };
  }

  await prisma.$transaction([
    prisma.profile.update({
      where: { userId: member.user.id },
      data: { displayName },
    }),
    prisma.user.update({
      where: { id: member.user.id },
      data: { name: displayName },
    }),
  ]);
  return { alreadyHadAccount: false };
}
