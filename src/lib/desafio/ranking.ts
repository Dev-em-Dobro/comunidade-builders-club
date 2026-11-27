/**
 * F050 (fatia C) — ranking semanal (terça a segunda, zera na terça) e geral.
 * Funções puras sobre o progresso já calculado de cada inscrito aprovado.
 */
import type { Breakdown, ChallengeBadge } from "./pontos";

export type RankingSource = {
  userId: string;
  name: string;
  avatarUrl?: string | null;
  score: { total: number; breakdown: Breakdown; weekTotals: number[]; weekBreakdown: Breakdown[] };
  approaches: { total: number; byWeek: number[] };
  badges: ChallengeBadge[];
};

export type RankingRow = {
  position: number; userId: string; name: string; avatarUrl?: string | null;
  points: number; breakdown: Breakdown; badges: ChallengeBadge[];
};

/** `week` = número da semana (1–7) para o ranking semanal; omitido = geral. */
export function buildRanking(sources: RankingSource[], week?: number): RankingRow[] {
  const rows = sources.map((source) => ({
    source,
    points: week ? source.score.weekTotals[week - 1] ?? 0 : source.score.total,
    approaches: week ? source.approaches.byWeek[week - 1] ?? 0 : source.approaches.total,
  }));
  rows.sort((a, b) => b.points - a.points || b.approaches - a.approaches || a.source.name.localeCompare(b.source.name, "pt-BR"));
  let position = 0;
  let previous: { points: number; approaches: number } | null = null;
  return rows.map((row, index) => {
    // Empate total (pontos e abordagens) divide a posição.
    if (!previous || previous.points !== row.points || previous.approaches !== row.approaches) position = index + 1;
    previous = row;
    const { source } = row;
    return {
      position, userId: source.userId, name: source.name, avatarUrl: source.avatarUrl,
      points: row.points,
      breakdown: week ? source.score.weekBreakdown[week - 1]! : source.score.breakdown,
      badges: source.badges,
    };
  });
}

export function positionOf(rows: RankingRow[], userId: string) {
  return rows.find((row) => row.userId === userId)?.position ?? null;
}
