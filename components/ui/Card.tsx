/**
 * components/ui/Card.tsx
 *
 * Simple card wrapper with consistent border, shadow, and padding.
 */

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  style?: React.CSSProperties;
}

const paddingClasses = {
  none: "",
  sm:   "p-4",
  md:   "p-5",
  lg:   "p-6",
};

export default function Card({ children, className = "", padding = "md", style }: CardProps) {
  return (
    <div
      style={style}
      className={[
        "rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] shadow-[0_4px_20px_-2px_rgba(42,33,24,0.05)]",
        paddingClasses[padding],
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
