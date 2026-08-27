"use client";

import {
  CommentCard,
  CommentForm,
  PostActions,
  ReactionButton,
  ReplyToggle,
} from "@/components/post-actions";
import { CommentIcon, EyeIcon, PostStat } from "@/components/post-icons";
import { EmptyState } from "@/components/empty-state";
import { MarkdownBody } from "@/lib/markdown";
import { previewFromBody } from "@/lib/posts/title";
import { OptimizedMediaImage } from "@/components/optimized-media-image";
import { PostMedia } from "@/components/post-media";
import { PostShareMenu } from "@/components/post-share-menu";
import type { PostDetailDto } from "@/actions/post-detail";
import { isCommentsDisabledSpace } from "@/lib/spaces/constants";

function CommentBlock({
  comment,
  postId,
  isAdmin,
  currentUserId,
  isPaid = true,
  nested = false,
  onCommentDone,
}: {
  comment:
    | PostDetailDto["comments"][number]
    | PostDetailDto["comments"][number]["replies"][number];
  postId: string;
  isAdmin: boolean;
  currentUserId?: string;
  isPaid?: boolean;
  nested?: boolean;
  onCommentDone?: () => void;
}) {
  const replies = "replies" in comment ? comment.replies : undefined;
  const canEdit = Boolean(
    isAdmin || (currentUserId && comment.authorId === currentUserId),
  );

  return (
    <li>
      <CommentCard
        commentId={comment.id}
        postId={postId}
        authorName={comment.authorName}
        body={comment.body}
        createdAtLabel={new Date(comment.createdAt).toLocaleString("pt-BR")}
        canEdit={canEdit}
        isAdmin={isAdmin}
        nested={nested}
        replySlot={
          <ReplyToggle
            postId={postId}
            parentId={comment.id}
            isPaid={isPaid}
            onDone={onCommentDone}
          />
        }
      />
      {replies && replies.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {replies.map((r) => (
            <CommentBlock
              key={r.id}
              comment={r}
              postId={postId}
              isAdmin={isAdmin}
              currentUserId={currentUserId}
              isPaid={isPaid}
              nested
              onCommentDone={onCommentDone}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function PostDetailContent({
  post,
  isAdmin,
  isAuthor = false,
  isPaid = true,
  currentUserId,
  compactHeader = false,
  onCommentDone,
}: {
  post: PostDetailDto;
  isAdmin: boolean;
  isAuthor?: boolean;
  isPaid?: boolean;
  currentUserId?: string;
  compactHeader?: boolean;
  onCommentDone?: () => void;
}) {
  const title =
    post.title?.trim() || previewFromBody(post.body, 90) || "Publicação";
  const commentsDisabled = isCommentsDisabledSpace(post.space.slug);

  return (
    <div>
      {/*
        F060 — ordem de artigo: título manda, autor é crédito, e o corpo
        começa na margem (sem o recuo do avatar que estreitava a leitura).
      */}
      <article>
        {/* No modal o título é h2 (a página que abriu já tem o h1). */}
        {compactHeader ? (
          <h2 className="reading-title text-xl md:text-2xl">{title}</h2>
        ) : (
          <h1 className="reading-title">{title}</h1>
        )}

        <div className="mt-5 flex items-center gap-3">
          {post.avatarUrl ? (
            <OptimizedMediaImage
              src={post.avatarUrl}
              variant="avatar"
              priority
              className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-surface"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent">
              {post.authorName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold">
              {post.authorName}
            </p>
            <p className="mt-0.5 text-sm text-muted">
              {post.space.name} ·{" "}
              {new Date(post.createdAt).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
              {post.pinnedAt ? " · Fixado" : ""}
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-4 border-y border-border/70 py-2">
          <div className="post-stat-row">
            <ReactionButton
              postId={post.id}
              liked={post.liked}
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

        <div className="mt-8">
          <MarkdownBody body={post.body} variant="reading" />
        </div>
        <PostMedia
          imageUrl={post.imageUrl}
          videoUrl={post.videoUrl}
          linkUrl={post.linkUrl}
          priority
        />
        {/* Reagir já está na barra acima — aqui sobra só a gestão. */}
        <div className="mt-6">
          <PostActions
            postId={post.id}
            spaceSlug={post.space.slug}
            liked={post.liked}
            reactionCount={post.reactionCount}
            isAdmin={isAdmin}
            isAuthor={isAuthor}
            isPaid={isPaid}
            pinned={!!post.pinnedAt}
            body={post.body}
            imageUrl={post.imageUrl}
            linkUrl={post.linkUrl}
            videoUrl={post.videoUrl}
            compact
          />
        </div>
      </article>

      {commentsDisabled ? null : (
        <section className="mt-10">
          <h3 className="font-[family-name:var(--font-outfit)] text-lg font-semibold">
            Comentários ({post.commentCount})
          </h3>
          <CommentForm postId={post.id} isPaid={isPaid} onDone={onCommentDone} />
          {post.comments.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="Nenhum comentário"
                description="Seja o primeiro a responder este post."
              />
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {post.comments.map((c) => (
                <CommentBlock
                  key={c.id}
                  comment={c}
                  postId={post.id}
                  isAdmin={isAdmin}
                  currentUserId={currentUserId}
                  isPaid={isPaid}
                  onCommentDone={onCommentDone}
                />
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
