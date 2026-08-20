"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type ReactNode } from "react";
import { toggleReactionAction, createCommentAction } from "@/actions/engagement";
import {
  deletePostAction,
  togglePinAction,
  updatePostAction,
} from "@/actions/posts";
import {
  deleteCommentAction,
  updateCommentAction,
} from "@/actions/engagement";
import { MentionTextarea } from "@/components/mention-textarea";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useUpgradeOptional } from "@/components/upgrade-modal";
import { MarkdownBody } from "@/lib/markdown";
import { UPGRADE_REQUIRED } from "@/lib/membership/errors";

const MEDIA_ACCEPT =
  "image/jpeg,image/png,image/gif,video/mp4,.jpg,.jpeg,.png,.gif,.mp4";

async function uploadFile(file: File): Promise<{ url: string; kind: string }> {
  const fd = new FormData();
  fd.set("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = (await res.json()) as {
    url?: string;
    kind?: string;
    error?: string;
  };
  if (!res.ok || !data.url) {
    throw new Error(data.error ?? "Falha no upload.");
  }
  return { url: data.url, kind: data.kind ?? "image" };
}

export function PostActions({
  postId,
  spaceSlug,
  liked,
  reactionCount,
  isAdmin,
  isAuthor,
  isPaid = true,
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
  isPaid?: boolean;
  pinned: boolean;
  body?: string;
  imageUrl?: string | null;
  linkUrl?: string | null;
  videoUrl?: string | null;
  /** Só gestão (editar/remover/fixar) — útil no card compacto. */
  compact?: boolean;
}) {
  const router = useRouter();
  const upgrade = useUpgradeOptional();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editLink, setEditLink] = useState(linkUrl ?? "");
  const [editImage, setEditImage] = useState(imageUrl ?? "");
  const [editVideo, setEditVideo] = useState(videoUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const canManage = Boolean(isPaid && (isAdmin || isAuthor));

  function openEditor() {
    setEditing((v) => !v);
    setEditError(null);
    setEditLink(linkUrl ?? "");
    setEditImage(imageUrl ?? "");
    setEditVideo(videoUrl ?? "");
  }

  async function onPickMedia(file: File | undefined) {
    if (!file) return;
    setEditError(null);
    setUploading(true);
    try {
      const result = await uploadFile(file);
      if (result.kind === "video") {
        setEditVideo(result.url);
        setEditImage("");
      } else {
        setEditImage(result.url);
        setEditVideo("");
      }
    } catch (e) {
      setEditError(e instanceof Error ? e.message : "Falha no upload.");
    } finally {
      setUploading(false);
    }
  }

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
            onClick={() => {
              if (!isPaid) {
                upgrade?.openUpgrade("reagir");
                return;
              }
              start(async () => {
                try {
                  await toggleReactionAction(postId);
                  router.refresh();
                } catch (e) {
                  if (
                    e instanceof Error &&
                    e.message.includes(UPGRADE_REQUIRED)
                  ) {
                    upgrade?.openUpgrade("reagir");
                  }
                }
              });
            }}
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
              onClick={openEditor}
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
          className="mt-3 space-y-3 rounded-xl border border-border bg-surface/40 p-3"
          action={(fd) => {
            setEditError(null);
            start(async () => {
              try {
                fd.set("postId", postId);
                fd.set("imageUrl", editImage);
                fd.set("linkUrl", editLink.trim());
                fd.set("videoUrl", editVideo);
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
          <div>
            <p className="text-xs font-medium text-muted">
              Mídia — jpg/png/gif (máx. 1 MB) ou mp4 (máx. 50 MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept={MEDIA_ACCEPT}
              className="hidden"
              disabled={uploading || pending}
              onChange={(e) => {
                void onPickMedia(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              className="btn-outline mt-2 cursor-pointer text-xs"
              disabled={uploading || pending}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading
                ? "Enviando…"
                : editImage || editVideo
                  ? "Trocar arquivo"
                  : "Escolher arquivo"}
            </button>
            {editImage ? (
              <div className="mt-2 flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={editImage}
                  alt=""
                  className="h-16 w-16 rounded-lg object-cover"
                />
                <button
                  type="button"
                  className="cursor-pointer text-xs text-red-600 hover:underline"
                  onClick={() => setEditImage("")}
                >
                  Remover imagem
                </button>
              </div>
            ) : null}
            {editVideo ? (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-muted">Vídeo anexado</span>
                <button
                  type="button"
                  className="cursor-pointer text-xs text-red-600 hover:underline"
                  onClick={() => setEditVideo("")}
                >
                  Remover vídeo
                </button>
              </div>
            ) : null}
          </div>
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
          <button
            type="submit"
            className="btn-primary text-xs"
            disabled={pending || uploading}
          >
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
  isPaid = true,
}: {
  postId: string;
  parentId?: string;
  placeholder?: string;
  onDone?: () => void;
  isPaid?: boolean;
}) {
  const router = useRouter();
  const upgrade = useUpgradeOptional();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const formId = parentId ? `comment-form-${parentId}` : "comment-form";

  if (!isPaid) {
    return (
      <div className="mt-3 rounded-xl border border-border bg-surface/40 p-4">
        <p className="text-sm text-muted">
          Comentários fazem parte do acesso completo.
        </p>
        <button
          type="button"
          className="btn-primary mt-3 cursor-pointer text-sm"
          onClick={() => upgrade?.openUpgrade("comentar")}
        >
          Desbloquear para comentar
        </button>
      </div>
    );
  }

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
            const msg =
              e instanceof Error ? e.message : "Falha ao comentar.";
            if (msg.includes(UPGRADE_REQUIRED)) {
              upgrade?.openUpgrade("comentar");
              return;
            }
            setError(msg);
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
  isPaid = true,
}: {
  postId: string;
  parentId: string;
  onDone?: () => void;
  isPaid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const upgrade = useUpgradeOptional();
  return (
    <div className="mt-2">
      <button
        type="button"
        className="cursor-pointer text-xs font-medium text-accent hover:underline"
        onClick={() => {
          if (!isPaid) {
            upgrade?.openUpgrade("comentar");
            return;
          }
          setOpen((v) => !v);
        }}
      >
        {open ? "Cancelar" : "Responder"}
      </button>
      {open && isPaid ? (
        <CommentForm
          postId={postId}
          parentId={parentId}
          isPaid={isPaid}
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

/** F045 — corpo do comentário; edição controlada pelo pai (botão ao lado de Remover). */
export function EditableCommentBody({
  commentId,
  postId,
  body,
  editing,
  onEditingChange,
}: {
  commentId: string;
  postId: string;
  body: string;
  editing: boolean;
  onEditingChange: (editing: boolean) => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (editing) {
    return (
      <form
        className="mt-1.5 space-y-2"
        action={(fd) => {
          setError(null);
          start(async () => {
            try {
              fd.set("commentId", commentId);
              fd.set("postId", postId);
              await updateCommentAction(fd);
              onEditingChange(false);
              router.refresh();
            } catch (e) {
              setError(e instanceof Error ? e.message : "Falha ao salvar.");
            }
          });
        }}
      >
        <MentionTextarea
          name="body"
          className="input min-h-20"
          defaultValue={body}
          required
          maxLength={5000}
        />
        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="btn-primary cursor-pointer text-xs"
            disabled={pending}
          >
            {pending ? "Salvando…" : "Salvar"}
          </button>
          <button
            type="button"
            className="btn-ghost cursor-pointer text-xs"
            disabled={pending}
            onClick={() => {
              setError(null);
              onEditingChange(false);
            }}
          >
            Cancelar
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="mt-1.5 text-sm leading-relaxed">
      <MarkdownBody
        body={body}
        className="space-y-1 text-sm leading-relaxed [&_p]:my-0"
      />
    </div>
  );
}

export function EditCommentButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="cursor-pointer text-xs text-accent hover:underline"
      onClick={onClick}
    >
      Editar
    </button>
  );
}

/** Card de comentário com Editar ao lado de Remover (posts e aulas). */
export function CommentCard({
  commentId,
  postId,
  authorName,
  body,
  createdAtLabel,
  canEdit,
  isAdmin,
  nested = false,
  replySlot,
}: {
  commentId: string;
  postId: string;
  authorName: string;
  body: string;
  createdAtLabel: string;
  canEdit: boolean;
  isAdmin: boolean;
  nested?: boolean;
  replySlot?: ReactNode;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div
      className={`post-card !p-4 ${nested ? "ml-6 !bg-surface/40" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{authorName}</p>
          <EditableCommentBody
            commentId={commentId}
            postId={postId}
            body={body}
            editing={editing}
            onEditingChange={setEditing}
          />
          <p className="mt-2 text-xs text-muted">{createdAtLabel}</p>
          {replySlot}
        </div>
        {canEdit || isAdmin ? (
          <div className="flex shrink-0 items-center gap-3">
            {canEdit && !editing ? (
              <EditCommentButton onClick={() => setEditing(true)} />
            ) : null}
            {isAdmin ? (
              <DeleteCommentButton commentId={commentId} postId={postId} />
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
