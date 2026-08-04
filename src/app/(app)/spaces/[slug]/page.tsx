import Link from "next/link";
import { notFound } from "next/navigation";
import { requireActiveMemberOrRedirect } from "@/lib/membership/require-member";
import { getSpaceBySlug } from "@/lib/spaces";
import { listPosts } from "@/lib/posts";
import { WELCOME_SPACE_SLUG } from "@/lib/spaces/constants";
import { AppShell } from "@/components/app-shell";
import { FeedList } from "@/components/feed-list";
import { WelcomeSpaceView } from "@/components/welcome-space-view";
import { EmptyState } from "@/components/empty-state";

type Props = { params: Promise<{ slug: string }> };

export default async function SpacePage({ params }: Props) {
  const { slug } = await params;
  const member = await requireActiveMemberOrRedirect();

  const space = await getSpaceBySlug(slug);
  if (!space) notFound();

  const { posts } = await listPosts({ spaceId: space.id, take: 40 });
  const isAdmin = member.membership.role === "admin";

  if (slug === WELCOME_SPACE_SLUG) {
    return (
      <AppShell
        userId={member.user.id}
        isAdmin={isAdmin}
        displayName={member.profile.displayName}
      >
        <WelcomeSpaceView
          spaceName={space.name}
          spaceDescription={space.description}
          isAdmin={isAdmin}
          posts={posts.map((p) => ({
            id: p.id,
            title: p.title,
            body: p.body,
            imageUrl: p.imageUrl,
            reactionCount: p.reactionCount,
            commentCount: p.commentCount,
            authorName: p.author.profile?.displayName ?? "Membro",
            avatarUrl: p.author.profile?.avatarUrl ?? null,
            createdAt: p.createdAt.toISOString(),
          }))}
        />
      </AppShell>
    );
  }

  return (
    <AppShell
      userId={member.user.id}
      isAdmin={isAdmin}
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

        <div className="mt-8">
          {posts.length === 0 ? (
            <EmptyState
              title="Nenhum post neste space"
              description="Comece a conversa — use Nova publicação no menu."
            />
          ) : (
            <FeedList
              posts={posts}
              showSpace={false}
              isAdmin={isAdmin}
              currentUserId={member.user.id}
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}
