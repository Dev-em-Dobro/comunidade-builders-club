import Link from "next/link";
import { BadgeGrid } from "@/components/desafio/badge";
import { ChallengeHeading, ChallengeNav, displayTitle, eyebrow, panel } from "@/components/desafio/ui";
import { challengeNow, requireChallengeParticipant } from "@/lib/desafio/acesso";
import { weekOn } from "@/lib/desafio/calendario";
import { getParticipantProgress, getRankingSources } from "@/lib/desafio/painel";
import { POINTS, WARM_SCORED_PER_WEEK, type Breakdown } from "@/lib/desafio/pontos";
import { buildRanking } from "@/lib/desafio/ranking";
import { isStaff } from "@/lib/membership/require-member";

export const dynamic = "force-dynamic";

const ORIGIN: [keyof Breakdown, string][] = [
  ["cold", "frias"], ["warm", "quentes"], ["followUps", "retornos"], ["funnel", "funil"],
  ["lessons", "aulas"], ["checkins", "check-ins"], ["milestones", "marcos"],
];
const TABLE: [string, string][] = [
  ["Abordagem fria enviada (Orion)", `${POINTS.cold}`],
  ["Abordagem quente (contato → abordado)", `${POINTS.warm} (máx. ${WARM_SCORED_PER_WEEK} por semana)`],
  ["Retorno registrado (quente ou frio)", `${POINTS.followUp}`],
  ["Briefing (quente) / qualificado (frio)", `${POINTS.briefing}`],
  ["Proposta", `${POINTS.proposta}`],
  ["Fechado / ganho", `${POINTS.fechado}`],
  ["Aula obrigatória concluída", `${POINTS.lesson}`],
  ["Check-in enviado", `${POINTS.checkin}`],
  ["Marco da semana batido", `+${POINTS.milestone} e selo`],
];

export default async function RankingPage({ searchParams }: { searchParams: Promise<{ agora?: string; aba?: string }> }) {
  const { member, enrollment } = await requireChallengeParticipant();
  const params = await searchParams;
  const now = challengeNow(member.membership.role, params.agora);
  const [progress, sources] = await Promise.all([
    getParticipantProgress(enrollment, member.user.email, now.toISOString()),
    getRankingSources(now.toISOString()),
  ]);
  const general = params.aba === "geral";
  const week = weekOn(progress.today < "2026-12-01" ? "2026-12-01" : progress.today).number;
  const rows = buildRanking(sources, general ? undefined : week);
  const tab = (key: "semana" | "geral", label: string) => {
    const search = new URLSearchParams({ ...(key === "geral" ? { aba: "geral" } : {}), ...(params.agora ? { agora: params.agora } : {}) });
    const active = (key === "geral") === general;
    return (
      <Link href={`/desafio/ranking${search.size ? `?${search}` : ""}`} aria-current={active ? "page" : undefined}
        className={`inline-flex min-h-10 items-center rounded-lg px-3.5 text-sm font-medium ${active ? "bg-accent text-white shadow-sm" : "text-muted hover:bg-surface hover:text-foreground"}`}>
        {label}
      </Link>
    );
  };

  return (
    <div className="feed-wrap space-y-6">
      <ChallengeHeading title="Ranking e selos"
        details={general ? "Pontos dos 45 dias." : `Pontos da semana ${week === 7 ? "de encerramento" : week} · zera toda terça às 00:00.`}
        aside={<span className="rounded-full bg-accent/10 px-3 py-1.5 text-sm font-semibold text-accent-hover">
          <span className={`${displayTitle} text-lg`}>{general ? progress.score.total : progress.score.weekTotals[week - 1] ?? 0}</span> pontos
        </span>} />
      <ChallengeNav current="/desafio/ranking" contacts={progress.totalContacts} staff={isStaff(member.membership.role)} />

      <nav aria-label="Período do ranking" className="inline-flex gap-1 rounded-xl border border-border bg-card p-1">
        {tab("semana", "Semana")}{tab("geral", "Geral")}
      </nav>

      {rows.length === 0
        ? <p className={`${panel} text-sm text-muted`}>O ranking aparece quando a turma começar a pontuar.</p>
        : (
          <ol className="space-y-2" aria-label={general ? "Ranking geral" : "Ranking da semana"}>
            {rows.map((row) => {
              const me = row.userId === member.user.id;
              const earned = row.badges.filter((badge) => badge.earned);
              return (
                <li key={row.userId} aria-current={me ? "true" : undefined}
                  className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-xl border px-4 py-3 ${me ? "border-accent bg-accent/5" : "border-border bg-card"}`}>
                  <span className={`${displayTitle} w-8 shrink-0 text-lg ${row.position <= 3 ? "text-accent-hover" : "text-muted"}`}>{row.position}º</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{row.name}{me && <span className="font-normal text-muted"> (você)</span>}</span>
                    <span className="block text-xs text-muted">
                      {ORIGIN.filter(([key]) => row.breakdown[key] > 0).map(([key, label]) => `${row.breakdown[key]} ${label}`).join(" · ") || "sem pontos ainda"}
                    </span>
                  </span>
                  {earned.length > 0 && <span className="text-xs text-muted" title={earned.map((badge) => badge.label).join(", ")}>{earned.length} {earned.length === 1 ? "selo" : "selos"}</span>}
                  <span className={`${displayTitle} shrink-0 text-xl`}>{row.points}<span className="ml-1 font-sans text-xs font-normal text-muted">pts</span></span>
                </li>
              );
            })}
          </ol>
        )}

      <section aria-labelledby="selos" className="space-y-3">
        <h2 id="selos" className={`${displayTitle} text-lg`}>Seus selos</h2>
        <BadgeGrid badges={progress.badges} />
        <p className="text-[13px] text-muted">
          Sequência atual: {progress.streak.current} {progress.streak.current === 1 ? "dia" : "dias"} seguidos prospectando
          {progress.streak.longest >= 7 ? "." : ` · melhor: ${progress.streak.longest}. Com 7 você ganha o selo Sequência 7.`}
        </p>
      </section>

      <section aria-labelledby="pontos" className={`${panel} space-y-2`}>
        <h2 id="pontos" className={eyebrow}>Como pontuar</h2>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-border">
            {TABLE.map(([action, points]) => (
              <tr key={action}><td className="py-2 pr-3">{action}</td><td className="py-2 text-right font-semibold">{points}</td></tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-muted">Briefing, proposta e fechado pontuam uma vez por contato. Funil frio (sem data no Orion) entra só no ranking geral.</p>
      </section>
    </div>
  );
}
