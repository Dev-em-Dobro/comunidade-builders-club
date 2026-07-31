/**
 * Aplica migrations no Neon de homologação.
 * Usa DATABASE_URL_STAGING ou, se ausente, DATABASE_URL_HML.
 * Nunca usa DATABASE_URL / DATABASE_URL_PROD de produção.
 */
import { config } from "dotenv";
import { execSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env"), override: true });
config({ path: resolve(root, ".env.local"), override: true });

const staging =
  process.env.DATABASE_URL_STAGING?.trim() ||
  process.env.DATABASE_URL_HML?.trim();

if (!staging) {
  console.error("Defina DATABASE_URL_STAGING ou DATABASE_URL_HML no .env");
  process.exit(1);
}

console.log(
  "migrate deploy →",
  staging.replace(/:([^:@/]+)@/, ":****@"),
);

execSync("npx prisma migrate deploy", {
  stdio: "inherit",
  cwd: root,
  env: { ...process.env, DATABASE_URL: staging },
});
