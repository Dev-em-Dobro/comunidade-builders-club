import { requireActiveMemberOrRedirect } from "@/lib/membership/require-member";
import {
  isEliteMembership,
  isPaidMembership,
  isVitalicioMembership,
} from "@/lib/membership/capabilities";
import { temAceiteGarantiaVigente } from "@/lib/membership/aceite-garantia";
import { temAceiteTermosEliteVigente } from "@/lib/membership/aceite-termos-elite";
import { precisaAceiteContratoConteudos } from "@/lib/membership/aceite-contrato-conteudos";
import { datasAcompanhamentoElite } from "@/lib/legal/termos-elite";
import { AppShell } from "@/components/app-shell";
import { GarantiaCienteModal } from "@/components/garantia-ciente-modal";
import { TermosEliteModal } from "@/components/termos-elite-modal";
import { ContratoConteudosModal } from "@/components/contrato-conteudos-modal";

export default async function AppSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const member = await requireActiveMemberOrRedirect();
  const isPaid = isPaidMembership(member.membership);
  const isElite = isEliteMembership(member.membership);
  const isVitalicio = isVitalicioMembership(member.membership);
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

  // F122 — compras a partir de 28/10/2026 (DevQuest + Builders).
  if (
    await precisaAceiteContratoConteudos({
      userId: member.user.id,
      email: member.user.email,
      membership: member.membership,
    })
  ) {
    return (
      <main className="min-h-screen bg-background p-4">
        <p className="text-sm text-muted">
          Leia e aceite o contrato de conteúdos digitais para continuar.
        </p>
        <ContratoConteudosModal />
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
      isVitalicio={isVitalicio}
      displayName={member.profile.displayName}
      email={member.user.email}
      avatarUrl={member.profile.avatarUrl}
    >
      {precisaCienteGarantia ? <GarantiaCienteModal /> : null}
      {children}
    </AppShell>
  );
}
