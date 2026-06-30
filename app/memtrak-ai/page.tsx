'use client';

import { useState, useRef, useEffect } from 'react';
import SampleDataBadge from '@/components/SampleDataBadge';
import { Brain, Sparkles, Send, Database, Wifi, Clock, Bot, User, Zap, MessageSquare, BarChart3, Users, Shield, Target, FileText, Coffee } from 'lucide-react';
import Card from '@/components/Card';
import Typewriter from '@/components/Typewriter';
/* ── types ─────────────────────────────────────────────────── */
interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
  animate?: boolean; // only AI messages that should typewrite
}

/* ── suggested question chips ──────────────────────────────────
   These are answered live by Claude grounded in the real MEMTrak event log
   (opens/clicks/sends/bounces/suppression). They deliberately stick to
   questions the live aggregate event data can actually answer — member-level
   queries (e.g. a specific org's history) are deferred until the AMS sources
   listed under "Data Sources" are connected, so we never advertise a query the
   live data can't honestly resolve. */
const suggestedQuestions = [
  { text: 'How many events have been tracked, and what is the breakdown by type?', icon: BarChart3 },
  { text: 'Which campaign has the highest open rate in the event log?', icon: Target },
  { text: 'What was our email activity over the last 30 days?', icon: FileText },
  { text: 'How many unique recipients have we tracked?', icon: Users },
  { text: 'How many addresses are currently suppressed?', icon: Shield },
  { text: 'Summarize overall deliverability from the tracked events.', icon: MessageSquare },
];

/* ── data sources ──────────────────────────────────────────── */
/* Honest grounding: the assistant answers over the live MEMTrak event log.
   Other sources are listed as planned integrations, not as connected. */
const dataSources = [
  { name: 'MEMTrak Events', status: 'connected' as const, detail: 'Live event log — grounds AI answers', icon: Zap },
  { name: 're:Members (Azure SQL)', status: 'pending' as const, detail: 'Planned — AMS member records', icon: Database },
  { name: 'Thaddeus (Event System)', status: 'pending' as const, detail: 'Planned — event registrations', icon: Database },
  { name: 'Higher Logic', status: 'pending' as const, detail: 'Planned — campaign sync', icon: Wifi },
  { name: 'Microsoft Graph', status: 'pending' as const, detail: 'Configure GRAPH_* to enable sending', icon: Clock },
  { name: 'GA4 Analytics', status: 'pending' as const, detail: 'Planned — site attribution', icon: Clock },
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
  text: "Hi — I'm MEMTrak AI, your membership engagement assistant, powered by Claude. I answer questions grounded in your live MEMTrak email-tracking data (opens, clicks, sends, suppression). Ask me about campaign performance, engagement, or deliverability. (Set ANTHROPIC_API_KEY to enable live answers.)",
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
  // Tracks whether a real, Claude-backed answer has actually been received this
  // session. Stays false until the AI route returns configured !== false, so
  // the Session Stats panel never asserts a live model when none ran.
  const [aiLive, setAiLive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSend = async (text?: string) => {
    const question = (text || input).trim();
    if (!question || isThinking) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: question,
      timestamp: new Date(),
    };
    // Snapshot prior conversation for context before appending the new turn.
    const priorHistory = messages
      .filter(m => m.id !== 'welcome')
      .map(m => ({ role: (m.role === 'ai' ? 'assistant' : 'user') as 'assistant' | 'user', content: m.text }));

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    const pushAi = (text: string) => {
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        text,
        timestamp: new Date(),
        animate: true,
      };
      setMessages(prev => [...prev, aiMsg]);
    };

    try {
      const res = await fetch('/api/memtrak/ai', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mode: 'chat', question, history: priorHistory }),
      });
      const data = await res.json();

      if (data.configured === false) {
        // Honest fallback: AI is not configured in this environment. We never
        // fabricate an answer here — no canned/example prose is served. The only
        // way to get an answer is to configure a real Claude key.
        pushAi(
          'AI is not configured in this environment. Set the ANTHROPIC_API_KEY environment variable to enable live, Claude-backed answers grounded in your real MEMTrak event data. No example or simulated answers are shown — every response comes from the live model and your real event log.'
        );
      } else if (data.answer) {
        setAiLive(true);
        pushAi(data.answer);
      } else {
        pushAi(`I couldn't complete that request${data.error ? `: ${data.error}` : '.'}`);
      }
    } catch {
      pushAi('Network error reaching the AI service. Please try again.');
    } finally {
      setIsThinking(false);
    }
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
      <SampleDataBadge />
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
            Powered by Claude — answers grounded in your live MEMTrak event data
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
                      className="text-[11px] mt-2 text-right"
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
                      <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
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
                  <span style={{ color: 'var(--text-muted)' }}>Live data grounding</span>
                  <span className="font-bold" style={{ color: 'var(--heading)' }}>
                    {aiLive ? 'MEMTrak events' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span style={{ color: 'var(--text-muted)' }}>Model</span>
                  <span className="font-bold" style={{ color: aiLive ? 'var(--accent)' : 'var(--text-muted)' }}>
                    {aiLive ? 'Claude Opus 4.8' : 'Not connected'}
                  </span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span style={{ color: 'var(--text-muted)' }}>Context</span>
                  <span className="font-bold" style={{ color: 'var(--heading)' }}>
                    {aiLive ? 'Conversation + live event stats' : '—'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
