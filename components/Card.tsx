'use client';

import { useState, ReactNode } from 'react';
import { X, Maximize2, Printer } from 'lucide-react';
import { memtrakPrint } from '@/lib/print';

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  glass?: boolean;
  accent?: string;
  detailTitle?: string;
  detailContent?: ReactNode;
  noPad?: boolean;
}

export default function Card({ children, title, subtitle, className = '', glass = false, accent, detailTitle, detailContent, noPad }: CardProps) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <>
      <div
        className={`rounded-xl border transition-all duration-200 hover:translate-y-[-1px] ${glass ? 'backdrop-blur-md' : ''} ${className}`}
        style={{
          background: glass ? 'rgba(255,255,255,0.03)' : 'var(--card)',
          borderColor: glass ? 'rgba(255,255,255,0.08)' : 'var(--card-border)',
          borderLeftWidth: accent ? '4px' : undefined,
          borderLeftColor: accent,
          boxShadow: glass ? '0 4px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05)' : '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        {(title || detailContent) && (
          <div className={`flex items-start justify-between ${noPad ? 'px-5 pt-4' : 'px-5 pt-4 pb-0'}`}>
            <div className="min-w-0 flex-1">
              {title && <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{title}</h3>}
              {subtitle && <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
            </div>
            {detailContent && (
              <button
                onClick={() => setShowDetail(true)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all hover:scale-105 ml-3 flex-shrink-0"
                style={{ color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}
              >
                <Maximize2 className="w-3 h-3" /> Detail
              </button>
            )}
          </div>
        )}
        <div className={noPad ? '' : 'p-5'}>{children}</div>
      </div>

      {/* Detail Modal */}
      {showDetail && detailContent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowDetail(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border"
            style={{
              background: 'var(--card)',
              borderColor: 'var(--card-border)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--card) 90%, transparent)', borderColor: 'var(--card-border)' }}>
              <div>
                <h2 className="text-base font-bold" style={{ color: 'var(--heading)' }}>{detailTitle || title}</h2>
                {subtitle && <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
              </div>
              <button onClick={() => setShowDetail(false)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Modal content */}
            <div className="p-6">{detailContent}</div>
          </div>
        </div>
      )}
    </>
  );
}

/** KPI Card — compact metric display with optional click-to-detail */
export function KpiCard({ label, value, sub, icon: Icon, color, detail }: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color?: string;
  detail?: ReactNode;
}) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <>
      <div
        onClick={detail ? () => setShowDetail(true) : undefined}
        className={`rounded-xl border p-4 transition-all duration-200 hover:translate-y-[-2px] ${detail ? 'cursor-pointer' : ''}`}
        style={{
          background: 'var(--card)',
          borderColor: 'var(--card-border)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>{label}</span>
          {Icon && <Icon className="w-3.5 h-3.5" style={{ color: color || 'var(--accent)' }} />}
        </div>
        <div className="text-xl font-extrabold" style={{ color: color || 'var(--heading)' }}>{value}</div>
        {sub && <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</div>}
        {detail && <div className="text-[9px] mt-1" style={{ color: 'var(--accent)' }}>Click for details →</div>}
      </div>

      {showDetail && detail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowDetail(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border p-6" style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{label}</h3>
              <button onClick={() => setShowDetail(false)} className="p-1 rounded-lg" style={{ color: 'var(--text-muted)' }}><X className="w-4 h-4" /></button>
            </div>
            <div className="text-3xl font-extrabold mb-4" style={{ color: color || 'var(--heading)' }}>{value}</div>
            {detail}
          </div>
        </div>
      )}
    </>
  );
}
