import { countUnread, listUnreadPreview, NOTIFICATION_LABELS } from "@/lib/notifications";
import { listSpaces } from "@/lib/spaces";
import { AppShellClient } from "@/components/app-shell-client";

export async function AppShell({
  children,
  userId,
  isAdmin,
  displayName,
  avatarUrl,
}: {
  children: React.ReactNode;
  userId: string;
  isAdmin: boolean;
  displayName: string;
  avatarUrl?: string | null;
}) {
  const [spaces, unread, preview] = await Promise.all([
    listSpaces(),
    countUnread(userId),
    listUnreadPreview(userId, 8),
  ]);

  return (
    <AppShellClient
      displayName={displayName}
      isAdmin={isAdmin}
      unread={unread}
      spaces={spaces.map((s) => ({ id: s.id, slug: s.slug, name: s.name }))}
      avatarUrl={avatarUrl}
      notifPreview={preview.map((n) => ({
        id: n.id,
        type: n.type,
        postId: n.postId,
        snippet: n.snippet,
        createdAt: n.createdAt.toISOString(),
        actorName: n.actor?.profile?.displayName ?? "Alguém",
        label: NOTIFICATION_LABELS[n.type] ?? n.type,
      }))}
    >
      {children}
    </AppShellClient>
  );
}
