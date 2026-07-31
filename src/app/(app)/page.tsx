import Link from "next/link";
import { redirect } from "next/navigation";
import { requireActiveMemberOrRedirect } from "@/lib/membership/require-member";
import { listPosts } from "@/lib/posts";
import { listSpaces } from "@/lib/spaces";
import { AppShell } from "@/components/app-shell";
import { Composer } from "@/components/composer";
import { PostCard } from "@/components/post-card";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function HomePage({ searchParams }: Props) {
  const member = await requireActiveMemberOrRedirect();

  // Magic link reusado/expirado com sessão já válida → limpa ?error= da URL
  const { error } = await searchParams;
  if (error) redirect("/");

  const [spaces, { posts }] = await Promise.all([listSpaces(), listPosts({})]);

  return (
    <AppShell
      userId={member.user.id}
      isAdmin={member.membership.role === "admin"}
      displayName={member.profile.displayName}
    >
      <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold tracking-tight">
        Feed
      </h1>
      <p className="mt-1 text-sm text-muted">
        Conversas de todos os spaces.{" "}
        <Link href="/busca" className="text-accent hover:underline">
          Buscar
        </Link>
      </p>

      <div className="mt-6 space-y-4">
        <Composer spaces={spaces} />
        {posts.length === 0 ? (
          <p className="text-sm text-muted">Nenhum post ainda. Seja o primeiro!</p>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </AppShell>
  );
}
