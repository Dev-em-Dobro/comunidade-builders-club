import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requirePaidMemberOrRedirect } from "@/lib/membership/require-member";
import {
  listCompletedLessonIds,
  listPublishedModules,
} from "@/lib/aulas";
import { EmptyState } from "@/components/empty-state";
import {
  findModuleBySlug,
  flattenLessons,
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

  const first = flattenLessons(mod)[0];
  if (first) {
    redirect(`/aulas/${first.moduleSlug}/${first.slug}`);
  }

  return (
    <div className="feed-wrap-wide">
      <Link
        href="/aulas"
        className="text-[15px] font-medium text-accent hover:underline"
      >
        ← Aulas
      </Link>
      <h1 className="page-title mt-4">{mod.title}</h1>
      <div className="mt-8">
        <EmptyState
          title="Nenhuma aula neste módulo"
          description="O conteúdo ainda está sendo preparado."
        />
      </div>
    </div>
  );
}
