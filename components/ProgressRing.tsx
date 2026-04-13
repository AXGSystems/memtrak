'use client';
import { useEffect, useState } from 'react';

interface Props {
  value: number;
  max: number;
  label?: string;
  color: string;
  size?: number;
}

export default function ProgressRing({ value, max, color, size = 64 }: Props) {
  const [animatedPct, setAnimatedPct] = useState(0);
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  useEffect(() => {
    const start = performance.now();
    const duration = 1200;
    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedPct(Math.round(eased * percentage));
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [percentage]);

  const strokeWidth = Math.max(size * 0.09, 3);
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference - (animatedPct / 100) * circumference;
  const center = size / 2;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Glow filter */}
        <defs>
          <filter id={`glow-${color.replace('#', '')}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feFlood floodColor={color} floodOpacity="0.4" />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Background track */}
        <circle
          cx={center} cy={center} r={radius}
          fill="none"
          stroke="var(--ring-track, rgba(255,255,255,0.06))"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc with glow */}
        <circle
          cx={center} cy={center} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          filter={`url(#glow-${color.replace('#', '')})`}
          style={{ transition: 'stroke-dashoffset 0.08s linear' }}
        />
      </svg>
      {/* Center percentage */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-extrabold text-white" style={{ fontSize: size * 0.24 }}>
          {animatedPct}<span className="text-white/40" style={{ fontSize: size * 0.16 }}>%</span>
        </span>
      </div>
    </div>
  );
}
