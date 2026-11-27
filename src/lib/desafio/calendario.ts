export const START = "2026-12-01";
export const END = "2027-01-14";
export const LAST_ENROLLMENT_DAY = "2026-12-14";
const DAY_MS = 86_400_000;
const saoPauloDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit",
});

export function dayInSaoPaulo(value: Date) {
  return saoPauloDate.format(value);
}

export function dayDistance(from: string, to: string) {
  return (Date.parse(to) - Date.parse(from)) / DAY_MS;
}

export function addDays(date: string, days: number) {
  return new Date(Date.parse(date) + days * DAY_MS).toISOString().slice(0, 10);
}

export function shortDay(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC", day: "2-digit", month: "2-digit",
  }).format(new Date(date));
}

const longDate = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long" });
const weekdayShort = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", weekday: "short" });

/** "Quarta, 9 de dezembro" para uma data AAAA-MM-DD. */
export function longDay(date: string) {
  const text = longDate.format(new Date(date)).replace("-feira", "");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** "qua, 9/12" para uma data AAAA-MM-DD. */
export function weekdayDay(date: string) {
  return `${weekdayShort.format(new Date(date)).replace(".", "")}, ${Number(date.slice(8, 10))}/${Number(date.slice(5, 7))}`;
}

export const PHASES = ["Rede quente", "Volume", "Manter aquecido", "Fechar"] as const;

export const WEEKS = [
  { number: 1, phase: 1, warm: 30, cold: 40, milestone: "Publique o portfólio e conclua as aulas da fase 1." },
  { number: 2, phase: 2, warm: 0, cold: 30, milestone: "Conclua as aulas da fase 2 e retorne a quem respondeu." },
  { number: 3, phase: 2, warm: 0, cold: 30, milestone: "Defina o próximo passo dos interessados." },
  { number: 4, phase: 3, warm: 0, cold: 0, milestone: "Envie o check-in e mantenha ativas as conversas abertas." },
  { number: 5, phase: 3, warm: 0, cold: 10, milestone: "Faça uma retomada leve e envie o check-in." },
  { number: 6, phase: 4, warm: 0, cold: 30, milestone: "Retome as conversas e avance nas negociações." },
  { number: 7, phase: 4, warm: 0, cold: 0, milestone: "Registre o resultado final do desafio." },
].map((week) => ({
  ...week,
  start: addDays(START, (week.number - 1) * 7),
  end: week.number === 7 ? END : addDays(START, week.number * 7 - 1),
  phaseName: PHASES[week.phase - 1]!,
}));

export type ChallengeWeek = (typeof WEEKS)[number];

// Texto curto de cada dia, transcrito do roteiro do desafio (canvas de design).
const MISSIONS = [
  "Abertura ao vivo. Nicho, oferta, lista de 30+ quentes e 10 abordados",
  "Mais 10 quentes. Modelo de portfólio",
  "Mais 10 quentes (30 no mínimo) e 1º lote de frias",
  "Frias",
  "Frias no horário do nicho",
  "Dia leve: aulas e portfólio",
  "Check-in · marco da semana 1",
  "Checkpoint ao vivo. Início da Fase 2",
  "Frias e retorno aos quentes",
  "Frias e retornos frios",
  "Briefing com interessados",
  "Fechar 30 frias da semana",
  "Dia leve: funil e aulas",
  "Check-in · marco da semana 2",
  "Checkpoint: respostas",
  "Frias e diagnóstico",
  "Briefings e propostas",
  "Fechar 30 frias da semana",
  "Ajustar proposta e portfólio",
  "Livre",
  "Check-in · marco da semana 3",
  "Checkpoint por escrito",
  "Conversas ativas",
  "Opcional: agendar janeiro",
  "Pausa",
  "Opcional: portfólio",
  "Pausa",
  "Check-in curto",
  "Checkpoint por escrito",
  "Só negociações ativas",
  "Opcional: lista de janeiro",
  "Pausa",
  "Preparar novos leads",
  "Pausa",
  "10 frias · check-in",
  "Checkpoint ao vivo",
  "Frias e retomadas",
  "Briefing e propostas",
  "Fechar 30 frias da semana",
  "Objeções e próximas conversas",
  "Pausa",
  "Check-in · todo lead com próximo passo",
  "Último checkpoint ao vivo",
  "Fechar negociações e contrato",
  "Registrar resultado final",
] as const;

/** Dias de pausa ou opcionais (tracejados no calendário). */
const LIGHT_DAYS = new Set([6, 13, 20, 24, 25, 26, 27, 31, 32, 34, 41]);

export const DAYS = MISSIONS.map((mission, index) => ({
  number: index + 1,
  date: addDays(START, index),
  week: WEEKS[Math.floor(index / 7)]!,
  mission,
  light: LIGHT_DAYS.has(index + 1),
}));

export type ChallengeDay = (typeof DAYS)[number];

/** Situação da turma num dia (AAAA-MM-DD, fuso de SP). */
export function challengeMoment(today: string) {
  if (today < START) return { stage: "antes" as const, daysToStart: dayDistance(today, START) };
  if (today > END) return { stage: "depois" as const };
  const day = DAYS[dayDistance(START, today)]!;
  return { stage: "durante" as const, day, daysLeft: dayDistance(today, END) };
}

/** Rótulo curto do menu lateral. */
export function navSubtitle(today: string) {
  const moment = challengeMoment(today);
  if (moment.stage === "antes") return "Começa em 1/12";
  if (moment.stage === "depois") return "Turma encerrada";
  return `Dia ${moment.day.number} de 45 · Fase ${moment.day.week.phase}`;
}

/**
 * Data simulada para QA (`?agora=AAAA-MM-DD` ou `AAAA-MM-DDTHH:MM`, horário de
 * SP), só fora de produção e para a equipe. Sem hora, usa meio-dia.
 */
export function simulatedNow(param: string | undefined, allowed: boolean, now = new Date()) {
  const match = param?.match(/^(\d{4}-\d{2}-\d{2})(?:T(\d{2}:\d{2}))?$/);
  if (!allowed || !match) return now;
  const parsed = new Date(`${match[1]}T${match[2] ?? "12:00"}:00-03:00`);
  return Number.isNaN(parsed.getTime()) ? now : parsed;
}

export function weekOn(day: string) {
  const index = Math.floor(dayDistance(START, day) / 7);
  return WEEKS[Math.max(0, Math.min(index, WEEKS.length - 1))]!;
}

export function checkinWindow(week: ChallengeWeek) {
  // São Paulo segue UTC−03 durante toda a turma.
  return {
    opens: new Date(`${week.number === 7 ? week.start : week.end}T00:00:00-03:00`),
    closes: new Date(week.number === 7
      ? `${addDays(END, 1)}T00:00:00-03:00`
      : `${addDays(week.end, 1)}T12:00:00-03:00`),
  };
}

export function canCheckIn(week: ChallengeWeek, joinedWeek: number, now: Date) {
  const { opens, closes } = checkinWindow(week);
  return week.number >= joinedWeek && now >= opens && now < closes;
}
