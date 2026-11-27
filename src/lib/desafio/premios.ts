/**
 * F050 (fatia C) — quem conquistou cada prêmio. A entrega segue manual.
 */
import { END } from "./calendario";
import type { ChallengeBadge } from "./pontos";
import type { RankingRow } from "./ranking";

export const PRIZES = [
  { id: "marco-s1", title: "Marco S1", prize: "Revisão do portfólio pela equipe" },
  { id: "marcos-s1-s3", title: "Marcos S1+S2+S3", prize: "Prioridade de hot seat no encontro de terça" },
  { id: "primeiro-cliente", title: "Primeiro cliente", prize: "4 encontros de Hot Seat em grupo com os gêmeos" },
  { id: "constancia-total", title: "Constância total", prize: "Mentoria individual de 30 min + certificado" },
  { id: "top-3", title: "Top 3 do ranking geral", prize: "Prêmio maior (a definir)" },
] as const;

export type PrizeWinner = { userId: string; name: string; email: string };
type Source = PrizeWinner & { weeksAchieved: boolean[]; badges: ChallengeBadge[] };

export function prizeWinners(sources: Source[], general: RankingRow[], today: string) {
  const earned = (source: Source, id: string) => source.badges.some((badge) => badge.id === id && badge.earned);
  const pick = (test: (source: Source) => boolean) =>
    sources.filter(test).map(({ userId, name, email }) => ({ userId, name, email }));
  const byId = new Map(sources.map((source) => [source.userId, source]));
  return PRIZES.map((prize) => ({
    ...prize,
    pending: prize.id === "top-3" && today <= END,
    winners: prize.id === "marco-s1" ? pick((s) => Boolean(s.weeksAchieved[0]))
      : prize.id === "marcos-s1-s3" ? pick((s) => s.weeksAchieved.slice(0, 3).every(Boolean) && s.weeksAchieved.length >= 3)
      : prize.id === "primeiro-cliente" ? pick((s) => earned(s, "primeiro-cliente"))
      : prize.id === "constancia-total" ? pick((s) => earned(s, "constancia-total"))
      : today > END ? general.filter((row) => row.position <= 3 && row.points > 0).flatMap((row) => {
        const source = byId.get(row.userId);
        return source ? [{ userId: source.userId, name: source.name, email: source.email }] : [];
      }) : [],
  }));
}
