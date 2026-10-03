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
        "rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_8px_24px_rgba(94,52,0,0.06)]",
        paddingClasses[padding],
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
