"use client";

import { useRouter } from "next/navigation";
import {
  EMAIL_CATEGORIA_LABEL,
  EMAIL_CATEGORIAS,
} from "@/lib/email/categorias";

const STATUS_OPTS = [
  { id: "all", label: "Todos os status" },
  { id: "delivered", label: "Delivered" },
  { id: "opened", label: "Opened" },
  { id: "clicked", label: "Clicked" },
  { id: "bounced", label: "Bounced" },
  { id: "failed", label: "Failed" },
] as const;

const DIAS_OPTS = [7, 15, 30] as const;

function buildHref(dias: number, status: string, categoria: string): string {
  const q = new URLSearchParams({ tab: "emails", dias: String(dias) });
  if (status !== "all") q.set("emailStatus", status);
  if (categoria !== "all") q.set("categoria", categoria);
  return `/admin?${q.toString()}`;
}

export function AdminEmailFilters({
  dias,
  status,
  categoria,
}: {
  dias: number;
  status: string;
  categoria: string;
}) {
  const router = useRouter();

  function navegar(next: {
    dias?: number;
    status?: string;
    categoria?: string;
  }) {
    router.push(
      buildHref(
        next.dias ?? dias,
        next.status ?? status,
        next.categoria ?? categoria,
      ),
    );
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="flex min-w-[8rem] flex-col gap-1 text-xs font-medium uppercase tracking-wide text-muted">
        Dias
        <select
          className="input mt-0 text-sm font-normal normal-case tracking-normal text-foreground"
          value={dias}
          onChange={(e) => navegar({ dias: Number(e.target.value) })}
          aria-label="Janela de dias"
        >
          {DIAS_OPTS.map((d) => (
            <option key={d} value={d}>
              Últimos {d} dias
            </option>
          ))}
        </select>
      </label>

      <label className="flex min-w-[10rem] flex-1 flex-col gap-1 text-xs font-medium uppercase tracking-wide text-muted sm:max-w-[14rem]">
        Status
        <select
          className="input mt-0 text-sm font-normal normal-case tracking-normal text-foreground"
          value={status}
          onChange={(e) => navegar({ status: e.target.value })}
          aria-label="Status do e-mail"
        >
          {STATUS_OPTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex min-w-[10rem] flex-1 flex-col gap-1 text-xs font-medium uppercase tracking-wide text-muted sm:max-w-[14rem]">
        Tipo
        <select
          className="input mt-0 text-sm font-normal normal-case tracking-normal text-foreground"
          value={categoria}
          onChange={(e) => navegar({ categoria: e.target.value })}
          aria-label="Tipo de e-mail"
        >
          <option value="all">Todos os tipos</option>
          {EMAIL_CATEGORIAS.filter((c) => c !== "outro").map((c) => (
            <option key={c} value={c}>
              {EMAIL_CATEGORIA_LABEL[c]}
            </option>
          ))}
        </select>
      </label>

      <a
        href={(() => {
          const q = new URLSearchParams({ dias: String(dias) });
          if (status !== "all") q.set("emailStatus", status);
          if (categoria !== "all") q.set("categoria", categoria);
          return `/api/admin/emails/csv?${q.toString()}`;
        })()}
        className="btn-ghost inline-flex h-10 items-center gap-1.5 px-3 text-sm font-medium"
        download
      >
        Baixar CSV
      </a>
    </div>
  );
}
