/** Validação e persistência de uploads de mídia (ADR-008). */

import { put } from "@vercel/blob";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";

export const MAX_IMAGE_BYTES = 1 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
]);

const VIDEO_TYPES = new Set(["video/mp4"]);

export type UploadKind = "image" | "video";

export function detectUploadKind(
  mime: string,
): UploadKind | null {
  if (IMAGE_TYPES.has(mime)) return "image";
  if (VIDEO_TYPES.has(mime)) return "video";
  return null;
}

export function maxBytesForKind(kind: UploadKind): number {
  return kind === "image" ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
}

function extensionFor(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/gif":
      return "gif";
    case "video/mp4":
      return "mp4";
    default:
      return "bin";
  }
}

export async function storeUpload(file: File): Promise<{
  url: string;
  kind: UploadKind;
}> {
  const kind = detectUploadKind(file.type);
  if (!kind) {
    throw new Error("Formato inválido. Use jpg, png, gif ou mp4.");
  }
  const max = maxBytesForKind(kind);
  if (file.size > max) {
    const label =
      kind === "image" ? "Imagens: máximo 1 MB." : "Vídeos: máximo 50 MB.";
    throw new Error(label);
  }

  const ext = extensionFor(file.type);
  const name = `posts/${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();

  if (token) {
    const blob = await put(name, file, {
      access: "public",
      contentType: file.type,
      token,
    });
    return { url: blob.url, kind };
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Upload indisponível: configure BLOB_READ_WRITE_TOKEN na Vercel.",
    );
  }

  const dir = path.join(process.cwd(), "public", "uploads", "posts");
  await mkdir(dir, { recursive: true });
  const filename = path.basename(name);
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buf);
  return { url: `/uploads/posts/${filename}`, kind };
}
