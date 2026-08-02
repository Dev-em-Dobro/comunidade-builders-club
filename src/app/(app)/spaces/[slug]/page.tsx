import Link from "next/link";
import { notFound } from "next/navigation";
import { requireActiveMemberOrRedirect } from "@/lib/membership/require-member";
import { getSpaceBySlug } from "@/lib/spaces";
import { listPosts } from "@/lib/posts";
import { AppShell } from "@/components/app-shell";
import { PostCard } from "@/components/post-card";
import { EmptyState } from "@/components/empty-state";

type Props = { params: Promise<{ slug: string }> };

export default async function SpacePage({ params }: Props) {
  const { slug } = await params;
  const member = await requireActiveMemberOrRedirect();

  const space = await getSpaceBySlug(slug);
  if (!space) notFound();

  const { posts } = await listPosts({ spaceId: space.id });

  return (
    <AppShell
      userId={member.user.id}
      isAdmin={member.membership.role === "admin"}
      displayName={member.profile.displayName}
    >
      <div className="feed-wrap">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="page-title">{space.name}</h1>
            {space.description ? (
              <p className="mt-1.5 text-sm text-muted">{space.description}</p>
            ) : null}
          </div>
          <Link
            href={`/nova?space=${space.slug}`}
            className="btn-primary text-sm md:hidden"
          >
            Nova publicação
          </Link>
        </div>

        <div className="mt-8 space-y-3">
          {posts.length === 0 ? (
            <EmptyState
              title="Nenhum post neste space"
              description="Comece a conversa — use Nova publicação no menu."
            />
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} showSpace={false} />
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
