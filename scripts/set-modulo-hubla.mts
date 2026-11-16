/**
 * F126 — vincula um produto Hubla a um módulo (aula avulsa / low ticket).
 *
 *   npx tsx scripts/set-modulo-hubla.mts --modulo=criando-um-site-premium --produto=vqojJ9ApO57mLqLA1LYT
 *   npx tsx scripts/set-modulo-hubla.mts --modulo=... --produto=... --target=prod --confirm
 *
 * `--produto=` vazio remove o vínculo.
 */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env"), override: true });

function arg(name: string): string | undefined {
  return process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
}

type Target = "local" | "hml" | "prod";
const target = (arg("target") ?? "hml") as Target;
if (!["local", "hml", "prod"].includes(target)) {
  throw new Error("Use --target=hml|local|prod");
}
if (target === "prod" && !process.argv.includes("--confirm")) {
  throw new Error("Produção exige --confirm");
}

const moduloSlug = arg("modulo")?.trim();
const produto = arg("produto");
if (!moduloSlug || produto === undefined) {
  throw new Error("Use --modulo=<slug> --produto=<id Hubla>");
}

const url = {
  local: process.env.DATABASE_URL?.trim(),
  hml:
    process.env.DATABASE_URL_HML?.trim() ||
    process.env.DATABASE_URL_STAGING?.trim(),
  prod: process.env.DATABASE_URL_PROD?.trim(),
}[target];
if (!url) throw new Error(`Env ausente para --target=${target}`);

const prisma = new PrismaClient({ datasources: { db: { url } } });

try {
  const modulo = await prisma.module.update({
    where: { slug: moduloSlug },
    data: { hublaProductId: produto.trim() || null },
    select: { slug: true, title: true, hublaProductId: true },
  });
  console.log(`[${target}]`, modulo);
} finally {
  await prisma.$disconnect();
}
