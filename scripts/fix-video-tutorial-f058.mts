/**
 * F058 / F060 — acerta a aula "Como usar a comunidade": vídeo pago regravado
 * das Boas-vindas e descrição que diz de qual plano é o tour.
 *
 * O M01 é aberto no gratuito (F065), então quem é free também abre esta
 * aula — e vê um tour do Club inteiro. A descrição precisa dizer isso, ou a
 * pessoa procura no menu funcionalidade que o plano dela não tem.
 *
 *   npx tsx scripts/fix-video-tutorial-f058.mts --target=local
 *   npx tsx scripts/fix-video-tutorial-f058.mts --target=hml
 *   npx tsx scripts/fix-video-tutorial-f058.mts --target=prod --confirm
 *
 * Por que não `npm run db:seed:aulas-panda`: aquele seed reescreve título,
 * descrição e thumbnail de **todas** as aulas e módulos do catálogo, e o
 * admin edita esses textos pela UI. A descrição desta aula, aliás, já foi
 * reescrita à mão — o seed a jogaria fora. Este script mexe só na aula do
 * tutorial e **só se o valor ainda for o anterior conhecido**; vídeo e
 * descrição são avaliados em separado.
 *
 * A tela de Boas-vindas não precisa de script: ela lê
 * `WELCOME_TUTORIAL_VIDEO` do código a cada render.
 *
 * Idempotente: rodar de novo não faz nada.
 */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { WELCOME_TUTORIAL_VIDEO } from "../src/lib/spaces/constants.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env"), override: true });
config({ path: resolve(root, ".env.local"), override: true });

type Target = "local" | "hml" | "prod";

const MODULE_SLUG = "fase-1-m01-comece-por-aqui";
const LESSON_SLUG = "tutorial-intro-comunidade";
const PANDA_LIBRARY = "77c52f03-dc6";
/** Vídeo pago anterior (F058 antes de 31/08/2026). */
const VIDEO_ANTIGO = "d3b5019d-49b8-479e-a150-7ea654dc7cf6";
const VIDEO_NOVO = WELCOME_TUTORIAL_VIDEO.paidVideoExternalId;

/** Descrição anterior — não dizia de qual plano é a plataforma do tour. */
const DESC_ANTIGA =
  "Tutorial da plataforma: como usar o Feed, os Spaces, as Aulas e circular na comunidade. Este é o mesmo vídeo da tela de Boas-vindas para quem tem acesso completo.";
const DESC_NOVA =
  "Tour completo da plataforma: o Feed, os Spaces, as Aulas e como circular na comunidade. É o tutorial do Club completo — tudo o que aparece aqui está aberto nos planos PRO e Elite.";

function thumb(externalId: string) {
  return `https://cdn.pandavideo.com/vz-${PANDA_LIBRARY}/${externalId}/thumbnail.jpg`;
}

function resolveUrl(target: Target): string {
  const map: Record<Target, string | undefined> = {
    local: process.env.DATABASE_URL?.trim(),
    hml: process.env.DATABASE_URL_HML?.trim(),
    prod: process.env.DATABASE_URL_PROD?.trim(),
  };
  const url = map[target];
  if (!url) throw new Error(`Env ausente para --target=${target}`);
  return url;
}

function maskUrl(url: string): string {
  return url.replace(/:([^:@/]+)@/, ":****@");
}

async function main() {
  const argv = process.argv.slice(2);
  const raw = argv
    .find((a) => a.startsWith("--target="))
    ?.slice("--target=".length);
  if (!raw) throw new Error("Informe --target=local|hml|prod");
  const target = raw as Target;
  if (!["local", "hml", "prod"].includes(target)) {
    throw new Error(`Target inválido: ${target}`);
  }
  if (target === "prod" && !argv.includes("--confirm")) {
    throw new Error("Produção exige --confirm.");
  }

  const url = resolveUrl(target);
  console.log(`[${target}] ${maskUrl(url)}`);

  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    const modulo = await prisma.module.findUnique({
      where: { slug: MODULE_SLUG },
      select: { id: true },
    });
    if (!modulo) {
      console.log(`  ${MODULE_SLUG}: módulo não existe — nada a fazer`);
      return;
    }
    const lesson = await prisma.lesson.findUnique({
      where: { moduleId_slug: { moduleId: modulo.id, slug: LESSON_SLUG } },
      select: { id: true, pandaVideoExternalId: true, description: true },
    });
    if (!lesson) {
      console.log(`  ${LESSON_SLUG}: aula não existe — nada a fazer`);
      return;
    }

    /** Cada campo tem a sua guarda: um pode já estar feito e o outro não. */
    const data: {
      pandaVideoExternalId?: string;
      pandaLibraryId?: string;
      thumbnailUrl?: string;
      description?: string;
    } = {};

    const video = lesson.pandaVideoExternalId ?? "";
    if (video === VIDEO_NOVO) {
      console.log("  vídeo: já no novo");
    } else if (video !== VIDEO_ANTIGO) {
      console.log(
        `  vídeo: trocado à mão — NÃO alterado\n     atual: ${video || "(vazio)"}`,
      );
    } else {
      data.pandaVideoExternalId = VIDEO_NOVO;
      data.pandaLibraryId = PANDA_LIBRARY;
      data.thumbnailUrl = thumb(VIDEO_NOVO);
    }

    const desc = lesson.description?.trim() ?? "";
    if (desc === DESC_NOVA) {
      console.log("  descrição: já na nova");
    } else if (desc !== DESC_ANTIGA) {
      console.log(
        `  descrição: reescrita à mão — NÃO alterada\n     atual: ${desc || "(vazia)"}`,
      );
    } else {
      data.description = DESC_NOVA;
    }

    if (!Object.keys(data).length) {
      console.log(`  ${LESSON_SLUG}: nada a fazer`);
      return;
    }
    await prisma.lesson.update({ where: { id: lesson.id }, data });
    console.log(`  ${LESSON_SLUG}: atualizado (${Object.keys(data).join(", ")})`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
