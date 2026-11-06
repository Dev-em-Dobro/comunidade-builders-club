/** F117 — campanha da Black Friday 2026 no topo do Builders Club. */
export const BLACK_INFINITA = {
  aluno: {
    etiqueta: "BLACK EM DOBRO INFINITA · ALUNOS",
    titulo: "A melhor condição da história da Dev em Dobro",
    descricao: "Live gratuita 05/11 às 20h.",
    data: "",
    cta: "Acessar a oferta",
    href: "https://blackinfinita.devemdobro.com/alunos-dq",
  },
  naoAluno: {
    etiqueta: "BLACK EM DOBRO INFINITA · LIVE GRATUITA",
    titulo: "A melhor condição da nossa história",
    descricao: "DevQuest + Builders Club com acesso vitalício. Live em 05/11 às 20h.",
    data: "05 NOV · 20H",
    cta: "Acessar oferta",
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
