'use client';

import { useEffect, useRef } from 'react';

/**
 * Accessibility machinery for hand-rolled inline modals (role="dialog").
 *
 * Wires up the WCAG keyboard contract that a raw `fixed inset-0` dialog block
 * otherwise lacks (2.1.1 keyboard operable, 2.1.2 no keyboard trap, 2.4.3 focus
 * order, 4.1.2 name/role/value):
 *   - Escape closes the dialog
 *   - Tab / Shift+Tab is trapped inside the panel
 *   - focus moves into the panel on open (first focusable, else the panel)
 *   - focus is restored to the triggering element on close
 *
 * Usage:
 *   const panelRef = useRef<HTMLDivElement>(null);
 *   useDialogA11y(open, () => setOpen(false), panelRef);
 *   ...
 *   {open && <div ...><div ref={panelRef} role="dialog" aria-modal="true" tabIndex={-1}>...</div></div>}
 *
 * The panel element should carry `tabIndex={-1}` so it can receive focus when it
 * has no focusable children.
 */
export function useDialogA11y(
  isOpen: boolean,
  onClose: () => void,
  panelRef: React.RefObject<HTMLElement | null>,
) {
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const FOCUSABLE =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  useEffect(() => {
    if (!isOpen) return;

    restoreFocusRef.current = document.activeElement as HTMLElement | null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        const panel = panelRef.current;
        if (!panel) return;
        const focusable = panel.querySelectorAll<HTMLElement>(FOCUSABLE);
        if (focusable.length === 0) {
          // Nothing focusable inside — keep focus on the panel itself.
          e.preventDefault();
          panel.focus();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey && (active === first || active === panel)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Move focus into the dialog after it has mounted/painted.
    const raf = requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const target = panel.querySelector<HTMLElement>(FOCUSABLE) ?? panel;
      target.focus();
    });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(raf);
      // Restore focus to whatever triggered the dialog.
      const restore = restoreFocusRef.current;
      if (restore && typeof restore.focus === 'function') restore.focus();
      restoreFocusRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, onClose]);
}
