"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { createPostAction } from "@/actions/posts";
import { MentionTextarea } from "@/components/mention-textarea";

const IMAGE_ACCEPT = "image/jpeg,image/png,image/gif,.jpg,.jpeg,.png,.gif";
const VIDEO_ACCEPT = "video/mp4,.mp4";

async function uploadFile(file: File): Promise<{ url: string; kind: string }> {
  const fd = new FormData();
  fd.set("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = (await res.json()) as { url?: string; kind?: string; error?: string };
  if (!res.ok || !data.url) {
    throw new Error(data.error ?? "Falha no upload.");
  }
  return { url: data.url, kind: data.kind ?? "image" };
}

export function Composer({
  spaces,
  defaultSpaceId,
}: {
  spaces: { id: string; name: string; slug?: string }[];
  defaultSpaceId?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [openExtra, setOpenExtra] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [uploading, setUploading] = useState<"image" | "video" | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  async function onPick(
    kind: "image" | "video",
    file: File | undefined,
  ) {
    if (!file) return;
    setError(null);
    setUploading(kind);
    try {
      const result = await uploadFile(file);
      if (result.kind === "video" || kind === "video") {
        setVideoUrl(result.url);
      } else {
        setImageUrl(result.url);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha no upload.");
    } finally {
      setUploading(null);
    }
  }

  return (
    <form
      className="post-card"
      action={(fd) => {
        setError(null);
        start(async () => {
          try {
            if (imageUrl) fd.set("imageUrl", imageUrl);
            if (videoUrl) fd.set("videoUrl", videoUrl);
            if (linkUrl.trim()) fd.set("linkUrl", linkUrl.trim());
            const result = await createPostAction(fd);
            router.push(`/posts/${result.id}`);
            router.refresh();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Falha ao publicar.");
          }
        });
      }}
      id="composer-form"
    >
      <p className="text-sm font-semibold text-foreground">Nova publicação</p>
      <p className="mt-1 text-xs text-muted">
        O título é gerado automaticamente a partir do início do texto. Links
        https no texto viram clicáveis (ex.: GitHub).
      </p>
      <label className="mt-3 block text-xs font-medium text-muted">
        Space
        <select
          name="spaceId"
          className="input mt-1.5 cursor-pointer"
          defaultValue={defaultSpaceId ?? spaces[0]?.id}
          required
        >
          {spaces.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <MentionTextarea
        name="body"
        className="input mt-3 min-h-36 resize-y text-[15px] leading-relaxed"
        placeholder="O que você quer compartilhar? Digite @ para mencionar… Cole um link https no texto ou anexe mídia abaixo."
        required
        maxLength={10000}
      />
      <p className="mt-1.5 text-[11px] text-muted">
        Markdown básico e @menções pelo display name do membro.
      </p>
      <button
        type="button"
        className="btn-ghost mt-2 -ml-1 cursor-pointer text-xs"
        onClick={() => setOpenExtra((v) => !v)}
      >
        {openExtra ? "Ocultar mídia" : "+ Imagem, vídeo ou link"}
      </button>
      {openExtra ? (
        <div className="mt-2 grid gap-3 rounded-xl border border-border/80 bg-surface/40 p-3">
          <div>
            <p className="text-xs font-medium text-muted">
              Imagem (jpg, png, gif · máx. 1 MB)
            </p>
            <input
              ref={imageInputRef}
              type="file"
              accept={IMAGE_ACCEPT}
              className="mt-1.5 block w-full cursor-pointer text-sm"
              disabled={!!uploading}
              onChange={(e) => {
                void onPick("image", e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            {imageUrl ? (
              <div className="mt-2 flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt=""
                  className="h-16 w-16 rounded-lg object-cover"
                />
                <button
                  type="button"
                  className="cursor-pointer text-xs text-red-600 hover:underline"
                  onClick={() => setImageUrl("")}
                >
                  Remover imagem
                </button>
              </div>
            ) : null}
          </div>
          <div>
            <p className="text-xs font-medium text-muted">
              Vídeo (mp4 · máx. 50 MB)
            </p>
            <input
              ref={videoInputRef}
              type="file"
              accept={VIDEO_ACCEPT}
              className="mt-1.5 block w-full cursor-pointer text-sm"
              disabled={!!uploading}
              onChange={(e) => {
                void onPick("video", e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            {videoUrl ? (
              <div className="mt-2 flex items-center gap-2">
                <span className="truncate text-xs text-muted">{videoUrl}</span>
                <button
                  type="button"
                  className="cursor-pointer text-xs text-red-600 hover:underline"
                  onClick={() => setVideoUrl("")}
                >
                  Remover vídeo
                </button>
              </div>
            ) : null}
          </div>
          <label className="block text-xs font-medium text-muted">
            Link (https:// — GitHub, docs, etc.)
            <input
              className="input mt-1.5"
              placeholder="https://github.com/…"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              maxLength={2000}
            />
          </label>
          {uploading ? (
            <p className="text-xs text-muted">
              Enviando {uploading === "image" ? "imagem" : "vídeo"}…
            </p>
          ) : null}
        </div>
      ) : null}
      {error ? (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          className="btn-primary min-w-28"
          disabled={pending || !!uploading}
        >
          {pending ? "Publicando…" : "Publicar"}
        </button>
      </div>
    </form>
  );
}
