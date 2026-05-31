import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useUserData } from '../hooks/useUser.jsx';
import {
  URGE_STEPS,
  GROUNDING_54321,
  CRISIS_RESOURCES,
  getPersonalAnchor,
} from '../features/emergency/protocols.js';
import './Emergency.css';

const BREATH_CYCLE = [
  { label: 'Breathe in', seconds: 4 },
  { label: 'Hold', seconds: 4 },
  { label: 'Breathe out', seconds: 6 },
];

export default function Emergency() {
  const { stats } = useUserData();
  const anchor = getPersonalAnchor(stats.checkins);
  const [activeTab, setActiveTab] = useState('now');
  const [breathRunning, setBreathRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [countdown, setCountdown] = useState(BREATH_CYCLE[0].seconds);
  const [cyclesDone, setCyclesDone] = useState(0);

  const phase = BREATH_CYCLE[phaseIdx];

  useEffect(() => {
    if (!breathRunning) return undefined;
    if (countdown <= 0) {
      const next = (phaseIdx + 1) % BREATH_CYCLE.length;
      if (next === 0) setCyclesDone((c) => c + 1);
      setPhaseIdx(next);
      setCountdown(BREATH_CYCLE[next].seconds);
      return undefined;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [breathRunning, countdown, phaseIdx]);

  const startBreathing = () => {
    setBreathRunning(true);
    setPhaseIdx(0);
    setCountdown(BREATH_CYCLE[0].seconds);
    setCyclesDone(0);
  };

  const stopBreathing = () => setBreathRunning(false);

  const openMapsWalk = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          window.open(`https://www.google.com/maps/search/walk/@${latitude},${longitude},15z`, '_blank', 'noopener');
        },
        () => window.open('https://www.google.com/maps', '_blank', 'noopener')
      );
    }
  }, []);

  return (
    <div className="emergency-page">
      <header className="emergency-header">
        <h1>Urge toolkit</h1>
        <p>You are not alone. This passes. Use what helps — skip what does not.</p>
      </header>

      {anchor && (
        <section className="emergency-anchor">
          <span className="anchor-label">From your last check-in</span>
          <p className="anchor-trigger"><strong>Trigger:</strong> {anchor.trigger}</p>
          <p className="anchor-action"><strong>What worked before:</strong> {anchor.worked || anchor.action}</p>
          <p className="anchor-hint">Try that again — right now.</p>
        </section>
      )}

      <div className="emergency-tabs" role="tablist">
        {[
          { id: 'now', label: 'Right now' },
          { id: 'breathe', label: 'Breathe' },
          { id: 'ground', label: 'Ground' },
          { id: 'reach', label: 'Reach out' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={activeTab === t.id}
            className={`em-tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'now' && (
        <section className="em-panel">
          <h2>5-minute protocol</h2>
          <ol className="urge-steps">
            {URGE_STEPS.map((s) => (
              <li key={s.n}>
                <span className="urge-n">{s.n}</span>
                <div>
                  <strong>{s.title}</strong>
                  <p>{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <button type="button" className="em-action-btn walk" onClick={openMapsWalk}>
            🚶 Open maps — walk somewhere else
          </button>
          <Link to="/app/dashboard" className="em-action-btn log">
            ✅ Urge passed — log today&apos;s check-in
          </Link>
        </section>
      )}

      {activeTab === 'breathe' && (
        <section className="em-panel breathe-panel">
          <h2>Box breath</h2>
          <p className="breathe-sub">Four cycles is enough to shift your body out of panic mode.</p>
          <div className={`breathe-ring ${breathRunning ? 'active' : ''}`}>
            <span className="breathe-phase">{breathRunning ? phase.label : 'Ready?'}</span>
            <span className="breathe-count">{breathRunning ? countdown : '—'}</span>
          </div>
          <p className="breathe-cycles">{cyclesDone > 0 ? `${cyclesDone} cycle${cyclesDone === 1 ? '' : 's'} complete` : ''}</p>
          {!breathRunning ? (
            <button type="button" className="btn" onClick={startBreathing}>Start breathing</button>
          ) : (
            <button type="button" className="btn-ghost" onClick={stopBreathing}>Pause</button>
          )}
        </section>
      )}

      {activeTab === 'ground' && (
        <section className="em-panel">
          <h2>5-4-3-2-1 grounding</h2>
          <p className="ground-intro">Say each answer out loud. Slower is better.</p>
          <ul className="ground-list">
            {GROUNDING_54321.map((g) => (
              <li key={g.sense}>
                <strong>{g.sense}</strong>
                <span>{g.prompt}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {activeTab === 'reach' && (
        <section className="em-panel">
          <h2>Reach a human</h2>
          <p className="reach-intro">
            Shame grows in silence. You only need one sentence: &ldquo;I am struggling — can you talk for five minutes?&rdquo;
          </p>
          <a href="sms:?body=Hey%2C%20having%20a%20hard%20moment.%20Can%20you%20check%20in%20with%20me%3F" className="em-action-btn sms">
            💬 Draft a text to someone you trust
          </a>
          <div className="crisis-block">
            <p className="crisis-title">If you might hurt yourself</p>
            {CRISIS_RESOURCES.map((r) => (
              <a key={r.href} href={r.href} className="crisis-link" target="_blank" rel="noopener noreferrer">
                <span>{r.label}</span>
                <small>{r.sub}</small>
              </a>
            ))}
          </div>
        </section>
      )}

      <p className="emergency-footer">
        Becca AI chat is <Link to="/app/chat">coming soon</Link>. This toolkit works offline, anytime.
      </p>
    </div>
  );
}
