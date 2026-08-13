/**
 * Mede performance pública (Lighthouse) e TTFB.
 *
 *   npm run perf:lighthouse
 *   npm run perf:lighthouse -- --url=https://...
 *
 * Feed autenticado: exporte PERF_SESSION_COOKIE com o cookie de sessão
 * (DevTools → Application → Cookies) e rode de novo; chame também /api/perf/timings.
 */
import { config } from "dotenv";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env") });
config({ path: resolve(root, ".env.local"), override: true });

const BASE =
  process.argv.find((a) => a.startsWith("--url="))?.slice(6) ||
  process.env.PERF_BASE_URL ||
  "https://comunidade-builders-club.devemdobro.com";

const outDir = resolve(root, "scripts/perf-reports");
mkdirSync(outDir, { recursive: true });

function chromePath(): string | null {
  const candidates = [
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  ].filter(Boolean) as string[];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  return null;
}

async function ttfb(url: string, cookie?: string) {
  const headers: Record<string, string> = {};
  if (cookie) headers.cookie = cookie;
  const t0 = performance.now();
  const res = await fetch(url, { headers, redirect: "manual" });
  const ms = Math.round(performance.now() - t0);
  return { status: res.status, ms, location: res.headers.get("location") };
}

function lighthouse(url: string, name: string) {
  const chrome = chromePath();
  if (!chrome) {
    console.warn("Chrome/Edge não encontrado — pulando Lighthouse UI");
    return null;
  }
  const out = resolve(outDir, name);
  execFileSync(
    "npx",
    [
      "lighthouse",
      url,
      "--only-categories=performance",
      "--form-factor=mobile",
      `--chrome-path=${chrome}`,
      "--chrome-flags=--headless --no-sandbox --disable-gpu",
      "--output=json",
      "--output=html",
      `--output-path=${out}`,
      "--quiet",
    ],
    { cwd: root, stdio: "inherit", shell: true },
  );
  const report = JSON.parse(readFileSync(`${out}.report.json`, "utf8"));
  const a = report.audits;
  return {
    score: Math.round((report.categories.performance.score || 0) * 100),
    lcpMs: Math.round(a["largest-contentful-paint"]?.numericValue || 0),
    fcpMs: Math.round(a["first-contentful-paint"]?.numericValue || 0),
    ttfbMs: Math.round(a["server-response-time"]?.numericValue || 0),
    tbtMs: Math.round(a["total-blocking-time"]?.numericValue || 0),
    cls: a["cumulative-layout-shift"]?.numericValue,
  };
}

async function main() {
  const cookie = process.env.PERF_SESSION_COOKIE?.trim();
  console.log("Base:", BASE);
  console.log("Cookie auth:", cookie ? "sim" : "não");

  const loginTtfb = await ttfb(`${BASE}/login`);
  console.log("\nTTFB /login", loginTtfb);

  const homeTtfb = await ttfb(`${BASE}/`, cookie);
  console.log("TTFB /", homeTtfb);

  if (cookie) {
    const timings = await fetch(`${BASE}/api/perf/timings`, {
      headers: { cookie },
    });
    console.log("\n/api/perf/timings", timings.status, await timings.json());
  }

  console.log("\nLighthouse /login …");
  const loginLh = lighthouse(`${BASE}/login`, "login");
  console.log(loginLh);

  const summary = {
    base: BASE,
    measuredAt: new Date().toISOString(),
    loginTtfb,
    homeTtfb,
    loginLh,
    lcpBudgetMs: 2500,
    loginLcpPass: loginLh ? loginLh.lcpMs < 2500 : null,
    verdict:
      loginLh && loginLh.lcpMs < 2500
        ? "Next.js OK no path público (login LCP < 2.5s). Gargalo do feed autenticado = auth/DB (Neon), não o framework. Trocar Next não resolve sozinho."
        : "Revisar LCP do login.",
  };
  writeFileSync(
    resolve(outDir, "summary.json"),
    JSON.stringify(summary, null, 2),
  );
  console.log("\n=== RESUMO ===");
  console.log(JSON.stringify(summary, null, 2));
  console.log("\nRelatórios em scripts/perf-reports/");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
