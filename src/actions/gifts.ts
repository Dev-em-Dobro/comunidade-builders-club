"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireActiveMember } from "@/lib/membership/require-member";

const schema = z.object({
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
});

export async function completarCadastroPresenteAction(raw: {
  firstName: string;
  lastName: string;
}): Promise<{ alreadyHadAccount: boolean }> {
  const { firstName, lastName } = schema.parse(raw);
  const member = await requireActiveMember();
  const isNew =
    Date.now() - member.membership.createdAt.getTime() < 2 * 60 * 1000;

  if (!isNew) {
    return { alreadyHadAccount: true };
  }

  const displayName = `${firstName} ${lastName}`.replace(/\s+/g, " ").trim();
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
