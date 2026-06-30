'use client';

import { useEffect, useRef, ReactNode, useCallback, useId } from 'react';
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
  // Element focused before the drawer opened — focus is restored here on close.
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const px = WIDTHS[width];

  // Escape to close + Tab focus trap (WCAG 2.1.2 / 2.4.3).
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        const panel = panelRef.current;
        if (!panel) return;
        const focusable = panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      // Remember the trigger so focus can return there when the drawer closes.
      restoreFocusRef.current = document.activeElement as HTMLElement | null;
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      // Move focus into the dialog (first focusable, else the panel itself).
      const panel = panelRef.current;
      if (panel) {
        const focusable = panel.querySelector<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        (focusable ?? panel).focus();
      }
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  // Restore focus to the triggering element on close.
  useEffect(() => {
    if (prevOpen.current && !isOpen && restoreFocusRef.current) {
      restoreFocusRef.current.focus?.();
      restoreFocusRef.current = null;
    }
    prevOpen.current = isOpen;
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]" style={{ perspective: '1200px' }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
        style={{
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          animation: 'sideDrawerFadeIn 0.25s ease-out forwards',
        }}
      />

      {/* Panel — right slab on tablet/desktop, bottom sheet on phones */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="side-drawer-panel absolute top-0 right-0 h-full flex flex-col"
        style={{
          width: px,
          maxWidth: '100vw',
          background: 'var(--card)',
          borderLeft: '1px solid var(--card-border)',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.25), -2px 0 8px rgba(0,0,0,0.1)',
          animation: 'sideDrawerSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        {/* Drag handle — only visible in bottom-sheet (phone) mode */}
        <div className="side-drawer-handle" aria-hidden="true" />
        {/* Header */}
        <div
          className="flex items-start justify-between px-6 py-5 flex-shrink-0"
          style={{
            borderBottom: '1px solid var(--card-border)',
          }}
        >
          <div className="min-w-0 flex-1">
            <h2
              id={titleId}
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
        @keyframes sideDrawerSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .side-drawer-handle { display: none; }
        /* Bottom-sheet on phones: anchor to bottom, full width, rounded top */
        @media (max-width: 640px) {
          .side-drawer-panel {
            top: auto !important;
            right: 0 !important;
            left: 0 !important;
            bottom: 0 !important;
            width: 100% !important;
            max-width: 100vw !important;
            height: auto !important;
            max-height: 90dvh !important;
            border-left: none !important;
            border-top: 1px solid var(--card-border) !important;
            border-top-left-radius: 1rem !important;
            border-top-right-radius: 1rem !important;
            box-shadow: 0 -8px 40px rgba(0,0,0,0.3) !important;
            animation: sideDrawerSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
          }
          .side-drawer-handle {
            display: block;
            width: 40px;
            height: 4px;
            border-radius: 999px;
            background: var(--text-muted);
            opacity: 0.5;
            margin: 8px auto 0;
            flex-shrink: 0;
          }
        }
      `}</style>
    </div>
  );
}
