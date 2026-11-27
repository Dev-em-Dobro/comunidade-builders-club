import type { Prisma } from "@prisma/client";
import { prisma as db } from "@/lib/db";

type Activity = (tx: Prisma.TransactionClient) => Promise<boolean>;

export async function writeParticipantActivity(userId: string, activity: Activity) {
  return db.$transaction(async (tx) => {
    // Serializa gravações com a remoção do participante pela equipe.
    const rows = await tx.$queryRaw<{ userId: string }[]>`
      SELECT "userId" FROM "challenge_enrollment"
      WHERE "userId" = ${userId} AND "status" = 'aprovado'
      FOR UPDATE
    `;
    if (!rows.length) return false;
    return activity(tx);
  });
}
