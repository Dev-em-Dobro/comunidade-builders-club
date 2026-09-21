import Link from "next/link";
import {
  flattenLessons,
  type AulaModuleCard,
} from "@/components/aulas-catalog";

type Crumb = {
  key: string;
  label: string;
  href: string | null;
};

function hrefPrimeiraAula(mod: AulaModuleCard): string | null {
  const first = flattenLessons(mod)[0];
  if (!first) return null;
  return `/aulas/${first.moduleSlug}/${first.slug}`;
}

/**
 * F094 — Aulas › fase › … › módulo › aula (quando informada).
 *
 * Cada nó da árvore linka para a 1ª aula **daquele** subárvore (não um
 * redirect genérico). A aula atual é o crumb final, sem link.
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
    href: hrefPrimeiraAula(mod),
  }));
  if (lessonTitle?.trim()) {
    crumbs.push({
      key: "lesson",
      label: lessonTitle.trim(),
      href: null,
    });
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
              {isLast || !crumb.href ? (
                <span
                  className="truncate font-medium text-foreground"
                  aria-current={isLast ? "page" : undefined}
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="truncate font-medium text-accent hover:underline"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
