import Link from "next/link";
import { requireActiveMemberOrRedirect } from "@/lib/membership/require-member";
import { listSpaces } from "@/lib/spaces";
import { AppShell } from "@/components/app-shell";
import { Composer } from "@/components/composer";

type Props = { searchParams: Promise<{ space?: string }> };

export default async function NovaPublicacaoPage({ searchParams }: Props) {
  const member = await requireActiveMemberOrRedirect();
  const { space: spaceSlug } = await searchParams;
  const spaces = await listSpaces();
  const defaultSpaceId =
    spaces.find((s) => s.slug === spaceSlug)?.id ?? spaces[0]?.id;

  return (
    <AppShell
      userId={member.user.id}
      isAdmin={member.membership.role === "admin"}
      displayName={member.profile.displayName}
    >
      <div className="feed-wrap">
        <Link href="/" className="text-sm font-medium text-accent hover:underline">
          ← Voltar ao feed
        </Link>
        <h1 className="page-title mt-4">Nova publicação</h1>
        <p className="mt-1.5 text-sm text-muted">
          Escolha o space e escreva. O título aparece no feed automaticamente.
        </p>
        <div className="mt-8">
          <Composer spaces={spaces} defaultSpaceId={defaultSpaceId} />
        </div>
      </div>
    </AppShell>
  );
}
