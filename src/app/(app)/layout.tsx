import { requireActiveMemberOrRedirect } from "@/lib/membership/require-member";
import {
  isEliteMembership,
  isPaidMembership,
} from "@/lib/membership/capabilities";
import { temAceiteGarantiaVigente } from "@/lib/membership/aceite-garantia";
import { AppShell } from "@/components/app-shell";
import { GarantiaCienteModal } from "@/components/garantia-ciente-modal";

export default async function AppSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const member = await requireActiveMemberOrRedirect();
  const isPaid = isPaidMembership(member.membership);
  const isElite = isEliteMembership(member.membership);
  const precisaCienteGarantia =
    isElite && !(await temAceiteGarantiaVigente(member.user.id));

  return (
    <AppShell
      userId={member.user.id}
      isAdmin={member.membership.role === "admin"}
      isPaid={isPaid}
      isElite={isElite}
      displayName={member.profile.displayName}
      email={member.user.email}
      avatarUrl={member.profile.avatarUrl}
    >
      {precisaCienteGarantia ? <GarantiaCienteModal /> : null}
      {children}
    </AppShell>
  );
}
