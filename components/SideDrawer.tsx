'use client';

import { useEffect, useRef, ReactNode, useCallback } from 'react';
import { X } from 'lucide-react';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  width?: 'sm' | 'md' | 'lg' | 'xl';
  children: ReactNode;
}

const WIDTHS = { sm: 320, md: 440, lg: 560, xl: 680 } as const;

export default function SideDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  width = 'md',
  children,
}: SideDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const prevOpen = useRef(false);
  const px = WIDTHS[width];

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  // Track previous open state for exit animation
  useEffect(() => {
    prevOpen.current = isOpen;
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]" style={{ perspective: '1200px' }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        style={{
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          animation: 'sideDrawerFadeIn 0.25s ease-out forwards',
        }}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="absolute top-0 right-0 h-full flex flex-col"
        style={{
          width: px,
          maxWidth: '100vw',
          background: 'var(--card)',
          borderLeft: '1px solid var(--card-border)',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.25), -2px 0 8px rgba(0,0,0,0.1)',
          animation: 'sideDrawerSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between px-6 py-5 flex-shrink-0"
          style={{
            borderBottom: '1px solid var(--card-border)',
          }}
        >
          <div className="min-w-0 flex-1">
            <h2
              className="text-base font-bold leading-tight"
              style={{ color: 'var(--heading)' }}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                className="text-[11px] mt-0.5"
                style={{ color: 'var(--text-muted)' }}
              >
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-4 p-1.5 rounded-lg transition-all duration-150 hover:scale-110"
            style={{
              color: 'var(--text-muted)',
              background: 'var(--input-bg)',
              border: '1px solid var(--card-border)',
            }}
            aria-label="Close drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div
          className="flex-1 overflow-y-auto px-6 py-5"
          style={{ overscrollBehavior: 'contain' }}
        >
          {children}
        </div>
      </div>

      <style>{`
        @keyframes sideDrawerFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes sideDrawerSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
