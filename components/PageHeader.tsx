import { ReactNode } from 'react';

/**
 * Canonical page header. Renders the page title at ONE size across the whole
 * app (text-2xl / font-extrabold / tracking-tight, --heading token) so the
 * top-level information hierarchy is identical page-to-page instead of drifting
 * between text-lg / text-xl / text-2xl. Use for any top-of-page title; pass
 * `subtitle` for the byline and `actions` for a right-aligned action row.
 */
export default function PageHeader({
  title,
  subtitle,
  actions,
  className = '',
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        <h1
          className="text-2xl font-extrabold tracking-tight"
          style={{ color: 'var(--heading)' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}
