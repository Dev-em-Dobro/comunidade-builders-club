"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toggleReactionAction, createCommentAction } from "@/actions/engagement";
import {
  deletePostAction,
  togglePinAction,
  updatePostAction,
} from "@/actions/posts";
import { deleteCommentAction } from "@/actions/engagement";
import { MentionTextarea } from "@/components/mention-textarea";

export function PostActions({
  postId,
  spaceSlug,
  liked,
  reactionCount,
  isAdmin,
  isAuthor,
  pinned,
  body,
  imageUrl,
  linkUrl,
  videoUrl,
}: {
  postId: string;
  spaceSlug: string;
  liked: boolean;
  reactionCount: number;
  isAdmin: boolean;
  isAuthor?: boolean;
  pinned: boolean;
  body?: string;
  imageUrl?: string | null;
  linkUrl?: string | null;
  videoUrl?: string | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const canManage = Boolean(isAdmin || isAuthor);

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="btn-outline cursor-pointer text-xs"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await toggleReactionAction(postId);
              router.refresh();
            })
          }
        >
          {liked ? "Remover reação" : "Reagir"} ({reactionCount})
        </button>
        {isAdmin ? (
          <button
            type="button"
            className="btn-ghost cursor-pointer text-xs"
            disabled={pending}
            onClick={() =>
              start(() => togglePinAction(postId, spaceSlug, !pinned))
            }
          >
            {pinned ? "Desafixar" : "Fixar"}
          </button>
        ) : null}
        {canManage ? (
          <>
            <button
              type="button"
              className="btn-ghost cursor-pointer text-xs"
              disabled={pending}
              onClick={() => {
                setEditing((v) => !v);
                setEditError(null);
              }}
            >
              {editing ? "Cancelar edição" : "Editar"}
            </button>
            <button
              type="button"
              className="btn-ghost cursor-pointer text-xs text-red-600"
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

      {editing && body !== undefined ? (
        <form
          className="mt-3 space-y-2 rounded-xl border border-border bg-surface/40 p-3"
          action={(fd) => {
            setEditError(null);
            start(async () => {
              try {
                fd.set("postId", postId);
                fd.set("imageUrl", imageUrl ?? "");
                fd.set("linkUrl", linkUrl ?? "");
                fd.set("videoUrl", videoUrl ?? "");
                await updatePostAction(fd);
                setEditing(false);
                router.refresh();
              } catch (e) {
                setEditError(
                  e instanceof Error ? e.message : "Falha ao salvar.",
                );
              }
            });
          }}
        >
          <MentionTextarea
            name="body"
            className="input min-h-28"
            defaultValue={body}
            required
            maxLength={10000}
          />
          {editError ? (
            <p className="text-sm text-red-600" role="alert">
              {editError}
            </p>
          ) : null}
          <button type="submit" className="btn-primary text-xs" disabled={pending}>
            {pending ? "Salvando…" : "Salvar"}
          </button>
        </form>
      ) : null}
    </div>
  );
}

export function CommentForm({
  postId,
  parentId,
  placeholder,
  onDone,
}: {
  postId: string;
  parentId?: string;
  placeholder?: string;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const formId = parentId ? `comment-form-${parentId}` : "comment-form";

  return (
    <form
      className="mt-3"
      key={formKey}
      action={(fd) => {
        setError(null);
        start(async () => {
          try {
            await createCommentAction(fd);
            setFormKey((k) => k + 1);
            onDone?.();
            router.refresh();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Falha ao comentar.");
          }
        });
      }}
      id={formId}
    >
      <input type="hidden" name="postId" value={postId} />
      {parentId ? <input type="hidden" name="parentId" value={parentId} /> : null}
      <MentionTextarea
        name="body"
        className="input min-h-20"
        placeholder={
          placeholder ?? "Comente… digite @ para mencionar um membro"
        }
        required
        maxLength={5000}
      />
      {error ? (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" className="btn-primary mt-3 cursor-pointer" disabled={pending}>
        {pending ? "Enviando…" : parentId ? "Responder" : "Comentar"}
      </button>
    </form>
  );
}

export function ReplyToggle({
  postId,
  parentId,
  onDone,
}: {
  postId: string;
  parentId: string;
  onDone?: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button
        type="button"
        className="cursor-pointer text-xs font-medium text-accent hover:underline"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Cancelar" : "Responder"}
      </button>
      {open ? (
        <CommentForm
          postId={postId}
          parentId={parentId}
          placeholder="Responder… digite @ para mencionar"
          onDone={() => {
            setOpen(false);
            onDone?.();
          }}
        />
      ) : null}
    </div>
  );
}

export function DeleteCommentButton({
  commentId,
  postId,
}: {
  commentId: string;
  postId: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className="cursor-pointer text-xs text-red-600 hover:underline"
      disabled={pending}
      onClick={() =>
        start(async () => {
          if (confirm("Remover comentário?")) {
            await deleteCommentAction(commentId, postId);
            router.refresh();
          }
        })
      }
    >
      Remover
    </button>
  );
}
