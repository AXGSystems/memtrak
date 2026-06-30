import { FlaskConical } from 'lucide-react';

/**
 * Visible honesty disclosure for intelligence pages whose figures are
 * illustrative sample values, not yet computed from a live MEMTRAK source.
 *
 * This mirrors the disclosure language already used by app/workflows and
 * app/compliance-vault so the whole product holds one honesty contract:
 * any precise number a page shows is either real (data-backed) or clearly
 * labelled here as a sample. Place it directly under the page <h1>/intro so
 * the label is in the reader's first viewport, not buried in a code comment.
 */
export default function SampleDataBadge({
  message = 'The figures on this page are illustrative sample values, not yet connected to a live MEMTRAK data source. They demonstrate the layout and analysis this view will show once the underlying event/member feeds are wired.',
  className = '',
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      role="note"
      aria-label="Sample data disclosure"
      className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 mb-6 ${className}`}
      style={{
        background: 'color-mix(in srgb, var(--accent) 6%, transparent)',
        borderColor: 'color-mix(in srgb, var(--accent) 40%, transparent)',
      }}
    >
      <FlaskConical
        className="w-4 h-4 flex-shrink-0 mt-0.5"
        style={{ color: 'var(--accent)' }}
        aria-hidden="true"
      />
      <div>
        <span
          className="text-[11px] font-bold uppercase tracking-wide mr-1.5"
          style={{ color: 'var(--accent)' }}
        >
          Sample data
        </span>
        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
          {message}
        </span>
      </div>
    </div>
  );
}
