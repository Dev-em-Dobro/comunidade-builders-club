"use client";

import { useEffect, useRef } from "react";

/**
 * F080 — o rastreador de audiência.
 *
 * Ele resolve a pergunta que a casa não conseguia responder: o membro assiste?
 * Até aqui, "não assistiu" e "assistiu e não clicou em concluir" eram a mesma
 * linha no banco.
 *
 * COMO ESCUTA. O player do Panda expõe `panda_timeupdate` com `currentTime`
 * (é o único evento que a documentação oficial garante, então é o único em que
 * a gente se apoia). O play não precisa de evento próprio: o primeiro
 * `timeupdate` já prova que o vídeo rodou.
 *
 * QUANTO FALA. Um POST a cada 30 segundos de vídeo assistido, não a cada
 * evento — o `timeupdate` dispara várias vezes por segundo e derrubaria a API
 * à toa. E um último no fechamento da aba, via `sendBeacon`, que é o único
 * caminho que sobrevive ao unload.
 *
 * O QUE MANDA. O ponto MAIS LONGE alcançado, não o atual: quem volta o vídeo
 * para rever um trecho não deve perder audiência já registrada.
 */

const INTERVALO_SEGUNDOS = 30;
const SCRIPT_PANDA = "https://player.pandavideo.com.br/api.v2.js";

type PandaEvento = { message?: string; currentTime?: number };
type PandaPlayerCtor = new (
  elementId: string,
  opts: { onReady?: () => void },
) => { onEvent: (cb: (e: PandaEvento) => void) => void };

declare global {
  interface Window {
    pandascripttag?: (() => void)[];
    PandaPlayer?: PandaPlayerCtor;
  }
}

export function VideoPlayTracker({
  videoId,
  fonte,
  lessonId,
  iframeId,
}: {
  videoId: string;
  fonte: "boas-vindas" | "aula";
  lessonId?: string | null;
  /** O id do <iframe>, que o Panda usa para achar o player. Default: panda-<videoId>. */
  iframeId?: string;
}) {
  const maior = useRef(0);
  const enviado = useRef(-1);

  useEffect(() => {
    const alvo = iframeId ?? `panda-${videoId}`;

    const enviar = (beacon = false) => {
      const s = Math.floor(maior.current);
      // Só fala quando andou pelo menos um intervalo desde o último aviso.
      if (s < enviado.current + INTERVALO_SEGUNDOS && !(beacon && s > enviado.current)) return;
      enviado.current = s;
      const corpo = JSON.stringify({ fonte, videoId, lessonId: lessonId ?? null, segundos: s });

      if (beacon && typeof navigator.sendBeacon === "function") {
        navigator.sendBeacon("/api/video/play", corpo);
        return;
      }
      void fetch("/api/video/play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: corpo,
        keepalive: true,
      }).catch(() => {
        // Audiência é dado de apoio: falhar aqui não pode atrapalhar quem assiste.
      });
    };

    const assinar = () => {
      if (!window.PandaPlayer) return;
      const player = new window.PandaPlayer(alvo, {
        onReady: () => {
          player.onEvent((e) => {
            if (e.message !== "panda_timeupdate") return;
            const t = Number(e.currentTime ?? 0);
            if (!Number.isFinite(t)) return;
            if (t > maior.current) maior.current = t;
            enviar();
          });
        },
      });
    };

    // O primeiro POST marca o play, mesmo que a pessoa saia antes de 30s.
    enviado.current = -1;
    maior.current = 0;
    enviar();

    if (window.PandaPlayer) {
      assinar();
    } else {
      window.pandascripttag = window.pandascripttag ?? [];
      window.pandascripttag.push(assinar);
      if (!document.querySelector(`script[src="${SCRIPT_PANDA}"]`)) {
        const s = document.createElement("script");
        s.src = SCRIPT_PANDA;
        s.async = true;
        document.body.appendChild(s);
      }
    }

    const aoSair = () => enviar(true);
    // `pagehide` cobre o que `beforeunload` não cobre no mobile (aba em
    // segundo plano que o sistema descarta sem avisar).
    window.addEventListener("pagehide", aoSair);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") aoSair();
    });

    return () => {
      aoSair();
      window.removeEventListener("pagehide", aoSair);
    };
  }, [videoId, fonte, lessonId, iframeId]);

  return null;
}
