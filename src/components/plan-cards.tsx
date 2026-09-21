"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { aceitarGarantiaAction } from "@/actions/legal/aceitar-garantia";
import { VERSAO_GARANTIA } from "@/lib/legal/garantia";
import type { ClubOffer } from "@/lib/membership/checkout";

function CheckIcon({ forte }: { forte?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      className={
        forte ? "h-4 w-4 text-accent-foreground" : "h-3.5 w-3.5 text-accent"
      }
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function OfferCard({
  offer,
  cta,
  current,
  featured,
  loggedIn,
  garantiaJaAceita,
}: {
  offer: ClubOffer;
  cta: string;
  current?: boolean;
  featured?: boolean;
  loggedIn: boolean;
  garantiaJaAceita: boolean;
}) {
  const isElite = offer.id === "elite";
  const [ciente, setCiente] = useState(garantiaJaAceita);
  const [pending, start] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  const precisaCiente = isElite && !current;
  const checkoutLiberado = !precisaCiente || ciente;

  function irParaCheckout(url: string) {
    if (!precisaCiente) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    if (!ciente) return;

    if (!loggedIn) {
      // Sem userId não grava legal_acceptance; o modal Elite cobre no 1º login.
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    start(async () => {
      setErro(null);
      if (!garantiaJaAceita) {
        const res = await aceitarGarantiaAction();
        if (!res.ok) {
          setErro(res.erro);
          return;
        }
      }
      window.open(url, "_blank", "noopener,noreferrer");
    });
  }

  return (
    <article
      className={`flex h-full flex-col rounded-2xl border p-5 transition duration-200 sm:p-6 motion-safe:hover:-translate-y-1 ${
        featured
          ? "border-accent bg-accent/5 shadow-md hover:shadow-xl hover:border-accent"
          : "border-border bg-card shadow-sm hover:border-accent/40 hover:shadow-lg"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          {offer.name}
        </p>
        {featured && !current ? (
          <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">
            Recomendado
          </span>
        ) : null}
        {current ? (
          <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
            Seu plano
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted">
        Parcele em até
      </p>
      <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5 font-[family-name:var(--font-outfit)] leading-none">
        <span className="text-lg font-semibold text-foreground">
          {offer.pricing.installments}x de
        </span>
        <span className="text-4xl font-bold tracking-tight text-foreground">
          {offer.pricing.installmentPrice}
        </span>
      </p>
      <p className="mt-2 text-sm text-muted">
        ou{" "}
        <span className="font-semibold text-foreground">
          {offer.pricing.fullPrice}
        </span>{" "}
        à vista
      </p>
      {offer.pricing.boletoPrice ? (
        <p className="mt-0.5 text-xs text-muted">
          ou boleto de {offer.pricing.boletoPrice}
        </p>
      ) : null}
      {/* F093 — item é uma linha só; ver `OfferHighlight` em checkout.ts. */}
      <ul className="mt-5 flex flex-col gap-3">
        {offer.highlights.map((item) => (
          <li key={item.texto} className="flex items-start gap-3">
            <span
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                item.destaque ? "bg-accent" : "bg-accent/15"
              }`}
            >
              <CheckIcon forte={item.destaque} />
            </span>
            <span
              className={`text-[15px] leading-snug ${
                item.destaque
                  ? "font-semibold text-accent"
                  : "text-foreground/90"
              }`}
            >
              {item.texto}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-5 border-t border-border/60 pt-4 text-sm font-semibold text-foreground">
        {offer.promise}
      </p>
      {isElite && !current ? (
        <p className="mt-2 text-xs leading-relaxed text-muted">
          Detalhes da régua:{" "}
          <Link href="/garantia" className="text-accent hover:underline">
            Lista da garantia
          </Link>{" "}
          (v{VERSAO_GARANTIA}).
        </p>
      ) : null}

      {current ? (
        <div className="mt-auto pt-5">
          <p className="btn-outline w-full cursor-default opacity-70">
            Plano atual
          </p>
        </div>
      ) : (
        <div className="mt-auto flex flex-col gap-2 pt-5">
          {/* F093 — ocupa a folga que sobra no card mais curto dos dois. */}
          {offer.notaFinal ? (
            <p className="mb-2 rounded-xl bg-surface px-4 py-3 text-center text-[13px] leading-snug text-muted">
              {offer.notaFinal}
            </p>
          ) : null}
          {precisaCiente ? (
            <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-snug text-muted">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={ciente}
                onChange={(e) => setCiente(e.target.checked)}
              />
              <span>
                Li a{" "}
                <Link href="/garantia" className="text-accent hover:underline">
                  Lista da garantia
                </Link>{" "}
                (v{VERSAO_GARANTIA}) e estou ciente.
              </span>
            </label>
          ) : null}
          {erro ? (
            <p className="text-xs text-red-500" role="alert">
              {erro}
            </p>
          ) : null}
          <button
            type="button"
            disabled={!checkoutLiberado || pending}
            onClick={() => irParaCheckout(offer.checkoutUrl)}
            className={
              featured
                ? "btn-primary w-full disabled:opacity-50"
                : "btn-outline w-full disabled:opacity-50"
            }
          >
            {pending ? "Registrando…" : cta}
          </button>
          {offer.paymentHint ? (
            <p className="text-center text-xs text-muted">{offer.paymentHint}</p>
          ) : null}
          {offer.boletoCheckouts && offer.boletoCheckouts.length > 0
            ? offer.boletoCheckouts.map((boleto) => (
                <button
                  key={boleto.url}
                  type="button"
                  disabled={!checkoutLiberado || pending}
                  onClick={() => irParaCheckout(boleto.url)}
                  className="btn-outline w-full disabled:opacity-50"
                >
                  {boleto.label}
                </button>
              ))
            : null}
        </div>
      )}
    </article>
  );
}

export function PlanCards({
  offers,
  currentPlan,
  loggedIn,
  garantiaJaAceita,
}: {
  offers: { pro: ClubOffer; elite: ClubOffer };
  currentPlan: "none" | "pro" | "elite";
  loggedIn: boolean;
  garantiaJaAceita: boolean;
}) {
  return (
    <div className="grid items-stretch gap-4 sm:grid-cols-2 sm:gap-5">
      <OfferCard
        offer={offers.pro}
        cta="Quero o PRO"
        current={currentPlan === "pro" || currentPlan === "elite"}
        loggedIn={loggedIn}
        garantiaJaAceita={garantiaJaAceita}
      />
      <OfferCard
        offer={offers.elite}
        cta="Quero o Elite"
        featured={currentPlan !== "elite"}
        current={currentPlan === "elite"}
        loggedIn={loggedIn}
        garantiaJaAceita={garantiaJaAceita}
      />
    </div>
  );
}
