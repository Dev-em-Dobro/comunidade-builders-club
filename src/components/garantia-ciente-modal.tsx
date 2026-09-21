"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { aceitarGarantiaAction } from "@/actions/legal/aceitar-garantia";
import { VERSAO_GARANTIA } from "@/lib/legal/garantia";

/**
 * F090 — modal bloqueante: Elite sem ciente da versão vigente não usa o app.
 */
export function GarantiaCienteModal() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function confirmar() {
    setErro(null);
    start(async () => {
      const res = await aceitarGarantiaAction();
      if (!res.ok) {
        setErro(res.erro);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="garantia-ciente-titulo"
    >
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-5 shadow-xl sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          Elite · Lista da garantia
        </p>
        <h2
          id="garantia-ciente-titulo"
          className="mt-2 font-[family-name:var(--font-outfit)] text-xl font-bold tracking-tight"
        >
          Antes de continuar, confirme que leu a garantia
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          O plano Elite tem garantia de 90 dias <strong className="text-foreground">condicionada</strong> a
          uma lista de execução. Sem o seu ciente, essa condição não vale —
          por isso pedimos a confirmação na versão{" "}
          <span className="font-semibold text-foreground">{VERSAO_GARANTIA}</span>.
        </p>
        <p className="mt-3 text-sm text-muted">
          Leia a{" "}
          <Link
            href="/garantia"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-accent hover:underline"
          >
            Lista da garantia
          </Link>{" "}
          (abre numa aba) e marque abaixo.
        </p>
        {erro ? (
          <p className="mt-3 text-sm text-red-500" role="alert">
            {erro}
          </p>
        ) : null}
        <button
          type="button"
          className="btn-primary mt-5 w-full"
          disabled={pending}
          onClick={confirmar}
        >
          {pending ? "Registrando…" : "Li a lista e estou ciente"}
        </button>
      </div>
    </div>
  );
}
