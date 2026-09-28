import type { BastidoresFunilSummary } from "@/lib/gifts/metricas";

function TaxaBadge({ taxa, meta }: { taxa: number | null; meta: number }) {
  if (taxa === null) return <span className="text-muted">—</span>;
  const ok = taxa >= meta;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
        ok ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
      }`}
    >
      {taxa.toFixed(1)}%
      {ok ? (
        <svg
          className="size-3"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : null}
    </span>
  );
}

export function AdminFunilLives({ data }: { data: BastidoresFunilSummary }) {
  return (
    <div className="mt-4 space-y-4">
      <div className="post-card !p-4">
        <p className="text-sm font-semibold">Resumo geral</p>
        <p className="mt-1 text-xs text-muted">
          Free cadastrados via presente que clicaram no CTA Bastidores. Meta de
          referência: ~{data.metaReferenciaPct}%.
        </p>
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">
              Free com origem
            </p>
            <p className="text-lg font-bold">{data.totalFreeComOrigem}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">
              Clicaram Bastidores
            </p>
            <p className="text-lg font-bold">{data.totalCliquesComOrigem}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Taxa</p>
            <p className="text-lg font-bold">
              <TaxaBadge taxa={data.taxaGeralPct} meta={data.metaReferenciaPct} />
            </p>
          </div>
        </div>
      </div>

      {data.porOrigem.length === 0 ? (
        <p className="text-sm text-muted">
          Ainda não há cliques no Bastidores vindos de Presentes.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="py-1.5 pr-3 font-medium">Origem (post)</th>
                <th className="py-1.5 pr-3 font-medium text-right">
                  Free cadastros
                </th>
                <th className="py-1.5 pr-3 font-medium text-right">
                  Cliques Bastidores
                </th>
                <th className="py-1.5 font-medium text-right">Taxa</th>
              </tr>
            </thead>
            <tbody>
              {data.porOrigem.map((r) => (
                <tr key={r.key} className="border-t border-border">
                  <td className="py-2 pr-3 font-mono text-xs">{r.label}</td>
                  <td className="py-2 pr-3 text-right">
                    {r.cadastrosFreeComOrigem}
                  </td>
                  <td className="py-2 pr-3 text-right">{r.cliquesBastidores}</td>
                  <td className="py-2 text-right">
                    <TaxaBadge taxa={r.taxaPct} meta={data.metaReferenciaPct} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
