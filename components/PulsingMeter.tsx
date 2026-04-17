'use client';

import { useId } from 'react';

interface PulsingMeterProps {
  value: number;
  label: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  showPulse?: boolean;
}

const SIZES = { sm: 96, md: 140, lg: 192 } as const;
const STROKE = { sm: 6, md: 8, lg: 10 } as const;

export default function PulsingMeter({
  value,
  label,
  color = 'var(--accent)',
  size = 'md',
  animate = true,
  showPulse = true,
}: PulsingMeterProps) {
  const dim = SIZES[size];
  const stroke = STROKE[size];
  const radius = (dim - stroke) / 2 - 8; // leave room for pulse glow
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, value));
  const dashOffset = circumference - (clamped / 100) * circumference;

  // Unique ID for gradients/filters per instance (deterministic for SSR)
  const reactId = useId();
  const uid = `pm-${reactId.replace(/:/g, '')}`;

  // Glow intensity scales with value: 0.15 at 0, 0.65 at 100
  const glowOpacity = 0.15 + (clamped / 100) * 0.5;

  const valueFontSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-2xl';
  const labelFontSize = size === 'sm' ? 'text-[8px]' : size === 'lg' ? 'text-[11px]' : 'text-[9px]';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg
          width={dim}
          height={dim}
          viewBox={`0 0 ${dim} ${dim}`}
          className="block"
        >
          <defs>
            {/* Gradient for the arc */}
            <linearGradient id={`${uid}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="1" />
              <stop offset="100%" stopColor={color} stopOpacity="0.6" />
            </linearGradient>

            {/* Glow filter */}
            <filter id={`${uid}-glow`} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur in="SourceGraphic" stdDeviation={size === 'sm' ? 4 : 6} result="blur" />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"
              />
            </filter>

            {/* Pulse glow filter (larger, softer) */}
            <filter id={`${uid}-pulse`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation={size === 'sm' ? 8 : 12} result="blur" />
            </filter>
          </defs>

          {/* Track ring */}
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke="var(--ring-track)"
            strokeWidth={stroke}
            strokeLinecap="round"
          />

          {/* Pulsing outer glow */}
          {showPulse && animate && (
            <circle
              cx={dim / 2}
              cy={dim / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={stroke + 4}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              filter={`url(#${uid}-pulse)`}
              opacity={glowOpacity}
              transform={`rotate(-90 ${dim / 2} ${dim / 2})`}
              style={{
                animation: 'pulsingMeterGlow 2s ease-in-out infinite',
              }}
            />
          )}

          {/* Glow behind active arc */}
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke + 2}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            filter={`url(#${uid}-glow)`}
            opacity={glowOpacity * 0.7}
            transform={`rotate(-90 ${dim / 2} ${dim / 2})`}
            style={{
              transition: animate ? 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
            }}
          />

          {/* Active arc */}
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke={`url(#${uid}-grad)`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${dim / 2} ${dim / 2})`}
            style={{
              transition: animate ? 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
            }}
          />

          {/* Bright tip dot at the end of the arc */}
          {clamped > 0 && (
            <circle
              cx={dim / 2 + radius * Math.cos(((clamped / 100) * 360 - 90) * (Math.PI / 180))}
              cy={dim / 2 + radius * Math.sin(((clamped / 100) * 360 - 90) * (Math.PI / 180))}
              r={stroke / 2 + 1}
              fill={color}
              style={{
                filter: `drop-shadow(0 0 4px ${color})`,
                transition: animate ? 'cx 1s cubic-bezier(0.4, 0, 0.2, 1), cy 1s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
              }}
            />
          )}
        </svg>

        {/* Center text */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ pointerEvents: 'none' }}
        >
          <span
            className={`${valueFontSize} font-extrabold leading-none`}
            style={{ color: 'var(--heading)' }}
          >
            {Math.round(clamped)}
          </span>
          <span
            className={`${labelFontSize} font-bold uppercase tracking-wider mt-1`}
            style={{ color: 'var(--text-muted)' }}
          >
            {label}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes pulsingMeterGlow {
          0%, 100% { opacity: ${glowOpacity * 0.4}; }
          50% { opacity: ${glowOpacity}; }
        }
      `}</style>
    </div>
  );
}
