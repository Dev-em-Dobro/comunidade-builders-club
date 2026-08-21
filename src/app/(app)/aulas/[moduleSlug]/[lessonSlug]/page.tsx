import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePaidMemberOrRedirect } from "@/lib/membership/require-member";
import {
  ensureLessonDiscussionPost,
  getLessonForMember,
  getLessonProgress,
  listCompletedLessonIds,
  listPublishedModules,
  pandaEmbedUrl,
} from "@/lib/aulas";
import { getPost } from "@/lib/posts";
import { MarkLessonCompleteButton } from "@/components/mark-lesson-complete-button";
import {
  CommentCard,
  CommentForm,
  ReplyToggle,
} from "@/components/post-actions";
import { MarkdownBody } from "@/lib/markdown";
import { EmptyState } from "@/components/empty-state";
import { AulaCourseSidebar } from "@/components/aula-course-sidebar";
import { AulaDetailsTabs } from "@/components/aula-details-tabs";
import {
  findRootContaining,
  flattenLessons,
  mapModule,
} from "@/components/aulas-catalog";

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

  const [progress, discussionMeta, modules, completed] = await Promise.all([
    getLessonProgress(member.user.id, lesson.id),
    ensureLessonDiscussionPost({
      id: lesson.id,
      title: lesson.title,
      authorFallbackId: member.user.id,
    }),
    listPublishedModules(),
    listCompletedLessonIds(member.user.id),
  ]);
  const discussion = await getPost(discussionMeta.id, {
    viewerId: member.user.id,
  });
  const isAdmin = member.membership.role === "admin";
  const catalog = modules.map((mod) => mapModule(mod, completed));
  const root = findRootContaining(catalog, moduleSlug);
  const playlist = root ? flattenLessons(root) : [];
  const index = playlist.findIndex(
    (l) => l.slug === lessonSlug && l.moduleSlug === moduleSlug,
  );
  const prev = index > 0 ? playlist[index - 1] : null;
  const next =
    index >= 0 && index < playlist.length - 1 ? playlist[index + 1] : null;

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Link
        href="/aulas"
        className="text-[15px] font-medium text-accent hover:underline"
      >
        ← Aulas
      </Link>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div>
          <div className="overflow-hidden rounded-2xl border border-border bg-black shadow-sm">
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
          <div className="mt-3 flex items-center justify-between gap-3">
            {prev ? (
              <Link
                href={`/aulas/${prev.moduleSlug}/${prev.slug}`}
                className="text-sm font-medium text-muted hover:text-accent"
              >
                ← Aula anterior
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/aulas/${next.moduleSlug}/${next.slug}`}
                className="text-sm font-medium text-muted hover:text-accent"
              >
                Próxima aula →
              </Link>
            ) : (
              <span />
            )}
          </div>
        </div>

        {root ? (
          <AulaCourseSidebar
            root={root}
            currentModuleSlug={moduleSlug}
            currentLessonSlug={lessonSlug}
          />
        ) : null}
      </div>

      <div className="mt-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              {lesson.module.title}
            </p>
            <h1 className="page-title mt-1">{lesson.title}</h1>
          </div>
          {progress?.completedAt ? (
            <p className="inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2 text-[15px] font-semibold text-accent">
              <span aria-hidden>✓</span>
              Concluída
            </p>
          ) : (
            <MarkLessonCompleteButton
              lessonId={lesson.id}
              moduleSlug={moduleSlug}
              lessonSlug={lessonSlug}
              label="Concluir"
              className="rounded-xl border border-border bg-card px-4 py-2 text-[15px] font-semibold hover:border-accent/40"
            />
          )}
        </div>

        <div className="mt-6">
          <AulaDetailsTabs
            commentCount={discussion?.commentCount ?? 0}
            info={
              lesson.description ? (
                <MarkdownBody
                  body={lesson.description}
                  className="space-y-2 text-[15px] leading-relaxed text-muted md:text-base [&_a]:text-accent [&_h2]:text-foreground [&_pre]:text-foreground"
                />
              ) : (
                <p className="text-sm text-muted">
                  Esta aula ainda não tem descrição.
                </p>
              )
            }
            comments={
              <section>
                <p className="text-sm text-muted">
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
                                createdAtLabel={c.createdAt.toLocaleString(
                                  "pt-BR",
                                )}
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
                                            r.author.profile?.displayName ??
                                            "Membro"
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
            }
          />
        </div>
      </div>
    </div>
  );
}
