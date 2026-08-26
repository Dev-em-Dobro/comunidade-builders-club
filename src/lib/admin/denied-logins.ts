import { prisma } from "@/lib/db";
import { isEmailAllowed, normalizarEmail } from "@/lib/membership/allowlist";

export const DENIED_LOGIN_WINDOW_DAYS = 14;
export const DENIED_LOGIN_APP = "club";

const DEDUPE_MS = 30_000;
const ALLOWLIST_WITHOUT_USER_CAP = 100;

export function emailLocalPart(email: string): string {
  const at = email.indexOf("@");
  return at <= 0 ? "" : email.slice(0, at).toLowerCase();
}

export function possiblePurchaseEmails(
  typedEmail: string,
  allowlistWithoutUser: readonly { email: string }[],
): string[] {
  const local = emailLocalPart(typedEmail);
  if (local.length < 3) return [];
  return allowlistWithoutUser
    .filter((row) => row.email !== typedEmail && emailLocalPart(row.email) === local)
    .map((row) => row.email);
}

/** Magic link / 1º login: grava se o e-mail não está na allowlist. Nunca lança. */
export async function recordDeniedLoginIfUnauthorized(email: string): Promise<void> {
  try {
    const normalized = normalizarEmail(email);
    if (!normalized.includes("@")) return;
    if (await isEmailAllowed(normalized)) return;

    const recent = await prisma.deniedLoginAttempt.findFirst({
      where: {
        email: normalized,
        createdAt: { gte: new Date(Date.now() - DEDUPE_MS) },
      },
      select: { id: true },
    });
    if (recent) return;

    await prisma.deniedLoginAttempt.create({
      data: { email: normalized, app: DENIED_LOGIN_APP },
    });
  } catch (err) {
    console.error("[F054] falha ao gravar tentativa de login", err);
  }
}

export async function markDeniedLoginsResolved(email: string): Promise<void> {
  const normalized = normalizarEmail(email);
  await prisma.deniedLoginAttempt.updateMany({
    where: { email: normalized, resolvedAt: null },
    data: { resolvedAt: new Date() },
  });
}

export type DeniedLoginGroup = {
  email: string;
  count: number;
  firstAt: Date;
  lastAt: Date;
  unresolved: boolean;
  hasUser: boolean;
  userTier: string | null;
  alreadyAllowed: boolean;
  possiblePurchases: string[];
};

export type AllowlistWithoutUserRow = {
  email: string;
  source: string;
  createdAt: Date;
};

export async function listAllowlistWithoutUser(
  cap = ALLOWLIST_WITHOUT_USER_CAP,
): Promise<AllowlistWithoutUserRow[]> {
  const rows = await prisma.allowedEmail.findMany({
    orderBy: { createdAt: "desc" },
    take: cap * 3,
    select: { email: true, source: true, createdAt: true },
  });
  if (rows.length === 0) return [];

  const users = await prisma.user.findMany({
    where: { email: { in: rows.map((r) => r.email) } },
    select: { email: true },
  });
  const hasUser = new Set(users.map((u) => u.email));
  return rows.filter((r) => !hasUser.has(r.email)).slice(0, cap);
}

export async function listDeniedLoginGroups(): Promise<DeniedLoginGroup[]> {
  const since = new Date(
    Date.now() - DENIED_LOGIN_WINDOW_DAYS * 24 * 60 * 60 * 1000,
  );
  const attempts = await prisma.deniedLoginAttempt.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
  });

  const allowlistWithoutUser = await listAllowlistWithoutUser();

  const byEmail = new Map<
    string,
    { count: number; firstAt: Date; lastAt: Date; unresolved: boolean }
  >();
  for (const row of attempts) {
    const prev = byEmail.get(row.email);
    if (!prev) {
      byEmail.set(row.email, {
        count: 1,
        firstAt: row.createdAt,
        lastAt: row.createdAt,
        unresolved: row.resolvedAt == null,
      });
      continue;
    }
    prev.count += 1;
    if (row.createdAt < prev.firstAt) prev.firstAt = row.createdAt;
    if (row.createdAt > prev.lastAt) prev.lastAt = row.createdAt;
    if (row.resolvedAt == null) prev.unresolved = true;
  }

  const emails = [...byEmail.keys()];
  if (emails.length === 0) {
    return [];
  }

  const [users, allowed] = await Promise.all([
    prisma.user.findMany({
      where: { email: { in: emails } },
      select: { email: true, membership: { select: { tier: true } } },
    }),
    prisma.allowedEmail.findMany({
      where: { email: { in: emails } },
      select: { email: true },
    }),
  ]);
  const userByEmail = new Map(users.map((u) => [u.email, u]));
  const allowedSet = new Set(allowed.map((a) => a.email));

  const groups: DeniedLoginGroup[] = emails.map((email) => {
    const agg = byEmail.get(email)!;
    const user = userByEmail.get(email);
    return {
      email,
      count: agg.count,
      firstAt: agg.firstAt,
      lastAt: agg.lastAt,
      unresolved: agg.unresolved,
      hasUser: Boolean(user),
      userTier: user?.membership?.tier ?? null,
      alreadyAllowed: allowedSet.has(email),
      possiblePurchases: possiblePurchaseEmails(email, allowlistWithoutUser),
    };
  });

  groups.sort((a, b) => {
    if (a.unresolved !== b.unresolved) return a.unresolved ? -1 : 1;
    return b.lastAt.getTime() - a.lastAt.getTime();
  });
  return groups;
}
