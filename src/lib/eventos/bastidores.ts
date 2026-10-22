import { imersaoAtiva } from "./imersao-ia";
import { blackAtiva } from "./black-infinita";

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

export type FaixaDoTopo = "black" | "imersao" | "bastidores";

/**
 * F117 + F102 + F088 — o topo do Club carrega **uma** faixa por vez, nunca duas
 * empilhadas.
 *
 * A Black tem prioridade durante a campanha. Depois dela, a Imersão tem
 * precedência enquanto existe (`imersaoAtiva`). Bastidores fica com o resto.
 *
 * O gate é `isElite`, não `isPaid`: a F088 corrigiu isso em 24/09 porque a
 * Imersão é **onde o Elite é vendido** — esconder a faixa do PRO tirava dela
 * justamente o público que ainda tem o que comprar. Quem não vê é só o Elite
 * (e staff, que `isEliteMembership` também devolve como Elite): convidar quem
 * já é seria vender o que a pessoa tem.
 */
export function faixaDoTopo(opts: {
  isElite: boolean;
  agora?: Date;
}): FaixaDoTopo {
  if (blackAtiva(opts.agora ?? new Date())) return "black";
  if (!opts.isElite && imersaoAtiva(opts.agora ?? new Date())) return "imersao";
  return "bastidores";
}
