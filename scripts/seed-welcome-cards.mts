/**
 * Cria/atualiza cards de orientação no space Boas-vindas (F024).
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

const CARDS: Card[] = [
  {
    marker: "builders-club://boas-vindas/hero-v1",
    sort: 0,
    title: "Bem-vindo ao Builders Club",
    body: `Seja bem-vindo(a) ao **Builders Club**, a comunidade pra quem quer construir e vender soluções com IA. Este espaço é o ponto de partida: leia os cards abaixo e comece pelo que fizer mais sentido agora.

**Dica:** o **Feed** (fora dos Spaces) mostra a timeline da comunidade. Os Spaces organizam as conversas por tema.`,
  },
  {
    marker: "builders-club://boas-vindas/primeiros-passos-v1",
    sort: 1,
    title: "Primeiros passos",
    body: `Comece assim:

1. Complete seu **Perfil** (nome de exibição — é o que aparece nas menções \`@Nome\`)
2. Leia o Feed e o space **Avisos**
3. Explore **Materiais de apoio** no menu
4. Publique sua primeira mensagem no space **Geral** ou **Dúvidas**

Se algo não abrir, confira se seu e-mail está na allowlist ou fale com o suporte do Builders Club.`,
  },
  {
    marker: "builders-club://boas-vindas/como-usar-v1",
    sort: 2,
    title: "Como usar a plataforma",
    body: `## Navegação

- **Feed** — timeline de todos os Spaces (exceto Boas-vindas)
- **Spaces** — Avisos, Geral, Dúvidas, Freelas, Conquistas, Projetos
- **Materiais de apoio** — entregáveis e kits
- **Aulas** — vídeos quando disponíveis
- **Notificações** — comentários, reações e menções

## Publicar

Use o botão flutuante **Nova publicação** (nas páginas de Spaces), escolha o space e escreva. Markdown básico funciona (\`**negrito**\`, listas, links).

## Visões do Feed

No Feed você pode alternar entre visão **reduzida** (cards compactos) e **expandida** (post completo na lista).`,
  },
  {
    marker: "builders-club://boas-vindas/spaces-v1",
    sort: 3,
    title: "Para que serve cada Space",
    body: `- **Avisos** — comunicados oficiais
- **Geral** — papo do dia a dia
- **Dúvidas** — perguntas técnicas e de carreira
- **Freelas** — oportunidades entre a comunidade
- **Conquistas** — celebre vitórias
- **Projetos** — mostre o que está construindo

Prospecção de clientes e hunting de vagas fica no **Orion Lead Hunter** — não use a comunidade como board de vagas.`,
  },
  {
    marker: "builders-club://boas-vindas/engajamento-v1",
    sort: 4,
    title: "Comentários, reações e menções",
    body: `- Abra um post (ou um card de Boas-vindas) para **reagir** e **comentar**
- Use **Responder** em um comentário (um nível de resposta)
- Mencione alguém com \`@NomeExibido\` — a pessoa recebe notificação
- O sino mostra o que é novo; clique para ir ao post`,
  },
  {
    marker: "builders-club://boas-vindas/materiais-aulas-v1",
    sort: 5,
    title: "Materiais e aulas",
    body: `No menu **Materiais de apoio** você encontra kits e guias (arsenal, prompts, contrato, etc.).

Em **Aulas**, quando houver módulos publicados, assista aos vídeos e marque como concluído.

Qualquer problema de acesso a materiais, avise a equipe do Builders Club.`,
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
        description: "Orientações e primeiros passos na comunidade",
        sortOrder: 0,
      },
      update: {
        name: "Boas-vindas",
        description: "Orientações e primeiros passos na comunidade",
        sortOrder: 0,
      },
    });

    const author = await resolveAuthor(prisma);
    console.log(`Autor: ${author.email}`);

    // Datas escalonadas para o hero (sort 0) aparecer primeiro (createdAt desc + pinned).
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
