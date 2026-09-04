import { FASE_1_M01_SLUG } from "@/lib/aulas/access";
import { PROMESSA_PRIMEIRO_CLIENTE } from "@/lib/membership/checkout";

/**
 * F078 — pop-up da aula no Presente.
 *
 * Copy, destino e regra de dispensa moram aqui, e não no `.tsx`, pelo mesmo
 * motivo da F077: dá para testar sem React e trocar texto sem abrir componente.
 *
 * Sem Prisma de propósito. A contagem de aulas consulta o banco e vive em
 * `@/lib/aulas`; aqui ela chega pronta, como número.
 */

/** Aula que abre o módulo gratuito — destino de quem se cadastra pela modal. */
export const AULA_ABERTURA_HREF = `/aulas/${FASE_1_M01_SLUG}/aula-introducao-builders-club`;

/**
 * ⚠️ **VALOR DE TESTE — 10s.** O valor da spec (decisão 1) é `60_000`: um
 * minuto de leitura antes de interromper. Baixado em 04/09/2026 só para
 * encurtar o ciclo de QA em HML, onde cada tentativa custava um minuto parado.
 *
 * **Voltar para `60_000` antes do merge em `main`.** Dez segundos interrompem
 * a leitura quase na abertura do artigo — é exatamente o pedágio que a F063
 * proíbe e que a F078 aceitou só porque havia um minuto de leitura antes.
 */
export const POPUP_DELAY_MS = 10_000;

/**
 * Fechou, não volta por 30 dias — e a dispensa é global, não por Presente:
 * quem fechou não quer ver de novo no próximo link do DM.
 *
 * O `v1` permite recomeçar do zero se a oferta mudar, sem herdar a dispensa
 * da campanha anterior.
 */
export const POPUP_DISPENSA_KEY = "bc_popup_aula_v1";
export const POPUP_DISPENSA_MS = 30 * 24 * 60 * 60 * 1000;

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

/**
 * Lê a dispensa gravada. Recebe o valor bruto porque `localStorage` pode
 * lançar (navegador em modo restrito) — quem lê trata a exceção e passa `null`,
 * que aqui significa "nunca dispensou".
 *
 * Valor corrompido também vira `false`: melhor mostrar a modal de novo do que
 * escondê-la para sempre por causa de um `NaN`.
 */
export function dispensaAtiva(bruto: string | null, agora: number): boolean {
  if (!bruto) return false;
  const quando = Number(bruto);
  if (!Number.isFinite(quando) || quando <= 0) return false;
  /**
   * Timestamp no futuro só acontece com relógio bagunçado. Tratar como
   * dispensa válida prenderia a modal por 30 dias a partir de uma data que
   * ainda não chegou — na prática, para sempre.
   */
  if (quando > agora) return false;
  return agora - quando < POPUP_DISPENSA_MS;
}
