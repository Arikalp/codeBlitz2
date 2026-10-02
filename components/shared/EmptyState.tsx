import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="size-6 text-muted-foreground stroke-[1.5]" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-2 font-heading">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">
        {description}
      </p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
