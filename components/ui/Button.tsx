/**
 * components/ui/Button.tsx
 *
 * Reusable button component with variant and size props.
 * Fully accessible — supports disabled state, focus ring, and
 * loading indicator.
 */

import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size    = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[var(--color-primary-container)] text-white hover:bg-[var(--color-primary-hover)] " +
    "shadow-sm hover:shadow-warm active:scale-[0.98]",
  secondary:
    "bg-[var(--color-timeline-node-bg)] text-[var(--color-text-primary)] border border-[var(--color-border-subtle)] " +
    "hover:bg-[#EBDED2] shadow-sm active:scale-[0.98]",
  outline:
    "border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] bg-[var(--color-surface-card)] " +
    "hover:bg-[var(--color-surface-container-high)] active:scale-[0.98]",
  ghost:
    "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-container-high)] " +
    "hover:text-[var(--color-text-primary)] active:scale-[0.98]",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3.5 py-1.5 text-xs rounded-lg gap-1.5",
  md: "px-5 py-2.5 text-sm rounded-lg gap-2",
  lg: "px-7 py-3 text-base rounded-xl gap-2.5",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      className = "",
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        className={[
          "inline-flex items-center justify-center font-semibold",
          "transition-all duration-200 cursor-pointer select-none",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
          "focus-visible:outline-[var(--color-brand-500)]",
          "disabled:opacity-50 disabled:pointer-events-none",
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(" ")}
        {...rest}
      >
        {isLoading && (
          <span
            aria-hidden="true"
            className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
          />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
