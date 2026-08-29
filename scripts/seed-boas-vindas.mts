/**
 * Upsert do space Boas-vindas (F023) em HML ou prod.
 *
 *   npm run db:seed:boas-vindas -- --target=hml
 *   npm run db:seed:boas-vindas -- --target=prod --confirm
 */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

config({ path: ".env" });
config({ path: ".env.local" });

const target = process.argv.includes("--target=prod")
  ? "prod"
  : process.argv.includes("--target=hml")
    ? "hml"
    : null;

if (!target) {
  console.error("Use --target=hml ou --target=prod");
  process.exit(1);
}

if (target === "prod" && !process.argv.includes("--confirm")) {
  console.error("Prod exige --confirm");
  process.exit(1);
}

const url =
  target === "prod"
    ? process.env.DATABASE_URL_PROD?.trim() || process.env.DATABASE_URL?.trim()
    : process.env.DATABASE_URL_HML?.trim() ||
      process.env.DATABASE_URL_STAGING?.trim() ||
      process.env.DATABASE_URL?.trim();

if (!url) {
  console.error("DATABASE_URL_HML / DATABASE_URL_PROD (ou DATABASE_URL) ausente");
  process.exit(1);
}

process.env.DATABASE_URL = url;
const prisma = new PrismaClient();

async function main() {
  const space = await prisma.space.upsert({
    where: { slug: "boas-vindas" },
    create: {
      slug: "boas-vindas",
      name: "Boas-vindas",
        description: "Tutorial e o passo a passo do primeiro dia",
      sortOrder: 0,
    },
    update: {
      name: "Boas-vindas",
        description: "Tutorial e o passo a passo do primeiro dia",
      sortOrder: 0,
    },
  });

  // Empurra os outros spaces para baixo se ainda estiverem em 0..n antigos.
  const others = await prisma.space.findMany({
    where: { slug: { not: "boas-vindas" } },
    orderBy: { sortOrder: "asc" },
  });
  let order = 1;
  for (const s of others) {
    if (s.sortOrder !== order) {
      await prisma.space.update({
        where: { id: s.id },
        data: { sortOrder: order },
      });
    }
    order++;
  }

  console.log(`OK [${target}] space ${space.slug} id=${space.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
