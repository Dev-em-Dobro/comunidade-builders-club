import { notFound, redirect } from "next/navigation";
import { requireActiveMemberOrRedirect } from "@/lib/membership/require-member";
import {
  isPaidMembership,
  isRestritoMembership,
} from "@/lib/membership/capabilities";
import { entradaContaRestrita } from "@/lib/membership/restrito";
import { AULAS_FREE_HREF } from "@/lib/aulas/access";
import { listCompletedLessonIds, listPurchasedModuleIds } from "@/lib/aulas";
import { listPublishedModules } from "@/lib/aulas/published-modules";
import { EmptyState } from "@/components/empty-state";
import { AulaBreadcrumb } from "@/components/aula-breadcrumb";
import {
  findModuleBySlug,
  findModulePath,
  flattenLessons,
  mapModule,
} from "@/components/aulas-catalog";

type Props = {
  params: Promise<{ moduleSlug: string }>;
};

export default async function AulasModulePage({ params }: Props) {
  const { moduleSlug } = await params;
  const member = await requireActiveMemberOrRedirect({ restritoOk: true });
  const isPaid = isPaidMembership(member.membership);
  const restrito = isRestritoMembership(member.membership);
  const [modules, completed, purchased] = await Promise.all([
    listPublishedModules(),
    listCompletedLessonIds(member.user.id),
    listPurchasedModuleIds({ email: member.user.email, isPaid }),
  ]);

  // F126 — compra avulsa vira `freeAccess` no card; o gate abaixo já lê isso.
  const catalog = modules.map((mod) =>
    mapModule(mod, completed, false, purchased, restrito),
  );
  const mod = findModuleBySlug(catalog, moduleSlug);
  if (!mod) notFound();

  const first = flattenLessons(mod)[0];
  // F128 — o card já traz o que vale para esta conta (gratuito, comprado ou
  // nenhum dos dois, no caso da restrita). Conta restrita volta para a entrada
  // dela; se a entrada for esta mesma página, cai em Aulas.
  if (first && !isPaid && !mod.freeAccess) {
    if (!restrito) redirect(AULAS_FREE_HREF);
    const entrada = await entradaContaRestrita(member.user.email);
    redirect(entrada === `/aulas/${moduleSlug}` ? "/aulas" : entrada);
  }
  if (first) {
    redirect(`/aulas/${first.moduleSlug}/${first.slug}`);
  }

  return (
    <div className="feed-wrap-wide">
      <AulaBreadcrumb path={findModulePath(catalog, moduleSlug)} />
      <h1 className="page-title mt-4">{mod.title}</h1>
      <div className="mt-8">
        <EmptyState
          title="Em breve"
          description="Este módulo ainda não tem aulas publicadas. Volte quando o conteúdo estiver no ar."
        />
      </div>
    </div>
  );
}
