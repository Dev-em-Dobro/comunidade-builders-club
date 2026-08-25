"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { NOME_PRODUTO } from "@/lib/produto";
import { LogoutButton } from "@/components/logout-button";
import {
  NotificationBell,
  type NotifPreview,
} from "@/components/notification-bell";
import { MateriaisNav } from "@/components/materiais-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { UpgradeProvider, useUpgrade } from "@/components/upgrade-modal";
import { PlanBadge } from "@/components/plan-badge";
import { isFreeSpaceSlug } from "@/lib/membership/capabilities";
import {
  ICON_ADMIN,
  ICON_AULAS,
  ICON_BUSCA,
  ICON_NOVA,
  ICON_PLANOS,
  ICON_PERFIL,
  ICON_PROGRESSO,
  ICON_TODOS,
  iconForSpace,
} from "@/components/nav-icons";

function OrionIcon() {
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
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2" />
      <path d="M12 19v2" />
      <path d="m5.6 5.6 1.4 1.4" />
      <path d="m17 17 1.4 1.4" />
      <path d="M3 12h2" />
      <path d="M19 12h2" />
      <path d="m5.6 18.4 1.4-1.4" />
      <path d="m17 7 1.4-1.4" />
    </svg>
  );
}

type SpaceLink = { id: string; slug: string; name: string };

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-3.5 w-3.5 shrink-0 opacity-70"}
      aria-hidden
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function FeedLink({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <Link
      href="/"
      onClick={onNavigate}
      className={`nav-space flex items-center gap-2 ${pathname === "/" ? "nav-space-active" : ""}`}
    >
      {ICON_TODOS}
      <span className="truncate">Feed</span>
    </Link>
  );
}

function SpaceNav({
  spaces,
  isPaid,
  onNavigate,
}: {
  spaces: SpaceLink[];
  isPaid: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { openUpgrade } = useUpgrade();

  return (
    <nav className="flex flex-col gap-0.5">
      <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
        Spaces
      </p>
      {spaces.map((s) => {
        const href = `/spaces/${s.slug}`;
        const active = pathname === href;
        const locked = !isPaid && !isFreeSpaceSlug(s.slug);
        if (locked) {
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                openUpgrade("space");
                onNavigate?.();
              }}
              className="nav-space flex w-full cursor-pointer items-center gap-2 text-left opacity-80"
            >
              {iconForSpace(s.slug)}
              <span className="min-w-0 flex-1 truncate">{s.name}</span>
              <LockIcon />
            </button>
          );
        }
        return (
          <Link
            key={s.id}
            href={href}
            onClick={onNavigate}
            className={`nav-space flex items-center gap-2 ${active ? "nav-space-active" : ""}`}
          >
            {iconForSpace(s.slug)}
            <span className="truncate">{s.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter({
  unread,
  isAdmin,
  isPaid,
  isElite,
  orionUrl,
  notifPreview,
  onNavigate,
}: {
  unread: number;
  isAdmin: boolean;
  isPaid: boolean;
  isElite: boolean;
  orionUrl: string;
  notifPreview: NotifPreview[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { openUpgrade } = useUpgrade();

  function LockedGhost({
    label,
    icon,
    reason,
    active,
  }: {
    label: string;
    icon: React.ReactNode;
    reason: "aulas" | "busca";
    active: boolean;
  }) {
    return (
      <button
        type="button"
        className={`btn-ghost w-full cursor-pointer justify-start gap-2 ${active ? "text-accent" : ""}`}
        onClick={() => {
          openUpgrade(reason);
          onNavigate?.();
        }}
      >
        {icon}
        <span className="flex-1 text-left">{label}</span>
        <LockIcon />
      </button>
    );
  }

  return (
    <div className="relative z-[100] mt-auto flex flex-col gap-0.5 border-t border-border pt-4">
      {!isElite ? (
        <Link
          href="/planos"
          className={`btn-ghost justify-start gap-2 ${pathname.startsWith("/planos") ? "text-accent" : ""}`}
          onClick={onNavigate}
        >
          {ICON_PLANOS}
          Planos
        </Link>
      ) : null}
      {isPaid ? (
        <Link
          href="/aulas"
          className={`btn-ghost justify-start gap-2 ${pathname.startsWith("/aulas") ? "text-accent" : ""}`}
          onClick={onNavigate}
        >
          {ICON_AULAS}
          Aulas
        </Link>
      ) : (
        <LockedGhost
          label="Aulas"
          icon={ICON_AULAS}
          reason="aulas"
          active={pathname.startsWith("/aulas")}
        />
      )}
      {isPaid ? (
        <Link
          href="/busca"
          className={`btn-ghost justify-start gap-2 ${pathname.startsWith("/busca") ? "text-accent" : ""}`}
          onClick={onNavigate}
        >
          {ICON_BUSCA}
          Busca
        </Link>
      ) : (
        <LockedGhost
          label="Busca"
          icon={ICON_BUSCA}
          reason="busca"
          active={pathname.startsWith("/busca")}
        />
      )}
      {isPaid ? (
        <a
          href={orionUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost justify-start gap-2"
          onClick={onNavigate}
        >
          <OrionIcon />
          Orion
        </a>
      ) : (
        <button
          type="button"
          className="btn-ghost w-full cursor-pointer justify-start gap-2"
          onClick={() => {
            openUpgrade("orion");
            onNavigate?.();
          }}
        >
          <OrionIcon />
          <span className="flex-1 text-left">Orion</span>
          <LockIcon />
        </button>
      )}
      <NotificationBell unread={unread} items={notifPreview} />
      <Link
        href="/perfil"
        className={`btn-ghost justify-start gap-2 ${pathname.startsWith("/perfil") ? "text-accent" : ""}`}
        onClick={onNavigate}
      >
        {ICON_PERFIL}
        Perfil
      </Link>
      {isAdmin ? (
        <>
          <Link
            href="/admin"
            className={`btn-ghost justify-start gap-2 ${
              pathname.startsWith("/admin") &&
              !pathname.startsWith("/admin/progresso")
                ? "text-accent"
                : ""
            }`}
            onClick={onNavigate}
          >
            {ICON_ADMIN}
            Admin
          </Link>
          <Link
            href="/admin/progresso"
            className={`btn-ghost justify-start gap-2 ${
              pathname.startsWith("/admin/progresso") ? "text-accent" : ""
            }`}
            onClick={onNavigate}
          >
            {ICON_PROGRESSO}
            Progresso
          </Link>
        </>
      ) : null}
      <ThemeToggle />
      <LogoutButton />
    </div>
  );
}

function NovaPublicacaoFab({
  isAdmin,
  isPaid,
}: {
  isAdmin: boolean;
  isPaid: boolean;
}) {
  const pathname = usePathname();
  const { openUpgrade } = useUpgrade();

  if (!pathname.startsWith("/spaces/")) return null;
  if (pathname === "/nova" || pathname.startsWith("/entregaveis/")) return null;
  if (
    !isAdmin &&
    (pathname.startsWith("/spaces/boas-vindas") ||
      pathname.startsWith("/spaces/avisos"))
  ) {
    return null;
  }

  const spaceSlug = pathname.split("/")[2] ?? "";
  const href =
    spaceSlug && spaceSlug !== "boas-vindas" && spaceSlug !== "avisos"
      ? `/nova?space=${spaceSlug}`
      : "/nova";

  const className =
    "fixed bottom-5 right-5 z-40 inline-flex h-14 cursor-pointer items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-white shadow-lg shadow-accent/30 transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:bottom-8 md:right-8";

  if (!isPaid) {
    return (
      <button
        type="button"
        className={className}
        aria-label="Nova publicação (requer upgrade)"
        onClick={() => openUpgrade("publicar")}
      >
        {ICON_NOVA}
        <span className="pr-0.5">Nova publicação</span>
        <LockIcon className="h-4 w-4 opacity-90" />
      </button>
    );
  }

  return (
    <Link href={href} className={className} aria-label="Nova publicação">
      {ICON_NOVA}
      <span className="pr-0.5">Nova publicação</span>
    </Link>
  );
}

function ShellInner({
  children,
  displayName,
  isAdmin,
  isPaid,
  isElite,
  orionUrl,
  unread,
  spaces,
  avatarUrl,
  notifPreview,
}: {
  children: React.ReactNode;
  displayName: string;
  isAdmin: boolean;
  isPaid: boolean;
  isElite: boolean;
  orionUrl: string;
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
      <aside className="sticky top-0 z-40 hidden h-dvh w-[260px] shrink-0 flex-col border-r border-border bg-sidebar/95 p-5 backdrop-blur-md md:flex">
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
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground/90">
              {displayName}
            </p>
            <div className="mt-0.5">
              <PlanBadge isPaid={isPaid} isElite={isElite} />
            </div>
          </div>
        </div>
        <div className="mt-8 flex min-h-0 flex-1 flex-col overflow-y-auto">
          <FeedLink />
          <div className="my-5 border-t border-border" />
          <SpaceNav spaces={spaces} isPaid={isPaid} />
          <div className="my-5 border-t border-border" />
          <MateriaisNav locked={!isPaid} />
        </div>
        <SidebarFooter
          unread={unread}
          isAdmin={isAdmin}
          isPaid={isPaid}
          isElite={isElite}
          orionUrl={orionUrl}
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
              <FeedLink onNavigate={() => setDrawerOpen(false)} />
              <div className="my-5 border-t border-border" />
              <SpaceNav
                spaces={spaces}
                isPaid={isPaid}
                onNavigate={() => setDrawerOpen(false)}
              />
              <div className="my-5 border-t border-border" />
              <MateriaisNav
                locked={!isPaid}
                onNavigate={() => setDrawerOpen(false)}
              />
            </div>
            <SidebarFooter
              unread={unread}
              isAdmin={isAdmin}
              isPaid={isPaid}
              isElite={isElite}
              orionUrl={orionUrl}
              notifPreview={notifPreview}
              onNavigate={() => setDrawerOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      <div className="relative flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border/80 bg-background/85 px-4 py-3 backdrop-blur-md md:hidden">
          <button
            type="button"
            className="btn-ghost -ml-1 px-2"
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menu"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
            </svg>
          </button>
          <Link
            href="/"
            className="font-[family-name:var(--font-outfit)] text-base font-bold"
          >
            {NOME_PRODUTO}
          </Link>
          <div className="flex items-center gap-0.5">
            <ThemeToggle variant="icon" />
            <NotificationBell unread={unread} items={notifPreview} compact />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:py-10 md:pb-28">
          {children}
        </main>
        <NovaPublicacaoFab isAdmin={isAdmin} isPaid={isPaid} />
      </div>
    </div>
  );
}

export function AppShellClient({
  children,
  displayName,
  isAdmin,
  isPaid,
  isElite,
  orionUrl,
  unread,
  spaces: initialSpaces,
  avatarUrl,
  notifPreview,
  hydrateNav = false,
}: {
  children: React.ReactNode;
  displayName: string;
  isAdmin: boolean;
  isPaid: boolean;
  isElite: boolean;
  orionUrl: string;
  unread: number;
  spaces: SpaceLink[];
  avatarUrl?: string | null;
  notifPreview: NotifPreview[];
  /** Busca spaces em /api/nav após o paint (não bloqueia o feed no SSR). */
  hydrateNav?: boolean;
}) {
  const pathname = usePathname();
  const search = useSearchParams();
  const autoOpen = search.get("upgrade") === "1";
  const [spaces, setSpaces] = useState(initialSpaces);

  useEffect(() => {
    if (initialSpaces.length > 0) {
      setSpaces(initialSpaces);
    }
  }, [initialSpaces]);

  useEffect(() => {
    if (!hydrateNav) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/nav", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { spaces?: SpaceLink[] };
        if (
          !cancelled &&
          Array.isArray(data.spaces) &&
          data.spaces.length > 0
        ) {
          setSpaces(data.spaces);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrateNav, pathname]);

  return (
    <UpgradeProvider
      isPaid={isPaid}
      isElite={isElite}
      autoOpen={autoOpen}
    >
      <ShellInner
        displayName={displayName}
        isAdmin={isAdmin}
        isPaid={isPaid}
        isElite={isElite}
        orionUrl={orionUrl}
        unread={unread}
        spaces={spaces}
        avatarUrl={avatarUrl}
        notifPreview={notifPreview}
      >
        {children}
      </ShellInner>
    </UpgradeProvider>
  );
}
