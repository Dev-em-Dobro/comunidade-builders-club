/** Validação e persistência de uploads de mídia (ADR-008). */

import { put } from "@vercel/blob";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";

export const MAX_IMAGE_BYTES = 1 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

/** Largura máxima ao otimizar (feed mobile ~400 CSS px × 2x). */
const MAX_IMAGE_EDGE = 1600;

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
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
    case "image/webp":
      return "webp";
    case "video/mp4":
      return "mp4";
    default:
      return "bin";
  }
}

/**
 * Redimensiona e converte para WebP (exceto GIF animado).
 * Corta o peso das imagens do feed sem mudar o limite de upload do cliente.
 */
async function optimizeImageUpload(
  file: File,
): Promise<{ body: Buffer | File; contentType: string; ext: string }> {
  if (file.type === "image/gif") {
    return {
      body: file,
      contentType: file.type,
      ext: extensionFor(file.type),
    };
  }

  try {
    const sharp = (await import("sharp")).default;
    const input = Buffer.from(await file.arrayBuffer());
    const body = await sharp(input)
      .rotate()
      .resize({
        width: MAX_IMAGE_EDGE,
        height: MAX_IMAGE_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toBuffer();
    return { body, contentType: "image/webp", ext: "webp" };
  } catch {
    return {
      body: file,
      contentType: file.type,
      ext: extensionFor(file.type),
    };
  }
}

export async function storeUpload(file: File): Promise<{
  url: string;
  kind: UploadKind;
}> {
  const kind = detectUploadKind(file.type);
  if (!kind) {
    throw new Error("Formato inválido. Use jpg, png, gif, webp ou mp4.");
  }
  const max = maxBytesForKind(kind);
  if (file.size > max) {
    const label =
      kind === "image" ? "Imagens: máximo 1 MB." : "Vídeos: máximo 50 MB.";
    throw new Error(label);
  }

  let body: Buffer | File = file;
  let contentType = file.type;
  let ext = extensionFor(file.type);

  if (kind === "image") {
    const optimized = await optimizeImageUpload(file);
    body = optimized.body;
    contentType = optimized.contentType;
    ext = optimized.ext;
  }

  const name = `posts/${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();

  if (token) {
    const blob = await put(name, body, {
      access: "public",
      contentType,
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
  const buf = Buffer.isBuffer(body)
    ? body
    : Buffer.from(await body.arrayBuffer());
  await writeFile(path.join(dir, filename), buf);
  return { url: `/uploads/posts/${filename}`, kind };
}
