/**
 * Aplica descrições do docx no Neon HML (não sobrescreve aulas fora do mapa).
 *   npx tsx scripts/apply-aulas-descricoes.mts --target=hml
 */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { AULA_DESCRICOES } from "./aulas-descricoes-data.mts";

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

for (const [key, text] of Object.entries(AULA_DESCRICOES)) {
  if (text.length > 12000) {
    throw new Error(`Descrição longa demais (${text.length}): ${key}`);
  }
}

const prisma = new PrismaClient({
  datasources: { db: { url: resolveUrl(target) } },
});

let ok = 0;
const missing: string[] = [];
try {
  for (const [key, description] of Object.entries(AULA_DESCRICOES)) {
    const slash = key.indexOf("/");
    const moduleSlug = key.slice(0, slash);
    const lessonSlug = key.slice(slash + 1);
    const lesson = await prisma.lesson.findFirst({
      where: { slug: lessonSlug, module: { slug: moduleSlug } },
      select: { id: true, title: true },
    });
    if (!lesson) {
      missing.push(key);
      continue;
    }
    await prisma.lesson.update({
      where: { id: lesson.id },
      data: { description },
    });
    ok += 1;
    console.log(`ok  ${key}  (${lesson.title}, ${description.length} chars)`);
  }
} finally {
  await prisma.$disconnect();
}

if (missing.length) {
  console.error("Não encontradas:", missing.join(", "));
  process.exit(1);
}
console.log(`\n${ok} descrições aplicadas em ${target}`);
