import type { ChallengeBadge } from "@/lib/desafio/pontos";

const WEEK_STYLE: Record<number, { fill: string; ring: string; ribbon: string; fg: string; icon: string }> = {
  1: { fill: "#0d9488", ring: "#5eead4", ribbon: "#115e59", fg: "#ffffff", icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
  2: { fill: "#0e7490", ring: "#67e8f9", ribbon: "#164e63", fg: "#ffffff", icon: "M22 2L11 13M22 2l-7 20-4-9-9-4z" },
  3: { fill: "#155e75", ring: "#22d3ee", ribbon: "#083344", fg: "#ffffff", icon: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4" },
  4: { fill: "#15803d", ring: "#86efac", ribbon: "#14532d", fg: "#ffffff", icon: "M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7" },
  5: { fill: "#166534", ring: "#4ade80", ribbon: "#052e16", fg: "#ffffff", icon: "M3 4h18v18H3zM16 2v4M8 2v4M3 10h18" },
  6: { fill: "#1e293b", ring: "#fbbf24", ribbon: "#b45309", fg: "#fbbf24", icon: "M20 6L9 17l-5-5" },
};
const MEDAL: Record<Exclude<ChallengeBadge["kind"], "semana">, { bg: string; fg: string; ring: string; icon: string }> = {
  sequencia: { bg: "#c2410c", fg: "#ffffff", ring: "rgba(194,65,12,0.22)", icon: "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z" },
  cliente: { bg: "#f59e0b", fg: "#451a03", ring: "rgba(245,158,11,0.28)", icon: "M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14M8.21 13.89L7 23l5-3 5 3-1.21-9.12" },
  constancia: { bg: "#0f172a", fg: "#fbbf24", ring: "rgba(15,23,42,0.18)", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" },
};
const HEX = "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)";

function Icon({ path, size }: { path: string; size: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

/** Selo do desafio: hexágono semanal (cor da fase) ou medalha redonda. */
export function Badge({ badge, size = 56, showLabel = true }: { badge: ChallengeBadge; size?: number; showLabel?: boolean }) {
  const { earned } = badge;
  const aria = `Selo ${badge.week ? `Semana ${badge.week} · ` : ""}${badge.label} ${earned ? "conquistado" : "bloqueado"}`;
  const iconSize = Math.round(size * 0.4);
  let art;
  if (badge.kind === "semana") {
    const style = WEEK_STYLE[badge.week ?? 1]!;
    art = (
      <span className="flex flex-col items-center">
        <span className="flex p-1" style={{ width: size, height: Math.round(size * 1.08), clipPath: HEX, background: earned ? style.ring : "var(--bc-border)" }}>
          <span className="relative flex flex-1 items-center justify-center overflow-hidden"
            style={{ clipPath: HEX, background: earned ? style.fill : "var(--bc-surface)", color: earned ? style.fg : "var(--bc-muted)" }}>
            {earned && <span className="absolute inset-x-0 top-0 h-[45%] bg-white/15" />}
            <Icon path={style.icon} size={iconSize} />
          </span>
        </span>
        <span className="relative -mt-2.5 rounded-md px-2 py-0.5 font-[family-name:var(--font-outfit)] text-[9px] font-extrabold tracking-[0.1em]"
          style={earned ? { background: style.ribbon, color: "#fff" } : { background: "var(--bc-card)", color: "var(--bc-muted)", border: "1px dashed var(--bc-border)" }}>
          SEMANA {badge.week}
        </span>
      </span>
    );
  } else {
    const medal = MEDAL[badge.kind];
    art = (
      <span className="flex items-center justify-center rounded-full"
        style={earned
          ? { width: size, height: size, background: medal.bg, color: medal.fg, boxShadow: `0 0 0 4px ${medal.ring}` }
          : { width: size, height: size, background: "var(--bc-surface)", color: "var(--bc-muted)", border: "2px dashed var(--bc-border)" }}>
        <Icon path={medal.icon} size={iconSize} />
      </span>
    );
  }
  return (
    <figure role="img" aria-label={aria} title={`${badge.label} — ${badge.detail}`}
      className={`m-0 flex flex-col items-center gap-1.5 text-center ${earned ? "" : "opacity-70"}`}>
      {art}
      {showLabel && <figcaption className={`max-w-[96px] text-xs font-semibold leading-tight ${earned ? "" : "text-muted"}`}>{badge.label}</figcaption>}
    </figure>
  );
}

export function BadgeGrid({ badges, size }: { badges: ChallengeBadge[]; size?: number }) {
  return (
    <div className="grid grid-cols-3 gap-x-2 gap-y-4 sm:grid-cols-5 lg:grid-cols-9">
      {badges.map((badge) => <Badge key={badge.id} badge={badge} size={size} />)}
    </div>
  );
}
