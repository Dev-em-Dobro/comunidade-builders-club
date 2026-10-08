/**
 * F111 — primeira aula do Claude Code e ordem após Codex.
 *
 *   npx tsx scripts/seed-f111-claude-code-aula.mts --target=hml
 *   npx tsx scripts/seed-f111-claude-code-aula.mts --target=prod --confirm
 */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env"), override: true });

type Target = "local" | "hml" | "prod";
const target = (process.argv.find((arg) => arg.startsWith("--target="))?.slice(9) ?? "hml") as Target;
if (!["local", "hml", "prod"].includes(target)) {
  throw new Error("Use --target=hml|local|prod");
}
if (target === "prod" && !process.argv.includes("--confirm")) {
  throw new Error("Produção exige --confirm");
}

const url = {
  local: process.env.DATABASE_URL?.trim(),
  hml: process.env.DATABASE_URL_HML?.trim() || process.env.DATABASE_URL_STAGING?.trim(),
  prod: process.env.DATABASE_URL_PROD?.trim(),
}[target];
if (!url) throw new Error(`Env ausente para --target=${target}`);

const prisma = new PrismaClient({ datasources: { db: { url } } });
const videoId = "3ec9d2a0-d36f-4c43-b652-1d0e57f10f18";
const libraryId = "77c52f03-dc6";
const slug = "claude-code-na-ide";
const description =
  "Nessa aula você vai aprender a instalar e usar o Claude Code dentro da IDE para agilizar o desenvolvimento de projetos.\n\nO Claude Code requer um plano pago do Claude (Pro). Mesmo sem a assinatura, vale assistir: as técnicas de desenvolvimento e revisão mostradas aqui funcionam com outras IAs, inclusive gratuitas.\n\n[Guia da aula](https://comunidade-builders-club.devemdobro.com/presentes/inicio/inicio-2026-10-08)\n\n[Baixar material da aula (ZIP)](/materiais/claude-code-print-lp.zip)";

try {
  const result = await prisma.$transaction(async (db) => {
    for (const [moduleSlug, sortOrder] of [
      ["codex", 13],
      ["claude-code", 14],
      ["grok-bots-agentes-que-fazem-trabalho-por-voce", 15],
      ["jev-aplicado-ao-mundo-real", 16],
    ] as const) {
      await db.module.update({ where: { slug: moduleSlug }, data: { sortOrder } });
    }

    const module = await db.module.update({
      where: { slug: "claude-code" },
      data: {
        description: "Instale e use o Claude Code na IDE para desenvolver e revisar projetos com IA.",
        coverImageUrl: "/7-claude-code.webp",
        published: true,
        freeAccess: false,
      },
    });
    const lesson = await db.lesson.upsert({
      where: { moduleId_slug: { moduleId: module.id, slug } },
      create: {
        moduleId: module.id,
        slug,
        title: "Claude Code na IDE",
        description,
        pandaVideoExternalId: videoId,
        pandaLibraryId: libraryId,
        thumbnailUrl: `https://cdn.pandavideo.com/vz-${libraryId}/${videoId}/thumbnail.jpg`,
        sortOrder: 0,
        published: true,
      },
      update: {
        title: "Claude Code na IDE",
        description,
        pandaVideoExternalId: videoId,
        pandaLibraryId: libraryId,
        thumbnailUrl: `https://cdn.pandavideo.com/vz-${libraryId}/${videoId}/thumbnail.jpg`,
        sortOrder: 0,
        published: true,
      },
    });
    return { module, lesson };
  });
  console.log(
    `[${target}] ${result.module.slug} order=${result.module.sortOrder} cover=${result.module.coverImageUrl} lesson=${result.lesson.slug} published=${result.lesson.published}`,
  );
} finally {
  await prisma.$disconnect();
}
