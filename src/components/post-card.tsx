"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { previewFromBody } from "@/lib/posts/title";
import { MarkdownBody } from "@/lib/markdown";
import { isFreeSpaceSlug } from "@/lib/membership/capabilities";
import { OptimizedMediaImage } from "@/components/optimized-media-image";
import { PostActions } from "@/components/post-actions";
import { PostMedia } from "@/components/post-media";
import { PostShareMenu } from "@/components/post-share-menu";
import { useUpgradeOptional } from "@/components/upgrade-modal";

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
  isPaid?: boolean;
  currentUserId?: string;
  /** Primeiro post com imagem no feed — evita lazy no LCP. */
  priorityMedia?: boolean;
  /** Primeiro card do feed — avatar acima da dobra. */
  priorityAvatar?: boolean;
};

function Avatar({
  name,
  url,
  priority = false,
}: {
  name: string;
  url: string | null | undefined;
  priority?: boolean;
}) {
  if (url) {
    return (
      <OptimizedMediaImage
        src={url}
        variant="avatar"
        priority={priority}
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
  locked = false,
}: {
  post: PostCardData;
  showSpace: boolean;
  pinned: boolean;
  /** F041 — post de space pago visto por free (vitrine). */
  locked?: boolean;
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
      {locked ? (
        <span className="ml-1 inline-flex items-center gap-1 rounded-md bg-surface px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
          <svg
            viewBox="0 0 24 24"
            className="h-2.5 w-2.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden
          >
            <rect x="4" y="11" width="16" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
          Membros
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
  isPaid = true,
  currentUserId,
  priorityMedia = false,
  priorityAvatar = false,
}: PostCardProps) {
  const router = useRouter();
  const upgrade = useUpgradeOptional();
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
  // F041: free lê o card de qualquer space no feed, mas o detalhe é pago.
  const locked = !isPaid && !isFreeSpaceSlug(post.space.slug);

  /** Abre o post ou, se travado, o modal de upgrade. */
  function openPost() {
    if (locked) {
      // Sem provider (fora do app shell) o /posts/[id] já redireciona pro upgrade.
      if (upgrade) return upgrade.openUpgrade("space");
    }
    router.push(href);
  }

  const actions = (
    <PostActions
      postId={post.id}
      spaceSlug={post.space.slug}
      liked={liked}
      reactionCount={post.reactionCount}
      isAdmin={isAdmin}
      isAuthor={isAuthor}
      isPaid={isPaid}
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
        onClick={openPost}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPost();
          }
        }}
      >
        <div className="flex gap-3">
          <Avatar name={name} url={avatarUrl} priority={priorityAvatar} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold text-foreground md:text-base">
                  {name}
                </p>
                <MetaLine
                  post={post}
                  showSpace={showSpace}
                  pinned={pinned}
                  locked={locked}
                />
              </div>
              <PostShareMenu postId={post.id} />
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
                priority={priorityMedia}
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
              <span className="ml-auto font-medium text-accent">
                {locked ? "Desbloquear →" : "Ler →"}
              </span>
            </div>

            {actions}
          </div>
        </div>
      </article>
    );
  }

  const compactClass =
    "block cursor-pointer p-5 pb-3 pr-12 transition-colors hover:bg-surface/40";

  const compactBody = (
    <div className="flex gap-3">
      <Avatar name={name} url={avatarUrl} priority={priorityAvatar} />
      <div className="min-w-0 flex-1">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-foreground md:text-base">
            {name}
          </p>
          <MetaLine
            post={post}
            showSpace={showSpace}
            pinned={pinned}
            locked={locked}
          />
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
          <OptimizedMediaImage
            src={post.imageUrl}
            variant="feed"
            priority={priorityMedia}
            className="mt-3 max-h-40 w-full rounded-xl object-cover"
          />
        ) : null}
        {!post.imageUrl &&
        post.linkUrl &&
        !post.linkUrl.startsWith("builders-club://") ? (
          <p className="mt-2 truncate text-xs font-medium text-accent">
            {post.linkUrl}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border/70 pt-3 text-sm text-muted">
          <span>
            {post.viewCount} {post.viewCount === 1 ? "leitura" : "leituras"}
          </span>
          <span>
            {post.reactionCount}{" "}
            {post.reactionCount === 1 ? "reação" : "reações"}
          </span>
          <span>
            {post.commentCount}{" "}
            {post.commentCount === 1 ? "comentário" : "comentários"}
          </span>
          <span className="ml-auto font-medium text-accent">
            {locked ? "Desbloquear →" : "Ler →"}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <article className="post-card relative animate-[fadeIn_0.35s_ease-out] p-0">
      <div className="absolute right-3 top-3 z-10">
        <PostShareMenu postId={post.id} />
      </div>
      {locked ? (
        <div
          role="link"
          tabIndex={0}
          className={compactClass}
          onClick={openPost}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openPost();
            }
          }}
        >
          {compactBody}
        </div>
      ) : (
        <Link href={href} className={compactClass}>
          {compactBody}
        </Link>
      )}
      {canManage ? (
        <div className="border-t border-border/60 px-5 py-3">{actions}</div>
      ) : null}
    </article>
  );
}
