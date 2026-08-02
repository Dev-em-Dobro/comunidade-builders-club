"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createPostAction } from "@/actions/posts";

export function Composer({
  spaces,
  defaultSpaceId,
}: {
  spaces: { id: string; name: string }[];
  defaultSpaceId?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [openExtra, setOpenExtra] = useState(false);

  return (
    <form
      className="post-card"
      action={(fd) => {
        setError(null);
        start(async () => {
          try {
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
        O título é gerado automaticamente a partir do início do texto.
      </p>
      <label className="mt-3 block text-xs font-medium text-muted">
        Space
        <select
          name="spaceId"
          className="input mt-1.5"
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
      <textarea
        name="body"
        className="input mt-3 min-h-36 resize-y text-[15px] leading-relaxed"
        placeholder="O que você quer compartilhar? **negrito**, *itálico*, `código`, [link](https://…) e @Nome"
        required
        maxLength={10000}
      />
      <p className="mt-1.5 text-[11px] text-muted">
        Markdown básico e @menções pelo display name do membro.
      </p>
      <button
        type="button"
        className="btn-ghost mt-2 -ml-1 text-xs"
        onClick={() => setOpenExtra((v) => !v)}
      >
        {openExtra ? "Ocultar mídia" : "+ Imagem, link ou vídeo"}
      </button>
      {openExtra ? (
        <div className="mt-2 grid gap-2 rounded-xl border border-border/80 bg-surface/40 p-3">
          <input name="imageUrl" className="input" placeholder="URL da imagem" />
          <input name="linkUrl" className="input" placeholder="URL do link" />
          <input name="videoUrl" className="input" placeholder="URL do vídeo" />
        </div>
      ) : null}
      {error ? (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-4 flex justify-end">
        <button type="submit" className="btn-primary min-w-28" disabled={pending}>
          {pending ? "Publicando…" : "Publicar"}
        </button>
      </div>
    </form>
  );
}
