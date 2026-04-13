'use client';
import { useEffect, useState } from 'react';

interface Props {
  value: number;
  max: number;
  label: string;
  color: string;
  size?: number;
}

export default function ProgressRing({ value, max, label, color, size = 100 }: Props) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const percentage = Math.round((value / max) * 100);

  useEffect(() => {
    const start = performance.now();
    const duration = 1000;

    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedValue(Math.round(eased * percentage));
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, [percentage]);

  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference - (animatedValue / 100) * circumference;
  const center = size / 2;

  // Format the "X of Y" text
  const fmtNum = (n: number) => {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return n.toLocaleString('en-US');
    return String(n);
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#eef1f5"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          style={{ transition: 'stroke-dashoffset 0.05s linear' }}
        />
      </svg>
      {/* Percentage in center — overlay on the SVG */}
      <div className="relative" style={{ marginTop: -size * 0.65, height: size * 0.35 }}>
        <span className="text-lg font-extrabold" style={{ color: 'var(--theme-heading)' }}>
          {animatedValue}%
        </span>
      </div>
      <div className="text-xs font-semibold" style={{ color: 'var(--theme-heading)' }}>{label}</div>
      <div className="text-[10px]" style={{ color: 'var(--theme-text-muted)' }}>
        {fmtNum(value)} of {fmtNum(max)}
      </div>
    </div>
  );
}
