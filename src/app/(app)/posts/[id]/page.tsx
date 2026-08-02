import { notFound } from "next/navigation";
import Link from "next/link";
import { requireActiveMemberOrRedirect } from "@/lib/membership/require-member";
import { getPost, recordPostView } from "@/lib/posts";
import { AppShell } from "@/components/app-shell";
import {
  CommentForm,
  DeleteCommentButton,
  PostActions,
  ReplyToggle,
} from "@/components/post-actions";
import { EmptyState } from "@/components/empty-state";
import { MarkdownBody } from "@/lib/markdown";
import { previewFromBody } from "@/lib/posts/title";

type Props = { params: Promise<{ id: string }> };

function CommentBlock({
  comment,
  postId,
  isAdmin,
  nested = false,
}: {
  comment: {
    id: string;
    body: string;
    createdAt: Date;
    author: {
      profile: { displayName: string; avatarUrl: string | null } | null;
    };
    replies?: Array<{
      id: string;
      body: string;
      createdAt: Date;
      author: {
        profile: { displayName: string; avatarUrl: string | null } | null;
      };
    }>;
  };
  postId: string;
  isAdmin: boolean;
  nested?: boolean;
}) {
  const name = comment.author.profile?.displayName ?? "Membro";
  return (
    <li className={`post-card !p-4 ${nested ? "ml-6 !bg-surface/40" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{name}</p>
          <div className="mt-1.5 text-sm leading-relaxed">
            <MarkdownBody
              body={comment.body}
              className="space-y-1 text-sm leading-relaxed [&_p]:my-0"
            />
          </div>
          <p className="mt-2 text-xs text-muted">
            {comment.createdAt.toLocaleString("pt-BR")}
          </p>
          {!nested ? <ReplyToggle postId={postId} parentId={comment.id} /> : null}
        </div>
        {isAdmin ? (
          <DeleteCommentButton commentId={comment.id} postId={postId} />
        ) : null}
      </div>
      {comment.replies && comment.replies.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {comment.replies.map((r) => (
            <CommentBlock
              key={r.id}
              comment={r}
              postId={postId}
              isAdmin={isAdmin}
              nested
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const member = await requireActiveMemberOrRedirect();

  const post = await getPost(id);
  if (!post) notFound();

  const viewCount =
    (await recordPostView(post.id, member.user.id)) ?? post.viewCount;

  const liked = post.reactions.some((r) => r.userId === member.user.id);
  const isAdmin = member.membership.role === "admin";
  const authorName = post.author.profile?.displayName ?? "Membro";
  const avatarUrl = post.author.profile?.avatarUrl;
  const title =
    post.title?.trim() || previewFromBody(post.body, 90) || "Publicação";

  return (
    <AppShell
      userId={member.user.id}
      isAdmin={isAdmin}
      displayName={member.profile.displayName}
    >
      <div className="feed-wrap">
        <Link
          href={`/spaces/${post.space.slug}`}
          className="text-sm font-medium text-accent hover:underline"
        >
          ← {post.space.name}
        </Link>
        <article className="post-card mt-4">
          <div className="flex gap-3">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt=""
                className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-surface"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent">
                {authorName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{authorName}</p>
              <p className="mt-0.5 text-xs text-muted">
                {post.space.name} · {post.createdAt.toLocaleString("pt-BR")}
                {post.pinnedAt ? " · Fixado" : ""}
                {" · "}
                {viewCount} {viewCount === 1 ? "leitura" : "leituras"}
              </p>
              <h1 className="mt-4 font-[family-name:var(--font-outfit)] text-2xl font-bold tracking-tight">
                {title}
              </h1>
              <div className="mt-4">
                <MarkdownBody body={post.body} />
              </div>
              {post.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.imageUrl}
                  alt=""
                  className="mt-3 max-h-96 w-full rounded-xl object-cover"
                />
              ) : null}
              <PostActions
                postId={post.id}
                spaceSlug={post.space.slug}
                liked={liked}
                reactionCount={post.reactionCount}
                isAdmin={isAdmin}
                pinned={!!post.pinnedAt}
              />
            </div>
          </div>
        </article>

        <section className="mt-10">
          <h2 className="font-[family-name:var(--font-outfit)] text-lg font-semibold">
            Comentários ({post.commentCount})
          </h2>
          <CommentForm postId={post.id} />
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
                />
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}
