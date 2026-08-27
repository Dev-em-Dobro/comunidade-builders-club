/** Ícones SVG leves do menu lateral (mesmo traço dos Materiais). */

export function NavIcon({ children }: { children: React.ReactNode }) {
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
      {children}
    </svg>
  );
}

export const ICON_TODOS = (
  <NavIcon>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </NavIcon>
);

export const ICON_AVISOS = (
  <NavIcon>
    <path d="m3 11 18-5v12L3 14v-3z" />
    <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
  </NavIcon>
);

export const ICON_GERAL = (
  <NavIcon>
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z" />
  </NavIcon>
);

export const ICON_DUVIDAS = (
  <NavIcon>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
  </NavIcon>
);

export const ICON_FREELAS = (
  <NavIcon>
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </NavIcon>
);

export const ICON_CONQUISTAS = (
  <NavIcon>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </NavIcon>
);

export const ICON_PROJETOS = (
  <NavIcon>
    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
  </NavIcon>
);

export const ICON_SPACE_FALLBACK = (
  <NavIcon>
    <path d="M4 9h16" />
    <path d="M4 15h16" />
    <path d="M10 3 8 21" />
    <path d="m16 3-2 18" />
  </NavIcon>
);

export const ICON_AULAS = (
  <NavIcon>
    <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" />
    <rect x="2" y="6" width="14" height="12" rx="2" />
  </NavIcon>
);

export const ICON_BUSCA = (
  <NavIcon>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </NavIcon>
);

export const ICON_PLANOS = (
  <NavIcon>
    <rect x="3" y="8" width="18" height="4" rx="1" />
    <rect x="3" y="14" width="18" height="4" rx="1" />
    <path d="M7 8v4" />
    <path d="M7 14v4" />
  </NavIcon>
);

export const ICON_PERFIL = (
  <NavIcon>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </NavIcon>
);

/** F062 — item único de Materiais de apoio (antes era a "Visão geral"). */
export const ICON_MATERIAIS = (
  <NavIcon>
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a2.5 2.5 0 0 1 0-5H20" />
  </NavIcon>
);

export const ICON_CONFIG = (
  <NavIcon>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </NavIcon>
);

/** Chevron da pill do usuário (F062) — indica que abre um menu. */
export const ICON_CHEVRON_MENU = (
  <NavIcon>
    <path d="m7 15 5 5 5-5" />
    <path d="m7 9 5-5 5 5" />
  </NavIcon>
);

export const ICON_ADMIN = (
  <NavIcon>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
  </NavIcon>
);

export const ICON_PROGRESSO = (
  <NavIcon>
    <path d="M3 3v18h18" />
    <path d="M7 16v-5" />
    <path d="M12 16V8" />
    <path d="M17 16v-9" />
  </NavIcon>
);

export const ICON_SAIR = (
  <NavIcon>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </NavIcon>
);

export const ICON_BOAS_VINDAS = (
  <NavIcon>
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
  </NavIcon>
);

export const ICON_NOVA = (
  <NavIcon>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </NavIcon>
);

export const ICON_PRESENTES = (
  <NavIcon>
    <path d="M20 12v10H4V12" />
    <path d="M2 7h20v5H2z" />
    <path d="M12 22V7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </NavIcon>
);

const SPACE_ICONS: Record<string, React.ReactNode> = {
  "boas-vindas": ICON_BOAS_VINDAS,
  avisos: ICON_AVISOS,
  presentes: ICON_PRESENTES,
  geral: ICON_GERAL,
  duvidas: ICON_DUVIDAS,
  freelas: ICON_FREELAS,
  conquistas: ICON_CONQUISTAS,
  projetos: ICON_PROJETOS,
};

export function iconForSpace(slug: string): React.ReactNode {
  return SPACE_ICONS[slug] ?? ICON_SPACE_FALLBACK;
}
