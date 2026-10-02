import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DemoModeBannerProps {
  className?: string;
}

export function DemoModeBanner({ className }: DemoModeBannerProps) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-center gap-2 bg-warning/10 px-4 py-1.5 text-xs font-medium text-warning-foreground border-b border-warning/20",
        className
      )}
      role="banner"
    >
      <AlertCircle className="size-3.5 opacity-80 stroke-[1.5]" aria-hidden="true" />
      <span>
        <strong>Demo Mode</strong> &middot; Synthetic data only
      </span>
    </div>
  );
}
