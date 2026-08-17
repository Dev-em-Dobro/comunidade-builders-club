/**
 * F012 — Allowlist de compradores DevQuest (produto distinto do Builders Club).
 *
 *   npm run db:seed:devquest -- --target=hml
 *   npm run db:seed:devquest -- --target=prod --confirm
 *   npm run db:seed:devquest -- --target=hml,prod --confirm
 *
 * source = "devquest"
 * note   = "productId=<id Hubla>; name=<nome>"
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

const BUYERS: Array<{
  productId: string;
  name: string;
  email: string;
}> = [
  {
    productId: "8aH4cEEPOG7WyF00GrJ5",
    name: "Ygor Andrade Langendorf",
    email: "frodnegnalrogy@gmail.com",
  },
  {
    productId: "5epPnsx4CawYQ1tzFERW",
    name: "Vinicius Henrique Gazzin Fernandes",
    email: "viniciusgazzin@outlook.com",
  },
  {
    productId: "5epPnsx4CawYQ1tzFERW",
    name: "Pablo Da Silva Dutra",
    email: "pablodutrad@gmail.com",
  },
  {
    productId: "8aH4cEEPOG7WyF00GrJ5",
    name: "Daniel Vilasboas Magalhães Santos",
    email: "vmsdaniel@hotmail.com",
  },
  {
    productId: "5epPnsx4CawYQ1tzFERW",
    name: "Odlaor Arthur Augusto Almeida",
    email: "odlaor.augusto@gmail.com",
  },
  {
    productId: "5epPnsx4CawYQ1tzFERW",
    name: "Augusto Cezar de Boni",
    email: "gutoboni1@gmail.com",
  },
  {
    productId: "5epPnsx4CawYQ1tzFERW",
    name: "Pedro Henrique de Oliveira",
    email: "pedro.henrique.d3v@gmail.com",
  },
  {
    productId: "5epPnsx4CawYQ1tzFERW",
    name: "Luciano José Rodrigues socolowski",
    email: "luciano.1705@hotmail.com",
  },
  {
    productId: "5epPnsx4CawYQ1tzFERW",
    name: "Gyldson Rosa Fonseca",
    email: "gyldson14@gmail.com",
  },
  {
    productId: "5epPnsx4CawYQ1tzFERW",
    name: "Carlos Alberto Tavares Sagrado",
    email: "eldersagrado@gmail.com",
  },
  {
    productId: "8aH4cEEPOG7WyF00GrJ5",
    name: "Júlio Takeichi Carniello Murashima",
    email: "juliotakeichi@outlook.com",
  },
  {
    productId: "5epPnsx4CawYQ1tzFERW",
    name: "Matheus Ruis Dias Milan de Souza",
    email: "matheus.rdms@gmail.com",
  },
  {
    productId: "5epPnsx4CawYQ1tzFERW",
    name: "DANWESLEY DA SILVA KUKLA",
    email: "danwesleykukla@gmail.com",
  },
  {
    productId: "sgQzHMY32n6txMSFcVMg",
    name: "FRANCYANE RODRIGUES DOS SANTOS",
    email: "1993francy@gmail.com",
  },
  {
    productId: "5epPnsx4CawYQ1tzFERW",
    name: "Mateus Peres da Fonseca",
    email: "mateuspf11@gmail.com",
  },
];

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

async function seedTarget(target: Target) {
  const dbUrl = resolveUrl(target);
  console.log(`\n→ ${target}: ${maskUrl(dbUrl)}`);

  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
  try {
    let created = 0;
    let updated = 0;
    let promoted = 0;
    let skippedRevoked = 0;

    for (const buyer of BUYERS) {
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
      `${target}: ${BUYERS.length} compradores · ${created} novos · ${updated} atualizados · ${promoted} memberships promovidos · ${skippedRevoked} revoked ignorados`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const targets = parseTargets(argv);
  if (targets.includes("prod") && !argv.includes("--confirm")) {
    throw new Error("Produção exige --confirm");
  }
  for (const target of targets) {
    await seedTarget(target);
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
