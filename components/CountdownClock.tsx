'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface CountdownClockProps {
  targetDate: string;
  label: string;
  color?: string;
  onExpire?: () => void;
  size?: 'sm' | 'md' | 'lg';
  /** Optional start date for progress bar calculation. Defaults to component mount time. */
  startDate?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calcTimeLeft(target: number): TimeLeft {
  const total = Math.max(0, target - Date.now());
  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
    total,
  };
}

function DigitBox({
  value,
  unit,
  size,
  color,
}: {
  value: number;
  unit: string;
  size: 'sm' | 'md' | 'lg';
  color: string;
}) {
  const pad = String(value).padStart(unit === 'DAYS' ? 1 : 2, '0');
  const numSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-2xl';
  const unitSize = size === 'sm' ? 'text-[7px]' : size === 'lg' ? 'text-[10px]' : 'text-[8px]';
  const boxPad = size === 'sm' ? 'px-2 py-1.5' : size === 'lg' ? 'px-4 py-3' : 'px-3 py-2';

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div
        className={`${boxPad} rounded-lg font-extrabold tabular-nums leading-none ${numSize}`}
        style={{
          background: 'var(--input-bg)',
          border: '1px solid var(--card-border)',
          color: 'var(--heading)',
          boxShadow: `0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.03)`,
          minWidth: size === 'sm' ? 36 : size === 'lg' ? 56 : 46,
          textAlign: 'center',
        }}
      >
        {pad}
      </div>
      <span
        className={`${unitSize} font-bold uppercase tracking-wider`}
        style={{ color: 'var(--text-muted)' }}
      >
        {unit}
      </span>
    </div>
  );
}

export default function CountdownClock({
  targetDate,
  label,
  color = 'var(--accent)',
  onExpire,
  size = 'md',
  startDate,
}: CountdownClockProps) {
  const target = new Date(targetDate).getTime();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calcTimeLeft(target));
  const [expired, setExpired] = useState(false);
  const mountTimeRef = useRef(Date.now());
  const expiredFiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const tick = useCallback(() => {
    const tl = calcTimeLeft(target);
    setTimeLeft(tl);
    if (tl.total <= 0 && !expiredFiredRef.current) {
      expiredFiredRef.current = true;
      setExpired(true);
      onExpireRef.current?.();
    }
  }, [target]);

  useEffect(() => {
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  // Progress: what fraction of total duration has elapsed
  const startMs = startDate ? new Date(startDate).getTime() : mountTimeRef.current;
  const totalDuration = Math.max(1, target - startMs);
  const elapsed = Date.now() - startMs;
  const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

  const labelSize = size === 'sm' ? 'text-[9px]' : size === 'lg' ? 'text-xs' : 'text-[10px]';
  const sepSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base';
  const barHeight = size === 'sm' ? 3 : size === 'lg' ? 5 : 4;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Label */}
      <span
        className={`${labelSize} font-bold uppercase tracking-wider`}
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </span>

      {expired ? (
        /* Expired state */
        <div
          className="px-5 py-3 rounded-xl font-extrabold text-lg tracking-widest"
          style={{
            color: '#D94A4A',
            background: 'rgba(217,74,74,0.08)',
            border: '1px solid rgba(217,74,74,0.2)',
            animation: 'countdownExpiredPulse 1.5s ease-in-out infinite',
          }}
        >
          EXPIRED
        </div>
      ) : (
        /* Digit boxes */
        <div className="flex items-center gap-1.5">
          <DigitBox value={timeLeft.days} unit="Days" size={size} color={color} />
          <span
            className={`${sepSize} font-bold self-start mt-1.5`}
            style={{ color: 'var(--text-muted)', opacity: 0.5 }}
          >
            :
          </span>
          <DigitBox value={timeLeft.hours} unit="Hrs" size={size} color={color} />
          <span
            className={`${sepSize} font-bold self-start mt-1.5`}
            style={{ color: 'var(--text-muted)', opacity: 0.5 }}
          >
            :
          </span>
          <DigitBox value={timeLeft.minutes} unit="Min" size={size} color={color} />
          <span
            className={`${sepSize} font-bold self-start mt-1.5`}
            style={{ color: 'var(--text-muted)', opacity: 0.5 }}
          >
            :
          </span>
          <DigitBox value={timeLeft.seconds} unit="Sec" size={size} color={color} />
        </div>
      )}

      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <div
          className="w-full rounded-full overflow-hidden"
          style={{ height: barHeight, background: 'var(--card-border)' }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: expired ? '#D94A4A' : color,
              transition: 'width 1s linear',
            }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[8px] font-semibold" style={{ color: 'var(--text-muted)' }}>
            {Math.round(progress)}% elapsed
          </span>
          <span className="text-[8px] font-semibold" style={{ color: 'var(--text-muted)' }}>
            {Math.round(100 - progress)}% remaining
          </span>
        </div>
      </div>

      <style>{`
        @keyframes countdownExpiredPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(217,74,74,0); }
          50% { opacity: 0.7; box-shadow: 0 0 20px 4px rgba(217,74,74,0.25); }
        }
      `}</style>
    </div>
  );
}
