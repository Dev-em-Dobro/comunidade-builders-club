"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import {
  CONSENTIMENTO_ANALYTICS_EVENT,
  COOKIE_CONSENTIMENTO,
  shouldLoadClarity,
} from "@/lib/consentimento";

function lerCookieConsentimento(): string | undefined {
  const alvo = `${COOKIE_CONSENTIMENTO}=`;
  for (const parte of document.cookie.split("; ")) {
    if (parte.startsWith(alvo)) {
      return decodeURIComponent(parte.slice(alvo.length));
    }
  }
  return undefined;
}

/** F074 — Clarity só depois do aceite F057 e com Project ID na env. */
export function ClarityInit({ projectId }: { projectId?: string }) {
  const [liberado, setLiberado] = useState(false);

  useEffect(() => {
    const avaliar = () => {
      setLiberado(
        shouldLoadClarity({
          projectId,
          consentCookie: lerCookieConsentimento(),
        }),
      );
    };
    avaliar();
    window.addEventListener(CONSENTIMENTO_ANALYTICS_EVENT, avaliar);
    return () => {
      window.removeEventListener(CONSENTIMENTO_ANALYTICS_EVENT, avaliar);
    };
  }, [projectId]);

  const id = projectId?.trim();
  if (!id || !liberado) return null;

  return (
    <Script id="microsoft-clarity" strategy="afterInteractive">
      {`
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", ${JSON.stringify(id)});
      `}
    </Script>
  );
}
