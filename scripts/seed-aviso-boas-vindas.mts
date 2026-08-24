/**
 * Publica (ou atualiza) o aviso fixado "Como usar o Builders Club" em Avisos.
 *
 *   npx tsx scripts/seed-aviso-boas-vindas.mts --target=hml
 *   npx tsx scripts/seed-aviso-boas-vindas.mts --target=prod --confirm
 */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env"), override: true });
config({ path: resolve(root, ".env.local"), override: true });

/** Marcador estável para idempotência (não é URL pública). */
const MARKER = "builders-club://avisos/como-usar-v1";

const BODY = `Bem-vindo ao **Builders Club** — a comunidade pra quem quer construir e vender soluções com IA.

Aqui ficam conversas, dúvidas, conquistas e avisos oficiais. Use este post como guia rápido.

## Spaces (categorias)

- **Avisos** — comunicados oficiais (leia sempre)
- **Geral** — papo aberto do dia a dia
- **Dúvidas** — perguntas técnicas e de carreira
- **Indicação Freela** — se tiver um freela pra indicar pra um colega, poste aqui
- **Conquistas** — cliente fechado, proposta aceita ou primeiro pagamento; conte como fechou a venda
- **Desafio Projetos** — mostre o que está construindo

Prospecção de clientes e hunting de freelas fica no **Orion Lead Hunter** — não use a comunidade como board de vagas.

Escolha o space certo antes de publicar — facilita quem vai te ajudar.

## Como publicar

1. Nas páginas de **Spaces**, use **Nova publicação**
2. Escolha o **space**
3. Escreva o texto (Markdown básico funciona):
   - \`**negrito**\` · \`*itálico*\` · \`código\`
   - Links: \`[texto](https://exemplo.com)\`
   - Listas com \`- item\`
4. Opcional: anexar URL de imagem, link ou vídeo
5. **Publicar**

## Mencionar alguém

Use \`@NomeExibido\` (o nome do perfil da pessoa). Ela recebe notificação.

## Comentários e respostas

- Comente no post pela página dele (**Abrir**)
- Em um comentário, use **Responder** (um nível de resposta)
- Reaja aos posts que curtir — o autor é notificado

## Notificações

O sino / menu **Notificações** mostra comentários, reações, respostas e menções.
Clique para ir ao post e marcar como lida.

## Aulas

No menu **Aulas**: vídeos da comunidade.
Assista e marque como concluída quando terminar. Dá para comentar em cada aula.

## Perfil

Em **Perfil**, ajuste nome de exibição, bio e foto. O \`@Nome\` das menções usa esse nome.

## Boas práticas

- Seja respeitoso e específico nas dúvidas (contexto + o que já tentou)
- Evite spam e links duvidosos
- Comunicados oficiais só em **Avisos** — o resto da conversa nos outros spaces

Qualquer problema de acesso, fale com a equipe do Builders Club.

Bora construir.`;

type Target = "hml" | "prod" | "local";

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

function mask(url: string) {
  return url.replace(/:([^:@/]+)@/, ":****@");
}

async function run(target: Target) {
  const url = resolveUrl(target);
  console.log(`→ ${target}: ${mask(url)}`);

  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    const space = await prisma.space.findUnique({ where: { slug: "avisos" } });
    if (!space) {
      throw new Error('Space "avisos" não encontrado. Rode db:seed:envs antes.');
    }

    const adminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();

    let author =
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
        "Nenhum usuário ativo no banco. Faça login uma vez (qualquer conta allowlist) e rode de novo.",
      );
    }

    await prisma.membership.upsert({
      where: { userId: author.id },
      create: { userId: author.id, status: "active", role: "admin" },
      update: { status: "active", role: "admin" },
    });
    console.log(`Autor do aviso: ${author.email} (admin)`);

    const existing = await prisma.post.findFirst({
      where: { linkUrl: MARKER },
    });

    if (existing) {
      const updated = await prisma.post.update({
        where: { id: existing.id },
        data: {
          body: BODY,
          spaceId: space.id,
          authorId: author.id,
          pinnedAt: new Date(),
          updatedAt: new Date(),
        },
      });
      console.log(`Atualizado post fixado ${updated.id}`);
    } else {
      const created = await prisma.post.create({
        data: {
          spaceId: space.id,
          authorId: author.id,
          body: BODY,
          linkUrl: MARKER,
          pinnedAt: new Date(),
        },
      });
      console.log(`Criado post fixado ${created.id}`);
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
