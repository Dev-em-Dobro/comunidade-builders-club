"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GiftSignupForm } from "@/components/gift-signup-form";
import {
  AULA_ABERTURA_HREF,
  POPUP_AULA,
  POPUP_DELAY_MS,
  POPUP_FADE_CLASS,
  POPUP_OVERLAY_CLASS,
  subheadPopup,
  tituloPopup,
} from "@/lib/presentes/popup-aula";

/**
 * F078 — pop-up da aula no Presente.
 * F118 — no desktop (`md+`) é a modal centrada de sempre; abaixo de `md`
 * a mesma caixa senta no rodapé com teto de ~50dvh. Sem sheet, sem puxador,
 * sem slide. O CTA "Ver meu presente" não entra aqui; depois do cadastro o
 * lembrete (PresentePosCadastroPopup) é quem oferece ir ao presente.
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
 *
 * Overlay/fundo no `md+`: o mesmo de antes da F118 (`bg-black/60`, blur,
 * `p-4`). Abaixo de `md`: sem blur, `p-0`, caixa colada nas bordas e no
 * rodapé (`bottom-0`). Sem `--bc-consent-h`: aviso e pop-up podem
 * empilhar; a caixa não sobe para o meio da tela.
 *
 * Entrada: fade de opacity na posição final (centro no desktop, rodapé no
 * mobile). `prefers-reduced-motion` corta a animação.
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

  /**
   * Fechar vale só para esta visita (F078 decisão 5). Nada é gravado no
   * navegador: abrir o Presente de novo é uma chance nova.
   */
  const fechar = useCallback(() => setAberta(false), []);

  /**
   * O timer roda uma vez, na montagem — fechar não reagenda. Navegar de um
   * Presente para outro remonta o componente, e isso conta como visita nova.
   * Não espera o aviso de cookies.
   */
  useEffect(() => {
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
      className={`${POPUP_OVERLAY_CLASS} fixed inset-0 z-[60] flex items-end justify-center overflow-y-auto bg-black/60 p-0 backdrop-blur-none md:items-center md:p-4 md:backdrop-blur-sm`}
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
        className={`${POPUP_FADE_CLASS} relative my-0 flex w-full max-w-lg flex-col rounded-t-2xl rounded-b-none border border-border/80 bg-card p-6 shadow-2xl outline-none max-md:max-h-[50dvh] max-md:max-w-none md:my-auto md:rounded-2xl sm:p-7`}
      >
        <button
          type="button"
          onClick={() => fechar()}
          aria-label={POPUP_AULA.fechar}
          className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-lg text-2xl leading-none text-muted transition hover:bg-surface hover:text-foreground"
        >
          ×
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <p className="font-[family-name:var(--font-outfit)] text-xs font-semibold uppercase tracking-[0.12em] text-accent">
            {POPUP_AULA.eyebrow}
          </p>
          <h2
            id="popup-aula-titulo"
            className="mt-2 pr-12 font-[family-name:var(--font-outfit)] text-xl font-bold leading-snug tracking-tight sm:text-2xl"
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
              pedirNome={false}
              giftSlug={giftSlug}
              giftTitle={giftTitle}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => fechar()}
          className="btn-ghost mt-3 w-full shrink-0 text-xs"
        >
          {POPUP_AULA.dispensar}
        </button>
      </div>
    </div>
  );
}
