import { requireActiveMemberOrRedirect } from "@/lib/membership/require-member";
import {
  isEliteMembership,
  isPaidMembership,
} from "@/lib/membership/capabilities";
import { temAceiteGarantiaVigente } from "@/lib/membership/aceite-garantia";
import { temAceiteTermosEliteVigente } from "@/lib/membership/aceite-termos-elite";
import { datasAcompanhamentoElite } from "@/lib/legal/termos-elite";
import { AppShell } from "@/components/app-shell";
import { GarantiaCienteModal } from "@/components/garantia-ciente-modal";
import { TermosEliteModal } from "@/components/termos-elite-modal";

export default async function AppSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const member = await requireActiveMemberOrRedirect();
  const isPaid = isPaidMembership(member.membership);
  const isElite = isEliteMembership(member.membership);
  const precisaAceitarTermosElite =
    member.membership.tier === "elite" &&
    !(await temAceiteTermosEliteVigente(
      member.user.id,
      member.membership.eliteStartedAt,
    ));
  if (precisaAceitarTermosElite) {
    return (
      <main className="min-h-screen bg-background p-4">
        <p className="text-sm text-muted">Leia e aceite os termos do Elite para continuar.</p>
        <TermosEliteModal
          datas={datasAcompanhamentoElite(member.membership.eliteStartedAt)}
        />
      </main>
    );
  }

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
