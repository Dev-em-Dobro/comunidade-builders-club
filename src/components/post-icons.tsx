/**
 * F060 — ícones das interações do post (listagem e página interna).
 * Traço de 1.6 para casar com o peso do texto; `currentColor` para herdar
 * o estado (muted, accent quando reagido).
 */

type IconProps = { className?: string; filled?: boolean };

const BASE = "h-[18px] w-[18px] shrink-0";

export function HeartIcon({ className, filled = false }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${BASE} ${className ?? ""}`}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 20.5s-7.5-4.6-7.5-9.6a4.2 4.2 0 0 1 7.5-2.6 4.2 4.2 0 0 1 7.5 2.6c0 5-7.5 9.6-7.5 9.6Z" />
    </svg>
  );
}

export function CommentIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${BASE} ${className ?? ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20.5 11.8c0 3.8-3.8 6.9-8.5 6.9-1 0-2-.15-2.9-.42L4 20l1.3-3.4C4.2 15.3 3.5 13.6 3.5 11.8c0-3.8 3.8-6.9 8.5-6.9s8.5 3.1 8.5 6.9Z" />
    </svg>
  );
}

export function EyeIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${BASE} ${className ?? ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.9" />
    </svg>
  );
}

export function ShareIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${BASE} ${className ?? ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 15.5V4m0 0L8.2 7.8M12 4l3.8 3.8" />
      <path d="M5 13.5v4.8a1.7 1.7 0 0 0 1.7 1.7h10.6a1.7 1.7 0 0 0 1.7-1.7V13.5" />
    </svg>
  );
}

export function MoreIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${BASE} ${className ?? ""}`}
      fill="currentColor"
      aria-hidden
    >
      <circle cx="5.5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="18.5" cy="12" r="1.6" />
    </svg>
  );
}

export function PinIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${BASE} ${className ?? ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 4h6l-.8 5.2 2.8 2.6H7l2.8-2.6L9 4Z" />
      <path d="M12 11.8V20" />
    </svg>
  );
}

/** Ícone + contagem, do jeito que aparece no rodapé do card e na barra do post. */
export function PostStat({
  icon,
  count,
  label,
}: {
  icon: React.ReactNode;
  count: number;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5" title={label}>
      {icon}
      <span className="text-[13px] tabular-nums">{count}</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}
