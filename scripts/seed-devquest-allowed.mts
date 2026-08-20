/**
 * F012 — Allowlist de compradores DevQuest (produto distinto do Builders Club).
 *
 * Adicionar compradores (sem alterar código / sem commit):
 *
 *   npm run db:seed:devquest -- --target=hml,prod --confirm \
 *     --email=aluno@exemplo.com,outro@exemplo.com \
 *     --product-id=0A91153455A
 *
 *   npm run db:seed:devquest -- --target=prod --confirm \
 *     --email=aluno@exemplo.com --name="Nome Completo" --product-id=5epPnsx4CawYQ1tzFERW
 *
 * source = "devquest"
 * note   = "productId=<id Hubla/TMB>; name=<nome>"
 */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env"), override: true });
config({ path: resolve(root, ".env.local"), override: true });

type Target = "local" | "hml" | "prod";

const SOURCE = "devquest";
const DEFAULT_PRODUCT_ID = "5epPnsx4CawYQ1tzFERW";

type Buyer = {
  productId: string;
  name: string;
  email: string;
};

function resolveUrl(target: Target): string {
  const map: Record<Target, string | undefined> = {
    local: process.env.DATABASE_URL?.trim(),
    hml:
      process.env.DATABASE_URL_HML?.trim() ||
      process.env.DATABASE_URL_STAGING?.trim(),
    prod: process.env.DATABASE_URL_PROD?.trim(),
  };
  const url = map[target];
  if (!url) throw new Error(`Env ausente para --target=${target}`);
  return url;
}

function maskUrl(url: string): string {
  return url.replace(/:([^:@/]+)@/, ":****@");
}

function parseTargets(argv: string[]): Target[] {
  const raw = argv
    .find((a) => a.startsWith("--target="))
    ?.slice("--target=".length);
  if (!raw) throw new Error("Use --target=hml|prod|local (ou hml,prod)");
  const parts = raw.split(",").map((p) => p.trim()) as Target[];
  for (const p of parts) {
    if (p !== "local" && p !== "hml" && p !== "prod") {
      throw new Error(`Target inválido: ${p}`);
    }
  }
  return parts;
}

function parseArg(argv: string[], key: string): string | undefined {
  const prefix = `${key}=`;
  const hit = argv.find((a) => a.startsWith(prefix));
  return hit?.slice(prefix.length).trim() || undefined;
}

function splitCsv(raw: string): string[] {
  return raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local
    .replace(/[._+-]+/g, " ")
    .replace(/\d+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function parseBuyers(argv: string[]): Buyer[] {
  const emailsRaw = parseArg(argv, "--email");
  if (!emailsRaw) {
    throw new Error(
      "Use --email=um@exemplo.com,outro@exemplo.com (lista separada por vírgula)",
    );
  }

  const productId = parseArg(argv, "--product-id") ?? DEFAULT_PRODUCT_ID;
  const names = splitCsv(parseArg(argv, "--name") ?? "");
  const emails = splitCsv(emailsRaw);

  if (emails.length === 0) {
    throw new Error("--email não pode ser vazio");
  }

  return emails.map((email, index) => ({
    productId,
    email: email.toLowerCase(),
    name: names[index]?.trim() || nameFromEmail(email),
  }));
}

async function seedTarget(target: Target, buyers: Buyer[]) {
  const dbUrl = resolveUrl(target);
  console.log(`\n→ ${target}: ${maskUrl(dbUrl)}`);

  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
  try {
    let created = 0;
    let updated = 0;
    let promoted = 0;
    let skippedRevoked = 0;

    for (const buyer of buyers) {
      const email = buyer.email.trim().toLowerCase();
      const note = `productId=${buyer.productId}; name=${buyer.name}`;
      const before = await prisma.allowedEmail.findUnique({ where: { email } });

      await prisma.allowedEmail.upsert({
        where: { email },
        create: { email, source: SOURCE, note },
        update: { source: SOURCE, note },
      });
      if (before) updated += 1;
      else created += 1;

      const user = await prisma.user.findUnique({
        where: { email },
        include: { membership: true },
      });
      if (!user?.membership) continue;
      if (user.membership.status === "revoked") {
        skippedRevoked += 1;
        console.log(`  skip revoked: ${email}`);
        continue;
      }
      if (
        user.membership.status !== "active" ||
        user.membership.tier !== "paid"
      ) {
        await prisma.membership.update({
          where: { userId: user.id },
          data: { status: "active", tier: "paid" },
        });
        promoted += 1;
        console.log(`  promoted paid: ${email}`);
      }
    }

    console.log(
      `${target}: ${buyers.length} compradores · ${created} novos · ${updated} atualizados · ${promoted} memberships promovidos · ${skippedRevoked} revoked ignorados`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const targets = parseTargets(argv);
  const buyers = parseBuyers(argv);

  if (targets.includes("prod") && !argv.includes("--confirm")) {
    throw new Error("Produção exige --confirm");
  }

  for (const buyer of buyers) {
    console.log(`· ${buyer.email} (${buyer.name}) · productId=${buyer.productId}`);
  }

  for (const target of targets) {
    await seedTarget(target, buyers);
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
