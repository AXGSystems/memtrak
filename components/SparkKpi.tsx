'use client';

import { useState, ReactNode } from 'react';
import { X, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SparkKpiProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: { value: number; label: string }; // e.g. { value: 12.3, label: 'vs last month' }
  sparkData?: number[]; // 7-12 data points for the sparkline
  sparkColor?: string;
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color?: string;
  detail?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  accent?: boolean; // highlight card with accent border-top
}

function Sparkline({ data, color = 'var(--accent)', height = 32, width = 80 }: { data: number[]; color?: string; height?: number; width?: number }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 2;

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return `${x},${y}`;
  });

  const fillPoints = [...points, `${pad + ((data.length - 1) / (data.length - 1)) * (width - pad * 2)},${height}`, `${pad},${height}`];

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="flex-shrink-0">
      <defs>
        <linearGradient id={`spark-fill-${color.replace(/[^a-z0-9]/gi, '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={fillPoints.join(' ')}
        fill={`url(#spark-fill-${color.replace(/[^a-z0-9]/gi, '')})`}
      />
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      {(() => {
        const lastPoint = points[points.length - 1].split(',');
        return <circle cx={lastPoint[0]} cy={lastPoint[1]} r="2.5" fill={color} />;
      })()}
    </svg>
  );
}

export default function SparkKpi({ label, value, sub, trend, sparkData, sparkColor, icon: Icon, color, detail, size = 'md', accent }: SparkKpiProps) {
  const [showDetail, setShowDetail] = useState(false);

  const trendColor = trend ? (trend.value > 0 ? '#8CC63F' : trend.value < 0 ? '#D94A4A' : 'var(--text-muted)') : undefined;
  const TrendIcon = trend ? (trend.value > 0 ? TrendingUp : trend.value < 0 ? TrendingDown : Minus) : null;

  return (
    <>
      <div
        onClick={detail ? () => setShowDetail(true) : undefined}
        className={`group rounded-xl border transition-all duration-300 ease-out hover:translate-y-[-3px] ${detail ? 'cursor-pointer' : ''} ${size === 'lg' ? 'p-5' : size === 'sm' ? 'p-3' : 'p-4'}`}
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
          borderColor: 'rgba(255,255,255,0.10)',
          backdropFilter: 'blur(16px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(16px) saturate(1.2)',
          borderTopWidth: accent ? '3px' : undefined,
          borderTopColor: accent ? (color || 'var(--accent)') : undefined,
          boxShadow: '0 4px 24px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        {/* Top row: label + icon */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>{label}</span>
          {Icon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} style={{ color: color || 'var(--accent)' }} />}
        </div>

        {/* Middle: value + sparkline */}
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <div className={`font-extrabold leading-none ${size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-lg' : 'text-xl'}`} style={{ color: color || 'var(--heading)' }}>
              {value}
            </div>
            {trend && TrendIcon && (
              <div className="flex items-center gap-1 mt-1.5">
                <TrendIcon className="w-3 h-3" style={{ color: trendColor }} />
                <span className="text-[10px] font-bold" style={{ color: trendColor }}>
                  {trend.value > 0 ? '+' : ''}{trend.value}%
                </span>
                <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{trend.label}</span>
              </div>
            )}
          </div>
          {sparkData && sparkData.length >= 2 && (
            <Sparkline data={sparkData} color={sparkColor || color || 'var(--accent)'} height={size === 'lg' ? 40 : 32} width={size === 'lg' ? 100 : 72} />
          )}
        </div>

        {/* Bottom: subtitle */}
        {sub && (
          <div className={`text-[10px] ${trend ? 'mt-1' : 'mt-1.5'}`} style={{ color: 'var(--text-muted)' }}>{sub}</div>
        )}

        {detail && <div className="text-[8px] mt-2 font-semibold" style={{ color: 'var(--accent)' }}>Click for details</div>}
      </div>

      {/* Detail modal */}
      {showDetail && detail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowDetail(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border"
            style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--card) 90%, transparent)', borderColor: 'var(--card-border)' }}>
              <div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{label}</h3>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Detailed breakdown</p>
              </div>
              <button onClick={() => setShowDetail(false)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <div className="text-3xl font-extrabold mb-1" style={{ color: color || 'var(--heading)' }}>{value}</div>
              {trend && TrendIcon && (
                <div className="flex items-center gap-1 mb-4">
                  <TrendIcon className="w-4 h-4" style={{ color: trendColor }} />
                  <span className="text-xs font-bold" style={{ color: trendColor }}>{trend.value > 0 ? '+' : ''}{trend.value}%</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{trend.label}</span>
                </div>
              )}
              {detail}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** Inline mini progress bar for use inside cards/tables */
export function MiniBar({ value, max = 100, color = 'var(--accent)', height = 4 }: { value: number; max?: number; color?: string; height?: number }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height, background: 'var(--card-border)' }}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

/** Status pill with consistent styling */
export function StatusPill({ status, size = 'sm' }: { status: string; size?: 'sm' | 'xs' }) {
  const colors: Record<string, { bg: string; text: string }> = {
    excellent: { bg: 'rgba(140,198,63,0.15)', text: '#8CC63F' },
    good: { bg: 'rgba(74,144,217,0.15)', text: '#4A90D9' },
    warning: { bg: 'rgba(232,146,63,0.15)', text: '#E8923F' },
    critical: { bg: 'rgba(217,74,74,0.15)', text: '#D94A4A' },
    active: { bg: 'rgba(140,198,63,0.15)', text: '#8CC63F' },
    scheduled: { bg: 'rgba(74,144,217,0.15)', text: '#4A90D9' },
    draft: { bg: 'var(--input-bg)', text: 'var(--text-muted)' },
  };
  const c = colors[status.toLowerCase()] || colors.draft;
  return (
    <span className={`inline-flex items-center font-bold rounded-full ${size === 'xs' ? 'text-[8px] px-1.5 py-0.5' : 'text-[9px] px-2 py-0.5'}`} style={{ background: c.bg, color: c.text }}>
      {status}
    </span>
  );
}
