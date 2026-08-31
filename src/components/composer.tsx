"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { createPostAction } from "@/actions/posts";
import { MentionTextarea } from "@/components/mention-textarea";
import { PRESENTES_SPACE_SLUG } from "@/lib/spaces/constants";
import { detectarCtaNoCorpo, type AchadoCta } from "@/lib/gifts/cta-no-corpo";

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

export function Composer({
  spaces,
  defaultSpaceId,
  isAdmin = false,
}: {
  spaces: { id: string; name: string; slug?: string }[];
  defaultSpaceId?: string;
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [openExtra, setOpenExtra] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [spaceId, setSpaceId] = useState(defaultSpaceId ?? spaces[0]?.id ?? "");
  /** F070 — CTA achado no corpo do Presente, antes de gastar um round-trip. */
  const [ctaAchados, setCtaAchados] = useState<AchadoCta[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selected = spaces.find((s) => s.id === spaceId);
  const showGiftSlug = isAdmin && selected?.slug === PRESENTES_SPACE_SLUG;

  async function onPick(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const result = await uploadFile(file);
      if (result.kind === "video") {
        setVideoUrl(result.url);
        setImageUrl("");
      } else {
        setImageUrl(result.url);
        setVideoUrl("");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha no upload.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      className="post-card"
      action={(fd) => {
        setError(null);
        setCtaAchados([]);
        /**
         * F070 — mesma função pura que o servidor usa em createPost. Aqui é
         * só conveniência: mostra o trecho apontado sem ida ao servidor. O
         * gate que vale está em `src/lib/posts`.
         */
        if (showGiftSlug) {
          const achados = detectarCtaNoCorpo(String(fd.get("body") ?? ""));
          if (achados.length) {
            setCtaAchados(achados);
            return;
          }
        }
        start(async () => {
          try {
            if (imageUrl) fd.set("imageUrl", imageUrl);
            if (videoUrl) fd.set("videoUrl", videoUrl);
            if (linkUrl.trim()) fd.set("linkUrl", linkUrl.trim());
            const result = await createPostAction(fd);
            if (result.giftSlug) {
              router.push(`/presentes/${result.giftSlug}`);
            } else {
              router.push(`/posts/${result.id}`);
            }
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
          value={spaceId}
          onChange={(e) => setSpaceId(e.target.value)}
          required
        >
          {spaces.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      {showGiftSlug ? (
        <label className="mt-3 block text-xs font-medium text-muted">
          Slug público (URL do Instagram)
          <input
            className="input mt-1.5 font-mono"
            name="slug"
            required
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            minLength={2}
            maxLength={80}
            placeholder="agent-reach"
          />
          <span className="mt-1 block text-[11px]">
            Vira /presentes/agent-reach. Sem slug o post não é público.
          </span>
        </label>
      ) : null}
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
        <div className="mt-2 space-y-3 rounded-xl border border-border/80 bg-surface/40 p-3">
          <div>
            <p className="text-xs font-medium text-muted">
              Arquivo de mídia — imagens jpg/png/gif (máx. 1 MB) ou vídeo mp4
              (máx. 50 MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept={MEDIA_ACCEPT}
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                void onPick(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              className="btn-outline mt-2 cursor-pointer text-xs"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? "Enviando…" : "Escolher arquivo"}
            </button>
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
            {videoUrl ? (
              <div className="mt-2 flex items-center gap-2">
                <span className="truncate text-xs text-muted">Vídeo anexado</span>
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
        </div>
      ) : null}
      {ctaAchados.length ? (
        <div
          className="mt-3 rounded-xl border border-red-500/40 bg-red-500/5 px-3 py-2.5"
          role="alert"
        >
          <p className="text-sm font-semibold text-red-600">
            O corpo do Presente não leva o CTA final.
          </p>
          <p className="mt-1 text-xs text-muted">
            O bloco de promessa e o cadastro são do app e mudam conforme a
            leitora esteja deslogada, free ou paga. O artigo termina no
            assunto.
          </p>
          <ul className="mt-2 space-y-1.5">
            {ctaAchados.map((a, i) => (
              <li key={`${a.regra}-${i}`} className="text-xs">
                <span className="font-mono text-red-600">{a.regra}</span>
                <span className="text-muted"> — {a.motivo}</span>
                <span className="mt-0.5 block break-words text-muted/80">
                  “{a.trecho}”
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {error ? (
        <p className="mt-3 whitespace-pre-line text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          className="btn-primary min-w-28"
          disabled={pending || uploading}
        >
          {pending ? "Publicando…" : "Publicar"}
        </button>
      </div>
    </form>
  );
}
