/**
 * F084 — contas de QA para a régua (7d sem amostra, 14d sem atividade).
 *
 *   npm run db:seed:regua -- --target=hml --email=voce@devemdobro.com
 *
 * Cria (ou atualiza) dois membros fake e aponta o e-mail com plus-address:
 *   voce+regua7d@devemdobro.com   → 8 dias na comunidade, sem amostra
 *   voce+regua14d@devemdobro.com  → 20 dias, amostra antiga, parado desde então
 *
 * lastSeen fica agora, para o 48h não misturar no teste. Idempotente: apaga
 * posts/envios anteriores desses ids e regrava os relógios.
 *
 * Só HML ou local. Produção recusa — são fantoches de disparo.
 */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env"), override: true });
config({ path: resolve(root, ".env.local"), override: true });

const MS_DAY = 24 * 60 * 60 * 1000;
const SEED_TAG = "<!-- regua-qa -->";
const ID_7D = "regua-qa-7d";
const ID_14D = "regua-qa-14d";

type Target = "local" | "hml" | "prod";

function arg(argv: string[], name: string): string | undefined {
  const hit = argv.find((a) => a.startsWith(`${name}=`));
  return hit?.slice(name.length + 1).trim() || undefined;
}

function plus(email: string, tag: string): string {
  const at = email.lastIndexOf("@");
  if (at < 1) throw new Error(`E-mail inválido: ${email}`);
  const local = email.slice(0, at).split("+")[0];
  const domain = email.slice(at + 1);
  return `${local}+${tag}@${domain}`;
}

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

function maskUrl(url: string): string {
  return url.replace(/:([^:@/]+)@/, ":****@");
}

function diasAtras(n: number): Date {
  return new Date(Date.now() - n * MS_DAY);
}

async function upsertFantoche(
  prisma: PrismaClient,
  opts: {
    id: string;
    email: string;
    displayName: string;
    joinedAt: Date;
  },
) {
  const clash = await prisma.user.findUnique({ where: { email: opts.email } });
  if (clash && clash.id !== opts.id) {
    throw new Error(
      `O e-mail ${opts.email} já é de outra conta (${clash.id}). ` +
        `Passe --email de um inbox seu; o seed usa plus-address e não pode ` +
        `assaltar conta existente.`,
    );
  }

  await prisma.user.upsert({
    where: { id: opts.id },
    create: {
      id: opts.id,
      email: opts.email,
      name: opts.displayName,
      emailVerified: true,
      createdAt: opts.joinedAt,
      updatedAt: opts.joinedAt,
    },
    update: { email: opts.email, name: opts.displayName },
  });

  await prisma.profile.upsert({
    where: { userId: opts.id },
    create: {
      userId: opts.id,
      displayName: opts.displayName,
      joinedAt: opts.joinedAt,
      lastSeenAt: new Date(),
      welcomeSeenAt: new Date(),
    },
    update: {
      displayName: opts.displayName,
      joinedAt: opts.joinedAt,
      lastSeenAt: new Date(),
    },
  });

  await prisma.membership.upsert({
    where: { userId: opts.id },
    create: {
      userId: opts.id,
      status: "active",
      role: "member",
      tier: "free",
      createdAt: opts.joinedAt,
    },
    update: { status: "active", role: "member" },
  });
}

async function limparAtividade(prisma: PrismaClient, userId: string) {
  await prisma.reguaEmailSend.deleteMany({
    where: {
      userId,
      trigger: { in: ["sem_amostra_7d", "sem_atividade_14d", "sem_acesso_48h"] },
    },
  });
  await prisma.comment.deleteMany({ where: { authorId: userId } });
  await prisma.reaction.deleteMany({ where: { userId } });
  await prisma.lessonProgress.deleteMany({ where: { userId } });
  await prisma.post.deleteMany({
    where: { authorId: userId, body: { contains: SEED_TAG } },
  });
}

async function seedTarget(target: Target, inbox: string) {
  const url = resolveUrl(target);
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  const email7 = plus(inbox, "regua7d");
  const email14 = plus(inbox, "regua14d");
  const joined7 = diasAtras(8);
  const joined14 = diasAtras(20);

  console.log(`\n[${target}] ${maskUrl(url)}`);

  try {
    const projetos = await prisma.space.findUnique({ where: { slug: "projetos" } });
    if (!projetos) {
      throw new Error('Space "projetos" ausente. Rode db:seed:envs -- --target=hml.');
    }

    await upsertFantoche(prisma, {
      id: ID_7D,
      email: email7,
      displayName: "QA Régua 7d",
      joinedAt: joined7,
    });
    await limparAtividade(prisma, ID_7D);

    await upsertFantoche(prisma, {
      id: ID_14D,
      email: email14,
      displayName: "QA Régua 14d",
      joinedAt: joined14,
    });
    await limparAtividade(prisma, ID_14D);

    await prisma.post.create({
      data: {
        spaceId: projetos.id,
        authorId: ID_14D,
        title: "Amostra antiga (seed régua)",
        body: `${SEED_TAG}\nSite de amostra do seed F084 — só para o 7d não disparar nesta conta.`,
        linkUrl: "https://exemplo.devemdobro.com/regua-qa-amostra",
        createdAt: joined14,
        updatedAt: joined14,
      },
    });

    console.log(`  7d  ${email7}`);
    console.log(`      entrada há 8d, sem amostra, lastSeen agora → só sem_amostra_7d`);
    console.log(`  14d ${email14}`);
    console.log(
      `      entrada há 20d, amostra na entrada, sem atividade depois → só sem_atividade_14d`,
    );
    console.log(`\n  curl (depois do deploy no Preview):`);
    console.log(
      `  ?trigger=sem_amostra_7d&email=${encodeURIComponent(email7)}`,
    );
    console.log(
      `  ?trigger=sem_atividade_14d&email=${encodeURIComponent(email14)}`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

const argv = process.argv.slice(2);
const inbox = (arg(argv, "--email") ?? "").toLowerCase();
if (!inbox || !inbox.includes("@")) {
  console.error(
    "Informe o inbox que vai receber o Resend:\n" +
      "  npm run db:seed:regua -- --target=hml --email=voce@devemdobro.com",
  );
  process.exit(1);
}

const rawTarget = arg(argv, "--target") ?? "hml";
if (rawTarget === "prod" || rawTarget.split(",").includes("prod")) {
  console.error("Este seed não roda em produção (fantoches de disparo).");
  process.exit(1);
}
if (rawTarget !== "hml" && rawTarget !== "local") {
  console.error("Use --target=hml ou --target=local");
  process.exit(1);
}

await seedTarget(rawTarget, inbox);
