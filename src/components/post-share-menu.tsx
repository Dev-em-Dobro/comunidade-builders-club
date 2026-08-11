"use client";

import { useEffect, useRef, useState } from "react";

/** Menu ⋯ com “Copiar link” do post. */
export function PostShareMenu({ postId }: { postId: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function copyLink() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/posts/${postId}`
        : `/posts/${postId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
        setOpen(false);
      }, 1200);
    } catch {
      window.prompt("Copie o link:", url);
    }
  }

  return (
    <div
      className="relative shrink-0"
      ref={rootRef}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="btn-ghost cursor-pointer px-2 py-1 text-base leading-none text-muted"
        aria-label="Mais opções"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        ⋯
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-1 min-w-[10.5rem] rounded-xl border border-border bg-card py-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            className="w-full cursor-pointer px-3 py-2 text-left text-sm hover:bg-surface"
            onClick={() => void copyLink()}
          >
            {copied ? "Link copiado ✓" : "Copiar link"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
