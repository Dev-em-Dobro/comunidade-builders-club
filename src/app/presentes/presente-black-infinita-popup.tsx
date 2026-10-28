"use client";

import { useEffect, useState } from "react";
import { POPUP_FADE_CLASS } from "@/lib/presentes/popup-aula";
import {
  aulaPopupLiberouABlack,
  BLACK_INFINITA_POPUP_AULA_WAIT_MS,
  BLACK_INFINITA_POPUP_COPY,
  BLACK_INFINITA_POPUP_CTA,
  BLACK_INFINITA_POPUP_FECHAR,
  BLACK_INFINITA_POPUP_HREF,
  BLACK_INFINITA_POPUP_KEY,
  dismissBlackInfinitaPopup,
  shouldShowBlackInfinitaPopup,
} from "@/lib/presentes/black-infinita-popup";
import { getBrowserLocalStorage } from "@/lib/presentes/black-infinita-faixa";

function aulaPopupAbertaNoDom(): boolean {
  return Boolean(document.getElementById("popup-aula-titulo"));
}

/**
 * F121 — convite curto da Black no Presente, só anônimo.
 *
 * Não altera a pop-up da aula: observa `#popup-aula-titulo` e só abre
 * depois que ela fechou, ou se o delay dela passou sem abrir. Cookies
 * não entram na conta.
 */
export function PresenteBlackInfinitaPopup() {
  const [dismissedRaw, setDismissedRaw] = useState<string | null>("1");
  const [aulaAberta, setAulaAberta] = useState(false);
  const [viuAula, setViuAula] = useState(false);
  const [esperaExpirou, setEsperaExpirou] = useState(false);

  useEffect(() => {
    const storage = getBrowserLocalStorage();
    setDismissedRaw(storage?.getItem(BLACK_INFINITA_POPUP_KEY) ?? null);
  }, []);

  useEffect(() => {
    const ler = () => {
      const aberta = aulaPopupAbertaNoDom();
      setAulaAberta(aberta);
      if (aberta) setViuAula(true);
    };
    ler();
    const obs = new MutationObserver(ler);
    obs.observe(document.body, { childList: true, subtree: true });
    const t = window.setTimeout(
      () => setEsperaExpirou(true),
      BLACK_INFINITA_POPUP_AULA_WAIT_MS,
    );
    return () => {
      obs.disconnect();
      window.clearTimeout(t);
    };
  }, []);

  const visivel = shouldShowBlackInfinitaPopup({
    loggedIn: false,
    dismissedRaw,
    aulaPopupAberta: aulaAberta,
    aulaPopupEncerrada: aulaPopupLiberouABlack({
      viuAulaPopup: viuAula,
      aulaPopupAberta: aulaAberta,
      esperaDaAulaExpirou: esperaExpirou,
    }),
  });

  function fechar() {
    const storage = getBrowserLocalStorage();
    if (storage) dismissBlackInfinitaPopup(storage);
    setDismissedRaw("1");
  }

  if (!visivel) return null;

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-black-infinita-titulo"
        className={`${POPUP_FADE_CLASS} relative w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl outline-none`}
      >
        <button
          type="button"
          onClick={fechar}
          aria-label={BLACK_INFINITA_POPUP_FECHAR}
          className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-lg text-2xl leading-none text-muted hover:bg-surface hover:text-foreground"
        >
          ×
        </button>
        <h2
          id="popup-black-infinita-titulo"
          className="pr-12 font-[family-name:var(--font-outfit)] text-xl font-bold leading-snug tracking-tight"
        >
          {BLACK_INFINITA_POPUP_COPY}
        </h2>
        <a
          href={BLACK_INFINITA_POPUP_HREF}
          target="_blank"
          rel="noopener noreferrer"
          onClick={fechar}
          className="btn-primary mt-5 inline-flex w-full"
        >
          {BLACK_INFINITA_POPUP_CTA}
        </a>
      </div>
    </div>
  );
}
