import { countUnread } from "@/lib/notifications";
import { listSpaces } from "@/lib/spaces";
import { checkoutUrlBuildersClub } from "@/lib/membership/checkout";
import { AppShellClient } from "@/components/app-shell-client";

/**
 * Shell enxuto: spaces (cache) + contagem de não lidas.
 * Preview de notificações fica no poll do client (1ª chamada imediata).
 */
export async function AppShell({
  children,
  userId,
  isAdmin,
  isPaid,
  displayName,
  avatarUrl,
}: {
  children: React.ReactNode;
  userId: string;
  isAdmin: boolean;
  isPaid: boolean;
  displayName: string;
  avatarUrl?: string | null;
}) {
  const [spaces, unread] = await Promise.all([
    listSpaces(),
    countUnread(userId),
  ]);

  return (
    <AppShellClient
      displayName={displayName}
      isAdmin={isAdmin}
      isPaid={isPaid}
      checkoutUrl={checkoutUrlBuildersClub()}
      unread={unread}
      spaces={spaces.map((s) => ({ id: s.id, slug: s.slug, name: s.name }))}
      avatarUrl={avatarUrl}
      notifPreview={[]}
    >
      {children}
    </AppShellClient>
  );
}
