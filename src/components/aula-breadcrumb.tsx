import Link from "next/link";
import {
  flattenLessons,
  type AulaModuleCard,
} from "@/components/aulas-catalog";

function hrefPrimeiraAula(mod: AulaModuleCard): string | null {
  const first = flattenLessons(mod)[0];
  if (!first) return null;
  return `/aulas/${first.moduleSlug}/${first.slug}`;
}

export function AulaBreadcrumb({ path }: { path: AulaModuleCard[] }) {
  const root = path[0];
  const label = root?.title.replace(/^(FASE \d+).*$/i, (_, fase) =>
    fase.toLowerCase().replace("fase", "Fase"),
  );

  return (
    <nav aria-label="Navegação das aulas">
      <Link
        href={(root && hrefPrimeiraAula(root)) || "/aulas"}
        className="text-xs text-muted/70 hover:text-muted"
      >
        {label || "Aulas"}
      </Link>
    </nav>
  );
}
