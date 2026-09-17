import { IMERSAO_IA, imersaoAtiva, imersaoHref } from "@/lib/eventos/imersao-ia";

/**
 * F088 — faixa da Imersão no app shell, só para Free.
 *
 * O gate de tier fica no shell (`!isPaid`). Aqui só o prazo: passou de
 * `terminaEm`, some sozinho (mesma regra da F077).
 */
export function ClubImersaoBanner() {
  if (!imersaoAtiva()) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-accent/25 bg-accent/10 px-4 py-2.5 text-sm md:px-8">
      <div className="min-w-0">
        <p className="font-medium text-foreground">
          <span className="text-accent">{IMERSAO_IA.eyebrow}</span>
          <span className="text-muted"> · </span>
          {IMERSAO_IA.quando}
          <span className="text-muted"> · </span>
          {IMERSAO_IA.horario}
          <span className="text-muted"> · </span>
          <span className="text-muted">{IMERSAO_IA.preco}</span>
        </p>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted sm:text-sm">
          {IMERSAO_IA.titulo}
        </p>
      </div>
      <a
        href={imersaoHref(null, { medium: "club-banner" })}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 rounded-lg border border-accent/40 bg-background px-3 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent/10"
      >
        {IMERSAO_IA.cta}
      </a>
    </div>
  );
}
