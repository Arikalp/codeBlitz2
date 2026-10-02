/**
 * components/ui/Card.tsx
 *
 * Simple card wrapper with consistent border, shadow, and padding.
 */

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingClasses = {
  none: "",
  sm:   "p-4",
  md:   "p-5",
  lg:   "p-6",
};

export default function Card({ children, className = "", padding = "md" }: CardProps) {
  return (
    <div
      className={[
        "rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm",
        paddingClasses[padding],
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
