import type { MembershipTier, Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { PROJETOS_SPACE_SLUG } from "@/lib/spaces/constants";
import {
  firstLeadAtByEmail,
  orionCsConfigured,
  proposalEmailsInRange,
} from "@/lib/orion/leitura-cs";
import {
  addDays,
  currentMonthRange,
  inRange,
  isOnOrAfterCohort,
  lastClosedWeek,
  previousWeeks,
  type WeekRange,
} from "./cs-weeks";
import { tierLabel } from "@/lib/membership/capabilities";
import type { CsCard, CsMetrics, CsPerson, CsRatioSeries } from "./cs-metrics-types";

export type { CsCard, CsMetrics, CsPerson, CsRatioSeries } from "./cs-metrics-types";

const STORE_SOURCES = new Set(["hubla", "tmb", "orion"]);
const MS_DAY = 24 * 60 * 60 * 1000;
const STALE_MS = 14 * MS_DAY;
const PAID_TIERS = new Set<MembershipTier>(["paid", "pro", "elite"]);

type MemberRow = {
  userId: string;
  displayName: string;
  email: string;
  role: Role;
  tier: MembershipTier;
  loginAt: Date;
  allowlistAt: Date | null;
  allowlistSource: string | null;
};

function isPaidNow(tier: MembershipTier): boolean {
  return PAID_TIERS.has(tier);
}

function isStorePagante(
  allowlistAt: Date | null,
  source: string | null,
  loginAt: Date,
): boolean {
  if (!allowlistAt || !source || !STORE_SOURCES.has(source)) return false;
  return allowlistAt.getTime() <= loginAt.getTime() + MS_DAY;
}

function entradaDe(m: MemberRow): Date {
  if (isStorePagante(m.allowlistAt, m.allowlistSource, m.loginAt)) {
    return m.allowlistAt!;
  }
  return m.loginAt;
}

export function postTemLinkPublico(
  linkUrl: string | null | undefined,
  body: string,
): boolean {
  const link = linkUrl?.trim() ?? "";
  if (/^https:\/\//i.test(link) && !link.startsWith("builders-club:")) {
    return true;
  }
  return /https:\/\/[^\s)>\]]+/i.test(body);
}

function toPerson(
  m: MemberRow,
  entrada: Date,
  inNumerator: boolean,
  note?: string,
): CsPerson {
  return {
    userId: m.userId,
    displayName: m.displayName,
    email: m.email,
    entrada: entrada.toISOString(),
    inNumerator,
    note,
  };
}

function sortPeople(people: CsPerson[]): CsPerson[] {
  return [...people].sort((a, b) => {
    if (a.inNumerator !== b.inNumerator) return a.inNumerator ? -1 : 1;
    return a.displayName.localeCompare(b.displayName, "pt-BR");
  });
}

function ratioLabel(x: number, y: number, pct = false): string {
  if (pct) {
    if (y === 0) return "0 de 0";
    return `${x} de ${y} (${Math.round((x / y) * 100)}%)`;
  }
  return `${x} de ${y}`;
}

function maxDate(dates: Array<Date | null | undefined>): Date | null {
  let best: Date | null = null;
  for (const d of dates) {
    if (!d) continue;
    if (!best || d > best) best = d;
  }
  return best;
}

async function loadMembers(): Promise<MemberRow[]> {
  const memberships = await prisma.membership.findMany({
    where: {
      status: "active",
      role: "member",
    },
    select: {
      userId: true,
      tier: true,
      role: true,
      createdAt: true,
      user: {
        select: {
          email: true,
          profile: { select: { displayName: true, joinedAt: true } },
        },
      },
    },
  });

  const emails = memberships.map((m) => m.user.email.toLowerCase());
  const allowlist =
    emails.length === 0
      ? []
      : await prisma.allowedEmail.findMany({
          where: { email: { in: emails } },
          select: { email: true, createdAt: true, source: true },
        });
  const allowByEmail = new Map(
    allowlist.map((a) => [a.email.toLowerCase(), a]),
  );

  return memberships.map((m) => {
    const email = m.user.email.toLowerCase();
    const allow = allowByEmail.get(email);
    return {
      userId: m.userId,
      displayName: m.user.profile?.displayName ?? email,
      email,
      role: m.role,
      tier: m.tier,
      loginAt: m.user.profile?.joinedAt ?? m.createdAt,
      allowlistAt: allow?.createdAt ?? null,
      allowlistSource: allow?.source ?? null,
    };
  });
}

type AtivacaoOpts = {
  windowDays: number;
  week: WeekRange;
  members: Array<{ member: MemberRow; entrada: Date }>;
  activated: (userId: string, entrada: Date) => boolean;
};

function ativacaoNaSemana({
  windowDays,
  week,
  members,
  activated,
}: AtivacaoOpts): { x: number; y: number; people: CsPerson[] } {
  const people: CsPerson[] = [];
  for (const { member, entrada } of members) {
    const prazo = addDays(entrada, windowDays);
    if (!inRange(prazo, week.start, week.end)) continue;
    const ok = activated(member.userId, entrada);
    people.push(toPerson(member, entrada, ok, ok ? "ativou no prazo" : "não ativou no prazo"));
  }
  const sorted = sortPeople(people);
  return {
    x: sorted.filter((p) => p.inNumerator).length,
    y: sorted.length,
    people: sorted,
  };
}

export async function loadCsMetrics(now = new Date()): Promise<CsMetrics> {
  const closed = lastClosedWeek(now);
  const weeks = previousWeeks(closed, 4);
  const month = currentMonthRange(now);
  const members = await loadMembers();

  const cohort: Array<{
    member: MemberRow;
    entrada: Date;
    origemPagante: boolean;
  }> = [];
  for (const member of members) {
    const origemPagante = isStorePagante(
      member.allowlistAt,
      member.allowlistSource,
      member.loginAt,
    );
    const entrada = entradaDe(member);
    if (!isOnOrAfterCohort(entrada)) continue;
    cohort.push({ member, entrada, origemPagante });
  }

  const pagantesOrigem = cohort.filter((c) => c.origemPagante);
  const freesOrigem = cohort.filter((c) => !c.origemPagante);
  const pagosAgora = cohort.filter((c) => isPaidNow(c.member.tier));

  const userIds = cohort.map((c) => c.member.userId);
  const emails = cohort.map((c) => c.member.email);

  const emptyActs = {
    lastPost: new Map<string, Date>(),
    lastComment: new Map<string, Date>(),
    lastReaction: new Map<string, Date>(),
    lastLesson: new Map<string, Date>(),
    projetoPosts: [] as Array<{
      authorId: string;
      createdAt: Date;
      linkUrl: string | null;
      body: string;
    }>,
  };

  const acts =
    userIds.length === 0
      ? emptyActs
      : await (async () => {
          const [posts, comments, reactions, lessons, projetoPosts] =
            await Promise.all([
              prisma.post.groupBy({
                by: ["authorId"],
                where: { authorId: { in: userIds } },
                _max: { createdAt: true },
              }),
              prisma.comment.groupBy({
                by: ["authorId"],
                where: { authorId: { in: userIds } },
                _max: { createdAt: true },
              }),
              prisma.reaction.groupBy({
                by: ["userId"],
                where: { userId: { in: userIds } },
                _max: { createdAt: true },
              }),
              prisma.lessonProgress.groupBy({
                by: ["userId"],
                where: { userId: { in: userIds } },
                _max: { updatedAt: true },
              }),
              prisma.post.findMany({
                where: {
                  authorId: { in: userIds },
                  space: { slug: PROJETOS_SPACE_SLUG },
                },
                select: {
                  authorId: true,
                  createdAt: true,
                  linkUrl: true,
                  body: true,
                },
              }),
            ]);
          return {
            lastPost: new Map(
              posts
                .filter((r) => r._max.createdAt)
                .map((r) => [r.authorId, r._max.createdAt!]),
            ),
            lastComment: new Map(
              comments
                .filter((r) => r._max.createdAt)
                .map((r) => [r.authorId, r._max.createdAt!]),
            ),
            lastReaction: new Map(
              reactions
                .filter((r) => r._max.createdAt)
                .map((r) => [r.userId, r._max.createdAt!]),
            ),
            lastLesson: new Map(
              lessons
                .filter((r) => r._max.updatedAt)
                .map((r) => [r.userId, r._max.updatedAt!]),
            ),
            projetoPosts,
          };
        })();

  const activatedProjetos = (userId: string, entrada: Date) => {
    const prazo = addDays(entrada, 7);
    return acts.projetoPosts.some(
      (p) =>
        p.authorId === userId &&
        p.createdAt <= prazo &&
        postTemLinkPublico(p.linkUrl, p.body),
    );
  };

  const seriesPagante: CsRatioSeries[] = weeks.map((week) => {
    const r = ativacaoNaSemana({
      windowDays: 7,
      week,
      members: pagantesOrigem,
      activated: activatedProjetos,
    });
    return { label: week.label, x: r.x, y: r.y };
  });
  const ativados7 = ativacaoNaSemana({
    windowDays: 7,
    week: closed,
    members: pagantesOrigem,
    activated: activatedProjetos,
  });

  const staleCutoff = new Date(now.getTime() - STALE_MS);
  const parados: CsPerson[] = [];
  for (const { member, entrada } of pagosAgora) {
    if (entrada > staleCutoff) continue;
    const last = maxDate([
      acts.lastPost.get(member.userId),
      acts.lastComment.get(member.userId),
      acts.lastReaction.get(member.userId),
      acts.lastLesson.get(member.userId),
    ]);
    const lastOrNever = last ?? entrada;
    if (lastOrNever > staleCutoff) continue;
    parados.push(
      toPerson(
        member,
        entrada,
        true,
        last ? "sem atividade há 14+ dias" : "sem atividade desde a entrada",
      ),
    );
  }

  const orionOn = orionCsConfigured();
  let firstLead = new Map<string, Date>();
  let proposalEmails = new Set<string>();
  let orionError = false;
  if (orionOn && emails.length > 0) {
    try {
      [firstLead, proposalEmails] = await Promise.all([
        firstLeadAtByEmail(emails),
        proposalEmailsInRange(emails, closed.start, closed.end),
      ]);
    } catch (err) {
      console.error("[F057] falha ao ler Orion", err);
      orionError = true;
    }
  }

  const propostasPeople = sortPeople(
    pagosAgora
      .filter((c) => proposalEmails.has(c.member.email))
      .map((c) =>
        toPerson(c.member, c.entrada, true, tierLabel(c.member.tier)),
      ),
  );

  const entradasFree = sortPeople(
    freesOrigem
      .filter((c) => inRange(c.entrada, closed.start, closed.end))
      .map((c) => toPerson(c.member, c.entrada, true)),
  );

  const emailByUserId = new Map(
    freesOrigem.map((c) => [c.member.userId, c.member.email]),
  );
  const activatedOrion = (userId: string, entrada: Date) => {
    const email = emailByUserId.get(userId);
    if (!email) return false;
    const first = firstLead.get(email);
    if (!first) return false;
    return first <= addDays(entrada, 3);
  };
  const ativados3 = ativacaoNaSemana({
    windowDays: 3,
    week: closed,
    members: freesOrigem,
    activated: activatedOrion,
  });

  const freeNoMes = freesOrigem.filter((c) =>
    inRange(c.entrada, month.start, month.end),
  );
  const conversoes = sortPeople(
    freeNoMes.map((c) =>
      toPerson(
        c.member,
        c.entrada,
        isPaidNow(c.member.tier),
        isPaidNow(c.member.tier) ? tierLabel(c.member.tier) : "Gratuito",
      ),
    ),
  );
  const conversoesX = conversoes.filter((p) => p.inNumerator).length;

  const orionHint = !orionOn
    ? "ORION_DATABASE_URL ausente neste ambiente."
    : orionError
      ? "Não deu pra ler o Orion agora."
      : "";

  const cards: CsCard[] = [
    {
      id: "ativados-7d",
      group: "pagante",
      title: "Ativados em 7 dias",
      hint: `Pagantes cujo prazo (entrada + 7 dias) fechou em ${closed.label}. X postou link público no Desafio Projetos nesse prazo.`,
      value: ratioLabel(ativados7.x, ativados7.y),
      series: seriesPagante,
      people: ativados7.people,
    },
    {
      id: "parados-14d",
      group: "pagante",
      title: "Parados há 14 dias",
      hint: "Plano pago agora, sem post, comentário, reação ou aula há duas semanas.",
      value: String(parados.length),
      people: sortPeople(parados),
    },
    {
      id: "propostas-semana",
      group: "pagante",
      title: "Propostas enviadas na semana",
      hint:
        orionHint ||
        `Lead marcado como proposta no Orion em ${closed.label}, cruzado pelo e-mail.`,
      value:
        !orionOn || orionError ? "—" : String(propostasPeople.length),
      unavailable: !orionOn || orionError,
      people: orionOn && !orionError ? propostasPeople : [],
    },
    {
      id: "entradas-free",
      group: "free",
      title: "Entradas no Free na semana",
      hint: `Cadastros origem Free com entrada em ${closed.label}.`,
      value: String(entradasFree.length),
      people: entradasFree,
    },
    {
      id: "free-ativados-3d",
      group: "free",
      title: "Free ativados em 3 dias",
      hint:
        orionHint ||
        `Free cujo prazo (entrada + 3 dias) fechou em ${closed.label}. X rodou a primeira busca no Orion nesse prazo.`,
      value:
        !orionOn || orionError
          ? "—"
          : ratioLabel(ativados3.x, ativados3.y),
      unavailable: !orionOn || orionError,
      people: orionOn && !orionError ? ativados3.people : [],
    },
    {
      id: "free-virou-pro",
      group: "free",
      title: "% Free que virou Pro no mês",
      hint: `Origem Free com entrada em ${month.label} que hoje está Pro ou Elite.`,
      value: ratioLabel(conversoesX, conversoes.length, true),
      people: conversoes,
    },
  ];

  return {
    closedWeekLabel: closed.label,
    cohortLabel: "desde 24/08/2026",
    monthLabel: month.label,
    cards,
  };
}
