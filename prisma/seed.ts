import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

// Não sobrescrever DATABASE_URL já definido por scripts (db:seed:envs).
const databaseUrlFromParent = process.env.DATABASE_URL;
config({ path: ".env" });
config({ path: ".env.local" });
if (databaseUrlFromParent) {
  process.env.DATABASE_URL = databaseUrlFromParent;
}

const prisma = new PrismaClient();

const SPACES = [
  {
    slug: "boas-vindas",
    name: "Boas-vindas",
    // F067 — "passo a passo" serve para as duas trilhas (3 passos no pago,
    // 4 no free). "três passos" aparecia acima de uma lista de quatro.
    description: "Tutorial e o passo a passo do primeiro dia",
    sortOrder: 0,
  },
  { slug: "avisos", name: "Avisos", description: "Comunicados oficiais", sortOrder: 1 },
  { slug: "presentes", name: "Presentes", description: "Conteúdos liberados da divulgação", sortOrder: 2 },
  { slug: "geral", name: "Geral", description: "Conversa aberta", sortOrder: 3 },
  { slug: "duvidas", name: "Dúvidas", description: "Perguntas e respostas", sortOrder: 4 },
  { slug: "freelas", name: "Indicação Freela", description: "Se tiver um freela pra indicar pra um colega, poste aqui", sortOrder: 5 },
  // F067 — descrição que serve para quem lê (free) e para quem posta (PRO+).
  { slug: "conquistas", name: "Conquistas", description: "Cliente fechado, proposta aceita, primeiro pagamento — e como foi o processo pra fechar. Leia o que já deu certo e, quando for a sua vez, poste a sua.", sortOrder: 6 },
  { slug: "projetos", name: "Desafio Projetos", description: "Poste aqui o projeto que você desenvolveu no desafio dos 7 dias. Pode ser só um site de amostra por enquanto, o importante é dar o primeiro passo, a venda vem depois", sortOrder: 7 },
] as const;

async function main() {
  for (const space of SPACES) {
    await prisma.space.upsert({
      where: { slug: space.slug },
      create: space,
      update: {
        name: space.name,
        description: space.description,
        sortOrder: space.sortOrder,
      },
    });
  }

  // Removido do produto — prospecção de vagas fica no Orion.
  const removed = await prisma.space.deleteMany({ where: { slug: "vagas" } });
  if (removed.count > 0) {
    console.log(`Space vagas removido (${removed.count})`);
  }

  const adminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  if (adminEmail) {
    const user = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (user) {
      await prisma.membership.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          status: "active",
          role: "admin",
        },
        update: { status: "active", role: "admin" },
      });
      console.log(`Admin ativo: ${adminEmail}`);
    } else {
      console.log(
        `BOOTSTRAP_ADMIN_EMAIL=${adminEmail} ainda sem User — faça login e rode o seed de novo.`,
      );
    }
  }

  console.log(`Spaces seed: ${SPACES.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
