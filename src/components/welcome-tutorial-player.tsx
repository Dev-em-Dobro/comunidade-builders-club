"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * F068 — fachada do vídeo de boas-vindas.
 *
 * Antes do clique, só a capa da marca com o play: o membro novo entende
 * que ali tem vídeo, e o embed do Panda não pesa no primeiro acesso.
 * No clique, o iframe monta no lugar já tocando — um único iframe por
 * visita, como manda a F058.
 */
export function WelcomeTutorialPlayer({
  embedUrl,
  videoId,
  title,
  coverUrl = "/boas-vindas-capa.webp",
}: {
  embedUrl: string;
  videoId?: string | null;
  title: string;
  coverUrl?: string;
}) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    const src = embedUrl.includes("?")
      ? `${embedUrl}&autoplay=true`
      : `${embedUrl}?autoplay=true`;
    return (
      <div className="relative aspect-video w-full">
        <iframe
          id={videoId ? `panda-${videoId}` : undefined}
          src={src}
          title={title}
          className="absolute inset-0 h-full w-full"
          style={{ border: "none" }}
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          referrerPolicy="origin"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Assistir: ${title}`}
      className="group relative block aspect-video w-full cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
    >
      <Image
        src={coverUrl}
        alt=""
        fill
        priority
        sizes="(min-width: 1024px) 66vw, 100vw"
        className="object-cover"
      />
      <span className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/25" />
      {/*
       * F068 — play centralizado e pequeno: grande demais ele atropela a
       * headline da arte. A sombra é o que dá destaque, não o tamanho.
       */}
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 shadow-[0_6px_24px_rgba(0,0,0,0.55)] transition-transform group-hover:scale-110 sm:h-14 sm:w-14">
          {/* Triângulo pelo centroide: vértices (9,6.5) (9,17.5) (18,12)
              centram em (12,12) — sem `ml` para compensar. */}
          <svg
            viewBox="0 0 24 24"
            aria-hidden
            className="h-5 w-5 fill-slate-900 sm:h-6 sm:w-6"
          >
            <path d="M9 6.5v11l9-5.5z" />
          </svg>
        </span>
      </span>
    </button>
  );
}
