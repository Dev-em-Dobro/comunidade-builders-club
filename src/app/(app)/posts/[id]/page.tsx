import { notFound } from "next/navigation";
import { requireActiveMemberOrRedirect } from "@/lib/membership/require-member";
import { getPost } from "@/lib/posts";
import { AppShell } from "@/components/app-shell";
import {
  CommentForm,
  DeleteCommentButton,
  PostActions,
} from "@/components/post-actions";
import { EmptyState } from "@/components/empty-state";

type Props = { params: Promise<{ id: string }> };

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const member = await requireActiveMemberOrRedirect();

  const post = await getPost(id);
  if (!post) notFound();

  const liked = post.reactions.some((r) => r.userId === member.user.id);
  const isAdmin = member.membership.role === "admin";
  const authorName = post.author.profile?.displayName ?? "Membro";
  const avatarUrl = post.author.profile?.avatarUrl;

  return (
    <AppShell
      userId={member.user.id}
      isAdmin={isAdmin}
      displayName={member.profile.displayName}
    >
      <div className="feed-wrap">
        <article className="post-card">
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
              </p>
              <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed">
                {post.body}
              </p>
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
                <li key={c.id} className="post-card !p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">
                        {c.author.profile?.displayName ?? "Membro"}
                      </p>
                      <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed">
                        {c.body}
                      </p>
                      <p className="mt-2 text-xs text-muted">
                        {c.createdAt.toLocaleString("pt-BR")}
                      </p>
                    </div>
                    {isAdmin ? (
                      <DeleteCommentButton commentId={c.id} postId={post.id} />
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}
