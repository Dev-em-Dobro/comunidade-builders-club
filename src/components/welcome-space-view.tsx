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
  const orientationCards = posts.slice(hero ? 1 : 0);

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

      {tutorialEmbedUrl ? (
        <div className="mt-5">
          <h2
            id="welcome-tutorial-title"
            className="font-[family-name:var(--font-outfit)] text-base font-semibold tracking-tight"
          >
            {tutorialTitle ?? "Como usar a comunidade"}
          </h2>
          <p className="mt-1 text-sm text-muted">
            Tutorial da plataforma. Os cards ao lado são os primeiros passos.
          </p>
        </div>
      ) : null}

      {posts.length === 0 && !tutorialEmbedUrl ? (
        <p className="mt-10 text-sm text-muted">
          Em breve: cards de orientação. Admins podem publicar neste space ou
          rodar o seed de welcome cards.
        </p>
      ) : tutorialEmbedUrl || orientationCards.length > 0 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tutorialEmbedUrl ? (
            <div className="overflow-hidden rounded-2xl border border-border bg-black shadow-sm">
              <div className="relative aspect-video w-full">
                <iframe
                  src={tutorialEmbedUrl}
                  title={tutorialTitle ?? "Tutorial da comunidade"}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  referrerPolicy="origin"
                />
              </div>
            </div>
          ) : null}
          {orientationCards.map((p) => {
            const title =
              p.title?.trim() || previewFromBody(p.body, 70) || "Orientação";
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setOpenId(p.id)}
                className="post-card flex min-h-11 flex-col p-4 text-left transition-colors hover:bg-surface/50"
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
