// Regras puras de conversão — usadas no código de produção E nos testes.
// B5: Funções exportadas para garantir mesmo comportamento.

import type { MembershipTier } from "@prisma/client";
import type { PlanoPagoHubla } from "./produtos";

/**
 * Verifica se o tier é pago (não-free).
 */
export function isPago(tier: MembershipTier | PlanoPagoHubla): boolean {
  return tier === "pro" || tier === "elite" || tier === "paid";
}

/**
 * Calcula o rank do tier para comparações de upgrade.
 */
export function rankPago(tier: MembershipTier | PlanoPagoHubla): number {
  if (tier === "elite") return 3;
  if (tier === "pro" || tier === "paid") return 2;
  return 1;
}

/**
 * Determina se deve marcar conversão para uma membership existente.
 * Retorna true se:
 * - membership não existe (null) → nova conta paga
 * - membership existe, era gratuito E não tinha conversão prévia
 */
export function deveMarcarConversao(
  membership: { tier: MembershipTier; convertedToPaidAt: Date | null } | null,
): boolean {
  if (!membership) return true;
  const eraGratuito = !isPago(membership.tier);
  const jaTinhaConversao = membership.convertedToPaidAt !== null;
  return eraGratuito && !jaTinhaConversao;
}

/**
 * N2: Determina se deve marcar conversão no bootstrap.
 * Só marca quando source='hubla'|'tmb' E paidAt não é null.
 * Previne backfill de emails orion/devquest/manual.
 *
 * Q4: o fluxo TMB (src/lib/tmb) ainda NÃO grava paid_at na allowlist —
 * comprador TMB sem conta NÃO é contado como conversão no bootstrap, mesmo
 * com source='tmb'. A condição `source === "tmb"` aqui é só simetria futura;
 * até o TMB passar paidAt, na prática só Hubla (que grava paid_at) marca.
 */
export function deveMarcarConversaoBootstrap(data: {
  source: string | null;
  paidAt: Date | null;
}): boolean {
  const isHublaOrTmb = data.source === "hubla" || data.source === "tmb";
  return isHublaOrTmb && data.paidAt !== null;
}

/**
 * B2: Determina se deve atualizar paidAt na allowlist.
 * Só grava quando existente é null (preserva primeira data de pagamento).
 */
export function deveAtualizarPaidAtAllowlist(
  novoPaidAt: Date | undefined,
  existentePaidAt: Date | null,
): boolean {
  return novoPaidAt !== undefined && existentePaidAt === null;
}

/**
 * Constrói o objeto de update para paidAt na allowlist.
 */
export function buildUpdatePaidAt(
  opts: { paidAt?: Date },
  existingPaidAt: Date | null,
): { paidAt?: Date } {
  if (deveAtualizarPaidAtAllowlist(opts.paidAt, existingPaidAt)) {
    return { paidAt: opts.paidAt };
  }
  return {};
}

// Status do webhook
export type StatusWebhook = "pending" | "processing" | "processed" | "ignored" | "error";

/**
 * R1: Timeout e maxDuration alinhados com a política de retry da Hubla.
 *
 * Hubla reenvia até 5× em ~75s (+5, +10, +20, +40s). Para que uma entrega
 * travada em 'processing' (função morreu ou falha ao gravar status final)
 * seja retomada DENTRO dessa janela:
 *
 *   ROUTE_MAX_DURATION_S  <  TIMEOUT_PROCESSING_MS  <  ~75s (janela Hubla)
 *
 * Valores atuais: maxDuration=20s, claim timeout=30s. O 4º retry (~35s) ou
 * o 5º (~75s) já encontram a linha velha e reprocessam. Se a função demorar
 * mais de 20s, a Vercel mata; 30s depois o retry assume.
 */
export const ROUTE_MAX_DURATION_S = 20;
export const TIMEOUT_PROCESSING_MS = 30_000; // 30 segundos

export function statusEhReprocessavel(status: StatusWebhook): boolean {
  return status === "pending" || status === "error";
}

export function statusEhFinal(status: StatusWebhook): boolean {
  return status === "processed" || status === "ignored";
}

/**
 * N5: Verifica se um registro em 'processing' está travado e pode ser reclaimado.
 */
export function processingEstaTravado(claimedAt: Date | null, agora: Date = new Date()): boolean {
  if (!claimedAt) return false;
  return agora.getTime() - claimedAt.getTime() > TIMEOUT_PROCESSING_MS;
}

/**
 * N5: Verifica se pode fazer claim de um registro baseado no status e claimedAt.
 */
export function podeSerClaimado(
  status: StatusWebhook,
  claimedAt: Date | null,
  agora: Date = new Date(),
): boolean {
  if (statusEhReprocessavel(status)) return true;
  if (status === "processing" && processingEstaTravado(claimedAt, agora)) return true;
  return false;
}

/**
 * Calcula o próximo tier baseado no tier atual e no plano concedido.
 * Nunca rebaixa (elite não vira pro).
 */
export function calcularProximoTier(
  tierAtual: MembershipTier,
  planoConcedido: PlanoPagoHubla,
): MembershipTier {
  return rankPago(planoConcedido) >= rankPago(tierAtual) ? planoConcedido : tierAtual;
}
