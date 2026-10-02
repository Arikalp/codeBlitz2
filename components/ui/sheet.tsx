"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Context                                                           */
/* ------------------------------------------------------------------ */

interface SheetContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SheetContext = React.createContext<SheetContextValue>({
  open: false,
  onOpenChange: () => {},
});

/* ------------------------------------------------------------------ */
/*  Root                                                              */
/* ------------------------------------------------------------------ */

interface SheetProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function Sheet({ children, open: controlledOpen, onOpenChange }: SheetProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen ?? internalOpen;

  const handleChange = React.useCallback(
    (next: boolean) => {
      setInternalOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange]
  );

  return (
    <SheetContext.Provider value={{ open, onOpenChange: handleChange }}>
      {children}
    </SheetContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  Trigger                                                           */
/* ------------------------------------------------------------------ */

interface SheetTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const SheetTrigger = React.forwardRef<HTMLButtonElement, SheetTriggerProps>(
  ({ asChild, children, onClick, ...props }, ref) => {
    const { onOpenChange } = React.useContext(SheetContext);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      onOpenChange(true);
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        onClick: handleClick,
        ref,
      });
    }

    return (
      <button ref={ref} type="button" onClick={handleClick} {...props}>
        {children}
      </button>
    );
  }
);
SheetTrigger.displayName = "SheetTrigger";

/* ------------------------------------------------------------------ */
/*  Content                                                           */
/* ------------------------------------------------------------------ */

const sideVariants: Record<string, string> = {
  right: "inset-y-0 right-0 translate-x-full data-[state=open]:translate-x-0",
  left: "inset-y-0 left-0 -translate-x-full data-[state=open]:translate-x-0",
  top: "inset-x-0 top-0 -translate-y-full data-[state=open]:translate-y-0",
  bottom: "inset-x-0 bottom-0 translate-y-full data-[state=open]:translate-y-0",
};

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "right" | "bottom" | "left";
}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ side = "right", className, children, ...props }, ref) => {
    const { open, onOpenChange } = React.useContext(SheetContext);

    if (!open) return null;

    return (
      <>
        {/* Overlay */}
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in-0"
          onClick={() => onOpenChange(false)}
          aria-hidden="true"
        />

        {/* Panel */}
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          data-state={open ? "open" : "closed"}
          className={cn(
            "fixed z-50 bg-background border-border shadow-lg transition-transform duration-300 ease-out flex flex-col",
            sideVariants[side],
            open && "translate-x-0 translate-y-0",
            className
          )}
          {...props}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
          {children}
        </div>
      </>
    );
  }
);
SheetContent.displayName = "SheetContent";

/* ------------------------------------------------------------------ */
/*  Title                                                             */
/* ------------------------------------------------------------------ */

const SheetTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-heading font-semibold", className)}
    {...props}
  />
));
SheetTitle.displayName = "SheetTitle";

/* ------------------------------------------------------------------ */
/*  Description                                                       */
/* ------------------------------------------------------------------ */

const SheetDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
SheetDescription.displayName = "SheetDescription";

export { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription };
