"use client";

import { useTransition } from "react";
import { pararSimulacaoAction } from "@/actions/admin-simular-login";

/** F123 — faixa fixa enquanto o admin navega como outro membro. */
export function SimularLoginBanner({ email }: { email: string }) {
  const [pending, start] = useTransition();

  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/40 bg-amber-500/15 px-4 py-2 text-sm text-foreground"
    >
      <p>
        <span className="font-semibold">Simulando login:</span>{" "}
        <span className="text-muted">{email}</span>
      </p>
      <button
        type="button"
        className="btn-outline text-xs"
        disabled={pending}
        onClick={() => start(() => pararSimulacaoAction())}
      >
        {pending ? "Saindo…" : "Parar simulação"}
      </button>
    </div>
  );
}
