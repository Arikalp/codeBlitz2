/**
 * components/ui/EmptyState.tsx
 *
 * Friendly empty-state block shown when a list has no items.
 */

import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]">
        <Icon size={32} strokeWidth={1.5} />
      </div>
      <h3 className="mb-1 text-base font-semibold text-[var(--color-text-primary)]">{title}</h3>
      {description && (
        <p className="mb-4 max-w-xs text-sm text-[var(--color-text-muted)]">{description}</p>
      )}
      {action}
    </div>
  );
}
