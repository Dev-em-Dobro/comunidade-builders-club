/**
 * F012 — Importa e-mails pré-aprovados para AllowedEmail.
 *
 * Uso:
 *   npm run db:import-allowed -- --orion
 *   npm run db:import-allowed -- --orion --target=hml
 *   npm run db:import-allowed -- --csv=./emails.csv --target=local
 *
 * --target:
 *   local (default) → DATABASE_URL
 *   hml             → DATABASE_URL_HML
 *   prod            → DATABASE_URL_PROD (pede confirmação)
 *
 * --orion lê ORION_DATABASE_URL (HublaEntitlement ativo + purchaseVerifiedAt).
 */
import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { PrismaClient } from "@prisma/client";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env"), override: true });
config({ path: resolve(root, ".env.local"), override: true });

type Target = "local" | "hml" | "prod";

function parseArgs(argv: string[]) {
  let csv: string | undefined;
  let orion = false;
  let target: Target = "local";
  for (const a of argv) {
    if (a === "--orion") orion = true;
    else if (a.startsWith("--csv=")) csv = a.slice("--csv=".length);
    else if (a.startsWith("--target=")) {
      const t = a.slice("--target=".length) as Target;
      if (t !== "local" && t !== "hml" && t !== "prod") {
        throw new Error(`--target inválido: ${t}. Use local|hml|prod`);
      }
      target = t;
    }
  }
  return { csv, orion, target };
}

function resolveTargetUrl(target: Target): string {
  const map: Record<Target, string | undefined> = {
    local: process.env.DATABASE_URL?.trim(),
    hml: process.env.DATABASE_URL_HML?.trim(),
    prod: process.env.DATABASE_URL_PROD?.trim(),
  };
  const url = map[target];
  if (!url) {
    const envName =
      target === "local"
        ? "DATABASE_URL"
        : target === "hml"
          ? "DATABASE_URL_HML"
          : "DATABASE_URL_PROD";
    throw new Error(`Defina ${envName} no .env para --target=${target}`);
  }
  return url;
}

function maskUrl(url: string): string {
  return url.replace(/:([^:@/]+)@/, ":****@");
}

function normalizar(email: string): string {
  return email.trim().toLowerCase();
}

function emailsFromCsv(path: string): string[] {
  const raw = readFileSync(resolve(root, path), "utf8");
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const out: string[] = [];
  for (const line of lines) {
    const first = line.split(/[,;]/)[0]?.trim() ?? "";
    if (!first || first.toLowerCase() === "email") continue;
    if (first.includes("@")) out.push(normalizar(first));
  }
  return out;
}

async function emailsFromOrion(orionUrl: string): Promise<string[]> {
  const orion = new PrismaClient({
    datasources: { db: { url: orionUrl } },
  });
  try {
    const fromEntitlement = await orion.$queryRaw<Array<{ email: string }>>`
      SELECT DISTINCT lower(trim(email)) AS email
      FROM hubla_entitlement
      WHERE status = 'ativo'
        AND email IS NOT NULL
        AND trim(email) <> ''
    `;
    const fromUsers = await orion.$queryRaw<Array<{ email: string }>>`
      SELECT DISTINCT lower(trim(email)) AS email
      FROM "user"
      WHERE "purchaseVerifiedAt" IS NOT NULL
        AND email IS NOT NULL
        AND trim(email) <> ''
    `;
    return [
      ...fromEntitlement.map((r) => r.email),
      ...fromUsers.map((r) => r.email),
    ];
  } finally {
    await orion.$disconnect();
  }
}

async function upsertMany(
  prisma: PrismaClient,
  emails: string[],
  source: string,
) {
  const unique = [
    ...new Set(emails.map(normalizar).filter((e) => e.includes("@"))),
  ];
  let created = 0;
  let existing = 0;
  for (const email of unique) {
    const before = await prisma.allowedEmail.findUnique({ where: { email } });
    await prisma.allowedEmail.upsert({
      where: { email },
      create: { email, source },
      update: {},
    });
    if (before) existing += 1;
    else created += 1;
  }
  return { unique: unique.length, created, existing };
}

async function activatePendingAllowed(prisma: PrismaClient) {
  const pending = await prisma.membership.findMany({
    where: { status: "pending" },
    include: { user: true },
  });
  let activated = 0;
  for (const m of pending) {
    const email = normalizar(m.user.email);
    const allowed = await prisma.allowedEmail.findUnique({ where: { email } });
    if (!allowed) continue;
    await prisma.membership.update({
      where: { id: m.id },
      data: { status: "active" },
    });
    activated += 1;
  }
  return activated;
}

async function confirmProd(): Promise<boolean> {
  const rl = createInterface({ input, output });
  try {
    const answer = await rl.question(
      'ATENÇÃO: vai gravar em PRODUÇÃO. Digite "prod" para confirmar: ',
    );
    return answer.trim().toLowerCase() === "prod";
  } finally {
    rl.close();
  }
}

async function main() {
  const { csv, orion, target } = parseArgs(process.argv.slice(2));
  if (!csv && !orion) {
    console.error(
      "Informe --orion e/ou --csv=caminho.csv\nEx.: npm run db:import-allowed -- --orion --target=hml",
    );
    process.exit(1);
  }

  const targetUrl = resolveTargetUrl(target);
  console.log(`Destino (--target=${target}): ${maskUrl(targetUrl)}`);

  if (target === "prod") {
    const ok = await confirmProd();
    if (!ok) {
      console.error("Abortado.");
      process.exit(1);
    }
  }

  const prisma = new PrismaClient({
    datasources: { db: { url: targetUrl } },
  });

  try {
    // Garante que a tabela existe neste banco
    await prisma.$queryRaw`SELECT 1 FROM allowed_email LIMIT 1`;
  } catch {
    console.error(
      `Tabela allowed_email não existe em --target=${target}. Rode as migrations nesse banco antes.`,
    );
    await prisma.$disconnect();
    process.exit(1);
  }

  try {
    const batches: Array<{ emails: string[]; source: string }> = [];

    if (orion) {
      const url = process.env.ORION_DATABASE_URL?.trim();
      if (!url) {
        console.error("Defina ORION_DATABASE_URL no .env para --orion");
        process.exit(1);
      }
      console.log(`Lendo e-mails do Orion… (${maskUrl(url)})`);
      batches.push({ emails: await emailsFromOrion(url), source: "orion" });
    }

    if (csv) {
      console.log(`Lendo CSV ${csv}…`);
      batches.push({ emails: emailsFromCsv(csv), source: "csv" });
    }

    let totalCreated = 0;
    let totalExisting = 0;
    for (const b of batches) {
      const r = await upsertMany(prisma, b.emails, b.source);
      console.log(
        `[${b.source}] ${r.unique} e-mails · ${r.created} novos · ${r.existing} já existiam`,
      );
      totalCreated += r.created;
      totalExisting += r.existing;
    }

    const activated = await activatePendingAllowed(prisma);
    const finalCount = await prisma.allowedEmail.count();
    console.log(
      `Done. Novos: ${totalCreated}. Já existiam: ${totalExisting}. Pending→active: ${activated}. Total na allowlist deste banco: ${finalCount}.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
