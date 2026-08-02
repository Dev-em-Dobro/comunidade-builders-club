/**
 * Aplica migrations no Neon de **produção**.
 *
 * Fluxo: só depois de merge em `main` + confirmação explícita.
 *   npm run db:migrate:prod -- --confirm
 *
 * Usa DATABASE_URL_PROD. Nunca cai em HML/staging.
 */
import { config } from "dotenv";
import { execSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env"), override: true });
config({ path: resolve(root, ".env.local"), override: true });

const confirmed =
  process.argv.includes("--confirm") ||
  process.env.CONFIRM_PROD?.trim().toLowerCase() === "yes";

if (!confirmed) {
  console.error(
    'Produção exige confirmação. Rode: npm run db:migrate:prod -- --confirm',
  );
  process.exit(1);
}

const prod = process.env.DATABASE_URL_PROD?.trim();
if (!prod) {
  console.error("Defina DATABASE_URL_PROD no .env");
  process.exit(1);
}

console.log(
  "migrate deploy → PRODUÇÃO",
  prod.replace(/:([^:@/]+)@/, ":****@"),
);

execSync("npx prisma migrate deploy", {
  stdio: "inherit",
  cwd: root,
  env: { ...process.env, DATABASE_URL: prod },
});
