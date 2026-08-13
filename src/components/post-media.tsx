/** Bloco de mídia anexada ao post (imagem, vídeo, link). */

import { OptimizedMediaImage } from "@/components/optimized-media-image";

function isInternalMarker(url: string) {
  return url.startsWith("builders-club://");
}

export function PostMedia({
  imageUrl,
  videoUrl,
  linkUrl,
  /** No feed compacto pode cortar; no detalhe/expandido mostra inteira. */
  cropImage = false,
  priority = false,
}: {
  imageUrl?: string | null;
  videoUrl?: string | null;
  linkUrl?: string | null;
  cropImage?: boolean;
  priority?: boolean;
}) {
  const publicLink =
    linkUrl && !isInternalMarker(linkUrl) ? linkUrl : null;

  if (!imageUrl && !videoUrl && !publicLink) return null;

  return (
    <div className="mt-3 space-y-3">
      {imageUrl ? (
        <div className="overflow-hidden rounded-xl bg-surface/60">
          <OptimizedMediaImage
            src={imageUrl}
            variant={cropImage ? "feed" : "detail"}
            priority={priority}
            className={
              cropImage
                ? "max-h-40 w-full object-cover"
                : "mx-auto max-h-[min(70vh,36rem)] w-full object-contain"
            }
          />
        </div>
      ) : null}
      {videoUrl ? (
        <video
          src={videoUrl}
          controls
          preload="metadata"
          className="max-h-[min(70vh,36rem)] w-full rounded-xl bg-foreground/5"
        />
      ) : null}
      {publicLink ? (
        <a
          href={publicLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface/50 px-3 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-surface"
        >
          <span className="truncate" title={publicLink}>
            {publicLink}
          </span>
          <span className="shrink-0 text-xs text-muted">↗</span>
        </a>
      ) : null}
    </div>
  );
}
