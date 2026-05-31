import { useState, useEffect, useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useUserData } from '../hooks/useUser.jsx';
import { buildSystemPrompt, getWelcomeMessage, getEmergencyPrompt } from '../features/becca/prompt.js';
import { sendBeccaMessage, sendBeccaAnalysis } from '../features/becca/api.js';
import './Chat.css';

function formatTime() {
  const now = new Date();
  return `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
}

export default function Chat() {
  const { stats } = useUserData();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const bottomRef = useRef(null);
  const chatHistRef = useRef([]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);

  useEffect(() => {
    const analysis = location.state?.analysis;
    const emergency = searchParams.get('emergency') === '1';

    if (analysis && !initialized) {
      setInitialized(true);
      setMessages([{ role: 'ai', text: 'Becca is reading your check-in…', time: formatTime(), loading: true }]);
      setBusy(true);
      sendBeccaAnalysis(analysis.system, analysis.messages)
        .then((reply) => {
          chatHistRef.current = [...analysis.messages, { role: 'assistant', content: reply }];
          setMessages([{ role: 'ai', text: reply, time: formatTime() }]);
        })
        .catch(() => {
          setMessages([
            {
              role: 'ai',
              text: 'I read your check-in but had trouble connecting. Talk to me directly — tell me what happened.',
              time: formatTime(),
            },
          ]);
        })
        .finally(() => setBusy(false));
      return;
    }

    if (!initialized) {
      setInitialized(true);
      const welcome = getWelcomeMessage(stats);
      setMessages([{ role: 'ai', text: welcome, time: formatTime() }]);
      chatHistRef.current = [{ role: 'assistant', content: welcome }];

      if (emergency) {
        setTimeout(() => send(getEmergencyPrompt()), 300);
      }
    }
  }, [location.state, searchParams, stats, initialized]);

  const send = async (textOverride) => {
    const text = (textOverride ?? input).trim();
    if (!text || busy) return;
    setInput('');

    const userMsg = { role: 'user', text, time: formatTime() };
    setMessages((prev) => [...prev, userMsg]);
    chatHistRef.current.push({ role: 'user', content: text });
    setBusy(true);

    try {
      const system = buildSystemPrompt(stats, stats.checkins);
      const reply = await sendBeccaMessage(system, chatHistRef.current);
      chatHistRef.current.push({ role: 'assistant', content: reply });
      setMessages((prev) => [...prev, { role: 'ai', text: reply, time: formatTime() }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: 'Having trouble connecting. Try again in a moment.', time: formatTime() },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const quickPrompts = ['I had an urge today', 'Help me understand my pattern', 'I relapsed — what now?'];

  return (
    <div className="chat-page">
      <div className="chat-msgs">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            <div className={`msg-bub ${m.loading ? 'typing' : ''}`}>
              {m.loading ? (
                <span className="dots"><span /><span /><span /></span>
              ) : (
                m.text
              )}
            </div>
            {!m.loading && <div className="msg-tm">{m.time}</div>}
          </div>
        ))}
        {busy && !messages.some((m) => m.loading) && (
          <div className="msg ai">
            <div className="msg-bub typing"><span className="dots"><span /><span /><span /></span></div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length <= 2 && !busy && (
        <div className="qbar">
          {quickPrompts.map((q) => (
            <button key={q} type="button" className="q-chip" onClick={() => send(q)}>{q}</button>
          ))}
        </div>
      )}

      <div className="chat-input-row">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Talk to Becca…"
          disabled={busy}
        />
        <button type="button" className="chat-send" disabled={busy || !input.trim()} onClick={() => send()}>
          Send
        </button>
      </div>
    </div>
  );
}
