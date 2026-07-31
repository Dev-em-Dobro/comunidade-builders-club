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
