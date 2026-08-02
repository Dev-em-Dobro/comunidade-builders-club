import { countUnread } from "@/lib/notifications";
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
  const [spaces, unread, profile] = await Promise.all([
    listSpaces(),
    countUnread(userId),
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
    >
      {children}
    </AppShellClient>
  );
}
