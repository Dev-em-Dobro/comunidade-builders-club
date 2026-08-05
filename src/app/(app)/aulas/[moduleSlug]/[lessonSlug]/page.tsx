import Link from "next/link";
import { notFound } from "next/navigation";
import { requireActiveMemberOrRedirect } from "@/lib/membership/require-member";
import {
  getLessonForMember,
  getLessonProgress,
  pandaEmbedUrl,
} from "@/lib/aulas";
import { markLessonCompletedAction } from "@/actions/aulas";

type Props = {
  params: Promise<{ moduleSlug: string; lessonSlug: string }>;
};

export default async function LessonPage({ params }: Props) {
  const { moduleSlug, lessonSlug } = await params;
  const member = await requireActiveMemberOrRedirect();

  const lesson = await getLessonForMember(moduleSlug, lessonSlug);
  if (!lesson) notFound();

  const progress = await getLessonProgress(member.user.id, lesson.id);
  let embed: string;
  try {
    embed = pandaEmbedUrl(
      lesson.pandaLibraryId,
      lesson.pandaVideoExternalId,
    );
  } catch {
    notFound();
  }

  return (
      <div className="mx-auto w-full max-w-3xl">
        <Link
          href="/aulas"
          className="text-sm font-medium text-accent hover:underline"
        >
          ← Voltar às aulas
        </Link>
        <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted">
          {lesson.module.title}
        </p>
        <h1 className="page-title mt-1">{lesson.title}</h1>
        {lesson.description ? (
          <p className="mt-2 text-sm text-muted">{lesson.description}</p>
        ) : null}

        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-black shadow-sm">
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

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {progress?.completedAt ? (
            <p className="text-sm font-medium text-accent">
              Concluída em{" "}
              {progress.completedAt.toLocaleString("pt-BR")}
            </p>
          ) : (
            <form
              action={markLessonCompletedAction.bind(
                null,
                lesson.id,
                moduleSlug,
                lessonSlug,
              )}
            >
              <button type="submit" className="btn-primary">
                Marcar como concluída
              </button>
            </form>
          )}
        </div>
      </div>
  );
}
