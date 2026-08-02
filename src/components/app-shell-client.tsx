"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NOME_PRODUTO } from "@/lib/produto";
import { LogoutButton } from "@/components/logout-button";
import {
  NotificationBell,
  type NotifPreview,
} from "@/components/notification-bell";

type SpaceLink = { id: string; slug: string; name: string };

function SpaceNav({
  spaces,
  onNavigate,
}: {
  spaces: SpaceLink[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5">
      <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
        Spaces
      </p>
      <Link
        href="/"
        onClick={onNavigate}
        className={`nav-space ${pathname === "/" ? "nav-space-active" : ""}`}
      >
        Todos
      </Link>
      {spaces.map((s) => {
        const href = `/spaces/${s.slug}`;
        const active = pathname === href;
        return (
          <Link
            key={s.id}
            href={href}
            onClick={onNavigate}
            className={`nav-space ${active ? "nav-space-active" : ""}`}
          >
            {s.name}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter({
  unread,
  isAdmin,
  notifPreview,
  onNavigate,
}: {
  unread: number;
  isAdmin: boolean;
  notifPreview: NotifPreview[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <div className="mt-auto flex flex-col gap-0.5 border-t border-border pt-4">
      <Link
        href="/aulas"
        className={`btn-ghost justify-start ${pathname.startsWith("/aulas") ? "text-accent" : ""}`}
        onClick={onNavigate}
      >
        Aulas
      </Link>
      <Link href="/busca" className="btn-ghost justify-start" onClick={onNavigate}>
        Busca
      </Link>
      <NotificationBell unread={unread} items={notifPreview} />
      <Link href="/perfil" className="btn-ghost justify-start" onClick={onNavigate}>
        Perfil
      </Link>
      {isAdmin ? (
        <Link href="/admin" className="btn-ghost justify-start" onClick={onNavigate}>
          Admin
        </Link>
      ) : null}
      <LogoutButton />
    </div>
  );
}

export function AppShellClient({
  children,
  displayName,
  isAdmin,
  unread,
  spaces,
  avatarUrl,
  notifPreview,
}: {
  children: React.ReactNode;
  displayName: string;
  isAdmin: boolean;
  unread: number;
  spaces: SpaceLink[];
  avatarUrl?: string | null;
  notifPreview: NotifPreview[];
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const initial = displayName.slice(0, 1).toUpperCase();

  return (
    <div className="flex min-h-dvh w-full">
      <aside className="sticky top-0 hidden h-dvh w-[260px] shrink-0 flex-col border-r border-border bg-sidebar/95 p-5 backdrop-blur-md md:flex">
        <Link
          href="/"
          className="font-[family-name:var(--font-outfit)] text-xl font-bold tracking-tight text-foreground"
        >
          {NOME_PRODUTO}
        </Link>
        <div className="mt-4 flex items-center gap-2.5">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              className="h-8 w-8 rounded-full object-cover ring-2 ring-surface"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">
              {initial}
            </div>
          )}
          <p className="truncate text-sm font-medium text-foreground/90">
            {displayName}
          </p>
        </div>
        <div className="mt-8 flex min-h-0 flex-1 flex-col overflow-y-auto">
          <Link
            href="/nova"
            className={`nav-cta mb-5 ${pathname === "/nova" ? "nav-cta-active" : ""}`}
          >
            Nova publicação
          </Link>
          <SpaceNav spaces={spaces} />
        </div>
        <SidebarFooter
          unread={unread}
          isAdmin={isAdmin}
          notifPreview={notifPreview}
        />
      </aside>

      {drawerOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/30 backdrop-blur-[2px]"
            aria-label="Fechar menu"
            onClick={() => setDrawerOpen(false)}
          />
          <aside
            className="absolute inset-y-0 left-0 flex w-[min(86vw,280px)] flex-col bg-card p-5 shadow-xl animate-[slideInLeft_0.22s_ease-out]"
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-6 flex items-center justify-between">
              <p className="font-[family-name:var(--font-outfit)] text-lg font-bold">
                {NOME_PRODUTO}
              </p>
              <button
                type="button"
                className="btn-ghost text-xs"
                onClick={() => setDrawerOpen(false)}
              >
                Fechar
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              <Link
                href="/nova"
                className="nav-cta mb-5"
                onClick={() => setDrawerOpen(false)}
              >
                Nova publicação
              </Link>
              <SpaceNav spaces={spaces} onNavigate={() => setDrawerOpen(false)} />
            </div>
            <SidebarFooter
              unread={unread}
              isAdmin={isAdmin}
              notifPreview={notifPreview}
              onNavigate={() => setDrawerOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border/80 bg-background/85 px-4 py-3 backdrop-blur-md md:hidden">
          <button
            type="button"
            className="btn-ghost -ml-1"
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir spaces"
          >
            Menu
          </button>
          <Link
            href="/"
            className="font-[family-name:var(--font-outfit)] text-base font-bold"
          >
            {NOME_PRODUTO}
          </Link>
          <NotificationBell unread={unread} items={notifPreview} compact />
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-10">{children}</main>
      </div>
    </div>
  );
}
