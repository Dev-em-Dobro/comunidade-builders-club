/**
 * F113 — aula 2 do Claude Code (Claude Code na prática).
 *
 *   npx tsx scripts/seed-f113-claude-code-aula-2.mts --target=hml
 *   npx tsx scripts/seed-f113-claude-code-aula-2.mts --target=prod --confirm
 */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env"), override: true });

const videoId = "600db079-fa56-4434-88ef-2be1f6a99e19";
const libraryId = "77c52f03-dc6";
const slug = "claude-code-na-pratica";
const description =
  "Aprenda a transformar o Claude Code em um parceiro de desenvolvimento mais estratégico. Nesta aula, vamos melhorar nossa base no uso do Claude Code, aprofundar o CLAUDE.md, a pasta .claude e o Plan Mode para planejar melhor, reduzir retrabalho e criar projetos com mais velocidade e consistência.\n\n## Materiais\n- [Baixar projeto da aula (ZIP)](/materiais/claude-code-na-pratica-aula-2.zip)\n- [Baixar tutorial da aula (PDF)](/materiais/tutorial-aula-2-claude-code.pdf)";

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
        title: "Claude Code na prática",
        description,
        pandaVideoExternalId: videoId,
        pandaLibraryId: libraryId,
        thumbnailUrl: `https://cdn.pandavideo.com/vz-${libraryId}/${videoId}/thumbnail.jpg`,
        sortOrder: 1,
        published: true,
      },
      update: {
        title: "Claude Code na prática",
        description,
        pandaVideoExternalId: videoId,
        pandaLibraryId: libraryId,
        thumbnailUrl: `https://cdn.pandavideo.com/vz-${libraryId}/${videoId}/thumbnail.jpg`,
        sortOrder: 1,
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
