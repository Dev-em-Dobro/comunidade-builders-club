"use client";

import { useState } from "react";
import { previewFromBody } from "@/lib/posts/title";
import { PostModal } from "@/components/post-modal";

export type WelcomeCardPost = {
  id: string;
  title: string;
  body: string;
  imageUrl: string | null;
  reactionCount: number;
  commentCount: number;
  authorName: string;
  avatarUrl: string | null;
  createdAt: string;
};

export function WelcomeSpaceView({
  spaceName,
  spaceDescription,
  posts,
  isAdmin,
  isPaid = true,
  currentUserId,
  tutorialEmbedUrl,
  tutorialTitle,
}: {
  spaceName: string;
  spaceDescription: string | null;
  posts: WelcomeCardPost[];
  isAdmin: boolean;
  isPaid?: boolean;
  currentUserId: string;
  tutorialEmbedUrl?: string | null;
  tutorialTitle?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const hero = posts[0];
  const cards = posts.slice(hero ? 1 : 0);
  const orientationCards = hero ? cards : posts;

  return (
    <div className="feed-wrap-wide">
      <div>
        <h1 className="page-title">{spaceName}</h1>
        {spaceDescription ? (
          <p className="mt-1.5 text-sm text-muted">{spaceDescription}</p>
        ) : (
          <p className="mt-1.5 text-sm text-muted">
            Orientações para começar bem na comunidade.
          </p>
        )}
      </div>

      {hero ? (
        <button
          type="button"
          onClick={() => setOpenId(hero.id)}
          className="post-card mt-6 w-full p-5 text-left transition-colors hover:bg-surface/50 sm:p-6"
        >
          <h2 className="font-[family-name:var(--font-outfit)] text-xl font-bold tracking-tight sm:text-2xl">
            {hero.title?.trim() ||
              previewFromBody(hero.body, 80) ||
              "Bem-vindo ao Builders Club"}
          </h2>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted sm:text-base">
            {previewFromBody(hero.body, 220)}
          </p>
          <p className="mt-3 text-xs font-medium text-accent">Abrir →</p>
        </button>
      ) : null}

      {posts.length === 0 && !tutorialEmbedUrl ? (
        <p className="mt-10 text-sm text-muted">
          Em breve: cards de orientação. Admins podem publicar neste space ou
          rodar o seed de welcome cards.
        </p>
      ) : (
        <div
          className={
            tutorialEmbedUrl
              ? "mt-5 grid items-stretch gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(17rem,0.8fr)]"
              : "mt-5"
          }
        >
          {tutorialEmbedUrl ? (
            <section aria-labelledby="welcome-tutorial-title">
              <h2
                id="welcome-tutorial-title"
                className="font-[family-name:var(--font-outfit)] text-base font-semibold tracking-tight"
              >
                {tutorialTitle ?? "Como usar a comunidade"}
              </h2>
              <p className="mt-1 text-sm text-muted">
                Assista ao tutorial e use os cards de orientação para os
                primeiros passos.
              </p>
              <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-black shadow-sm">
                <div className="relative aspect-video w-full">
                  <iframe
                    src={tutorialEmbedUrl}
                    title={tutorialTitle ?? "Tutorial da comunidade"}
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </section>
          ) : null}

          {orientationCards.length > 0 ? (
            <div
              className={
                tutorialEmbedUrl
                  ? "grid gap-3 sm:grid-cols-2 lg:h-full lg:grid-cols-1 lg:grid-rows-5"
                  : "grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
              }
            >
              {orientationCards.map((p) => {
                const title =
                  p.title?.trim() || previewFromBody(p.body, 70) || "Orientação";
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setOpenId(p.id)}
                    className="post-card flex min-h-11 flex-col p-4 text-left transition-colors hover:bg-surface/50 lg:min-h-0"
                  >
                    <h3 className="font-[family-name:var(--font-outfit)] text-sm font-semibold leading-snug sm:text-base">
                      {title}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-muted">
                      {previewFromBody(p.body, 110)}
                    </p>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      )}

      <PostModal
        postId={openId}
        isAdmin={isAdmin}
        isPaid={isPaid}
        currentUserId={currentUserId}
        onClose={() => setOpenId(null)}
      />
    </div>
  );
}
