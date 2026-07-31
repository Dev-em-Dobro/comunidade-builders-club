"use client";

import { useState, useTransition } from "react";
import { createPostAction } from "@/actions/posts";

export function Composer({
  spaces,
  defaultSpaceId,
}: {
  spaces: { id: string; name: string }[];
  defaultSpaceId?: string;
}) {
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
            await createPostAction(fd);
            const form = document.getElementById("composer-form") as HTMLFormElement | null;
            form?.reset();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Falha ao publicar.");
          }
        });
      }}
      id="composer-form"
    >
      <label className="text-xs font-medium text-muted">
        Space
        <select
          name="spaceId"
          className="input mt-1"
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
        className="input mt-3 min-h-24 resize-y"
        placeholder="O que você quer compartilhar?"
        required
        maxLength={10000}
      />
      <button
        type="button"
        className="btn-ghost mt-2 text-xs"
        onClick={() => setOpenExtra((v) => !v)}
      >
        {openExtra ? "Ocultar mídia" : "Adicionar imagem / link / vídeo"}
      </button>
      {openExtra ? (
        <div className="mt-2 grid gap-2">
          <input name="imageUrl" className="input" placeholder="URL da imagem" />
          <input name="linkUrl" className="input" placeholder="URL do link" />
          <input name="videoUrl" className="input" placeholder="URL do vídeo" />
        </div>
      ) : null}
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      <div className="mt-3 flex justify-end">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Publicando…" : "Publicar"}
        </button>
      </div>
    </form>
  );
}
