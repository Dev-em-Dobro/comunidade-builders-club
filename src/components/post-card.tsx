"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { previewFromBody } from "@/lib/posts/title";
import { MarkdownBody } from "@/lib/markdown";
import { PostActions } from "@/components/post-actions";
import { PostMedia } from "@/components/post-media";

export type PostCardData = {
  id: string;
  title: string;
  body: string;
  imageUrl: string | null;
  linkUrl?: string | null;
  videoUrl?: string | null;
  authorId?: string;
  pinnedAt: Date | string | null;
  commentCount: number;
  reactionCount: number;
  viewCount: number;
  createdAt: Date | string;
  space: { slug: string; name: string };
  author: {
    id?: string;
    profile: { displayName: string; avatarUrl: string | null } | null;
  };
  reactions?: { userId: string }[];
};

type PostCardProps = {
  post: PostCardData;
  showSpace?: boolean;
  variant?: "compact" | "expanded";
  isAdmin?: boolean;
  currentUserId?: string;
};

function Avatar({
  name,
  url,
}: {
  name: string;
  url: string | null | undefined;
}) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-surface sm:h-12 sm:w-12"
      />
    );
  }
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent sm:h-12 sm:w-12 sm:text-base">
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}

function formatDate(value: Date | string) {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MetaLine({
  post,
  showSpace,
  pinned,
}: {
  post: PostCardData;
  showSpace: boolean;
  pinned: boolean;
}) {
  return (
    <p className="mt-0.5 text-sm text-muted">
      {showSpace ? (
        <>
          <span className="font-medium text-accent/90">{post.space.name}</span>
          {" · "}
        </>
      ) : null}
      {formatDate(post.createdAt)}
      {pinned ? (
        <span className="ml-1 rounded-md bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
          Fixado
        </span>
      ) : null}
    </p>
  );
}

export function PostCard({
  post,
  showSpace = true,
  variant = "compact",
  isAdmin = false,
  currentUserId,
}: PostCardProps) {
  const router = useRouter();
  const name = post.author.profile?.displayName ?? "Membro";
  const avatarUrl = post.author.profile?.avatarUrl;
  const title =
    post.title?.trim() || previewFromBody(post.body, 90) || "Publicação";
  const preview = previewFromBody(post.body, 160);
  const pinned = !!post.pinnedAt;
  const liked = Boolean(
    currentUserId && post.reactions?.some((r) => r.userId === currentUserId),
  );
  const authorId = post.authorId ?? post.author.id;
  const isAuthor = Boolean(currentUserId && authorId === currentUserId);
  const canManage = isAdmin || isAuthor;
  const href = `/posts/${post.id}`;

  const actions = (
    <PostActions
      postId={post.id}
      spaceSlug={post.space.slug}
      liked={liked}
      reactionCount={post.reactionCount}
      isAdmin={isAdmin}
      isAuthor={isAuthor}
      pinned={pinned}
      body={post.body}
      imageUrl={post.imageUrl}
      linkUrl={post.linkUrl}
      videoUrl={post.videoUrl}
      compact={variant === "compact"}
    />
  );

  if (variant === "expanded") {
    return (
      <article
        className="post-card animate-[fadeIn_0.35s_ease-out] cursor-pointer p-5 transition-colors hover:bg-surface/40"
        role="link"
        tabIndex={0}
        onClick={() => router.push(href)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            router.push(href);
          }
        }}
      >
        <div className="flex gap-3">
          <Avatar name={name} url={avatarUrl} />
          <div className="min-w-0 flex-1">
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold text-foreground md:text-base">
                {name}
              </p>
              <MetaLine post={post} showSpace={showSpace} pinned={pinned} />
            </div>

            <div
              onClick={(e) => {
                const el = e.target as HTMLElement;
                if (el.closest("a, button, video, input, textarea, label")) {
                  e.stopPropagation();
                }
              }}
            >
              <h2 className="mt-3 font-[family-name:var(--font-outfit)] text-lg font-semibold leading-snug tracking-tight text-foreground">
                {title}
              </h2>
              <div className="mt-3">
                <MarkdownBody body={post.body} />
              </div>
              <PostMedia
                imageUrl={post.imageUrl}
                videoUrl={post.videoUrl}
                linkUrl={post.linkUrl}
              />
            </div>

            <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted">
              <span>
                {post.viewCount}{" "}
                {post.viewCount === 1 ? "leitura" : "leituras"}
              </span>
              <span>
                {post.commentCount}{" "}
                {post.commentCount === 1 ? "comentário" : "comentários"}
              </span>
              <span className="ml-auto font-medium text-accent">Ler →</span>
            </div>

            {actions}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="post-card animate-[fadeIn_0.35s_ease-out] p-0">
      <Link
        href={href}
        className="block cursor-pointer p-5 pb-3 transition-colors hover:bg-surface/40"
      >
        <div className="flex gap-3">
          <Avatar name={name} url={avatarUrl} />
          <div className="min-w-0 flex-1">
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold text-foreground md:text-base">
                {name}
              </p>
              <MetaLine post={post} showSpace={showSpace} pinned={pinned} />
            </div>

            <h2 className="mt-3 font-[family-name:var(--font-outfit)] text-lg font-semibold leading-snug tracking-tight text-foreground">
              {title}
            </h2>
            {preview && preview !== title ? (
              <p className="mt-1.5 line-clamp-2 text-[15px] leading-relaxed text-muted md:text-base">
                {preview}
              </p>
            ) : null}

            {post.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.imageUrl}
                alt=""
                className="mt-3 max-h-40 w-full rounded-xl object-cover"
                loading="lazy"
              />
            ) : null}
            {!post.imageUrl && post.linkUrl ? (
              <p className="mt-2 truncate text-xs font-medium text-accent">
                {post.linkUrl}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border/70 pt-3 text-sm text-muted">
              <span>
                {post.viewCount}{" "}
                {post.viewCount === 1 ? "leitura" : "leituras"}
              </span>
              <span>
                {post.reactionCount}{" "}
                {post.reactionCount === 1 ? "reação" : "reações"}
              </span>
              <span>
                {post.commentCount}{" "}
                {post.commentCount === 1 ? "comentário" : "comentários"}
              </span>
              <span className="ml-auto font-medium text-accent">Ler →</span>
            </div>
          </div>
        </div>
      </Link>
      {canManage ? (
        <div className="border-t border-border/60 px-5 py-3">{actions}</div>
      ) : null}
    </article>
  );
}
