/**
 * F055 — um card "Primeiros passos"; apaga o mural antigo.
 *
 *   npm run db:seed:welcome-cards -- --target=hml
 *   npm run db:seed:welcome-cards -- --target=prod --confirm
 */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env"), override: true });
config({ path: resolve(root, ".env.local"), override: true });

type Card = {
  marker: string;
  title: string;
  body: string;
  /** Ordem: 0 = hero, depois cards na grade */
  sort: number;
};

/** F055 — mural antigo. A tela não usa mais estes posts. */
const RETIRED_MARKERS = [
  "builders-club://boas-vindas/hero-v1",
  "builders-club://boas-vindas/como-usar-v1",
  "builders-club://boas-vindas/spaces-v1",
  "builders-club://boas-vindas/engajamento-v1",
  "builders-club://boas-vindas/materiais-aulas-v1",
];

const CARDS: Card[] = [
  {
    marker: "builders-club://boas-vindas/primeiros-passos-v1",
    sort: 0,
    title: "Primeiros passos",
    body: `Trilha do primeiro dia (a tela de Boas-vindas já mostra isto ao lado do vídeo):

1. Completar o **perfil**
2. Assistir as **aulas** (a primeira é o tutorial da comunidade)
3. Postar na comunidade quando tiver **dúvida** ou **conquista**`,
  },
];

type Target = "hml" | "prod" | "local";

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

function mask(url: string) {
  return url.replace(/:([^:@/]+)@/, ":****@");
}

async function resolveAuthor(prisma: PrismaClient) {
  const adminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const author =
    (adminEmail
      ? await prisma.user.findUnique({ where: { email: adminEmail } })
      : null) ??
    (
      await prisma.membership.findFirst({
        where: { role: "admin", status: "active" },
        include: { user: true },
      })
    )?.user ??
    (
      await prisma.membership.findFirst({
        where: { status: "active" },
        include: { user: true },
        orderBy: { createdAt: "asc" },
      })
    )?.user;

  if (!author) {
    throw new Error(
      "Nenhum usuário ativo. Faça login uma vez e rode o seed de novo.",
    );
  }

  await prisma.membership.upsert({
    where: { userId: author.id },
    create: { userId: author.id, status: "active", role: "admin" },
    update: { status: "active", role: "admin" },
  });

  return author;
}

async function run(target: Target) {
  const url = resolveUrl(target);
  console.log(`→ ${target}: ${mask(url)}`);

  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    const space = await prisma.space.upsert({
      where: { slug: "boas-vindas" },
      create: {
        slug: "boas-vindas",
        name: "Boas-vindas",
        description: "Tutorial e os três passos do primeiro dia",
        sortOrder: 0,
      },
      update: {
        name: "Boas-vindas",
        description: "Tutorial e os três passos do primeiro dia",
        sortOrder: 0,
      },
    });

    const author = await resolveAuthor(prisma);
    console.log(`Autor: ${author.email}`);

    // Datas só para o card único ficar estável (createdAt + pinned).
    const base = Date.now();

    for (const card of CARDS) {
      const createdAt = new Date(base - card.sort * 60_000);
      const existing = await prisma.post.findFirst({
        where: { linkUrl: card.marker },
      });

      if (existing) {
        await prisma.post.update({
          where: { id: existing.id },
          data: {
            title: card.title,
            body: card.body,
            spaceId: space.id,
            authorId: author.id,
            pinnedAt: card.sort === 0 ? createdAt : null,
            createdAt,
            updatedAt: new Date(),
          },
        });
        console.log(`Atualizado: ${card.title} (${existing.id})`);
      } else {
        const created = await prisma.post.create({
          data: {
            title: card.title,
            body: card.body,
            spaceId: space.id,
            authorId: author.id,
            linkUrl: card.marker,
            pinnedAt: card.sort === 0 ? createdAt : null,
            createdAt,
          },
        });
        console.log(`Criado: ${card.title} (${created.id})`);
      }
    }

    const retired = await prisma.post.deleteMany({
      where: { linkUrl: { in: RETIRED_MARKERS } },
    });
    if (retired.count > 0) {
      console.log(`Removidos cards antigos: ${retired.count}`);
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
