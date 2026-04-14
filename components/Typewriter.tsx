'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  onComplete?: () => void;
}

export default function Typewriter({
  text,
  speed = 40,
  delay = 0,
  className = '',
  onComplete,
}: TypewriterProps) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);
  const [complete, setComplete] = useState(false);
  const indexRef = useRef(0);
  const lastTimeRef = useRef(0);
  const rafRef = useRef<number>(0);
  const onCompleteRef = useRef(onComplete);

  // Keep callback ref fresh without triggering effect re-runs
  onCompleteRef.current = onComplete;

  // Reset when text changes
  useEffect(() => {
    setDisplayed('');
    setStarted(false);
    setComplete(false);
    indexRef.current = 0;
    lastTimeRef.current = 0;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, [text]);

  // Handle start delay
  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay, text]);

  // Animation loop using requestAnimationFrame
  const animate = useCallback(
    (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const elapsed = timestamp - lastTimeRef.current;

      if (elapsed >= speed) {
        lastTimeRef.current = timestamp;
        indexRef.current += 1;

        const nextIndex = indexRef.current;
        if (nextIndex <= text.length) {
          setDisplayed(text.slice(0, nextIndex));
        }

        if (nextIndex >= text.length) {
          setComplete(true);
          onCompleteRef.current?.();
          return; // Stop the loop
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    },
    [text, speed],
  );

  useEffect(() => {
    if (!started || complete) return;
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [started, complete, animate]);

  return (
    <span className={className} style={{ color: 'var(--heading)' }}>
      {displayed}
      <span
        style={{
          display: 'inline-block',
          width: '2px',
          height: '1em',
          marginLeft: '1px',
          verticalAlign: 'text-bottom',
          background: 'var(--accent)',
          animation: complete ? 'typewriterBlink 1s step-end infinite' : 'none',
          opacity: started ? 1 : 0,
        }}
      />
      <style>{`
        @keyframes typewriterBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </span>
  );
}
