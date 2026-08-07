import Link from "next/link";
import { notFound } from "next/navigation";
import { requireActiveMemberOrRedirect } from "@/lib/membership/require-member";
import {
  getLessonForMember,
  getLessonProgress,
  pandaEmbedUrl,
} from "@/lib/aulas";
import { MarkLessonCompleteButton } from "@/components/mark-lesson-complete-button";

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
        className="text-[15px] font-medium text-accent hover:underline"
      >
        ← Voltar às aulas
      </Link>
      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted md:text-sm">
        {lesson.module.title}
      </p>
      <h1 className="page-title mt-1">{lesson.title}</h1>
      {lesson.description ? (
        <p className="mt-2 text-[15px] text-muted md:text-base">
          {lesson.description}
        </p>
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
          <p className="inline-flex items-center gap-2 rounded-xl bg-accent/10 px-4 py-2.5 text-[15px] font-semibold text-accent">
            <span aria-hidden>✓</span>
            Concluída em {progress.completedAt.toLocaleString("pt-BR")}
          </p>
        ) : (
          <MarkLessonCompleteButton
            lessonId={lesson.id}
            moduleSlug={moduleSlug}
            lessonSlug={lessonSlug}
          />
        )}
      </div>
    </div>
  );
}
