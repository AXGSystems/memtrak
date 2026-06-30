/**
 * MEMTrak — Anthropic (Claude) client
 *
 * Calls the Claude Messages API via raw HTTP (the project ships no SDK
 * dependency). Server-side only — never import this into a client component.
 *
 * Honest by design: if ANTHROPIC_API_KEY is not set, isAnthropicConfigured()
 * returns false and callers surface a "not configured" state rather than
 * fabricating an answer.
 *
 * Required env var: ANTHROPIC_API_KEY
 */

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-opus-4-8';

export function isAnthropicConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ClaudeResult {
  text: string;
  stopReason: string | null;
}

const REQUEST_TIMEOUT_MS = 45_000;
const MAX_ATTEMPTS = 3;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Send a turn to Claude and return the text response.
 *
 * Hardened: enforces a hard wall-clock timeout via AbortController (a single
 * blocking fetch with no timeout can hang an Opus request indefinitely), and
 * retries transient failures (429 / 5xx / network) with exponential backoff +
 * jitter. 4xx errors other than 429 are surfaced immediately (no retry).
 *
 * Throws if ANTHROPIC_API_KEY is missing or the API errors after retries.
 */
export async function askClaude(opts: {
  system?: string;
  messages: ClaudeMessage[];
  maxTokens?: number;
}): Promise<ClaudeResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const body = JSON.stringify({
    model: MODEL,
    max_tokens: opts.maxTokens ?? 1500,
    ...(opts.system ? { system: opts.system } : {}),
    messages: opts.messages,
  });

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body,
        signal: controller.signal,
      });

      if (!res.ok) {
        const detail = await res.text().catch(() => '');
        const retryable = res.status === 429 || res.status >= 500;
        const err = new Error(`Claude API error ${res.status}: ${detail.slice(0, 300)}`);
        if (retryable && attempt < MAX_ATTEMPTS) {
          // Honor Retry-After when present, else exponential backoff + jitter.
          const retryAfter = Number(res.headers.get('retry-after'));
          const backoff = Number.isFinite(retryAfter) && retryAfter > 0
            ? retryAfter * 1000
            : 2 ** (attempt - 1) * 600 + Math.random() * 300;
          lastError = err;
          await sleep(backoff);
          continue;
        }
        throw err;
      }

      const data = (await res.json()) as {
        stop_reason?: string | null;
        content?: Array<{ type: string; text?: string }>;
      };

      const text = (data.content || [])
        .filter(b => b.type === 'text' && typeof b.text === 'string')
        .map(b => b.text as string)
        .join('')
        .trim();

      return { text, stopReason: data.stop_reason ?? null };
    } catch (err) {
      const isAbort = err instanceof Error && err.name === 'AbortError';
      const normalized = isAbort
        ? new Error('Claude API request timed out')
        : err instanceof Error
          ? err
          : new Error('Claude API request failed');
      // Network/abort errors are transient — retry with backoff.
      const transient = isAbort || (err instanceof TypeError);
      if (transient && attempt < MAX_ATTEMPTS) {
        lastError = normalized;
        await sleep(2 ** (attempt - 1) * 600 + Math.random() * 300);
        continue;
      }
      throw normalized;
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError ?? new Error('Claude API request failed after retries');
}
