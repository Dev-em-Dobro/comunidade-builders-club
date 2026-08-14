"use client";

import { useEffect, useState } from "react";
import { applyTheme, readDocumentTheme, type Theme } from "@/lib/theme";

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0"
      aria-hidden
    >
      <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5z" />
    </svg>
  );
}

export function ThemeToggle({
  variant = "menu",
}: {
  variant?: "menu" | "icon";
}) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(readDocumentTheme());
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  }

  const label =
    theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro";

  if (variant === "icon") {
    return (
      <button
        type="button"
        className="btn-ghost px-2"
        onClick={toggle}
        aria-label={label}
        title={label}
      >
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      </button>
    );
  }

  return (
    <button
      type="button"
      className="btn-ghost w-full justify-start gap-2 text-left"
      onClick={toggle}
      aria-label={label}
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      {theme === "dark" ? "Tema claro" : "Tema escuro"}
    </button>
  );
}
