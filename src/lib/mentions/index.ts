import { prisma } from "@/lib/db";

const MENTION_RE = /@([\p{L}\p{N}_.\-]{2,64})/gu;

export function extractMentionTokens(body: string): string[] {
  const tokens = new Set<string>();
  let m: RegExpExecArray | null;
  const re = new RegExp(MENTION_RE.source, MENTION_RE.flags);
  while ((m = re.exec(body)) !== null) {
    tokens.add(m[1]!.toLowerCase());
  }
  return [...tokens];
}

/** Resolve @tokens para userIds de membros active (por displayName). */
export async function resolveMentionedUserIds(
  body: string,
  excludeUserId?: string,
): Promise<string[]> {
  const tokens = extractMentionTokens(body);
  if (tokens.length === 0) return [];

  const profiles = await prisma.profile.findMany({
    where: {
      OR: tokens.map((t) => ({
        displayName: { equals: t, mode: "insensitive" as const },
      })),
      user: { membership: { status: "active" } },
    },
    select: { userId: true, displayName: true },
  });

  const ids = new Set<string>();
  for (const p of profiles) {
    if (excludeUserId && p.userId === excludeUserId) continue;
    ids.add(p.userId);
  }
  return [...ids];
}
