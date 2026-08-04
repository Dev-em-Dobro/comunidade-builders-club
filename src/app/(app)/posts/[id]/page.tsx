import Link from "next/link";
import { notFound } from "next/navigation";
import { requireActiveMemberOrRedirect } from "@/lib/membership/require-member";
import { getPost, recordPostView } from "@/lib/posts";
import { AppShell } from "@/components/app-shell";
import { PostDetailContent } from "@/components/post-detail-content";
import { previewFromBody } from "@/lib/posts/title";
import type { PostDetailDto } from "@/actions/post-detail";

type Props = { params: Promise<{ id: string }> };

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const member = await requireActiveMemberOrRedirect();

  const post = await getPost(id);
  if (!post) notFound();

  const viewCount =
    (await recordPostView(post.id, member.user.id)) ?? post.viewCount;

  const isAdmin = member.membership.role === "admin";
  const dto: PostDetailDto = {
    id: post.id,
    title: post.title,
    body: post.body,
    imageUrl: post.imageUrl,
    pinnedAt: post.pinnedAt?.toISOString() ?? null,
    commentCount: post.commentCount,
    reactionCount: post.reactionCount,
    viewCount,
    createdAt: post.createdAt.toISOString(),
    space: { slug: post.space.slug, name: post.space.name },
    authorName: post.author.profile?.displayName ?? "Membro",
    avatarUrl: post.author.profile?.avatarUrl ?? null,
    liked: post.reactions.some((r) => r.userId === member.user.id),
    comments: post.comments.map((c) => ({
      id: c.id,
      body: c.body,
      createdAt: c.createdAt.toISOString(),
      authorName: c.author.profile?.displayName ?? "Membro",
      avatarUrl: c.author.profile?.avatarUrl ?? null,
      replies: c.replies.map((r) => ({
        id: r.id,
        body: r.body,
        createdAt: r.createdAt.toISOString(),
        authorName: r.author.profile?.displayName ?? "Membro",
        avatarUrl: r.author.profile?.avatarUrl ?? null,
      })),
    })),
  };

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
        <div className="mt-4">
          <h1 className="sr-only">{title}</h1>
          <PostDetailContent post={dto} isAdmin={isAdmin} />
        </div>
      </div>
    </AppShell>
  );
}
