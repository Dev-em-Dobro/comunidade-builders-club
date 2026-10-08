/**
 * F110 — primeira aula do Codex (sai de Em breve).
 *
 *   npx tsx scripts/seed-f110-codex-aula.mts --target=hml
 *   npx tsx scripts/seed-f110-codex-aula.mts --target=prod --confirm
 */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env"), override: true });

const PANDA_LIBRARY = "77c52f03-dc6";
const EXTERNAL_ID = "64ee35dc-5959-4d63-b8c2-b8f711da86da";
const SLUG = "codex-do-zero-chatgpt-desktop";
const TITLE = "Codex do zero (ChatGPT Desktop)";
const DESCRIPTION =
  "Do zero no Codex pelo ChatGPT Desktop: instalar o app, entender o fluxo do agente da OpenAI e começar o primeiro projeto — AGENTS.md, plugins e o uso no dia a dia.";

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

const module = await prisma.module.update({
  where: { slug: "codex" },
  data: {
    description:
      "Agente da OpenAI: instalação, AGENTS.md, plugins e uso no dia a dia.",
    coverImageUrl: "/6-codex.png",
  },
});

const existing = await prisma.lesson.findUnique({
  where: { moduleId_slug: { moduleId: module.id, slug: SLUG } },
});

const lessonData = {
  title: TITLE,
  description: DESCRIPTION,
  pandaVideoExternalId: EXTERNAL_ID,
  pandaLibraryId: PANDA_LIBRARY,
  thumbnailUrl: `https://cdn.pandavideo.com/vz-${PANDA_LIBRARY}/${EXTERNAL_ID}/thumbnail.jpg`,
  sortOrder: 0,
  published: true,
};

const lesson = existing
  ? await prisma.lesson.update({
      where: { id: existing.id },
      data: lessonData,
    })
  : await prisma.lesson.create({
      data: {
        moduleId: module.id,
        slug: SLUG,
        ...lessonData,
      },
    });

await prisma.$disconnect();
console.log(
  `[${target}] ${module.slug} cover=${module.coverImageUrl} lesson=${lesson.slug} published=${lesson.published}`,
);
