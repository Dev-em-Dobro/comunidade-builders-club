"use client";

import { useState, type ReactNode } from "react";

export function AulaDetailsTabs({
  info,
  comments,
  commentCount,
}: {
  info: ReactNode;
  comments: ReactNode;
  commentCount: number;
}) {
  const [tab, setTab] = useState<"info" | "comments">("info");

  return (
    <div>
      <div className="flex gap-6 border-b border-border">
        <button
          type="button"
          className={`-mb-px border-b-2 pb-2 text-sm font-semibold ${
            tab === "info"
              ? "border-accent text-accent"
              : "border-transparent text-muted hover:text-foreground"
          }`}
          onClick={() => setTab("info")}
        >
          Informações
        </button>
        <button
          type="button"
          className={`-mb-px border-b-2 pb-2 text-sm font-semibold ${
            tab === "comments"
              ? "border-accent text-accent"
              : "border-transparent text-muted hover:text-foreground"
          }`}
          onClick={() => setTab("comments")}
        >
          Comentários{commentCount > 0 ? ` (${commentCount})` : ""}
        </button>
      </div>
      <div className="pt-5">{tab === "info" ? info : comments}</div>
    </div>
  );
}
