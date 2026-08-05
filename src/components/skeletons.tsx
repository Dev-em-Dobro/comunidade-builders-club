/** Placeholders de carregamento (navegação App Router). */

export function SkeletonPulse({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-border/60 ${className}`}
      aria-hidden
    />
  );
}

export function FeedSkeleton() {
  return (
    <div className="feed-wrap" aria-busy="true" aria-label="Carregando">
      <SkeletonPulse className="h-8 w-40" />
      <SkeletonPulse className="mt-3 h-4 w-64 max-w-full" />
      <div className="mt-8 space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="post-card flex gap-3 p-5">
            <SkeletonPulse className="h-10 w-10 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2.5">
              <SkeletonPulse className="h-4 w-32" />
              <SkeletonPulse className="h-3 w-48" />
              <SkeletonPulse className="mt-2 h-5 w-3/4 max-w-md" />
              <SkeletonPulse className="h-3 w-full" />
              <SkeletonPulse className="h-3 w-4/5 max-w-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardsSkeleton() {
  return (
    <div className="feed-wrap-wide" aria-busy="true" aria-label="Carregando">
      <SkeletonPulse className="h-8 w-48" />
      <SkeletonPulse className="mt-3 h-4 w-72 max-w-full" />
      <SkeletonPulse className="mt-8 h-40 w-full" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <SkeletonPulse key={i} className="min-h-[180px] w-full" />
        ))}
      </div>
    </div>
  );
}
