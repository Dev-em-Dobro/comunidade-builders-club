import Link from "next/link";
import { enroll } from "@/actions/desafio";
import { EnrollmentForm } from "@/components/desafio/forms";
import {
  ChallengeHeading, ChallengeNav, Check, Farol, Field, GoalBar, PhaseStrip, StatCard, YesNo,
  brandEyebrow, coldNotice, displayTitle, eyebrow, field, link, panel,
} from "@/components/desafio/ui";
import { challengeNow, getEnrollment, requireChallengeMember } from "@/lib/desafio/acesso";
import {
  END, LAST_ENROLLMENT_DAY, WEEKS, challengeMoment, checkinWindow, dayDistance, dayInSaoPaulo, longDay,
} from "@/lib/desafio/calendario";
import { getParticipantProgress } from "@/lib/desafio/painel";
import { COMMITMENTS, HOURS, WORK_STAGES } from "@/lib/desafio/regras";
import { urlOrionApp } from "@/lib/membership/checkout";
import { isStaff } from "@/lib/membership/require-member";

export const dynamic = "force-dynamic";

const PHASE_COPY = [
  ["Rede quente", "1–7/12", "Oferta, portfólio simples e no mínimo 30 contatos quentes + 40 frios abordados"],
  ["Volume", "8–21/12", "30 abordagens frias por semana e retorno a todos que responderem"],
  ["Manter aquecido", "22/12–4/1", "Festas: só conversas ativas e retornos de janeiro"],
  ["Fechar", "5–14/1", "Retomada forte, negociação e resultado final"],
] as const;

const windowLabel = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo", weekday: "short", day: "numeric", month: "numeric",
});

export default async function ChallengePage({ searchParams }: {
  searchParams: Promise<{ agora?: string }>;
}) {
  const member = await requireChallengeMember();
  const { agora } = await searchParams;
  const now = challengeNow(member.membership.role, agora);
  const enrollment = await getEnrollment(member.user.id);
  const staff = isStaff(member.membership.role);

  if (enrollment?.status !== "aprovado") {
    return <Presentation status={enrollment?.status} reason={enrollment?.removedReason} open={dayInSaoPaulo(now) <= LAST_ENROLLMENT_DAY} staff={staff} />;
  }

  const progress = await getParticipantProgress(enrollment, member.user.email, now.toISOString());
  const { current, today, waitingReply } = progress;
  const moment = challengeMoment(today);
  const orionUrl = urlOrionApp();
  const phaseLessons = progress.lessons.filter((lesson) => lesson.phase === current.phase || lesson.overdue);
  const pendingLessons = phaseLessons.filter((lesson) => !lesson.completedAt);
  const window = checkinWindow(current);
  const daysLeftInWeek = Math.max(1, dayDistance(today < current.start ? current.start : today, current.end) + 1);
  const warmMissing = Math.max(0, current.warm - current.warmCount);
  const phaseEnd = WEEKS.findLast((week) => week.phase === current.phase)!.end;
  const coldMessage = coldNotice(progress.coldStatus);
  const coldKnown = progress.coldStatus !== "indisponivel";
  const coldMissing = Math.max(0, current.cold - current.coldCount);

  const title = moment.stage === "durante" ? `Dia ${moment.day.number} de 45`
    : moment.stage === "antes" ? `Começa em ${moment.daysToStart} ${moment.daysToStart === 1 ? "dia" : "dias"}` : "Desafio encerrado";
  const details = moment.stage === "durante"
    ? `${longDay(today)} — ${moment.daysLeft === 0 ? "último dia da turma" : `faltam ${moment.daysLeft} dias para 14 de janeiro`}`
    : moment.stage === "antes" ? "Largada na terça, 1º de dezembro, no encontro ao vivo." : "Turma de 1/12/2026 a 14/1/2027. Seu histórico continua aqui.";
  const mission = moment.stage === "durante" ? moment.day.mission
    : moment.stage === "antes" ? "Monte sua lista de 30+ contatos quentes e defina sua oferta para a largada." : "Registre o resultado final no check-in e celebre o que você construiu.";

  const tasks = [
    ...(waitingReply.length ? [{ label: `Responder ${waitingReply.length === 1 ? "o contato quente que retornou" : `os ${waitingReply.length} contatos quentes que retornaram`}`, done: false, href: "/desafio/contatos" }] : []),
    ...(warmMissing > 0 && moment.stage !== "depois" ? [{ label: `Abordar mais ${warmMissing} contatos quentes nesta semana (mínimo ${current.warm})`, done: false, href: "/desafio/contatos" }] : []),
    ...(current.warm > 0 && warmMissing === 0 ? [{ label: `Meta de ${current.warm} quentes da semana batida`, done: true, href: undefined }] : []),
    ...(pendingLessons[0] ? [{ label: `Assistir “${pendingLessons[0].lesson.title}”`, done: false, href: `/aulas/${pendingLessons[0].lesson.module.slug}/${pendingLessons[0].lesson.slug}` }] : []),
    ...(current.cold > 0 ? [coldKnown && coldMissing === 0
      ? { label: `Meta de ${current.cold} frias da semana batida`, done: true, href: undefined }
      : { label: coldKnown ? `Mais ${coldMissing} abordagens frias no Orion nesta semana (meta ${current.cold})` : `Abordagens frias no Orion (meta da semana: ${current.cold})`, done: false, href: orionUrl }] : []),
    ...(now >= window.opens && now < window.closes && current.number >= (enrollment.joinedWeek ?? 1)
      ? [{ label: current.checkin ? "Check-in da semana enviado" : "Enviar o check-in (até terça, 12h)", done: Boolean(current.checkin), href: "/desafio/checkin" }] : []),
  ];

  const funnelLabels = { abordado: "Abordados", respondeu: "Responderam", briefing: "Briefing", proposta: "Proposta", fechado: "Fechados" };

  return (
    <div className="feed-wrap space-y-6 pb-24 md:pb-0">
      <ChallengeHeading
        eyebrow={`Desafio 45 dias · Fase ${current.phase} · ${current.phaseName}`}
        title={title}
        details={details}
        aside={<Farol {...progress.farol} />}
      />
      <ChallengeNav current="/desafio" contacts={progress.totalContacts} staff={staff} />
      <PhaseStrip currentPhase={moment.stage === "durante" ? current.phase : null} today={today} />

      <div className="grid gap-5 lg:grid-cols-2">
        <section className={`${panel} space-y-3.5`}>
          <p className={eyebrow}>Missão de hoje</p>
          <h2 className={`${displayTitle} text-[22px] leading-snug`}>{mission}</h2>
          {moment.stage === "durante" && moment.day.light && <p className="text-sm text-muted">Dia leve: aproveite para revisar e descansar.</p>}
          {tasks.length > 0 && (
            <ul className="space-y-2.5">
              {tasks.map((task) => (
                <li key={task.label} className="flex items-start gap-2.5 text-[15px]">
                  <Check done={task.done} />
                  {task.href && !task.done
                    ? task.href.startsWith("http")
                      ? <a href={task.href} target="_blank" rel="noopener noreferrer" className="hover:underline">{task.label}</a>
                      : <Link href={task.href} className="hover:underline">{task.label}</Link>
                    : <span className={task.done ? "text-muted line-through" : ""}>{task.label}</span>}
                </li>
              ))}
            </ul>
          )}
          <div className="hidden flex-wrap gap-2.5 pt-1 md:flex">
            <Link href="/desafio/contatos#novo" className="btn-primary min-h-11">Registrar contato quente</Link>
            <a href={orionUrl} target="_blank" rel="noopener noreferrer" className="btn-outline min-h-11">Abrir o Orion</a>
          </div>
        </section>

        <section className={`${panel} space-y-4`}>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className={eyebrow}>{current.number === 7 ? "Encerramento · 12 a 14/1" : `Meta da semana ${current.number} · ${shortRange(current.start, current.end)}`}</p>
            <span className="text-[13px] text-muted">{current.number === 7 ? "Resultado até 14/1" : `Check-in ${windowLabel.format(window.opens)}`}</span>
          </div>
          {current.number < (enrollment.joinedWeek ?? 1) && <p className="text-sm text-muted">Você entrou na semana {enrollment.joinedWeek}; esta semana não é cobrada.</p>}
          {current.warm > 0 && (
            <GoalBar label="Abordagens quentes" value={current.warmCount} total={current.warm}
              hint={warmMissing > 0 ? `Faltam ${warmMissing} em ${daysLeftInWeek} ${daysLeftInWeek === 1 ? "dia" : "dias"} — cerca de ${Math.ceil(warmMissing / daysLeftInWeek)} por dia` : "Mínimo batido. Pode e deve fazer mais."} />
          )}
          {current.cold > 0 && (
            <GoalBar label="Abordagens frias (Orion)" value={current.coldCount} total={current.cold}
              pending={coldKnown ? undefined : `meta ${current.cold}`}
              hint={coldMessage ?? (coldMissing > 0 ? `Faltam ${coldMissing} em ${daysLeftInWeek} ${daysLeftInWeek === 1 ? "dia" : "dias"} — cerca de ${Math.ceil(coldMissing / daysLeftInWeek)} por dia` : "Meta batida. Pode e deve fazer mais.")} />
          )}
          {current.number >= 2 && current.number <= 3 && (
            <GoalBar label="Retornos feitos" value={current.returns + current.coldReturns} total={current.returns + current.coldReturns + waitingReply.length || 1}
              hint={waitingReply.length ? `${waitingReply.length} ${waitingReply.length === 1 ? "contato respondeu e espera" : "contatos responderam e esperam"} seu retorno` : "Ninguém esperando retorno agora"} />
          )}
          {current.required > 0 && <GoalBar label={`Aulas da Fase ${current.phase}`} value={current.completed} total={current.required} hint={`Prazo: ${longDay(phaseEnd)}`} />}
          <GoalBar label={current.number === 7 ? "Resultado final" : "Check-in"} value={current.checkin ? 1 : 0} total={1}
            hint={current.number === 7 ? "Registre até 14/1" : `Abre ${windowLabel.format(window.opens)} · fecha ${windowLabel.format(window.closes)}, 12h`} />
        </section>
      </div>

      {coldMessage && (
        <p role="status" className="rounded-xl border border-border bg-surface px-4 py-3 text-sm">
          <strong>{coldMessage}.</strong>{" "}
          {progress.coldStatus === "nao-encontrado"
            ? "Use no Orion o mesmo e-mail da comunidade para suas abordagens frias contarem aqui."
            : "Suas frias continuam salvas no Orion e aparecem aqui assim que a conexão voltar."}
        </p>
      )}

      {waitingReply.length > 0 && (
        <p role="status" className="rounded-xl border border-[#fcd34d] bg-[#fef3c7] px-4 py-3 text-sm text-[#92400e]">
          <strong>Responder hoje:</strong> {waitingReply.map((contact) => contact.name).join(", ")}.{" "}
          <Link href="/desafio/contatos" className="font-semibold underline">Abrir contatos</Link>
        </p>
      )}

      <section aria-labelledby="funil" className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="funil" className={`${displayTitle} text-xl`}>Seu funil até agora</h2>
          <span className="text-[13px] text-muted">Quentes registrados aqui · frios vêm do Orion</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          {progress.funnel.map((step) => (
            <StatCard key={step.type} label={funnelLabels[step.type]} value={step.total}
              detail={step.type === "fechado" && step.total === 0 ? "o primeiro vem aí" : `${step.warm} quentes · ${coldKnown ? step.cold : "—"} frios`} />
          ))}
        </div>
      </section>

      <section aria-labelledby="aulas" className="space-y-3">
        <h2 id="aulas" className={`${displayTitle} text-lg`}>Aulas obrigatórias</h2>
        {phaseLessons.length === 0
          ? <p className="text-sm text-muted">{current.phase <= 2 ? "As aulas desta fase ainda estão sendo configuradas pela equipe." : "Sem aulas obrigatórias nesta fase."}</p>
          : (
            <>
              <GoalBar label={`${phaseLessons.length - pendingLessons.length} de ${phaseLessons.length} aulas`} value={phaseLessons.length - pendingLessons.length} total={phaseLessons.length} />
              <ul className="space-y-2 text-sm">
                {phaseLessons.map(({ lesson, completedAt, overdue }) => (
                  <li key={lesson.id} className="flex items-baseline justify-between gap-3">
                    <span className={completedAt ? "text-muted line-through" : ""}>{lesson.title}</span>
                    {completedAt
                      ? <span className="shrink-0 text-xs text-muted">Concluída</span>
                      : <Link className={`${link} shrink-0`} href={`/aulas/${lesson.module.slug}/${lesson.slug}`}>{overdue ? "Atrasada · assistir →" : "Assistir →"}</Link>}
                  </li>
                ))}
              </ul>
              {current.phase <= 2 && <p className="text-xs text-muted">Prazo da Fase {current.phase}: {longDay(phaseEnd)}</p>}
            </>
          )}
      </section>

      {today > END && <Link href="/desafio/checkin" className={link}>Ver histórico de check-ins</Link>}

      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2.5 border-t border-border bg-card/95 px-4 py-3 backdrop-blur md:hidden"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        <Link href="/desafio/contatos#novo" className="btn-primary min-h-11 flex-1">+ Contato quente</Link>
        <a href={orionUrl} target="_blank" rel="noopener noreferrer" className="btn-outline min-h-11 flex-1">Abrir Orion</a>
      </div>
    </div>
  );
}

function shortRange(start: string, end: string) {
  const d = (date: string) => `${Number(date.slice(8, 10))}/${Number(date.slice(5, 7))}`;
  return `${d(start)} a ${d(end)}`;
}

function Presentation({ status, reason, open, staff }: {
  status?: "pendente" | "recusado" | "removido"; reason?: string | null; open: boolean; staff: boolean;
}) {
  return (
    <div className="feed-wrap flex flex-wrap items-start gap-10">
      <section className="min-w-0 flex-[1_1_360px] space-y-5">
        <p className={brandEyebrow}>Turma única · 1/12 a 14/1</p>
        <h1 className={`${displayTitle} text-[2.25rem] leading-[1.15]`}>Desafio 45 dias até o primeiro freela</h1>
        <p className="text-[17px] leading-relaxed text-muted">
          Prospecção todo dia, com meta semanal, missão diária e acompanhamento da equipe. Primeiro sua rede, depois volume no Orion — até fechar o primeiro cliente.
        </p>
        <ol className="space-y-3.5">
          {PHASE_COPY.map(([name, dates, what], index) => (
            <li key={name} className="flex items-start gap-3.5">
              <span className={`${displayTitle} inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[15px] text-accent-hover`}>{index + 1}</span>
              <div>
                <p className={`${displayTitle} text-base`}>{name} <span className="font-sans text-[13px] font-normal text-muted">· {dates}</span></p>
                <p className="text-sm text-muted">{what}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="space-y-2 rounded-xl border border-border bg-accent/5 px-4 py-4">
          <p className="text-[15px] font-semibold">O que você ganha cumprindo as metas</p>
          <p className="text-sm leading-relaxed"><strong>Fechou pelo menos 1 cliente no desafio?</strong> Você ganha 4 encontros de Hot Seat em grupo com os gêmeos para acompanhar os trabalhos fechados.</p>
          <p className="text-sm text-muted">Revisão do portfólio · prioridade no hot seat de terça · destaque em Conquistas · mentoria individual para quem bater todos os marcos</p>
        </div>
        {staff && <Link className={link} href="/admin/desafio">Painel da equipe →</Link>}
      </section>

      <section className={`${panel} min-w-0 flex-[1_1_420px]`}>
        {status === "pendente" && (
          <StatusCard title="Cadastro em análise" body="Você recebe acesso ao painel do desafio assim que a equipe aprovar. A largada é terça, 1º de dezembro, no encontro ao vivo." />
        )}
        {(status === "recusado" || status === "removido") && (
          <StatusCard title={status === "recusado" ? "Cadastro não aprovado" : "Você saiu do desafio"}
            body={`${reason ? `Motivo: ${reason}. ` : ""}Se quiser conversar sobre isso, fale com a equipe no WhatsApp da comunidade.`} />
        )}
        {!status && !open && <StatusCard title="Inscrições encerradas" body="As inscrições terminaram em 14/12. Fique de olho nos avisos para a próxima turma." />}
        {!status && open && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className={`${displayTitle} text-[22px]`}>Quero participar</h2>
              <p className="text-sm text-muted">Leva 2 minutos. A equipe usa suas respostas para te acompanhar.</p>
            </div>
            <EnrollmentForm action={enroll} commitments={COMMITMENTS}>
              <Field label="WhatsApp"><input name="whatsapp" type="tel" inputMode="tel" autoComplete="tel" placeholder="(11) 98765-4321" className={field} required maxLength={24} /></Field>
              <Field label="Seu momento hoje">
                <select name="workStage" className={field} required defaultValue="">
                  <option value="" disabled>Selecione</option>
                  {WORK_STAGES.map((value) => <option key={value} value={value}>{capitalize(value)}</option>)}
                </select>
              </Field>
              <Field label="Que serviço você quer vender?"><input name="offer" className={field} placeholder="Ex.: site para clínicas · ainda não sei" required maxLength={240} /></Field>
              <Field label="Horas por semana para o desafio">
                <select name="weeklyHours" className={field} required defaultValue="">
                  <option value="" disabled>Selecione</option>
                  {HOURS.map((value) => <option key={value} value={value}>{capitalize(value)}</option>)}
                </select>
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <YesNo name="hasPortfolio" label="Já tem portfólio publicado?" />
                <YesNo name="hasWarmContacts" label="Tem 30 contatos quentes para abordar?" />
              </div>
              <Field label="Por que fechar o primeiro cliente agora?">
                <textarea name="motivation" className={field} placeholder="Conta em uma ou duas frases" required maxLength={500} rows={3} />
              </Field>
            </EnrollmentForm>
          </div>
        )}
      </section>
    </div>
  );
}

function StatusCard({ title, body }: { title: string; body: string }) {
  return (
    <div role="status" className="flex flex-col items-center gap-3 px-1 py-6 text-center">
      <h2 className={`${displayTitle} text-[22px]`}>{title}</h2>
      <p className="max-w-sm text-[15px] text-muted">{body}</p>
    </div>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
