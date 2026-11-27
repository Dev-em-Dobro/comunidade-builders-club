import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ChallengeCheckin, ChallengeEnrollment, WarmContact, WarmContactEvent } from "@prisma/client";
import {
  DAYS, WEEKS, canCheckIn, challengeMoment, dayInSaoPaulo, longDay, navSubtitle, simulatedNow, weekOn,
} from "./calendario";
import { filterRows, teamRow, teamTotals, toCsv } from "./equipe";
import { awaitingReply, challengeProgress } from "./progresso";
import { autoApproves, checkinSchema, enrollmentSchema, nextStatuses } from "./regras";

const sp = (local: string) => new Date(`${local}-03:00`);

function enrollment(over: Partial<ChallengeEnrollment> = {}): ChallengeEnrollment {
  return {
    userId: "u1", status: "aprovado", whatsapp: "11999999999", workStage: "nunca fiz freela", offer: "sites",
    weeklyHours: "5–10h", hasPortfolio: false, hasWarmContacts: true, motivation: "agora", commitments: [],
    appliedAt: sp("2026-11-28T10:00:00"), approvedAt: sp("2026-11-28T10:00:00"), joinedWeek: 1, removedReason: null,
    ...over,
  };
}

let seq = 0;
function contact(events: [WarmContactEvent["type"], string][], status?: WarmContact["status"]) {
  const id = `c${++seq}`;
  const evs: WarmContactEvent[] = events.map(([type, at], i) => ({ id: `${id}-${i}`, contactId: id, type, at: sp(at) }));
  const approached = evs.find((event) => event.type === "abordado");
  return {
    id, userId: "u1", name: `Contato ${seq}`, kind: "negocio", note: null,
    status: status ?? (evs.filter((e) => !["retorno", "agendamento"].includes(e.type)).at(-1)?.type as WarmContact["status"] ?? "listado"),
    approachedAt: approached?.at ?? null, followUps: evs.filter((e) => e.type === "retorno").length, closedValue: null,
    nextFollowUpOn: null, createdAt: evs[0]!.at, updatedAt: evs.at(-1)!.at, events: evs,
  } as WarmContact & { events: WarmContactEvent[] };
}

function checkin(week: number, at: string, portfolioUrl: string | null = null): ChallengeCheckin {
  return { userId: "u1", week, blocker: "x", portfolioUrl, soldThisWeek: false, soldValue: null, submittedAt: sp(at) };
}

describe("calendário (America/Sao_Paulo)", () => {
  it("tem 45 dias, de terça 1/12 a quinta 14/1", () => {
    assert.equal(DAYS.length, 45);
    assert.equal(DAYS[0]!.date, "2026-12-01");
    assert.equal(DAYS[44]!.date, "2027-01-14");
    assert.equal(DAYS[6]!.week.number, 1);
    assert.equal(DAYS[7]!.week.number, 2);
    assert.equal(DAYS[42]!.week.number, 7);
  });

  it("segunda 23:30 ainda é a semana 1; terça 00:30 já é a semana 2", () => {
    assert.equal(weekOn(dayInSaoPaulo(sp("2026-12-07T23:30:00"))).number, 1);
    assert.equal(weekOn(dayInSaoPaulo(sp("2026-12-08T00:30:00"))).number, 2);
    // Em UTC já é dia 8, mas em SP ainda é dia 7.
    assert.equal(dayInSaoPaulo(new Date("2026-12-08T02:30:00Z")), "2026-12-07");
  });

  it("dia, fase e rótulos", () => {
    const m = challengeMoment("2026-12-09");
    assert.equal(m.stage, "durante");
    if (m.stage === "durante") {
      assert.equal(m.day.number, 9);
      assert.equal(m.day.week.phase, 2);
      assert.equal(m.daysLeft, 36);
    }
    assert.deepEqual(challengeMoment("2026-11-29"), { stage: "antes", daysToStart: 2 });
    assert.equal(challengeMoment("2027-01-15").stage, "depois");
    assert.equal(navSubtitle("2026-12-09"), "Dia 9 de 45 · Fase 2");
    assert.equal(longDay("2026-12-09"), "Quarta, 9 de dezembro");
  });

  it("metas: S1 30 quentes + 40 frias; S2/S3 30 frias; S4 nada; S5 10", () => {
    assert.deepEqual(WEEKS.map((w) => [w.warm, w.cold]), [[30, 40], [0, 30], [0, 30], [0, 0], [0, 10], [0, 30], [0, 0]]);
  });

  it("check-in: segunda até terça 12h, só a partir da semana de entrada", () => {
    const s1 = WEEKS[0]!;
    assert.equal(canCheckIn(s1, 1, sp("2026-12-06T23:59:00")), false);
    assert.equal(canCheckIn(s1, 1, sp("2026-12-07T00:00:00")), true);
    assert.equal(canCheckIn(s1, 1, sp("2026-12-08T11:59:00")), true);
    assert.equal(canCheckIn(s1, 1, sp("2026-12-08T12:00:00")), false);
    assert.equal(canCheckIn(s1, 2, sp("2026-12-07T10:00:00")), false);
  });

  it("data simulada só quando permitido", () => {
    const real = new Date("2026-11-26T15:00:00Z");
    assert.equal(simulatedNow("2026-12-09", false, real), real);
    assert.equal(simulatedNow("2026-12-09", true, real).toISOString(), "2026-12-09T15:00:00.000Z");
    assert.equal(dayInSaoPaulo(simulatedNow("2026-12-07T23:30", true, real)), "2026-12-07");
    assert.equal(simulatedNow("lixo", true, real), real);
  });
});

describe("cadastro", () => {
  const base = {
    whatsapp: "(11) 98765-4321", workStage: "nunca fiz freela", offer: "ainda não sei", weeklyHours: "3–5h",
    hasPortfolio: "nao", hasWarmContacts: "sim", motivation: "quero renda",
  };
  it("só aceita com os 5 compromissos", () => {
    assert.equal(enrollmentSchema.safeParse({ ...base, commitments: ["0", "1", "2", "3"] }).success, false);
    assert.equal(enrollmentSchema.safeParse({ ...base, commitments: ["0", "1", "2", "3", "4"] }).success, true);
  });
  it("aprovação automática só com a flag e ≥ 3h", () => {
    assert.equal(autoApproves(undefined, "3–5h"), false);
    assert.equal(autoApproves("false", "3–5h"), false);
    assert.equal(autoApproves("true", "menos de 3h"), false);
    assert.equal(autoApproves("true", "3–5h"), true);
  });
});

describe("contatos e progresso", () => {
  it("abordado conta uma vez, na semana do approachedAt", () => {
    const c = contact([["listado", "2026-12-01T10:00:00"], ["abordado", "2026-12-02T10:00:00"], ["respondeu", "2026-12-09T10:00:00"]]);
    const p = challengeProgress({ enrollment: enrollment(), contacts: [c], checkins: [], lessons: [], completions: [], now: sp("2026-12-10T10:00:00") });
    assert.equal(p.weeks[0]!.warmCount, 1);
    assert.equal(p.weeks[1]!.warmCount, 0);
    assert.equal(p.totalWarm, 1);
    assert.equal(p.waitingReply.length, 1);
  });

  it("status só avança um passo ou vai para perdido", () => {
    assert.deepEqual(nextStatuses("listado"), ["abordado", "perdido"]);
    assert.deepEqual(nextStatuses("fechado"), []);
  });

  it("retorno depois da resposta tira o alerta", () => {
    const c = contact([["abordado", "2026-12-02T10:00:00"], ["respondeu", "2026-12-03T10:00:00"], ["retorno", "2026-12-03T12:00:00"]], "respondeu");
    assert.equal(awaitingReply(c), false);
  });

  it("marco S1 exige 30 quentes, aulas da fase, portfólio e check-in", () => {
    const contacts = Array.from({ length: 30 }, () => contact([["abordado", "2026-12-03T10:00:00"]]));
    const lessons = [{ lessonId: "l1", phase: 1 }];
    const completions = [{ lessonId: "l1", completedAt: sp("2026-12-05T10:00:00") }];
    const args = { enrollment: enrollment(), contacts, lessons, completions, now: sp("2026-12-09T10:00:00") };
    assert.equal(challengeProgress({ ...args, checkins: [checkin(1, "2026-12-07T10:00:00")] }).weeks[0]!.achieved, false);
    assert.equal(challengeProgress({ ...args, checkins: [checkin(1, "2026-12-07T10:00:00", "https://x.dev")] }).weeks[0]!.achieved, true);
  });

  it("quem entra na S2 não fica vermelho pela S1", () => {
    const c = contact([["abordado", "2026-12-09T10:00:00"]]);
    const p = challengeProgress({
      enrollment: enrollment({ joinedWeek: 2, approvedAt: sp("2026-12-09T09:00:00") }),
      contacts: [c], checkins: [], lessons: [], completions: [], now: sp("2026-12-10T10:00:00"),
    });
    assert.equal(p.weeks[0]!.eligible, false);
    assert.notEqual(p.farol.color, "red");
  });

  it("4+ dias sem registro fica vermelho", () => {
    const c = contact([["abordado", "2026-12-01T10:00:00"]]);
    const p = challengeProgress({ enrollment: enrollment(), contacts: [c], checkins: [], lessons: [], completions: [], now: sp("2026-12-05T10:00:00") });
    assert.equal(p.farol.color, "red");
  });

  it("check-in S1 exige portfólio", () => {
    assert.equal(checkinSchema.safeParse({ week: "1", blocker: "preço", soldThisWeek: "nao" }).success, false);
    assert.equal(checkinSchema.safeParse({ week: "1", blocker: "preço", soldThisWeek: "nao", portfolioUrl: "https://a.dev" }).success, true);
    assert.equal(checkinSchema.safeParse({ week: "2", blocker: "preço", soldThisWeek: "nao" }).success, true);
  });
});

describe("painel da equipe", () => {
  const user = { name: "Ana", email: "ana@x.dev", profile: null };
  it("filtra atrasados e exporta CSV sem injeção de fórmula", () => {
    const red = challengeProgress({ enrollment: enrollment(), contacts: [], checkins: [], lessons: [], completions: [], now: sp("2026-12-06T10:00:00") });
    const rows = [
      teamRow({ enrollment: enrollment({ offer: "=HYPERLINK(1)" }), user, progress: red }),
      teamRow({ enrollment: enrollment({ userId: "u2", status: "pendente" }), user, progress: null }),
    ];
    assert.equal(filterRows(rows, "atrasados").length, 1);
    assert.equal(teamTotals(rows).pending, 1);
    const csv = toCsv(rows);
    assert.match(csv, /'=HYPERLINK\(1\)/);
    assert.equal(csv.trim().split("\r\n").length, 3);
  });
});
