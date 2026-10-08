// F014 / Q1 — traduz o resultado de processarWebhookHubla em status HTTP.
// Fica em src/lib (sem Next) para ser testado direto.

import type { ResultadoProcessamentoHubla } from "./repositorio";

export type RespostaWebhookHubla = {
  status: number;
  body: { ok: boolean; ignorado: boolean; motivo?: string };
};

/**
 * - Processado / ignorado / idempotência duplicada → 200 (Hubla considera entregue).
 * - Outra execução ainda em 'processing' → 409: a Hubla NÃO pode considerar
 *   entregue, senão o evento se perde se essa execução morrer. Ela reenvia e,
 *   depois do timeout de processing, o claim é retomado.
 */
export function respostaWebhookHubla(resultado: ResultadoProcessamentoHubla): RespostaWebhookHubla {
  if (resultado.emProcessamento) {
    return {
      status: 409,
      body: { ok: false, ignorado: true, motivo: resultado.motivo ?? "evento em processamento" },
    };
  }
  return {
    status: 200,
    body: {
      ok: true,
      ignorado: resultado.ignorado,
      ...(resultado.motivo ? { motivo: resultado.motivo } : {}),
    },
  };
}
