"use client";

import { useEffect, useState } from "react";
import {
  BLACK_INFINITA_FAIXA_COPY,
  BLACK_INFINITA_FAIXA_FECHAR,
  BLACK_INFINITA_FAIXA_HREF,
  BLACK_INFINITA_FAIXA_KEY,
  dismissBlackInfinitaFaixa,
  getBrowserLocalStorage,
  shouldShowBlackInfinitaFaixa,
} from "@/lib/presentes/black-infinita-faixa";

/**
 * F119 — faixa slim no topo do Presente, só anônimo.
 *
 * Começa oculta: pintar no SSR (ou no primeiro frame) e esconder depois
 * de ler o `localStorage` daria flash para quem já fechou. A página só
 * monta este componente quando `getOptionalUser()` veio vazio.
 */
export function PresenteBlackInfinitaFaixa() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const storage = getBrowserLocalStorage();
    const dismissedRaw = storage?.getItem(BLACK_INFINITA_FAIXA_KEY) ?? null;
    if (
      shouldShowBlackInfinitaFaixa({
        loggedIn: false,
        dismissedRaw,
      })
    ) {
      setVisivel(true);
    }
  }, []);

  if (!visivel) return null;

  function fechar() {
    const storage = getBrowserLocalStorage();
    if (storage) dismissBlackInfinitaFaixa(storage);
    setVisivel(false);
  }

  return (
    <aside className="border-b border-accent/30 bg-accent/10">
      <div className="flex items-start gap-1 sm:items-center">
        <a
          href={BLACK_INFINITA_FAIXA_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-0 flex-1 px-3 py-2.5 text-xs leading-snug text-foreground sm:px-4 sm:text-sm"
        >
          {BLACK_INFINITA_FAIXA_COPY}
        </a>
        <button
          type="button"
          onClick={fechar}
          aria-label={BLACK_INFINITA_FAIXA_FECHAR}
          className="flex h-11 w-11 shrink-0 items-center justify-center text-lg leading-none text-muted hover:text-foreground"
        >
          ×
        </button>
      </div>
    </aside>
  );
}
