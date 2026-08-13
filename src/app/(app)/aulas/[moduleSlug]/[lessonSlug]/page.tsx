import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePaidMemberOrRedirect } from "@/lib/membership/require-member";
import {
  ensureLessonDiscussionPost,
  getLessonForMember,
  getLessonProgress,
  pandaEmbedUrl,
} from "@/lib/aulas";
import { getPost } from "@/lib/posts";
import { MarkLessonCompleteButton } from "@/components/mark-lesson-complete-button";
import {
  CommentForm,
  DeleteCommentButton,
  ReplyToggle,
} from "@/components/post-actions";
import { EmptyState } from "@/components/empty-state";
import { MarkdownBody } from "@/lib/markdown";

type Props = {
  params: Promise<{ moduleSlug: string; lessonSlug: string }>;
};

export default async function LessonPage({ params }: Props) {
  const { moduleSlug, lessonSlug } = await params;
  const member = await requirePaidMemberOrRedirect();

  const lesson = await getLessonForMember(moduleSlug, lessonSlug);
  if (!lesson) notFound();

  let embed: string;
  try {
    embed = pandaEmbedUrl(
      lesson.pandaLibraryId,
      lesson.pandaVideoExternalId,
    );
  } catch {
    notFound();
  }

  const [progress, discussionMeta] = await Promise.all([
    getLessonProgress(member.user.id, lesson.id),
    ensureLessonDiscussionPost({
      id: lesson.id,
      title: lesson.title,
      authorFallbackId: member.user.id,
    }),
  ]);
  const discussion = await getPost(discussionMeta.id, {
    viewerId: member.user.id,
  });
  const isAdmin = member.membership.role === "admin";

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

      <section className="mt-10 border-t border-border pt-8">
        <h2 className="font-[family-name:var(--font-outfit)] text-lg font-semibold">
          Comentários
          {discussion ? ` (${discussion.commentCount})` : ""}
        </h2>
        <p className="mt-1 text-sm text-muted">
          Tire dúvidas e compartilhe aprendizados desta aula.
        </p>
        {discussion ? (
          <>
            <CommentForm postId={discussion.id} />
            {discussion.comments.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  title="Nenhum comentário"
                  description="Seja o primeiro a comentar esta aula."
                />
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                {discussion.comments.map((c) => (
                  <li key={c.id} className="post-card !p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">
                          {c.author.profile?.displayName ?? "Membro"}
                        </p>
                        <div className="mt-1.5 text-sm leading-relaxed">
                          <MarkdownBody
                            body={c.body}
                            className="space-y-1 text-sm leading-relaxed [&_p]:my-0"
                          />
                        </div>
                        <p className="mt-2 text-xs text-muted">
                          {c.createdAt.toLocaleString("pt-BR")}
                        </p>
                        <ReplyToggle postId={discussion.id} parentId={c.id} />
                      </div>
                      {isAdmin ? (
                        <DeleteCommentButton
                          commentId={c.id}
                          postId={discussion.id}
                        />
                      ) : null}
                    </div>
                    {c.replies.length > 0 ? (
                      <ul className="mt-3 space-y-2">
                        {c.replies.map((r) => (
                          <li
                            key={r.id}
                            className="post-card ml-6 !bg-surface/40 !p-4"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium">
                                  {r.author.profile?.displayName ?? "Membro"}
                                </p>
                                <div className="mt-1.5 text-sm leading-relaxed">
                                  <MarkdownBody
                                    body={r.body}
                                    className="space-y-1 text-sm leading-relaxed [&_p]:my-0"
                                  />
                                </div>
                                <p className="mt-2 text-xs text-muted">
                                  {r.createdAt.toLocaleString("pt-BR")}
                                </p>
                              </div>
                              {isAdmin ? (
                                <DeleteCommentButton
                                  commentId={r.id}
                                  postId={discussion.id}
                                />
                              ) : null}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : null}
      </section>
    </div>
  );
}
