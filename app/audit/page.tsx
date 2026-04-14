'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, HelpCircle } from 'lucide-react';

type Answer = 'yes' | 'no' | 'partial' | 'unknown' | '';
const questions = [
  { id: 'hl', cat: 'Source Tracking', q: 'Does Higher Logic track open/click rates on all campaigns?', impact: 'Critical' },
  { id: 'thad', cat: 'Source Tracking', q: 'Does Thaddeus/re:Members include tracking pixels in emails?', impact: 'Critical' },
  { id: 'outlook', cat: 'Source Tracking', q: 'Are manual Outlook emails tracked in any system?', impact: 'High' },
  { id: 'utm', cat: 'Source Tracking', q: 'Do all email links include UTM parameters?', impact: 'High' },
  { id: 'spf', cat: 'Deliverability', q: 'Is SPF, DKIM, and DMARC configured for alta.org?', impact: 'Critical' },
  { id: 'bounce', cat: 'Deliverability', q: 'Are hard bounces automatically removed from lists?', impact: 'High' },
  { id: 'hygiene', cat: 'Deliverability', q: 'Is the mailing list cleaned at least quarterly?', impact: 'Medium' },
  { id: 'suppress', cat: 'Deliverability', q: 'Is there a unified suppression list across all platforms?', impact: 'Critical' },
  { id: 'ga', cat: 'Analytics', q: 'Is GA tracking email-driven website visits?', impact: 'High' },
  { id: 'review', cat: 'Analytics', q: 'Does the team review email analytics at least monthly?', impact: 'Medium' },
  { id: 'ab', cat: 'Analytics', q: 'Are subject lines A/B tested on major campaigns?', impact: 'Medium' },
  { id: 'conv', cat: 'Analytics', q: 'Can you attribute a renewal to a specific email?', impact: 'High' },
  { id: 'calendar', cat: 'Process', q: 'Is there a shared email send calendar?', impact: 'Medium' },
  { id: 'template', cat: 'Process', q: 'Are templates standardized with ALTA branding?', impact: 'High' },
  { id: 'owner', cat: 'Process', q: 'Is there a single owner for email strategy?', impact: 'High' },
];

const icons = { yes: <CheckCircle className="w-4 h-4 text-green-400" />, no: <XCircle className="w-4 h-4 text-red-400" />, partial: <AlertTriangle className="w-4 h-4 text-amber-400" />, unknown: <HelpCircle className="w-4 h-4 text-blue-400" />, '': <div className="w-4 h-4 rounded-full border-2 border-white/20" /> };

export default function Audit() {
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const answered = Object.values(answers).filter(a => a).length;
  const yesCount = Object.values(answers).filter(a => a === 'yes').length;
  const noCount = Object.values(answers).filter(a => a === 'no').length;
  const score = answered > 0 ? Math.round((yesCount * 100 + Object.values(answers).filter(a => a === 'partial').length * 50) / answered) : 0;
  const cats = [...new Set(questions.map(q => q.cat))];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-extrabold text-white">Email Infrastructure Audit</h1>
        <div className="flex items-center gap-3">
          <div className={`text-2xl font-extrabold ${score >= 70 ? 'text-green-400' : score >= 40 ? 'text-amber-400' : 'text-red-400'}`}>{score}/100</div>
          <span className="text-xs text-white/40">{answered}/{questions.length} answered</span>
        </div>
      </div>

      {cats.map(cat => (
        <div key={cat} className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5 mb-4">
          <h3 className="text-xs font-bold text-white mb-3">{cat}</h3>
          <div className="space-y-3">
            {questions.filter(q => q.cat === cat).map(q => (
              <div key={q.id} className={`p-3 rounded-lg ${answers[q.id] === 'no' ? 'bg-red-500/5 border border-red-500/20' : answers[q.id] === 'yes' ? 'bg-green-500/5 border border-green-500/20' : 'bg-white/5 border border-white/5'}`}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{icons[answers[q.id] || '']}</div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-white">{q.q}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${q.impact === 'Critical' ? 'bg-red-500/20 text-red-400' : q.impact === 'High' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>{q.impact}</span>
                      {(['yes', 'partial', 'no', 'unknown'] as Answer[]).map(a => (
                        <button key={a} onClick={() => setAnswers(p => ({ ...p, [q.id]: a }))} className={`px-2.5 py-1 rounded text-[10px] font-semibold border transition-all ${answers[q.id] === a ? a === 'yes' ? 'bg-green-500 text-white border-green-500' : a === 'no' ? 'bg-red-500 text-white border-red-500' : a === 'partial' ? 'bg-amber-500 text-white border-amber-500' : 'bg-blue-500 text-white border-blue-500' : 'border-white/10 text-white/40 hover:border-white/30'}`}>
                          {a === 'yes' ? 'Yes' : a === 'no' ? 'No' : a === 'partial' ? 'Partial' : "Don't Know"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
