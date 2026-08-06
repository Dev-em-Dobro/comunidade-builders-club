"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export const ADMIN_TABS = [
  { id: "allowlist", label: "Allowlist" },
  { id: "membros", label: "Membros" },
  { id: "aulas", label: "Aulas" },
  { id: "spaces", label: "Spaces" },
] as const;

export type AdminTabId = (typeof ADMIN_TABS)[number]["id"];

export function isAdminTab(value: string | undefined | null): value is AdminTabId {
  return ADMIN_TABS.some((t) => t.id === value);
}

export function AdminTabs({ active }: { active: AdminTabId }) {
  const searchParams = useSearchParams();

  return (
    <nav
      className="mt-6 flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1"
      aria-label="Seções da administração"
    >
      {ADMIN_TABS.map((tab) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", tab.id);
        if (tab.id !== "membros") {
          params.delete("q");
          params.delete("status");
        }
        const href = `/admin?${params.toString()}`;
        const isActive = active === tab.id;
        return (
          <Link
            key={tab.id}
            href={href}
            className={`shrink-0 cursor-pointer rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-accent text-white shadow-sm"
                : "text-muted hover:bg-surface hover:text-foreground"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
