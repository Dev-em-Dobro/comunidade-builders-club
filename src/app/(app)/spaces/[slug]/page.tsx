import { notFound } from "next/navigation";
import { requireActiveMemberOrRedirect } from "@/lib/membership/require-member";
import { getSpaceBySlug, listSpaces } from "@/lib/spaces";
import { listPosts } from "@/lib/posts";
import { AppShell } from "@/components/app-shell";
import { Composer } from "@/components/composer";
import { PostCard } from "@/components/post-card";
import { EmptyState } from "@/components/empty-state";

type Props = { params: Promise<{ slug: string }> };

export default async function SpacePage({ params }: Props) {
  const { slug } = await params;
  const member = await requireActiveMemberOrRedirect();

  const space = await getSpaceBySlug(slug);
  if (!space) notFound();

  const [spaces, { posts }] = await Promise.all([
    listSpaces(),
    listPosts({ spaceId: space.id }),
  ]);

  return (
    <AppShell
      userId={member.user.id}
      isAdmin={member.membership.role === "admin"}
      displayName={member.profile.displayName}
    >
      <div className="feed-wrap">
        <h1 className="page-title">{space.name}</h1>
        {space.description ? (
          <p className="mt-1.5 text-sm text-muted">{space.description}</p>
        ) : null}

        <div className="mt-8 space-y-4">
          <Composer spaces={spaces} defaultSpaceId={space.id} />
          {posts.length === 0 ? (
            <EmptyState
              title="Nenhum post neste space"
              description="Comece a conversa — publique a primeira mensagem aqui."
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
