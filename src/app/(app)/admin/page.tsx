import Link from "next/link";
import { Suspense } from "react";
import { requireAdminOrRedirect } from "@/lib/membership/require-member";
import { listSpaces } from "@/lib/spaces";
import {
  countMembershipsByStatus,
  listMemberships,
} from "@/lib/admin/members";
import { listAllowedEmails } from "@/lib/membership/allowlist";
import { listAllModulesAdmin } from "@/lib/aulas";
import { listUtmPostMetrics } from "@/lib/gifts/metricas";
import { listGiftPostsAdmin } from "@/lib/gifts";
import {
  addAllowedEmailAction,
  createSpaceAction,
  deleteSpaceAction,
  removeAllowedEmailAction,
  setMemberRoleAction,
  setMemberStatusAction,
  updateLiveScheduleAction,
} from "@/actions/admin";
import { obterRegraLiveSchedule, proximaLive } from "@/lib/live";
import { AdminBulkAllowlist } from "@/components/admin-bulk-allowlist";
import { AdminAulasPanel } from "@/components/admin-aulas-panel";
import { AdminGiftLinks } from "@/components/admin-gift-links";
import { AdminGiftMetrics } from "@/components/admin-gift-metrics";
import { AdminDeniedLogins } from "@/components/admin-denied-logins";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import {
  listAllowlistWithoutUser,
  listDeniedLoginGroups,
} from "@/lib/admin/denied-logins";
import {
  AdminTabs,
} from "@/components/admin-tabs";
import { isAdminTab, type AdminTabId } from "@/lib/admin/tabs";
import { labelAllowedEmailSource } from "@/lib/membership/allowlist-labels";
import type { MembershipStatus } from "@prisma/client";
import { tierLabel } from "@/lib/membership/capabilities";

type Props = {
  searchParams: Promise<{ status?: string; q?: string; tab?: string }>;
};

export const dynamic = "force-dynamic";

const STATUSES: Array<MembershipStatus | "all"> = [
  "all",
  "pending",
  "active",
  "revoked",
];

const DIAS_SEMANA = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

function formatarBR(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(d);
}

/** Valor pro <input type="datetime-local">, em horário de Brasília. */
function paraDatetimeLocalBRT(d: Date): string {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (t: string) => partes.find((p) => p.type === t)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

export default async function AdminPage({ searchParams }: Props) {
  await requireAdminOrRedirect();
  const sp = await searchParams;
  const tab: AdminTabId = isAdminTab(sp.tab) ? sp.tab : "allowlist";

  const statusFilter =
    sp.status && sp.status !== "all"
      ? (sp.status as MembershipStatus)
      : undefined;
  const q = sp.q?.trim() || undefined;

  const [spaces, memberships, counts, allowed, modules, deniedGroups, purchasesWithoutLogin, utmMetrics, giftPosts, liveRegra] = await Promise.all([
    tab === "spaces" ? listSpaces() : Promise.resolve([]),
    tab === "membros"
      ? listMemberships({ status: statusFilter, q })
      : Promise.resolve([]),
    tab === "membros"
      ? countMembershipsByStatus()
      : Promise.resolve({ pending: 0, active: 0, revoked: 0 }),
    tab === "allowlist" ? listAllowedEmails() : Promise.resolve([]),
    tab === "aulas" ? listAllModulesAdmin() : Promise.resolve([]),
    tab === "tentativas" ? listDeniedLoginGroups() : Promise.resolve([]),
    tab === "tentativas" ? listAllowlistWithoutUser() : Promise.resolve([]),
    tab === "presentes" ? listUtmPostMetrics() : Promise.resolve([]),
    tab === "presentes" ? listGiftPostsAdmin() : Promise.resolve([]),
    tab === "live" ? obterRegraLiveSchedule() : Promise.resolve(null),
  ]);

  return (
    <div className="feed-wrap">
      <h1 className="page-title">Administração</h1>
      <p className="mt-1.5 text-sm text-muted">
        Gerencie acesso, membros, aulas e spaces. Progresso dos alunos fica em{" "}
        <Link
          href="/admin/progresso"
          className="font-medium text-accent hover:underline"
        >
          Progresso
        </Link>
        .
      </p>

      <Suspense fallback={<div className="mt-6 h-11 animate-pulse rounded-xl bg-surface" />}>
        <AdminTabs active={tab} />
      </Suspense>

      {tab === "tentativas" ? (
        <AdminDeniedLogins
          groups={deniedGroups}
          purchasesWithoutLogin={purchasesWithoutLogin}
        />
      ) : null}

      {tab === "allowlist" ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Allowlist (acesso no login)</h2>
          <p className="mt-1 text-sm text-muted">
            E-mails nesta lista entram já com membership ativo como{" "}
            <strong>member</strong> (não admin). Use “Tornar admin” em Membros
            quando precisar.
          </p>
          <form
            action={addAllowedEmailAction}
            className="mt-3 flex max-w-md gap-2"
          >
            <input
              name="email"
              type="email"
              className="input"
              placeholder="aluno@email.com"
              required
            />
            <button type="submit" className="btn-primary shrink-0">
              Adicionar
            </button>
          </form>

          <h3 className="mt-6 text-sm font-semibold">Importação em massa</h3>
          <AdminBulkAllowlist />

          <ul className="mt-3 max-h-96 space-y-1 overflow-y-auto text-sm">
            {allowed.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2"
              >
                <span>
                  {a.email}{" "}
                  <span className="text-xs text-muted">
                    ({labelAllowedEmailSource(a.source)})
                  </span>
                </span>
                <form action={removeAllowedEmailAction.bind(null, a.email)}>
                  <button
                    type="submit"
                    className="cursor-pointer text-xs text-red-600"
                  >
                    Remover
                  </button>
                </form>
              </li>
            ))}
            {allowed.length === 0 ? (
              <li className="text-muted">Allowlist vazia.</li>
            ) : null}
          </ul>
        </section>
      ) : null}

      {tab === "membros" ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Membros</h2>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="rounded-lg bg-surface px-2 py-1">
              pending: {counts.pending}
            </span>
            <span className="rounded-lg bg-surface px-2 py-1">
              active: {counts.active}
            </span>
            <span className="rounded-lg bg-surface px-2 py-1">
              revoked: {counts.revoked}
            </span>
          </div>

          <form className="mt-3 flex max-w-xl flex-wrap gap-2" method="get">
            <input type="hidden" name="tab" value="membros" />
            <input
              name="q"
              className="input max-w-xs"
              placeholder="Buscar e-mail ou nome"
              defaultValue={q ?? ""}
            />
            <select
              name="status"
              className="input max-w-[160px]"
              defaultValue={sp.status ?? "all"}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "Todos os status" : s}
                </option>
              ))}
            </select>
            <button type="submit" className="btn-outline text-sm">
              Filtrar
            </button>
          </form>

          <ul className="mt-3 space-y-2">
            {memberships.map((m) => (
              <li
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card p-3 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {m.user.profile?.displayName ?? m.user.email}
                  </p>
                  <p className="text-xs text-muted">
                    {m.user.email} · {m.status} · {m.role} · {tierLabel(m.tier)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {m.status !== "active" ? (
                    <form
                      action={setMemberStatusAction.bind(
                        null,
                        m.userId,
                        "active",
                      )}
                    >
                      <button type="submit" className="btn-primary text-xs">
                        Ativar
                      </button>
                    </form>
                  ) : (
                    <form
                      action={setMemberStatusAction.bind(
                        null,
                        m.userId,
                        "revoked",
                      )}
                    >
                      <button type="submit" className="btn-outline text-xs">
                        Revogar
                      </button>
                    </form>
                  )}
                  {m.role !== "admin" ? (
                    <form
                      action={setMemberRoleAction.bind(
                        null,
                        m.userId,
                        "admin",
                      )}
                    >
                      <button
                        type="submit"
                        className="btn-ghost cursor-pointer text-xs"
                      >
                        Tornar admin
                      </button>
                    </form>
                  ) : (
                    <form
                      action={setMemberRoleAction.bind(
                        null,
                        m.userId,
                        "member",
                      )}
                    >
                      <button
                        type="submit"
                        className="btn-ghost cursor-pointer text-xs text-amber-700"
                      >
                        Remover admin
                      </button>
                    </form>
                  )}
                </div>
              </li>
            ))}
            {memberships.length === 0 ? (
              <li className="text-sm text-muted">
                Nenhum membro neste filtro.
              </li>
            ) : null}
          </ul>
        </section>
      ) : null}

      {tab === "aulas" ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Aulas (Panda Video)</h2>
          <p className="mt-1 text-sm text-muted">
            Árvore da formação, módulos e submódulos. Criação fica nos
            formulários acima da lista — não se repete em cada item. Só
            publicados aparecem para membros.
          </p>
          <AdminAulasPanel modules={modules} />
        </section>
      ) : null}

      {tab === "presentes" ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Links para o Instagram</h2>
          <p className="mt-1 text-sm text-muted">
            Publique o presente no space Presentes (com slug) e copie o link
            do DM. Quem abre lê o conteúdo e se cadastra na mesma página.
          </p>
          <AdminGiftLinks
            gifts={giftPosts.map((g) => ({ slug: g.slug, label: g.label }))}
          />

          <h3 className="mt-10 text-base font-semibold">Desempenho por post</h3>
          <p className="mt-1 text-sm text-muted">
            Visitas no link, cadastros e quem depois assinou plano pago
            (PRO/Elite) com origem naquela postagem.
          </p>
          <AdminGiftMetrics rows={utmMetrics} />
        </section>
      ) : null}

      {tab === "spaces" ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Spaces</h2>
          <ul className="mt-3 space-y-2">
            {spaces.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-3 text-sm"
              >
                <span>
                  <strong>{s.name}</strong>{" "}
                  <span className="text-muted">/{s.slug}</span>
                </span>
                <form action={deleteSpaceAction.bind(null, s.id)}>
                  <button
                    type="submit"
                    className="cursor-pointer text-xs text-red-600"
                  >
                    Remover
                  </button>
                </form>
              </li>
            ))}
          </ul>

          <form
            action={createSpaceAction}
            className="post-card mt-4 max-w-md space-y-2"
          >
            <p className="text-sm font-medium">Novo space</p>
            <input name="name" className="input" placeholder="Nome" required />
            <input name="slug" className="input" placeholder="slug" required />
            <input name="description" className="input" placeholder="Descrição" />
            <input
              name="sortOrder"
              type="number"
              className="input"
              defaultValue={99}
            />
            <button type="submit" className="btn-primary">
              Criar
            </button>
          </form>
        </section>
      ) : null}

      {tab === "live" && liveRegra ? (
        <section className="mt-8 max-w-xl">
          <h2 className="text-lg font-semibold">Live semanal</h2>
          <p className="mt-1 text-sm text-muted">
            Regra padrão (dia/horário que se repete toda semana) e uma
            exceção pontual pra quando o horário muda numa semana
            específica. Horários em Brasília. A faixa no Club e os
            lembretes por e-mail usam o que estiver aqui.
          </p>
          <p className="mt-3 rounded-lg border border-border bg-card px-3 py-2 text-sm">
            Próxima live calculada agora:{" "}
            <strong>{formatarBR(proximaLive(liveRegra, new Date()))}</strong>
          </p>

          <form
            action={updateLiveScheduleAction}
            className="post-card mt-4 space-y-3"
          >
            <div>
              <p className="text-sm font-medium">Regra padrão</p>
              <div className="mt-1 flex flex-wrap gap-2">
                <select
                  name="weekday"
                  className="input max-w-[160px]"
                  defaultValue={liveRegra.weekday}
                >
                  {DIAS_SEMANA.map((label, i) => (
                    <option key={label} value={i}>
                      {label}
                    </option>
                  ))}
                </select>
                <input
                  name="hour"
                  type="number"
                  min={0}
                  max={23}
                  className="input max-w-[90px]"
                  defaultValue={liveRegra.hour}
                  aria-label="Hora (Brasília)"
                />
                <input
                  name="minute"
                  type="number"
                  min={0}
                  max={59}
                  className="input max-w-[90px]"
                  defaultValue={liveRegra.minute}
                  aria-label="Minuto"
                />
              </div>
            </div>

            <div>
              <p className="text-sm font-medium">
                Exceção pontual (opcional)
              </p>
              <p className="text-xs text-muted">
                Some sozinha depois que passa — só preenche quando a live
                dessa semana foge da regra padrão.
              </p>
              <input
                name="nextOverrideAt"
                type="datetime-local"
                className="input mt-1 max-w-xs"
                defaultValue={
                  liveRegra.nextOverrideAt
                    ? paraDatetimeLocalBRT(liveRegra.nextOverrideAt)
                    : ""
                }
              />
            </div>

            <div>
              <p className="text-sm font-medium">Link da live (Zoom)</p>
              <p className="text-xs text-muted">
                Pra onde a faixa e o e-mail de lembrete levam. Vazio cai pro
                Club.
              </p>
              <input
                name="zoomUrl"
                type="url"
                className="input mt-1 max-w-md"
                placeholder="https://zoom.us/j/..."
                defaultValue={liveRegra.zoomUrl ?? ""}
              />
            </div>

            <button type="submit" className="btn-primary">
              Salvar
            </button>
          </form>
        </section>
      ) : null}
    </div>
  );
}
