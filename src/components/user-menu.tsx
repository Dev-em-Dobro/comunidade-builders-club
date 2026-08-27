"use client";

/**
 * F062 — pill do usuário no rodapé da sidebar.
 *
 * Substitui os itens soltos Planos / Tema / Perfil / Sair: tudo passa a viver
 * num popup que abre para cima, com o e-mail e o plano no topo.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { PlanBadge } from "@/components/plan-badge";
import {
  ICON_CHEVRON_MENU,
  ICON_CONFIG,
  ICON_PERFIL,
  ICON_PLANOS,
} from "@/components/nav-icons";

export function UserMenu({
  displayName,
  email,
  avatarUrl,
  isPaid,
  isElite,
  onNavigate,
}: {
  displayName: string;
  email: string;
  avatarUrl?: string | null;
  isPaid: boolean;
  isElite: boolean;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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

  const initial = displayName.slice(0, 1).toUpperCase();

  function itemClass(href: string) {
    const active = pathname.startsWith(href);
    return `menu-item ${active ? "menu-item-active" : ""}`;
  }

  function navegar() {
    setOpen(false);
    onNavigate?.();
  }

  return (
    // z acima do NotificationBell (z-[100]): senão os itens do rodapé
    // atravessam o popup. Os dois popups nunca ficam abertos ao mesmo tempo.
    <div className="relative z-[110] min-w-0 flex-1" ref={rootRef}>
      <button
        type="button"
        className="user-pill w-full"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menu da conta"
        onClick={() => setOpen((v) => !v)}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            className="h-7 w-7 shrink-0 rounded-full object-cover ring-2 ring-surface"
          />
        ) : (
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[11px] font-bold text-accent">
            {initial}
          </div>
        )}
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground/90">
          {displayName}
        </span>
        <span className="shrink-0 text-muted opacity-70">
          {ICON_CHEVRON_MENU}
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Conta"
          className="absolute bottom-full left-0 z-50 mb-2 w-[16rem] max-w-[calc(100vw-2.5rem)] rounded-2xl border border-border bg-card p-1.5 shadow-lg"
        >
          <div className="px-2.5 pb-2 pt-1.5">
            <p className="truncate text-[13px] text-muted" title={email}>
              {email}
            </p>
            <div className="mt-1.5">
              <PlanBadge isPaid={isPaid} isElite={isElite} />
            </div>
          </div>

          <div className="my-1 border-t border-border" />

          {!isElite ? (
            <Link
              href="/planos"
              role="menuitem"
              className={itemClass("/planos")}
              onClick={navegar}
            >
              {ICON_PLANOS}
              Planos
            </Link>
          ) : null}
          <Link
            href="/configuracoes"
            role="menuitem"
            className={itemClass("/configuracoes")}
            onClick={navegar}
          >
            {ICON_CONFIG}
            Configurações
          </Link>
          {/* Não fecha o popup: dá para alternar e voltar sem reabrir. */}
          <ThemeToggle variant="popup" />
          <Link
            href="/perfil"
            role="menuitem"
            className={itemClass("/perfil")}
            onClick={navegar}
          >
            {ICON_PERFIL}
            Perfil
          </Link>

          <div className="my-1 border-t border-border" />

          <LogoutButton variant="popup" />
        </div>
      ) : null}
    </div>
  );
}
