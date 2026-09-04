import { prisma } from "@/lib/db";
import { LAST_SEEN_THROTTLE_MS } from "./regras";

/** Heartbeat no poll. Falha não sobe — o sininho continua. */
export async function touchLastSeen(userId: string, now = new Date()): Promise<void> {
  const cutoff = new Date(now.getTime() - LAST_SEEN_THROTTLE_MS);
  try {
    await prisma.profile.updateMany({
      where: {
        userId,
        OR: [{ lastSeenAt: null }, { lastSeenAt: { lte: cutoff } }],
      },
      data: { lastSeenAt: now },
    });
  } catch (err) {
    console.error("[F075] falha ao gravar lastSeenAt", err);
  }
}
