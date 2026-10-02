/**
 * components/layout/Footer.tsx
 *
 * Global footer — server component.
 */

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-surface)]"
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[var(--color-text-secondary)] text-sm">
          <span aria-hidden="true">🩺</span>
          <span>
            <strong className="text-[var(--color-text-primary)]">HealthSetu</strong>
            {" — "}Connecting records to support continuity of care.
          </span>
        </div>

        <p className="text-xs text-[var(--color-text-muted)]">
          &copy; {year} HealthSetu. Hackathon prototype. Demo mode uses synthetic data only.
        </p>
      </div>
    </footer>
  );
}
