/**
 * F050 (fatia B) — cliente do endpoint de estatísticas do Orion (F044 lá).
 * Bancos separados: só contagens de abordagens frias por e-mail.
 * Falha nunca derruba a tela: devolve `null` e as telas usam os dados locais.
 */
import { END, START } from "./calendario";

export type ColdDay = { data: string; abordagens: number; retornos: number };
export type ColdFunnel = { respondeu: number; qualificado: number; proposta: number; ganho: number };
export type ColdStats = { encontrado: boolean; dias: ColdDay[]; funil: ColdFunnel };
/** `null` = Orion indisponível (sem config, erro ou timeout). */
export type ColdLookup = Map<string, ColdStats> | null;

const TTL_MS = 10 * 60 * 1000;
const TIMEOUT_MS = 5000;
const BATCH = 500;
const cache = new Map<string, { at: number; value: Map<string, ColdStats> }>();

export function coldWindow(today: string) {
  return { desde: START, ate: today > END ? END : today < START ? START : today };
}

function config() {
  const url = process.env.ORION_URL?.trim().replace(/\/+$/, "");
  const secret = process.env.BUILDERS_INTEGRATION_SECRET?.trim();
  return url && secret ? { url, secret } : null;
}

async function fetchBatch(url: string, secret: string, emails: string[], desde: string, ate: string) {
  const response = await fetch(`${url}/api/integracoes/builders/estatisticas`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
    body: JSON.stringify({ emails, desde, ate }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
    next: { revalidate: TTL_MS / 1000 },
  });
  if (!response.ok) throw new Error(`Orion respondeu ${response.status}`);
  const body = (await response.json()) as { resultados?: (ColdStats & { email: string })[] };
  if (!Array.isArray(body.resultados)) throw new Error("Resposta do Orion sem resultados");
  return body.resultados;
}

/** Estatísticas frias por e-mail (minúsculo). Cache de ~10 min por processo. */
export async function buscarEstatisticasOrion(emails: string[], today: string): Promise<ColdLookup> {
  const cfg = config();
  const list = [...new Set(emails.map((email) => email.trim().toLowerCase()).filter(Boolean))].sort();
  if (!cfg) return null;
  if (!list.length) return new Map();
  const { desde, ate } = coldWindow(today);
  const key = `${desde}|${ate}|${list.join(",")}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value;
  try {
    const batches: string[][] = [];
    for (let i = 0; i < list.length; i += BATCH) batches.push(list.slice(i, i + BATCH));
    const results = (await Promise.all(batches.map((batch) => fetchBatch(cfg.url, cfg.secret, batch, desde, ate)))).flat();
    const value = new Map(results.map(({ email, ...stats }) => [email.toLowerCase(), stats]));
    cache.set(key, { at: Date.now(), value });
    if (cache.size > 200) cache.delete(cache.keys().next().value!);
    return value;
  } catch (error) {
    console.error("[desafio/orion] estatísticas indisponíveis", error instanceof Error ? error.message : error);
    return null;
  }
}

/** `undefined` = Orion indisponível; e-mail ausente na resposta = não encontrado. */
export function coldForEmail(lookup: ColdLookup, email: string): ColdStats | undefined {
  if (!lookup) return undefined;
  return lookup.get(email.toLowerCase()) ?? { encontrado: false, dias: [], funil: { respondeu: 0, qualificado: 0, proposta: 0, ganho: 0 } };
}
