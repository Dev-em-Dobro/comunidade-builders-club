/**
 * Sincroniza módulo "Aulas" + lessons a partir da pasta Panda.
 *
 * Pasta: d5fa2de0-ae46-4967-be9c-41466511e796
 *
 *   npm run db:seed:aulas-panda -- --target=hml
 *   npm run db:seed:aulas-panda -- --target=prod --confirm
 */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env"), override: true });
config({ path: resolve(root, ".env.local"), override: true });

const PANDA_FOLDER_ID = "d5fa2de0-ae46-4967-be9c-41466511e796";
const MODULE_SLUG = "aulas";
const COVER = "/aulas/modulo-capa.png";

type Target = "hml" | "prod" | "local";

type PandaVideo = {
  title?: string;
  status?: string;
  video_external_id?: string;
  library_id?: string;
  pullzone_name?: string;
  thumbnail?: string;
  created_at?: string;
};

function resolveUrl(target: Target): string {
  const map: Record<Target, string | undefined> = {
    local: process.env.DATABASE_URL?.trim(),
    hml:
      process.env.DATABASE_URL_HML?.trim() ||
      process.env.DATABASE_URL_STAGING?.trim(),
    prod: process.env.DATABASE_URL_PROD?.trim() || process.env.DATABASE_URL?.trim(),
  };
  const url = map[target];
  if (!url) throw new Error(`Env ausente para --target=${target}`);
  return url;
}

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\.mp4$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function titleFromFile(name: string): string {
  const base = name.replace(/\.mp4$/i, "").replace(/[-_]+/g, " ").trim();
  const m = base.match(/^aula[\s-]*(\d+)/i);
  if (m) return `Aula ${m[1]}`;
  if (/extra/i.test(base)) return "Aula extra";
  return base.replace(/\b\w/g, (c) => c.toUpperCase()) || "Aula";
}

function pullzoneFromThumb(thumb?: string): string | null {
  if (!thumb) return null;
  const m = thumb.match(/\/vz-([a-z0-9-]+)\//i);
  return m?.[1] ?? null;
}

async function fetchPandaVideos(apiKey: string): Promise<PandaVideo[]> {
  const url = `https://api-v2.pandavideo.com.br/videos?folder_id=${PANDA_FOLDER_ID}&limit=50`;
  const res = await fetch(url, {
    headers: { Authorization: apiKey, Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Panda API ${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as { videos?: PandaVideo[] };
  return json.videos ?? [];
}

async function run(target: Target) {
  const apiKey = process.env.PANDA_VIDEO_API_KEY?.trim();
  if (!apiKey) throw new Error("PANDA_VIDEO_API_KEY ausente no .env");

  const dbUrl = resolveUrl(target);
  console.log(`→ ${target}: ${dbUrl.replace(/:([^:@/]+)@/, ":****@")}`);

  const videos = await fetchPandaVideos(apiKey);
  console.log(`Panda: ${videos.length} vídeo(s) na pasta`);

  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
  try {
    const mod = await prisma.module.upsert({
      where: { slug: MODULE_SLUG },
      create: {
        slug: MODULE_SLUG,
        title: "Aulas",
        description: "Conteúdo em vídeo da comunidade",
        coverImageUrl: COVER,
        sortOrder: 0,
        published: true,
      },
      update: {
        title: "Aulas",
        description: "Conteúdo em vídeo da comunidade",
        coverImageUrl: COVER,
        published: true,
      },
    });

    const sorted = [...videos].sort((a, b) =>
      String(a.title ?? "").localeCompare(String(b.title ?? ""), "pt-BR"),
    );

    let order = 0;
    for (const v of sorted) {
      const externalId = v.video_external_id?.trim();
      if (!externalId) {
        console.warn(`Pulando sem external_id: ${v.title}`);
        continue;
      }
      const pullzone =
        v.pullzone_name?.replace(/^vz-/, "") ||
        pullzoneFromThumb(v.thumbnail) ||
        null;
      if (!pullzone) {
        console.warn(`Pulando sem pullzone: ${v.title}`);
        continue;
      }

      const title = titleFromFile(v.title ?? `aula-${order + 1}`);
      const slug = slugify(v.title ?? `aula-${order + 1}`) || `aula-${order + 1}`;

      const existing = await prisma.lesson.findFirst({
        where: {
          moduleId: mod.id,
          pandaVideoExternalId: externalId,
        },
      });

      if (existing) {
        await prisma.lesson.update({
          where: { id: existing.id },
          data: {
            title,
            slug,
            pandaLibraryId: pullzone,
            thumbnailUrl: v.thumbnail ?? null,
            sortOrder: order,
            published: true,
          },
        });
        console.log(`Atualizado: ${title} [${v.status}]`);
      } else {
        await prisma.lesson.create({
          data: {
            moduleId: mod.id,
            title,
            slug,
            pandaVideoExternalId: externalId,
            pandaLibraryId: pullzone,
            thumbnailUrl: v.thumbnail ?? null,
            sortOrder: order,
            published: true,
          },
        });
        console.log(`Criado: ${title} [${v.status}]`);
      }
      order++;
    }
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const targetRaw = argv
    .find((a) => a.startsWith("--target="))
    ?.slice("--target=".length) as Target | undefined;
  if (!targetRaw || !["hml", "prod", "local"].includes(targetRaw)) {
    throw new Error("Use --target=hml|prod|local");
  }
  if (targetRaw === "prod" && !argv.includes("--confirm")) {
    throw new Error("Produção exige --confirm");
  }
  await run(targetRaw);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
