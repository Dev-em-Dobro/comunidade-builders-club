/**
 * F122 — Contrato de Conteúdos Digitais (DevQuest + Builders Club).
 *
 * Aceite demonstrável em `legal_acceptance` para quem converteu a pago
 * a partir de 28/10/2026 (início do dia em America/Sao_Paulo).
 */

export const DOCUMENTO_CONTRATO_CONTEUDOS = "contrato-conteudos" as const;

/** Bumpe ao alterar o PDF de forma material. */
export const VERSAO_CONTRATO_CONTEUDOS = "2026-10-28";

/** Path público do PDF (cópia versionada também em `docs/`). */
export const URL_CONTRATO_CONTEUDOS_PDF =
  "/legal/contrato-conteudos-digitais-dev-em-dobro.pdf";

/**
 * Início do dia 28/10/2026 em São Paulo (= 03:00 UTC nesse dia, horário
 * de Brasília sem DST desde 2019).
 */
export const CORTE_CONTRATO_CONTEUDOS = new Date("2026-10-28T03:00:00.000Z");

export function compraExigeContratoConteudos(
  dataCompra: Date | null | undefined,
  corte: Date = CORTE_CONTRATO_CONTEUDOS,
): boolean {
  if (!dataCompra) return false;
  return dataCompra.getTime() >= corte.getTime();
}

/** Mais recente entre datas conhecidas; null se nenhuma. */
export function dataEfetivaCompraContrato(
  datas: Array<Date | null | undefined>,
): Date | null {
  let melhor: Date | null = null;
  for (const d of datas) {
    if (!d) continue;
    if (!melhor || d.getTime() > melhor.getTime()) melhor = d;
  }
  return melhor;
}
