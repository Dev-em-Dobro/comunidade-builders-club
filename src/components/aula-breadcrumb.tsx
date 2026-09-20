import Link from "next/link";
import type { AulaModuleCard } from "@/components/aulas-catalog";

type Crumb = { key: string; label: string };

/**
 * F094 — Aulas › fase › … › módulo › aula (quando informada).
 *
 * Ancestrais da árvore são texto, não link: `/aulas/[slug]` redireciona
 * para a 1ª aula daquele nó e, na fase, isso joga de volta no módulo
 * principal da jornada.
 */
export function AulaBreadcrumb({
  path,
  lessonTitle,
}: {
  path: AulaModuleCard[];
  /** Título da aula atual — último crumb, se houver. */
  lessonTitle?: string | null;
}) {
  const crumbs: Crumb[] = path.map((mod) => ({
    key: mod.id,
    label: mod.title,
  }));
  if (lessonTitle?.trim()) {
    crumbs.push({ key: "lesson", label: lessonTitle.trim() });
  }

  if (crumbs.length === 0) {
    return (
      <Link
        href="/aulas"
        className="text-[15px] font-medium text-accent hover:underline"
      >
        ← Aulas
      </Link>
    );
  }

  return (
    <nav aria-label="Navegação das aulas" className="min-w-0">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-muted">
        <li>
          <Link href="/aulas" className="font-medium text-accent hover:underline">
            Aulas
          </Link>
        </li>
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={crumb.key} className="flex min-w-0 items-center gap-x-1.5">
              <span aria-hidden className="text-muted/70">
                ›
              </span>
              {isLast ? (
                <span
                  className="truncate font-medium text-foreground"
                  aria-current="page"
                >
                  {crumb.label}
                </span>
              ) : (
                <span className="truncate font-medium text-accent">
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
