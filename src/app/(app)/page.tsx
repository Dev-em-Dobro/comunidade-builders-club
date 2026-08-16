import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { requireActiveMemberOrRedirect } from "@/lib/membership/require-member";
import { listPosts } from "@/lib/posts";
import { isPaidMembership } from "@/lib/membership/capabilities";
import {
  AULA_THREADS_SPACE_SLUG,
  WELCOME_SPACE_SLUG,
} from "@/lib/spaces/constants";
import { FeedList } from "@/components/feed-list";
import { EmptyState } from "@/components/empty-state";

type Props = { searchParams: Promise<{ error?: string; upgrade?: string }> };

function FeedSkeleton() {
  return (
    <div className="space-y-4 animate-pulse" aria-busy="true" aria-label="Carregando feed">
      {[0, 1].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-border bg-card p-5 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-surface" />
            <div className="h-3.5 w-32 rounded bg-surface" />
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3.5 w-full rounded bg-surface/80" />
            <div className="h-3.5 w-[70%] rounded bg-surface/70" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function HomeFeed({
  userId,
  isPaid,
  isAdmin,
}: {
  userId: string;
  isPaid: boolean;
  isAdmin: boolean;
}) {
  // F041: feed é vitrine — free vê a timeline inteira; o cadeado fica no card
  // (space pago abre modal de upgrade em vez de navegar).
  const { posts } = await listPosts({
    excludeSpaceSlugs: [WELCOME_SPACE_SLUG, AULA_THREADS_SPACE_SLUG],
    viewerId: userId,
    take: 30,
  });

  if (posts.length === 0) {
    return (
      <EmptyState
        title="Nenhum post ainda"
        description={
          isPaid
            ? "Seja o primeiro a compartilhar algo com a comunidade — use o botão Nova publicação."
            : "Ainda não há publicações na comunidade."
        }
      />
    );
  }

  return (
    <FeedList
      posts={posts}
      isAdmin={isAdmin}
      isPaid={isPaid}
      currentUserId={userId}
    />
  );
}

/**
 * LCP: o <h1>Feed</h1> é enviado assim que a auth resolve;
 * posts ficam em Suspense (não atrasam o Largest Contentful Paint).
 */
export default async function HomePage({ searchParams }: Props) {
  const member = await requireActiveMemberOrRedirect();

  const { error } = await searchParams;
  if (error) redirect("/");

  const isPaid = isPaidMembership(member.membership);
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
                Plano gratuito: leitura do feed liberada — posts marcados{" "}
                <span className="font-medium text-accent/90">Membros</span> abrem
                no acesso completo.{" "}
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
        <Suspense fallback={<FeedSkeleton />}>
          <HomeFeed
            userId={member.user.id}
            isPaid={isPaid}
            isAdmin={isAdmin}
          />
        </Suspense>
      </div>
    </div>
  );
}
