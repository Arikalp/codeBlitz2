/**
 * components/ui/LoadingState.tsx
 *
 * Skeleton / spinner loading state for list content areas.
 */

interface LoadingStateProps {
  rows?: number;
  className?: string;
}

function SkeletonRow() {
  return (
    <div className="animate-pulse flex gap-3 p-4">
      <div className="h-10 w-10 rounded-xl bg-[var(--color-surface-muted)] flex-shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3 w-3/4 rounded-full bg-[var(--color-surface-muted)]" />
        <div className="h-3 w-1/2 rounded-full bg-[var(--color-surface-muted)]" />
      </div>
    </div>
  );
}

export default function LoadingState({ rows = 4, className = "" }: LoadingStateProps) {
  return (
    <div className={["divide-y divide-[var(--color-border)]", className].join(" ")} aria-busy="true" aria-label="Loading…">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}

/** Inline spinner for small loading contexts */
export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <span
      aria-label="Loading"
      className="inline-block border-2 border-[var(--color-brand-500)] border-t-transparent rounded-full animate-spin"
      style={{ width: size, height: size }}
    />
  );
}
