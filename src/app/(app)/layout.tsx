import Script from "next/script";
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
import { getImpersonationState } from "@/lib/auth/impersonation";
import {
  BLACK_ALUNOS_POPUP_SRC,
  shouldShowBlackAlunosPopup,
} from "@/lib/eventos/black-alunos-popup";

export default async function AppSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const member = await requireActiveMemberOrRedirect();
  const isPaid = isPaidMembership(member.membership);
  const isElite = isEliteMembership(member.membership);
  const isVitalicio = isVitalicioMembership(member.membership);
  const simulacao = await getImpersonationState();
  const precisaAceitarTermosElite =
    member.membership.tier === "elite" &&
    !(await temAceiteTermosEliteVigente(
      member.user.id,
      member.membership.eliteStartedAt,
    ));
  if (precisaAceitarTermosElite) {
    // Só o dialog: texto no <main> vazava pelo backdrop semitransparente.
    return (
      <main className="min-h-screen bg-background">
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
      <main className="min-h-screen bg-background">
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
      simulatingEmail={simulacao.active ? simulacao.email : null}
    >
      {precisaCienteGarantia ? <GarantiaCienteModal /> : null}
      {shouldShowBlackAlunosPopup({
        isPaid,
        isVitalicio,
        precisaCienteGarantia,
      }) ? (
        <Script src={BLACK_ALUNOS_POPUP_SRC} strategy="afterInteractive" />
      ) : null}
      {children}
    </AppShell>
  );
}
