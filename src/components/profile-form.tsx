"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProfileAction } from "@/actions/profile";

const IMAGE_ACCEPT = "image/jpeg,image/png,image/gif,.jpg,.jpeg,.png,.gif";

async function uploadImage(file: File): Promise<string> {
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
  if (data.kind === "video") {
    throw new Error("Use apenas imagens (jpg, png ou gif · máx. 1 MB).");
  }
  return data.url;
}

export function ProfileForm({
  displayName,
  bio,
  avatarUrl: initialAvatar,
}: {
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatar ?? "");
  const [uploading, setUploading] = useState(false);

  async function onPick(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setAvatarUrl(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha no upload.");
    } finally {
      setUploading(false);
    }
  }

  const initial = displayName.slice(0, 1).toUpperCase();

  return (
    <form
      className="post-card mt-6 max-w-lg space-y-3"
      action={(fd) => {
        setError(null);
        start(async () => {
          try {
            fd.set("avatarUrl", avatarUrl);
            await updateProfileAction(fd);
            router.refresh();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Falha ao salvar.");
          }
        });
      }}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt=""
          className="h-16 w-16 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface text-lg font-bold text-accent">
          {initial}
        </div>
      )}
      <label className="block text-xs font-medium text-muted">
        Nome
        <input
          name="displayName"
          className="input mt-1"
          defaultValue={displayName}
          required
          maxLength={80}
        />
      </label>
      <label className="block text-xs font-medium text-muted">
        Bio
        <textarea
          name="bio"
          className="input mt-1 min-h-24"
          defaultValue={bio ?? ""}
          maxLength={500}
        />
      </label>
      <div>
        <p className="text-xs font-medium text-muted">
          Foto de perfil — jpg, png ou gif (máx. 1 MB)
        </p>
        <input
          ref={fileRef}
          type="file"
          accept={IMAGE_ACCEPT}
          className="hidden"
          disabled={uploading || pending}
          onChange={(e) => {
            void onPick(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-outline cursor-pointer text-xs"
            disabled={uploading || pending}
            onClick={() => fileRef.current?.click()}
          >
            {uploading
              ? "Enviando…"
              : avatarUrl
                ? "Trocar foto"
                : "Escolher arquivo"}
          </button>
          {avatarUrl ? (
            <button
              type="button"
              className="cursor-pointer text-xs text-red-600 hover:underline"
              disabled={uploading || pending}
              onClick={() => setAvatarUrl("")}
            >
              Remover foto
            </button>
          ) : null}
        </div>
      </div>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        className="btn-primary"
        disabled={pending || uploading}
      >
        {pending ? "Salvando…" : "Salvar"}
      </button>
    </form>
  );
}
