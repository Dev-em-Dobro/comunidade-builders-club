import Image from "next/image";
import Link from "next/link";
import { snippetFromBody } from "@/lib/markdown/text";
import { FASE_1_M01_SLUG } from "@/lib/aulas/access";

export type AulaLessonCard = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  moduleSlug: string;
  completed: boolean;
  freeAccess: boolean;
};

export type AulaModuleCard = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  freeAccess: boolean;
  lessons: AulaLessonCard[];
  children?: AulaModuleCard[];
};

type ModuleNode = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  freeAccess: boolean;
  lessons: Array<{
    id: string;
    slug: string;
    title: string;
    description: string | null;
    thumbnailUrl: string | null;
  }>;
  children?: ModuleNode[];
};

export function LockMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className ?? "h-4 w-4"}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function mapModule(
  mod: ModuleNode,
  completed: Set<string>,
  inheritedFree = false,
): AulaModuleCard {
  const freeAccess =
    inheritedFree || Boolean(mod.freeAccess) || mod.slug === FASE_1_M01_SLUG;
  return {
    id: mod.id,
    slug: mod.slug,
    title: mod.title,
    description: mod.description,
    coverImageUrl: mod.coverImageUrl,
    freeAccess,
    lessons: mod.lessons.map((l) => ({
      id: l.id,
      slug: l.slug,
      title: l.title,
      description: l.description,
      thumbnailUrl: l.thumbnailUrl,
      moduleSlug: mod.slug,
      completed: completed.has(l.id),
      freeAccess,
    })),
    children: (mod.children ?? []).map((child) =>
      mapModule(child, completed, freeAccess),
    ),
  };
}

export function contentCount(mod: AulaModuleCard): number {
  return (
    mod.lessons.length +
    (mod.children ?? []).reduce((n, child) => n + contentCount(child), 0)
  );
}

export function completedCount(mod: AulaModuleCard): number {
  return (
    mod.lessons.filter((l) => l.completed).length +
    (mod.children ?? []).reduce((n, child) => n + completedCount(child), 0)
  );
}

export function coverOf(mod: AulaModuleCard): string | null {
  if (mod.coverImageUrl) return mod.coverImageUrl;
  const own = mod.lessons.find((l) => l.thumbnailUrl)?.thumbnailUrl;
  if (own) return own;
  for (const child of mod.children ?? []) {
    const nested = coverOf(child);
    if (nested) return nested;
  }
  return null;
}

export function findModuleBySlug(
  modules: AulaModuleCard[],
  slug: string,
): AulaModuleCard | null {
  for (const mod of modules) {
    if (mod.slug === slug) return mod;
    const nested = findModuleBySlug(mod.children ?? [], slug);
    if (nested) return nested;
  }
  return null;
}

export function findRootContaining(
  roots: AulaModuleCard[],
  slug: string,
): AulaModuleCard | null {
  for (const root of roots) {
    if (findModuleBySlug([root], slug)) return root;
  }
  return null;
}

export function leafModules(mod: AulaModuleCard): AulaModuleCard[] {
  const kids = mod.children ?? [];
  const nested = kids.flatMap(leafModules);
  if (mod.lessons.length > 0) return [mod, ...nested];
  return nested;
}

/** Agrupa submódulos pelas trilhas intermediárias (ex.: IA Aplicada | n8n). */
export type SidebarGroup = {
  id: string;
  title: string | null;
  sections: AulaModuleCard[];
};

export function sidebarGroups(root: AulaModuleCard): SidebarGroup[] {
  const kids = root.children ?? [];
  const tracks = kids.filter((k) => (k.children ?? []).length > 0);
  if (tracks.length >= 2) {
    return tracks
      .map((track) => ({
        id: track.id,
        title: track.title,
        sections: leafModules(track),
      }))
      .filter((g) => g.sections.length > 0);
  }
  return [{ id: root.id, title: null, sections: leafModules(root) }];
}

export function flattenLessons(mod: AulaModuleCard): AulaLessonCard[] {
  return [
    ...mod.lessons,
    ...(mod.children ?? []).flatMap(flattenLessons),
  ];
}

export function progressPct(mod: AulaModuleCard): number {
  const total = contentCount(mod);
  if (total === 0) return 0;
  return Math.round((completedCount(mod) / total) * 100);
}

/** Card raiz sem selo Pago se algum descendente for free (F065 — M01). */
export function treeHasFreeAccess(mod: AulaModuleCard): boolean {
  if (mod.freeAccess) return true;
  return (mod.children ?? []).some(treeHasFreeAccess);
}

function LessonRows({
  lessons,
  isPaid,
}: {
  lessons: AulaLessonCard[];
  isPaid: boolean;
}) {
  if (lessons.length === 0) return null;
  return (
    <ul className="divide-y divide-border">
      {lessons.map((l) => {
        const locked = !isPaid && !l.freeAccess;
        return (
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
                <p className="text-sm text-muted">
                  {locked ? "Plano pago" : "Vídeo"}
                </p>
              </div>
              {locked ? (
                <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-muted">
                  <LockMark className="h-3.5 w-3.5" />
                  Cadeado
                </span>
              ) : l.completed ? (
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
        );
      })}
    </ul>
  );
}

function ModuleBranch({
  mod,
  depth,
  isPaid,
}: {
  mod: AulaModuleCard;
  depth: number;
  isPaid: boolean;
}) {
  const children = mod.children ?? [];
  const headingClass =
    depth <= 1
      ? "font-[family-name:var(--font-outfit)] text-base font-semibold md:text-lg"
      : "text-[15px] font-semibold";

  return (
    <div className="border-t border-border">
      <div
        className={
          depth <= 1
            ? "flex flex-wrap items-center gap-3 bg-surface/30 px-4 py-3 sm:px-5"
            : "px-4 py-3 sm:px-5 sm:pl-8"
        }
      >
        {mod.coverImageUrl && depth < 2 ? (
          <Image
            src={mod.coverImageUrl}
            alt=""
            width={36}
            height={48}
            className="h-12 w-9 shrink-0 rounded-lg object-cover"
            sizes="36px"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            {depth >= 2 ? "Submódulo" : "Módulo"}
          </p>
          <h3 className={headingClass}>{mod.title}</h3>
          {mod.description ? (
            <p className="mt-0.5 whitespace-pre-line text-sm text-muted sm:text-[15px]">
              {mod.description}
            </p>
          ) : null}
        </div>
      </div>
      <LessonRows lessons={mod.lessons} isPaid={isPaid} />
      {children.map((child) => (
        <ModuleBranch
          key={child.id}
          mod={child}
          depth={depth + 1}
          isPaid={isPaid}
        />
      ))}
    </div>
  );
}

function Cover({ src, title }: { src: string | null; title: string }) {
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        fill
        className="h-full w-full object-cover"
        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
      />
    );
  }
  return (
    <div className="flex h-full w-full items-end bg-gradient-to-br from-accent/80 to-accent-hover p-4">
      <span className="font-[family-name:var(--font-outfit)] text-lg font-semibold text-accent-foreground">
        {title}
      </span>
    </div>
  );
}

export function AulasCatalog({
  modules,
  isPaid = true,
}: {
  modules: AulaModuleCard[];
  isPaid?: boolean;
}) {
  if (modules.length === 0) return null;

  return (
    <ul className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {modules.map((mod) => {
        const total = contentCount(mod);
        const pct = progressPct(mod);
        const locked = !isPaid && !treeHasFreeAccess(mod);
        const summary = mod.description
          ? snippetFromBody(mod.description, 140)
          : null;
        return (
          <li key={mod.id}>
            <Link
              href={`/aulas/${mod.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-colors hover:border-accent/40 hover:shadow-md"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-surface">
                <Cover src={coverOf(mod)} title={mod.title} />
                {locked ? (
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-foreground shadow-sm">
                    <LockMark className="h-3 w-3" />
                    Pago
                  </span>
                ) : null}
              </div>
              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <h2 className="font-[family-name:var(--font-outfit)] text-lg font-semibold leading-snug">
                  {mod.title}
                </h2>
                {summary ? (
                  <p className="mt-1.5 line-clamp-2 text-sm text-muted">
                    {summary}
                  </p>
                ) : null}
                <div className="mt-auto pt-4">
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs font-medium text-muted">
                    {pct}%
                    {total > 0
                      ? ` · ${total} ${total === 1 ? "aula" : "aulas"}`
                      : " · em breve"}
                  </p>
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function AulasModuleOutline({
  mod,
  isPaid = true,
}: {
  mod: AulaModuleCard;
  isPaid?: boolean;
}) {
  const children = mod.children ?? [];
  if (mod.lessons.length === 0 && children.length === 0) {
    return null;
  }
  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <LessonRows lessons={mod.lessons} isPaid={isPaid} />
      {children.map((child) => (
        <ModuleBranch
          key={child.id}
          mod={child}
          depth={1}
          isPaid={isPaid}
        />
      ))}
    </div>
  );
}
