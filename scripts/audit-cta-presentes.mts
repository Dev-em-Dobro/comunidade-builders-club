/**
 * F070 — lista os Presentes já publicados cujo corpo carrega CTA do produto.
 *
 * Read-only: não altera nada. O bloqueio de `createPost`/`updatePost` só vale
 * para gravações novas, então este script é o jeito de saber, antes do
 * deploy, quais Presentes no ar precisam de limpeza editorial — e quais vão
 * travar na próxima edição.
 *
 *   npx tsx scripts/audit-cta-presentes.mts
 *   npm run audit:presentes
 */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { detectarCtaNoCorpo } from "../src/lib/gifts/cta-no-corpo.ts";
import { PRESENTES_SPACE_SLUG } from "../src/lib/spaces/constants.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env"), override: true });
config({ path: resolve(root, ".env.local"), override: true });

const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.post.findMany({
    where: { space: { slug: PRESENTES_SPACE_SLUG } },
    select: { id: true, slug: true, title: true, body: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  console.log(`Presentes no space "${PRESENTES_SPACE_SLUG}": ${posts.length}`);

  let sujos = 0;
  let achadosTotais = 0;

  for (const p of posts) {
    const achados = detectarCtaNoCorpo(p.body);
    if (!achados.length) continue;
    sujos++;
    achadosTotais += achados.length;
    const alvo = p.slug ? `/presentes/${p.slug}` : `post ${p.id} (sem slug)`;
    console.log(`\n${alvo}`);
    console.log(`  ${p.title || "(sem título)"}`);
    for (const a of achados) {
      console.log(`  • [${a.regra}] "${a.trecho}"`);
    }
  }

  console.log(
    sujos === 0
      ? "\nNenhum Presente com CTA no corpo."
      : `\n${sujos} Presente(s) com CTA no corpo, ${achadosTotais} achado(s).` +
          "\nA limpeza é editorial, post a post — este script não corrige nada.",
  );

  // Sinaliza para CI/shell sem tratar como erro de execução.
  process.exitCode = sujos === 0 ? 0 : 1;
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
