import Link from "next/link";
import type { AulaModuleCard } from "@/components/aulas-catalog";

/**
 * F094 — Aulas › fase › … › módulo da aula atual.
 */
export function AulaBreadcrumb({ path }: { path: AulaModuleCard[] }) {
  if (path.length === 0) {
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
        {path.map((mod, i) => {
          const isLast = i === path.length - 1;
          return (
            <li key={mod.id} className="flex min-w-0 items-center gap-x-1.5">
              <span aria-hidden className="text-muted/70">
                ›
              </span>
              {isLast ? (
                <span
                  className="truncate font-medium text-foreground"
                  aria-current="page"
                >
                  {mod.title}
                </span>
              ) : (
                <Link
                  href={`/aulas/${mod.slug}`}
                  className="truncate font-medium text-accent hover:underline"
                >
                  {mod.title}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
