import { useEffect } from 'react';
import { getRILabel, getRIColor } from '../lib/resilience.js';
import './RIBreakdown.css';

export default function RIBreakdown({ open, ri, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="ri-overlay show" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="ri-sheet" onClick={(e) => e.stopPropagation()}>
        <h3>Your Resilience Index</h3>
        <p>A scientific measure of your recovery strength.</p>

        <div className="ri-bar-row">
          <div className="ri-bar-label">
            <span className="ri-bar-name">Days clean <span className="ri-weight">55%</span></span>
            <span className="ri-bar-score">{ri.d.toFixed(4)}</span>
          </div>
          <div className="ri-bar-track">
            <div className="ri-bar-fill ri-d" style={{ width: `${ri.d * 100}%` }} />
          </div>
          <div className="ri-bar-desc">Logarithmic scale — early days count most.</div>
        </div>

        <div className="ri-bar-row">
          <div className="ri-bar-label">
            <span className="ri-bar-name">Rewiring <span className="ri-weight">25%</span></span>
            <span className="ri-bar-score">{ri.r.toFixed(4)}</span>
          </div>
          <div className="ri-bar-track">
            <div className="ri-bar-fill ri-r" style={{ width: `${ri.r * 100}%` }} />
          </div>
          <div className="ri-bar-desc">Check-in consistency builds new neural pathways.</div>
        </div>

        <div className="ri-bar-row">
          <div className="ri-bar-label">
            <span className="ri-bar-name">Courage <span className="ri-weight">20%</span></span>
            <span className="ri-bar-score">{ri.c.toFixed(4)}</span>
          </div>
          <div className="ri-bar-track">
            <div className="ri-bar-fill ri-c" style={{ width: `${ri.c * 100}%` }} />
          </div>
          <div className="ri-bar-desc">Comebacks after relapses — strongest predictor.</div>
        </div>

        <div className="ri-total-row">
          <div className="ri-total-num" style={{ color: getRIColor(ri.ri) }}>{ri.ri.toFixed(4)}</div>
          <div className="ri-total-lbl">Resilience index · {getRILabel(ri.ri)}</div>
        </div>

        <button type="button" className="ri-close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
