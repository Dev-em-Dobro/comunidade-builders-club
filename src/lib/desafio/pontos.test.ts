import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { challengeBadges, scoreChallenge, streaks } from "./pontos";
import { buildRanking, positionOf, type RankingSource } from "./ranking";
import { prizeWinners } from "./premios";

const sp = (local: string) => new Date(`${local}-03:00`);
const weeks = (achieved: number[] = []) => Array.from({ length: 7 }, (_, i) => ({
  number: i + 1, achieved: achieved.includes(i + 1), eligible: true, expired: false,
}));
const contact = (...events: [string, string][]) => ({ events: events.map(([type, at]) => ({ type, at: sp(at) })) });
const base = { contacts: [], coldDays: [], coldFunnel: null, lessons: [], checkins: [], weeks: weeks(), through: "2027-01-14" };

describe("pontos", () => {
  it("quente vale 3 com limite de 40 pontuadas por semana", () => {
    const contacts = Array.from({ length: 45 }, () => contact(["abordado", "2026-12-02T10:00:00"]));
    const s = scoreChallenge({ ...base, contacts });
    assert.equal(s.breakdown.warm, 40 * 3);
    assert.equal(s.weekTotals[0], 120);
    const nextWeek = scoreChallenge({ ...base, contacts: [...contacts, contact(["abordado", "2026-12-08T10:00:00"])] });
    assert.equal(nextWeek.weekTotals[1], 3, "o limite é por semana");
  });

  it("tabela completa: frias, retornos, funil uma vez por contato, aulas, check-in e marco", () => {
    const s = scoreChallenge({
      ...base,
      contacts: [contact(
        ["abordado", "2026-12-02T10:00:00"], ["respondeu", "2026-12-03T10:00:00"], ["retorno", "2026-12-03T11:00:00"],
        ["briefing", "2026-12-04T10:00:00"], ["proposta", "2026-12-09T10:00:00"], ["fechado", "2026-12-10T10:00:00"],
      )],
      coldDays: [{ data: "2026-12-02", abordagens: 10, retornos: 2 }, { data: "2026-11-30", abordagens: 99, retornos: 0 }],
      coldFunnel: { qualificado: 1, proposta: 1, ganho: 0 },
      lessons: [{ completedAt: sp("2026-11-29T10:00:00") }, { completedAt: sp("2026-12-09T10:00:00") }, { completedAt: null }],
      checkins: [{ week: 1 }],
      weeks: weeks([1]),
    });
    assert.deepEqual(s.breakdown, { cold: 20, warm: 3, followUps: 3, funnel: 10 + 20 + 100 + 10 + 20, lessons: 2, checkins: 5, milestones: 30 });
    // S1: 20 frias + 3 quente + 3 retornos + 10 briefing + 1 aula (antes de 1/12) + 5 check-in + 30 marco
    assert.equal(s.weekTotals[0], 72);
    // S2: proposta 20 + fechado 100 + aula 1 (funil frio só no geral)
    assert.equal(s.weekTotals[1], 121);
    assert.equal(s.total, s.weekTotals.reduce((a, b) => a + b, 0) + 30);
  });

  it("ranking semanal zera na terça e geral soma tudo", () => {
    const mk = (userId: string, name: string, w1: number, w2: number): RankingSource => ({
      userId, name, badges: [], approaches: { total: 0, byWeek: [0, 0] },
      score: { total: w1 + w2, weekTotals: [w1, w2], breakdown: { cold: 0, warm: 0, followUps: 0, funnel: 0, lessons: 0, checkins: 0, milestones: 0 }, weekBreakdown: [{ cold: 0, warm: 0, followUps: 0, funnel: 0, lessons: 0, checkins: 0, milestones: 0 }, { cold: 0, warm: 0, followUps: 0, funnel: 0, lessons: 0, checkins: 0, milestones: 0 }] },
    });
    const sources = [mk("a", "Ana", 100, 0), mk("b", "Bia", 10, 20), mk("c", "Caio", 10, 20)];
    assert.equal(positionOf(buildRanking(sources), "a"), 1);
    const w2 = buildRanking(sources, 2);
    assert.deepEqual(w2.map((r) => [r.name, r.position]), [["Bia", 1], ["Caio", 1], ["Ana", 3]]);
  });
});

describe("selos e sequência", () => {
  it("sequência de 7 dias e sequência atual", () => {
    const days = new Set(["2026-12-01", "2026-12-02", "2026-12-03", "2026-12-04", "2026-12-05", "2026-12-06", "2026-12-07", "2026-12-09", "2026-12-10"]);
    assert.deepEqual(streaks(days, "2026-12-11"), { longest: 7, current: 2 });
    assert.deepEqual(streaks(days, "2026-12-12"), { longest: 7, current: 0 });
  });

  it("semana, primeiro cliente e constância total desde a entrada", () => {
    const w = weeks([2, 3, 4, 5, 6, 7]).map((week) => ({ ...week, eligible: week.number >= 2 }));
    const badges = challengeBadges({ weeks: w, longestStreak: 3, firstClient: true });
    const earned = badges.filter((b) => b.earned).map((b) => b.id);
    assert.ok(earned.includes("semana-2") && !earned.includes("semana-1"));
    assert.ok(earned.includes("primeiro-cliente") && earned.includes("constancia-total"));
    assert.ok(!earned.includes("sequencia-7"));
  });

  it("prêmios: top 3 só depois de 14/1", () => {
    const sources = [{ userId: "a", name: "Ana", email: "a@x.dev", weeksAchieved: [true, true, true], badges: [] }];
    const ranking = [{ position: 1, userId: "a", name: "Ana", points: 10, breakdown: { cold: 0, warm: 0, followUps: 0, funnel: 0, lessons: 0, checkins: 0, milestones: 0 }, badges: [] }];
    const before = prizeWinners(sources, ranking, "2027-01-10");
    assert.equal(before.find((p) => p.id === "marcos-s1-s3")!.winners.length, 1);
    assert.equal(before.find((p) => p.id === "top-3")!.pending, true);
    assert.equal(prizeWinners(sources, ranking, "2027-01-15").find((p) => p.id === "top-3")!.winners.length, 1);
  });
});
