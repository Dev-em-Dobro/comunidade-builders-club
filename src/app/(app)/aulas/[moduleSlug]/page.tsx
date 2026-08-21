import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePaidMemberOrRedirect } from "@/lib/membership/require-member";
import {
  listCompletedLessonIds,
  listPublishedModules,
} from "@/lib/aulas";
import { EmptyState } from "@/components/empty-state";
import {
  AulasModuleOutline,
  contentCount,
  findModuleBySlug,
  mapModule,
} from "@/components/aulas-catalog";

type Props = {
  params: Promise<{ moduleSlug: string }>;
};

export default async function AulasModulePage({ params }: Props) {
  const { moduleSlug } = await params;
  const member = await requirePaidMemberOrRedirect();
  const [modules, completed] = await Promise.all([
    listPublishedModules(),
    listCompletedLessonIds(member.user.id),
  ]);

  const catalog = modules.map((mod) => mapModule(mod, completed));
  const mod = findModuleBySlug(catalog, moduleSlug);
  if (!mod) notFound();

  const total = contentCount(mod);

  return (
    <div className="feed-wrap-wide">
      <Link
        href="/aulas"
        className="text-[15px] font-medium text-accent hover:underline"
      >
        ← Aulas
      </Link>
      <h1 className="page-title mt-4">{mod.title}</h1>
      {mod.description ? (
        <p className="mt-2 whitespace-pre-line text-sm text-muted sm:text-[15px]">
          {mod.description}
        </p>
      ) : null}
      {total === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Nenhuma aula neste módulo"
            description="O conteúdo ainda está sendo preparado."
          />
        </div>
      ) : (
        <AulasModuleOutline mod={mod} />
      )}
    </div>
  );
}
