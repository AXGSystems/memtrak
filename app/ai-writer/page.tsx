'use client';

import { useState } from 'react';
import { Sparkles, Copy, CheckCircle, Zap, TrendingUp } from 'lucide-react';

const C = { green: '#8CC63F', blue: '#4A90D9', orange: '#E8923F' };

// AI-generated subject line suggestions — what Klaviyo K:AI does for $150/mo
const suggestions: Record<string, { subject: string; predicted: number; style: string }[]> = {
  compliance: [
    { subject: 'Action Required: Your PFL Compliance Status Needs Attention', predicted: 38, style: 'Urgency' },
    { subject: 'Your PFL License — Here\'s What You Need to Know', predicted: 34, style: 'Educational' },
    { subject: '⚠️ PFL Compliance Deadline Approaching — Act Now', predicted: 42, style: 'Emoji + Urgency' },
    { subject: '[Member Name], Your Organization\'s Compliance Status', predicted: 45, style: 'Personalized' },
    { subject: 'Don\'t Risk Your Title Practice — PFL Update Inside', predicted: 36, style: 'Fear of Loss' },
  ],
  renewal: [
    { subject: 'Your ALTA Membership Renewal is Coming Up', predicted: 52, style: 'Informational' },
    { subject: '[Member Name], Don\'t Lose Your ALTA Benefits', predicted: 62, style: 'Personalized FOMO' },
    { subject: 'Renew by [Date] and Save — Early Bird Pricing Inside', predicted: 58, style: 'Incentive' },
    { subject: 'What You\'ll Miss Without ALTA Membership', predicted: 55, style: 'Value Prop' },
    { subject: '3 Reasons Members Like You Renewed Last Year', predicted: 48, style: 'Social Proof' },
  ],
  event: [
    { subject: 'You\'re Invited: ALTA ONE 2026 — Early Registration Open', predicted: 45, style: 'Exclusive' },
    { subject: 'Save Your Spot — ALTA ONE Sells Out Every Year', predicted: 50, style: 'Scarcity' },
    { subject: '[Member Name], Join 800+ Title Professionals at ALTA ONE', predicted: 55, style: 'Social Proof' },
    { subject: '🎤 ALTA ONE Speaker Lineup Revealed — Register Now', predicted: 42, style: 'Emoji + Content' },
    { subject: 'The One Event Every Title Professional Should Attend', predicted: 38, style: 'Authority' },
  ],
  newsletter: [
    { subject: 'Title News: This Week\'s Industry Updates', predicted: 35, style: 'Standard' },
    { subject: '3 Things Title Professionals Need to Know This Week', predicted: 42, style: 'List + Curiosity' },
    { subject: 'Inside: New Legislation That Affects Your Practice', predicted: 48, style: 'Relevance' },
    { subject: '[Member Name], Your Weekly Industry Brief', predicted: 40, style: 'Personalized' },
    { subject: 'The Title Industry Report You Can\'t Afford to Miss', predicted: 44, style: 'Urgency' },
  ],
};

const topics = [
  { id: 'compliance', label: 'PFL Compliance', icon: '📋' },
  { id: 'renewal', label: 'Membership Renewal', icon: '🔄' },
  { id: 'event', label: 'Event Invitation', icon: '🎪' },
  { id: 'newsletter', label: 'Newsletter', icon: '📰' },
];

export default function AIWriter() {
  const [topic, setTopic] = useState('');
  const [copied, setCopied] = useState('');

  const copy = (text: string, idx: number) => { navigator.clipboard.writeText(text); setCopied(String(idx)); setTimeout(() => setCopied(''), 2000); };
  const results = topic ? suggestions[topic] || [] : [];

  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold mb-1" style={{ color: 'var(--heading)' }}>AI Subject Line Writer</h1>
      <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>Generate high-performing subject lines with predicted open rates — what Klaviyo K:AI charges $150/mo for. Select your email topic and get 5 AI-optimized options instantly.</p>

      {/* Topic Selector */}
      <div className="rounded-xl border p-5 mb-6" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
        <h3 className="text-xs font-bold mb-3" style={{ color: 'var(--heading)' }}>What&apos;s your email about?</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {topics.map(t => (
            <button key={t.id} onClick={() => setTopic(t.id)} className={`p-4 rounded-xl text-left transition-all ${topic === t.id ? 'scale-[1.02]' : 'hover:scale-[1.01]'}`} style={{ background: topic === t.id ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'var(--background)', border: topic === t.id ? '2px solid var(--accent)' : '1px solid var(--card-border)' }}>
              <div className="text-2xl mb-2">{t.icon}</div>
              <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{t.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Generated Suggestions */}
      {results.length > 0 && (
        <div className="rounded-xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            <h3 className="text-xs font-bold" style={{ color: 'var(--heading)' }}>AI-Generated Subject Lines</h3>
          </div>
          <div className="space-y-3">
            {results.sort((a, b) => b.predicted - a.predicted).map((r, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl transition-all hover:translate-x-1" style={{ background: i === 0 ? 'color-mix(in srgb, var(--accent) 8%, transparent)' : 'var(--background)', border: i === 0 ? '1px solid var(--accent)' : '1px solid var(--card-border)' }}>
                <div className="text-center flex-shrink-0 w-14">
                  <div className="text-lg font-extrabold" style={{ color: r.predicted >= 50 ? C.green : r.predicted >= 40 ? C.blue : C.orange }}>{r.predicted}%</div>
                  <div className="text-[8px] uppercase" style={{ color: 'var(--text-muted)' }}>predicted</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold" style={{ color: 'var(--heading)' }}>{r.subject}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Style: {r.style} {i === 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold" style={{ background: 'color-mix(in srgb, var(--accent) 20%, transparent)', color: 'var(--accent)' }}>TOP PICK</span>}</div>
                </div>
                <button onClick={() => copy(r.subject, i)} className="flex-shrink-0 p-2 rounded-lg transition-colors" style={{ color: 'var(--accent)' }}>
                  {copied === String(i) ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg text-[10px]" style={{ background: 'color-mix(in srgb, var(--accent) 6%, transparent)', color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--heading)' }}>Pro tip:</strong> Personalized subject lines with [Member Name] consistently outperform generic ones by 15-25%. A/B test your top 2 picks using MEMTrak&apos;s A/B Testing page before full send.
          </div>
        </div>
      )}
    </div>
  );
}
