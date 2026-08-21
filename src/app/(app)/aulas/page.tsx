import { requirePaidMemberOrRedirect } from "@/lib/membership/require-member";
import {
  listCompletedLessonIds,
  listPublishedModules,
} from "@/lib/aulas";
import { EmptyState } from "@/components/empty-state";
import {
  AulasCatalog,
  type AulaLessonCard,
  type AulaModuleCard,
} from "@/components/aulas-catalog";

function mapLessons(
  moduleSlug: string,
  lessons: Array<{
    id: string;
    slug: string;
    title: string;
    description: string | null;
    thumbnailUrl: string | null;
  }>,
  completed: Set<string>,
): AulaLessonCard[] {
  return lessons.map((l) => ({
    id: l.id,
    slug: l.slug,
    title: l.title,
    description: l.description,
    thumbnailUrl: l.thumbnailUrl,
    moduleSlug,
    completed: completed.has(l.id),
  }));
}

type ModuleNode = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  lessons: Array<{
    id: string;
    slug: string;
    title: string;
    description: string | null;
    thumbnailUrl: string | null;
  }>;
  children?: ModuleNode[];
};

function mapModule(mod: ModuleNode, completed: Set<string>): AulaModuleCard {
  return {
    id: mod.id,
    slug: mod.slug,
    title: mod.title,
    description: mod.description,
    coverImageUrl: mod.coverImageUrl,
    lessons: mapLessons(mod.slug, mod.lessons, completed),
    children: (mod.children ?? []).map((child) => mapModule(child, completed)),
  };
}

export default async function AulasPage() {
  const member = await requirePaidMemberOrRedirect();
  const [modules, completed] = await Promise.all([
    listPublishedModules(),
    listCompletedLessonIds(member.user.id),
  ]);

  const catalog = modules.map((mod) => mapModule(mod, completed));

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
