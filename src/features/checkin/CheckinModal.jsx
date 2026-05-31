import { useState } from 'react';
import { submitCheckin, validateCheckinForm } from './logic.js';
import { getJourneyDay, dayKey } from '../../lib/dates.js';
import { setItem, STORAGE_KEYS } from '../../lib/storage.js';
import './CheckinModal.css';

const INTENSITIES = ['Mild', 'Moderate', 'Strong', 'Overwhelming'];
const MOODS = ['😊', '😐', '😔', '😤', '😰'];

/**
 * Single check-in modal — the only modal with id checkin-modal in the app.
 */
export default function CheckinModal({ open, day, stats, onClose, onSubmit }) {
  const [result, setResult] = useState(null);
  const [intensity, setIntensity] = useState(null);
  const [mood, setMood] = useState(null);
  const [trigger, setTrigger] = useState('');
  const [action, setAction] = useState('');
  const [worked, setWorked] = useState('');

  if (!open) return null;

  const startDate = stats.startDate ? new Date(stats.startDate) : undefined;
  const today = getJourneyDay(startDate);
  const isToday = day === today;
  const ready = validateCheckinForm({ result, intensity, mood, trigger, action });

  const handleSubmit = () => {
    if (!ready) return;
    const outcome = submitCheckin({
      stats,
      checkins: stats.checkins,
      day,
      result,
      intensity,
      mood,
      trigger,
      action,
      worked,
      startDate,
      today,
    });
    if (outcome.error) {
      alert(outcome.error);
      return;
    }
    if (outcome.isToday) {
      setItem(STORAGE_KEYS.LAST_CHECKIN, JSON.stringify(outcome.checkin));
    }
    onSubmit(outcome);
    setResult(null);
    setIntensity(null);
    setMood(null);
    setTrigger('');
    setAction('');
    setWorked('');
  };

  return (
    <div className="checkin-overlay open" role="dialog" aria-modal="true" aria-labelledby="checkin-modal-title" id="checkin-modal">
      <div className="checkin-sheet">
        <div className="checkin-header">
          <h2 id="checkin-modal-title">
            {isToday ? `Today — Day ${day}` : `Back-filling Day ${day}`}
          </h2>
          <button type="button" className="checkin-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="checkin-body">
          <p className="checkin-label">Did you win or lose today?</p>
          <div className="wl-row">
            <button type="button" className={`wl-btn win ${result === 'win' ? 'sel' : ''}`} id="checkin-win-btn" onClick={() => setResult('win')}>✅ Win</button>
            <button type="button" className={`wl-btn loss ${result === 'loss' ? 'sel' : ''}`} id="checkin-loss-btn" onClick={() => setResult('loss')}>❌ Loss</button>
          </div>

          <p className="checkin-label">Urge intensity</p>
          <div className="int-row">
            {INTENSITIES.map((v) => (
              <button key={v} type="button" className={`int-btn ${intensity === v ? 'sel' : ''}`} onClick={() => setIntensity(v)}>{v}</button>
            ))}
          </div>

          <p className="checkin-label">Mood</p>
          <div className="mood-row">
            {MOODS.map((m) => (
              <button key={m} type="button" className={`mo ${mood === m ? 'sel' : ''}`} onClick={() => setMood(m)}>{m}</button>
            ))}
          </div>

          <div className="form-group">
            <label htmlFor="checkin-trigger">What triggered the urge?</label>
            <textarea id="checkin-trigger" rows={2} value={trigger} onChange={(e) => setTrigger(e.target.value)} placeholder="Be specific — time, place, feeling…" />
          </div>
          <div className="form-group">
            <label htmlFor="checkin-action">What did you do?</label>
            <textarea id="checkin-action" rows={2} value={action} onChange={(e) => setAction(e.target.value)} placeholder="Your response to the urge" />
          </div>
          <div className="form-group">
            <label htmlFor="checkin-worked">What worked? (optional)</label>
            <textarea id="checkin-worked" rows={2} value={worked} onChange={(e) => setWorked(e.target.value)} placeholder="Anything that helped" />
          </div>
        </div>

        <button type="button" className="btn checkin-save" id="checkin-save-btn" disabled={!ready} onClick={handleSubmit}>
          Save Check-In
        </button>
      </div>
    </div>
  );
}

export function useCheckinModal(stats) {
  const [open, setOpen] = useState(false);
  const [day, setDay] = useState(null);

  const openForDay = (d) => {
    const startDate = stats.startDate ? new Date(stats.startDate) : undefined;
    const target = d ?? getJourneyDay(startDate);
    const k = dayKey(target);
    if (stats.checkins[k]) {
      alert(`You already checked in for Day ${target}.`);
      return;
    }
    setDay(target);
    setOpen(true);
  };

  return { open, day, openForDay, close: () => setOpen(false), setOpen };
}
