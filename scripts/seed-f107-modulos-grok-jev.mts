/**
 * F107 — só os dois módulos raiz (Grok Bots + JEV). HML por padrão.
 *
 *   npx tsx scripts/seed-f107-modulos-grok-jev.mts
 *   npx tsx scripts/seed-f107-modulos-grok-jev.mts --target=prod --confirm
 */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env"), override: true });

type Target = "local" | "hml" | "prod";

const MODS = [
  {
    slug: "grok-bots-agentes-que-fazem-trabalho-por-voce",
    title: "Grok Bots — Agentes que fazem trabalho por você",
    description:
      "Agentes no Grok que executam tarefas de verdade: do setup ao fluxo rodando sem você no meio de cada passo.",
    sortOrder: 15,
  },
  {
    slug: "jev-aplicado-ao-mundo-real",
    title: "JEV aplicado ao mundo real",
    description:
      "JEV fora da teoria: como aplicar no dia a dia do builder — prospecção, entrega e operação com IA.",
    sortOrder: 16,
  },
] as const;

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

const argv = process.argv.slice(2);
const raw =
  argv.find((a) => a.startsWith("--target="))?.slice("--target=".length) ??
  "hml";
const target = raw as Target;
if (target !== "local" && target !== "hml" && target !== "prod") {
  throw new Error("Use --target=hml|local|prod");
}
if (target === "prod" && !argv.includes("--confirm")) {
  throw new Error("Produção exige --confirm");
}

const prisma = new PrismaClient({
  datasources: { db: { url: resolveUrl(target) } },
});

for (const m of MODS) {
  const row = await prisma.module.upsert({
    where: { slug: m.slug },
    create: {
      slug: m.slug,
      title: m.title,
      description: m.description,
      sortOrder: m.sortOrder,
      published: true,
      freeAccess: false,
      parentId: null,
    },
    update: {
      title: m.title,
      description: m.description,
      sortOrder: m.sortOrder,
      published: true,
    },
  });
  console.log(`[${target}] ${row.slug} published=${row.published} order=${row.sortOrder}`);
}

await prisma.$disconnect();
