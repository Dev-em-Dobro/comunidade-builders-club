import { Prisma, PrismaClient } from "@prisma/client";

type OrionCsRow = { email: string; at: Date };

const globalForOrion = globalThis as unknown as {
  orionCsPrisma?: PrismaClient;
};

function orionUrl(): string | null {
  const v = process.env.ORION_DATABASE_URL?.trim();
  return v || null;
}

function orionClient(): PrismaClient | null {
  const url = orionUrl();
  if (!url) return null;
  if (!globalForOrion.orionCsPrisma) {
    globalForOrion.orionCsPrisma = new PrismaClient({
      datasources: { db: { url } },
      log: ["error"],
    });
  }
  return globalForOrion.orionCsPrisma;
}

export function orionCsConfigured(): boolean {
  return orionUrl() !== null;
}

function norm(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Primeira coleta (Lead criado) por e-mail. Banco Orion, só leitura.
 */
export async function firstLeadAtByEmail(
  emails: string[],
): Promise<Map<string, Date>> {
  const unique = [...new Set(emails.map(norm).filter((e) => e.includes("@")))];
  const out = new Map<string, Date>();
  const client = orionClient();
  if (!client || unique.length === 0) return out;

  const rows = await client.$queryRaw<OrionCsRow[]>`
    SELECT lower(trim(u.email)) AS email, MIN(l.created_at) AS at
    FROM "user" u
    INNER JOIN lead l ON l.user_id = u.id
    WHERE lower(trim(u.email)) IN (${Prisma.join(unique)})
    GROUP BY 1
  `;
  for (const row of rows) {
    out.set(norm(row.email), new Date(row.at));
  }
  return out;
}

/**
 * Alunos com Lead marcado `proposta` na janela [start, end).
 */
export async function proposalEmailsInRange(
  emails: string[],
  start: Date,
  endExclusive: Date,
): Promise<Set<string>> {
  const unique = [...new Set(emails.map(norm).filter((e) => e.includes("@")))];
  const out = new Set<string>();
  const client = orionClient();
  if (!client || unique.length === 0) return out;

  const rows = await client.$queryRaw<Array<{ email: string }>>`
    SELECT DISTINCT lower(trim(u.email)) AS email
    FROM "user" u
    INNER JOIN lead l ON l.user_id = u.id
    WHERE l.status = 'proposta'
      AND l.status_em >= ${start}
      AND l.status_em < ${endExclusive}
      AND lower(trim(u.email)) IN (${Prisma.join(unique)})
  `;
  for (const row of rows) out.add(norm(row.email));
  return out;
}
