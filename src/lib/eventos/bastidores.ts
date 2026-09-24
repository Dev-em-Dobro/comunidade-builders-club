import { imersaoAtiva } from "./imersao-ia";

/**
 * F102 — Bastidores dos 5 Dígitos com IA: live pública, toda quinta às 20h.
 *
 * Não é a live semanal do Elite (F079, terça): esta é aberta a qualquer
 * pessoa e serve de topo de funil. Quem assiste não leva gravação — gravação
 * é benefício de aluno pagante.
 *
 * Copy e link vivem aqui, e não no `.tsx`, pelo mesmo motivo do
 * `imersao-ia.ts`: quando a campanha mudar, muda um objeto, num arquivo.
 *
 * A faixa **não é mais imagem** — é HTML. Não existe peça de arte para
 * dimensionar, cortar ou redesenhar: o texto abaixo é o texto que o browser
 * renderiza, e ele reflui sozinho em qualquer largura.
 *
 * Sem dependência de Next: dá para testar sem React.
 */
export const BASTIDORES = {
  nome: "Bastidores dos 5 Dígitos com IA",
  badge: "Ao vivo",
  /**
   * O título quebra em duas linhas por desenho, não por acaso: a segunda
   * linha é a que recebe o destaque em cor.
   */
  tituloLinha1: "Bastidores dos",
  tituloLinha2: "5 Dígitos com IA",
  descricao:
    "Como estruturamos nossa operação pra faturar mais de 10 mil reais por mês com IA para negócios, sem ser um vendedor chato",
  quando: "Toda quinta",
  horario: "20h",
  /**
   * Curto de propósito. A faixa tem 150px de altura: em 320px de largura o
   * botão ocupa a linha inteira, e qualquer copy mais longa quebra em duas
   * linhas e estoura o teto. "Entre no grupo pra receber o link da aula"
   * cabia com 250px, não cabe com 150.
   */
  cta: "Entrar no grupo",
  /**
   * Redirecionador (Sendflow) que distribui entre os grupos de WhatsApp.
   * Diferente da F082, **não é env**: é link de marketing, não é segredo e
   * não muda por ambiente.
   *
   * Sem UTM — redirecionador de WhatsApp não repassa query string.
   */
  url: "https://sndflw.com/i/JaDGKmxpDHdXT85jCpAg",
} as const;

export type FaixaDoTopo = "imersao" | "bastidores";

/**
 * F102 + F088 — o topo do Club carrega **uma** faixa por vez, nunca duas
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
