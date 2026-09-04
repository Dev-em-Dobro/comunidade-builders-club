import { tierLabel } from "@/lib/membership/capabilities";
import type { UtmPostMetric } from "@/lib/gifts/metricas";

function formatWhen(d: Date | null): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(d);
}

export function AdminGiftMetrics({ rows }: { rows: UtmPostMetric[] }) {
  if (rows.length === 0) {
    return (
      <p className="mt-4 text-sm text-muted">
        Ainda não há acessos nem cadastros com origem de post. Quando a Jaque
        mandar o primeiro link, os números aparecem aqui.
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {rows.map((r) => (
        <details
          key={r.key}
          className="post-card !p-4"
        >
          <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-mono text-sm font-semibold">{r.label}</p>
              <p className="text-xs text-muted">
                {r.acessos} {r.acessos === 1 ? "acesso" : "acessos"} ·{" "}
                {r.cadastros} {r.cadastros === 1 ? "cadastro" : "cadastros"} ·{" "}
                {r.assinaramPlano}{" "}
                {r.assinaramPlano === 1 ? "assinou plano" : "assinaram plano"}
              </p>
            </div>
          </summary>

          <div className="mt-3 overflow-x-auto">
            {r.pessoas.length === 0 ? (
              <p className="text-sm text-muted">
                Só acessos — ninguém se cadastrou por este post ainda.
              </p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="py-1.5 pr-3 font-medium">Pessoa</th>
                    <th className="py-1.5 pr-3 font-medium">Cadastro</th>
                    <th className="py-1.5 pr-3 font-medium">Plano</th>
                    <th className="py-1.5 font-medium">
                      assinou_plano_veio_de_uma_postagem
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {r.pessoas.map((p) => (
                    <tr key={p.email} className="border-t border-border">
                      <td className="py-2 pr-3">
                        <span className="font-medium">{p.displayName}</span>
                        <span className="mt-0.5 block text-xs text-muted">
                          {p.email}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-xs text-muted">
                        {formatWhen(p.originAt)}
                      </td>
                      <td className="py-2 pr-3">{tierLabel(p.tier)}</td>
                      <td className="py-2">
                        {p.assinouPlano ? (
                          <span className="text-accent">sim</span>
                        ) : (
                          <span className="text-muted">não</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}
