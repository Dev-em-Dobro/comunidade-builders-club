import { blackBannerFor } from "@/lib/eventos/black-infinita";

/** F117 — mesma campanha, destino e mensagem conforme o plano do membro. */
export function BlackInfinitaBanner({ isPaid }: { isPaid: boolean }) {
  const campanha = blackBannerFor(isPaid);

  return (
    <a
      href={campanha.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group @container relative block overflow-hidden border-b border-[#20ddc9]/30 bg-[#041615] px-4 py-3 text-white focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#37f5df] @lg:px-8 @lg:py-4"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_85%_15%,#075a53_0%,#092b29_38%,#041615_75%)]" />
      <div aria-hidden className="pointer-events-none absolute -right-8 -top-12 size-40 rounded-full border border-[#27dfcc]/20 @lg:size-56" />
      <div aria-hidden className="pointer-events-none absolute -right-3 -top-16 size-40 rounded-full border border-[#27dfcc]/10 @lg:size-56" />

      <div className="relative flex flex-col gap-2 @lg:flex-row @lg:items-center @lg:justify-between @lg:gap-5">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[9px] font-extrabold tracking-[0.12em] text-[#44ead9] uppercase @lg:text-[10px]">
            <svg aria-hidden viewBox="0 0 36 20" className="h-3.5 w-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
              <path d="M18 10C14 5 11 2 7 2a8 8 0 0 0 0 16c4 0 7-3 11-8 4 5 7 8 11 8a8 8 0 0 0 0-16c-4 0-7 3-11 8Z" />
            </svg>
            {campanha.etiqueta}
          </p>
          <h2 className="mt-1 text-[18px] font-black leading-[1.1] tracking-tight @lg:text-[22px]">
            <span className="text-[#44ead9]">Black em Dobro</span> Infinita
          </h2>
          <p className="mt-1 text-[11px] leading-snug text-white/85 @lg:text-[12px]">
            {campanha.titulo}. {campanha.descricao}
          </p>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2 @lg:gap-3">
          <span className="whitespace-nowrap rounded border border-[#44ead9]/40 px-2 py-1 text-[10px] font-extrabold tracking-wide text-[#68f7e7] @lg:text-[11px]">
            {campanha.data}
          </span>
          <span className="inline-flex min-h-9 items-center justify-center gap-1 rounded-md bg-[#2bdfca] px-3 py-2 text-[11px] font-extrabold text-[#05201d] shadow-[0_0_20px_rgba(43,223,202,0.15)] transition-colors group-hover:bg-[#65f5e5] @lg:text-[12px]">
            {campanha.cta}
            <span aria-hidden>↗</span>
          </span>
        </div>
      </div>
    </a>
  );
}
