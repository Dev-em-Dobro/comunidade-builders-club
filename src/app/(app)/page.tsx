import Link from "next/link";
import { redirect } from "next/navigation";
import { requireActiveMemberOrRedirect } from "@/lib/membership/require-member";
import { listPosts } from "@/lib/posts";
import { AppShell } from "@/components/app-shell";
import { PostCard } from "@/components/post-card";
import { EmptyState } from "@/components/empty-state";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function HomePage({ searchParams }: Props) {
  const member = await requireActiveMemberOrRedirect();

  const { error } = await searchParams;
  if (error) redirect("/");

  const { posts } = await listPosts({});

  return (
    <AppShell
      userId={member.user.id}
      isAdmin={member.membership.role === "admin"}
      displayName={member.profile.displayName}
    >
      <div className="feed-wrap">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="page-title">Feed</h1>
            <p className="mt-1.5 text-sm text-muted">
              Conversas de todos os spaces.{" "}
              <Link
                href="/busca"
                className="font-medium text-accent hover:underline"
              >
                Buscar
              </Link>
            </p>
          </div>
          <Link href="/nova" className="btn-primary text-sm md:hidden">
            Nova publicação
          </Link>
        </div>

        <div className="mt-8 space-y-3">
          {posts.length === 0 ? (
            <EmptyState
              title="Nenhum post ainda"
              description="Seja o primeiro a compartilhar algo com a comunidade — use Nova publicação no menu."
            />
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      </div>
    </AppShell>
  );
}
