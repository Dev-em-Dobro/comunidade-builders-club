import Link from "next/link";
import { requireActiveMemberOrRedirect } from "@/lib/membership/require-member";
import { listSpaces } from "@/lib/spaces";
import { WELCOME_SPACE_SLUG } from "@/lib/spaces/constants";
import { Composer } from "@/components/composer";

type Props = { searchParams: Promise<{ space?: string }> };

export default async function NovaPublicacaoPage({ searchParams }: Props) {
  const [member, allSpaces, sp] = await Promise.all([
    requireActiveMemberOrRedirect(),
    listSpaces(),
    searchParams,
  ]);
  const isAdmin = member.membership.role === "admin";
  const spaces = isAdmin
    ? allSpaces
    : allSpaces.filter((s) => s.slug !== WELCOME_SPACE_SLUG);

  const preferredSlug = sp.space;
  const defaultSpaceId =
    spaces.find((s) => s.slug === preferredSlug)?.id ??
    spaces.find((s) => s.slug !== WELCOME_SPACE_SLUG)?.id ??
    spaces[0]?.id;

  return (
    <div className="feed-wrap">
      <Link href="/" className="cursor-pointer text-sm font-medium text-accent hover:underline">
        ← Voltar ao feed
      </Link>
      <h1 className="page-title mt-4">Nova publicação</h1>
      <p className="mt-1.5 text-sm text-muted">
        Escolha o space e escreva. O título aparece no feed automaticamente.
        {!isAdmin ? (
          <> O space Boas-vindas é reservado à equipe.</>
        ) : null}
      </p>
      <div className="mt-8">
        {spaces.length === 0 ? (
          <p className="text-sm text-muted">Nenhum space disponível para publicar.</p>
        ) : (
          <Composer spaces={spaces} defaultSpaceId={defaultSpaceId} />
        )}
      </div>
    </div>
  );
}
