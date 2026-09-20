import Image, { type ImageProps } from "next/image";
import { podeOtimizarImagem } from "@/lib/images/hosts";

/**
 * F095 — `next/image` para host conhecido, `<img>` para o resto.
 *
 * Fechar o `remotePatterns` (que aceitava `hostname: "**"`, um proxy de imagem
 * aberto) esbarra num detalhe do Next: `next/image` com host fora da lista
 * **lança em render**. Como as URLs vêm do banco — capa colada por admin,
 * avatar de provedor, post antigo — uma única imagem de host esquecido
 * derrubaria a página inteira.
 *
 * Então a decisão de otimizar é tomada antes de chamar o componente. Host
 * conhecido otimiza; host de fora aparece igual, só que sem passar pelo
 * otimizador. O buraco fecha sem apostar no conteúdo do banco.
 *
 * Sem `"use client"`: serve nos dois lados, e quem importa define o contexto.
 */
export function SafeImage(props: ImageProps) {
  const { src, alt } = props;

  // Import estático (`StaticImageData`) é arquivo local — sempre otimizável.
  if (typeof src !== "string" || podeOtimizarImagem(src)) {
    return <Image {...props} alt={alt} />;
  }

  const { fill, priority, className, sizes, width, height, id, style } = props;

  /** `fill` no next/image é absolute cobrindo o pai relative. Replicado à mão. */
  const estiloFill: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
  };

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      id={id}
      src={src}
      alt={alt}
      className={className}
      sizes={sizes}
      style={fill ? { ...style, ...estiloFill } : style}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
    />
  );
}
