'use client';

import { useState, useRef, useEffect } from 'react';
import { Brain, Sparkles, Send, Database, Wifi, Clock, Bot, User, Zap, MessageSquare, BarChart3, Users, Shield, Target, FileText, Coffee } from 'lucide-react';
import Card from '@/components/Card';
import Typewriter from '@/components/Typewriter';
import { demoCampaigns, demoChurnScores, demoDecayAlerts, demoRelationships, demoMonthly, getCampaignTotals, demoSendTimes } from '@/lib/demo-data';

/* ── types ─────────────────────────────────────────────────── */
interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
  animate?: boolean; // only AI messages that should typewrite
}

/* ── pre-computed AI responses keyed by suggested question ── */
const aiResponses: Record<string, string> = {
  'Which members are most likely to churn this quarter?': (() => {
    const lines = demoChurnScores.map((c, i) =>
      `${i + 1}. ${c.org} (${c.type}) — Churn Score: ${c.score}%\n   Revenue at risk: $${c.revenue.toLocaleString()}\n   Key factors: ${c.factors.join('; ')}\n   Recommended action: ${c.action}`
    );
    return `Based on my analysis of engagement data, email behavior, event attendance, and payment history, here are the members most likely to churn this quarter:\n\n${lines.join('\n\n')}\n\nTotal revenue at risk: $${demoChurnScores.reduce((s, c) => s + c.revenue, 0).toLocaleString()}\n\nI'd recommend prioritizing First American Title immediately — that's a $61K account showing significant engagement decline. A CEO-level check-in would be appropriate given the account size.`;
  })(),

  'What was our best performing campaign this month?': (() => {
    const sent = demoCampaigns.filter(c => c.status === 'Sent' && c.sentDate >= '2026-04-01');
    const best = sent.reduce((a, b) => (b.uniqueOpened / b.delivered) > (a.uniqueOpened / a.delivered) ? b : a, sent[0]);
    const openRate = ((best.uniqueOpened / best.delivered) * 100).toFixed(1);
    const clickRate = ((best.clicked / best.delivered) * 100).toFixed(1);
    return `The best performing campaign this month is "${best.name}":\n\n• Sent: ${best.sentDate}\n• List size: ${best.listSize.toLocaleString()}\n• Delivered: ${best.delivered.toLocaleString()}\n• Unique opens: ${best.uniqueOpened.toLocaleString()} (${openRate}% open rate)\n• Clicks: ${best.clicked.toLocaleString()} (${clickRate}% CTR)\n• Revenue attributed: $${best.revenue.toLocaleString()}\n• Bounces: ${best.bounced} | Unsubs: ${best.unsubscribed}\n\nThis campaign significantly outperformed the industry average open rate of 21.3% for association emails. The subject line and send time (Tuesday 9 AM) were key drivers. I'd recommend using a similar approach for the upcoming May compliance wave.`;
  })(),

  "Show me First American Title's engagement history": (() => {
    const member = demoDecayAlerts.find(d => d.org === 'First American Title')!;
    const churn = demoChurnScores.find(c => c.org === 'First American Title')!;
    return `Here's the full engagement profile for First American Title:\n\n• Member type: ${member.type} (Underwriter)\n• Annual revenue: $${member.revenue.toLocaleString()}\n• Primary contact: ${member.email}\n\nEngagement Trajectory:\n• Historical open rate: ${member.historical}%\n• Recent open rate: ${member.recent}% (${member.decay}% decay)\n• Last email opened: ${member.lastOpen}\n• Trend: ${member.trend}\n\nChurn Risk Assessment:\n• Churn score: ${churn.score}%\n• Risk factors: ${churn.factors.join('; ')}\n• Recommended action: ${churn.action}\n\nEvent Attendance:\n• ALTA ONE 2025: Attended (2 sessions)\n• ALTA ONE 2026: NOT registered (early bird deadline approaching)\n• Webinars: Attended 2 of 6 in Q1 (down from 5 of 6 in Q1 2025)\n\nThis is a high-value account showing clear disengagement signals. The fact that they're still attending webinars is a positive sign — they haven't fully checked out. I'd recommend a personal outreach from Chris Morton given the account value.`;
  })(),

  'How does our open rate compare to industry benchmarks?': (() => {
    const totals = getCampaignTotals();
    const ourRate = ((totals.totalOpened / totals.totalDelivered) * 100).toFixed(1);
    return `Here's how ALTA's email performance compares to industry benchmarks:\n\nALTA Performance (April 2026):\n• Open rate: ${ourRate}% (unique opens across ${totals.campaignCount} campaigns)\n• Click rate: ${((totals.totalClicked / totals.totalDelivered) * 100).toFixed(1)}%\n• Bounce rate: ${((totals.totalBounced / totals.totalDelivered) * 100).toFixed(1)}%\n\nIndustry Benchmarks (Associations & Nonprofits):\n• Average open rate: 21.3%\n• Average click rate: 2.7%\n• Average bounce rate: 0.9%\n\nVerdict:\n• Open rate: ALTA is significantly ABOVE benchmark — strong subject lines and sender reputation\n• Click rate: ALTA is well above the 2.7% industry average — content is resonating\n• Bounce rate: Slightly elevated — the hygiene cleanup should improve this\n\nYour best-performing segments are Board Members (90% open rate) and New Members under 1 year (65%). Your ACU Underwriters segment at 52% is particularly impressive for that audience size.`;
  })(),

  'Which staff member should contact Heritage Abstract?': (() => {
    const member = demoDecayAlerts.find(d => d.org === 'Heritage Abstract LLC')!;
    return `For Heritage Abstract LLC, here's my analysis:\n\nMember Status:\n• Type: ${member.type}\n• Engagement: ${member.trend} — ${member.decay}% decay score\n• Last email opened: ${member.lastOpen}\n• Revenue: $${member.revenue.toLocaleString()}\n\nStaff Recommendation:\nBased on relationship mapping and response patterns, I recommend:\n\n1. Paul Martin (Primary recommendation)\n   • ${demoRelationships[1].outreach} total outreach touches\n   • ${demoRelationships[1].replyRate}% reply rate\n   • Has prior relationship with Heritage through PFL compliance work\n\n2. Chris Morton (Escalation if needed)\n   • ${demoRelationships[0].replyRate}% reply rate — highest in the organization\n   • CEO-level outreach carries weight for retention saves\n   • Reserve for second attempt if Paul's outreach gets no response\n\nSuggested approach: A direct phone call, not email — this member has gone completely dark on email. Reference their PFL compliance status as a natural conversation starter. The $517 revenue is modest, but losing any ACB member signals broader risk.`;
  })(),

  "What's the revenue impact of our bounce rate?": (() => {
    const totals = getCampaignTotals();
    const bounceRate = ((totals.totalBounced / totals.totalSent) * 100).toFixed(1);
    const revenuePerDelivered = totals.totalRevenue / totals.totalDelivered;
    const lostRevenue = Math.round(totals.totalBounced * revenuePerDelivered);
    return `Here's the revenue impact analysis of our bounce rate:\n\nCurrent Bounce Metrics:\n• Total bounces (April): ${totals.totalBounced.toLocaleString()}\n• Bounce rate: ${bounceRate}%\n• Industry benchmark: 0.9%\n\nRevenue Impact Model:\n• Revenue per delivered email: $${revenuePerDelivered.toFixed(2)}\n• Estimated lost revenue from bounces: $${lostRevenue.toLocaleString()}\n• Annual projected loss at current rate: $${(lostRevenue * 12).toLocaleString()}\n\nBreakdown by Campaign Type:\n• Renewal emails bouncing = direct lost dues revenue\n• Event emails bouncing = lost registration revenue\n• Compliance emails bouncing = regulatory risk (cannot prove delivery)\n\nRecommendation:\nOur bounce rate of ${bounceRate}% is above the 0.9% industry benchmark. Running the address hygiene cleanup could reduce bounces by ~60%, recovering approximately $${Math.round(lostRevenue * 0.6).toLocaleString()} per month. The compliance risk alone justifies the cleanup — we need proof of delivery for PFL notices.`;
  })(),

  "Summarize this week's email performance": (() => {
    const apr = demoMonthly[3];
    const mar = demoMonthly[2];
    const weekCampaigns = demoCampaigns.filter(c => c.sentDate >= '2026-04-07' && c.sentDate <= '2026-04-14' && c.status === 'Sent');
    return `Here's your weekly email performance summary (April 7-14, 2026):\n\nCampaigns Sent This Week: ${weekCampaigns.length}\n${weekCampaigns.map(c => `• ${c.name} — ${c.uniqueOpened.toLocaleString()} opens, ${c.clicked} clicks`).join('\n')}\n\nApril Month-to-Date:\n• Total sent: ${apr.sent.toLocaleString()}\n• Delivered: ${apr.delivered.toLocaleString()} (${((apr.delivered / apr.sent) * 100).toFixed(1)}% delivery rate)\n• Opened: ${apr.opened.toLocaleString()} (${((apr.opened / apr.delivered) * 100).toFixed(1)}% open rate)\n• Clicked: ${apr.clicked.toLocaleString()} (${((apr.clicked / apr.delivered) * 100).toFixed(1)}% CTR)\n• Bounced: ${apr.bounced}\n\nTrend vs. March:\n• Open rate: ${((apr.opened / apr.delivered) * 100).toFixed(1)}% vs ${((mar.opened / mar.delivered) * 100).toFixed(1)}% (${((apr.opened / apr.delivered) * 100) > ((mar.opened / mar.delivered) * 100) ? 'improving' : 'slight decline'})\n• Volume is lower (${apr.sent.toLocaleString()} vs ${mar.sent.toLocaleString()}) — expected since April is only half over\n\nHighlight: The ALTA ONE Early Bird campaign drove 780 clicks and $162K in attributed revenue. That's your revenue star this week.`;
  })(),

  'What should I focus on today?': (() => {
    const criticalChurn = demoChurnScores.filter(c => c.score >= 60);
    const scheduled = demoCampaigns.filter(c => c.status === 'Scheduled');
    return `Good morning! Here's your priority briefing for today:\n\nURGENT (do first):\n1. Heritage Abstract has gone completely dark (92% churn score). Call Paul Martin to coordinate outreach — this needs a phone call, not email.\n2. First American Title ($61K account) engagement is declining fast. Flag for Chris Morton's CEO check-in this week.\n\nTODAY'S CAMPAIGNS:\n• ${scheduled.length} campaign${scheduled.length !== 1 ? 's' : ''} scheduled: ${scheduled.map(c => c.name).join(', ')}\n• Review the PFL Compliance May Wave 1 targeting — 1,029 recipients in IL. Verify list is clean before send.\n\nQUICK WINS:\n• Reply to the 3 pending ALTA ONE sponsor confirmations (draft in Templates)\n• The ACU Retention Check-in sent yesterday has a 90% open rate — great time to follow up with non-openers\n\nDATA HYGIENE:\n• 680 bounced addresses need cleanup — run the hygiene scan before the May compliance wave\n• 220 invalid addresses should be suppressed immediately\n\nINSIGHT OF THE DAY:\nBoard members have a 90% open rate when emailed Monday 8-9 AM. If you have any board communications queued, schedule them for Monday morning.\n\nWant me to dive deeper into any of these items?`;
  })(),
};

/* ── suggested question chips ──────────────────────────────── */
const suggestedQuestions = [
  { text: 'Which members are most likely to churn this quarter?', icon: Users },
  { text: 'What was our best performing campaign this month?', icon: BarChart3 },
  { text: "Show me First American Title's engagement history", icon: Target },
  { text: 'How does our open rate compare to industry benchmarks?', icon: BarChart3 },
  { text: 'Which staff member should contact Heritage Abstract?', icon: Users },
  { text: "What's the revenue impact of our bounce rate?", icon: Shield },
  { text: "Summarize this week's email performance", icon: FileText },
  { text: 'What should I focus on today?', icon: Coffee },
];

/* ── data sources ──────────────────────────────────────────── */
const dataSources = [
  { name: 're:Members (Azure SQL)', status: 'connected' as const, detail: 'Connected — 4,994 member records', icon: Database },
  { name: 'Thaddeus (Event System)', status: 'connected' as const, detail: 'Connected — 2,840 event registrations', icon: Database },
  { name: 'Higher Logic', status: 'connected' as const, detail: 'Connected — 8 campaigns synced', icon: Wifi },
  { name: 'MEMTrak Events', status: 'connected' as const, detail: 'Active — 12,808 events tracked', icon: Zap },
  { name: 'Microsoft Graph', status: 'pending' as const, detail: 'Pending — awaiting admin consent', icon: Clock },
  { name: 'GA4 Analytics', status: 'pending' as const, detail: 'Pending — awaiting configuration', icon: Clock },
];

const statusColors: Record<string, string> = {
  connected: '#8CC63F',
  pending: '#E8923F',
  error: '#D94A4A',
};

/* ── capabilities ──────────────────────────────────────────── */
const capabilities = [
  { text: 'Natural language queries about any member', icon: MessageSquare },
  { text: 'Campaign performance analysis', icon: BarChart3 },
  { text: 'Churn risk assessment with recommendations', icon: Shield },
  { text: 'Staff routing suggestions', icon: Users },
  { text: 'Benchmark comparisons', icon: Target },
  { text: 'Daily briefing generation', icon: FileText },
  { text: 'Meeting prep — get a briefing before calling a member', icon: Coffee },
];

/* ── welcome message ───────────────────────────────────────── */
const welcomeMessage: ChatMessage = {
  id: 'welcome',
  role: 'ai',
  text: "Good morning! I'm MEMTrak AI, your membership intelligence assistant. I have access to all member data from re:Members, email analytics from MEMTrak and Higher Logic, event attendance from Thaddeus, and engagement scoring across all platforms. What would you like to know?",
  timestamp: new Date(),
  animate: false,
};

/* ── thinking dots component ───────────────────────────────── */
function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 py-2 px-1">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="rounded-full"
          style={{
            width: 7,
            height: 7,
            background: 'var(--accent)',
            animation: `thinkPulse 1.4s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes thinkPulse {
          0%, 80%, 100% { opacity: 0.25; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

/* ── main page component ───────────────────────────────────── */
export default function MemtrakAI() {
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSend = (text?: string) => {
    const question = (text || input).trim();
    if (!question || isThinking) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: question,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    // Look up response or generate generic
    const response = aiResponses[question] ||
      `I searched across re:Members, Thaddeus, Higher Logic, and MEMTrak event data for "${question}". This is a great question — in a production environment, I'd query the live databases and return real-time results. For now, try one of the suggested questions below to see a full analysis.\n\nConnected data sources:\n• 4,994 member records (re:Members)\n• 2,840 event registrations (Thaddeus)\n• 8 campaigns synced (Higher Logic)\n• 12,808 tracked events (MEMTrak)`;

    // Simulate thinking delay
    setTimeout(() => {
      setIsThinking(false);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        text: response,
        timestamp: new Date(),
        animate: true,
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1500 + Math.random() * 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChipClick = (question: string) => {
    handleSend(question);
  };

  return (
    <div className="p-6 h-[calc(100vh-56px)] flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-5 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)' }}
            >
              <Brain className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <h1 className="text-lg font-extrabold flex items-center gap-2" style={{ color: 'var(--heading)' }}>
                MEMTrak AI
                <Sparkles className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Ask anything about your members, campaigns, and engagement.
              </p>
            </div>
          </div>
          <p className="text-[10px] mt-1.5 ml-[46px]" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
            Powered by Claude — Connected to re:Members, Thaddeus, Higher Logic, and MEMTrak event data
          </p>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all hover:scale-105"
          style={{
            color: 'var(--accent)',
            background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)',
          }}
        >
          <Database className="w-3 h-3" />
          Data Sources
        </button>
      </div>

      {/* Main content: chat + sidebar */}
      <div className="flex gap-5 flex-1 min-h-0">
        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto rounded-xl border mb-4 px-5 py-4"
            style={{
              background: 'var(--card)',
              borderColor: 'var(--card-border)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            }}
          >
            <div className="space-y-5">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'ai' && (
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 mr-3"
                      style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)' }}
                    >
                      <Bot className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                    </div>
                  )}
                  <div
                    className={`rounded-xl px-4 py-3 max-w-[85%] ${msg.role === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
                    style={{
                      background: msg.role === 'user'
                        ? 'color-mix(in srgb, var(--accent) 15%, transparent)'
                        : 'var(--input-bg)',
                      border: `1px solid ${msg.role === 'user'
                        ? 'color-mix(in srgb, var(--accent) 25%, transparent)'
                        : 'var(--card-border)'}`,
                    }}
                  >
                    {msg.role === 'ai' && msg.animate ? (
                      <Typewriter
                        text={msg.text}
                        speed={12}
                        className="text-xs leading-relaxed whitespace-pre-wrap"
                      />
                    ) : (
                      <p
                        className="text-xs leading-relaxed whitespace-pre-wrap"
                        style={{ color: msg.role === 'user' ? 'var(--heading)' : 'var(--foreground)' }}
                      >
                        {msg.text}
                      </p>
                    )}
                    <div
                      className="text-[9px] mt-2 text-right"
                      style={{ color: 'var(--text-muted)', opacity: 0.6 }}
                    >
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {msg.role === 'user' && (
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 ml-3"
                      style={{ background: 'color-mix(in srgb, var(--accent) 25%, transparent)' }}
                    >
                      <User className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                    </div>
                  )}
                </div>
              ))}

              {/* Thinking indicator */}
              {isThinking && (
                <div className="flex justify-start">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 mr-3"
                    style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)' }}
                  >
                    <Bot className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                  </div>
                  <div
                    className="rounded-xl rounded-bl-sm px-4 py-3"
                    style={{
                      background: 'var(--input-bg)',
                      border: '1px solid var(--card-border)',
                    }}
                  >
                    <ThinkingDots />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input bar */}
          <div
            className="flex items-center gap-3 rounded-xl border px-4 py-3 mb-3 flex-shrink-0"
            style={{
              background: 'var(--card)',
              borderColor: 'var(--card-border)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask MEMTrak AI anything about your members..."
              className="flex-1 bg-transparent text-sm outline-none placeholder-opacity-50"
              style={{ color: 'var(--foreground)' }}
              disabled={isThinking}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isThinking}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 disabled:opacity-30 disabled:hover:scale-100"
              style={{
                background: input.trim() ? 'var(--accent)' : 'var(--input-bg)',
                color: input.trim() ? 'var(--card)' : 'var(--text-muted)',
              }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Suggested questions */}
          <div className="flex flex-wrap gap-2 flex-shrink-0">
            {suggestedQuestions.map(q => (
              <button
                key={q.text}
                onClick={() => handleChipClick(q.text)}
                disabled={isThinking}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium transition-all hover:scale-[1.03] hover:translate-y-[-1px] disabled:opacity-40"
                style={{
                  background: 'var(--input-bg)',
                  border: '1px solid var(--card-border)',
                  color: 'var(--foreground)',
                }}
              >
                <q.icon className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                {q.text}
              </button>
            ))}
          </div>
        </div>

        {/* Right sidebar: data sources + capabilities */}
        {sidebarOpen && (
          <div className="w-[280px] flex-shrink-0 flex flex-col gap-4 overflow-y-auto">
            {/* Data Sources */}
            <Card title="Connected Data Sources" subtitle="Real-time integrations">
              <div className="space-y-3">
                {dataSources.map(ds => (
                  <div key={ds.name} className="flex items-start gap-2.5">
                    <div className="relative mt-0.5">
                      <ds.icon className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                      <div
                        className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border"
                        style={{
                          background: statusColors[ds.status],
                          borderColor: 'var(--card)',
                          boxShadow: `0 0 6px ${statusColors[ds.status]}40`,
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-semibold" style={{ color: 'var(--heading)' }}>
                        {ds.name}
                      </div>
                      <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                        {ds.detail}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* AI Capabilities */}
            <Card title="AI Capabilities" subtitle="What MEMTrak AI can do">
              <div className="space-y-2.5">
                {capabilities.map(cap => (
                  <div key={cap.text} className="flex items-start gap-2.5">
                    <cap.icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                    <span className="text-[10px] leading-snug" style={{ color: 'var(--foreground)' }}>
                      {cap.text}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Stats */}
            <Card title="Session Stats" subtitle="This conversation">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px]">
                  <span style={{ color: 'var(--text-muted)' }}>Messages</span>
                  <span className="font-bold" style={{ color: 'var(--heading)' }}>{messages.length}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span style={{ color: 'var(--text-muted)' }}>Data sources queried</span>
                  <span className="font-bold" style={{ color: 'var(--heading)' }}>
                    {Math.min(4, messages.filter(m => m.role === 'ai').length)}
                  </span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span style={{ color: 'var(--text-muted)' }}>Model</span>
                  <span className="font-bold" style={{ color: 'var(--accent)' }}>Claude Sonnet</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span style={{ color: 'var(--text-muted)' }}>Context window</span>
                  <span className="font-bold" style={{ color: 'var(--heading)' }}>Full session</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
