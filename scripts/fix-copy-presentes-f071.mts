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
    nome: "título",
    de: /^## Você acabou de ver a diferença\r?$/m,
    para: "## O que você tem aqui",
  },
  {
    nome: "abertura",
    de: /O post te mostrou [^.]{1,120} em oito slides\. Aqui você recebeu /,
    para: "Aqui você tem ",
  },
  {
    /* "Régua" saiu: metáfora que o leitor tem de decifrar. E a frase falava
       do que a marca posta "lá fora" — de novo a origem. O que fica é o que
       a comunidade faz com o assunto. */
    nome: "frase do Club",
    de: /Essa é a régua do \*\*Builders Club\*\*: a gente não larga conteúdo pra você salvar e nunca mais abrir\. O que a gente posta lá fora tem, aqui dentro, a parte que falta pra sair do papel\./,
    para:
      "Assunto como esse a gente aprofunda no **Builders Club**, com quem " +
      "está fazendo junto. É onde a dúvida vira resposta e o projeto sai do papel.",
  },
  {
    /* A lista de outros kits abria com "mais gente aqui do lado" e listava
       kit, não gente. Sai inteira: o presente termina no que ele entrega. */
    nome: "lista de outros kits",
    de: /E tem mais gente aqui do lado, na mesma régua:\r?\n[\s\S]*?(?=Bom proveito)/,
    para: "",
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

  /* "Régua" no miolo dos kits — mesma palavra, mesmo motivo: troca por
     ritmo, teste, limite ou critério, conforme o que a frase quer dizer. */
  {
    slug: "vaga",
    de: "e a régua de ritmo que evita o LinkedIn restringir a sua conta",
    para: "e o ritmo que evita o LinkedIn restringir a sua conta",
  },
  {
    slug: "vaga",
    de: "**A régua que salva a sua entrevista:**",
    para: "**O teste que salva a sua entrevista:**",
  },
  {
    slug: "vaga",
    de: "## 4. A régua: o que o LinkedIn não deixa",
    para: "## 4. O limite: o que o LinkedIn não deixa",
  },
  {
    slug: "limpa",
    de: "A régua dele está na documentação oficial, e é a mesma que a gente usou aqui",
    para: "O critério dele está na documentação oficial, e é o mesmo que a gente usou aqui",
  },
  {
    slug: "limpa",
    de: "Essa mesma régua vale pras suas skills e pros seus hooks.",
    para: "O mesmo critério vale pras suas skills e pros seus hooks.",
  },
];

/**
 * Varredura final: origem que a tabela não previu, e "régua" solta.
 * Não pega "perfil do GitHub" nem ".srt de legenda" — esses são conteúdo.
 */
const SOBROU =
  /(O post te mostrou|O post citou|o post não mostrou|o post de onde|dos slides|em oito slides|carross?el|acabou de ver a diferença|r[ée]gua)/i;

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
  /** `--mostrar=<slug>` imprime o fecho já transformado desse presente. */
  const mostrar = argv
    .find((a) => a.startsWith("--mostrar="))
    ?.slice("--mostrar=".length);
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

      if (mostrar === slug) {
        /* Prévia pelo mesmo caminho que grava — sem risco de divergir. */
        const fecho = body.split("\n");
        const i = fecho.findIndex((l) => /^## O que você tem aqui/.test(l));
        console.log(
          `\n--- ${slug}, do fecho ao fim ---\n${fecho.slice(i).join("\n")}\n---\n`,
        );
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
