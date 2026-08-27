import type { Metadata } from "next";
import Link from "next/link";
import { NOME_PRODUTO } from "@/lib/produto";
import { ThemeToggle } from "@/components/theme-toggle";
import { getOptionalUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import {
  isEliteMembership,
  isPaidMembership,
  parseUpgradeReason,
  UPGRADE_REASON_COPY,
} from "@/lib/membership/capabilities";
import {
  ofertasBuildersClub,
  PROMESSA_PRIMEIRO_CLIENTE,
  urlOrionApp,
} from "@/lib/membership/checkout";
import { PlanCards } from "@/components/plan-cards";

/**
 * F063 — `/planos` é rota pública: saiu de `(app)` para que visitante anônima
 * (o tráfego dos presentes) consiga ver a oferta sem cair no login.
 *
 * Consequências assumidas na spec:
 * - `ensureMemberBootstrap` não roda aqui (aceite legal F058 segue nas demais
 *   rotas logadas);
 * - membership `pending`/`revoked` passa a ver a página em vez de ir para
 *   `/aguardando` — é justamente quem pode querer comprar;
 * - membro logado fica sem a sidebar enquanto lê os planos.
 */
export const metadata: Metadata = {
  title: `Planos — ${NOME_PRODUTO}`,
  description: PROMESSA_PRIMEIRO_CLIENTE,
  openGraph: {
    title: `Planos — ${NOME_PRODUTO}`,
    description: PROMESSA_PRIMEIRO_CLIENTE,
    type: "website",
  },
};

type Props = {
  searchParams: Promise<{ motivo?: string; destaque?: string }>;
};

export default async function PlanosPage({ searchParams }: Props) {
  const user = await getOptionalUser();
  const membership = user
    ? await prisma.membership.findUnique({ where: { userId: user.id } })
    : null;

  const anonima = !user;
  const isPaid = membership ? isPaidMembership(membership) : false;
  const isElite = membership ? isEliteMembership(membership) : false;

  const { motivo: motivoRaw, destaque } = await searchParams;
  /**
   * `?motivo=` e `?destaque=` falam com quem já está dentro ("assine para
   * liberar as aulas"). Link compartilhado não pode virar essa copy para
   * visitante — anônima cai sempre em `geral`.
   */
  const motivo = anonima ? null : parseUpgradeReason(motivoRaw);
  const highlightElite = anonima
    ? false
    : destaque === "elite" || (isPaid && !isElite);

  const copy = motivo
    ? UPGRADE_REASON_COPY[motivo]
    : highlightElite
      ? UPGRADE_REASON_COPY.orion
      : UPGRADE_REASON_COPY.geral;

  const offers = ofertasBuildersClub();
  const currentPlan = isElite ? "elite" : isPaid ? "pro" : "none";

  return (
    <div className="relative min-h-dvh px-4 py-10">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle variant="icon" />
      </div>

      <div className="feed-wrap-wide">
        <p className="font-[family-name:var(--font-outfit)] text-sm font-semibold uppercase tracking-[0.12em] text-accent">
          {NOME_PRODUTO}
        </p>
        <h1 className="page-title mt-2">
          {anonima ? "Planos" : "Ver planos"}
        </h1>
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

        {/*
         * O checkout da Hubla não exige conta: o webhook grava em `AllowedEmail`
         * e o tier é concedido no primeiro login com o mesmo e-mail. Sem este
         * aviso, a pessoa compra com um e-mail e entra com outro.
         */}
        {anonima ? (
          <p className="mx-auto mt-5 max-w-xl rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-center text-sm font-medium">
            Compre com o e-mail que você vai usar para entrar.
          </p>
        ) : null}

        {/*
         * `/` é rota protegida: para visitante anônima o "Voltar ao feed"
         * cairia no login — o beco que esta feature existe para evitar.
         */}
        {!anonima ? (
          <p className="mt-4 text-center text-sm">
            <Link href="/" className="font-medium text-accent hover:underline">
              Voltar ao feed
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}
