import Link from "next/link";
import { redirect } from "next/navigation";
import { requireActiveMemberOrRedirect } from "@/lib/membership/require-member";
import { listPosts } from "@/lib/posts";
import { WELCOME_SPACE_SLUG } from "@/lib/spaces/constants";
import { AppShell } from "@/components/app-shell";
import { FeedList } from "@/components/feed-list";
import { EmptyState } from "@/components/empty-state";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function HomePage({ searchParams }: Props) {
  const member = await requireActiveMemberOrRedirect();

  const { error } = await searchParams;
  if (error) redirect("/");

  const { posts } = await listPosts({
    excludeSpaceSlugs: [WELCOME_SPACE_SLUG],
    take: 40,
  });
  const isAdmin = member.membership.role === "admin";

  return (
    <AppShell
      userId={member.user.id}
      isAdmin={isAdmin}
      displayName={member.profile.displayName}
    >
      <div className="feed-wrap">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="page-title">Feed</h1>
            <p className="mt-1.5 text-sm text-muted">
              Timeline da comunidade.{" "}
              <Link
                href="/busca"
                className="font-medium text-accent hover:underline"
              >
                Buscar
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8">
          {posts.length === 0 ? (
            <EmptyState
              title="Nenhum post ainda"
              description="Seja o primeiro a compartilhar algo com a comunidade — use o botão Nova publicação."
            />
          ) : (
            <FeedList
              posts={posts}
              isAdmin={isAdmin}
              currentUserId={member.user.id}
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}
