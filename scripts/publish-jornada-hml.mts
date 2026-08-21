/**
 * Publica a jornada Fase 1 e Fase 2 só no HML (preview da aba Aulas).
 *
 *   npx tsx scripts/publish-jornada-hml.mts
 *   npx tsx scripts/publish-jornada-hml.mts --target=prod --confirm
 */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env"), override: true });

type Target = "local" | "hml" | "prod";

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

const roots = await prisma.module.findMany({
  where: {
    parentId: null,
    slug: { in: ["fase-1-do-zero-ao-primeiro-sim", "fase-2-entregar-e-ligar-a-recorrencia"] },
  },
  select: { id: true, slug: true },
});
if (roots.length === 0) {
  throw new Error("Jornada não encontrada");
}

const ids = new Set(roots.map((r) => r.id));
let frontier = [...ids];
while (frontier.length) {
  const children = await prisma.module.findMany({
    where: { parentId: { in: frontier } },
    select: { id: true },
  });
  const next: string[] = [];
  for (const child of children) {
    if (!ids.has(child.id)) {
      ids.add(child.id);
      next.push(child.id);
    }
  }
  frontier = next;
}

const moduleIds = [...ids];
const mod = await prisma.module.updateMany({
  where: { id: { in: moduleIds } },
  data: { published: true },
});
const les = await prisma.lesson.updateMany({
  where: { moduleId: { in: moduleIds } },
  data: { published: true },
});

await prisma.$disconnect();
console.log(
  `[${target}] publicados ${mod.count} módulos e ${les.count} aulas da jornada`,
);
