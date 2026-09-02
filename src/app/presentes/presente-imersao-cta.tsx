import { IMERSAO_IA, imersaoAtiva, imersaoHref } from "@/lib/eventos/imersao-ia";

/**
 * F077 — faixa da Imersão "2 a 5k com IA" no topo do Presente.
 *
 * É a única coisa que fica **acima** do artigo. A F063 diz que a oferta nunca
 * vem antes do conteúdo; a exceção aqui é de prazo, não de gosto: evento com
 * data não adianta convidar depois. Passou de `terminaEm`, isto devolve `null`
 * e a página volta a abrir no título.
 *
 * A oferta do Club (PRO/Elite, cadastro, preço de plano) continua embaixo, no
 * `PresentePromessa`. Nada disso sobe.
 *
 * Sem JavaScript: contador é da landing.
 */
export function PresenteImersaoCta({
  utmContent,
}: {
  utmContent?: string | null;
}) {
  if (!imersaoAtiva()) return null;

  return (
    <aside className="mt-6 overflow-hidden rounded-2xl border border-accent/40 bg-gradient-to-br from-accent/[0.12] to-accent/[0.04] px-5 py-5 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-[family-name:var(--font-outfit)] text-xs font-semibold uppercase tracking-[0.12em] text-accent">
            <span
              aria-hidden
              className="inline-block size-1.5 rounded-full bg-accent"
            />
            {IMERSAO_IA.eyebrow}
          </p>
          <p className="mt-2 font-[family-name:var(--font-outfit)] text-lg font-bold leading-snug tracking-tight sm:text-xl">
            {IMERSAO_IA.titulo}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {IMERSAO_IA.descricao}
          </p>
          <p className="mt-3 text-sm font-medium">
            {IMERSAO_IA.quando}
            <span className="text-muted"> · </span>
            {IMERSAO_IA.horario}
            <span className="text-muted"> · </span>
            <span className="text-muted">{IMERSAO_IA.preco}</span>
          </p>
        </div>
        <a
          href={imersaoHref(utmContent)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary shrink-0 sm:w-auto"
        >
          {IMERSAO_IA.cta}
        </a>
      </div>
    </aside>
  );
}
