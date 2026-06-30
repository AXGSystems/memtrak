'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Search, Zap, Circle } from 'lucide-react';

const C = { green: '#8CC63F', red: '#D94A4A', orange: '#E8923F', blue: '#4A90D9', gray: '#6B7A8D' };

// Spam trigger words checked against the email content below.
const triggerWords = ['free', 'act now', 'limited time', 'click here', 'buy now', 'winner', 'congratulations', 'urgent', 'guarantee', '100%', 'no cost', 'risk-free', 'order now', 'special offer', 'exclusive deal', 'cash', 'credit', 'billion', 'million dollars'];

// The major DNSBL / blacklist zones MEMTrak is designed to monitor for the
// sending IP. These are NOT live results — live reputation querying requires
// connecting a monitoring feed (Google Postmaster / a DNSBL lookup service).
// Until then the panel honestly shows "Not checked" rather than a fake "Clean".
const blacklists = [
  { name: 'Spamhaus ZEN', zone: 'zen.spamhaus.org' },
  { name: 'Barracuda BRBL', zone: 'b.barracudacentral.org' },
  { name: 'SURBL', zone: 'multi.surbl.org' },
  { name: 'SpamCop', zone: 'bl.spamcop.net' },
  { name: 'Invaluement', zone: 'sip.invaluement.com' },
  { name: 'SORBS', zone: 'dnsbl.sorbs.net' },
  { name: 'UCEProtect L1', zone: 'dnsbl-1.uceprotect.net' },
  { name: 'UCEProtect L2', zone: 'dnsbl-2.uceprotect.net' },
  { name: 'Composite BL', zone: 'cbl.abuseat.org' },
  { name: 'JustSpam', zone: 'dnsbl.justspam.org' },
];

interface CheckResult { score: number; issues: string[]; passed: string[]; }

function analyzeContent(subject: string, body: string): CheckResult {
  const issues: string[] = [];
  const passed: string[] = [];
  let score = 100;

  // Subject checks
  if (subject.length === 0) { issues.push('Missing subject line'); score -= 20; }
  else if (subject.length > 60) { issues.push('Subject line over 60 chars — may get truncated on mobile'); score -= 5; }
  else passed.push('Subject line length OK (' + subject.length + ' chars)');

  if (subject === subject.toUpperCase() && subject.length > 3) { issues.push('ALL CAPS subject line — major spam signal'); score -= 25; }
  else passed.push('Subject casing is normal');

  if (/!{2,}/.test(subject)) { issues.push('Multiple exclamation marks in subject — spam signal'); score -= 10; }
  if (/\$\d/.test(subject)) { issues.push('Dollar amounts in subject — triggers spam filters'); score -= 10; }

  // Body checks
  const lowerBody = body.toLowerCase();
  const foundTriggers = triggerWords.filter(w => lowerBody.includes(w));
  if (foundTriggers.length > 0) { issues.push(`Spam trigger words found: "${foundTriggers.join('", "')}"`); score -= foundTriggers.length * 5; }
  else passed.push('No spam trigger words detected');

  if (body.length === 0) { issues.push('Empty email body'); score -= 30; }
  else if (body.length < 50) { issues.push('Very short body — may be flagged as suspicious'); score -= 10; }
  else passed.push('Body length OK');

  const linkCount = (body.match(/https?:\/\//g) || []).length;
  if (linkCount > 5) { issues.push(`${linkCount} links found — too many links triggers spam filters`); score -= 10; }
  else if (linkCount > 0) passed.push(`${linkCount} link(s) — within safe range`);

  if (/<img/i.test(body)) {
    const imgCount = (body.match(/<img/gi) || []).length;
    if (imgCount > 3) { issues.push(`${imgCount} images — high image-to-text ratio triggers spam`); score -= 10; }
    else passed.push(`${imgCount} image(s) — OK`);
  }

  // Domain authentication note — this content checker analyzes the message
  // text only; it does NOT perform a live DNS lookup of the sending domain.
  // The expected alta.org configuration (SPF/DKIM via M365, DMARC p=none) is
  // surfaced as context, not asserted as a verified result for this message.
  passed.push('SPF/DKIM: expected via M365 sending path (not verified by live DNS lookup here)');
  issues.push('DMARC: expected p=none for alta.org — recommend upgrading to "quarantine" (verify in DNS)');
  score -= 5;

  if (!body.includes('unsubscribe') && !body.includes('Unsubscribe')) { issues.push('No unsubscribe link detected — CAN-SPAM violation risk'); score -= 15; }
  else passed.push('Unsubscribe link present');

  return { score: Math.max(0, score), issues, passed };
}

export default function SpamCheck() {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [result, setResult] = useState<CheckResult | null>(null);

  const check = () => setResult(analyzeContent(subject, body));

  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold mb-1" style={{ color: 'var(--heading)' }}>Spam Score Pre-Check</h1>
      <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>Test your email content BEFORE sending. Checks subject lines, body content, link density, image ratio, and CAN-SPAM compliance against the rules below.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Input */}
        <div className="rounded-xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <h3 className="text-xs font-bold mb-3" style={{ color: 'var(--heading)' }}>Paste Your Email</h3>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold uppercase mb-1 block" style={{ color: 'var(--text-muted)' }}>Subject Line</label>
              <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Your PFL Compliance Status — Action Required" className="w-full px-3 py-2.5 rounded-lg text-xs" style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--heading)' }} />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase mb-1 block" style={{ color: 'var(--text-muted)' }}>Email Body (HTML or plain text)</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={10} placeholder="<h1>Dear Member,</h1><p>Your PFL compliance status requires attention...</p><p><a href='https://alta.org/pfl'>Review your status</a></p><p><a href='https://dash.alta.org/api/memtrak/unsubscribe?email=test'>Unsubscribe</a></p>" className="w-full px-3 py-2.5 rounded-lg text-xs font-mono resize-none" style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--heading)' }} />
            </div>
            <button onClick={check} disabled={!subject && !body} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-40" style={{ background: 'var(--accent)', color: 'white' }}>
              <Zap className="w-4 h-4" /> Run Spam Check
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="rounded-xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
          {result ? (
            <>
              <div className="text-center mb-4">
                <div className="text-3xl sm:text-5xl font-extrabold" style={{ color: result.score >= 80 ? C.green : result.score >= 50 ? C.orange : C.red }}>{result.score}</div>
                <div className="text-xs font-bold mt-1" style={{ color: result.score >= 80 ? C.green : result.score >= 50 ? C.orange : C.red }}>
                  {result.score >= 80 ? 'Good — Safe to Send' : result.score >= 50 ? 'Caution — Review Issues' : 'High Risk — Fix Before Sending'}
                </div>
              </div>
              {result.issues.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-[10px] font-bold uppercase mb-2" style={{ color: C.red }}>Issues Found ({result.issues.length})</h4>
                  <div className="space-y-1">
                    {result.issues.map((issue, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] p-2 rounded-lg" style={{ background: 'rgba(217,74,74,0.06)' }}>
                        <XCircle className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: C.red }} />
                        <span style={{ color: 'var(--heading)' }}>{issue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {result.passed.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase mb-2" style={{ color: C.green }}>Passed ({result.passed.length})</h4>
                  <div className="space-y-1">
                    {result.passed.map((pass, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] p-2 rounded-lg" style={{ background: 'rgba(140,198,63,0.06)' }}>
                        <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: C.green }} />
                        <span style={{ color: 'var(--text-muted)' }}>{pass}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Search className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Paste your email subject and body, then run the check.</div>
            </div>
          )}
        </div>
      </div>

      {/* Blacklist Monitor */}
      <div className="rounded-xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-xs font-bold" style={{ color: 'var(--heading)' }}>DNSBL / Blacklist Monitor — alta.org sending IP</h3>
          <span className="text-[11px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider" style={{ background: `color-mix(in srgb, ${C.gray} 18%, transparent)`, color: C.gray }}>Not connected</span>
        </div>
        <p className="text-[10px] mb-3" style={{ color: 'var(--text-muted)' }}>
          These are the 10 major DNSBL zones MEMTrak watches for the sending IP — being listed on any of them can tank deliverability. Live reputation querying is not yet connected, so the zones below show <span className="font-semibold">Not checked</span> rather than a status MEMTrak cannot verify. Connect a DNSBL lookup feed to enable live monitoring.
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          {blacklists.map(bl => (
            <div key={bl.name} className="flex items-center gap-2 p-2.5 rounded-lg" style={{ background: 'var(--background)' }}>
              <Circle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.gray }} />
              <div className="min-w-0">
                <div className="text-[10px] font-semibold truncate" style={{ color: 'var(--heading)' }}>{bl.name}</div>
                <div className="text-[11px]" style={{ color: C.gray }}>Not checked</div>
                <div className="text-[11px] font-mono truncate" style={{ color: 'var(--text-muted)' }}>{bl.zone}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
