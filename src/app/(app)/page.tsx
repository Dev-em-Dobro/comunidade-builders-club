import Link from "next/link";
import { redirect } from "next/navigation";
import { requireActiveMemberOrRedirect } from "@/lib/membership/require-member";
import { listPosts } from "@/lib/posts";
import { listSpaces } from "@/lib/spaces";
import { AppShell } from "@/components/app-shell";
import { Composer } from "@/components/composer";
import { PostCard } from "@/components/post-card";
import { EmptyState } from "@/components/empty-state";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function HomePage({ searchParams }: Props) {
  const member = await requireActiveMemberOrRedirect();

  const { error } = await searchParams;
  if (error) redirect("/");

  const [spaces, { posts }] = await Promise.all([listSpaces(), listPosts({})]);

  return (
    <AppShell
      userId={member.user.id}
      isAdmin={member.membership.role === "admin"}
      displayName={member.profile.displayName}
    >
      <div className="feed-wrap">
        <h1 className="page-title">Feed</h1>
        <p className="mt-1.5 text-sm text-muted">
          Conversas de todos os spaces.{" "}
          <Link href="/busca" className="font-medium text-accent hover:underline">
            Buscar
          </Link>
        </p>

        <div className="mt-8 space-y-4">
          <Composer spaces={spaces} />
          {posts.length === 0 ? (
            <EmptyState
              title="Nenhum post ainda"
              description="Seja o primeiro a compartilhar algo com a comunidade — uma dúvida, conquista ou ideia."
            />
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      </div>
    </AppShell>
  );
}
