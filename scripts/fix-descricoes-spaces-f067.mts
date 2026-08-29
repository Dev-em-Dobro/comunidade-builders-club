/**
 * F067 — corrige a `description` de Boas-vindas e Conquistas nos ambientes.
 *
 *   npx tsx scripts/fix-descricoes-spaces-f067.mts --target=local
 *   npx tsx scripts/fix-descricoes-spaces-f067.mts --target=hml
 *   npx tsx scripts/fix-descricoes-spaces-f067.mts --target=prod --confirm
 *
 * Por que não `npm run db:seed`: o seed reescreve name, description e
 * sortOrder dos 8 spaces. O admin edita descrição pela UI
 * (`updateSpaceAction`), então o seed apagaria em silêncio qualquer texto
 * que o time tenha ajustado. Este script mexe só nos dois spaces da F067 e
 * **só se o texto ainda for o antigo** — quem já reescreveu à mão fica de
 * pé.
 *
 * Idempotente: rodar de novo não faz nada.
 */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env"), override: true });
config({ path: resolve(root, ".env.local"), override: true });

type Target = "local" | "hml" | "prod";

const TROCAS = [
  {
    slug: "boas-vindas",
    de: "Tutorial e os três passos do primeiro dia",
    para: "Tutorial e o passo a passo do primeiro dia",
  },
  {
    slug: "conquistas",
    de: "Poste suas conquistas aqui, cliente fechado, proposta aceita, ou primeiro pagamento. Conte como foi o processo pra fechar a venda, isso ajuda a comunidade a crescer",
    para: "Cliente fechado, proposta aceita, primeiro pagamento — e como foi o processo pra fechar. Leia o que já deu certo e, quando for a sua vez, poste a sua.",
  },
] as const;

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
    for (const t of TROCAS) {
      const space = await prisma.space.findUnique({
        where: { slug: t.slug },
        select: { id: true, description: true },
      });
      if (!space) {
        console.log(`  ${t.slug}: space não existe — pulado`);
        continue;
      }
      const atual = space.description?.trim() ?? "";
      if (atual === t.para) {
        console.log(`  ${t.slug}: já atualizado`);
        continue;
      }
      if (atual !== t.de) {
        console.log(
          `  ${t.slug}: descrição foi editada à mão — NÃO alterado\n     atual: ${atual}`,
        );
        continue;
      }
      await prisma.space.update({
        where: { id: space.id },
        data: { description: t.para },
      });
      console.log(`  ${t.slug}: atualizado`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
