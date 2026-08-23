"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { UpgradeReason } from "@/lib/membership/capabilities";
import type { ClubOffer } from "@/lib/membership/checkout";

const REASON_COPY: Record<UpgradeReason, { title: string; body: string }> = {
  space: {
    title: "Space exclusivo para membros",
    body: "Entre no PRO ou no Elite para abrir este space e participar das conversas da comunidade.",
  },
  materiais: {
    title: "Skills e templates para membros",
    body: "Arsenal, prompts, contratos e kits ficam liberados no PRO. O Elite ainda soma mais material.",
  },
  aulas: {
    title: "Aulas para membros",
    body: "Assista às aulas gravadas e marque progresso com o PRO ou o Elite.",
  },
  busca: {
    title: "Busca para membros",
    body: "Pesquisar posts e membros faz parte do acesso PRO e Elite.",
  },
  publicar: {
    title: "Publicar é para membros",
    body: "Para criar publicações e participar de verdade, escolha o PRO ou o Elite.",
  },
  comentar: {
    title: "Comentar é para membros",
    body: "Comentários e respostas ficam liberados no PRO e no Elite.",
  },
  reagir: {
    title: "Reagir é para membros",
    body: "Reações fazem parte do acesso PRO e Elite.",
  },
  orion: {
    title: "Orion é do plano Elite",
    body: "O acesso ao Orion entra no Elite, junto com a reunião semanal em grupo.",
  },
  geral: {
    title: "Desbloqueie o Builders Club",
    body: "Você está no plano gratuito. Compare o PRO e o Elite e escolha como vai fechar o 1º cliente em 90 dias.",
  },
};

type UpgradeCtx = {
  isPaid: boolean;
  isElite: boolean;
  offers: { pro: ClubOffer; elite: ClubOffer };
  openUpgrade: (reason?: UpgradeReason) => void;
  requirePaid: (reason?: UpgradeReason) => boolean;
  requireElite: (reason?: UpgradeReason) => boolean;
};

const Ctx = createContext<UpgradeCtx | null>(null);

export function useUpgrade() {
  const v = useContext(Ctx);
  if (!v) {
    throw new Error("useUpgrade deve estar dentro de UpgradeProvider");
  }
  return v;
}

/** Safe para componentes que podem rodar fora do provider (retorna null). */
export function useUpgradeOptional() {
  return useContext(Ctx);
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      className="mt-0.5 h-4 w-4 shrink-0 text-accent"
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
}: {
  offer: ClubOffer;
  cta: string;
  current?: boolean;
  featured?: boolean;
}) {
  return (
    <article
      className={`flex flex-col rounded-2xl border p-5 ${
        featured
          ? "border-accent bg-accent/5 shadow-md"
          : "border-border bg-card"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          {offer.name}
        </p>
        {featured ? (
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
      <p className="mt-2 font-[family-name:var(--font-outfit)] text-3xl font-bold">
        {offer.priceLabel}
      </p>
      <p className="mt-1 text-sm text-muted">{offer.installments}</p>
      {offer.extraPriceNote ? (
        <p className="mt-0.5 text-xs text-muted">{offer.extraPriceNote}</p>
      ) : null}
      <ul className="mt-4 flex flex-1 flex-col gap-2">
        {offer.highlights.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm leading-snug">
            <CheckIcon />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm font-medium text-foreground">{offer.promise}</p>
      {current ? (
        <p className="btn-outline mt-5 w-full cursor-default opacity-70">
          Plano atual
        </p>
      ) : (
        <div className="mt-5 flex flex-col gap-2">
          <a
            href={offer.checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={featured ? "btn-primary w-full" : "btn-outline w-full"}
          >
            {cta}
          </a>
          {offer.boletoCheckouts && offer.boletoCheckouts.length > 0 ? (
            <>
              <p className="pt-1 text-center text-xs text-muted">
                Ou boleto em R$ 1.297
              </p>
              {offer.boletoCheckouts.map((boleto) => (
                <a
                  key={boleto.url}
                  href={boleto.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline w-full"
                >
                  {boleto.label}
                </a>
              ))}
            </>
          ) : null}
        </div>
      )}
    </article>
  );
}

export function UpgradeProvider({
  isPaid,
  isElite = false,
  offers,
  children,
  autoOpen = false,
}: {
  isPaid: boolean;
  isElite?: boolean;
  offers: { pro: ClubOffer; elite: ClubOffer };
  children: React.ReactNode;
  autoOpen?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<UpgradeReason>("geral");

  const openUpgrade = useCallback((r: UpgradeReason = "geral") => {
    setReason(r);
    setOpen(true);
  }, []);

  const requirePaid = useCallback(
    (r: UpgradeReason = "geral") => {
      if (isPaid) return true;
      openUpgrade(r);
      return false;
    },
    [isPaid, openUpgrade],
  );

  const requireElite = useCallback(
    (r: UpgradeReason = "orion") => {
      if (isElite) return true;
      openUpgrade(r);
      return false;
    },
    [isElite, openUpgrade],
  );

  useEffect(() => {
    if (autoOpen && !isPaid) {
      setReason("geral");
      setOpen(true);
    }
  }, [autoOpen, isPaid]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const value = useMemo(
    () => ({
      isPaid,
      isElite,
      offers,
      openUpgrade,
      requirePaid,
      requireElite,
    }),
    [isPaid, isElite, offers, openUpgrade, requirePaid, requireElite],
  );

  const copy = REASON_COPY[reason];
  const eliteOnly = isPaid && !isElite;

  return (
    <Ctx.Provider value={value}>
      {children}
      {open ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/45 backdrop-blur-[2px]"
            aria-label="Fechar"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="upgrade-title"
            className="relative z-10 max-h-[min(92dvh,880px)] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-2xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                  Builders Club
                </p>
                <h2
                  id="upgrade-title"
                  className="mt-2 font-[family-name:var(--font-outfit)] text-xl font-bold sm:text-2xl"
                >
                  {eliteOnly ? "Evolua para o Elite" : copy.title}
                </h2>
                <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">
                  {eliteOnly
                    ? "Você já tem o PRO. O Elite libera Orion, reunião semanal em grupo e material extra."
                    : copy.body}
                </p>
              </div>
              <button
                type="button"
                className="btn-ghost shrink-0 px-2 text-sm"
                onClick={() => setOpen(false)}
              >
                Fechar
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <OfferCard
                offer={offers.pro}
                cta="Quero o PRO"
                current={eliteOnly}
              />
              <OfferCard
                offer={offers.elite}
                cta="Quero o Elite"
                featured
              />
            </div>

            <p className="mt-5 text-center text-xs text-muted">
              Cartão e Pix na Hubla · Boleto Elite na TMB (R$ 1.297)
            </p>
          </div>
        </div>
      ) : null}
    </Ctx.Provider>
  );
}
