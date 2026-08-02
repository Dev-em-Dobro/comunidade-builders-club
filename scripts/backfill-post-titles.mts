/**
 * Backfill de titles vazios (F018).
 *   npx tsx scripts/backfill-post-titles.mts --target=hml
 *   npx tsx scripts/backfill-post-titles.mts --target=prod --confirm
 */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { titleFromBody } from "../src/lib/posts/title";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env"), override: true });

type Target = "hml" | "prod" | "local";

function urlFor(target: Target): string {
  const map = {
    local: process.env.DATABASE_URL,
    hml: process.env.DATABASE_URL_HML || process.env.DATABASE_URL_STAGING,
    prod: process.env.DATABASE_URL_PROD,
  };
  const url = map[target]?.trim();
  if (!url) throw new Error(`Env ausente: ${target}`);
  return url;
}

async function main() {
  const argv = process.argv.slice(2);
  const target = argv
    .find((a) => a.startsWith("--target="))
    ?.slice("--target=".length) as Target | undefined;
  if (!target || !["hml", "prod", "local"].includes(target)) {
    throw new Error("--target=hml|prod|local");
  }
  if (target === "prod" && !argv.includes("--confirm")) {
    throw new Error("prod exige --confirm");
  }

  const prisma = new PrismaClient({
    datasources: { db: { url: urlFor(target) } },
  });
  try {
    const posts = await prisma.post.findMany({
      where: { title: "" },
      select: { id: true, body: true },
    });
    for (const p of posts) {
      await prisma.post.update({
        where: { id: p.id },
        data: { title: titleFromBody(p.body) },
      });
    }
    console.log(`[${target}] titles backfilled: ${posts.length}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
