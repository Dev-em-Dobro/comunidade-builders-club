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
    description: "Orientações e primeiros passos na comunidade",
    sortOrder: 0,
  },
  { slug: "avisos", name: "Avisos", description: "Comunicados oficiais", sortOrder: 1 },
  { slug: "presentes", name: "Presentes", description: "Conteúdos liberados da divulgação", sortOrder: 2 },
  { slug: "geral", name: "Geral", description: "Conversa aberta", sortOrder: 3 },
  { slug: "duvidas", name: "Dúvidas", description: "Perguntas e respostas", sortOrder: 4 },
  { slug: "freelas", name: "Freelas", description: "Oportunidades de freela", sortOrder: 5 },
  { slug: "conquistas", name: "Conquistas", description: "Vitórias da galera", sortOrder: 6 },
  { slug: "projetos", name: "Projetos", description: "Mostre o que está construindo", sortOrder: 7 },
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
