import { imersaoAtiva } from "./imersao-ia";

/**
 * F099 — Bastidores dos 5 Dígitos com IA: live pública, toda quinta às 20h.
 *
 * Não é a live semanal do Elite (F079, terça): esta é aberta a qualquer
 * pessoa e serve de topo de funil. Quem assiste não leva gravação — gravação
 * é benefício de aluno pagante.
 *
 * Copy, link e artes vivem aqui, e não no `.tsx`, pelo mesmo motivo do
 * `imersao-ia.ts`: a copy é espelho da arte, e a arte troca sem tocar em
 * componente.
 *
 * Sem dependência de Next: dá para testar sem React.
 */
export const BASTIDORES = {
  nome: "Bastidores dos 5 Dígitos com IA",
  quando: "Toda quinta",
  horario: "20h",
  cta: "Entrar no grupo",
  /**
   * Redirecionador (Sendflow) que distribui entre os grupos de WhatsApp.
   * Diferente da F082, **não é env**: é link de marketing, não é segredo e
   * não muda por ambiente.
   *
   * Sem UTM — redirecionador de WhatsApp não repassa query string.
   */
  url: "https://sndflw.com/i/JaDGKmxpDHdXT85jCpAg",
  /**
   * Todo o texto da campanha está dentro da arte. Este `alt` é a única
   * leitura possível para quem usa leitor de tela — mantê-lo espelhando o
   * que a peça diz, inclusive o dia e a hora.
   */
  alt: "Bastidores dos 5 Dígitos com IA, ao vivo toda quinta às 20h: como estruturamos nossa operação pra faturar mais de 10 mil reais por mês com IA para negócios, sem ser um vendedor chato. Entrar no grupo.",
} as const;

/**
 * As duas artes de hoje são provisórias: foram desenhadas para 1920 e 800 de
 * largura, e a faixa quase nunca tem essa largura (o shell tira 260px de
 * sidebar em `md+`). O componente compensa cortando pela esquerda — ver a
 * decisão 6 da spec F099, que traz as dimensões das peças definitivas.
 */
export const BASTIDORES_BANNER = {
  wide: { src: "/banners/bastidores-wide.webp", width: 3840, height: 600 },
  mobile: { src: "/banners/bastidores-mobile.webp", width: 1600, height: 680 },
} as const;

export type FaixaDoTopo = "imersao" | "bastidores";

/**
 * F099 + F088 — o topo do Club carrega **uma** faixa por vez, nunca duas
 * empilhadas.
 *
 * A Imersão tem data marcada e some sozinha (`imersaoAtiva`), então ela tem
 * precedência enquanto existe — mas só para quem é Free, que é o público
 * dela. Bastidores é aberta e fica com todo o resto, e com todo mundo depois
 * que a Imersão passa.
 */
export function faixaDoTopo(opts: {
  isPaid: boolean;
  agora?: Date;
}): FaixaDoTopo {
  if (!opts.isPaid && imersaoAtiva(opts.agora ?? new Date())) return "imersao";
  return "bastidores";
}
