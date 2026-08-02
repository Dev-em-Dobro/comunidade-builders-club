import { countUnread, listUnreadPreview, NOTIFICATION_LABELS } from "@/lib/notifications";
import { listSpaces } from "@/lib/spaces";
import { prisma } from "@/lib/db";
import { AppShellClient } from "@/components/app-shell-client";

export async function AppShell({
  children,
  userId,
  isAdmin,
  displayName,
}: {
  children: React.ReactNode;
  userId: string;
  isAdmin: boolean;
  displayName: string;
}) {
  const [spaces, unread, preview, profile] = await Promise.all([
    listSpaces(),
    countUnread(userId),
    listUnreadPreview(userId, 8),
    prisma.profile.findUnique({
      where: { userId },
      select: { avatarUrl: true },
    }),
  ]);

  return (
    <AppShellClient
      displayName={displayName}
      isAdmin={isAdmin}
      unread={unread}
      spaces={spaces.map((s) => ({ id: s.id, slug: s.slug, name: s.name }))}
      avatarUrl={profile?.avatarUrl}
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
