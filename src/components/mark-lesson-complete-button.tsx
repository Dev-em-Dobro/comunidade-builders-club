"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { markLessonCompletedAction } from "@/actions/aulas";

export function MarkLessonCompleteButton({
  lessonId,
  moduleSlug,
  lessonSlug,
  onCompleted,
  label = "Marcar como concluída",
  className = "btn-primary min-w-[12rem]",
}: {
  lessonId: string;
  moduleSlug: string;
  lessonSlug: string;
  onCompleted?: () => void;
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (done) {
    return (
      <p
        className="inline-flex items-center gap-2 rounded-xl bg-accent/10 px-4 py-2.5 text-[15px] font-semibold text-accent"
        role="status"
      >
        <span aria-hidden>✓</span>
        Aula marcada como concluída
      </p>
    );
  }

  return (
    <div>
      <button
        type="button"
        className={className}
        disabled={pending}
        aria-busy={pending}
        onClick={() => {
          if (pending) return;
          setError(null);
          start(async () => {
            try {
              await markLessonCompletedAction(
                lessonId,
                moduleSlug,
                lessonSlug,
              );
              setDone(true);
              onCompleted?.();
              router.refresh();
            } catch (e) {
              setError(
                e instanceof Error
                  ? e.message
                  : "Não foi possível marcar a aula.",
              );
            }
          });
        }}
      >
        {pending ? "Marcando…" : label}
      </button>
      {error ? (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
