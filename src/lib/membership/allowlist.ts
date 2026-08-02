import { prisma } from "@/lib/db";

export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function isEmailAllowed(email: string): Promise<boolean> {
  const row = await prisma.allowedEmail.findUnique({
    where: { email: normalizarEmail(email) },
  });
  return !!row;
}

export async function addAllowedEmail(opts: {
  email: string;
  source?: string;
  note?: string | null;
}) {
  const email = normalizarEmail(opts.email);
  return prisma.allowedEmail.upsert({
    where: { email },
    create: {
      email,
      source: opts.source ?? "manual",
      note: opts.note ?? null,
    },
    update: {
      ...(opts.source ? { source: opts.source } : {}),
      ...(opts.note !== undefined ? { note: opts.note } : {}),
    },
  });
}

export async function listAllowedEmails() {
  return prisma.allowedEmail.findMany({ orderBy: { createdAt: "desc" } });
}

export async function removeAllowedEmail(email: string) {
  return prisma.allowedEmail.delete({
    where: { email: normalizarEmail(email) },
  });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Parse lista colada (linha, vírgula ou ponto-e-vírgula). */
export function parseEmailBulk(raw: string): string[] {
  const parts = raw
    .split(/[\n,;]+/)
    .map((s) => normalizarEmail(s))
    .filter(Boolean);
  return [...new Set(parts)];
}

export async function addAllowedEmailsBulk(
  raw: string,
  source = "admin-bulk",
): Promise<{
  added: number;
  existing: number;
  invalid: string[];
}> {
  const emails = parseEmailBulk(raw);
  const invalid: string[] = [];
  const valid: string[] = [];
  for (const e of emails) {
    if (EMAIL_RE.test(e)) valid.push(e);
    else invalid.push(e);
  }

  let added = 0;
  let existing = 0;
  for (const email of valid) {
    const before = await prisma.allowedEmail.findUnique({ where: { email } });
    await addAllowedEmail({ email, source });
    if (before) existing += 1;
    else added += 1;
  }
  return { added, existing, invalid };
}
