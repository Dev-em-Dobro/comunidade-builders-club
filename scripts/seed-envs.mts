/**
 * Seed de spaces (+ bootstrap admin) em um ou mais ambientes.
 *
 *   npm run db:seed:envs -- --target=hml
 *   npm run db:seed:envs -- --target=prod
 *   npm run db:seed:envs -- --target=hml,prod
 *   npm run db:seed:envs -- --target=all   # local + hml + prod
 */
import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { execSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env"), override: true });
config({ path: resolve(root, ".env.local"), override: true });

type Target = "local" | "hml" | "prod";

function resolveUrl(target: Target): string {
  const map: Record<Target, string | undefined> = {
    local: process.env.DATABASE_URL?.trim(),
    hml: process.env.DATABASE_URL_HML?.trim(),
    prod: process.env.DATABASE_URL_PROD?.trim(),
  };
  // Se DATABASE_URL já aponta para HML, local e hml podem ser iguais — ok.
  if (target === "hml" && !map.hml && map.local) return map.local!;
  const url = map[target];
  if (!url) {
    throw new Error(`Env ausente para --target=${target}`);
  }
  return url;
}

function maskUrl(url: string): string {
  return url.replace(/:([^:@/]+)@/, ":****@");
}

function parseTargets(argv: string[]): Target[] {
  const raw = argv.find((a) => a.startsWith("--target="))?.slice("--target=".length);
  if (!raw) {
    throw new Error("Informe --target=hml|prod|local|all ou hml,prod");
  }
  if (raw === "all") return ["local", "hml", "prod"];
  const parts = raw.split(",").map((p) => p.trim()) as Target[];
  for (const p of parts) {
    if (p !== "local" && p !== "hml" && p !== "prod") {
      throw new Error(`Target inválido: ${p}`);
    }
  }
  return parts;
}

async function confirmProd(): Promise<boolean> {
  const rl = createInterface({ input, output });
  try {
    const answer = await rl.question(
      'ATENÇÃO: seed em PRODUÇÃO. Digite "prod" para confirmar: ',
    );
    return answer.trim().toLowerCase() === "prod";
  } finally {
    rl.close();
  }
}

async function main() {
  const targets = parseTargets(process.argv.slice(2));
  if (targets.includes("prod")) {
    const ok = await confirmProd();
    if (!ok) {
      console.error("Abortado.");
      process.exit(1);
    }
  }

  for (const target of targets) {
    const url = resolveUrl(target);
    console.log(`\n→ Seed --target=${target}: ${maskUrl(url)}`);
    execSync("npx tsx prisma/seed.ts", {
      stdio: "inherit",
      cwd: root,
      env: { ...process.env, DATABASE_URL: url },
    });
  }
  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
