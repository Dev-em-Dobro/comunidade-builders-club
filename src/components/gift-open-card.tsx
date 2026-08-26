"use client";

import { useEffect, useId, useRef, useState } from "react";

const SIGNUP_ANCHOR = "cadastro-presente";

function GiftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8v13m0-13H7.5A2.5 2.5 0 0 1 5 5.5C5 4 6.5 3 8.2 3c2 0 3.3 1.7 3.8 5Zm0 0h4.5A2.5 2.5 0 0 0 19 5.5C19 4 17.5 3 15.8 3c-2 0-3.3 1.7-3.8 5ZM5 8h14v11.5A1.5 1.5 0 0 1 17.5 21h-11A1.5 1.5 0 0 1 5 19.5V8Z"
      />
    </svg>
  );
}

export function GiftOpenCard({
  href,
  title,
  sourceLabel,
  promptSignup,
}: {
  href: string;
  title: string;
  sourceLabel: string;
  promptSignup: boolean;
}) {
  const [open, setOpen] = useState(false);
  const awaitingReturn = useRef(false);
  const leftTheTab = useRef(false);
  const hiddenAt = useRef(0);
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!promptSignup) return;

    function onVisibility() {
      if (!awaitingReturn.current) return;
      if (document.visibilityState === "hidden") {
        leftTheTab.current = true;
        hiddenAt.current = Date.now();
        return;
      }
      if (document.visibilityState !== "visible" || !leftTheTab.current) {
        return;
      }
      // Clique em nova aba às vezes pisca hidden/visible — ignora volta rápida.
      if (Date.now() - hiddenAt.current < 700) {
        leftTheTab.current = false;
        return;
      }
      awaitingReturn.current = false;
      leftTheTab.current = false;
      setOpen(true);
    }

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [promptSignup]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function goToSignup() {
    setOpen(false);
    const el = document.getElementById(SIGNUP_ANCHOR);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => {
      const input = el?.querySelector<HTMLInputElement>("input");
      input?.focus();
    }, 350);
  }

  return (
    <>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          if (promptSignup) {
            awaitingReturn.current = true;
            leftTheTab.current = false;
          }
        }}
        className="group mt-5 block rounded-2xl border border-accent/25 bg-gradient-to-br from-accent/12 via-card to-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-accent/45 hover:shadow-md"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-sm">
            <GiftIcon />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
              Presente · {sourceLabel}
            </p>
            <p className="mt-1.5 font-[family-name:var(--font-outfit)] text-xl font-bold leading-snug tracking-tight text-foreground">
              {title}
            </p>
            <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
              Abrir presente
              <span
                aria-hidden
                className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              >
                ↗
              </span>
            </p>
            <p className="mt-1 text-xs text-muted">Abre em uma nova aba</p>
          </div>
        </div>
      </a>

      {open ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 cursor-pointer bg-foreground/40 backdrop-blur-[2px]"
            aria-label="Fechar"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-xl sm:p-6"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
              Builders Club
            </p>
            <h2
              id={titleId}
              className="mt-2 font-[family-name:var(--font-outfit)] text-xl font-bold"
            >
              Já leu o presente?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Crie sua conta grátis nesta página e pegue os outros presentes da
              comunidade.
            </p>
            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                ref={closeRef}
                type="button"
                className="btn-ghost cursor-pointer px-2 text-sm"
                onClick={() => setOpen(false)}
              >
                Agora não
              </button>
              <button
                type="button"
                className="btn-primary cursor-pointer text-sm"
                onClick={goToSignup}
              >
                Criar conta
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
