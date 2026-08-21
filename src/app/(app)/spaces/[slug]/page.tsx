import { notFound, redirect } from "next/navigation";
import { requireActiveMemberOrRedirect } from "@/lib/membership/require-member";
import {
  isFreeSpaceSlug,
  isPaidMembership,
} from "@/lib/membership/capabilities";
import { getSpaceBySlug } from "@/lib/spaces";
import { listPosts } from "@/lib/posts";
import { markWelcomeSeen } from "@/lib/profile";
import {
  WELCOME_SPACE_SLUG,
  WELCOME_TUTORIAL_VIDEO,
} from "@/lib/spaces/constants";
import { pandaEmbedUrl } from "@/lib/aulas";
import { FeedList } from "@/components/feed-list";
import { WelcomeSpaceView } from "@/components/welcome-space-view";
import { EmptyState } from "@/components/empty-state";

type Props = { params: Promise<{ slug: string }> };

export default async function SpacePage({ params }: Props) {
  const { slug } = await params;
  const [member, space] = await Promise.all([
    requireActiveMemberOrRedirect(),
    getSpaceBySlug(slug),
  ]);
  if (!space) notFound();

  const isPaid = isPaidMembership(member.membership);
  if (!isPaid && !isFreeSpaceSlug(slug)) {
    redirect("/?upgrade=1");
  }

  if (slug === WELCOME_SPACE_SLUG && !member.profile.welcomeSeenAt) {
    await markWelcomeSeen(member.user.id);
  }

  const { posts } = await listPosts({
    spaceId: space.id,
    viewerId: member.user.id,
    take: 30,
  });
  const isAdmin = member.membership.role === "admin";

  if (slug === WELCOME_SPACE_SLUG) {
    let tutorialEmbedUrl: string | null = null;
    try {
      tutorialEmbedUrl = pandaEmbedUrl(
        WELCOME_TUTORIAL_VIDEO.pandaLibraryId,
        WELCOME_TUTORIAL_VIDEO.pandaVideoExternalId,
      );
    } catch {
      tutorialEmbedUrl = null;
    }

    return (
      <WelcomeSpaceView
        spaceName={space.name}
        spaceDescription={space.description}
        isAdmin={isAdmin}
        isPaid={isPaid}
        currentUserId={member.user.id}
        tutorialEmbedUrl={tutorialEmbedUrl}
        tutorialTitle={WELCOME_TUTORIAL_VIDEO.title}
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
    );
  }

  return (
    <div className="feed-wrap">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">{space.name}</h1>
          {space.description ? (
            <p className="mt-1.5 text-sm text-muted">{space.description}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-8">
        {posts.length === 0 ? (
          <EmptyState
            title="Nenhum post neste space"
            description={
              isPaid
                ? "Comece a conversa — use o botão Nova publicação."
                : "Ainda não há publicações aqui."
            }
          />
        ) : (
          <FeedList
            posts={posts}
            showSpace={false}
            isAdmin={isAdmin}
            isPaid={isPaid}
            currentUserId={member.user.id}
          />
        )}
      </div>
    </div>
  );
}
