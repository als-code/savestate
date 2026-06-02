export function GameCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-card border border-retro-border/80 bg-retro-surface/80 shadow-card backdrop-blur">
      <div className="aspect-[3/4] w-full animate-pulse bg-retro-border/60" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-retro-border/60" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-retro-border/60" />
      </div>
    </div>
  );
}

