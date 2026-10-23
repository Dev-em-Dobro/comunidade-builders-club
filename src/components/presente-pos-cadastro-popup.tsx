"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  consumePosCadastroPresente,
  getBrowserSessionStorage,
  POS_CADASTRO_POPUP,
  tituloPosCadastro,
  type PosCadastroPresente,
} from "@/lib/presentes/pos-cadastro";

/**
 * F118 — depois do cadastro pelo Presente, pergunta uma vez se a pessoa
 * quer ir ao presente agora. Pending vive em sessionStorage; a primeira
 * montagem consome. Sem cookie novo, sem coluna no banco.
 */
export function PresentePosCadastroPopup() {
  const router = useRouter();
  const [payload, setPayload] = useState<PosCadastroPresente | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storage = getBrowserSessionStorage();
    if (!storage) return;
    const pending = consumePosCadastroPresente(storage);
    if (pending) setPayload(pending);
  }, []);

  const fechar = useCallback(() => setPayload(null), []);

  useEffect(() => {
    if (!payload) return;
    const anterior = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") fechar();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      anterior?.focus?.();
    };
  }, [payload, fechar]);

  if (!payload) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) fechar();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pos-cadastro-presente-titulo"
        tabIndex={-1}
        className="relative w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl outline-none"
      >
        <button
          type="button"
          onClick={fechar}
          aria-label={POS_CADASTRO_POPUP.fechar}
          className="absolute right-3 top-3 rounded-lg px-2 py-1 text-lg leading-none text-muted transition hover:bg-surface hover:text-foreground"
        >
          ×
        </button>
        <h2
          id="pos-cadastro-presente-titulo"
          className="pr-6 font-[family-name:var(--font-outfit)] text-xl font-bold leading-snug tracking-tight"
        >
          {tituloPosCadastro(payload.title)}
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          {POS_CADASTRO_POPUP.corpo}
        </p>
        <button
          type="button"
          className="btn-primary mt-5 w-full"
          onClick={() => {
            const href = payload.href;
            fechar();
            router.push(href);
          }}
        >
          {POS_CADASTRO_POPUP.agora}
        </button>
        <button
          type="button"
          className="btn-ghost mt-2 w-full"
          onClick={fechar}
        >
          {POS_CADASTRO_POPUP.depois}
        </button>
      </div>
    </div>
  );
}
