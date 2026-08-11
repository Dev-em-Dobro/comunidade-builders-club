import Link from "next/link";
import { redirect } from "next/navigation";
import { requireActiveMemberOrRedirect } from "@/lib/membership/require-member";
import { listPosts } from "@/lib/posts";
import {
  FREE_SPACE_SLUGS,
  isPaidMembership,
} from "@/lib/membership/capabilities";
import { WELCOME_SPACE_SLUG } from "@/lib/spaces/constants";
import { FeedList } from "@/components/feed-list";
import { EmptyState } from "@/components/empty-state";

type Props = { searchParams: Promise<{ error?: string; upgrade?: string }> };

export default async function HomePage({ searchParams }: Props) {
  const member = await requireActiveMemberOrRedirect();

  const { error } = await searchParams;
  if (error) redirect("/");

  const isPaid = isPaidMembership(member.membership);
  // Free: feed só com Geral + Avisos (Boas-vindas fica no space próprio).
  const freeFeedSlugs = FREE_SPACE_SLUGS.filter((s) => s !== WELCOME_SPACE_SLUG);

  const { posts } = await listPosts({
    excludeSpaceSlugs: isPaid
      ? [WELCOME_SPACE_SLUG, "aula-threads"]
      : undefined,
    includeSpaceSlugs: isPaid ? undefined : [...freeFeedSlugs],
    viewerId: member.user.id,
    take: 30,
  });
  const isAdmin = member.membership.role === "admin";

  return (
    <div className="feed-wrap">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Feed</h1>
          <p className="mt-1.5 text-sm text-muted">
            {isPaid ? (
              <>
                Timeline da comunidade.{" "}
                <Link
                  href="/busca"
                  className="font-medium text-accent hover:underline"
                >
                  Buscar
                </Link>
              </>
            ) : (
              <>
                Plano gratuito: você vê Geral e Avisos.{" "}
                <Link
                  href="/?upgrade=1"
                  className="font-medium text-accent hover:underline"
                >
                  Desbloquear tudo
                </Link>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="mt-8">
        {posts.length === 0 ? (
          <EmptyState
            title="Nenhum post ainda"
            description={
              isPaid
                ? "Seja o primeiro a compartilhar algo com a comunidade — use o botão Nova publicação."
                : "Ainda não há publicações nos spaces liberados do plano gratuito."
            }
          />
        ) : (
          <FeedList
            posts={posts}
            isAdmin={isAdmin}
            isPaid={isPaid}
            currentUserId={member.user.id}
          />
        )}
      </div>
    </div>
  );
}
