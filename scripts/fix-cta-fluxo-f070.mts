/**
 * F070 — limpeza editorial do único presente que a auditoria pegou.
 *
 *   npx tsx scripts/fix-cta-fluxo-f070.mts --target=hml
 *   npx tsx scripts/fix-cta-fluxo-f070.mts --target=prod --confirm
 *
 * `npm run audit:presentes` contra produção acusou 1 de 14: o kit do n8n
 * (`/presentes/fluxo`) diz "Abre n8n.io e cria sua conta". É falso positivo
 * do ponto de vista da intenção — o cadastro é **do n8n**, não do Club —
 * mas a regra `pedido-de-cadastro` casa imperativo de 2ª pessoa sem saber
 * de que produto a frase fala, e a saída prevista na spec é reescrever.
 *
 * Sem isso, o post fica no ar normalmente (o gate só vale para gravação),
 * mas trava na próxima edição pelo admin — uma armadilha esperando alguém.
 *
 * "faz o cadastro" não casa nenhum dos PEDIDOS: o padrão de cadastro é
 * `faca\s+(?:o\s+)?seu\s+cadastro`. Mantém a voz do passo a passo, que é
 * imperativa do começo ao fim ("Abre", "Escolhe um").
 *
 * Idempotente: rodar de novo não faz nada.
 */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { detectarCtaNoCorpo } from "../src/lib/gifts/cta-no-corpo.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env"), override: true });
config({ path: resolve(root, ".env.local"), override: true });

type Target = "local" | "hml" | "prod";

const SLUG = "fluxo";
const DE = "Abre [n8n.io](https://n8n.io) e cria sua conta.";
const PARA = "Abre [n8n.io](https://n8n.io) e faz o cadastro.";

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
  if (target === "prod" && !argv.includes("--confirm")) {
    throw new Error("Produção exige --confirm.");
  }

  const url = resolveUrl(target);
  console.log(`[${target}] ${maskUrl(url)}`);

  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    const post = await prisma.post.findFirst({
      where: { slug: SLUG },
      select: { id: true, body: true },
    });
    if (!post) {
      console.log(`  ${SLUG}: não existe neste ambiente — nada a fazer`);
      return;
    }
    if (post.body.includes(PARA)) {
      console.log(`  ${SLUG}: já reescrito`);
    } else if (!post.body.includes(DE)) {
      console.log(
        `  ${SLUG}: frase não está no texto — NÃO alterado (reescrita à mão?)`,
      );
      return;
    } else {
      await prisma.post.update({
        where: { id: post.id },
        data: { body: post.body.split(DE).join(PARA) },
      });
      console.log(`  ${SLUG}: reescrito`);
    }

    /* A prova de que valeu: a mesma detecção do gate, no corpo já gravado. */
    const depois = await prisma.post.findUnique({
      where: { id: post.id },
      select: { body: true },
    });
    const achados = detectarCtaNoCorpo(depois?.body ?? "");
    console.log(
      achados.length === 0
        ? `  ${SLUG}: passa na detecção da F070`
        : `  ${SLUG}: AINDA acusa ${achados.length} — ${achados
            .map((a) => a.regra)
            .join(", ")}`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
