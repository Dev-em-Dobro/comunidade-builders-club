"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ENTREGAVEIS_MENU } from "@/lib/entregaveis/catalogo";

function Icone({ d }: { d: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
    >
      {d}
    </svg>
  );
}

/** Ícones iguais aos do Orion (sidebar Materiais). */
const ICONES: Record<string, React.ReactNode> = {
  "arsenal-sites": (
    <Icone
      d={
        <>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </>
      }
    />
  ),
  prompts: (
    <Icone
      d={
        <path d="m12 3-1.9 5.8H4l4.9 3.6-1.9 5.8L12 14.6l4.9 3.8-1.9-5.8L20 8.8h-6.1L12 3z" />
      }
    />
  ),
  portfolio: (
    <Icone
      d={
        <>
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        </>
      }
    />
  ),
  contrato: (
    <Icone
      d={
        <>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M8 13h8" />
          <path d="M8 17h6" />
        </>
      }
    />
  ),
  "scripts-venda": (
    <Icone
      d={
        <>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M8 9h8" />
          <path d="M8 13h5" />
        </>
      }
    />
  ),
  "setup-orion": (
    <Icone
      d={
        <>
          <circle cx="8" cy="15" r="4" />
          <path d="m10.5 10.5 6 6" />
          <path d="m18 6-3-3" />
          <path d="m15 9 3-3" />
        </>
      }
    />
  ),
  briefing: (
    <Icone
      d={
        <>
          <rect x="8" y="2" width="8" height="4" rx="1" />
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <path d="M12 11h4" />
          <path d="M12 16h4" />
          <path d="M8 11h.01" />
          <path d="M8 16h.01" />
        </>
      }
    />
  ),
  precificacao: (
    <Icone
      d={
        <>
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </>
      }
    />
  ),
};

const ITENS = [
  {
    href: "/entregaveis",
    label: "Visão geral",
    icone: (
      <Icone
        d={
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a2.5 2.5 0 0 1 0-5H20" />
        }
      />
    ),
  },
  ...ENTREGAVEIS_MENU.map((item) => ({
    href: `/entregaveis/${item.slug}`,
    label: item.titulo,
    icone: ICONES[item.slug],
  })),
];

export function MateriaisNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5">
      <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
        Materiais de apoio
      </p>
      {ITENS.map((item) => {
        const active =
          item.href === "/entregaveis"
            ? pathname === "/entregaveis"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`nav-space flex items-center gap-2 ${active ? "nav-space-active" : ""}`}
          >
            {item.icone}
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
