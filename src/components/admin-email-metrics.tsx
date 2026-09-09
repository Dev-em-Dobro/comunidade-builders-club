import {
  EMAIL_CATEGORIA_LABEL,
  EMAIL_CATEGORIAS,
} from "@/lib/email/categorias";
import type { MetricasEmailAgregado } from "@/lib/email/metricas-resend";
import { AdminEmailFilters } from "@/components/admin-email-filters";

function pct(n: number | null): string {
  if (n === null) return "—";
  return `${Math.round(n * 100)}%`;
}

function BarChart({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ label: string; value: number; tone?: string }>;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {rows.every((r) => r.value === 0) ? (
        <p className="mt-3 text-sm text-muted">Sem dados neste filtro.</p>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {rows.map((r) => (
            <li key={r.label}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-muted">{r.label}</span>
                <span className="font-medium tabular-nums text-foreground">
                  {r.value}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-border/60">
                <div
                  className={`h-full rounded-full ${r.tone ?? "bg-accent"}`}
                  style={{ width: `${(r.value / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AdminEmailMetrics({
  data,
  dias,
  status,
  categoria,
}: {
  data: MetricasEmailAgregado;
  dias: number;
  status: string;
  categoria: string;
}) {
  const statusRows = Object.entries(data.byStatus)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({
      label,
      value,
      tone:
        label === "clicked"
          ? "bg-violet-500"
          : label === "opened"
            ? "bg-sky-500"
            : label === "delivered"
              ? "bg-emerald-500"
              : "bg-accent",
    }));

  const catRows = EMAIL_CATEGORIAS.map((c) => ({
    label: EMAIL_CATEGORIA_LABEL[c],
    value: data.byCategoria[c],
    tone: c === "live" ? "bg-orange-500" : c === "login" ? "bg-sky-500" : "bg-accent",
  }));

  return (
    <div className="mt-4 space-y-6">
      <p className="text-sm text-muted">
        Métricas via Resend (última janela). Open/click exigem tracking no
        domínio. E-mails novos levam tag <code className="text-xs">category</code>;
        os antigos caem no assunto.
      </p>

      {data.aviso ? (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-100">
          {data.aviso}
        </p>
      ) : null}

      <AdminEmailFilters dias={dias} status={status} categoria={categoria} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total", value: String(data.total) },
          { label: "Opened", value: String(data.opened) },
          { label: "Clicked", value: String(data.clicked) },
          {
            label: "Taxas (open+click / click)",
            value: `${pct(data.taxaOpen)} · ${pct(data.taxaClick)}`,
          },
        ].map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-border bg-card px-4 py-3"
          >
            <p className="text-xs uppercase tracking-wide text-muted">{c.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BarChart title="Por status (last event)" rows={statusRows} />
        <BarChart title="Por tipo de e-mail" rows={catRows} />
      </div>

      {data.itens.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Para</th>
                <th className="px-3 py-2 font-medium">Assunto</th>
                <th className="px-3 py-2 font-medium">Tipo</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Quando</th>
              </tr>
            </thead>
            <tbody>
              {data.itens.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-xs">{row.to}</td>
                  <td className="max-w-[220px] truncate px-3 py-2">{row.subject}</td>
                  <td className="px-3 py-2">
                    {EMAIL_CATEGORIA_LABEL[row.categoria]}
                  </td>
                  <td className="px-3 py-2">{row.lastEvent}</td>
                  <td className="px-3 py-2 text-xs text-muted">
                    {new Intl.DateTimeFormat("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                      timeZone: "America/Sao_Paulo",
                    }).format(new Date(row.createdAt))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
