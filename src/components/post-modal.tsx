"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  getPostDetailAction,
  type PostDetailDto,
} from "@/actions/post-detail";
import { PostDetailContent } from "@/components/post-detail-content";

export function PostModal({
  postId,
  isAdmin,
  isPaid = true,
  currentUserId,
  onClose,
}: {
  postId: string | null;
  isAdmin: boolean;
  isPaid?: boolean;
  currentUserId?: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [post, setPost] = useState<PostDetailDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const load = useCallback((id: string) => {
    setError(null);
    start(async () => {
      try {
        const data = await getPostDetailAction(id);
          if (!data) {
            setError("Esta publicação foi removida ou não existe mais.");
            return;
          }
        setPost(data);
      } catch {
        setError("Não foi possível carregar o post.");
      }
    });
  }, []);

  useEffect(() => {
    if (!postId) {
      setPost(null);
      setError(null);
      return;
    }
    setPost(null);
    load(postId);
  }, [postId, load]);

  useEffect(() => {
    if (!postId) return;
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
  }, [postId, onClose]);

  if (!postId) return null;

  const title =
    post?.title?.trim() ||
    (post ? post.body.slice(0, 60) : null) ||
    "Publicação";

  const isAuthor = Boolean(
    post && currentUserId && post.authorId === currentUserId,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center md:items-center md:p-6">
      <button
        type="button"
        className="absolute inset-0 cursor-pointer bg-foreground/40 backdrop-blur-[2px]"
        aria-label="Fechar"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 flex max-h-[100dvh] w-full max-w-2xl flex-col overflow-hidden bg-card shadow-2xl md:max-h-[90dvh] md:rounded-2xl md:border md:border-border"
      >
        <header className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3">
          <h2 className="min-w-0 flex-1 truncate font-[family-name:var(--font-outfit)] text-base font-semibold">
            {pending && !post ? "Carregando…" : title}
          </h2>
          <button
            type="button"
            className="btn-ghost cursor-pointer text-xs"
            disabled={!post}
            title="Abrir na área principal"
            onClick={() => {
              onClose();
              router.push(`/posts/${postId}`);
            }}
          >
            Expandir
          </button>
          <button
            type="button"
            className="btn-ghost cursor-pointer px-2 text-sm"
            aria-label="Fechar"
            onClick={onClose}
          >
            ✕
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          {pending && !post ? (
            <p className="text-sm text-muted">Carregando conteúdo…</p>
          ) : null}
          {post ? (
            <PostDetailContent
              post={post}
              isAdmin={isAdmin}
              isAuthor={isAuthor}
              isPaid={isPaid}
              currentUserId={currentUserId}
              compactHeader
              onCommentDone={() => load(postId)}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
