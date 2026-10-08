"use client";

import { useState } from "react";
import { SafeImage as Image } from "@/components/safe-image";

export function ModuleCover({
  src,
  title,
  locked = false,
}: {
  src: string | null;
  title: string;
  locked?: boolean;
}) {
  /**
   * F072 — capa cinza é o que faz o estado ser lido pela imagem, de longe:
   * colorida abre, cinza não. O cadeado confirma; não é a única pista.
   * F110 — 404 da capa (arquivo ainda não no deploy) cai no gradiente,
   * não no retângulo vazio do `bg-surface`.
   */
  const [quebrada, setQuebrada] = useState(false);
  const bloqueada = locked ? " grayscale opacity-75" : "";
  if (src && !quebrada) {
    return (
      <Image
        src={src}
        alt=""
        fill
        className={`h-full w-full object-cover${bloqueada}`}
        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
        onError={() => setQuebrada(true)}
      />
    );
  }
  return (
    <div
      className={`flex h-full w-full items-end bg-gradient-to-br from-accent/80 to-accent-hover p-4${bloqueada}`}
    >
      <span className="font-[family-name:var(--font-outfit)] text-lg font-semibold text-accent-foreground">
        {title}
      </span>
    </div>
  );
}
