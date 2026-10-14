/**
 * F112 — primeira aula do Grok Bots (sai de Em breve).
 *
 *   npx tsx scripts/seed-f112-grok-aula.mts --target=hml
 *   npx tsx scripts/seed-f112-grok-aula.mts --target=prod --confirm
 */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env"), override: true });

const videoId = "b1661728-611f-4519-9484-9ce269163dcf";
const libraryId = "77c52f03-dc6";
const slug = "grok-bots-na-pratica";
const description =
  "Nessa aula a gente monta ao vivo o Emaildo – Recepção: um bot do Grok Bot que lê a caixa de e-mail de uma clínica fictícia, etiqueta cada mensagem e deixa a resposta em rascunho usando só o FAQ. Quem revisa e envia é uma pessoa.\n\nVocê vê criar o bot do zero e com o dr eggbot, escrever instruções com anti-jobs (o que o bot não faz), conectar o Gmail, criar rotina, salvar skill, colocar um segundo bot pra revisar o primeiro e os cuidados de segurança — com os tropeços reais junto.\n\nA regra da aula inteira: o bot propõe e rascunha, e a pessoa aprova.\n\n## Material\n- [Baixar material da aula (PDF)](/materiais/grok-bots-na-pratica.pdf) — capítulos, prompts e o FAQ da clínica fictícia\n- [Baixar o Grok Bot](https://x.ai/bot)";

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
    const module = await db.module.update({
      where: { slug: "grok-bots-agentes-que-fazem-trabalho-por-voce" },
      data: {
        description:
          "Agentes no Grok que executam tarefas de verdade: do setup ao fluxo rodando sem você no meio de cada passo.",
        coverImageUrl: "/8-grok-bots.png",
        published: true,
        freeAccess: false,
        sortOrder: 15,
      },
    });

    const lesson = await db.lesson.upsert({
      where: { moduleId_slug: { moduleId: module.id, slug } },
      create: {
        moduleId: module.id,
        slug,
        title: "Grok Bots na prática",
        description,
        pandaVideoExternalId: videoId,
        pandaLibraryId: libraryId,
        thumbnailUrl: `https://cdn.pandavideo.com/vz-${libraryId}/${videoId}/thumbnail.jpg`,
        sortOrder: 0,
        published: true,
      },
      update: {
        title: "Grok Bots na prática",
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
