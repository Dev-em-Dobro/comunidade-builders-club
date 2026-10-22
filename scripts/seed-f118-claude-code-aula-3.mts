/**
 * F118 — aula 3 do Claude Code (gerador de orçamentos).
 *
 *   npx tsx scripts/seed-f118-claude-code-aula-3.mts --target=hml
 *   npx tsx scripts/seed-f118-claude-code-aula-3.mts --target=prod --confirm
 */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env"), override: true });

const videoId = "7f45c2b4-ae66-47d3-974f-cd232eecaccf";
const libraryId = "77c52f03-dc6";
const slug = "claude-code-na-pratica-aula-3";
const description =
  "Nesta aula a gente sai do plano e constrói, com Claude Code, um gerador de orçamentos e propostas por link: briefing, faixas de preço, aprovação do valor e página pública para o cliente pagar.\n\nVocê acompanha o PLANO.md virando um app Next.js + Supabase, os erros reais no caminho e o deploy.\n\n## Materiais\n- [Baixar projeto da aula (ZIP)](/materiais/claude-code-na-pratica-aula-3.zip)";

type Target = "local" | "hml" | "prod";
const target = (process.argv.find((arg) => arg.startsWith("--target="))?.slice(9) ??
  "hml") as Target;
if (!["local", "hml", "prod"].includes(target)) {
  throw new Error("Use --target=hml|local|prod");
}
if (target === "prod" && !process.argv.includes("--confirm")) {
  throw new Error("Produção exige --confirm");
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
  const result = await prisma.$transaction(async (db) => {
    const module = await db.module.findUniqueOrThrow({
      where: { slug: "claude-code" },
    });

    const lesson = await db.lesson.upsert({
      where: { moduleId_slug: { moduleId: module.id, slug } },
      create: {
        moduleId: module.id,
        slug,
        title: "Claude Code na prática: gerador de orçamentos",
        description,
        pandaVideoExternalId: videoId,
        pandaLibraryId: libraryId,
        thumbnailUrl: `https://cdn.pandavideo.com/vz-${libraryId}/${videoId}/thumbnail.jpg`,
        sortOrder: 2,
        published: true,
      },
      update: {
        title: "Claude Code na prática: gerador de orçamentos",
        description,
        pandaVideoExternalId: videoId,
        pandaLibraryId: libraryId,
        thumbnailUrl: `https://cdn.pandavideo.com/vz-${libraryId}/${videoId}/thumbnail.jpg`,
        sortOrder: 2,
        published: true,
      },
    });
    return { module, lesson };
  });
  console.log(
    `[${target}] ${result.module.slug} lesson=${result.lesson.slug} sort=${result.lesson.sortOrder} published=${result.lesson.published}`,
  );
} finally {
  await prisma.$disconnect();
}
