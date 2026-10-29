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
  isVitalicio = false,
  displayName,
  email,
  avatarUrl,
  simulatingEmail = null,
}: {
  children: React.ReactNode;
  userId: string;
  isAdmin: boolean;
  isPaid: boolean;
  isElite: boolean;
  isVitalicio?: boolean;
  displayName: string;
  /** F062 — exibido no topo do popup da pill do usuário. */
  email: string;
  avatarUrl?: string | null;
  /** F123 — e-mail do membro sendo simulado (null = sessão normal). */
  simulatingEmail?: string | null;
}) {
  return (
    <AppShellClient
      displayName={displayName}
      email={email}
      isAdmin={isAdmin}
      isPaid={isPaid}
      isElite={isElite}
      isVitalicio={isVitalicio}
      orionUrl={urlOrionApp()}
      unread={0}
      spaces={EMPTY_SPACES}
      avatarUrl={avatarUrl}
      notifPreview={[]}
      hydrateNav
      simulatingEmail={simulatingEmail}
    >
      {children}
    </AppShellClient>
  );
}
