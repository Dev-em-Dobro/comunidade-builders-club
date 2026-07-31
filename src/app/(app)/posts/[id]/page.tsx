import { notFound } from "next/navigation";
import { requireActiveMemberOrRedirect } from "@/lib/membership/require-member";
import { getPost } from "@/lib/posts";
import { AppShell } from "@/components/app-shell";
import {
  CommentForm,
  DeleteCommentButton,
  PostActions,
} from "@/components/post-actions";

type Props = { params: Promise<{ id: string }> };

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const member = await requireActiveMemberOrRedirect();

  const post = await getPost(id);
  if (!post) notFound();

  const liked = post.reactions.some((r) => r.userId === member.user.id);
  const isAdmin = member.membership.role === "admin";
  const authorName = post.author.profile?.displayName ?? "Membro";

  return (
    <AppShell
      userId={member.user.id}
      isAdmin={isAdmin}
      displayName={member.profile.displayName}
    >
      <article className="post-card">
        <p className="text-sm font-semibold">{authorName}</p>
        <p className="text-xs text-muted">
          {post.space.name} ·{" "}
          {post.createdAt.toLocaleString("pt-BR")}
          {post.pinnedAt ? " · Fixado" : ""}
        </p>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">
          {post.body}
        </p>
        {post.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.imageUrl}
            alt=""
            className="mt-3 max-h-96 w-full rounded-lg object-cover"
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
      </article>

      <section className="mt-8">
        <h2 className="font-[family-name:var(--font-outfit)] text-lg font-semibold">
          Comentários ({post.commentCount})
        </h2>
        <CommentForm postId={post.id} />
        <ul className="mt-4 space-y-3">
          {post.comments.map((c) => (
            <li key={c.id} className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">
                    {c.author.profile?.displayName ?? "Membro"}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm">{c.body}</p>
                  <p className="mt-1 text-xs text-muted">
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
      </section>
    </AppShell>
  );
}
