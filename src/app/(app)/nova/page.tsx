import Link from "next/link";
import { requireActiveMemberOrRedirect } from "@/lib/membership/require-member";
import { listSpaces } from "@/lib/spaces";
import { Composer } from "@/components/composer";

type Props = { searchParams: Promise<{ space?: string }> };

export default async function NovaPublicacaoPage({ searchParams }: Props) {
  const [, spaces, sp] = await Promise.all([
    requireActiveMemberOrRedirect(),
    listSpaces(),
    searchParams,
  ]);
  const defaultSpaceId =
    spaces.find((s) => s.slug === sp.space)?.id ?? spaces[0]?.id;

  return (
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
  );
}
