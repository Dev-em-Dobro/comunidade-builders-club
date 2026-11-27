import type { ChallengeCheckin, ChallengeEnrollment, WarmContact, WarmContactEvent } from "@prisma/client";
import { addDays, checkinWindow, dayDistance, dayInSaoPaulo, END, START, weekOn, WEEKS } from "./calendario";

type Contact = WarmContact & { events: WarmContactEvent[] };
type Lesson = { lessonId: string; phase: number };
type Completion = { lessonId: string; completedAt: Date | null };
const COLORS = { green: "Em dia", yellow: "Atenção", red: "Atrasado", upcoming: "Aguardando início" } as const;

export function challengeProgress<T extends Lesson>({
  enrollment, contacts, checkins, lessons, completions, now,
}: {
  enrollment: ChallengeEnrollment;
  contacts: Contact[];
  checkins: ChallengeCheckin[];
  lessons: T[];
  completions: Completion[];
  now: Date;
}) {
  const today = dayInSaoPaulo(now);
  const through = today > END ? END : today;
  const currentWeek = weekOn(through);
  const joinedWeek = enrollment.joinedWeek ?? 1;
  const joinedOn = enrollment.approvedAt ? dayInSaoPaulo(enrollment.approvedAt) : START;
  const events = contacts.flatMap((contact) => contact.events.map((event) => ({
    ...event, day: dayInSaoPaulo(event.at),
  }))).filter((event) => event.day >= START && event.day <= through);
  const completionById = new Map(completions.map((completion) => [completion.lessonId, completion.completedAt]));
  const lessonsWithProgress = lessons.map((lesson) => {
    const completedAt = completionById.get(lesson.lessonId);
    const end = WEEKS.findLast((week) => week.phase === lesson.phase)?.end ?? END;
    return { ...lesson, completedAt, overdue: !completedAt && today > end };
  });
  const weeks = WEEKS.map((week) => {
    const checkin = checkins.find((item) => item.week === week.number);
    const warm = events.filter((event) => event.type === "abordado" && event.day >= week.start && event.day <= week.end).length;
    const returns = events.filter((event) => event.type === "retorno" && event.day >= week.start && event.day <= week.end).length;
    const responded = events.filter((event) => event.type === "respondeu" && event.day >= week.start && event.day <= week.end).length;
    // Aulas exigidas no marco: fase 1 na S1 e fase 2 na S2 (configuradas por seed).
    const required = week.number <= 2 ? lessons.filter((lesson) => lesson.phase === week.phase).length : 0;
    const completed = lessonsWithProgress.filter((lesson) =>
      lesson.phase === week.phase && lesson.completedAt && dayInSaoPaulo(lesson.completedAt) <= week.end,
    ).length;
    const contactsToFollow = contacts.filter((contact) => {
      const history = contact.events.filter((event) => dayInSaoPaulo(event.at) <= week.end);
      const response = history.find((event) => event.type === "respondeu");
      if (!response) return false;
      if (week.number === 2) {
        return !history.some((event) => event.type === "retorno" && event.at >= response.at);
      }
      return !history.some((event) =>
        ["briefing", "proposta", "fechado", "perdido", "agendamento"].includes(event.type) && event.at >= response.at,
      );
    });
    const eligible = week.number >= joinedWeek;
    const achieved = eligible && Boolean(checkin) && warm >= week.warm && completed >= required
      && (week.number !== 1 || Boolean(checkin?.portfolioUrl))
      && (![2, 3].includes(week.number) || contactsToFollow.length === 0);
    const expired = now >= checkinWindow(week).closes;
    return { ...week, checkin, warmCount: warm, returns, responded, pendingFollowUps: contactsToFollow.length, required, completed, achieved, expired, eligible };
  });

  const current = weeks[currentWeek.number - 1]!;
  const lastRecord = [
    ...events.map((event) => event.at),
    ...checkins.filter((item) => item.submittedAt <= now).map((item) => item.submittedAt),
    ...completions.flatMap((item) => item.completedAt ? [item.completedAt] : [])
      .filter((date) => dayInSaoPaulo(date) >= START && dayInSaoPaulo(date) <= through),
  ].sort((a, b) => b.getTime() - a.getTime())[0];
  const quietDays = dayDistance(
    [joinedOn, lastRecord ? dayInSaoPaulo(lastRecord) : START, START].sort().at(-1)!,
    through,
  );
  const previous = weeks[currentWeek.number - 2];
  const previousMissed = previous?.eligible && previous.expired
    && (current.phase === 3 ? !previous.checkin : !previous.achieved);
  const holiday = current.phase === 3;
  const elapsed = Math.max(0, dayDistance(current.start, through) + 1);
  const pace = Math.ceil(current.warm * elapsed / (dayDistance(current.start, current.end) + 1));
  let color: keyof typeof COLORS = "green";
  if (today < START) color = "upcoming";
  else if (previousMissed || (!holiday && quietDays >= 4) ||
    (holiday && !current.checkin && now >= checkinWindow(current).closes)) color = "red";
  else if (current.warmCount < pace || quietDays >= 2) color = "yellow";

  const reached = (contact: Contact, type: WarmContactEvent["type"]) =>
    contact.events.some((event) => event.type === type && dayInSaoPaulo(event.at) <= through);
  const funnel = (["abordado", "respondeu", "briefing", "proposta", "fechado"] as const).map((type) => ({
    type, total: contacts.filter((contact) => reached(contact, type)).length,
  }));
  const waitingReply = contacts.filter((contact) => contact.status === "respondeu" && awaitingReply(contact));

  return {
    funnel, waitingReply, totalContacts: contacts.length,
    today, current, weeks, lessons: lessonsWithProgress, lastRecord,
    farol: { color, label: COLORS[color] },
    totalWarm: events.filter((event) => event.type === "abordado").length,
    proposals: contacts.filter((contact) => contact.status === "proposta").length,
    totalProposals: events.filter((event) => event.type === "proposta").length,
    sales: events.filter((event) => event.type === "fechado").length,
    declaredSales: checkins.filter((item) => item.week <= 6 && item.soldThisWeek).length,
    nextCheckin: weeks.find((week) => week.eligible && !week.checkin && !week.expired),
    through: addDays(through, 0),
  };
}

/** Contato que respondeu e ainda não recebeu retorno depois da resposta. */
export function awaitingReply(contact: Contact) {
  const response = contact.events.findLast((event) => event.type === "respondeu");
  return Boolean(response) && !contact.events.some((event) => event.type === "retorno" && event.at >= response!.at);
}

/** Dias desde o último evento do contato (para "Sem resposta há N dias"). */
export function daysSinceLastEvent(contact: Contact, today: string) {
  const last = contact.events.at(-1);
  return last ? dayDistance(dayInSaoPaulo(last.at), today) : 0;
}
