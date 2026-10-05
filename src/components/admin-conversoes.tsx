import type { MetricasConversao } from "@/lib/admin/conversoes";

export function AdminConversoes({ data }: { data: MetricasConversao }) {
  return (
    <div className="mt-4 space-y-4">
      <div className="post-card !p-4">
        <p className="text-sm font-semibold">Conversões Free → Pago (últimos 7 dias)</p>
        <p className="mt-1 text-xs text-muted">
          Membros que passaram de Free (ou conta nova) para plano pago (PRO/Elite) via
          Hubla. Só daqui pra frente: dados legados não incluídos.
        </p>
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">
              Total 7 dias
            </p>
            <p className="text-2xl font-bold">{data.total7dias}</p>
          </div>
        </div>
      </div>

      {data.conversoesPorDia.length === 0 ? (
        <p className="text-sm text-muted">
          Ainda não há conversões registradas.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="py-1.5 pr-3 font-medium">Data</th>
                <th className="py-1.5 font-medium text-right">Conversões</th>
              </tr>
            </thead>
            <tbody>
              {data.conversoesPorDia.map((r) => (
                <tr key={r.data} className="border-t border-border">
                  <td className="py-2 pr-3 font-mono text-xs">{r.data}</td>
                  <td className="py-2 text-right font-semibold">
                    {r.total > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-green-800">
                        {r.total}
                      </span>
                    ) : (
                      <span className="text-muted">{r.total}</span>
                    )}
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
