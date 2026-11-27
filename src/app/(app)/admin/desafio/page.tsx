import Link from "next/link";
import { decideEnrollment } from "@/actions/desafio";
import { ActionButton, ChallengeForm } from "@/components/desafio/forms";
import { Farol, Field, StatCard, brandEyebrow, displayTitle, field, panel } from "@/components/desafio/ui";
import { canDecideEnrollments, challengeNow, requireChallengeStaff } from "@/lib/desafio/acesso";
import { challengeMoment, dayInSaoPaulo } from "@/lib/desafio/calendario";
import { TEAM_FILTERS, filterRows, isTeamFilter, teamRow, teamTotals, type TeamRow } from "@/lib/desafio/equipe";
import { getTeamDashboard } from "@/lib/desafio/painel";

export const dynamic = "force-dynamic";

const TABS = { inscritos: "Inscritos", pendentes: "Cadastros pendentes", outros: "Recusados e removidos" } as const;
type Tab = keyof typeof TABS;
const applied = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" });

export default async function TeamChallengePage({ searchParams }: {
  searchParams: Promise<{ aba?: string; filtro?: string; agora?: string }>;
}) {
  const staff = await requireChallengeStaff();
  const params = await searchParams;
  const now = challengeNow(staff.membership.role, params.agora);
  const canDecide = canDecideEnrollments(staff.membership.role);
  const tab: Tab = params.aba && params.aba in TABS ? (params.aba as Tab) : "inscritos";
  const filter = isTeamFilter(params.filtro) ? params.filtro : undefined;

  const rows = (await getTeamDashboard(now.toISOString())).map(teamRow);
  const totals = teamTotals(rows);
  const approved = rows.filter((row) => row.status === "aprovado");
  const byTab: Record<Tab, TeamRow[]> = {
    inscritos: approved,
    pendentes: rows.filter((row) => row.status === "pendente"),
    outros: rows.filter((row) => row.status === "recusado" || row.status === "removido"),
  };
  const visible = tab === "inscritos" ? filterRows(approved, filter) : byTab[tab];
  const moment = challengeMoment(dayInSaoPaulo(now));
  const query = (next: Record<string, string | undefined>) => {
    const search = new URLSearchParams();
    const merged = { aba: tab, filtro: filter, agora: params.agora, ...next };
    for (const [key, value] of Object.entries(merged)) if (value) search.set(key, value);
    return `/admin/desafio?${search.toString()}`;
  };

  return (
    <div className="feed-wrap-wide space-y-6">
      <Link href="/admin" className="text-sm font-medium text-accent hover:underline">← Administração</Link>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1.5">
          <p className={brandEyebrow}>Admin · Desafio 45 dias</p>
          <h1 className="page-title">Acompanhamento da turma</h1>
          <p className="text-[15px] text-muted">
            {moment.stage === "durante" ? `Dia ${moment.day.number} · semana ${moment.day.week.number}` : moment.stage === "antes" ? `Começa em ${moment.daysToStart} dias` : "Turma encerrada"}
            {" · frias do Orion entram com a integração"}
            {!canDecide && " · instructor: somente leitura"}
          </p>
        </div>
        <a href={`/admin/desafio/csv${filter && tab === "inscritos" ? `?filtro=${filter}` : ""}`} className="btn-outline min-h-11">Exportar CSV</a>
      </header>

      <nav aria-label="Seções do desafio" className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1">
        {(Object.keys(TABS) as Tab[]).map((key) => (
          <Link key={key} href={query({ aba: key, filtro: undefined })} aria-current={tab === key ? "page" : undefined}
            className={`shrink-0 rounded-lg px-3.5 py-2 text-sm font-medium ${tab === key ? "bg-accent text-white shadow-sm" : "text-muted hover:bg-surface hover:text-foreground"}`}>
            {TABS[key]} ({byTab[key].length})
          </Link>
        ))}
      </nav>

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Inscritos" value={totals.enrolled} detail={`${totals.pending} aguardando aprovação`} />
        <StatCard label="Em dia" value={totals.onTrackPct === null ? "—" : `${totals.onTrackPct}%`} detail={`${totals.colors.green} verdes · ${totals.colors.yellow} amarelos · ${totals.colors.red} vermelhos`} />
        <StatCard label="Abordagens quentes" value={totals.warm.toLocaleString("pt-BR")} detail="frias: integração em breve" />
        <StatCard label="Propostas abertas" value={totals.proposals} detail="contatos quentes" />
        <StatCard label="Vendas" value={totals.sales} detail={`${totals.declaredSales} declaradas no check-in`} />
      </div>

      {tab === "inscritos" && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] text-muted">Filtrar:</span>
          {[[undefined, "Todos", approved.length] as const, ...(Object.entries(TEAM_FILTERS).map(([key, label]) => [key, label, filterRows(approved, key as keyof typeof TEAM_FILTERS).length] as const))].map(([key, label, count]) => (
            <Link key={label} href={query({ filtro: key })} aria-current={filter === key ? "true" : undefined}
              className={`inline-flex min-h-9 items-center rounded-full px-3.5 text-[13px] font-semibold ${
                filter === key ? "border border-accent bg-accent/10 text-accent-hover" : "border border-border bg-card"
              }`}>
              {label} ({count})
            </Link>
          ))}
        </div>
      )}

      {visible.length === 0
        ? <p className={`${panel} text-sm text-muted`}>Nada por aqui.</p>
        : tab === "inscritos"
          ? <EnrolledTable rows={visible} canDecide={canDecide} />
          : (
            <ul className="space-y-3">
              {visible.map((row) => <ApplicationCard key={row.userId} row={row} canDecide={canDecide && tab === "pendentes"} />)}
            </ul>
          )}

      {tab === "inscritos" && (
        <p className="text-xs text-muted">
          Verde: no ritmo da meta e registro nos últimos 2 dias · Amarelo: abaixo do ritmo ou 2–3 dias parado · Vermelho: 4+ dias parado ou marco anterior não batido (S4–S5: só falta de check-in).
        </p>
      )}
    </div>
  );
}

function EnrolledTable({ rows, canDecide }: { rows: TeamRow[]; canDecide: boolean }) {
  const th = "px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted";
  const td = "px-3 py-3 align-top text-sm";
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full min-w-[1080px] border-collapse">
        <thead className="border-b border-border">
          <tr>
            <th scope="col" className={th}>Membro</th>
            <th scope="col" className={th}>Farol</th>
            <th scope="col" className={th}>Quentes sem./total</th>
            <th scope="col" className={th}>Aulas</th>
            <th scope="col" className={th}>Check-in</th>
            <th scope="col" className={th}>Onde travou</th>
            <th scope="col" className={th}>Último registro</th>
            <th scope="col" className={th}>Funil</th>
            {canDecide && <th scope="col" className={th}><span className="sr-only">Ações</span></th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.userId}>
              <td className={td}>
                <p className="font-semibold">{row.name}</p>
                <p className="text-xs text-muted">S{row.joinedWeek} · {row.offer}</p>
                <p className="text-xs text-muted">{row.email} · {row.whatsapp}</p>
              </td>
              <td className={td}>{row.farol && <Farol {...row.farol} small />}</td>
              <td className={td}><strong>{row.warmWeek}</strong><span className="text-muted"> / {row.warmTotal}</span></td>
              <td className={td}>{row.lessons}</td>
              <td className={td}>
                {row.lastCheckinWeek ? `S${row.lastCheckinWeek}` : "—"}
                {row.missingCheckin && <span className="ml-1 rounded-full bg-[#fee2e2] px-1.5 text-[11px] font-semibold text-[#991b1b]">faltou</span>}
                {row.portfolioUrl && <a href={row.portfolioUrl} target="_blank" rel="noopener noreferrer" className="block text-xs text-accent hover:underline">portfólio</a>}
              </td>
              <td className={`${td} max-w-[240px] text-muted`}>{row.blocker || "—"}</td>
              <td className={td}>{row.lastRecordAgo}</td>
              <td className={`${td} text-xs`}>
                {row.proposals > 0 && <span className="block">{row.proposals} {row.proposals === 1 ? "proposta" : "propostas"}</span>}
                {row.sales > 0 && <span className="block font-semibold text-[#166534]">{row.sales} {row.sales === 1 ? "fechado" : "fechados"}</span>}
                {row.declaredSales > 0 && <span className="block text-muted">{row.declaredSales} venda(s) declarada(s)</span>}
                {!row.proposals && !row.sales && !row.declaredSales && "—"}
              </td>
              {canDecide && (
                <td className={td}>
                  <details>
                    <summary className="cursor-pointer text-xs text-muted hover:text-foreground">Remover</summary>
                    <ChallengeForm action={decideEnrollment} submit="Remover do desafio" className="mt-2 w-56">
                      <input type="hidden" name="userId" value={row.userId} />
                      <input type="hidden" name="status" value="removido" />
                      <Field label="Motivo"><input name="reason" required maxLength={500} className={field} /></Field>
                    </ChallengeForm>
                  </details>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ApplicationCard({ row, canDecide }: { row: TeamRow; canDecide: boolean }) {
  return (
    <li className={`${panel} space-y-3`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className={`${displayTitle} text-base`}>{row.name}</p>
          <p className="text-xs text-muted">{row.email} · {row.whatsapp} · enviado {applied.format(row.appliedAt)}</p>
        </div>
        {row.status !== "pendente" && <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-semibold capitalize">{row.status}</span>}
      </div>
      <dl className="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
        <div><dt className="inline text-muted">Momento: </dt><dd className="inline">{row.workStage}</dd></div>
        <div><dt className="inline text-muted">Horas/semana: </dt><dd className="inline">{row.weeklyHours}</dd></div>
        <div><dt className="inline text-muted">Oferta: </dt><dd className="inline">{row.offer}</dd></div>
        <div className="sm:col-span-2"><dt className="inline text-muted">Por quê agora: </dt><dd className="inline">{row.motivation}</dd></div>
        {row.removedReason && <div className="sm:col-span-2"><dt className="inline text-muted">Motivo: </dt><dd className="inline">{row.removedReason}</dd></div>}
      </dl>
      {canDecide && (
        <div className="flex flex-wrap items-start gap-3">
          <ActionButton action={decideEnrollment} fields={{ userId: row.userId, status: "aprovado", reason: "" }} className="btn-primary min-h-10">
            Aprovar
          </ActionButton>
          <details>
            <summary className="btn-outline min-h-10 cursor-pointer list-none">Recusar</summary>
            <ChallengeForm action={decideEnrollment} submit="Confirmar recusa" className="mt-2 w-72">
              <input type="hidden" name="userId" value={row.userId} />
              <input type="hidden" name="status" value="recusado" />
              <Field label="Motivo (o membro vê)"><input name="reason" required maxLength={500} className={field} /></Field>
            </ChallengeForm>
          </details>
        </div>
      )}
    </li>
  );
}
