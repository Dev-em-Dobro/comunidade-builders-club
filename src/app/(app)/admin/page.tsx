import { requireAdminOrRedirect } from "@/lib/membership/require-member";
import { listSpaces } from "@/lib/spaces";
import {
  countMembershipsByStatus,
  listMemberships,
} from "@/lib/admin/members";
import { listAllowedEmails } from "@/lib/membership/allowlist";
import { listAllModulesAdmin } from "@/lib/aulas";
import {
  addAllowedEmailAction,
  createLessonAction,
  createModuleAction,
  createSpaceAction,
  deleteLessonAction,
  deleteModuleAction,
  deleteSpaceAction,
  removeAllowedEmailAction,
  setMemberRoleAction,
  setMemberStatusAction,
} from "@/actions/admin";
import { AdminBulkAllowlist } from "@/components/admin-bulk-allowlist";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import type { MembershipStatus } from "@prisma/client";

type Props = {
  searchParams: Promise<{ status?: string; q?: string }>;
};

const STATUSES: Array<MembershipStatus | "all"> = [
  "all",
  "pending",
  "active",
  "revoked",
];

export default async function AdminPage({ searchParams }: Props) {
  const member = await requireAdminOrRedirect();
  const sp = await searchParams;
  const statusFilter =
    sp.status && sp.status !== "all"
      ? (sp.status as MembershipStatus)
      : undefined;
  const q = sp.q?.trim() || undefined;

  const [spaces, memberships, counts, allowed, modules] = await Promise.all([
    listSpaces(),
    listMemberships({ status: statusFilter, q }),
    countMembershipsByStatus(),
    listAllowedEmails(),
    listAllModulesAdmin(),
  ]);

  return (
    <>
      <h1 className="page-title">Administração</h1>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Allowlist (acesso no login)</h2>
        <p className="mt-1 text-sm text-muted">
          E-mails nesta lista entram já com membership ativo.
        </p>
        <form action={addAllowedEmailAction} className="mt-3 flex max-w-md gap-2">
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

        <ul className="mt-3 max-h-64 space-y-1 overflow-y-auto text-sm">
          {allowed.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2"
            >
              <span>
                {a.email}{" "}
                <span className="text-xs text-muted">({a.source})</span>
              </span>
              <form action={removeAllowedEmailAction.bind(null, a.email)}>
                <button type="submit" className="text-xs text-red-600">
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

      <section className="mt-10">
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
                  {m.user.email} · {m.status} · {m.role}
                </p>
              </div>
              <div className="flex flex-wrap gap-1">
                {m.status !== "active" ? (
                  <form
                    action={setMemberStatusAction.bind(null, m.userId, "active")}
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
                    action={setMemberRoleAction.bind(null, m.userId, "admin")}
                  >
                    <button type="submit" className="btn-ghost text-xs">
                      Tornar admin
                    </button>
                  </form>
                ) : (
                  <span className="text-xs text-muted">Admin</span>
                )}
              </div>
            </li>
          ))}
          {memberships.length === 0 ? (
            <li className="text-sm text-muted">Nenhum membro neste filtro.</li>
          ) : null}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Aulas (Panda Video)</h2>
        <p className="mt-1 text-sm text-muted">
          Cadastre módulos e aulas com IDs do Panda. Só itens publicados
          aparecem para membros.
        </p>

        <form action={createModuleAction} className="post-card mt-4 max-w-lg space-y-2">
          <p className="text-sm font-medium">Novo módulo</p>
          <input name="title" className="input" placeholder="Título" required />
          <input name="slug" className="input" placeholder="slug" required />
          <input name="description" className="input" placeholder="Descrição" />
          <input
            name="coverImageUrl"
            className="input"
            placeholder="Capa URL ou /aulas/modulo-capa.png"
          />
          <input
            name="sortOrder"
            type="number"
            className="input"
            defaultValue={0}
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="published" /> Publicado
          </label>
          <button type="submit" className="btn-primary">
            Criar módulo
          </button>
        </form>

        {modules.map((mod) => (
          <div key={mod.id} className="post-card mt-4 max-w-2xl space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex min-w-0 items-start gap-3">
                {mod.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mod.coverImageUrl}
                    alt=""
                    className="h-14 w-10 shrink-0 rounded object-cover"
                  />
                ) : null}
                <div>
                  <p className="font-semibold">
                    {mod.title}{" "}
                    <span className="text-xs font-normal text-muted">
                      /{mod.slug}
                      {mod.published ? " · publicado" : " · rascunho"}
                    </span>
                  </p>
                </div>
              </div>
              <ConfirmDeleteButton
                action={deleteModuleAction.bind(null, mod.id)}
                label="Remover módulo"
                message={`Remover o módulo "${mod.title}" e todas as aulas?`}
              />
            </div>

            <ul className="space-y-2 text-sm">
              {mod.lessons.map((l) => (
                <li
                  key={l.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surface/40 px-3 py-2"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    {l.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={l.thumbnailUrl}
                        alt=""
                        className="h-8 w-14 shrink-0 rounded object-cover"
                      />
                    ) : null}
                    <span>
                      {l.title}{" "}
                      <span className="text-xs text-muted">
                        /{l.slug}
                        {l.published ? "" : " · rascunho"}
                      </span>
                    </span>
                  </span>
                  <ConfirmDeleteButton
                    action={deleteLessonAction.bind(null, l.id)}
                    label="Remover"
                    message={`Remover a aula "${l.title}"?`}
                  />
                </li>
              ))}
            </ul>

            <form action={createLessonAction} className="space-y-2 border-t border-border pt-3">
              <p className="text-xs font-medium text-muted">Nova aula neste módulo</p>
              <input type="hidden" name="moduleId" value={mod.id} />
              <input name="title" className="input" placeholder="Título da aula" required />
              <input name="slug" className="input" placeholder="slug-da-aula" required />
              <input
                name="pandaLibraryId"
                className="input"
                placeholder="Library/pullzone (ex: 77c52f03-dc6)"
                required
              />
              <input
                name="pandaVideoExternalId"
                className="input"
                placeholder="Video external ID"
                required
              />
              <input
                name="thumbnailUrl"
                className="input"
                placeholder="URL thumbnail (opcional)"
              />
              <input name="description" className="input" placeholder="Descrição" />
              <input
                name="sortOrder"
                type="number"
                className="input"
                defaultValue={mod.lessons.length}
              />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="published" defaultChecked /> Publicado
              </label>
              <button type="submit" className="btn-outline text-sm">
                Adicionar aula
              </button>
            </form>
          </div>
        ))}
      </section>

      <section className="mt-10">
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
                <button type="submit" className="text-xs text-red-600">
                  Remover
                </button>
              </form>
            </li>
          ))}
        </ul>

        <form action={createSpaceAction} className="post-card mt-4 max-w-md space-y-2">
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
    </>
  );
}
