import { submitCheckin } from "@/actions/desafio";
import { ChallengeForm } from "@/components/desafio/forms";
import { COLD_PENDING, ChallengeHeading, ChallengeNav, Check, Field, YesNo, displayTitle, eyebrow, field, panel } from "@/components/desafio/ui";
import { challengeNow, requireChallengeParticipant } from "@/lib/desafio/acesso";
import { canCheckIn, checkinWindow } from "@/lib/desafio/calendario";
import { getParticipantProgress } from "@/lib/desafio/painel";
import { isStaff } from "@/lib/membership/require-member";

export const dynamic = "force-dynamic";

const when = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo", weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
});
const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default async function CheckinPage({ searchParams }: { searchParams: Promise<{ agora?: string }> }) {
  const { member, enrollment } = await requireChallengeParticipant();
  const now = challengeNow(member.membership.role, (await searchParams).agora);
  const progress = await getParticipantProgress(enrollment, now.toISOString());
  const joinedWeek = enrollment.joinedWeek ?? 1;
  const week = progress.weeks.find((item) => !item.checkin && canCheckIn(item, joinedWeek, now));
  const history = progress.weeks.filter((item) => item.checkin);
  const final = week?.number === 7;

  const numbers = week && [
    { label: "Quentes abordados", value: String(week.warmCount), meta: week.warm ? `mínimo ${week.warm}${week.warmCount >= week.warm ? " ✓" : ""}` : "sem meta nesta semana", ok: week.warm > 0 && week.warmCount >= week.warm },
    { label: "Frias (Orion)", value: "—", meta: week.cold ? `meta ${week.cold} · ${COLD_PENDING}` : COLD_PENDING, ok: false },
    { label: "Responderam", value: String(week.responded), meta: `${week.returns} ${week.returns === 1 ? "retorno feito" : "retornos feitos"}`, ok: false },
    ...(week.required ? [{ label: `Aulas da Fase ${week.phase}`, value: `${week.completed}/${week.required}`, meta: week.completed >= week.required ? "concluídas ✓" : "pendentes", ok: week.completed >= week.required }] : []),
  ];
  const milestone = week && [
    ...(week.warm ? [{ label: `No mínimo ${week.warm} abordagens quentes`, done: week.warmCount >= week.warm }] : []),
    ...(week.required ? [{ label: `Aulas da Fase ${week.phase}`, done: week.completed >= week.required }] : []),
    ...(week.number === 2 ? [{ label: "Retorno a todos que responderam", done: week.pendingFollowUps === 0 }] : []),
    ...(week.number === 3 ? [{ label: "Interessados com próximo passo", done: week.pendingFollowUps === 0 }] : []),
    ...(week.number === 1 ? [{ label: "Portfólio publicado (link no check-in)", done: false }] : []),
    { label: final ? "Resultado final registrado" : "Check-in enviado", done: false },
  ];

  return (
    <div className="feed-wrap space-y-6">
      <ChallengeHeading
        title={week ? (final ? "Resultado final" : `Check-in da semana ${week.number}`) : "Check-in"}
        details={week ? `Aberto até ${when.format(checkinWindow(week).closes)}${final ? "" : " (antes do encontro)"}` : undefined}
      />
      <ChallengeNav current="/desafio/checkin" contacts={progress.totalContacts} staff={isStaff(member.membership.role)} />

      {week && numbers && milestone ? (
        <div className="flex flex-wrap items-start gap-6">
          <section className={`${panel} min-w-0 flex-[2_1_460px]`}>
            <div className="mb-5 space-y-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <p className={eyebrow}>Seus números da semana</p>
                <span className="text-xs text-muted">Preenchido automaticamente</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
                {numbers.map((item) => (
                  <div key={item.label} className="flex flex-col gap-0.5 rounded-xl bg-surface px-3.5 py-3">
                    <span className="text-xs text-muted">{item.label}</span>
                    <span className={`${displayTitle} text-[22px]`}>{item.value}</span>
                    <span className={`text-xs ${item.ok ? "font-semibold text-[#166534]" : "text-muted"}`}>{item.meta}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted">Quentes vêm dos seus contatos aqui; frias vêm do Orion (mensagens marcadas como enviadas).</p>
            </div>
            <ChallengeForm action={submitCheckin} submit={final ? "Registrar resultado" : "Enviar check-in"}>
              <input type="hidden" name="week" value={week.number} />
              {week.number === 1 && (
                <Field label="Link do seu portfólio publicado"><input name="portfolioUrl" type="url" inputMode="url" required maxLength={500} placeholder="https://seunome.com.br" className={field} /></Field>
              )}
              <Field label={final ? "Como foram os 45 dias? Onde você travou?" : "Onde você travou esta semana?"} hint="Seja específico — é isso que a equipe usa no encontro de terça.">
                <textarea name="blocker" required maxLength={500} rows={3} className={field} placeholder="Ex.: os negócios respondem, mas somem quando falo de preço" />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <YesNo name="soldThisWeek" label={final ? "Fechou alguma venda no desafio?" : "Fechou alguma venda esta semana?"} yes="Sim, fechei!" no="Ainda não" />
                <Field label="Valor (opcional)"><input name="soldValue" inputMode="decimal" maxLength={14} placeholder="R$ 0,00" className={field} /></Field>
              </div>
            </ChallengeForm>
          </section>
          <aside className="min-w-0 flex-[1_1_260px] space-y-3">
            <h2 className={`${displayTitle} text-lg`}>{final ? "Encerramento" : `Marco da semana ${week.number}`}</h2>
            <ul className="space-y-2.5">
              {milestone.map((item) => (
                <li key={item.label} className="flex items-center gap-2.5 text-sm"><Check done={item.done} />{item.label}</li>
              ))}
            </ul>
            {week.number === 1 && (
              <p className="rounded-xl border border-dashed border-border px-4 py-3.5 text-[13px] leading-relaxed text-muted">
                Bateu o marco? Você desbloqueia a <strong className="text-foreground">revisão do portfólio</strong> pela equipe.
              </p>
            )}
          </aside>
        </div>
      ) : (
        <section className={`${panel} space-y-1`} role="status">
          <h2 className={`${displayTitle} text-lg`}>Nenhum check-in aberto agora</h2>
          <p className="text-sm text-muted">
            {progress.nextCheckin
              ? `O próximo abre ${when.format(checkinWindow(progress.nextCheckin).opens).replace(" 00:00", "")} e fica aberto até terça, 12h.`
              : "Você já enviou todos os check-ins disponíveis."}
          </p>
        </section>
      )}

      <section aria-labelledby="historico" className="space-y-3">
        <h2 id="historico" className={`${displayTitle} text-lg`}>Histórico</h2>
        {history.length === 0
          ? <p className="text-sm text-muted">Seus check-ins enviados aparecem aqui.</p>
          : (
            <ol className="space-y-2.5">
              {history.map((item) => (
                <li key={item.number} className={`${panel} space-y-1.5`}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-semibold">{item.number === 7 ? "Resultado final" : `Semana ${item.number}`}</h3>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${item.achieved ? "bg-[#dcfce7] text-[#166534]" : "bg-surface text-muted"}`}>
                      {item.achieved ? "✓ Marco batido" : "Marco não batido"}
                    </span>
                  </div>
                  <p className="text-xs text-muted">Enviado {when.format(item.checkin!.submittedAt)} · {item.warmCount} quentes · {item.returns} retornos</p>
                  <p className="text-sm"><span className="text-muted">Onde travou:</span> {item.checkin!.blocker}</p>
                  {item.checkin!.portfolioUrl && <p className="text-sm"><span className="text-muted">Portfólio:</span> <a href={item.checkin!.portfolioUrl} target="_blank" rel="noopener noreferrer" className="break-all text-accent hover:underline">{item.checkin!.portfolioUrl}</a></p>}
                  {item.checkin!.soldThisWeek && <p className="text-sm font-semibold text-[#166534]">Venda fechada{item.checkin!.soldValue ? `: ${money.format(Number(item.checkin!.soldValue))}` : ""}</p>}
                </li>
              ))}
            </ol>
          )}
      </section>
    </div>
  );
}
