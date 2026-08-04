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
}: {
  spaceName: string;
  spaceDescription: string | null;
  posts: WelcomeCardPost[];
  isAdmin: boolean;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const hero = posts[0];
  const cards = posts.slice(hero ? 1 : 0);

  return (
    <div className="feed-wrap">
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
          className="post-card mt-8 w-full p-6 text-left transition-colors hover:bg-surface/50 sm:p-8"
        >
          <h2 className="font-[family-name:var(--font-outfit)] text-2xl font-bold tracking-tight sm:text-3xl">
            {hero.title?.trim() ||
              previewFromBody(hero.body, 80) ||
              "Bem-vindo ao Builders Club"}
          </h2>
          <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted sm:text-base">
            {previewFromBody(hero.body, 320)}
          </p>
          <p className="mt-4 text-xs font-medium text-accent">Abrir →</p>
        </button>
      ) : null}

      {posts.length === 0 ? (
        <p className="mt-10 text-sm text-muted">
          Em breve: cards de orientação. Admins podem publicar neste space.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(hero ? cards : posts).map((p) => {
            const title =
              p.title?.trim() || previewFromBody(p.body, 70) || "Orientação";
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setOpenId(p.id)}
                className="post-card flex min-h-[180px] flex-col p-5 text-left transition-colors hover:bg-surface/50"
              >
                <h3 className="font-[family-name:var(--font-outfit)] text-base font-semibold leading-snug">
                  {title}
                </h3>
                <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted">
                  {previewFromBody(p.body, 140)}
                </p>
                <div className="mt-4 flex items-center gap-2 border-t border-border/70 pt-3">
                  {p.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.avatarUrl}
                      alt=""
                      className="h-7 w-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 text-[10px] font-bold text-accent">
                      {p.authorName.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{p.authorName}</p>
                    <p className="text-[10px] text-muted">
                      {p.reactionCount} reações · {p.commentCount} comentários
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <PostModal
        postId={openId}
        isAdmin={isAdmin}
        onClose={() => setOpenId(null)}
      />
    </div>
  );
}
