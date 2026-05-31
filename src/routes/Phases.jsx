import { getBadge } from '../features/checkin/logic.js';
import { useUserData } from '../hooks/useUser.jsx';
import { MILESTONES } from '../features/streak/milestones.js';
import './Phases.css';

const PHASES = [
  {
    id: 1,
    title: 'Phase 1 — Discovery',
    medal: '🥉',
    desc: 'Complete 30 check-ins. Learn your triggers. Build awareness.',
    unlock: (s) => s.wins >= 20,
  },
  {
    id: 2,
    title: 'Phase 2 — Overcoming',
    medal: '⚗️',
    desc: '30+ wins. Replace old patterns with new protocols.',
    unlock: (s) => s.wins >= 30,
  },
  {
    id: 3,
    title: 'Phase 3 — Mastery',
    medal: '🥈',
    desc: '90+ days clean. Neural rewiring in full effect.',
    unlock: (s) => s.streak >= 90,
  },
];

export default function Phases() {
  const { stats } = useUserData();
  const badge = getBadge(stats);

  return (
    <div className="phases-page">
      <div className="phase-hero">
        <span className="phase-medal">{badge.icon}</span>
        <div>
          <h1>{badge.name}</h1>
          <p>{badge.level}</p>
          {badge.next && <p className="phase-next">🎯 {badge.next}</p>}
        </div>
      </div>

      {PHASES.map((ph) => {
        const unlocked = ph.unlock(stats);
        return (
          <details key={ph.id} className={`phase-card ${unlocked ? 'ul' : ''}`} open={unlocked}>
            <summary>
              <span>{ph.medal}</span>
              <span>{ph.title}</span>
              <span className="ph-ar">{unlocked ? '✅' : '🔒'}</span>
            </summary>
            <p>{ph.desc}</p>
          </details>
        );
      })}

      <h2 className="section-title">Milestones</h2>
      <div className="milestone-list">
        {MILESTONES.map((m) => (
          <div key={m.d} className={`ms-row ${stats.streak >= m.d ? 'done' : ''}`}>
            <span>{m.e}</span>
            <div>
              <strong>{m.t}</strong>
              <p>{m.s}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
