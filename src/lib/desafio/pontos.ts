/**
 * F050 (fatia C) — pontos, selos e sequência, calculados a partir dos eventos.
 * Funções puras: sem Prisma nem Next; datas AAAA-MM-DD no fuso de SP.
 */
import { DAYS, END, START, addDays, dayInSaoPaulo, weekOn } from "./calendario";

export const POINTS = {
  cold: 2, warm: 3, followUp: 1, briefing: 10, proposta: 20, fechado: 100,
  lesson: 1, checkin: 5, milestone: 30,
} as const;
export const WARM_SCORED_PER_WEEK = 40;
export const STREAK_DAYS = 7;

export const WEEK_BADGES = ["Rede quente", "Em movimento", "Na mira", "Aquecido", "De volta", "Fechamento"] as const;

export type Breakdown = {
  cold: number; warm: number; followUps: number; funnel: number; lessons: number; checkins: number; milestones: number;
};
type Event = { type: string; at: Date };
type ScoreInput = {
  contacts: { events: Event[] }[];
  coldDays: { data: string; abordagens: number; retornos: number }[];
  coldFunnel: { qualificado: number; proposta: number; ganho: number } | null;
  lessons: { completedAt: Date | null | undefined }[];
  checkins: { week: number }[];
  weeks: { number: number; achieved: boolean; eligible: boolean; expired: boolean }[];
  through: string;
};

const empty = (): Breakdown => ({ cold: 0, warm: 0, followUps: 0, funnel: 0, lessons: 0, checkins: 0, milestones: 0 });
const sum = (b: Breakdown) => b.cold + b.warm + b.followUps + b.funnel + b.lessons + b.checkins + b.milestones;
const inWindow = (day: string, through: string) => day >= START && day <= through && day <= END;

export function scoreChallenge({ contacts, coldDays, coldFunnel, lessons, checkins, weeks, through }: ScoreInput) {
  const perWeek = weeks.map(empty);
  const overall = empty();
  const add = (week: number | null, key: keyof Breakdown, points: number) => {
    if (!points) return;
    overall[key] += points;
    if (week !== null) perWeek[week - 1]![key] += points;
  };

  // Quentes: primeira entrada em "abordado" por contato, até 40 pontuadas por semana.
  const approaches = contacts.flatMap((contact) => {
    const first = contact.events.find((event) => event.type === "abordado");
    return first ? [first.at] : [];
  }).filter((at) => inWindow(dayInSaoPaulo(at), through)).sort((a, b) => a.getTime() - b.getTime());
  const warmByWeek = new Map<number, number>();
  for (const at of approaches) {
    const week = weekOn(dayInSaoPaulo(at)).number;
    const count = (warmByWeek.get(week) ?? 0) + 1;
    warmByWeek.set(week, count);
    if (count <= WARM_SCORED_PER_WEEK) add(week, "warm", POINTS.warm);
  }

  for (const contact of contacts) {
    for (const event of contact.events) {
      const day = dayInSaoPaulo(event.at);
      if (event.type === "retorno" && inWindow(day, through)) add(weekOn(day).number, "followUps", POINTS.followUp);
    }
    // Funil: uma vez por contato, no primeiro dia em que chegou ao estágio.
    for (const stage of ["briefing", "proposta", "fechado"] as const) {
      const first = contact.events.find((event) => event.type === stage);
      const day = first && dayInSaoPaulo(first.at);
      if (day && inWindow(day, through)) add(weekOn(day).number, "funnel", POINTS[stage]);
    }
  }

  for (const day of coldDays) {
    if (!inWindow(day.data, through)) continue;
    const week = weekOn(day.data).number;
    add(week, "cold", day.abordagens * POINTS.cold);
    add(week, "followUps", day.retornos * POINTS.followUp);
  }
  // Funil frio sem data (retrato do Orion): só no geral.
  if (coldFunnel) {
    add(null, "funnel", coldFunnel.qualificado * POINTS.briefing + coldFunnel.proposta * POINTS.proposta + coldFunnel.ganho * POINTS.fechado);
  }

  for (const lesson of lessons) {
    if (!lesson.completedAt) continue;
    const day = dayInSaoPaulo(lesson.completedAt);
    if (day > through || day > END) continue;
    add(day < START ? 1 : weekOn(day).number, "lessons", POINTS.lesson);
  }

  for (const checkin of checkins) if (weeks[checkin.week - 1]) add(checkin.week, "checkins", POINTS.checkin);
  for (const week of weeks) if (week.achieved) add(week.number, "milestones", POINTS.milestone);

  return {
    total: sum(overall),
    breakdown: overall,
    weekTotals: perWeek.map(sum),
    weekBreakdown: perWeek,
  };
}

/** Dias (AAAA-MM-DD) com pelo menos uma abordagem ou retorno, quente ou frio. */
export function activeDays(contacts: { events: Event[] }[], coldDays: ScoreInput["coldDays"], through: string) {
  const days = new Set<string>();
  for (const contact of contacts) {
    for (const event of contact.events) {
      if (event.type !== "abordado" && event.type !== "retorno") continue;
      const day = dayInSaoPaulo(event.at);
      if (inWindow(day, through)) days.add(day);
    }
  }
  for (const day of coldDays) if (day.abordagens + day.retornos > 0 && inWindow(day.data, through)) days.add(day.data);
  return days;
}

export function streaks(days: Set<string>, today: string) {
  let longest = 0;
  let run = 0;
  for (const { date } of DAYS) {
    if (date > today) break;
    run = days.has(date) ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  // Sequência atual: termina hoje ou ontem (hoje ainda pode ser feito).
  let current = 0;
  let cursor = days.has(today) ? today : addDays(today, -1);
  while (days.has(cursor)) {
    current += 1;
    cursor = addDays(cursor, -1);
  }
  return { longest, current };
}

export type BadgeKind = "semana" | "sequencia" | "cliente" | "constancia";
export type ChallengeBadge = { id: string; kind: BadgeKind; label: string; detail: string; week?: number; earned: boolean };

export function challengeBadges({ weeks, longestStreak, firstClient }: {
  weeks: { number: number; achieved: boolean; eligible: boolean; expired: boolean }[];
  longestStreak: number;
  firstClient: boolean;
}): ChallengeBadge[] {
  const eligible = weeks.filter((week) => week.eligible);
  const allDone = eligible.length > 0 && eligible.every((week) => week.achieved);
  return [
    ...WEEK_BADGES.map((label, index) => ({
      id: `semana-${index + 1}`, kind: "semana" as const, week: index + 1, label,
      detail: `Marco da semana ${index + 1}`, earned: Boolean(weeks[index]?.achieved),
    })),
    { id: "sequencia-7", kind: "sequencia", label: "Sequência 7", detail: "7 dias seguidos prospectando", earned: longestStreak >= STREAK_DAYS },
    { id: "primeiro-cliente", kind: "cliente", label: "Primeiro cliente", detail: "Libera 4 Hot Seats com os gêmeos", earned: firstClient },
    { id: "constancia-total", kind: "constancia", label: "Constância total", detail: "Todos os marcos do desafio", earned: allDone },
  ];
}
