'use client';

import { useEffect, useState } from 'react';
import { Activity, TrendingUp, TrendingDown, RefreshCw, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import Card from './Card';
import type { EngagementBreakdown } from '@/lib/engagement';

interface RecomputePayload {
  org_id: string;
  previous_score: number;
  previous_tier: string;
  new_score: number;
  new_tier: string;
  breakdown: EngagementBreakdown;
  persisted: boolean;
}

interface EngagementBreakdownPanelProps {
  orgId: string;
  orgName: string;
}

const TIER_COLOR: Record<EngagementBreakdown['tier'], string> = {
  Champion: '#8CC63F',
  Engaged: '#4A90D9',
  'At Risk': '#F5C542',
  Disengaged: '#E8923F',
  'Gone Dark': '#D94A4A',
};

export default function EngagementBreakdownPanel({ orgId, orgName }: EngagementBreakdownPanelProps) {
  const [data, setData] = useState<RecomputePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [persistMessage, setPersistMessage] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    setPersistMessage(null);
    try {
      const res = await fetch(`/api/memtrak/orgs/${encodeURIComponent(orgId)}/recompute-engagement`);
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? `Request failed (${res.status}).`);
        return;
      }
      setData(body);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [orgId]); // eslint-disable-line react-hooks/exhaustive-deps

  const persist = async () => {
    setSubmitting(true);
    setError(null);
    setPersistMessage(null);
    try {
      const res = await fetch(`/api/memtrak/orgs/${encodeURIComponent(orgId)}/recompute-engagement`, { method: 'POST' });
      const body: RecomputePayload & { error?: string } = await res.json();
      if (!res.ok) {
        setError(body.error ?? `Request failed (${res.status}).`);
        return;
      }
      setData(body);
      setPersistMessage(body.persisted ? 'Saved to Supabase.' : 'Computed (Supabase not configured — preview only).');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  const delta = data ? data.new_score - data.previous_score : 0;
  const tierColor = data ? TIER_COLOR[data.breakdown.tier] : '#888';

  return (
    <Card title="Engagement breakdown" subtitle={`Computed score for ${orgName}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ background: `color-mix(in srgb, ${tierColor} 14%, transparent)` }}
          >
            <Activity className="w-4 h-4" style={{ color: tierColor }} />
          </div>
          <div>
            <div className="text-3xl font-extrabold tabular-nums" style={{ color: tierColor }}>
              {loading || !data ? '—' : data.new_score}
            </div>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              {loading || !data ? 'Loading…' : data.breakdown.tier}
            </div>
          </div>
          {data && delta !== 0 && (
            <div className="flex items-center gap-1 text-[11px] font-bold" style={{ color: delta > 0 ? '#8CC63F' : '#D94A4A' }}>
              {delta > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {delta > 0 ? '+' : ''}{delta} vs saved ({data.previous_score})
            </div>
          )}
        </div>
        <button
          onClick={persist}
          disabled={submitting || loading}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-all hover:scale-[1.05] disabled:opacity-50 no-print"
          style={{ color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 12%, transparent)' }}
        >
          {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          Save & recompute
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs mb-3" style={{ background: 'color-mix(in srgb, #D94A4A 12%, transparent)', color: '#D94A4A', border: '1px solid color-mix(in srgb, #D94A4A 30%, transparent)' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {error}
        </div>
      )}
      {persistMessage && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs mb-3" style={{ background: 'color-mix(in srgb, #8CC63F 14%, transparent)', color: '#8CC63F', border: '1px solid color-mix(in srgb, #8CC63F 32%, transparent)' }}>
          <CheckCircle2 className="w-4 h-4" /> {persistMessage}
        </div>
      )}

      {data && (
        <div className="space-y-2">
          {data.breakdown.factors.map((f) => {
            const isPenalty = f.points < 0;
            const pct = f.max > 0 ? Math.round((f.points / f.max) * 100) : 0;
            const color = isPenalty ? '#D94A4A' : pct >= 70 ? '#8CC63F' : pct >= 40 ? '#4A90D9' : '#F5C542';
            return (
              <div key={f.label} className="p-2.5 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{f.label}</span>
                  <span className="text-xs font-bold tabular-nums" style={{ color }}>
                    {f.points > 0 ? '+' : ''}{f.points}{f.max > 0 ? ` / ${f.max}` : ''}
                  </span>
                </div>
                <div className="text-[10px] mb-1.5" style={{ color: 'var(--text-muted)' }}>{f.detail}</div>
                {f.max > 0 && (
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--card-border)' }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: color }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[10px] pt-3" style={{ color: 'var(--text-muted)' }}>
        Buckets: email engagement (40) · attendance frequency (25) · attendance recency (15) · event-type quality (10) · trust score (10).
        Penalties: no-shows (-10 max) · inactive status (-20).
      </p>
    </Card>
  );
}
