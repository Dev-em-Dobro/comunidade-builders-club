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
       * F068 — play no rodapé, não no centro: a arte tem a headline no meio
       * e o botão centralizado cobria "com IA".
       */}
      <span className="absolute inset-0 flex items-end justify-end pb-[7%] pr-[7%]">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 shadow-lg transition-transform group-hover:scale-105 sm:h-16 sm:w-16">
          <svg
            viewBox="0 0 24 24"
            aria-hidden
            className="ml-1 h-7 w-7 fill-slate-900 sm:h-9 sm:w-9"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
    </button>
  );
}
