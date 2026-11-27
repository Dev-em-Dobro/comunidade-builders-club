import { dayDistance } from "./calendario";
import type { challengeProgress } from "./progresso";

type Progress = ReturnType<typeof challengeProgress>;

export type TeamEntry = {
  enrollment: {
    userId: string; status: string; whatsapp: string; workStage: string; offer: string; weeklyHours: string;
    hasPortfolio: boolean; hasWarmContacts: boolean; motivation: string; appliedAt: Date; approvedAt: Date | null;
    joinedWeek: number | null; removedReason: string | null;
  };
  user: { name: string; email: string; profile: { displayName: string | null } | null };
  progress: Progress | null;
};

export const TEAM_FILTERS = {
  atrasados: "Atrasados",
  "sem-checkin": "Sem check-in",
  "sem-orion": "Sem conta Orion",
  proposta: "Com proposta aberta",
} as const;
export type TeamFilter = keyof typeof TEAM_FILTERS;

export function isTeamFilter(value: string | undefined): value is TeamFilter {
  return Boolean(value && value in TEAM_FILTERS);
}

export function teamRow(entry: TeamEntry) {
  const { enrollment, user, progress } = entry;
  const lastCheckin = progress?.weeks.filter((week) => week.checkin).at(-1);
  const lessonsDone = progress?.lessons.filter((lesson) => lesson.completedAt).length ?? 0;
  const lastRecordDay = progress?.lastRecordDay ?? null;
  // Sem check-in = a última semana com janela encerrada (desde a entrada) ficou sem envio.
  const lastClosed = progress?.weeks.filter((week) => week.eligible && week.expired).at(-1);
  return {
    userId: enrollment.userId,
    name: user.profile?.displayName || user.name,
    email: user.email,
    whatsapp: enrollment.whatsapp,
    status: enrollment.status,
    joinedWeek: enrollment.joinedWeek,
    offer: enrollment.offer,
    workStage: enrollment.workStage,
    weeklyHours: enrollment.weeklyHours,
    motivation: enrollment.motivation,
    removedReason: enrollment.removedReason,
    appliedAt: enrollment.appliedAt,
    farol: progress?.farol ?? null,
    warmWeek: progress?.current.warmCount ?? 0,
    warmTotal: progress?.totalWarm ?? 0,
    points: progress?.score.total ?? 0,
    badgesEarned: progress?.badges.filter((badge) => badge.earned).map((badge) => badge.label) ?? [],
    coldWeek: progress?.current.coldCount ?? 0,
    coldTarget: progress?.current.cold ?? 0,
    coldTotal: progress?.coldTotal ?? 0,
    orion: progress?.coldStatus ?? null,
    lessons: progress ? `${lessonsDone}/${progress.lessons.length}` : "—",
    lastCheckinWeek: lastCheckin?.number ?? null,
    blocker: lastCheckin?.checkin?.blocker ?? "",
    portfolioUrl: progress?.weeks.find((week) => week.checkin?.portfolioUrl)?.checkin?.portfolioUrl ?? "",
    lastRecordDay,
    lastRecordAgo: lastRecordDay && progress ? relativeDays(dayDistance(lastRecordDay, progress.today)) : "sem registro",
    proposals: (progress?.proposals ?? 0) + (progress?.coldProposals ?? 0),
    sales: (progress?.sales ?? 0) + (progress?.coldSales ?? 0),
    declaredSales: progress?.declaredSales ?? 0,
    missingCheckin: Boolean(lastClosed && !lastClosed.checkin),
  };
}

export type TeamRow = ReturnType<typeof teamRow>;

export function filterRows(rows: TeamRow[], filter: TeamFilter | undefined) {
  if (!filter) return rows;
  if (filter === "atrasados") return rows.filter((row) => row.farol?.color === "red");
  if (filter === "sem-checkin") return rows.filter((row) => row.missingCheckin);
  if (filter === "sem-orion") return rows.filter((row) => row.orion === "nao-encontrado");
  return rows.filter((row) => row.proposals > 0);
}

export function teamTotals(rows: TeamRow[]) {
  const approved = rows.filter((row) => row.status === "aprovado");
  const colors = { green: 0, yellow: 0, red: 0, upcoming: 0 };
  for (const row of approved) if (row.farol) colors[row.farol.color] += 1;
  const rated = colors.green + colors.yellow + colors.red;
  return {
    enrolled: approved.length,
    pending: rows.filter((row) => row.status === "pendente").length,
    onTrackPct: rated ? Math.round((colors.green / rated) * 100) : null,
    colors,
    warm: approved.reduce((sum, row) => sum + row.warmTotal, 0),
    cold: approved.reduce((sum, row) => sum + row.coldTotal, 0),
    proposals: approved.reduce((sum, row) => sum + row.proposals, 0),
    sales: approved.reduce((sum, row) => sum + row.sales, 0),
    declaredSales: approved.reduce((sum, row) => sum + row.declaredSales, 0),
  };
}

function relativeDays(days: number) {
  if (days <= 0) return "hoje";
  if (days === 1) return "ontem";
  return `há ${days} dias`;
}

const CSV_COLUMNS: [string, (row: TeamRow) => string | number | null][] = [
  ["nome", (row) => row.name],
  ["email", (row) => row.email],
  ["whatsapp", (row) => row.whatsapp],
  ["status", (row) => row.status],
  ["semana_entrada", (row) => row.joinedWeek],
  ["farol", (row) => row.farol?.label ?? ""],
  ["pontos", (row) => row.points],
  ["selos", (row) => row.badgesEarned.join(" | ")],
  ["quentes_semana", (row) => row.warmWeek],
  ["quentes_total", (row) => row.warmTotal],
  ["frias_semana", (row) => (row.orion === "indisponivel" ? "" : row.coldWeek)],
  ["frias_total", (row) => (row.orion === "indisponivel" ? "" : row.coldTotal)],
  ["conta_orion", (row) => ({ ok: "vinculada", "nao-encontrado": "não encontrada", indisponivel: "indisponível" } as const)[row.orion ?? "indisponivel"]],
  ["aulas_obrigatorias", (row) => row.lessons],
  ["ultimo_checkin_semana", (row) => row.lastCheckinWeek],
  ["onde_travou", (row) => row.blocker],
  ["portfolio", (row) => row.portfolioUrl],
  ["ultimo_registro", (row) => row.lastRecordDay ?? ""],
  ["propostas_abertas", (row) => row.proposals],
  ["fechados", (row) => row.sales],
  ["vendas_declaradas", (row) => row.declaredSales],
  ["oferta", (row) => row.offer],
  ["momento", (row) => row.workStage],
  ["horas_semana", (row) => row.weeklyHours],
  ["motivo_status", (row) => row.removedReason ?? ""],
];

function csvCell(value: string | number | null) {
  let text = value === null ? "" : String(value);
  // Evita injeção de fórmula ao abrir no Excel/Sheets.
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",;\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(rows: TeamRow[]) {
  const lines = [CSV_COLUMNS.map(([name]) => name).join(",")];
  for (const row of rows) lines.push(CSV_COLUMNS.map(([, get]) => csvCell(get(row))).join(","));
  return `﻿${lines.join("\r\n")}\r\n`;
}
