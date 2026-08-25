import Link from "next/link";
import { requireActiveMemberOrRedirect } from "@/lib/membership/require-member";
import {
  isEliteMembership,
  isPaidMembership,
  parseUpgradeReason,
  UPGRADE_REASON_COPY,
} from "@/lib/membership/capabilities";
import { ofertasBuildersClub, urlOrionApp } from "@/lib/membership/checkout";
import { PlanCards } from "@/components/plan-cards";

type Props = {
  searchParams: Promise<{ motivo?: string; destaque?: string }>;
};

export default async function PlanosPage({ searchParams }: Props) {
  const member = await requireActiveMemberOrRedirect();
  const { motivo: motivoRaw, destaque } = await searchParams;
  const motivo = parseUpgradeReason(motivoRaw);
  const isPaid = isPaidMembership(member.membership);
  const isElite = isEliteMembership(member.membership);
  const highlightElite = destaque === "elite" || (isPaid && !isElite);
  const copy = motivo
    ? UPGRADE_REASON_COPY[motivo]
    : highlightElite
      ? UPGRADE_REASON_COPY.orion
      : UPGRADE_REASON_COPY.geral;
  const offers = ofertasBuildersClub();
  const currentPlan = isElite ? "elite" : isPaid ? "pro" : "none";

  return (
    <div className="feed-wrap-wide">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">
        Builders Club
      </p>
      <h1 className="page-title mt-2">Ver planos</h1>
      <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">
        {isElite
          ? "Você já está no Elite. Orion, reunião semanal e o restante do Club já entram no seu plano."
          : highlightElite && isPaid
            ? "Você já tem o PRO, com Orion no plano Free. O Elite libera reunião semanal, material extra e Orion com limites de Pro."
            : copy.body}
      </p>

      {isPaid ? (
        <p className="mt-6">
          <a
            href={urlOrionApp()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Abrir Orion
          </a>
        </p>
      ) : null}

      <div className="mt-8">
        <PlanCards offers={offers} currentPlan={currentPlan} />
      </div>

      <p className="mt-4 text-center text-sm">
        <Link href="/" className="font-medium text-accent hover:underline">
          Voltar ao feed
        </Link>
      </p>
    </div>
  );
}
