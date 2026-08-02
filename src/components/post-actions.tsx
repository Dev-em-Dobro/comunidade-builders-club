"use client";

import { useState, useTransition } from "react";
import { toggleReactionAction, createCommentAction } from "@/actions/engagement";
import { deletePostAction, togglePinAction } from "@/actions/posts";
import { deleteCommentAction } from "@/actions/engagement";

export function PostActions({
  postId,
  spaceSlug,
  liked,
  reactionCount,
  isAdmin,
  pinned,
}: {
  postId: string;
  spaceSlug: string;
  liked: boolean;
  reactionCount: number;
  isAdmin: boolean;
  pinned: boolean;
}) {
  const [pending, start] = useTransition();

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <button
        type="button"
        className="btn-outline text-xs"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await toggleReactionAction(postId);
          })
        }
      >
        {liked ? "Remover reação" : "Reagir"} ({reactionCount})
      </button>
      {isAdmin ? (
        <>
          <button
            type="button"
            className="btn-ghost text-xs"
            disabled={pending}
            onClick={() =>
              start(() => togglePinAction(postId, spaceSlug, !pinned))
            }
          >
            {pinned ? "Desafixar" : "Fixar"}
          </button>
          <button
            type="button"
            className="btn-ghost text-xs text-red-600"
            disabled={pending}
            onClick={() =>
              start(async () => {
                if (confirm("Remover este post?")) {
                  await deletePostAction(postId, spaceSlug);
                  window.location.href = `/spaces/${spaceSlug}`;
                }
              })
            }
          >
            Remover
          </button>
        </>
      ) : null}
    </div>
  );
}

export function CommentForm({ postId }: { postId: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  return (
    <form
      className="mt-4"
      action={(fd) => {
        setError(null);
        setOk(false);
        start(async () => {
          try {
            await createCommentAction(fd);
            (document.getElementById("comment-form") as HTMLFormElement)?.reset();
            setOk(true);
            window.setTimeout(() => setOk(false), 2000);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Falha ao comentar.");
          }
        });
      }}
      id="comment-form"
    >
      <input type="hidden" name="postId" value={postId} />
      <textarea
        name="body"
        className="input min-h-24"
        placeholder="Escreva um comentário…"
        required
        maxLength={5000}
      />
      {error ? (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {ok ? (
        <p className="mt-2 text-sm font-medium text-accent" role="status">
          Comentário enviado
        </p>
      ) : null}
      <button type="submit" className="btn-primary mt-3" disabled={pending}>
        {pending ? "Enviando…" : "Comentar"}
      </button>
    </form>
  );
}

export function DeleteCommentButton({
  commentId,
  postId,
}: {
  commentId: string;
  postId: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className="text-xs text-red-600 hover:underline"
      disabled={pending}
      onClick={() =>
        start(() => {
          if (confirm("Remover comentário?")) {
            return deleteCommentAction(commentId, postId);
          }
        })
      }
    >
      Remover
    </button>
  );
}
