"use client";

/**
 * F057 — aviso de cookies.
 *
 * Aceitar e recusar têm o mesmo peso visual: a ANPD trata como consentimento
 * viciado o banner que destaca "aceitar" e esconde a recusa.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CONSENTIMENTO_MAX_AGE,
  COOKIE_CONSENTIMENTO,
  precisaDecidir,
  serializarConsentimento,
  type Decisao,
} from "@/lib/consentimento";

function lerCookie(nome: string): string | undefined {
  const alvo = `${nome}=`;
  for (const parte of document.cookie.split("; ")) {
    if (parte.startsWith(alvo)) return decodeURIComponent(parte.slice(alvo.length));
  }
  return undefined;
}

function gravarDecisao(decisao: Decisao) {
  const seguro = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${COOKIE_CONSENTIMENTO}=${serializarConsentimento(decisao)}` +
    `; Path=/; Max-Age=${CONSENTIMENTO_MAX_AGE}; SameSite=Lax${seguro}`;
}

export function CookieConsent() {
  // Sem valor no primeiro render: o cookie só existe no cliente e um banner
  // renderizado no servidor piscaria para quem já decidiu.
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    setVisivel(precisaDecidir(lerCookie(COOKIE_CONSENTIMENTO)));
  }, []);

  if (!visivel) return null;

  function decidir(decisao: Decisao) {
    gravarDecisao(decisao);
    setVisivel(false);
  }

  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-lg sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-foreground/85">
          Usamos cookies necessários para manter você conectado. Se você
          aceitar, também usaremos cookies de medição para entender como a
          comunidade é usada.{" "}
          <Link
            href="/privacidade"
            className="font-medium text-accent hover:underline"
          >
            Política de Privacidade
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => decidir("recusado")}
            className="btn-outline flex-1 sm:flex-none"
          >
            Recusar
          </button>
          <button
            type="button"
            onClick={() => decidir("aceito")}
            className="btn-outline flex-1 sm:flex-none"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}
