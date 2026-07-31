import { requireAdminOrRedirect } from "@/lib/membership/require-member";
import { listSpaces } from "@/lib/spaces";
import { listMemberships } from "@/lib/admin/members";
import { listAllowedEmails } from "@/lib/membership/allowlist";
import {
  addAllowedEmailAction,
  createSpaceAction,
  deleteSpaceAction,
  removeAllowedEmailAction,
  setMemberRoleAction,
  setMemberStatusAction,
} from "@/actions/admin";
import { AppShell } from "@/components/app-shell";

export default async function AdminPage() {
  const member = await requireAdminOrRedirect();

  const [spaces, memberships, allowed] = await Promise.all([
    listSpaces(),
    listMemberships(),
    listAllowedEmails(),
  ]);

  return (
    <AppShell
      userId={member.user.id}
      isAdmin
      displayName={member.profile.displayName}
    >
      <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold">
        Administração
      </h1>

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
            <li className="text-muted">
              Vazia — rode{" "}
              <code className="text-xs">npm run db:import-allowed -- --orion</code>
            </li>
          ) : null}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Membros</h2>
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
                  <form action={setMemberStatusAction.bind(null, m.userId, "active")}>
                    <button type="submit" className="btn-primary text-xs">
                      Ativar
                    </button>
                  </form>
                ) : (
                  <form action={setMemberStatusAction.bind(null, m.userId, "revoked")}>
                    <button type="submit" className="btn-outline text-xs">
                      Revogar
                    </button>
                  </form>
                )}
                {m.role !== "admin" ? (
                  <form action={setMemberRoleAction.bind(null, m.userId, "admin")}>
                    <button type="submit" className="btn-ghost text-xs">
                      Tornar admin
                    </button>
                  </form>
                ) : (
                  <form action={setMemberRoleAction.bind(null, m.userId, "member")}>
                    <button type="submit" className="btn-ghost text-xs">
                      Remover admin
                    </button>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
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
    </AppShell>
  );
}
