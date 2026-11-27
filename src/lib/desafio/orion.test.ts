import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import type { ChallengeEnrollment } from "@prisma/client";
import { filterRows, teamRow, toCsv } from "./equipe";
import { buscarEstatisticasOrion, coldForEmail, coldWindow } from "./orion";
import { challengeProgress } from "./progresso";

const sp = (local: string) => new Date(`${local}-03:00`);
const enrollment: ChallengeEnrollment = {
  userId: "u1", status: "aprovado", whatsapp: "11999999999", workStage: "x", offer: "sites", weeklyHours: "5–10h",
  hasPortfolio: true, hasWarmContacts: true, motivation: "x", commitments: [], appliedAt: sp("2026-11-28T10:00:00"),
  approvedAt: sp("2026-11-28T10:00:00"), joinedWeek: 1, removedReason: null,
};
const funil = { respondeu: 2, qualificado: 1, proposta: 1, ganho: 0 };
const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
  delete process.env.ORION_URL;
  delete process.env.BUILDERS_INTEGRATION_SECRET;
});

describe("frias no progresso", () => {
  const base = { enrollment, contacts: [], lessons: [], completions: [] };
  const s2 = { number: 2 };
  it("marco da S2 cobra 30 frias quando o Orion responde", () => {
    const checkins = [{ userId: "u1", week: 2, blocker: "x", portfolioUrl: null, soldThisWeek: false, soldValue: null, submittedAt: sp("2026-12-14T10:00:00") }];
    const now = sp("2026-12-16T10:00:00");
    const poucas = challengeProgress({ ...base, checkins, now, cold: { encontrado: true, dias: [{ data: "2026-12-09", abordagens: 20, retornos: 2 }], funil } });
    const meta = challengeProgress({ ...base, checkins, now, cold: { encontrado: true, dias: [{ data: "2026-12-09", abordagens: 20, retornos: 0 }, { data: "2026-12-12", abordagens: 10, retornos: 1 }], funil } });
    const fora = challengeProgress({ ...base, checkins, now, cold: undefined });
    assert.equal(poucas.weeks[s2.number - 1]!.achieved, false);
    assert.equal(meta.weeks[s2.number - 1]!.coldCount, 30);
    assert.equal(meta.weeks[s2.number - 1]!.achieved, true);
    assert.equal(fora.weeks[s2.number - 1]!.achieved, true, "Orion indisponível não pune");
    assert.equal(fora.coldStatus, "indisponivel");
  });

  it("dias anteriores à integração contam (retroativo) e frias contam como registro", () => {
    const p = challengeProgress({ ...base, checkins: [], now: sp("2026-12-04T10:00:00"), cold: { encontrado: true, dias: [{ data: "2026-12-01", abordagens: 5, retornos: 0 }, { data: "2026-12-03", abordagens: 4, retornos: 1 }], funil } });
    assert.equal(p.weeks[0]!.coldCount, 9);
    assert.equal(p.coldTotal, 9);
    assert.equal(p.lastRecordDay, "2026-12-03");
    assert.notEqual(p.farol.color, "red");
    assert.equal(p.funnel.find((f) => f.type === "briefing")!.cold, 1);
  });

  it("conta não encontrada: aviso e filtro no painel", () => {
    const p = challengeProgress({ ...base, checkins: [], now: sp("2026-12-04T10:00:00"), cold: coldForEmail(new Map(), "x@y.dev") });
    assert.equal(p.coldStatus, "nao-encontrado");
    const rows = [teamRow({ enrollment, user: { name: "Ana", email: "x@y.dev", profile: null }, progress: p })];
    assert.equal(filterRows(rows, "sem-orion").length, 1);
    assert.match(toCsv(rows), /não encontrada/);
  });
});

describe("cliente do Orion", () => {
  it("sem configuração devolve null (indisponível)", async () => {
    assert.equal(await buscarEstatisticasOrion(["a@b.dev"], "2026-12-05"), null);
  });

  it("envia Bearer, janela de 1/12 até hoje, normaliza e usa cache", async () => {
    process.env.ORION_URL = "https://orion.test/";
    process.env.BUILDERS_INTEGRATION_SECRET = "s3cr3t";
    const calls: { url: string; init: RequestInit }[] = [];
    globalThis.fetch = (async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return new Response(JSON.stringify({ resultados: [{ email: "ana@x.dev", encontrado: true, dias: [], funil }] }), { status: 200 });
    }) as typeof fetch;
    const r = await buscarEstatisticasOrion([" Ana@X.dev "], "2026-12-05");
    assert.equal(r?.get("ana@x.dev")?.encontrado, true);
    assert.equal(calls[0]!.url, "https://orion.test/api/integracoes/builders/estatisticas");
    assert.equal((calls[0]!.init.headers as Record<string, string>).Authorization, "Bearer s3cr3t");
    assert.deepEqual(JSON.parse(String(calls[0]!.init.body)), { emails: ["ana@x.dev"], desde: "2026-12-01", ate: "2026-12-05" });
    await buscarEstatisticasOrion(["ana@x.dev"], "2026-12-05");
    assert.equal(calls.length, 1, "segunda chamada vem do cache");
  });

  it("erro do Orion devolve null sem lançar", async () => {
    process.env.ORION_URL = "https://orion.test";
    process.env.BUILDERS_INTEGRATION_SECRET = "s3cr3t";
    globalThis.fetch = (async () => new Response("x", { status: 401 })) as unknown as typeof fetch;
    assert.equal(await buscarEstatisticasOrion(["outra@x.dev"], "2026-12-06"), null);
  });

  it("janela limitada a 14/1", () => {
    assert.deepEqual(coldWindow("2027-02-01"), { desde: "2026-12-01", ate: "2027-01-14" });
    assert.deepEqual(coldWindow("2026-11-20"), { desde: "2026-12-01", ate: "2026-12-01" });
  });
});
