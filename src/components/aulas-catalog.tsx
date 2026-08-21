import Image from "next/image";
import Link from "next/link";

export type AulaLessonCard = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  moduleSlug: string;
  completed: boolean;
};

export type AulaModuleCard = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  lessons: AulaLessonCard[];
  children?: AulaModuleCard[];
};

function contentCount(mod: AulaModuleCard): number {
  return (
    mod.lessons.length +
    (mod.children ?? []).reduce((n, child) => n + contentCount(child), 0)
  );
}

function LessonRows({ lessons }: { lessons: AulaLessonCard[] }) {
  if (lessons.length === 0) return null;
  return (
    <ul className="divide-y divide-border">
      {lessons.map((l) => (
        <li key={l.id}>
          <Link
            href={`/aulas/${l.moduleSlug}/${l.slug}`}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface/60 sm:gap-4 sm:px-5"
          >
            {l.thumbnailUrl ? (
              <Image
                src={l.thumbnailUrl}
                alt=""
                width={96}
                height={56}
                className="h-12 w-20 shrink-0 rounded-md object-cover sm:h-14 sm:w-24"
                sizes="96px"
              />
            ) : (
              <div className="flex h-12 w-20 shrink-0 items-center justify-center rounded-md bg-surface text-[10px] font-semibold uppercase tracking-wide text-muted sm:h-14 sm:w-24">
                Vídeo
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold text-foreground md:text-base">
                {l.title}
              </p>
              <p className="text-sm text-muted">Vídeo</p>
            </div>
            {l.completed ? (
              <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-accent">
                Concluída
              </span>
            ) : (
              <span className="shrink-0 text-sm font-medium text-accent">
                Assistir →
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ModuleBranch({
  mod,
  depth,
}: {
  mod: AulaModuleCard;
  depth: number;
}) {
  const children = mod.children ?? [];
  const headingClass =
    depth === 0
      ? "font-[family-name:var(--font-outfit)] text-lg font-semibold md:text-xl"
      : depth === 1
        ? "font-[family-name:var(--font-outfit)] text-base font-semibold md:text-lg"
        : "text-[15px] font-semibold";

  return (
    <div className={depth === 0 ? "" : "border-t border-border"}>
      <div
        className={
          depth === 0
            ? "flex flex-wrap items-center gap-4 border-b border-border bg-surface/40 px-4 py-3 sm:px-5"
            : depth === 1
              ? "flex flex-wrap items-center gap-3 bg-surface/30 px-4 py-3 sm:px-5"
              : "px-4 py-3 sm:px-5 sm:pl-8"
        }
      >
        {mod.coverImageUrl && depth < 2 ? (
          <Image
            src={mod.coverImageUrl}
            alt=""
            width={56}
            height={80}
            className={
              depth === 0
                ? "h-16 w-12 shrink-0 rounded-lg object-cover sm:h-20 sm:w-14"
                : "h-12 w-9 shrink-0 rounded-lg object-cover"
            }
            sizes="56px"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          {depth === 1 ? (
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              Módulo
            </p>
          ) : null}
          {depth >= 2 ? (
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              Submódulo
            </p>
          ) : null}
          {depth === 0 ? (
            <h2 className={headingClass}>{mod.title}</h2>
          ) : (
            <h3 className={headingClass}>{mod.title}</h3>
          )}
          {mod.description ? (
            <p className="mt-0.5 text-sm text-muted sm:text-[15px]">
              {mod.description}
            </p>
          ) : null}
        </div>
      </div>
      <LessonRows lessons={mod.lessons} />
      {children.map((child) => (
        <ModuleBranch key={child.id} mod={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export function AulasCatalog({ modules }: { modules: AulaModuleCard[] }) {
  if (modules.length === 0) {
    return null;
  }

  return (
    <ul className="mt-8 space-y-6">
      {modules.map((mod) => {
        const total = contentCount(mod);
        return (
          <li
            key={mod.id}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
          >
            <ModuleBranch mod={mod} depth={0} />
            <p className="border-t border-border px-4 py-2.5 text-sm text-muted sm:px-5">
              {total} {total === 1 ? "conteúdo" : "conteúdos"}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
