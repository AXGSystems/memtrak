import { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

/**
 * Shared zero-data presentation. Use everywhere a list/chart/table has no rows
 * so empty handling is consistent across pages instead of ad-hoc inline strings.
 */
export default function EmptyState({
  title = 'No data yet',
  message,
  icon: Icon = Inbox,
  action,
  className = '',
}: {
  title?: string;
  message?: string;
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-10 px-6 ${className}`}
      role="status"
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
        style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
      >
        <Icon className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
      </div>
      <div className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{title}</div>
      {message && (
        <p className="text-xs mt-1 max-w-sm" style={{ color: 'var(--text-muted)' }}>{message}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
