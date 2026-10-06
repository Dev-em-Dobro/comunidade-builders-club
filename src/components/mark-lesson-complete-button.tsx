"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setLessonCompletedAction } from "@/actions/aulas";

export function MarkLessonCompleteButton({
  lessonId,
  moduleSlug,
  lessonSlug,
  initiallyCompleted,
}: {
  lessonId: string;
  moduleSlug: string;
  lessonSlug: string;
  initiallyCompleted: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [completed, setCompleted] = useState(initiallyCompleted);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <button
        type="button"
        className="btn-primary min-w-[7.5rem] px-3 py-2 text-sm active:scale-[0.98]"
        disabled={pending}
        aria-busy={pending}
        aria-pressed={completed}
        aria-label={
          completed
            ? "Aula concluída. Clique para desfazer"
            : "Concluir aula"
        }
        onClick={() => {
          if (pending) return;
          setError(null);
          start(async () => {
            try {
              const nextCompleted = !completed;
              await setLessonCompletedAction(
                lessonId,
                moduleSlug,
                lessonSlug,
                nextCompleted,
              );
              setCompleted(nextCompleted);
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
        {pending ? "Salvando…" : completed ? "Concluída" : "Concluir aula"}
      </button>
      {error ? (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
