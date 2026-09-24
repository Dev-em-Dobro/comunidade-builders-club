import { sanitizeUtmValue } from "@/lib/gifts/origem";

/**
 * F077 / F088 — Imersão "2 a 5k com IA" (Dev em Dobro), 22 e 23/09/2026.
 *
 * Copy, prazo e link vivem aqui, e não no `.tsx`, por dois motivos:
 * a faixa é datada e precisa sumir sozinha (decisão 1), e a copy é espelho
 * da landing — quando ela mudar, muda um objeto, num arquivo (decisão 2).
 *
 * O prazo fecha **uma hora antes da primeira noite** (correção de 24/09/2026):
 * quem compra com a imersão já no ar perde a aula que pagou.
 *
 * Superfícies: Presente (`utm_medium=presente`, F077) e banner Free no Club
 * (`utm_medium=club-banner`, F088).
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
   * Início da primeira noite, no fuso do Brasil. O `-03:00` é obrigatório:
   * servidor em UTC fecharia a faixa três horas antes da hora.
   *
   * É o único botão de prazo: a faixa fecha `ANTECEDENCIA_MS` antes disto.
   */
  comecaEm: new Date("2026-09-22T19:30:00-03:00"),
} as const;

/**
 * A faixa fecha uma hora antes da primeira noite, não depois da última.
 * Vender no dia 23 é vender uma imersão de duas noites com a primeira
 * perdida — o convite tem que morrer antes de virar prejuízo.
 */
const ANTECEDENCIA_MS = 60 * 60 * 1000;

/** Quando a faixa some. Derivado de `comecaEm`, não escrito à mão. */
export function imersaoFechaEm(): Date {
  return new Date(IMERSAO_IA.comecaEm.getTime() - ANTECEDENCIA_MS);
}

const UTM_SOURCE = "builders-club";
const UTM_CAMPAIGN = "imersao-ia";

/** Medium que distingue a superfície: Presente (F077) vs banner do Club (F088). */
export type ImersaoUtmMedium = "presente" | "club-banner";

/** Faltando menos de uma hora para a primeira noite, a faixa não aparece mais. */
export function imersaoAtiva(agora: Date = new Date()): boolean {
  return agora.getTime() < imersaoFechaEm().getTime();
}

/**
 * Landing (não o checkout) com as UTMs do Club.
 * - `utm_medium=presente` (default): CTA no Presente (F077); `utmContent` = path F059
 * - `utm_medium=club-banner`: faixa Free no app (F088)
 */
export function imersaoHref(
  utmContent?: string | null,
  opts?: { medium?: ImersaoUtmMedium },
): string {
  const url = new URL(IMERSAO_IA.url);
  url.searchParams.set("utm_source", UTM_SOURCE);
  url.searchParams.set("utm_medium", opts?.medium ?? "presente");
  url.searchParams.set("utm_campaign", UTM_CAMPAIGN);
  const content = sanitizeUtmValue(utmContent);
  if (content) url.searchParams.set("utm_content", content);
  return url.toString();
}
