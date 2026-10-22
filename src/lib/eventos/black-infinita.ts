/** F117 — campanha da Black Friday 2026 no topo do Builders Club. */
export const BLACK_INFINITA = {
  aluno: {
    etiqueta: "BLACK EM DOBRO INFINITA · ALUNOS",
    titulo: "A melhor condição da nossa história",
    descricao: "Participe do grupo de alunos para a Black de 28/10.",
    data: "28 OUT",
    cta: "Entrar no grupo de alunos",
    href: "https://sndflw.com/i/sBjl9OjmppA8znba2jc3",
  },
  naoAluno: {
    etiqueta: "BLACK EM DOBRO INFINITA · LIVE GRATUITA",
    titulo: "A melhor condição da nossa história",
    descricao: "DevQuest + Builders Club com acesso vitalício. Live em 05/11 às 20h.",
    data: "05 NOV · 20H",
    cta: "Entrar na lista da live",
    href: "https://blackinfinita.devemdobro.com/",
  },
} as const;

export function blackBannerFor(isPaid: boolean) {
  return isPaid ? BLACK_INFINITA.aluno : BLACK_INFINITA.naoAluno;
}

const INICIO = new Date("2026-10-21T00:00:00-03:00").getTime();
const FIM = new Date("2026-11-06T00:00:00-03:00").getTime();

/** O banner sai após o dia da live, sem depender de retirada manual. */
export function blackAtiva(agora = new Date()): boolean {
  const instante = agora.getTime();
  return instante >= INICIO && instante < FIM;
}
