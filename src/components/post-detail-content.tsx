"use client";

import {
  CommentForm,
  DeleteCommentButton,
  PostActions,
  ReplyToggle,
} from "@/components/post-actions";
import { EmptyState } from "@/components/empty-state";
import { MarkdownBody } from "@/lib/markdown";
import { previewFromBody } from "@/lib/posts/title";
import { OptimizedMediaImage } from "@/components/optimized-media-image";
import { PostMedia } from "@/components/post-media";
import { PostShareMenu } from "@/components/post-share-menu";
import type { PostDetailDto } from "@/actions/post-detail";

function CommentBlock({
  comment,
  postId,
  isAdmin,
  isPaid = true,
  nested = false,
  onCommentDone,
}: {
  comment: PostDetailDto["comments"][number] | PostDetailDto["comments"][number]["replies"][number];
  postId: string;
  isAdmin: boolean;
  isPaid?: boolean;
  nested?: boolean;
  onCommentDone?: () => void;
}) {
  const replies = "replies" in comment ? comment.replies : undefined;
  return (
    <li className={`post-card !p-4 ${nested ? "ml-6 !bg-surface/40" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{comment.authorName}</p>
          <div className="mt-1.5 text-sm leading-relaxed">
            <MarkdownBody
              body={comment.body}
              className="space-y-1 text-sm leading-relaxed [&_p]:my-0"
            />
          </div>
          <p className="mt-2 text-xs text-muted">
            {new Date(comment.createdAt).toLocaleString("pt-BR")}
          </p>
          {!nested ? (
            <ReplyToggle
              postId={postId}
              parentId={comment.id}
              isPaid={isPaid}
              onDone={onCommentDone}
            />
          ) : null}
        </div>
        {isAdmin ? (
          <DeleteCommentButton commentId={comment.id} postId={postId} />
        ) : null}
      </div>
      {replies && replies.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {replies.map((r) => (
            <CommentBlock
              key={r.id}
              comment={r}
              postId={postId}
              isAdmin={isAdmin}
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
  compactHeader = false,
  onCommentDone,
}: {
  post: PostDetailDto;
  isAdmin: boolean;
  isAuthor?: boolean;
  isPaid?: boolean;
  compactHeader?: boolean;
  onCommentDone?: () => void;
}) {
  const title =
    post.title?.trim() || previewFromBody(post.body, 90) || "Publicação";

  return (
    <div>
      <article className={compactHeader ? "" : "post-card"}>
        <div className={compactHeader ? "" : "p-0"}>
          <div className="flex gap-3">
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
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{post.authorName}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {post.space.name} ·{" "}
                    {new Date(post.createdAt).toLocaleString("pt-BR")}
                    {post.pinnedAt ? " · Fixado" : ""}
                    {" · "}
                    {post.viewCount}{" "}
                    {post.viewCount === 1 ? "leitura" : "leituras"}
                  </p>
                </div>
                <PostShareMenu postId={post.id} />
              </div>
              <h2
                className={`mt-4 font-[family-name:var(--font-outfit)] font-bold tracking-tight ${
                  compactHeader ? "text-xl" : "text-2xl"
                }`}
              >
                {title}
              </h2>
              <div className="mt-4">
                <MarkdownBody body={post.body} />
              </div>
              <PostMedia
                imageUrl={post.imageUrl}
                videoUrl={post.videoUrl}
                linkUrl={post.linkUrl}
                priority
              />
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
              />
            </div>
          </div>
        </div>
      </article>

      <section className="mt-8">
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
                isPaid={isPaid}
                onCommentDone={onCommentDone}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
