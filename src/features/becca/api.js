const API_BASE = import.meta.env.VITE_API_BASE ?? '';
const CHAT_PATH = '/api/chat';
const MODEL = 'claude-sonnet-4-20250514';

function chatUrl() {
  const base = API_BASE.replace(/\/$/, '');
  return `${base}${CHAT_PATH}`;
}

/**
 * All Becca requests go through the server proxy — NEVER api.anthropic.com from browser.
 */
export async function sendChatRequest({ system, messages, maxTokens = 1000 }) {
  const res = await fetch(chatUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: messages.slice(-14),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Chat request failed (${res.status})`);
  }

  const data = await res.json();
  const text =
    data.content?.[0]?.text ??
    data.reply ??
    'I am here. Something went wrong — try again?';
  return text;
}

export async function sendBeccaMessage(system, messages) {
  return sendChatRequest({ system, messages, maxTokens: 1000 });
}

export async function sendBeccaAnalysis(system, messages) {
  return sendChatRequest({ system, messages, maxTokens: 1200 });
}
