"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { previewFromBody } from "@/lib/posts/title";
import { MarkdownBody } from "@/lib/markdown";
import { OptimizedMediaImage } from "@/components/optimized-media-image";
import { PostActions, ReactionButton } from "@/components/post-actions";
import { PostMedia } from "@/components/post-media";
import { PostShareMenu } from "@/components/post-share-menu";
import { CommentIcon, EyeIcon, PostStat } from "@/components/post-icons";

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
  /** F060 — na listagem o avatar é linha de crédito, não coluna. */
  size = "lg",
}: {
  name: string;
  url: string | null | undefined;
  priority?: boolean;
  size?: "sm" | "lg";
}) {
  const box =
    size === "sm" ? "h-6 w-6" : "h-11 w-11 sm:h-12 sm:w-12";
  if (url) {
    return (
      <OptimizedMediaImage
        src={url}
        variant="avatar"
        priority={priority}
        className={`${box} shrink-0 rounded-full object-cover ring-2 ring-surface`}
      />
    );
  }
  return (
    <div
      className={`${box} flex shrink-0 items-center justify-center rounded-full bg-accent/15 font-bold text-accent ${
        size === "sm" ? "text-[11px]" : "text-sm sm:text-base"
      }`}
    >
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

/**
 * F060 — linha de crédito da listagem: avatar pequeno, autor, space e data
 * em uma linha só, para o título passar a mandar no card.
 */
function CreditLine({
  post,
  name,
  avatarUrl,
  showSpace,
  pinned,
  priorityAvatar,
}: {
  post: PostCardData;
  name: string;
  avatarUrl: string | null | undefined;
  showSpace: boolean;
  pinned: boolean;
  priorityAvatar: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <Avatar name={name} url={avatarUrl} priority={priorityAvatar} size="sm" />
      <p className="min-w-0 truncate text-sm text-muted">
        <span className="font-semibold text-foreground">{name}</span>
        {showSpace ? (
          <>
            {" em "}
            <span className="font-medium text-accent/90">
              {post.space.name}
            </span>
          </>
        ) : null}
        {" · "}
        {formatDate(post.createdAt)}
      </p>
      {pinned ? (
        <span className="shrink-0 rounded-md bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
          Fixado
        </span>
      ) : null}
    </div>
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
        onClick={() => router.push(href)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            router.push(href);
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
                <MetaLine post={post} showSpace={showSpace} pinned={pinned} />
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
              <h2 className="post-card-title mt-3">{title}</h2>
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

            <div className="post-stat-row mt-3">
              <PostStat
                icon={<CommentIcon />}
                count={post.commentCount}
                label={post.commentCount === 1 ? "comentário" : "comentários"}
              />
              <PostStat
                icon={<EyeIcon />}
                count={post.viewCount}
                label={post.viewCount === 1 ? "leitura" : "leituras"}
              />
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
        className="block cursor-pointer p-5 pb-4 transition-colors hover:bg-surface/40"
      >
        <CreditLine
          post={post}
          name={name}
          avatarUrl={avatarUrl}
          showSpace={showSpace}
          pinned={pinned}
          priorityAvatar={priorityAvatar}
        />

        <h2 className="post-card-title mt-3 line-clamp-3">{title}</h2>
        {preview && preview !== title ? (
          <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-muted md:text-base">
            {preview}
          </p>
        ) : null}

        {post.imageUrl ? (
          <OptimizedMediaImage
            src={post.imageUrl}
            variant="feed"
            priority={priorityMedia}
            className="mt-4 max-h-40 w-full rounded-xl object-cover"
          />
        ) : null}
        {!post.imageUrl &&
        post.linkUrl &&
        !post.linkUrl.startsWith("builders-club://") ? (
          <p className="mt-2 truncate text-xs font-medium text-accent">
            {post.linkUrl}
          </p>
        ) : null}
      </Link>

      <div className="flex items-center gap-4 border-t border-border/70 px-5 py-2.5">
        <div className="post-stat-row">
          <ReactionButton
            postId={post.id}
            liked={liked}
            reactionCount={post.reactionCount}
            isPaid={isPaid}
          />
          <PostStat
            icon={<CommentIcon />}
            count={post.commentCount}
            label={post.commentCount === 1 ? "comentário" : "comentários"}
          />
          <PostStat
            icon={<EyeIcon />}
            count={post.viewCount}
            label={post.viewCount === 1 ? "leitura" : "leituras"}
          />
        </div>
        <div className="ml-auto shrink-0">
          <PostShareMenu postId={post.id} />
        </div>
      </div>

      {canManage ? (
        <div className="border-t border-border/60 px-5 py-3">{actions}</div>
      ) : null}
    </article>
  );
}
