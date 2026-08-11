import { requirePaidMemberOrRedirect } from "@/lib/membership/require-member";
import {
  listCompletedLessonIds,
  listPublishedModules,
} from "@/lib/aulas";
import { EmptyState } from "@/components/empty-state";
import { AulasCatalog } from "@/components/aulas-catalog";

export default async function AulasPage() {
  const member = await requirePaidMemberOrRedirect();
  const [modules, completed] = await Promise.all([
    listPublishedModules(),
    listCompletedLessonIds(member.user.id),
  ]);

  const catalog = modules.map((mod) => ({
    id: mod.id,
    slug: mod.slug,
    title: mod.title,
    description: mod.description,
    coverImageUrl: mod.coverImageUrl,
    lessons: mod.lessons.map((l) => ({
      id: l.id,
      slug: l.slug,
      title: l.title,
      description: l.description,
      pandaLibraryId: l.pandaLibraryId,
      pandaVideoExternalId: l.pandaVideoExternalId,
      thumbnailUrl: l.thumbnailUrl,
      moduleSlug: mod.slug,
      completed: completed.has(l.id),
    })),
  }));

  return (
    <div className="feed-wrap-wide">
      <h1 className="page-title">Aulas</h1>
      <p className="mt-2 text-sm text-muted">
        Conteúdo em vídeo da comunidade. Clique para assistir.
      </p>

      {catalog.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Nenhum módulo publicado"
            description="Os administradores vão liberar as aulas em breve."
          />
        </div>
      ) : (
        <AulasCatalog modules={catalog} />
      )}
    </div>
  );
}
