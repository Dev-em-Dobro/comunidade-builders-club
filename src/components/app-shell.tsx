import { urlOrionApp } from "@/lib/membership/checkout";
import { AppShellClient } from "@/components/app-shell-client";

const EMPTY_SPACES: { id: string; slug: string; name: string }[] = [];

/**
 * Shell **não** espera spaces/unread no SSR — isso atrasava o feed ~centenas de ms–segundos.
 * Spaces vêm de /api/nav; unread/preview do poll (já imediato no bell).
 */
export function AppShell({
  children,
  isAdmin,
  isPaid,
  isElite,
  displayName,
  avatarUrl,
}: {
  children: React.ReactNode;
  userId: string;
  isAdmin: boolean;
  isPaid: boolean;
  isElite: boolean;
  displayName: string;
  avatarUrl?: string | null;
}) {
  return (
    <AppShellClient
      displayName={displayName}
      isAdmin={isAdmin}
      isPaid={isPaid}
      isElite={isElite}
      orionUrl={urlOrionApp()}
      unread={0}
      spaces={EMPTY_SPACES}
      avatarUrl={avatarUrl}
      notifPreview={[]}
      hydrateNav
    >
      {children}
    </AppShellClient>
  );
}
