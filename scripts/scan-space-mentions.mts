/**
 * F054 — varre posts e comentários procurando menções aos nomes antigos de
 * Spaces ("Freelas", "Projetos") e reporta onde aparecem.
 *
 * Não reescreve texto de membro: renomear dentro de prosa alheia é decisão
 * humana. O script mostra id, autor e trecho para você editar pelo app.
 *
 *   npx tsx scripts/scan-space-mentions.mts --target=hml
 *   npx tsx scripts/scan-space-mentions.mts --target=prod
 *   npx tsx scripts/scan-space-mentions.mts --target=prod --author=pablo
 */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env"), override: true });
config({ path: resolve(root, ".env.local"), override: true });

/** Termos antigos e o nome novo correspondente. */
const TERMOS = [
  { antigo: /\bfreelas\b/gi, novo: "Indicação Freela" },
  { antigo: /\bprojetos\b/gi, novo: "Desafio Projetos" },
] as const;

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

/** Trecho com ~60 chars de contexto em volta de cada ocorrência. */
function trechos(texto: string, padrao: RegExp): string[] {
  const re = new RegExp(padrao.source, padrao.flags);
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto)) !== null) {
    const ini = Math.max(0, m.index - 60);
    const fim = Math.min(texto.length, m.index + m[0].length + 60);
    const prefixo = ini > 0 ? "…" : "";
    const sufixo = fim < texto.length ? "…" : "";
    out.push(
      `${prefixo}${texto.slice(ini, fim).replace(/\s+/g, " ")}${sufixo}`,
    );
    if (m[0].length === 0) re.lastIndex += 1;
  }
  return out;
}

async function run(target: Target, autorFiltro?: string) {
  const url = resolveUrl(target);
  console.log(`→ ${target}: ${mask(url)}\n`);

  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    const [posts, comments] = await Promise.all([
      prisma.post.findMany({
        select: {
          id: true,
          title: true,
          body: true,
          linkUrl: true,
          createdAt: true,
          author: { select: { name: true, email: true } },
          space: { select: { slug: true } },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.comment.findMany({
        select: {
          id: true,
          postId: true,
          body: true,
          createdAt: true,
          author: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const filtro = autorFiltro?.trim().toLowerCase();
    const casaAutor = (a: { name: string | null; email: string }) =>
      !filtro ||
      (a.name ?? "").toLowerCase().includes(filtro) ||
      a.email.toLowerCase().includes(filtro);

    let total = 0;

    for (const { antigo, novo } of TERMOS) {
      console.log(`\n=== ${antigo.source} → "${novo}" ===`);
      let achados = 0;

      for (const p of posts) {
        if (!casaAutor(p.author)) continue;
        const alvo = `${p.title}\n${p.body}`;
        const hits = trechos(alvo, antigo);
        if (hits.length === 0) continue;
        achados += hits.length;
        // Posts semeados por script já foram corrigidos no próprio seed.
        const semeado = p.linkUrl?.startsWith("builders-club://")
          ? " [SEEDADO — corrigido pelo script de seed]"
          : "";
        console.log(
          `\npost ${p.id} · /spaces/${p.space.slug} · ${p.author.name ?? p.author.email}${semeado}`,
        );
        for (const h of hits) console.log(`   ${h}`);
      }

      for (const c of comments) {
        if (!casaAutor(c.author)) continue;
        const hits = trechos(c.body, antigo);
        if (hits.length === 0) continue;
        achados += hits.length;
        console.log(
          `\ncomentário ${c.id} · post ${c.postId} · ${c.author.name ?? c.author.email}`,
        );
        for (const h of hits) console.log(`   ${h}`);
      }

      console.log(`\n${achados} ocorrência(s).`);
      total += achados;
    }

    console.log(
      `\n--- ${total} ocorrência(s) no total em ${posts.length} posts e ${comments.length} comentários.`,
    );
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
  const autor = argv
    .find((a) => a.startsWith("--author="))
    ?.slice("--author=".length);
  await run(targetRaw, autor);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
