/**
 * F057 — semanas e calendário CS em America/Sao_Paulo.
 * Sem horário de verão no Brasil desde 2019: BRT = UTC−3 o ano todo.
 */

export const CS_TZ = "America/Sao_Paulo";
export const CS_COHORT_START = new Date("2026-08-24T03:00:00.000Z"); // 24/08 00:00 BRT
const MS_DAY = 24 * 60 * 60 * 1000;
const BRT_OFFSET_MS = 3 * 60 * 60 * 1000;

export type Ymd = { y: number; m: number; d: number };

export type WeekRange = {
  start: Date;
  end: Date;
  label: string;
};

export function ymdInBrt(date: Date): Ymd {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CS_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const n = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value);
  return { y: n("year"), m: n("month"), d: n("day") };
}

export function brtMidnight(y: number, m: number, d: number): Date {
  return new Date(Date.UTC(y, m - 1, d, 3, 0, 0, 0));
}

/** Segunda 00:00 BRT da semana ISO que contém `date`. */
export function startOfIsoWeekBrt(date: Date): Date {
  const { y, m, d } = ymdInBrt(date);
  const midnight = brtMidnight(y, m, d);
  const wd = new Date(midnight.getTime() + BRT_OFFSET_MS).getUTCDay(); // 0=dom
  const mon0 = wd === 0 ? 6 : wd - 1;
  return new Date(midnight.getTime() - mon0 * MS_DAY);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_DAY);
}

export function inRange(at: Date, start: Date, endExclusive: Date): boolean {
  return at >= start && at < endExclusive;
}

function monthShortPt(m: number): string {
  return [
    "jan",
    "fev",
    "mar",
    "abr",
    "mai",
    "jun",
    "jul",
    "ago",
    "set",
    "out",
    "nov",
    "dez",
  ][m - 1]!;
}

export function formatDayMonth(date: Date): string {
  const { d, m } = ymdInBrt(date);
  return `${d} ${monthShortPt(m)}`;
}

export function weekLabel(start: Date, endExclusive: Date): string {
  const last = addDays(endExclusive, -1);
  return `${formatDayMonth(start)}–${formatDayMonth(last)}`;
}

export function weekRangeFromStart(start: Date): WeekRange {
  const end = addDays(start, 7);
  return { start, end, label: weekLabel(start, end) };
}

/** Última semana segunda–domingo já fechada (a que a segunda atual encerrou). */
export function lastClosedWeek(now: Date): WeekRange {
  return weekRangeFromStart(addDays(startOfIsoWeekBrt(now), -7));
}

export function previousWeeks(closed: WeekRange, count: number): WeekRange[] {
  const out: WeekRange[] = [];
  for (let i = count - 1; i >= 0; i--) {
    out.push(weekRangeFromStart(addDays(closed.start, -i * 7)));
  }
  return out;
}

export function currentMonthRange(now: Date): { start: Date; end: Date; label: string } {
  const { y, m } = ymdInBrt(now);
  const start = brtMidnight(y, m, 1);
  const end =
    m === 12 ? brtMidnight(y + 1, 1, 1) : brtMidnight(y, m + 1, 1);
  return { start, end, label: `${monthShortPt(m)}/${y}` };
}

export function isOnOrAfterCohort(entrada: Date): boolean {
  return entrada >= CS_COHORT_START;
}
