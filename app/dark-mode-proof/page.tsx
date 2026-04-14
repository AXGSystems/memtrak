'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import {
  Moon, Sun, Monitor, Smartphone, Mail, CheckCircle,
  AlertTriangle, XCircle, Eye, Shield, Zap, X,
} from 'lucide-react';

/* ── palette ───────────────────────────────────────────────── */
const C = {
  navy: '#002D5C',
  blue: '#4A90D9',
  green: '#8CC63F',
  red: '#D94A4A',
  orange: '#E8923F',
  amber: '#F5C542',
  purple: '#a855f7',
  cyan: '#06b6d4',
};

/* ── email client compatibility matrix ────────────────────── */
type RenderStatus = 'Full Support' | 'Partial' | 'Breaks';

interface EmailClient {
  name: string;
  icon: string;
  lightStatus: RenderStatus;
  darkStatus: RenderStatus;
  marketShare: number;
  notes: string;
}

const emailClients: EmailClient[] = [
  { name: 'Gmail', icon: 'G', lightStatus: 'Full Support', darkStatus: 'Partial', marketShare: 27.8, notes: 'Inverts colors but respects @media (prefers-color-scheme)' },
  { name: 'Outlook', icon: 'O', lightStatus: 'Full Support', darkStatus: 'Breaks', marketShare: 9.2, notes: 'Desktop forces color inversion, ignores meta tags' },
  { name: 'Apple Mail', icon: 'A', lightStatus: 'Full Support', darkStatus: 'Full Support', marketShare: 57.4, notes: 'Best dark mode support, respects all CSS' },
  { name: 'Yahoo', icon: 'Y', lightStatus: 'Full Support', darkStatus: 'Partial', marketShare: 2.1, notes: 'Partial class stripping in dark mode' },
  { name: 'Thunderbird', icon: 'T', lightStatus: 'Full Support', darkStatus: 'Full Support', marketShare: 0.8, notes: 'Honors prefers-color-scheme media query' },
  { name: 'Samsung Mail', icon: 'S', lightStatus: 'Full Support', darkStatus: 'Partial', marketShare: 1.4, notes: 'Aggressive color swap, background overrides' },
  { name: 'AOL', icon: 'a', lightStatus: 'Full Support', darkStatus: 'Breaks', marketShare: 0.5, notes: 'Legacy rendering, strips dark mode CSS entirely' },
  { name: 'Proton Mail', icon: 'P', lightStatus: 'Full Support', darkStatus: 'Full Support', marketShare: 0.8, notes: 'Full support with native dark mode toggle' },
];

/* ── sample email content blocks ─────────────────────────── */
const emailBlocks = [
  { type: 'Header', light: { bg: '#002D5C', text: '#FFFFFF', logo: 'white' }, dark: { bg: '#0a1628', text: '#e2e8f0', logo: 'white' } },
  { type: 'Hero Image', light: { bg: '#FFFFFF', text: '#1a1a1a', logo: 'dark' }, dark: { bg: '#111827', text: '#e5e7eb', logo: 'inverted' } },
  { type: 'Body Copy', light: { bg: '#FFFFFF', text: '#333333', logo: '' }, dark: { bg: '#1f2937', text: '#d1d5db', logo: '' } },
  { type: 'CTA Button', light: { bg: '#8CC63F', text: '#FFFFFF', logo: '' }, dark: { bg: '#8CC63F', text: '#FFFFFF', logo: '' } },
  { type: 'Footer', light: { bg: '#F4F4F4', text: '#666666', logo: '' }, dark: { bg: '#0f172a', text: '#94a3b8', logo: '' } },
];

/* ── helpers ──────────────────────────────────────────────── */
function statusColor(status: RenderStatus) {
  if (status === 'Full Support') return C.green;
  if (status === 'Partial') return C.orange;
  return C.red;
}

function StatusBadge({ status }: { status: RenderStatus }) {
  const color = statusColor(status);
  const Icon = status === 'Full Support' ? CheckCircle : status === 'Partial' ? AlertTriangle : XCircle;
  return (
    <span
      className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: `${color}20`, color }}
    >
      <Icon className="w-2.5 h-2.5" /> {status}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE COMPONENT
   ══════════════════════════════════════════════════════════ */
export default function DarkModeProofPage() {
  const [selectedClient, setSelectedClient] = useState<EmailClient | null>(null);

  const fullSupport = emailClients.filter(c => c.darkStatus === 'Full Support').length;
  const partial = emailClients.filter(c => c.darkStatus === 'Partial').length;
  const breaks = emailClients.filter(c => c.darkStatus === 'Breaks').length;

  return (
    <div className="p-6 space-y-6">
      {/* ── 1. Branded Header ──────────────────────────────── */}
      <div className="flex items-center gap-3 mb-1">
        <div className="relative">
          <Moon className="w-9 h-9" style={{ color: C.purple }} />
          <Sun className="absolute -bottom-0.5 -right-1 w-4 h-4" style={{ color: C.amber }} />
        </div>
        <div>
          <h1 className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
            DarkModeProof<span className="align-super text-[9px] font-black" style={{ color: 'var(--accent)' }}>&trade;</span>
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            See what they see, <strong style={{ color: 'var(--heading)' }}>before you send.</strong>
          </p>
        </div>
      </div>
      <p className="text-[11px] leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
        <strong style={{ color: 'var(--heading)' }}>35% of email opens now happen in dark mode.</strong>{' '}
        DarkModeProof previews every campaign across light and dark rendering engines, flags broken elements,
        and scores accessibility before you hit send.
      </p>

      {/* ── 2. SparkKpi Row ────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SparkKpi
          label="Clients Tested"
          value={8}
          icon={Monitor}
          color={C.blue}
          sparkData={[5, 5, 6, 6, 7, 8, 8]}
          sparkColor={C.blue}
          trend={{ value: 14.3, label: 'vs last quarter' }}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                DarkModeProof tests rendering across 8 major email clients covering 99.9% of ALTA&apos;s member inbox share.
              </p>
              <div className="space-y-2">
                {emailClients.map(c => (
                  <div key={c.name} className="flex items-center justify-between text-[11px] py-1 border-b" style={{ borderColor: 'var(--card-border)' }}>
                    <span style={{ color: 'var(--heading)' }}>{c.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{c.marketShare}% share</span>
                  </div>
                ))}
              </div>
            </div>
          }
        />
        <SparkKpi
          label="Dark Mode Opens %"
          value="35%"
          icon={Moon}
          color={C.purple}
          sparkData={[22, 24, 27, 29, 30, 33, 35]}
          sparkColor={C.purple}
          trend={{ value: 8.2, label: 'YoY increase' }}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Dark mode adoption among ALTA members has grown steadily. Apple Mail users drive the majority (57.4% share),
                with Gmail dark mode gaining rapid traction.
              </p>
              <div className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                <div className="text-[10px] font-bold mb-2" style={{ color: 'var(--heading)' }}>Monthly Dark Mode Share</div>
                <div className="flex items-end gap-1 h-16">
                  {[22, 24, 27, 29, 30, 33, 35].map((v, i) => (
                    <div key={i} className="flex-1 rounded-t" style={{ height: `${(v / 35) * 100}%`, background: C.purple, opacity: 0.4 + (i / 10) }} />
                  ))}
                </div>
                <div className="flex justify-between text-[8px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  <span>Oct</span><span>Apr</span>
                </div>
              </div>
            </div>
          }
        />
        <SparkKpi
          label="Issues Found"
          value={3}
          icon={AlertTriangle}
          color={C.orange}
          sparkData={[8, 7, 6, 5, 5, 4, 3]}
          sparkColor={C.orange}
          trend={{ value: -25, label: 'vs last campaign' }}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Current campaign has 3 rendering issues detected:
              </p>
              <ul className="space-y-2">
                <li className="text-[11px] flex items-start gap-2">
                  <XCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: C.red }} />
                  <div><strong style={{ color: 'var(--heading)' }}>Outlook Desktop:</strong> <span style={{ color: 'var(--text-muted)' }}>Logo inverted to black, invisible on dark background</span></div>
                </li>
                <li className="text-[11px] flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: C.orange }} />
                  <div><strong style={{ color: 'var(--heading)' }}>Gmail:</strong> <span style={{ color: 'var(--text-muted)' }}>CTA button border not visible in dark mode</span></div>
                </li>
                <li className="text-[11px] flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: C.orange }} />
                  <div><strong style={{ color: 'var(--heading)' }}>AOL:</strong> <span style={{ color: 'var(--text-muted)' }}>All dark mode CSS stripped, falls back to light only</span></div>
                </li>
              </ul>
            </div>
          }
        />
        <SparkKpi
          label="Accessibility Score"
          value="94/100"
          icon={Eye}
          color={C.green}
          sparkData={[82, 84, 87, 89, 91, 93, 94]}
          sparkColor={C.green}
          trend={{ value: 4.4, label: 'vs last quarter' }}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Accessibility scoring includes WCAG 2.1 AA contrast ratio checks, alt-text coverage, semantic HTML structure, and font size minimums.
              </p>
              <div className="space-y-2">
                {[
                  { metric: 'Color Contrast (4.5:1)', score: 96, color: C.green },
                  { metric: 'Alt-Text Coverage', score: 100, color: C.green },
                  { metric: 'Font Size Minimum', score: 92, color: C.green },
                  { metric: 'Link Discoverability', score: 88, color: C.blue },
                ].map(m => (
                  <div key={m.metric}>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span style={{ color: 'var(--text-muted)' }}>{m.metric}</span>
                      <span className="font-bold" style={{ color: m.color }}>{m.score}%</span>
                    </div>
                    <div className="w-full rounded-full overflow-hidden" style={{ height: 4, background: 'var(--card-border)' }}>
                      <div className="h-full rounded-full" style={{ width: `${m.score}%`, background: m.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          }
        />
      </div>

      {/* ── 3. Split-Screen Preview ───────────────────────── */}
      <Card
        title="Rendering Preview"
        subtitle="ALTA ONE 2026 Early Bird Registration email"
        detailTitle="Full Rendering Analysis"
        detailContent={
          <div className="space-y-4">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Block-by-block analysis of how each section renders across light and dark modes. Green indicates the block renders correctly; orange means partial issues; red signals breaking changes.
            </p>
            {emailBlocks.map(block => (
              <div key={block.type} className="rounded-lg border p-3" style={{ borderColor: 'var(--card-border)' }}>
                <div className="text-[11px] font-bold mb-2" style={{ color: 'var(--heading)' }}>{block.type}</div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="rounded p-2" style={{ background: block.light.bg, color: block.light.text }}>
                    Light: {block.light.bg} on {block.light.text}
                  </div>
                  <div className="rounded p-2" style={{ background: block.dark.bg, color: block.dark.text }}>
                    Dark: {block.dark.bg} on {block.dark.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Light Mode Preview */}
          <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--card-border)' }}>
            <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'var(--card-border)' }}>
              <Sun className="w-3.5 h-3.5" style={{ color: C.amber }} />
              <span className="text-[10px] font-bold" style={{ color: 'var(--heading)' }}>Light Mode</span>
            </div>
            <div className="space-y-0">
              {/* Email header */}
              <div className="px-4 py-3 text-center" style={{ background: '#002D5C' }}>
                <div className="text-[13px] font-extrabold tracking-wide" style={{ color: '#FFFFFF' }}>ALTA</div>
                <div className="text-[8px] tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.7)' }}>American Land Title Association</div>
              </div>
              {/* Hero */}
              <div className="px-4 py-5 text-center" style={{ background: '#FFFFFF' }}>
                <div className="text-[14px] font-extrabold mb-1" style={{ color: '#1a1a1a' }}>ALTA ONE 2026</div>
                <div className="text-[10px] mb-3" style={{ color: '#666666' }}>Early Bird Registration Now Open</div>
                <div className="w-full h-16 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #002D5C, #4A90D9)' }}>
                  <span className="text-[10px] font-bold" style={{ color: '#FFFFFF' }}>Conference Hero Image</span>
                </div>
              </div>
              {/* Body */}
              <div className="px-4 py-3" style={{ background: '#FFFFFF' }}>
                <div className="text-[10px] leading-relaxed" style={{ color: '#333333' }}>
                  Join 2,000+ title professionals in Nashville for three days of education, networking, and industry insights.
                </div>
              </div>
              {/* CTA */}
              <div className="px-4 py-3 text-center" style={{ background: '#FFFFFF' }}>
                <div className="inline-block px-5 py-2 rounded-lg text-[10px] font-bold" style={{ background: '#8CC63F', color: '#FFFFFF' }}>
                  Register Now &mdash; Save $200
                </div>
              </div>
              {/* Footer */}
              <div className="px-4 py-2 text-center" style={{ background: '#F4F4F4' }}>
                <div className="text-[8px]" style={{ color: '#999999' }}>ALTA | 1800 M Street NW | Washington, DC 20036</div>
              </div>
            </div>
          </div>

          {/* Dark Mode Preview */}
          <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--card-border)' }}>
            <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'var(--card-border)' }}>
              <Moon className="w-3.5 h-3.5" style={{ color: C.purple }} />
              <span className="text-[10px] font-bold" style={{ color: 'var(--heading)' }}>Dark Mode</span>
            </div>
            <div className="space-y-0">
              {/* Email header */}
              <div className="px-4 py-3 text-center" style={{ background: '#0a1628' }}>
                <div className="text-[13px] font-extrabold tracking-wide" style={{ color: '#e2e8f0' }}>ALTA</div>
                <div className="text-[8px] tracking-widest uppercase" style={{ color: 'rgba(226,232,240,0.6)' }}>American Land Title Association</div>
              </div>
              {/* Hero */}
              <div className="px-4 py-5 text-center" style={{ background: '#111827' }}>
                <div className="text-[14px] font-extrabold mb-1" style={{ color: '#e5e7eb' }}>ALTA ONE 2026</div>
                <div className="text-[10px] mb-3" style={{ color: '#9ca3af' }}>Early Bird Registration Now Open</div>
                <div className="w-full h-16 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0a1628, #4A90D9)' }}>
                  <span className="text-[10px] font-bold" style={{ color: '#e2e8f0' }}>Conference Hero Image</span>
                </div>
              </div>
              {/* Body */}
              <div className="px-4 py-3" style={{ background: '#1f2937' }}>
                <div className="text-[10px] leading-relaxed" style={{ color: '#d1d5db' }}>
                  Join 2,000+ title professionals in Nashville for three days of education, networking, and industry insights.
                </div>
              </div>
              {/* CTA */}
              <div className="px-4 py-3 text-center" style={{ background: '#1f2937' }}>
                <div className="inline-block px-5 py-2 rounded-lg text-[10px] font-bold" style={{ background: '#8CC63F', color: '#FFFFFF' }}>
                  Register Now &mdash; Save $200
                </div>
              </div>
              {/* Footer */}
              <div className="px-4 py-2 text-center" style={{ background: '#0f172a' }}>
                <div className="text-[8px]" style={{ color: '#64748b' }}>ALTA | 1800 M Street NW | Washington, DC 20036</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ── 4. Compatibility Matrix ───────────────────────── */}
      <Card
        title="Email Client Compatibility Matrix"
        subtitle={`${fullSupport} full support, ${partial} partial, ${breaks} breaking in dark mode`}
        detailTitle="Detailed Client Analysis"
        detailContent={
          <div className="space-y-4">
            {emailClients.map(client => (
              <div key={client.name} className="rounded-lg border p-4" style={{ borderColor: 'var(--card-border)' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black" style={{ background: 'var(--input-bg)', color: 'var(--heading)' }}>
                      {client.icon}
                    </div>
                    <div>
                      <div className="text-[12px] font-bold" style={{ color: 'var(--heading)' }}>{client.name}</div>
                      <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{client.marketShare}% of ALTA opens</div>
                    </div>
                  </div>
                  <StatusBadge status={client.darkStatus} />
                </div>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{client.notes}</p>
              </div>
            ))}
          </div>
        }
      >
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-[11px]" style={{ minWidth: 600 }}>
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--card-border)' }}>
                <th className="text-left px-5 py-2 font-bold" style={{ color: 'var(--heading)' }}>Client</th>
                <th className="text-center px-3 py-2 font-bold" style={{ color: 'var(--heading)' }}>Market Share</th>
                <th className="text-center px-3 py-2 font-bold" style={{ color: 'var(--heading)' }}>
                  <span className="inline-flex items-center gap-1"><Sun className="w-3 h-3" style={{ color: C.amber }} /> Light</span>
                </th>
                <th className="text-center px-3 py-2 font-bold" style={{ color: 'var(--heading)' }}>
                  <span className="inline-flex items-center gap-1"><Moon className="w-3 h-3" style={{ color: C.purple }} /> Dark</span>
                </th>
                <th className="text-left px-5 py-2 font-bold" style={{ color: 'var(--heading)' }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {emailClients.map(client => (
                <tr
                  key={client.name}
                  className="border-b cursor-pointer transition-colors"
                  style={{ borderColor: 'var(--card-border)' }}
                  onClick={() => setSelectedClient(client)}
                >
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-black"
                        style={{ background: 'var(--input-bg)', color: 'var(--heading)' }}
                      >
                        {client.icon}
                      </div>
                      <span className="font-semibold" style={{ color: 'var(--heading)' }}>{client.name}</span>
                    </div>
                  </td>
                  <td className="text-center px-3 py-2.5" style={{ color: 'var(--text-muted)' }}>{client.marketShare}%</td>
                  <td className="text-center px-3 py-2.5"><StatusBadge status={client.lightStatus} /></td>
                  <td className="text-center px-3 py-2.5"><StatusBadge status={client.darkStatus} /></td>
                  <td className="px-5 py-2.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>{client.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── 5. Dark Mode Impact Stats ─────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Dark Mode Adoption Trend" subtitle="ALTA member opens by rendering mode">
          <div className="space-y-3 mt-2">
            {[
              { month: 'Jan 2026', dark: 28, light: 72 },
              { month: 'Feb 2026', dark: 30, light: 70 },
              { month: 'Mar 2026', dark: 33, light: 67 },
              { month: 'Apr 2026', dark: 35, light: 65 },
            ].map(row => (
              <div key={row.month}>
                <div className="flex justify-between text-[10px] mb-1">
                  <span style={{ color: 'var(--text-muted)' }}>{row.month}</span>
                  <span className="font-bold" style={{ color: C.purple }}>{row.dark}% dark</span>
                </div>
                <div className="flex h-3 rounded-full overflow-hidden" style={{ background: 'var(--card-border)' }}>
                  <div className="h-full rounded-l-full" style={{ width: `${row.light}%`, background: C.amber }} />
                  <div className="h-full rounded-r-full" style={{ width: `${row.dark}%`, background: C.purple }} />
                </div>
              </div>
            ))}
            <div className="flex items-center gap-4 text-[9px] mt-2" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: C.amber }} /> Light Mode</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: C.purple }} /> Dark Mode</span>
            </div>
          </div>
        </Card>

        <Card title="Pre-Send Checklist" subtitle="Automated quality gates">
          <div className="space-y-2 mt-2">
            {[
              { check: 'Logo has transparent background', pass: true },
              { check: 'CTA contrast ratio >= 4.5:1', pass: true },
              { check: 'Background images have fallback colors', pass: true },
              { check: 'Text colors use CSS variables', pass: false },
              { check: 'Alt-text on all images', pass: true },
              { check: 'prefers-color-scheme media query', pass: true },
              { check: 'Outlook conditional comments', pass: false },
              { check: 'Font stack includes system fallbacks', pass: true },
            ].map(item => (
              <div key={item.check} className="flex items-center gap-2 text-[10px] py-1">
                {item.pass ? (
                  <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.green }} />
                ) : (
                  <XCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.red }} />
                )}
                <span style={{ color: item.pass ? 'var(--text-muted)' : 'var(--heading)' }}>{item.check}</span>
              </div>
            ))}
            <div className="rounded-lg p-2 mt-2 text-center" style={{ background: 'rgba(140,198,63,0.1)' }}>
              <span className="text-[11px] font-bold" style={{ color: C.green }}>6 of 8 checks passing</span>
            </div>
          </div>
        </Card>

        <Card title="Risk Assessment" subtitle="Impact if dark mode issues go unfixed">
          <div className="space-y-3 mt-2">
            <div className="rounded-lg p-3" style={{ background: 'rgba(217,74,74,0.08)' }}>
              <div className="text-[10px] font-bold mb-1" style={{ color: C.red }}>High Risk: Outlook Desktop</div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                9.2% of opens. Logo invisible in dark mode affects brand recognition for ~450 members per send.
              </div>
            </div>
            <div className="rounded-lg p-3" style={{ background: 'rgba(232,146,63,0.08)' }}>
              <div className="text-[10px] font-bold mb-1" style={{ color: C.orange }}>Medium Risk: Gmail</div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                27.8% of opens. CTA button border invisible reduces click-through by est. 12% for dark mode users.
              </div>
            </div>
            <div className="rounded-lg p-3" style={{ background: 'rgba(74,144,217,0.08)' }}>
              <div className="text-[10px] font-bold mb-1" style={{ color: C.blue }}>Low Risk: AOL</div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                0.5% of opens. Dark mode CSS stripped but light fallback renders correctly.
              </div>
            </div>
            <div className="border-t pt-2 mt-2" style={{ borderColor: 'var(--card-border)' }}>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--heading)' }}>Estimated impact:</strong> Fixing top 2 issues improves rendering quality for <strong style={{ color: C.green }}>37%</strong> of all opens.
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Client Detail Modal ───────────────────────────── */}
      {selectedClient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedClient(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border"
            style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--card) 90%, transparent)', borderColor: 'var(--card-border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black" style={{ background: 'var(--input-bg)', color: 'var(--heading)' }}>
                  {selectedClient.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{selectedClient.name}</h3>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{selectedClient.marketShare}% of ALTA member opens</p>
                </div>
              </div>
              <button onClick={() => setSelectedClient(null)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                  <div className="text-[9px] uppercase font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Light Mode</div>
                  <StatusBadge status={selectedClient.lightStatus} />
                </div>
                <div className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                  <div className="text-[9px] uppercase font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Dark Mode</div>
                  <StatusBadge status={selectedClient.darkStatus} />
                </div>
              </div>
              <div>
                <div className="text-[11px] font-bold mb-1" style={{ color: 'var(--heading)' }}>Rendering Notes</div>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{selectedClient.notes}</p>
              </div>
              <div>
                <div className="text-[11px] font-bold mb-2" style={{ color: 'var(--heading)' }}>Block-Level Rendering</div>
                <div className="space-y-1.5">
                  {emailBlocks.map(block => (
                    <div key={block.type} className="flex items-center justify-between text-[10px] py-1.5 px-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                      <span style={{ color: 'var(--heading)' }}>{block.type}</span>
                      <StatusBadge status={
                        selectedClient.darkStatus === 'Full Support' ? 'Full Support' :
                        selectedClient.darkStatus === 'Breaks' && block.type === 'CTA Button' ? 'Full Support' :
                        selectedClient.darkStatus === 'Breaks' ? 'Breaks' : 'Partial'
                      } />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
