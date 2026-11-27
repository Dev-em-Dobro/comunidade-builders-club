import { ChallengeHeading, ChallengeNav, displayTitle } from "@/components/desafio/ui";
import { challengeNow, requireChallengeParticipant } from "@/lib/desafio/acesso";
import { DAYS, weekdayDay } from "@/lib/desafio/calendario";
import { getParticipantProgress } from "@/lib/desafio/painel";
import { isStaff } from "@/lib/membership/require-member";

export const dynamic = "force-dynamic";

const GOALS: Record<number, string> = {
  1: "mínimo 30 quentes + 40 frias + portfólio",
  2: "30 frias + retornos",
  3: "30 frias + próximo passo para interessados",
  4: "só o check-in",
  5: "10 frias em 4/1 + check-in",
  6: "30 frias + check-in",
  7: "registrar o resultado final",
};

const pill = {
  ok: "bg-[#dcfce7] text-[#166534]",
  miss: "bg-[#fee2e2] text-[#991b1b]",
  now: "bg-accent/10 text-accent-hover",
  next: "border border-border text-muted",
  skip: "border border-dashed border-border text-muted",
};

export default async function ChallengeCalendarPage({ searchParams }: { searchParams: Promise<{ agora?: string }> }) {
  const { member, enrollment } = await requireChallengeParticipant();
  const now = challengeNow(member.membership.role, (await searchParams).agora);
  const { weeks, today, current, totalContacts } = await getParticipantProgress(enrollment, now.toISOString());

  return (
    <div className="feed-wrap space-y-6">
      <ChallengeHeading title="Calendário" details="Semanas de terça a segunda. Check-in na segunda, encontro ao vivo na terça." />
      <ChallengeNav current="/desafio/calendario" contacts={totalContacts} staff={isStaff(member.membership.role)} />

      <ul className="flex flex-wrap gap-4 text-[13px] text-muted" aria-label="Legenda">
        <li className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="size-3 rounded bg-accent/15" />Passou</li>
        <li className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="size-3 rounded border-2 border-accent" />Hoje</li>
        <li className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="size-3 rounded border border-border bg-card" />A fazer</li>
        <li className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="size-3 rounded border border-dashed border-border" />Pausa ou opcional</li>
      </ul>

      {weeks.map((week) => {
        const isCurrent = week.number === current.number && today >= week.start && today <= week.end;
        const [style, prefix] = !week.eligible ? [pill.skip, "Antes da sua entrada"]
          : week.achieved ? [pill.ok, "✓ Marco batido"]
          : week.expired ? [pill.miss, "✗ Marco não batido"]
          : isCurrent ? [pill.now, "Em andamento"] : [pill.next, "Meta"];
        return (
          <section key={week.number} aria-labelledby={`semana-${week.number}`} className="space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id={`semana-${week.number}`} className={`${displayTitle} text-[17px]`}>
                {week.number === 7 ? "Encerramento" : `Semana ${week.number}`}{" "}
                <span className="font-sans text-[13px] font-normal text-muted">· Fase {week.phase} · {week.phaseName}</span>
              </h2>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${style}`}>{prefix}: {GOALS[week.number]}</span>
            </div>
            <div className="overflow-x-auto pb-1">
              <ol className="grid min-w-[860px] grid-cols-7 gap-2">
                {DAYS.filter((day) => day.week.number === week.number).map((day) => {
                  const isToday = day.date === today;
                  const past = day.date < today;
                  return (
                    <li key={day.date} aria-current={isToday ? "date" : undefined}
                      className={`flex min-h-[92px] flex-col gap-1.5 rounded-xl p-2.5 ${
                        isToday ? "border-2 border-accent bg-card"
                          : past ? "border border-transparent bg-accent/15"
                          : day.light ? "border border-dashed border-border"
                          : "border border-border bg-card"
                      }`}>
                      <div className="flex items-baseline justify-between gap-1">
                        <span className={`${displayTitle} text-[15px]`}>{isToday ? "Hoje" : `Dia ${day.number}`}</span>
                        <time dateTime={day.date} className="text-[11px] text-muted">{weekdayDay(day.date)}</time>
                      </div>
                      <span className="text-xs leading-snug">{day.mission}</span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </section>
        );
      })}
    </div>
  );
}
