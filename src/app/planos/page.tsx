import type { Metadata } from "next";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  ofertaElite,
  ofertaPro,
  ofertaProMensal,
  PROMESSA_PRIMEIRO_CLIENTE,
} from "@/lib/membership/checkout";
import { NOME_PRODUTO } from "@/lib/produto";

/**
 * F063 — `/planos` é rota pública.
 * UI atual = layout v2 (PRO mensal/anual + Elite). Anterior em `/planos-v2`.
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

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function PlanosPage() {
  const pro = ofertaPro();
  const proMensal = ofertaProMensal();
  const elite = ofertaElite();

  return (
    <main className="relative min-h-dvh px-4 py-10 md:py-16">
      <div className="absolute right-4 top-4">
        <ThemeToggle variant="icon" />
      </div>

      <div className="mx-auto max-w-6xl">
        <header className="mx-auto max-w-2xl text-center">
          <p className="font-[family-name:var(--font-outfit)] text-sm font-semibold uppercase tracking-[0.12em] text-accent">
            {NOME_PRODUTO}
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-outfit)] text-3xl font-bold tracking-tight md:text-5xl">
            Escolha como quer entrar
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
            Escolha o PRO para seguir com o arsenal completo ou o Elite para
            ter acompanhamento mais próximo.
          </p>
        </header>

        <section
          className="mt-10 grid items-stretch gap-5 sm:grid-cols-2"
          aria-label="Planos do Builders Club"
        >
          <article className="relative flex flex-col rounded-2xl border-2 border-accent bg-accent/5 p-6 shadow-md">
            <span className="absolute right-5 top-5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
              Melhor valor
            </span>
            <p className="text-sm font-semibold uppercase tracking-wide text-accent">
              PRO
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-outfit)] text-2xl font-bold">
              Todo o arsenal para começar
            </h2>
            <ul className="mt-6 flex flex-col gap-3">
              {pro.highlights.map((item) => (
                <li key={item.texto} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                    <CheckIcon />
                  </span>
                  <span className="text-[15px] leading-snug text-foreground/90">
                    {item.texto}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-6">
              <div className="rounded-xl border border-accent/40 bg-card p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                  Opção mensal
                </p>
                <p className="mt-1 flex items-baseline gap-1">
                  <span className="font-[family-name:var(--font-outfit)] text-2xl font-bold">
                    {proMensal.pricing.monthlyPrice ??
                      proMensal.pricing.installmentPrice}
                  </span>
                  <span className="text-sm text-muted">/mês</span>
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  Pagamento recorrente mensal sem comprometer o limite do cartão
                </p>
                <a
                  href={proMensal.checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary mt-3 w-full active:scale-[0.98]"
                >
                  Assinar mensal
                </a>
              </div>

              <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted">
                Plano anual · melhor valor
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Parcele em até
              </p>
              <p className="mt-1 flex flex-wrap items-baseline gap-1.5 font-[family-name:var(--font-outfit)]">
                <span className="text-lg font-semibold">
                  {pro.pricing.installments}x de
                </span>
                <span className="text-4xl font-bold tracking-tight">
                  {pro.pricing.installmentPrice}
                </span>
              </p>
              <p className="mt-2 text-sm text-muted">
                ou{" "}
                <span className="font-semibold text-foreground">
                  {pro.pricing.fullPrice}
                </span>{" "}
                à vista
              </p>
              <a
                href={pro.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline mt-4 w-full active:scale-[0.98]"
              >
                Entrar no PRO anual
              </a>
            </div>
          </article>

          <article className="relative flex flex-col rounded-2xl border-2 border-accent bg-card p-6 shadow-md">
            <span className="absolute right-5 top-5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
              Mais completo
            </span>
            <p className="text-sm font-semibold uppercase tracking-wide text-accent">
              Elite
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-outfit)] text-2xl font-bold">
              Acompanhamento próximo
            </h2>
            <ul className="mt-6 flex flex-col gap-3">
              {elite.highlights.map((item) => (
                <li key={item.texto} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <CheckIcon />
                  </span>
                  <span className="text-[15px] leading-snug text-foreground/90">
                    {item.texto}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Parcele em até
              </p>
              <p className="mt-1 flex flex-wrap items-baseline gap-1.5 font-[family-name:var(--font-outfit)]">
                <span className="text-lg font-semibold">
                  {elite.pricing.installments}x de
                </span>
                <span className="text-4xl font-bold tracking-tight">
                  {elite.pricing.installmentPrice}
                </span>
              </p>
              <p className="mt-2 text-sm text-muted">
                ou{" "}
                <span className="font-semibold text-foreground">
                  {elite.pricing.fullPrice}
                </span>{" "}
                à vista
              </p>
              <a
                href={elite.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-4 w-full active:scale-[0.98]"
              >
                Escolher o Elite
              </a>
              <p className="mt-4 text-sm text-muted">
                Veja as condições da garantia de 90 dias na{" "}
                <Link
                  href="/garantia"
                  className="font-medium text-accent hover:underline"
                >
                  Lista da garantia
                </Link>
                .
              </p>
            </div>
          </article>
        </section>

        <p className="mx-auto mt-5 max-w-xl rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-center text-sm font-medium">
          Compre com o e-mail que você vai usar para entrar.
        </p>
        <p className="mt-4 text-center text-xs leading-relaxed text-muted">
          O PRO tem 7 dias de arrependimento. A garantia de 90 dias é exclusiva
          do Elite e condicionada à lista de execução.
        </p>
      </div>
    </main>
  );
}
