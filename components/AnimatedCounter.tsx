'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  decimals?: number;
  color?: string;
  className?: string;
}

/** easeOutExpo: fast start, natural deceleration */
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/** True when the user has asked the OS to minimise non-essential motion. */
function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export default function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  duration = 1500,
  decimals = 0,
  color,
  className = '',
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState('0');
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const formatValue = useCallback(
    (n: number) =>
      n.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }),
    [decimals],
  );

  const animate = useCallback(
    (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);
      const current = eased * value;

      setDisplay(formatValue(current));

      if (progress < 1 && typeof requestAnimationFrame !== 'undefined') {
        rafRef.current = requestAnimationFrame(animate);
      }
    },
    [value, duration, formatValue],
  );

  const startAnimation = useCallback(() => {
    if (hasAnimated) return;
    setHasAnimated(true);
    // Reduced-motion users get the final value immediately — no rAF loop,
    // sparing the main thread during hydration (lower INP/TBT).
    if (prefersReducedMotion()) {
      setDisplay(formatValue(value));
      return;
    }
    startTimeRef.current = 0;
    if (typeof requestAnimationFrame !== 'undefined') rafRef.current = requestAnimationFrame(animate);
  }, [hasAnimated, animate, value, formatValue]);

  // IntersectionObserver: trigger animation when scrolled into view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startAnimation();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [startAnimation]);

  // Re-animate when value changes (after initial animation)
  useEffect(() => {
    if (!hasAnimated) return;
    if (prefersReducedMotion()) {
      setDisplay(formatValue(value));
      return;
    }
    startTimeRef.current = 0;
    if (typeof requestAnimationFrame !== 'undefined') rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, hasAnimated, animate, formatValue]);

  return (
    <span
      ref={containerRef}
      className={`font-extrabold tabular-nums ${className}`}
      style={{ color: color || 'var(--heading)' }}
    >
      {prefix && (
        <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{prefix}</span>
      )}
      {display}
      {suffix && (
        <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{suffix}</span>
      )}
    </span>
  );
}
