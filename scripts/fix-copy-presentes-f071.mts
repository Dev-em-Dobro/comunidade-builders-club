/**
 * F071 — tira dos presentes a referência à peça de origem.
 *
 *   npx tsx scripts/fix-copy-presentes-f071.mts --target=hml --dry
 *   npx tsx scripts/fix-copy-presentes-f071.mts --target=hml
 *   npx tsx scripts/fix-copy-presentes-f071.mts --target=prod --confirm
 *
 * O corpo do presente vive no banco (escrito pelo admin), então não há
 * fonte no repositório para editar — a correção é um UPDATE por post.
 *
 * Cirúrgico como o script da F067: cada troca só acontece se o texto
 * antigo ainda estiver lá. Quem já reescreveu à mão fica de pé, e rodar
 * de novo não faz nada.
 *
 * `--dry` mostra o que mudaria sem gravar.
 */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env"), override: true });
config({ path: resolve(root, ".env.local"), override: true });

type Target = "local" | "hml" | "prod";

/**
 * O fecho é igual nos 14 presentes, com uma parte variável no meio
 * ("o jogo", "os 7 nomes", "o tamanho do problema e a régua"). Por isso
 * regex e não string exata — mas ancorada dos dois lados, para não pegar
 * nada além dessa frase.
 */
const FECHO: Array<{ de: RegExp; para: string; nome: string }> = [
  {
    nome: "título do fecho",
    de: /^## Você acabou de ver a diferença$/m,
    para: "## O que você tem aqui",
  },
  {
    nome: "abertura do fecho",
    de: /O post te mostrou [^.]{1,120} em oito slides\. Aqui você recebeu /,
    para: "Aqui você tem ",
  },
];

/** Trechos avulsos, um por presente. Casam por substring exata. */
const AVULSOS: Array<{ slug: string; de: string; para: string }> = [
  {
    slug: "hermes",
    de: "## A parte que o carrossel não coube: como ele aprende",
    para: "## A parte que quase ninguém explica: como ele aprende",
  },
  {
    slug: "vaga",
    de: "Estes são maiores que os dos slides: cada um já traz as regras que evitam a resposta genérica.",
    para: "Cada um já traz as regras que evitam a resposta genérica.",
  },
  {
    slug: "vaga",
    de: "Esta é a parte que o post de onde essa ideia saiu não conta, e é a que pode custar a sua conta.",
    para: "Esta é a parte que quase ninguém conta, e é a que pode custar a sua conta.",
  },
  {
    slug: "grana",
    de: "já te põe na faixa que o carrossel mostrou.",
    para: "já te põe nessa faixa.",
  },
  {
    slug: "limpa",
    de: "## O comando que o post não mostrou",
    para: "## O comando da varredura",
  },
  {
    slug: "limpa",
    de: "O post citou três blocos mortos. Aqui está o detalhe de cada um",
    para: "Foram três blocos mortos. Aqui está o detalhe de cada um",
  },
];

/** Só a origem — não pega "perfil do GitHub" nem ".srt de legenda". */
const SOBROU =
  /(O post te mostrou|O post citou|o post não mostrou|o post de onde|dos slides|em oito slides|carross?el|acabou de ver a diferença)/i;

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
  const dry = argv.includes("--dry");
  if (target === "prod" && !dry && !argv.includes("--confirm")) {
    throw new Error("Produção exige --confirm.");
  }

  const url = resolveUrl(target);
  console.log(`[${target}]${dry ? " (dry-run)" : ""} ${maskUrl(url)}\n`);

  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    const posts = await prisma.post.findMany({
      where: { OR: [{ id: { startsWith: "pres_" } }, { slug: { not: null } }] },
      select: { id: true, slug: true, body: true },
      orderBy: { createdAt: "asc" },
    });
    console.log(`${posts.length} presente(s)\n`);

    let alterados = 0;
    const pendentes: string[] = [];

    for (const post of posts) {
      const slug = post.slug ?? post.id;
      let body = post.body;
      const feitos: string[] = [];

      for (const t of FECHO) {
        const antes = body;
        body = body.replace(t.de, t.para);
        if (body !== antes) feitos.push(t.nome);
      }
      for (const t of AVULSOS) {
        if (t.slug !== post.slug) continue;
        if (!body.includes(t.de)) continue;
        body = body.split(t.de).join(t.para);
        feitos.push(`avulso: ${t.de.slice(0, 40)}…`);
      }

      if (feitos.length) {
        alterados++;
        console.log(`  ${slug}: ${feitos.join(" | ")}`);
        if (!dry) {
          await prisma.post.update({
            where: { id: post.id },
            data: { body },
          });
        }
      }

      /* Sobrou alguma referência que a tabela não previu? */
      for (const [i, linha] of body.split("\n").entries()) {
        if (SOBROU.test(linha)) {
          pendentes.push(`  ${slug} L${i + 1}: ${linha.trim()}`);
        }
      }
    }

    console.log(`\n${alterados} presente(s) ${dry ? "mudariam" : "alterados"}.`);
    if (pendentes.length) {
      console.log(`\nAINDA CITAM A ORIGEM (${pendentes.length}) — revisar à mão:`);
      for (const p of pendentes) console.log(p);
    } else {
      console.log("Nenhuma referência à origem sobrou.");
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
