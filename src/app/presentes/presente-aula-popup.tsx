"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GiftSignupForm } from "@/components/gift-signup-form";
import {
  AULA_ABERTURA_HREF,
  POPUP_AULA,
  POPUP_DELAY_MS,
  subheadPopup,
  tituloPopup,
} from "@/lib/presentes/popup-aula";
import {
  giftPublicPath,
  PRESENTE_ARTIGO_ID,
} from "@/lib/presentes/pos-cadastro";

/**
 * F078 — pop-up da aula no Presente.
 * F118 — deixa de ser modal centrada: sheet no rodapé, nos dois viewports,
 * com CTA "Ver meu presente" para o artigo desta página.
 *
 * Abre `POPUP_DELAY_MS` depois que a página monta, só para quem não tem conta.
 * O e-mail é capturado aqui dentro pelo mesmo `GiftSignupForm` do rodapé — é ele
 * que fecha a atribuição da F059 (cookie `bc_origem` + OTP na mesma aba). Um
 * formulário paralelo erraria a origem em silêncio.
 *
 * A F063 diz que a oferta não vem antes do conteúdo. Esta modal interrompe, e
 * isso foi decidido com o número de conversão na mesa (spec, "O conflito com a
 * F063"). O que a mantém honesta: ela **dá** em vez de vender, e fechar custa
 * um Esc — o artigo continua inteiro atrás.
 *
 * Fechar não é lembrado (decisão 5 da F078): cada visita ao Presente é uma
 * chance nova.
 */
export function PresenteAulaPopup({
  totalAulas,
  giftSlug,
  giftTitle,
}: {
  totalAulas: number;
  giftSlug: string;
  giftTitle: string;
}) {
  const [aberta, setAberta] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const giftHref = giftPublicPath(giftSlug);

  /**
   * Fechar vale só para esta visita (F078 decisão 5). Nada é gravado no
   * navegador: abrir o Presente de novo é uma chance nova.
   */
  const fechar = useCallback(() => setAberta(false), []);

  const verPresente = useCallback(() => {
    fechar();
    window.requestAnimationFrame(() => {
      const artigo = document.getElementById(PRESENTE_ARTIGO_ID);
      if (artigo) {
        artigo.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (giftHref) window.location.assign(giftHref);
    });
  }, [fechar, giftHref]);

  /**
   * O timer roda uma vez, na montagem — fechar não reagenda. Navegar de um
   * Presente para outro remonta o componente, e isso conta como visita nova.
   */
  useEffect(() => {
    const t = window.setTimeout(() => setAberta(true), POPUP_DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  /**
   * Esc fecha, foco entra na sheet e o fundo trava. Uma modal sem Esc no meio
   * de um artigo é sequestro, não convite.
   */
  useEffect(() => {
    if (!aberta) return;

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
  }, [aberta, fechar]);

  if (!aberta) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) fechar();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-aula-titulo"
        tabIndex={-1}
        className="sheet-slide-up relative w-full max-w-lg rounded-t-2xl border border-border/80 border-b-0 bg-card px-5 pt-4 shadow-2xl outline-none animate-[slideUpSheet_0.28s_ease-out] sm:px-6 max-h-[min(72dvh,36rem)] overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        <div
          className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-border"
          aria-hidden
        />
        <button
          type="button"
          onClick={() => fechar()}
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
          className="mt-2 pr-6 font-[family-name:var(--font-outfit)] text-lg font-bold leading-snug tracking-tight sm:text-xl"
        >
          {tituloPopup(totalAulas)}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {subheadPopup(totalAulas)}
        </p>
        <p className="mt-2 font-[family-name:var(--font-outfit)] text-sm font-semibold">
          {POPUP_AULA.promessa}
        </p>

        {giftHref ? (
          <button
            type="button"
            onClick={verPresente}
            className="btn-primary mt-5 w-full"
          >
            {POPUP_AULA.verPresente}
          </button>
        ) : null}

        <div className="mt-4">
          <GiftSignupForm
            headline={POPUP_AULA.cta}
            subhead="Seu e-mail recebe um código de 6 dígitos. Você digita aqui mesmo e cai direto na primeira aula."
            redirectTo={AULA_ABERTURA_HREF}
            formId="cadastro-presente-popup"
            pedirNome={false}
            giftSlug={giftSlug}
            giftTitle={giftTitle}
          />
        </div>

        <button
          type="button"
          onClick={() => fechar()}
          className="btn-ghost mt-2 w-full text-xs"
        >
          {POPUP_AULA.dispensar}
        </button>
      </div>
    </div>
  );
}
