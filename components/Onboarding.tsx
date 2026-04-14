'use client';

import { useState, useEffect } from 'react';
import {
  Zap, ArrowRight, ArrowLeft, X, Send, Eye, MousePointerClick,
  Shield, BarChart3, Users, DollarSign, TrendingUp, Target,
  CheckCircle, Layers, Activity, Mail, Camera, GitBranch
} from 'lucide-react';

const ONBOARDING_KEY = 'memtrak-onboarding-complete';

const replacements = [
  { tool: 'Higher Logic', cost: '$1,200/mo', what: 'Email campaigns & analytics', icon: Send, replaced: 'Campaign management, A/B testing, send optimization' },
  { tool: 'ActiveCampaign', cost: '$186/mo', what: 'Automation & scoring', icon: Zap, replaced: 'Engagement scoring, automated workflows, decay alerts' },
  { tool: 'Klaviyo', cost: '$150/mo', what: 'Lifecycle & segmentation', icon: Users, replaced: 'Member lifecycle, smart segments, churn prediction' },
  { tool: 'Mailchimp', cost: '$350/mo', what: 'List management', icon: Mail, replaced: 'Suppression, hygiene, bounce management' },
  { tool: 'HubSpot', cost: '$890/mo', what: 'CRM email tracking', icon: TrendingUp, replaced: 'Staff relationship mapping, communication log, journey tracking' },
  { tool: 'GA4 + Looker', cost: '$200/mo', what: 'Analytics & reporting', icon: BarChart3, replaced: 'Click heatmaps, content analysis, revenue attribution' },
];

const features = [
  { icon: Eye, label: 'Open & Click Tracking', desc: 'Every email tracked — logo pixel, click redirect, read receipts. No ESP required.' },
  { icon: TrendingUp, label: 'Engagement Scoring', desc: 'Per-member 0-100 score. Weighted composite of opens, clicks, events, payments.' },
  { icon: Shield, label: 'Deliverability Guard', desc: 'Bounce cleanup, spam pre-check, address hygiene. Protects domain reputation.' },
  { icon: GitBranch, label: 'A/B Testing Engine', desc: 'Subject lines, send times, from addresses. Statistical significance built-in.' },
  { icon: Activity, label: 'Automated Workflows', desc: 'Engagement decay re-engagement, bounce cleanup, renewal countdown — all automated.' },
  { icon: Camera, label: 'Physical Mail Scanner', desc: 'Photograph a returned envelope → fuzzy-match → auto-flag bad address in database.' },
  { icon: DollarSign, label: 'Revenue Attribution', desc: 'Every dollar tied to a campaign. Know which emails generated renewals & registrations.' },
  { icon: Layers, label: 'Unified Intelligence', desc: 'One dashboard for all comms. No more checking 5 inboxes and 3 platforms.' },
];

const steps = [
  { id: 'welcome' },
  { id: 'problem' },
  { id: 'solution' },
  { id: 'features' },
  { id: 'navigate' },
  { id: 'start' },
];

export default function Onboarding() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      const timer = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const complete = () => {
    localStorage.setItem(ONBOARDING_KEY, new Date().toISOString());
    setShow(false);
  };

  const next = () => step < steps.length - 1 ? setStep(step + 1) : complete();
  const prev = () => step > 0 && setStep(step - 1);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }} />

      <div
        className="relative w-full max-w-2xl rounded-2xl border overflow-hidden"
        style={{
          background: 'var(--card)',
          borderColor: 'var(--card-border)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
          animation: 'scaleIn 0.3s ease-out',
        }}
      >
        {/* Skip button */}
        <button onClick={complete} className="absolute top-4 right-4 z-20 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-opacity hover:opacity-100 opacity-60" style={{ color: 'var(--text-muted)' }}>
          Skip <X className="w-3 h-3" />
        </button>

        {/* Progress bar */}
        <div className="h-1 w-full" style={{ background: 'var(--card-border)' }}>
          <div className="h-full transition-all duration-500 ease-out" style={{ width: `${((step + 1) / steps.length) * 100}%`, background: 'var(--accent)' }} />
        </div>

        {/* Content area */}
        <div className="px-8 py-8" style={{ minHeight: '420px' }}>

          {/* Step 1: Welcome */}
          {step === 0 && (
            <div className="text-center" style={{ animation: 'slideUp 0.3s ease-out' }}>
              <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6" style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)', boxShadow: '0 8px 32px rgba(140,198,63,0.15)' }}>
                <Zap className="w-10 h-10" style={{ color: 'var(--accent)' }} />
              </div>
              <h1 className="text-2xl font-extrabold mb-3" style={{ color: 'var(--heading)' }}>Welcome to MEMTrak</h1>
              <p className="text-sm leading-relaxed max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
                The email intelligence platform that replaces 6 separate tools with one unified system. Built for membership organizations that need to track, analyze, and optimize every communication.
              </p>
              <div className="flex items-center justify-center gap-4 mt-8">
                <div className="text-center">
                  <div className="text-2xl font-extrabold" style={{ color: 'var(--accent)' }}>43</div>
                  <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>Pages</div>
                </div>
                <div className="w-px h-8" style={{ background: 'var(--card-border)' }} />
                <div className="text-center">
                  <div className="text-2xl font-extrabold" style={{ color: 'var(--accent)' }}>15</div>
                  <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>API Endpoints</div>
                </div>
                <div className="w-px h-8" style={{ background: 'var(--card-border)' }} />
                <div className="text-center">
                  <div className="text-2xl font-extrabold" style={{ color: 'var(--accent)' }}>5</div>
                  <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>Themes</div>
                </div>
                <div className="w-px h-8" style={{ background: 'var(--card-border)' }} />
                <div className="text-center">
                  <div className="text-2xl font-extrabold" style={{ color: '#8CC63F' }}>$0</div>
                  <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>Per-seat Cost</div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: The Problem */}
          {step === 1 && (
            <div style={{ animation: 'slideUp 0.3s ease-out' }}>
              <h2 className="text-xl font-extrabold mb-2" style={{ color: 'var(--heading)' }}>The Problem MEMTrak Solves</h2>
              <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>Most organizations use 4-6 disconnected tools for email. The data doesn't connect, insights are missed, and you're paying for overlap.</p>
              <div className="grid grid-cols-2 gap-2.5">
                {replacements.map(r => {
                  const Icon = r.icon;
                  return (
                    <div key={r.tool} className="p-3 rounded-xl border" style={{ background: 'var(--background)', borderColor: 'var(--card-border)' }}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <Icon className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                        <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{r.tool}</span>
                        <span className="ml-auto text-[9px] font-bold" style={{ color: '#D94A4A' }}>{r.cost}</span>
                      </div>
                      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{r.replaced}</div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 p-3 rounded-xl text-center" style={{ background: 'color-mix(in srgb, var(--accent) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)' }}>
                <div className="text-lg font-extrabold" style={{ color: 'var(--accent)' }}>$2,976/mo saved</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>MEMTrak replaces $3,076/mo in combined tooling costs</div>
              </div>
            </div>
          )}

          {/* Step 3: The Solution */}
          {step === 2 && (
            <div style={{ animation: 'slideUp 0.3s ease-out' }}>
              <h2 className="text-xl font-extrabold mb-2" style={{ color: 'var(--heading)' }}>One Platform. Everything Connected.</h2>
              <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>MEMTrak unifies tracking, analytics, automation, and deliverability into a single intelligence layer that works with your existing email infrastructure.</p>
              <div className="grid grid-cols-2 gap-3">
                {features.map(f => {
                  const Icon = f.icon;
                  return (
                    <div key={f.label} className="flex gap-3 p-3 rounded-xl" style={{ background: 'var(--background)' }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'color-mix(in srgb, var(--accent) 12%, transparent)' }}>
                        <Icon className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>{f.label}</div>
                        <div className="text-[10px] mt-0.5 leading-snug" style={{ color: 'var(--text-muted)' }}>{f.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Features Highlight */}
          {step === 3 && (
            <div style={{ animation: 'slideUp 0.3s ease-out' }}>
              <h2 className="text-xl font-extrabold mb-2" style={{ color: 'var(--heading)' }}>Intelligence That Drives Action</h2>
              <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>MEMTrak doesn't just collect data — it tells you what to do next.</p>
              <div className="space-y-3">
                {[
                  { icon: TrendingUp, title: 'Engagement Decay Alerts', desc: 'When a member who opened 80% of emails drops to 20%, MEMTrak flags them 3-6 months before they churn. You get early warning + revenue at risk.', color: '#D94A4A' },
                  { icon: DollarSign, title: 'Revenue Attribution', desc: 'Every renewal, registration, and purchase is tied to the email that drove it. Know your ROI per campaign, per email, per subject line.', color: '#8CC63F' },
                  { icon: Users, title: 'Lifetime Value Scoring', desc: 'Per-member composite score predicts 5-year value based on engagement + payment patterns. Prioritize high-value retention automatically.', color: '#4A90D9' },
                  { icon: Target, title: 'Smart Send Optimization', desc: 'MEMTrak learns when each segment opens email. Board members? Monday 8 AM. Title agents? Thursday 7:30 AM. Auto-optimized.', color: '#E8923F' },
                ].map(f => {
                  const Icon = f.icon;
                  return (
                    <div key={f.title} className="flex gap-4 p-4 rounded-xl border-l-3" style={{ background: 'var(--background)', borderLeftWidth: '3px', borderLeftColor: f.color }}>
                      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: f.color }} />
                      <div>
                        <div className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{f.title}</div>
                        <div className="text-[11px] mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 5: Navigation */}
          {step === 4 && (
            <div style={{ animation: 'slideUp 0.3s ease-out' }}>
              <h2 className="text-xl font-extrabold mb-2" style={{ color: 'var(--heading)' }}>Finding Your Way Around</h2>
              <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>The sidebar organizes 43 pages into 7 sections. Here's where to find what you need.</p>
              <div className="space-y-2">
                {[
                  { section: 'Overview', desc: 'Daily briefing dashboard, email reports, and ROI calculator', pages: 3 },
                  { section: 'Campaigns', desc: 'Build, send, test, and schedule email campaigns', pages: 7 },
                  { section: 'Intelligence', desc: 'Analytics, scoring, journeys, segments, heatmaps, forecasts', pages: 14 },
                  { section: 'Deliverability', desc: 'Bounce cleanup, spam testing, address hygiene, mail scanning', pages: 4 },
                  { section: 'Operations', desc: 'Communication log, event tracking, email templates', pages: 3 },
                  { section: 'Advertising', desc: 'Ad campaign management, inventory calendar, slot requests', pages: 3 },
                  { section: 'Setup & Docs', desc: 'Code generator, API docs, integrations, security, roadmap', pages: 9 },
                ].map(s => (
                  <div key={s.section} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--background)' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold" style={{ background: 'color-mix(in srgb, var(--accent) 12%, transparent)', color: 'var(--accent)' }}>
                      {s.pages}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{s.section}</div>
                      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] mt-4" style={{ color: 'var(--text-muted)' }}>Look for the <span className="font-bold" style={{ color: 'var(--accent)' }}>Guide</span> button on any page to get a walkthrough of what it does.</p>
            </div>
          )}

          {/* Step 6: Get Started */}
          {step === 5 && (
            <div className="text-center" style={{ animation: 'slideUp 0.3s ease-out' }}>
              <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6" style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)', boxShadow: '0 8px 32px rgba(140,198,63,0.15)' }}>
                <CheckCircle className="w-10 h-10" style={{ color: 'var(--accent)' }} />
              </div>
              <h2 className="text-2xl font-extrabold mb-3" style={{ color: 'var(--heading)' }}>You're Ready</h2>
              <p className="text-sm leading-relaxed max-w-md mx-auto mb-6" style={{ color: 'var(--text-muted)' }}>
                Start with the Daily Briefing — it shows you what needs attention today. Click any card to drill deeper. Every page has a Guide button for help.
              </p>
              <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-6">
                {[
                  { label: 'Review Dashboard', desc: 'See today\'s metrics', color: '#8CC63F' },
                  { label: 'Check Alerts', desc: 'Act on decay warnings', color: '#D94A4A' },
                  { label: 'Send a Campaign', desc: 'Build your first email', color: '#4A90D9' },
                ].map(a => (
                  <div key={a.label} className="p-3 rounded-xl text-center" style={{ background: 'var(--background)' }}>
                    <div className="text-[11px] font-bold mb-0.5" style={{ color: a.color }}>{a.label}</div>
                    <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{a.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer: dots + nav */}
        <div className="px-8 py-5 border-t flex items-center justify-between" style={{ borderColor: 'var(--card-border)' }}>
          {/* Progress dots */}
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <button key={i} onClick={() => setStep(i)} className="transition-all" style={{
                width: i === step ? 20 : 6, height: 6, borderRadius: 3,
                background: i === step ? 'var(--accent)' : i < step ? 'color-mix(in srgb, var(--accent) 40%, transparent)' : 'var(--card-border)',
              }} />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-2">
            {step > 0 && (
              <button onClick={prev} className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold" style={{ color: 'var(--text-muted)', border: '1px solid var(--card-border)' }}>
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
            )}
            <button onClick={next} className="flex items-center gap-1 px-5 py-2 rounded-xl text-xs font-bold text-white" style={{ background: 'var(--accent)' }}>
              {step === steps.length - 1 ? 'Get Started' : 'Next'} <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}
