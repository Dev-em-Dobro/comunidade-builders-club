/** F053 hotfix — resolve tier pago a partir da note da allowlist. */

import {
  HUBLA_OFFER_ID_PRO_OFICIAL,
  HUBLA_OFFER_IDS_ELITE_OFICIAIS,
} from "@/lib/membership/checkout";

export type TierPagoAllowlist = "pro" | "elite";

function idsEnv(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function eliteOfferIds(): Set<string> {
  return new Set([
    ...HUBLA_OFFER_IDS_ELITE_OFICIAIS,
    ...idsEnv(process.env.HUBLA_OFFER_ID_ELITE),
  ]);
}

function proOfferIds(): Set<string> {
  return new Set([
    HUBLA_OFFER_ID_PRO_OFICIAL,
    ...idsEnv(process.env.HUBLA_OFFER_ID_PRO),
  ]);
}

function eliteTmbCodes(): Set<string> {
  const raw = process.env.TMB_ELITE_CODES?.trim();
  const list = raw
    ? idsEnv(raw)
    : ["3XB272209KV", "9DW254247E5"];
  return new Set(list.map((c) => c.toUpperCase()));
}

/**
 * Lê a `note` gravada pelo webhook Hubla/TMB e devolve o plano pago.
 * Default `pro` (comportamento legado da allowlist).
 *
 * Formatos conhecidos:
 * - Hubla: `product:… offer:v1SsMcVXNip7Mn5A2pNH`
 * - TMB: `productId=…; plan=elite; …`
 */
export function tierPagoDaNotaAllowlist(
  note: string | null | undefined,
): TierPagoAllowlist {
  if (!note?.trim()) return "pro";

  const planMatch = note.match(/(?:^|[;\s])plan=(elite|pro)(?:[;\s]|$)/i);
  if (planMatch?.[1]) {
    return planMatch[1].toLowerCase() === "elite" ? "elite" : "pro";
  }

  const offerMatch = note.match(/offer:([A-Za-z0-9_-]+)/i);
  if (offerMatch?.[1]) {
    const id = offerMatch[1];
    if (eliteOfferIds().has(id)) return "elite";
    if (proOfferIds().has(id)) return "pro";
  }

  const productIdMatch = note.match(/productId=([A-Za-z0-9_-]+)/i);
  if (productIdMatch?.[1]) {
    if (eliteTmbCodes().has(productIdMatch[1].toUpperCase())) return "elite";
  }

  return "pro";
}

/** Elite nunca desce; senão usa o tier desejado (pro|elite). */
export function mesclarTierPago(
  atual: string | null | undefined,
  desejado: TierPagoAllowlist,
): TierPagoAllowlist {
  if (atual === "elite" || desejado === "elite") return "elite";
  return "pro";
}
