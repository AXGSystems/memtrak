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

  const animate = useCallback(
    (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);
      const current = eased * value;

      setDisplay(
        current.toLocaleString('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }),
      );

      if (progress < 1 && typeof requestAnimationFrame !== 'undefined') {
        rafRef.current = requestAnimationFrame(animate);
      }
    },
    [value, duration, decimals],
  );

  const startAnimation = useCallback(() => {
    if (hasAnimated) return;
    setHasAnimated(true);
    startTimeRef.current = 0;
    if (typeof requestAnimationFrame !== 'undefined') rafRef.current = requestAnimationFrame(animate);
  }, [hasAnimated, animate]);

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
    startTimeRef.current = 0;
    if (typeof requestAnimationFrame !== 'undefined') rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, hasAnimated, animate]);

  return (
    <span
      ref={containerRef}
      className={`font-extrabold tabular-nums ${className}`}
      style={{ color: color || 'var(--heading)' }}
    >
      {prefix && (
        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{prefix}</span>
      )}
      {display}
      {suffix && (
        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{suffix}</span>
      )}
    </span>
  );
}
