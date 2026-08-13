export default function AppLoading() {
  return (
    <div className="feed-wrap animate-pulse" aria-busy="true" aria-label="Carregando">
      <div className="h-8 w-40 rounded-lg bg-surface" />
      <div className="mt-2 h-4 w-64 max-w-full rounded bg-surface/80" />
      <div className="mt-8 space-y-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-surface" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3.5 w-32 rounded bg-surface" />
                <div className="h-3 w-20 rounded bg-surface/70" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-3.5 w-full rounded bg-surface/80" />
              <div className="h-3.5 w-[85%] rounded bg-surface/70" />
              <div className="h-3.5 w-[60%] rounded bg-surface/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
