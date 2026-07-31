import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

// Garante que o .env do projeto prevalece sobre DATABASE_URL herdado do shell
config({ path: ".env", override: true });
config({ path: ".env.local", override: true });

const prisma = new PrismaClient();

const SPACES = [
  { slug: "avisos", name: "Avisos", description: "Comunicados oficiais", sortOrder: 0 },
  { slug: "geral", name: "Geral", description: "Conversa aberta", sortOrder: 1 },
  { slug: "duvidas", name: "Dúvidas", description: "Perguntas e respostas", sortOrder: 2 },
  { slug: "freelas", name: "Freelas", description: "Oportunidades de freela", sortOrder: 3 },
  { slug: "conquistas", name: "Conquistas", description: "Vitórias da galera", sortOrder: 4 },
  { slug: "projetos", name: "Projetos", description: "Mostre o que está construindo", sortOrder: 5 },
  { slug: "vagas", name: "Vagas", description: "Vagas e indicações", sortOrder: 6 },
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
