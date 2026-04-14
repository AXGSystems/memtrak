'use client';

import { useState, useEffect, ReactNode } from 'react';
import { X, HelpCircle, ChevronRight, Lightbulb, Target, BookOpen } from 'lucide-react';

export interface GuideContent {
  title: string;
  purpose: string;
  steps?: { label: string; detail: string }[];
  tips?: string[];
  keyMetrics?: { label: string; why: string }[];
}

interface PageGuideProps {
  pageId: string;
  guide: GuideContent;
}

export default function PageGuide({ pageId, guide }: PageGuideProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSeenKey] = useState(`memtrak-guide-seen-${pageId}`);

  useEffect(() => {
    const seen = localStorage.getItem(hasSeenKey);
    if (!seen) {
      // Subtle pulse on first visit — don't auto-open
    }
  }, [hasSeenKey]);

  const markSeen = () => {
    localStorage.setItem(hasSeenKey, 'true');
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all hover:scale-105"
        style={{
          color: 'var(--accent)',
          background: 'color-mix(in srgb, var(--accent) 8%, transparent)',
          border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)',
        }}
      >
        <HelpCircle className="w-3 h-3" /> Guide
      </button>

      {/* Slide-over panel */}
      {isOpen && (
        <div className="fixed inset-0 z-[90]" onClick={markSeen}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="absolute right-0 top-0 bottom-0 w-full max-w-md overflow-y-auto border-l"
            style={{
              background: 'var(--card)',
              borderColor: 'var(--card-border)',
              boxShadow: '-20px 0 60px rgba(0,0,0,0.2)',
              animation: 'guideSlideIn 0.25s ease-out',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 px-6 py-5 border-b" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)' }}>
                    <BookOpen className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold" style={{ color: 'var(--heading)' }}>{guide.title}</h2>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Page Guide</p>
                  </div>
                </div>
                <button onClick={markSeen} className="p-1.5 rounded-lg hover:scale-110 transition-transform" style={{ color: 'var(--text-muted)' }}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="px-6 py-5 space-y-6">
              {/* Purpose */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                  <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--accent)' }}>Purpose</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--heading)' }}>{guide.purpose}</p>
              </div>

              {/* Steps */}
              {guide.steps && guide.steps.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ChevronRight className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                    <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--accent)' }}>How to Use</span>
                  </div>
                  <div className="space-y-2">
                    {guide.steps.map((step, i) => (
                      <div key={i} className="flex gap-3 p-3 rounded-lg" style={{ background: 'var(--background)' }}>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-extrabold" style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)' }}>
                          {i + 1}
                        </div>
                        <div>
                          <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{step.label}</div>
                          <div className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{step.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Metrics */}
              {guide.keyMetrics && guide.keyMetrics.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                    <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--accent)' }}>Key Metrics Explained</span>
                  </div>
                  <div className="space-y-2">
                    {guide.keyMetrics.map((m, i) => (
                      <div key={i} className="p-3 rounded-lg border-l-2" style={{ background: 'var(--background)', borderColor: 'var(--accent)' }}>
                        <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{m.label}</div>
                        <div className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{m.why}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              {guide.tips && guide.tips.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4" style={{ color: '#E8923F' }} />
                    <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: '#E8923F' }}>Pro Tips</span>
                  </div>
                  <div className="space-y-1.5">
                    {guide.tips.map((tip, i) => (
                      <div key={i} className="flex gap-2 text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        <span style={{ color: '#E8923F' }}>•</span>
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t" style={{ borderColor: 'var(--card-border)' }}>
              <button
                onClick={markSeen}
                className="w-full py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-[1.02]"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes guideSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}
