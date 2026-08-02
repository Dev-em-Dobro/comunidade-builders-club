import Link from "next/link";
import { requireActiveMemberOrRedirect } from "@/lib/membership/require-member";
import {
  listNotifications,
  NOTIFICATION_LABELS,
} from "@/lib/notifications";
import { markAllReadAction, markReadAction } from "@/actions/notifications";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";

export default async function NotificacoesPage() {
  const member = await requireActiveMemberOrRedirect();

  const items = await listNotifications(member.user.id);

  return (
    <AppShell
      userId={member.user.id}
      isAdmin={member.membership.role === "admin"}
      displayName={member.profile.displayName}
    >
      <div className="feed-wrap">
        <div className="flex items-center justify-between gap-4">
          <h1 className="page-title">Notificações</h1>
          {items.length > 0 ? (
            <form action={markAllReadAction}>
              <button type="submit" className="btn-ghost text-xs">
                Marcar todas como lidas
              </button>
            </form>
          ) : null}
        </div>

        {items.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="Nada por aqui"
              description="Quando alguém comentar, reagir ou te mencionar, aparece nesta lista."
            />
          </div>
        ) : (
          <ul className="mt-6 space-y-2">
            {items.map((n) => {
              const actor = n.actor?.profile?.displayName ?? "Alguém";
              const href = n.postId ? `/posts/${n.postId}` : "/";
              return (
                <li
                  key={n.id}
                  className={`rounded-2xl border border-border p-4 transition-opacity ${
                    n.readAt ? "bg-card opacity-70" : "bg-surface"
                  }`}
                >
                  <Link
                    href={href}
                    className="block text-sm hover:text-accent"
                  >
                    <strong>{actor}</strong>{" "}
                    {NOTIFICATION_LABELS[n.type] ?? n.type}
                    {n.snippet ? (
                      <span className="mt-1 block text-xs text-muted line-clamp-2">
                        “{n.snippet}”
                      </span>
                    ) : null}
                  </Link>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-muted">
                      {n.createdAt.toLocaleString("pt-BR")}
                    </span>
                    {!n.readAt ? (
                      <form action={markReadAction.bind(null, n.id)}>
                        <button type="submit" className="text-xs text-accent">
                          Marcar lida
                        </button>
                      </form>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
