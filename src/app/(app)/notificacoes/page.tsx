import Link from "next/link";
import { requireActiveMemberOrRedirect } from "@/lib/membership/require-member";
import { listNotifications } from "@/lib/notifications";
import { markAllReadAction, markReadAction } from "@/actions/notifications";
import { AppShell } from "@/components/app-shell";

const LABELS: Record<string, string> = {
  comment_on_post: "comentou no seu post",
  reaction_on_post: "reagiu ao seu post",
  reply_on_comment: "respondeu seu comentário",
};

export default async function NotificacoesPage() {
  const member = await requireActiveMemberOrRedirect();

  const items = await listNotifications(member.user.id);

  return (
    <AppShell
      userId={member.user.id}
      isAdmin={member.membership.role === "admin"}
      displayName={member.profile.displayName}
    >
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold">
          Notificações
        </h1>
        <form action={markAllReadAction}>
          <button type="submit" className="btn-ghost text-xs">
            Marcar todas como lidas
          </button>
        </form>
      </div>

      <ul className="mt-6 space-y-2">
        {items.length === 0 ? (
          <li className="text-sm text-muted">Nenhuma notificação.</li>
        ) : (
          items.map((n) => {
            const actor = n.actor?.profile?.displayName ?? "Alguém";
            const href = n.postId ? `/posts/${n.postId}` : "/";
            return (
              <li
                key={n.id}
                className={`rounded-lg border border-border p-3 ${
                  n.readAt ? "bg-card opacity-70" : "bg-surface"
                }`}
              >
                <Link href={href} className="text-sm hover:text-accent">
                  <strong>{actor}</strong> {LABELS[n.type] ?? n.type}
                </Link>
                <div className="mt-1 flex items-center justify-between">
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
          })
        )}
      </ul>
    </AppShell>
  );
}
