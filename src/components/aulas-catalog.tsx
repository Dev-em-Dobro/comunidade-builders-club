"use client";

import { useEffect, useState } from "react";
import { pandaEmbedUrl } from "@/lib/aulas";
import { markLessonCompletedAction } from "@/actions/aulas";

export type AulaLessonCard = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  pandaLibraryId: string;
  pandaVideoExternalId: string;
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

function LessonModal({
  lesson,
  onClose,
}: {
  lesson: AulaLessonCard;
  onClose: () => void;
}) {
  let embed: string | null = null;
  try {
    embed = pandaEmbedUrl(lesson.pandaLibraryId, lesson.pandaVideoExternalId);
  } catch {
    embed = null;
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center md:items-center md:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/45 backdrop-blur-[2px]"
        aria-label="Fechar"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={lesson.title}
        className="relative z-10 flex max-h-[100dvh] w-full max-w-3xl flex-col overflow-hidden bg-card shadow-2xl md:max-h-[90dvh] md:rounded-2xl md:border md:border-border"
      >
        <header className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3">
          <h2 className="min-w-0 flex-1 truncate font-[family-name:var(--font-outfit)] text-base font-semibold">
            {lesson.title}
          </h2>
          <button
            type="button"
            className="btn-ghost px-2 text-sm"
            aria-label="Fechar"
            onClick={onClose}
          >
            ✕
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {embed ? (
            <div className="overflow-hidden rounded-xl border border-border bg-black">
              <div className="relative aspect-video w-full">
                <iframe
                  src={embed}
                  title={lesson.title}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          ) : (
            <p className="text-sm text-red-600">
              Não foi possível montar o player. Confira os IDs Panda no admin.
            </p>
          )}
          {lesson.description ? (
            <p className="mt-4 text-sm text-muted">{lesson.description}</p>
          ) : null}
          <div className="mt-5">
            {lesson.completed ? (
              <p className="text-sm font-medium text-accent">Aula concluída</p>
            ) : (
              <form
                action={markLessonCompletedAction.bind(
                  null,
                  lesson.id,
                  lesson.moduleSlug,
                  lesson.slug,
                )}
              >
                <button type="submit" className="btn-primary">
                  Marcar como concluída
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AulasCatalog({ modules }: { modules: AulaModuleCard[] }) {
  const [open, setOpen] = useState<AulaLessonCard | null>(null);

  if (modules.length === 0) {
    return null;
  }

  return (
    <>
      <ul className="mt-8 space-y-6">
        {modules.map((mod) => (
          <li
            key={mod.id}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-4 border-b border-border bg-surface/40 px-4 py-3 sm:px-5">
              {mod.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mod.coverImageUrl}
                  alt=""
                  className="h-16 w-12 shrink-0 rounded-lg object-cover sm:h-20 sm:w-14"
                />
              ) : (
                <div className="flex h-16 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-xs font-bold text-accent sm:h-20 sm:w-14">
                  Aula
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="font-[family-name:var(--font-outfit)] text-lg font-semibold">
                  {mod.title}
                </h2>
                {mod.description ? (
                  <p className="mt-0.5 text-sm text-muted">{mod.description}</p>
                ) : null}
                <p className="mt-1 text-xs text-muted">
                  {mod.lessons.length}{" "}
                  {mod.lessons.length === 1 ? "conteúdo" : "conteúdos"}
                </p>
              </div>
            </div>

            <ul className="divide-y divide-border">
              {mod.lessons.map((l) => (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => setOpen(l)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface/60 sm:gap-4 sm:px-5"
                  >
                    {l.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={l.thumbnailUrl}
                        alt=""
                        className="h-12 w-20 shrink-0 rounded-md object-cover sm:h-14 sm:w-24"
                      />
                    ) : (
                      <div className="flex h-12 w-20 shrink-0 items-center justify-center rounded-md bg-surface text-[10px] font-semibold uppercase tracking-wide text-muted sm:h-14 sm:w-24">
                        Vídeo
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {l.title}
                      </p>
                      <p className="text-xs text-muted">Vídeo</p>
                    </div>
                    {l.completed ? (
                      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-accent">
                        Concluída
                      </span>
                    ) : (
                      <span className="shrink-0 text-xs font-medium text-accent">
                        Assistir →
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>

            <p className="border-t border-border px-4 py-2.5 text-xs text-muted sm:px-5">
              {mod.lessons.length} conteúdo(s)
            </p>
          </li>
        ))}
      </ul>

      {open ? (
        <LessonModal lesson={open} onClose={() => setOpen(null)} />
      ) : null}
    </>
  );
}
