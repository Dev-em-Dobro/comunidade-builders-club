"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { markReadAction } from "@/actions/notifications";

export type NotifPreview = {
  id: string;
  type: string;
  postId: string | null;
  snippet: string | null;
  createdAt: string;
  actorName: string;
  label: string;
};

function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className ?? "h-5 w-5"}
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

const POLL_MS = 25_000;

async function ensureBrowserPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  try {
    const result = await Notification.requestPermission();
    return result === "granted";
  } catch {
    return false;
  }
}

function showBrowserNotif(item: NotifPreview) {
  if (typeof window === "undefined" || Notification.permission !== "granted") {
    return;
  }
  try {
    const n = new Notification(`${item.actorName} ${item.label}`, {
      body: item.snippet ?? "Nova atividade na comunidade",
      tag: item.id,
    });
    n.onclick = () => {
      window.focus();
      if (item.postId) {
        window.location.href = `/posts/${item.postId}`;
      } else {
        window.location.href = "/notificacoes";
      }
      n.close();
    };
  } catch {
    /* ignore */
  }
}

export function NotificationBell({
  unread: initialUnread,
  items: initialItems,
  compact = false,
}: {
  unread: number;
  items: NotifPreview[];
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(initialUnread);
  const [items, setItems] = useState(initialItems);
  const [pending, start] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);
  const knownIdsRef = useRef<Set<string>>(new Set(initialItems.map((i) => i.id)));
  const router = useRouter();

  useEffect(() => {
    setUnread(initialUnread);
    setItems(initialItems);
    knownIdsRef.current = new Set(initialItems.map((i) => i.id));
  }, [initialUnread, initialItems]);

  useEffect(() => {
    let cancelled = false;
    void ensureBrowserPermission();

    const tick = async () => {
      try {
        const res = await fetch("/api/notifications/poll", {
          cache: "no-store",
        });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as {
          unread: number;
          items: NotifPreview[];
        };
        if (cancelled) return;

        const fresh = data.items.filter((i) => !knownIdsRef.current.has(i.id));
        for (const item of fresh) {
          showBrowserNotif(item);
          knownIdsRef.current.add(item.id);
        }
        for (const item of data.items) {
          knownIdsRef.current.add(item.id);
        }

        setUnread(data.unread);
        setItems(data.items);
      } catch {
        /* ignore rede */
      }
    };

    const id = window.setInterval(() => void tick(), POLL_MS);
    const onVis = () => {
      if (document.visibilityState === "visible") void tick();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

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

  return (
    <div className="relative z-[100]" ref={rootRef}>
      <button
        type="button"
        className={
          compact
            ? "btn-ghost relative cursor-pointer px-2"
            : "btn-ghost w-full cursor-pointer justify-start gap-2"
        }
        onClick={() => {
          void ensureBrowserPermission();
          setOpen((v) => !v);
        }}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={
          unread > 0
            ? `Notificações (${unread} não lidas)`
            : "Notificações"
        }
      >
        {compact ? (
          <BellIcon />
        ) : (
          <>
            <BellIcon className="h-4 w-4" />
            Notificações
          </>
        )}
        {unread > 0 ? (
          <span
            className={
              compact
                ? "absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent"
                : "ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white"
            }
          >
            {compact ? null : unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          className={`absolute z-[100] mt-2 w-[min(92vw,340px)] rounded-2xl border border-border bg-card p-2 shadow-xl ${
            compact ? "right-0" : "left-0 bottom-full mb-2 mt-0"
          }`}
          role="menu"
        >
          <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
            Recentes
          </p>
          {items.length === 0 ? (
            <p className="px-2 py-4 text-sm text-muted">
              Nenhuma notificação nova.
            </p>
          ) : (
            <ul className="max-h-80 space-y-1 overflow-y-auto">
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    className="w-full cursor-pointer rounded-xl px-2 py-2 text-left text-sm transition-colors hover:bg-surface disabled:opacity-50"
                    disabled={pending}
                    onClick={() =>
                      start(async () => {
                        await markReadAction(n.id);
                        setUnread((u) => Math.max(0, u - 1));
                        setItems((list) => list.filter((x) => x.id !== n.id));
                        setOpen(false);
                        router.push(
                          n.postId ? `/posts/${n.postId}` : "/notificacoes",
                        );
                        router.refresh();
                      })
                    }
                  >
                    <span className="font-semibold">{n.actorName}</span>{" "}
                    <span className="text-foreground/80">{n.label}</span>
                    {n.snippet ? (
                      <span className="mt-0.5 block truncate text-xs text-muted">
                        {n.snippet}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/notificacoes"
            className="mt-1 block cursor-pointer rounded-xl px-2 py-2 text-center text-xs font-medium text-accent hover:bg-surface"
            onClick={() => setOpen(false)}
          >
            Ver todas
          </Link>
        </div>
      ) : null}
    </div>
  );
}
