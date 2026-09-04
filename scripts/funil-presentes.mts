/**
 * Funil dos Presentes: acessos → cadastros, por post de origem (F059).
 *
 *   npm run funil                      # prod, desde sempre
 *   npm run funil -- --target=hml
 *   npm run funil -- --desde=2026-09-04
 *   npm run funil -- --antes-depois    # compara antes/depois da pop-up (F078)
 *
 * Só leitura. A F059 mede em dois degraus:
 *   `gift_visit.utm_content`  →  `membership.origin_utm_content`
 *
 * Existe porque a leitura era SQL na mão, e comparar o efeito de uma mudança
 * de funil exige rodar a mesma conta várias vezes, sem reescrevê-la.
 */
import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env"), override: true });
config({ path: resolve(root, ".env.local"), override: true });

type Target = "local" | "hml" | "prod";

/**
 * Subida da F078 (pop-up da aula) em produção. É a fronteira do
 * `--antes-depois`: acessos antes disso viram o "controle".
 */
const POPUP_NO_AR = new Date("2026-09-04T13:30:00-03:00");

function arg(nome: string): string | undefined {
  const p = process.argv.find((a) => a.startsWith(`--${nome}=`));
  return p?.split("=")[1]?.trim();
}

function resolverUrl(target: Target): string {
  const map: Record<Target, string | undefined> = {
    local: process.env.DATABASE_URL?.trim(),
    hml: process.env.DATABASE_URL_HML?.trim(),
    prod: process.env.DATABASE_URL_PROD?.trim(),
  };
  const url = map[target];
  if (!url) {
    console.error(`Defina DATABASE_URL${target === "local" ? "" : `_${target.toUpperCase()}`} no .env`);
    process.exit(1);
  }
  return url;
}

function pct(parte: number, total: number): string {
  if (total === 0) return "—";
  return `${((parte / total) * 100).toFixed(1)}%`;
}

type Linha = { post: string; acessos: number; cadastros: number };

async function funil(
  prisma: PrismaClient,
  de: Date | null,
  ate: Date | null,
): Promise<Linha[]> {
  const acessos = await prisma.giftVisit.groupBy({
    by: ["utmContent"],
    _count: { _all: true },
    where: {
      ...(de || ate
        ? { createdAt: { ...(de ? { gte: de } : {}), ...(ate ? { lt: ate } : {}) } }
        : {}),
    },
  });
  const cadastros = await prisma.membership.groupBy({
    by: ["originUtmContent"],
    _count: { _all: true },
    where: {
      originAt: {
        not: null,
        ...(de ? { gte: de } : {}),
        ...(ate ? { lt: ate } : {}),
      },
    },
  });

  const mapa = new Map<string, Linha>();
  const chave = (v: string | null) => v ?? "(sem utm)";

  for (const v of acessos) {
    const post = chave(v.utmContent);
    mapa.set(post, { post, acessos: v._count._all, cadastros: 0 });
  }
  for (const c of cadastros) {
    const post = chave(c.originUtmContent);
    const atual = mapa.get(post) ?? { post, acessos: 0, cadastros: 0 };
    atual.cadastros = c._count._all;
    mapa.set(post, atual);
  }
  return [...mapa.values()].sort((a, b) => b.acessos - a.acessos);
}

function imprimir(titulo: string, linhas: Linha[]): void {
  const acessos = linhas.reduce((s, l) => s + l.acessos, 0);
  const cadastros = linhas.reduce((s, l) => s + l.cadastros, 0);

  console.log(`\n${titulo}`);
  if (linhas.length === 0) {
    console.log("  (sem acessos no período)");
    return;
  }
  console.table(
    linhas.map((l) => ({
      post: l.post,
      acessos: l.acessos,
      cadastros: l.cadastros,
      conversao: pct(l.cadastros, l.acessos),
    })),
  );
  console.log(
    `  TOTAL: ${acessos} acessos → ${cadastros} cadastros = ${pct(cadastros, acessos)}`,
  );
}

async function main() {
  const target = (arg("target") ?? "prod") as Target;
  const desde = arg("desde") ? new Date(`${arg("desde")}T00:00:00-03:00`) : null;
  const antesDepois = process.argv.includes("--antes-depois");

  const prisma = new PrismaClient({
    datasources: { db: { url: resolverUrl(target) } },
  });

  console.log(`Funil dos Presentes — ambiente: ${target.toUpperCase()}`);
  console.log(
    "Acesso é abertura de página, não pessoa: a mesma pessoa recarregando ou\n" +
      "reabrindo o link do DM conta de novo. A conversão real é melhor que a\n" +
      "que sai daqui. Mesma conta e mesma palavra da aba Presentes na Admin.",
  );

  try {
    if (antesDepois) {
      imprimir(
        `ANTES da pop-up (até ${POPUP_NO_AR.toLocaleString("pt-BR")})`,
        await funil(prisma, desde, POPUP_NO_AR),
      );
      imprimir(
        `DEPOIS da pop-up (a partir de ${POPUP_NO_AR.toLocaleString("pt-BR")})`,
        await funil(prisma, POPUP_NO_AR, null),
      );
      console.log(
        "\nLeia com cuidado: a janela 'depois' começa pequena, e post novo\n" +
          "traz público diferente. Só compare quando o 'depois' tiver volume\n" +
          "parecido com o 'antes' — antes disso, a diferença é ruído.",
      );
    } else {
      imprimir(
        desde ? `Desde ${desde.toLocaleDateString("pt-BR")}` : "Desde sempre",
        await funil(prisma, desde, null),
      );
    }

    const pagantes = await prisma.membership.count({
      where: { tier: { not: "free" }, originAt: { not: null } },
    });
    console.log(
      `\nCadastros vindos de Presente que viraram pagante: ${pagantes}`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error("ERRO:", e instanceof Error ? e.message : e);
  process.exit(1);
});
