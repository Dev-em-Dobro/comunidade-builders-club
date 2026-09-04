import { sanitizeUtmValue } from "@/lib/gifts/origem";

/**
 * F077 — Imersão "2 a 5k com IA" (Dev em Dobro), 22 e 23/09/2026.
 *
 * Copy, prazo e link vivem aqui, e não no `.tsx`, por dois motivos:
 * a faixa é datada e precisa sumir sozinha (decisão 1), e a copy é espelho
 * da landing — quando ela mudar, muda um objeto, num arquivo (decisão 2).
 *
 * Sem dependência de Next: dá para testar sem React.
 */

export const IMERSAO_IA = {
  /** Espelho de https://imersao-ia.devemdobro.com/v1 — conferir antes do deploy. */
  eyebrow: "Imersão ao vivo · 2 noites",
  titulo:
    "Como fazer de R$ 2.000 a R$ 5.000 nas próximas semanas vendendo 3 soluções simples de IA",
  descricao:
    "Duas noites ao vivo, técnico e comercial: o que construir, quanto cobrar e como fechar o primeiro contrato.",
  quando: "22 e 23 de setembro",
  horario: "19h30",
  preco: "a partir de R$ 19",
  cta: "Quero minha vaga",
  url: "https://imersao-ia.devemdobro.com/v1",
  /**
   * Meia-noite depois da segunda aula, no fuso do Brasil. O `-03:00` é
   * obrigatório: servidor em UTC apagaria a faixa três horas antes da hora.
   */
  terminaEm: new Date("2026-09-24T00:00:00-03:00"),
} as const;

const UTM_FIXAS = {
  utm_source: "builders-club",
  utm_medium: "presente",
  utm_campaign: "imersao-ia",
} as const;

/** Passou da segunda aula, a faixa não aparece mais. */
export function imersaoAtiva(agora: Date = new Date()): boolean {
  return agora.getTime() < IMERSAO_IA.terminaEm.getTime();
}

/**
 * Landing (não o checkout) com as UTMs do Club. O `utmContent` vem do path do
 * Presente (F059) e diz qual Presente trouxe a venda; passa pelo mesmo
 * saneamento do resto do funil antes de virar querystring.
 */
export function imersaoHref(utmContent?: string | null): string {
  const url = new URL(IMERSAO_IA.url);
  for (const [chave, valor] of Object.entries(UTM_FIXAS)) {
    url.searchParams.set(chave, valor);
  }
  const content = sanitizeUtmValue(utmContent);
  if (content) url.searchParams.set("utm_content", content);
  return url.toString();
}
