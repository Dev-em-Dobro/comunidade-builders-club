import type { ClubOffer } from "@/lib/membership/checkout";

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      className="h-3.5 w-3.5 text-accent"
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
      <p className="mt-2 font-[family-name:var(--font-outfit)] text-3xl font-bold">
        {offer.priceLabel}
      </p>
      <p className="mt-1 text-sm text-muted">{offer.installments}</p>
      {offer.extraPriceNote ? (
        <p className="mt-0.5 text-xs text-muted">{offer.extraPriceNote}</p>
      ) : null}
      <ul className="mt-5 flex flex-col gap-3">
        {offer.highlights.map((item) => (
          <li key={item.title} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15">
              <CheckIcon />
            </span>
            <span>
              <span className="block text-sm font-semibold leading-snug text-foreground">
                {item.title}
              </span>
              <span className="mt-0.5 block text-[13px] leading-snug text-muted">
                {item.detail}
              </span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-5 text-sm font-medium text-foreground">
        Promessa: {offer.promise}
      </p>
      {current ? (
        <div className="mt-auto pt-5">
          <p className="btn-outline w-full cursor-default opacity-70">
            Plano atual
          </p>
        </div>
      ) : (
        <div className="mt-auto flex flex-col gap-2 pt-5">
          <a
            href={offer.checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={featured ? "btn-primary w-full" : "btn-outline w-full"}
          >
            {cta}
          </a>
          {offer.paymentHint ? (
            <p className="text-center text-xs text-muted">{offer.paymentHint}</p>
          ) : null}
          {offer.boletoCheckouts && offer.boletoCheckouts.length > 0
            ? offer.boletoCheckouts.map((boleto) => (
                <a
                  key={boleto.url}
                  href={boleto.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline w-full"
                >
                  {boleto.label}
                </a>
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
}: {
  offers: { pro: ClubOffer; elite: ClubOffer };
  currentPlan: "none" | "pro" | "elite";
}) {
  return (
    <div className="grid items-stretch gap-4 sm:grid-cols-2 sm:gap-5">
      <OfferCard
        offer={offers.pro}
        cta="Quero o PRO"
        current={currentPlan === "pro" || currentPlan === "elite"}
      />
      <OfferCard
        offer={offers.elite}
        cta="Quero o Elite"
        featured={currentPlan !== "elite"}
        current={currentPlan === "elite"}
      />
    </div>
  );
}
