import { notFound } from "next/navigation";
import { requireActiveMemberOrRedirect } from "@/lib/membership/require-member";
import { getSpaceBySlug, listSpaces } from "@/lib/spaces";
import { listPosts } from "@/lib/posts";
import { AppShell } from "@/components/app-shell";
import { Composer } from "@/components/composer";
import { PostCard } from "@/components/post-card";

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
      <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold">
        {space.name}
      </h1>
      {space.description ? (
        <p className="mt-1 text-sm text-muted">{space.description}</p>
      ) : null}

      <div className="mt-6 space-y-4">
        <Composer spaces={spaces} defaultSpaceId={space.id} />
        {posts.map((post) => (
          <PostCard key={post.id} post={post} showSpace={false} />
        ))}
      </div>
    </AppShell>
  );
}
