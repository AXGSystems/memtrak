'use client';

import { useState, ReactNode } from 'react';
import { X, Maximize2 } from 'lucide-react';

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
  /** When true, disable the default glassmorphic background */
  solid?: boolean;
}

export default function Card({ children, title, subtitle, className = '', glass = false, accent, detailTitle, detailContent, noPad, solid }: CardProps) {
  const [showDetail, setShowDetail] = useState(false);

  const isGlass = glass || !solid;

  return (
    <>
      <div
        className={`group rounded-xl border transition-all duration-300 ease-out hover:translate-y-[-3px] ${detailContent ? 'cursor-pointer' : ''} ${className}`}
        style={{
          background: isGlass
            ? 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)'
            : 'var(--card)',
          borderColor: isGlass
            ? 'rgba(255,255,255,0.10)'
            : 'var(--card-border)',
          borderLeftWidth: accent ? '4px' : undefined,
          borderLeftColor: accent,
          boxShadow: isGlass
            ? '0 4px 30px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.1)'
            : '0 2px 8px rgba(0,0,0,0.08)',
          backdropFilter: 'blur(16px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(16px) saturate(1.2)',
        }}
        onClick={detailContent ? () => setShowDetail(true) : undefined}
      >
        {(title || detailContent) && (
          <div className={`flex items-start justify-between ${noPad ? 'px-5 pt-4' : 'px-5 pt-4 pb-0'}`}>
            <div className="min-w-0 flex-1">
              {title && <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{title}</h3>}
              {subtitle && <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
            </div>
            {detailContent && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowDetail(true); }}
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
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border print-modal"
            style={{
              background: 'var(--card)',
              borderColor: 'var(--card-border)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
              animation: 'scaleIn 0.2s ease-out',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md no-print" style={{ background: 'color-mix(in srgb, var(--card) 90%, transparent)', borderColor: 'var(--card-border)' }}>
              <div>
                <h2 className="text-base font-bold" style={{ color: 'var(--heading)' }}>{detailTitle || title}</h2>
                {subtitle && <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); window.print(); }}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all hover:scale-105"
                  style={{ color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}
                >
                  Print
                </button>
                <button onClick={() => setShowDetail(false)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }}>
                  <X className="w-4 h-4" />
                </button>
              </div>
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
        className={`group rounded-xl border p-4 transition-all duration-300 ease-out hover:translate-y-[-3px] ${detail ? 'cursor-pointer' : ''}`}
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
          borderColor: 'rgba(255,255,255,0.10)',
          boxShadow: '0 4px 30px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
          backdropFilter: 'blur(16px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(16px) saturate(1.2)',
        }}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>{label}</span>
          {Icon && <Icon className="w-3.5 h-3.5" style={{ color: color || 'var(--accent)' }} />}
        </div>
        <div className="text-xl font-extrabold" style={{ color: color || 'var(--heading)' }}>{value}</div>
        {sub && <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</div>}
        {detail && <div className="text-[9px] mt-1 font-semibold" style={{ color: 'var(--accent)' }}>Click for details</div>}
      </div>

      {showDetail && detail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowDetail(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border p-6 print-modal"
            style={{
              background: 'var(--card)',
              borderColor: 'var(--card-border)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
              animation: 'scaleIn 0.2s ease-out',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{label}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); window.print(); }}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-semibold"
                  style={{ color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}
                >
                  Print
                </button>
                <button onClick={() => setShowDetail(false)} className="p-1 rounded-lg" style={{ color: 'var(--text-muted)' }}><X className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="text-3xl font-extrabold mb-4" style={{ color: color || 'var(--heading)' }}>{value}</div>
            {detail}
          </div>
        </div>
      )}
    </>
  );
}
