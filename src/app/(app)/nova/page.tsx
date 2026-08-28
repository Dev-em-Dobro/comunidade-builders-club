import Link from "next/link";
import { requireActiveMemberOrRedirect } from "@/lib/membership/require-member";
import { isPaidMembership } from "@/lib/membership/capabilities";
import { listSpaces } from "@/lib/spaces";
import {
  isAdminOnlyPublishSpace,
  isFreePublishSpace,
} from "@/lib/spaces/constants";
import { Composer } from "@/components/composer";

type Props = { searchParams: Promise<{ space?: string }> };

export default async function NovaPublicacaoPage({ searchParams }: Props) {
  const [member, allSpaces, sp] = await Promise.all([
    requireActiveMemberOrRedirect(),
    listSpaces(),
    searchParams,
  ]);
  const isAdmin = member.membership.role === "admin";
  const isPaid = isPaidMembership(member.membership);
  const spaces = isAdmin
    ? allSpaces
    : isPaid
      ? allSpaces.filter((s) => !isAdminOnlyPublishSpace(s.slug))
      : allSpaces.filter((s) => isFreePublishSpace(s.slug));

  const preferredSlug = sp.space;
  const defaultSpaceId =
    spaces.find((s) => s.slug === preferredSlug)?.id ??
    spaces.find((s) => !isAdminOnlyPublishSpace(s.slug))?.id ??
    spaces[0]?.id;

  return (
    <div className="feed-wrap">
      <Link
        href="/"
        className="cursor-pointer text-sm font-medium text-accent hover:underline"
      >
        ← Voltar ao feed
      </Link>
      <h1 className="page-title mt-4">Nova publicação</h1>
      <p className="mt-1.5 text-sm text-muted">
        {isPaid ? (
          <>
            Escolha o space e escreva. O título aparece no feed automaticamente.
            {!isAdmin ? (
              <> Spaces Boas-vindas, Avisos e Presentes são reservados à equipe.</>
            ) : (
              <> Em Presentes, o slug vira a URL pública (/presentes/seu-slug).</>
            )}
          </>
        ) : (
          <>
            No plano gratuito você publica no Desafio Projetos — o primeiro
            projeto da Fase 1 para a equipe avaliar.
          </>
        )}
      </p>
      <div className="mt-8">
        {spaces.length === 0 ? (
          <p className="text-sm text-muted">
            Nenhum space disponível para publicar.
          </p>
        ) : (
          <Composer
            spaces={spaces}
            defaultSpaceId={defaultSpaceId}
            isAdmin={isAdmin}
          />
        )}
      </div>
    </div>
  );
}
