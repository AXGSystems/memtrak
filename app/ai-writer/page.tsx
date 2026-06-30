'use client';

import { useState } from 'react';
import { Sparkles, Copy, CheckCircle, Loader2 } from 'lucide-react';

/**
 * AI Subject Line Writer
 *
 * Generates subject lines with the real Claude-backed /api/memtrak/ai
 * endpoint (mode: "subjects"). No fabricated "predicted open rate" numbers —
 * predicting open rate requires real historical send data we don't model here,
 * so we surface the generated line and its style only. If AI is not configured,
 * the UI says so honestly instead of returning canned strings.
 */

interface Suggestion { subject: string; style: string }

const topics = [
  { id: 'compliance', label: 'PFL Compliance', brief: 'A PFL (Private Flood Licensing/compliance) status notice to ALTA member title agencies prompting them to review/act on their compliance status.' },
  { id: 'renewal', label: 'Membership Renewal', brief: 'An ALTA membership renewal reminder encouraging members to renew before their term lapses.' },
  { id: 'event', label: 'Event Invitation', brief: 'An invitation to ALTA ONE, the annual conference for title and settlement professionals — encourage early registration.' },
  { id: 'newsletter', label: 'Newsletter', brief: 'A weekly Title News industry-update newsletter for ALTA members.' },
];

export default function AIWriter() {
  const [topicId, setTopicId] = useState('');
  const [copied, setCopied] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Suggestion[]>([]);
  const [status, setStatus] = useState<'' | 'unconfigured' | 'error'>('');

  const copy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopied(String(idx));
    setTimeout(() => setCopied(''), 2000);
  };

  const generate = async (id: string, brief: string) => {
    setTopicId(id);
    setLoading(true);
    setResults([]);
    setStatus('');
    try {
      const res = await fetch('/api/memtrak/ai', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mode: 'subjects', topic: brief }),
      });
      const data = await res.json();
      if (data.configured === false) {
        setStatus('unconfigured');
      } else if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        setResults(data.suggestions);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold mb-1" style={{ color: 'var(--heading)' }}>AI Subject Line Writer</h1>
      <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>Generate subject-line options with Claude. Select a topic to get five AI-written options you can copy into a campaign.</p>

      {/* Topic Selector */}
      <div className="rounded-xl border p-5 mb-6" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
        <h3 className="text-xs font-bold mb-3" style={{ color: 'var(--heading)' }}>What&apos;s your email about?</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {topics.map(t => (
            <button key={t.id} onClick={() => generate(t.id, t.brief)} disabled={loading} className={`p-4 rounded-xl text-left transition-all disabled:opacity-50 ${topicId === t.id ? 'scale-[1.02]' : 'hover:scale-[1.01]'}`} style={{ background: topicId === t.id ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'var(--background)', border: topicId === t.id ? '2px solid var(--accent)' : '1px solid var(--card-border)' }}>
              <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{t.label}</div>
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="rounded-xl border p-5 flex items-center gap-2 text-xs" style={{ background: 'var(--card)', borderColor: 'var(--card-border)', color: 'var(--text-muted)' }}>
          <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--accent)' }} />
          Generating subject lines with Claude…
        </div>
      )}

      {status === 'unconfigured' && (
        <div className="rounded-xl border p-5 text-xs" style={{ background: 'var(--card)', borderColor: 'var(--card-border)', color: 'var(--text-muted)' }}>
          AI is not configured in this environment. Set the <code className="font-mono">ANTHROPIC_API_KEY</code> environment variable to enable subject-line generation.
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-xl border p-5 text-xs" style={{ background: 'var(--card)', borderColor: 'var(--card-border)', color: 'var(--text-muted)' }}>
          The AI request did not complete. Please try again.
        </div>
      )}

      {/* Generated Suggestions */}
      {results.length > 0 && (
        <div className="rounded-xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            <h3 className="text-xs font-bold" style={{ color: 'var(--heading)' }}>AI-Generated Subject Lines</h3>
          </div>
          <div className="space-y-3">
            {results.map((r, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl transition-all hover:translate-x-1" style={{ background: 'var(--background)', border: '1px solid var(--card-border)' }}>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold" style={{ color: 'var(--heading)' }}>{r.subject}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Style: {r.style}</div>
                </div>
                <button onClick={() => copy(r.subject, i)} className="flex-shrink-0 p-2 rounded-lg transition-colors" style={{ color: 'var(--accent)' }}>
                  {copied === String(i) ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg text-[10px]" style={{ background: 'color-mix(in srgb, var(--accent) 6%, transparent)', color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--heading)' }}>Tip:</strong> A/B test your top 2 picks before a full send to measure real open rates against your audience.
          </div>
        </div>
      )}
    </div>
  );
}
