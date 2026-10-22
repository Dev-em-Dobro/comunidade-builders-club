/**
 * F116 — módulo + aula "Criando um site premium".
 *
 *   npx tsx scripts/seed-f116-site-premium.mts --target=hml
 *   npx tsx scripts/seed-f116-site-premium.mts --target=prod --confirm
 */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env"), override: true });

const videoId = "15e6afe9-633e-4d15-b960-e81a426a4402";
const libraryId = "77c52f03-dc6";
const moduleSlug = "criando-um-site-premium";
const slug = "criando-um-site-premium";
const description =
  "Nesta aula você monta um site premium de relógio com animação no scroll e vídeo 3D: do mockup à página no navegador, controlando o filme pela rolagem.\n\nO guia passo a passo traz as etapas, os prompts para copiar e o que conferir antes de cada geração paga. O ZIP tem o site pronto para abrir e estudar.\n\n## Materiais\n- [Baixar guia passo a passo (PDF)](/materiais/guia-passo-a-passo-aluno.pdf)\n- [Baixar o site pronto (ZIP)](https://drive.google.com/uc?export=download&id=16N--KGFcfjbIYqKbO1nG4lOIIBpD24hX)";

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
    await db.module.update({
      where: { slug: "jev-aplicado-ao-mundo-real" },
      data: { sortOrder: 17 },
    });

    const module = await db.module.upsert({
      where: { slug: moduleSlug },
      create: {
        slug: moduleSlug,
        title: "Criando um site premium",
        description:
          "Projeto guiado: site premium de relógio com animação no scroll e vídeo 3D.",
        coverImageUrl: "/9-site-premium.png",
        published: true,
        freeAccess: false,
        sortOrder: 16,
        parentId: null,
      },
      update: {
        title: "Criando um site premium",
        description:
          "Projeto guiado: site premium de relógio com animação no scroll e vídeo 3D.",
        coverImageUrl: "/9-site-premium.png",
        published: true,
        freeAccess: false,
        sortOrder: 16,
      },
    });

    const lesson = await db.lesson.upsert({
      where: { moduleId_slug: { moduleId: module.id, slug } },
      create: {
        moduleId: module.id,
        slug,
        title: "Criando um site premium",
        description,
        pandaVideoExternalId: videoId,
        pandaLibraryId: libraryId,
        thumbnailUrl: `https://cdn.pandavideo.com/vz-${libraryId}/${videoId}/thumbnail.jpg`,
        sortOrder: 0,
        published: true,
      },
      update: {
        title: "Criando um site premium",
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
