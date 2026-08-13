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
};

export function AulasCatalog({ modules }: { modules: AulaModuleCard[] }) {
  if (modules.length === 0) {
    return null;
  }

  return (
    <ul className="mt-8 space-y-6">
      {modules.map((mod) => (
        <li
          key={mod.id}
          className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
        >
          <div className="flex flex-wrap items-center gap-4 border-b border-border bg-surface/40 px-4 py-3 sm:px-5">
            {mod.coverImageUrl ? (
              <Image
                src={mod.coverImageUrl}
                alt=""
                width={56}
                height={80}
                className="h-16 w-12 shrink-0 rounded-lg object-cover sm:h-20 sm:w-14"
                sizes="56px"
              />
            ) : (
              <div className="flex h-16 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-xs font-bold text-accent sm:h-20 sm:w-14">
                Aula
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="font-[family-name:var(--font-outfit)] text-lg font-semibold md:text-xl">
                {mod.title}
              </h2>
              {mod.description ? (
                <p className="mt-0.5 text-[15px] text-muted">{mod.description}</p>
              ) : null}
              <p className="mt-1 text-sm text-muted">
                {mod.lessons.length}{" "}
                {mod.lessons.length === 1 ? "conteúdo" : "conteúdos"}
              </p>
            </div>
          </div>

          <ul className="divide-y divide-border">
            {mod.lessons.map((l) => (
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

          <p className="border-t border-border px-4 py-2.5 text-sm text-muted sm:px-5">
            {mod.lessons.length} conteúdo(s)
          </p>
        </li>
      ))}
    </ul>
  );
}
