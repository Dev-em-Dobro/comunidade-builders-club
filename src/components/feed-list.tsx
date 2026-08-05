"use client";

import { useEffect, useState } from "react";
import { PostCard, type PostCardData } from "@/components/post-card";

const STORAGE_KEY = "builders-club-feed-view";

export type FeedViewMode = "compact" | "expanded";

function IconCompact({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 ${active ? "text-accent" : "text-muted"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  );
}

function IconExpanded({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 ${active ? "text-accent" : "text-muted"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  );
}

export function FeedViewToggle({
  value,
  onChange,
}: {
  value: FeedViewMode;
  onChange: (v: FeedViewMode) => void;
}) {
  return (
    <div
      className="inline-flex items-center rounded-lg border border-border bg-card p-0.5"
      role="group"
      aria-label="Modo de visualização do feed"
    >
      <button
        type="button"
        className={`cursor-pointer rounded-md px-2.5 py-1.5 ${value === "compact" ? "bg-accent/10" : ""}`}
        aria-pressed={value === "compact"}
        title="Visão reduzida"
        onClick={() => onChange("compact")}
      >
        <IconCompact active={value === "compact"} />
        <span className="sr-only">Reduzida</span>
      </button>
      <button
        type="button"
        className={`cursor-pointer rounded-md px-2.5 py-1.5 ${value === "expanded" ? "bg-accent/10" : ""}`}
        aria-pressed={value === "expanded"}
        title="Visão expandida"
        onClick={() => onChange("expanded")}
      >
        <IconExpanded active={value === "expanded"} />
        <span className="sr-only">Expandida</span>
      </button>
    </div>
  );
}

export function FeedList({
  posts,
  showSpace = true,
  isAdmin,
  currentUserId,
}: {
  posts: PostCardData[];
  showSpace?: boolean;
  isAdmin: boolean;
  currentUserId: string;
}) {
  const [view, setView] = useState<FeedViewMode>("compact");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "expanded" || stored === "compact") setView(stored);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  function changeView(v: FeedViewMode) {
    setView(v);
    try {
      localStorage.setItem(STORAGE_KEY, v);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <FeedViewToggle value={view} onChange={changeView} />
      </div>
      <div className={`space-y-3 ${ready ? "" : "opacity-90"}`}>
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            showSpace={showSpace}
            variant={view}
            isAdmin={isAdmin}
            currentUserId={currentUserId}
          />
        ))}
      </div>
    </>
  );
}
