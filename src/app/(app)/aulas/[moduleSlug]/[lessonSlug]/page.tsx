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
  CommentCard,
  CommentForm,
  ReplyToggle,
} from "@/components/post-actions";
import { EmptyState } from "@/components/empty-state";

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
                {discussion.comments.map((c) => {
                  const canEdit =
                    isAdmin || c.authorId === member.user.id;
                  return (
                    <li key={c.id}>
                      <CommentCard
                        commentId={c.id}
                        postId={discussion.id}
                        authorName={
                          c.author.profile?.displayName ?? "Membro"
                        }
                        body={c.body}
                        createdAtLabel={c.createdAt.toLocaleString("pt-BR")}
                        canEdit={canEdit}
                        isAdmin={isAdmin}
                        replySlot={
                          <ReplyToggle
                            postId={discussion.id}
                            parentId={c.id}
                          />
                        }
                      />
                      {c.replies.length > 0 ? (
                        <ul className="mt-3 space-y-2">
                          {c.replies.map((r) => {
                            const canEditReply =
                              isAdmin || r.authorId === member.user.id;
                            return (
                              <li key={r.id}>
                                <CommentCard
                                  commentId={r.id}
                                  postId={discussion.id}
                                  authorName={
                                    r.author.profile?.displayName ?? "Membro"
                                  }
                                  body={r.body}
                                  createdAtLabel={r.createdAt.toLocaleString(
                                    "pt-BR",
                                  )}
                                  canEdit={canEditReply}
                                  isAdmin={isAdmin}
                                  nested
                                  replySlot={
                                    <ReplyToggle
                                      postId={discussion.id}
                                      parentId={r.id}
                                    />
                                  }
                                />
                              </li>
                            );
                          })}
                        </ul>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        ) : null}
      </section>
    </div>
  );
}
