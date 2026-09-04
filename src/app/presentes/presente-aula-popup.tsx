"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GiftSignupForm } from "@/components/gift-signup-form";
import {
  AULA_ABERTURA_HREF,
  POPUP_AULA,
  POPUP_DELAY_MS,
  POPUP_DISPENSA_KEY,
  dispensaAtiva,
  subheadPopup,
  tituloPopup,
} from "@/lib/presentes/popup-aula";

/**
 * F078 — pop-up da aula no Presente.
 *
 * Abre 60s depois que a página monta, só para quem não tem conta. O e-mail é
 * capturado aqui dentro pelo mesmo `GiftSignupForm` do rodapé — é ele que fecha
 * a atribuição da F059 (cookie `bc_origem` + OTP na mesma aba). Um formulário
 * paralelo erraria a origem em silêncio.
 *
 * A F063 diz que a oferta não vem antes do conteúdo. Esta modal interrompe, e
 * isso foi decidido com o número de conversão na mesa (spec, "O conflito com a
 * F063"). O que a mantém honesta: ela **dá** em vez de vender, e fechar custa
 * um Esc — o artigo continua inteiro atrás.
 */
export function PresenteAulaPopup({ totalAulas }: { totalAulas: number }) {
  const [aberta, setAberta] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const fechar = useCallback((lembrar: boolean) => {
    setAberta(false);
    if (!lembrar) return;
    try {
      window.localStorage.setItem(POPUP_DISPENSA_KEY, String(Date.now()));
    } catch {
      /* modo restrito: sem memória de dispensa, mas a página não quebra */
    }
  }, []);

  useEffect(() => {
    let dispensada = false;
    try {
      dispensada = dispensaAtiva(
        window.localStorage.getItem(POPUP_DISPENSA_KEY),
        Date.now(),
      );
    } catch {
      /* localStorage indisponível conta como "nunca dispensou" */
    }
    if (dispensada) return;

    const t = window.setTimeout(() => setAberta(true), POPUP_DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  /**
   * Esc fecha, foco entra na modal e o fundo trava. Uma modal sem Esc no meio
   * de um artigo é sequestro, não convite.
   */
  useEffect(() => {
    if (!aberta) return;

    const anterior = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") fechar(true);
    }
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      anterior?.focus?.();
    };
  }, [aberta, fechar]);

  if (!aberta) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) fechar(true);
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-aula-titulo"
        tabIndex={-1}
        className="relative my-auto w-full max-w-lg rounded-2xl border border-border/80 bg-card p-6 shadow-2xl outline-none sm:p-7"
      >
        <button
          type="button"
          onClick={() => fechar(true)}
          aria-label={POPUP_AULA.fechar}
          className="absolute right-3 top-3 rounded-lg px-2 py-1 text-lg leading-none text-muted transition hover:bg-surface hover:text-foreground"
        >
          ×
        </button>

        <p className="font-[family-name:var(--font-outfit)] text-xs font-semibold uppercase tracking-[0.12em] text-accent">
          {POPUP_AULA.eyebrow}
        </p>
        <h2
          id="popup-aula-titulo"
          className="mt-2 pr-6 font-[family-name:var(--font-outfit)] text-xl font-bold leading-snug tracking-tight sm:text-2xl"
        >
          {tituloPopup(totalAulas)}
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          {subheadPopup(totalAulas)}
        </p>
        <p className="mt-3 font-[family-name:var(--font-outfit)] text-base font-semibold">
          {POPUP_AULA.promessa}
        </p>

        <div className="mt-5">
          <GiftSignupForm
            headline={POPUP_AULA.cta}
            subhead="Seu e-mail recebe um código de 6 dígitos. Você digita aqui mesmo e cai direto na primeira aula."
            redirectTo={AULA_ABERTURA_HREF}
            formId="cadastro-presente-popup"
          />
        </div>

        <button
          type="button"
          onClick={() => fechar(true)}
          className="btn-ghost mt-3 w-full text-xs"
        >
          {POPUP_AULA.dispensar}
        </button>
      </div>
    </div>
  );
}
