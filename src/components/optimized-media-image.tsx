import Image from "next/image";

type OptimizedMediaImageProps = {
  src: string;
  alt?: string;
  className?: string;
  /** Above-the-fold / LCP candidate — eager + fetchpriority=high. */
  priority?: boolean;
  /** Avatar (quadrado pequeno) vs imagem de post no feed/detalhe. */
  variant?: "avatar" | "feed" | "detail";
};

/**
 * Imagens de posts/avatares via next/image (WebP/AVIF + resize).
 * Corrige LCP mobile: blobs de ~1 MB não devem ir crus no viewport.
 */
export function OptimizedMediaImage({
  src,
  alt = "",
  className,
  priority = false,
  variant = "feed",
}: OptimizedMediaImageProps) {
  if (variant === "avatar") {
    return (
      <Image
        src={src}
        alt={alt}
        width={48}
        height={48}
        className={className}
        sizes="48px"
        priority={priority}
      />
    );
  }

  if (variant === "detail") {
    return (
      <Image
        src={src}
        alt={alt}
        width={1200}
        height={900}
        className={className}
        sizes="(max-width: 768px) 100vw, 720px"
        priority={priority}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={500}
      className={className}
      sizes="(max-width: 768px) 85vw, 640px"
      priority={priority}
    />
  );
}
