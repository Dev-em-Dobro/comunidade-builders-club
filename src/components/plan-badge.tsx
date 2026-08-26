function FlagIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className ?? "h-3 w-3"}
      aria-hidden
    >
      <path d="M5 3.75a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0V3.75Z" />
      <path d="M7.5 4.5h10.2c.5 0 .8.55.55.98L16.2 9l2.05 3.52c.25.43-.05.98-.55.98H7.5V4.5Z" />
    </svg>
  );
}

export function PlanBadge({
  isPaid,
  isElite,
  size = "sm",
}: {
  isPaid: boolean;
  isElite: boolean;
  size?: "sm" | "md";
}) {
  const pad = size === "md" ? "px-2.5 py-1 text-[11px]" : "px-2 py-0.5 text-[10px]";

  if (isElite) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-accent font-bold uppercase tracking-wide text-accent-foreground ${pad}`}
      >
        <FlagIcon />
        Elite
      </span>
    );
  }

  if (isPaid) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border border-accent/35 bg-accent/15 font-bold uppercase tracking-wide text-accent ${pad}`}
      >
        <FlagIcon />
        PRO
      </span>
    );
  }

  return (
    <span
      className={`font-semibold uppercase tracking-wide text-muted ${
        size === "md" ? "text-[11px]" : "text-[10px]"
      }`}
    >
      Plano gratuito
    </span>
  );
}
