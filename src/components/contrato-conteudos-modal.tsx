"use client";

import { useLayoutEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { aceitarContratoConteudosAction } from "@/actions/legal/aceitar-contrato-conteudos";
import {
  URL_CONTRATO_CONTEUDOS_PDF,
  VERSAO_CONTRATO_CONTEUDOS,
} from "@/lib/legal/contrato-conteudos";

/**
 * F122 — dialog nativo: bloqueia o app até gravar o aceite do contrato
 * DevQuest + Builders (compras a partir de 28/10/2026).
 */
export function ContratoConteudosModal() {
  const dialog = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [aceitou, setAceitou] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useLayoutEffect(() => {
    const current = dialog.current;
    if (current && !current.open) current.showModal();
  }, []);

  function confirmar() {
    if (!aceitou) return;
    setErro(null);
    start(async () => {
      const result = await aceitarContratoConteudosAction(aceitou);
      if (!result.ok) {
        setErro(result.erro);
        return;
      }
      router.refresh();
    });
  }

  return (
    <dialog
      ref={dialog}
      aria-labelledby="contrato-conteudos-titulo"
      aria-describedby="contrato-conteudos-descricao"
      onCancel={(event) => event.preventDefault()}
      className="fixed left-1/2 top-1/2 m-0 max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border bg-card p-5 text-foreground shadow-xl backdrop:bg-black/70 sm:p-7"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">
        Dev em Dobro · Contrato
      </p>
      <h2
        id="contrato-conteudos-titulo"
        className="mt-2 text-xl font-bold tracking-tight"
      >
        Contrato de conteúdos digitais
      </h2>
      <div
        id="contrato-conteudos-descricao"
        className="mt-4 space-y-3 text-sm leading-relaxed"
      >
        <p>
          Sua compra inclui o <strong>DevQuest</strong> e o{" "}
          <strong>Builders Club</strong>. Antes de usar a plataforma, leia e
          aceite o contrato de conteúdos digitais.
        </p>
        <p>
          O documento completo está em PDF — abra numa aba, leia com calma e
          volte aqui para confirmar.
        </p>
        <p>
          <a
            href={URL_CONTRATO_CONTEUDOS_PDF}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-accent hover:underline"
          >
            Abrir contrato (PDF)
          </a>
        </p>
        <p className="text-xs text-muted">
          Versão do contrato: {VERSAO_CONTRATO_CONTEUDOS}
        </p>
      </div>
      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 text-sm font-medium">
        <input
          type="checkbox"
          checked={aceitou}
          onChange={(event) => setAceitou(event.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
        />
        Li e aceito o Contrato de Conteúdos Digitais da Dev em Dobro.
      </label>
      {erro ? (
        <p className="mt-3 text-sm text-red-500" role="alert">
          {erro}
        </p>
      ) : null}
      <button
        type="button"
        onClick={confirmar}
        disabled={!aceitou || pending}
        className="btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Registrando aceite…" : "Aceitar e continuar"}
      </button>
    </dialog>
  );
}
