import { FASE_1_M01_SLUG } from "@/lib/aulas/access";
import { PROMESSA_PRIMEIRO_CLIENTE } from "@/lib/membership/checkout";

/**
 * F078 — pop-up da aula no Presente.
 *
 * Copy, destino e delay moram aqui, e não no `.tsx`, pelo mesmo motivo da F077:
 * dá para testar sem React e trocar texto sem abrir componente.
 *
 * Sem Prisma de propósito. A contagem de aulas consulta o banco e vive em
 * `@/lib/aulas`; aqui ela chega pronta, como número.
 *
 * Sem `localStorage`: a dispensa não é lembrada (decisão 5). Fechar vale para
 * aquela visita; voltar ao Presente é uma chance nova.
 */

/** Aula que abre o módulo gratuito — destino de quem se cadastra pela modal. */
export const AULA_ABERTURA_HREF = `/aulas/${FASE_1_M01_SLUG}/aula-introducao-builders-club`;

/**
 * Um minuto de leitura antes de interromper (decisão 1).
 *
 * Não é número escolhido no olho: é o que sustenta a exceção à regra da F063
 * de não colocar oferta antes do conteúdo. Quem baixar isso está mudando a
 * decisão de produto, não ajustando um parâmetro — a modal deixa de chegar
 * depois da leitura e passa a chegar durante.
 *
 * Esteve em 10s entre 04/09/2026 e o mesmo dia, só para o QA em HML.
 */
export const POPUP_DELAY_MS = 60_000;

export const POPUP_AULA = {
  eyebrow: "Aulas liberadas",
  promessa: PROMESSA_PRIMEIRO_CLIENTE,
  cta: "Quero assistir agora",
  dispensar: "Agora não",
  fechar: "Fechar",
} as const;

/**
 * O número vem do banco (decisão 4.1). Sem número — contagem falhou ou veio
 * zero — a copy perde força, mas não mente.
 */
export function tituloPopup(totalAulas: number): string {
  return totalAulas > 0
    ? `Quer acesso gratuito às ${totalAulas} primeiras aulas?`
    : "Quer acesso gratuito às primeiras aulas?";
}

export function subheadPopup(totalAulas: number): string {
  const quantas =
    totalAulas > 0 ? `as ${totalAulas} primeiras aulas` : "as primeiras aulas";
  return `Criando sua conta grátis você assiste ${quantas} do Builders Club — o que construir e vender com IA, e o desafio do primeiro projeto em 7 dias.`;
}
