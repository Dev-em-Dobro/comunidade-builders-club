import type { WarmContact, WarmContactEvent } from "@prisma/client";
import { changeWarmContact, createWarmContact, followUpWarmContact } from "@/actions/desafio";
import { ActionButton, ChallengeForm } from "@/components/desafio/forms";
import { ChallengeHeading, ChallengeNav, Field, StatCard, displayTitle, field } from "@/components/desafio/ui";
import { challengeNow, requireChallengeParticipant } from "@/lib/desafio/acesso";
import { END, dayInSaoPaulo, weekdayDay } from "@/lib/desafio/calendario";
import { getContacts } from "@/lib/desafio/dados";
import { getParticipantProgress } from "@/lib/desafio/painel";
import { awaitingReply, daysSinceLastEvent } from "@/lib/desafio/progresso";
import { CONTACT_LABELS, nextStatuses } from "@/lib/desafio/regras";
import { isStaff } from "@/lib/membership/require-member";

export const dynamic = "force-dynamic";

type Contact = WarmContact & { events: WarmContactEvent[] };

const COLUMNS = ["listado", "abordado", "respondeu", "briefing", "proposta", "fechado"] as const;
const NEXT_LABEL: Partial<Record<Contact["status"], string>> = {
  listado: "Marcar abordado", abordado: "Respondeu", respondeu: "Marcar briefing",
  briefing: "Enviar proposta", proposta: "Fechado",
};
const EVENT_LABEL: Record<WarmContactEvent["type"], string> = {
  listado: "Adicionado", abordado: "Abordado", respondeu: "Respondeu", briefing: "Briefing",
  proposta: "Proposta", fechado: "Fechado", perdido: "Perdido", retorno: "Retorno", agendamento: "Retorno agendado",
};
const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const small = "inline-flex min-h-9 items-center justify-center rounded-lg px-2.5 text-xs font-semibold transition-colors disabled:opacity-60";

export default async function WarmContactsPage({ searchParams }: { searchParams: Promise<{ agora?: string }> }) {
  const { member, enrollment } = await requireChallengeParticipant();
  const now = challengeNow(member.membership.role, (await searchParams).agora);
  const [contacts, progress] = await Promise.all([
    getContacts(member.user.id), getParticipantProgress(enrollment, now.toISOString()),
  ]);
  const today = progress.today;
  const ended = today > END;
  const lost = contacts.filter((contact) => contact.status === "perdido");
  const waiting = contacts.filter((contact) => contact.status === "respondeu" && awaitingReply(contact));

  return (
    <div className="feed-wrap space-y-6">
      <ChallengeHeading title="Contatos quentes" details="Pessoas próximas e negócios do seu bairro. Os frios ficam no Orion." />
      <ChallengeNav current="/desafio/contatos" contacts={contacts.length} staff={isStaff(member.membership.role)} />

      <div className="grid gap-2.5 sm:grid-cols-3">
        <StatCard label="Abordados nesta semana" value={progress.current.warmCount}
          detail={`${progress.totalWarm} no total${progress.current.warm ? ` · mínimo ${progress.current.warm} na semana ${progress.current.number}` : ""}`} />
        <StatCard label="Esperando seu retorno" value={waiting.length} detail={waiting.length ? "responderam e aguardam" : "ninguém esperando"} />
        <StatCard label="Ainda não abordados" value={contacts.filter((contact) => contact.status === "listado").length} detail={`da sua lista de ${contacts.length}`} />
      </div>

      {!ended && (
        <details id="novo" className="group rounded-2xl border border-border bg-card" open={contacts.length === 0}>
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 font-semibold sm:px-5">
            Adicionar contato<span aria-hidden="true" className="text-xl text-accent group-open:rotate-45">+</span>
          </summary>
          <div className="border-t border-border px-4 py-4 sm:px-5">
            <ChallengeForm action={createWarmContact} submit="Adicionar contato" resetOnSuccess>
              <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
                <Field label="Nome"><input name="name" className={field} required maxLength={120} placeholder="Ex.: Padaria Pão Dourado" /></Field>
                <Field label="Tipo">
                  <select name="kind" className={field} required defaultValue="negocio">
                    <option value="negocio">Negócio</option>
                    <option value="pessoa">Pessoa</option>
                  </select>
                </Field>
              </div>
              <Field label="Canal ou observação (opcional)"><input name="note" className={field} maxLength={500} placeholder="Ex.: WhatsApp · academia do bairro" /></Field>
            </ChallengeForm>
          </div>
        </details>
      )}

      {contacts.length === 0
        ? <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">Comece listando 30 contatos quentes: família, amigos, ex-colegas e negócios perto de você.</p>
        : (
          <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            <div className="grid min-w-[1080px] grid-cols-6 gap-3">
              {COLUMNS.map((status) => {
                const items = contacts.filter((contact) => contact.status === status);
                return (
                  <section key={status} aria-labelledby={`col-${status}`} className="flex flex-col gap-2 rounded-xl bg-surface/60 p-2">
                    <div className="flex items-center justify-between px-1 py-1">
                      <h2 id={`col-${status}`} className="text-[13px] font-semibold">{CONTACT_LABELS[status]}</h2>
                      <span className="rounded-full bg-card px-2 text-xs text-muted">{items.length}</span>
                    </div>
                    {items.map((contact) => <ContactCard key={contact.id} contact={contact} today={today} ended={ended} />)}
                  </section>
                );
              })}
            </div>
          </div>
        )}

      {lost.length > 0 && (
        <details className="rounded-2xl border border-border bg-card px-4 py-3 sm:px-5">
          <summary className="cursor-pointer text-sm font-semibold">Perdidos ({lost.length})</summary>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            {lost.map((contact) => <li key={contact.id}>{contact.name}{contact.note ? ` · ${contact.note}` : ""}</li>)}
          </ul>
        </details>
      )}

      <p className="text-[13px] text-muted">
        Abordagem = primeira mensagem enviada ao contato; mensagens seguintes são retornos. Contato só listado não conta para a meta.
      </p>
    </div>
  );
}

function ContactCard({ contact, today, ended }: { contact: Contact; today: string; ended: boolean }) {
  const last = contact.events.findLast((event) => event.type !== "retorno" && event.type !== "agendamento") ?? contact.events.at(-1);
  const idle = daysSinceLastEvent(contact, today);
  const alert = contact.status === "respondeu" && awaitingReply(contact) ? "Responder hoje"
    : contact.nextFollowUpOn && contact.nextFollowUpOn <= today && !["fechado", "perdido"].includes(contact.status) ? "Retorno combinado para hoje"
    : ["abordado", "proposta"].includes(contact.status) && idle >= 3 ? `Sem resposta há ${idle} dias` : null;
  const next = nextStatuses(contact.status).find((status) => status !== "perdido");
  const open = !ended && !["fechado", "perdido"].includes(contact.status);

  return (
    <article className="flex flex-col gap-1.5 rounded-xl border border-border bg-card p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col">
        <span className={`${displayTitle} text-sm leading-snug`}>{contact.name}</span>
        <span className="text-xs text-muted">{contact.kind === "negocio" ? "Negócio" : "Pessoa"}{contact.note ? ` · ${contact.note}` : ""}</span>
      </div>
      <span className="text-xs text-muted">
        {last ? `${EVENT_LABEL[last.type]} ${weekdayDay(dayInSaoPaulo(last.at))}` : ""}
        {contact.followUps > 0 ? ` · ${contact.followUps} ${contact.followUps === 1 ? "retorno" : "retornos"}` : ""}
        {contact.status === "fechado" && contact.closedValue ? ` · ${money.format(Number(contact.closedValue))}` : ""}
        {contact.nextFollowUpOn && open ? ` · retorno ${weekdayDay(contact.nextFollowUpOn)}` : ""}
      </span>
      {alert && <span className="self-start rounded-full bg-[#fef3c7] px-2 py-0.5 text-[11px] font-semibold text-[#92400e]">{alert}</span>}
      {open && (
        <div className="mt-1 flex flex-wrap gap-1.5">
          {next && next !== "fechado" && (
            <ActionButton action={changeWarmContact} fields={{ id: contact.id, previous: contact.status, status: next }}
              className={`${small} bg-accent text-accent-foreground hover:bg-accent-hover`}>
              {NEXT_LABEL[contact.status]}
            </ActionButton>
          )}
          {contact.approachedAt && (
            <ActionButton action={followUpWarmContact} fields={{ id: contact.id }} label={`Registrar retorno para ${contact.name}`}
              className={`${small} border border-border hover:bg-surface`}>
              + retorno
            </ActionButton>
          )}
          <ActionButton action={changeWarmContact} fields={{ id: contact.id, previous: contact.status, status: "perdido" }}
            label={`Marcar ${contact.name} como perdido`} confirm={`Marcar ${contact.name} como perdido?`}
            className={`${small} text-muted hover:bg-surface hover:text-foreground`}>
            Perdido
          </ActionButton>
          {next === "fechado" && (
            <details className="basis-full">
              <summary className={`${small} cursor-pointer list-none bg-accent text-accent-foreground`}>Fechado</summary>
              <ChallengeForm action={changeWarmContact} submit="Confirmar fechamento" className="mt-2">
                <input type="hidden" name="id" value={contact.id} />
                <input type="hidden" name="previous" value={contact.status} />
                <input type="hidden" name="status" value="fechado" />
                <Field label="Valor (opcional)"><input name="closedValue" inputMode="decimal" className={field} placeholder="1200,00" maxLength={14} /></Field>
              </ChallengeForm>
            </details>
          )}
          {contact.approachedAt && (
            <details className="basis-full">
              <summary className="cursor-pointer text-xs text-muted hover:text-foreground">Agendar retorno</summary>
              <ChallengeForm action={followUpWarmContact} submit="Agendar" className="mt-2">
                <input type="hidden" name="id" value={contact.id} />
                <Field label="Data combinada"><input type="date" name="nextFollowUpOn" min={today} className={field} required /></Field>
              </ChallengeForm>
            </details>
          )}
        </div>
      )}
    </article>
  );
}
