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
import { ConfirmDialog } from "@/components/confirm-dialog";

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
  compact = false,
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
  /** Só gestão (editar/remover/fixar) — útil no card compacto. */
  compact?: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editLink, setEditLink] = useState(linkUrl ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const canManage = Boolean(isAdmin || isAuthor);

  return (
    <div
      className={compact ? "mt-0" : "mt-4"}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div className="flex flex-wrap items-center gap-2">
        {!compact ? (
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
        ) : null}
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
                setEditLink(linkUrl ?? "");
              }}
            >
              {editing ? "Cancelar" : "Editar"}
            </button>
            <button
              type="button"
              className="btn-ghost cursor-pointer text-xs text-red-600"
              disabled={pending}
              onClick={() => setConfirmDelete(true)}
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
                fd.set("linkUrl", editLink.trim());
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
          <label className="block text-xs font-medium text-muted">
            Link anexado (https://)
            <input
              className="input mt-1.5"
              placeholder="https://github.com/…"
              value={editLink}
              onChange={(e) => setEditLink(e.target.value)}
              maxLength={2000}
            />
          </label>
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

      <ConfirmDialog
        open={confirmDelete}
        title="Remover publicação?"
        message="Essa ação não pode ser desfeita. O post e os comentários serão removidos."
        confirmLabel="Remover"
        danger
        pending={pending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() =>
          start(async () => {
            await deletePostAction(postId, spaceSlug);
            setConfirmDelete(false);
            window.location.href = `/spaces/${spaceSlug}`;
          })
        }
      />
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
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="cursor-pointer text-xs text-red-600 hover:underline"
        disabled={pending}
        onClick={() => setOpen(true)}
      >
        Remover
      </button>
      <ConfirmDialog
        open={open}
        title="Remover comentário?"
        message="Essa ação não pode ser desfeita."
        confirmLabel="Remover"
        danger
        pending={pending}
        onCancel={() => setOpen(false)}
        onConfirm={() =>
          start(async () => {
            await deleteCommentAction(commentId, postId);
            setOpen(false);
            router.refresh();
          })
        }
      />
    </>
  );
}
