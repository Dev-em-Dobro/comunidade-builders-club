export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="empty-state animate-[fadeIn_0.35s_ease-out]">
      <p className="font-[family-name:var(--font-outfit)] text-lg font-semibold text-foreground">
        {title}
      </p>
      {description ? (
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
          {description}
        </p>
      ) : null}
    </div>
  );
}
