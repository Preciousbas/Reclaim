import { getBadge } from '../features/checkin/logic.js';
import { useUserData } from '../hooks/useUser.jsx';
import { MILESTONES } from '../features/streak/milestones.js';
import { PHASES, MEDAL_LADDER } from '../content/phases.js';
import { RankDisc } from '../components/Layout.jsx';
import './Phases.css';

export default function Phases() {
  const { stats } = useUserData();
  const badge = getBadge(stats);

  return (
    <div className="phases-page">
      <div className="phase-hero">
        <RankDisc tone={badge.tone} size="lg" />
        <div>
          <h1>{badge.name}</h1>
          <p>{badge.level}</p>
          {badge.next && <p className="phase-next">{badge.next}</p>}
        </div>
      </div>

      {PHASES.map((ph) => {
        const unlocked = ph.unlock(stats);
        return (
          <details key={ph.id} className={`phase-card p${ph.id} ${unlocked ? 'ul' : ''}`} open={unlocked}>
            <summary>
              <span className="ph-ic">{ph.medal}</span>
              <span className="ph-inf">
                <span className="ph-tt">{ph.title}</span>
                <span className="ph-sb">{ph.subtitle}</span>
              </span>
              <span className="ph-ar">{unlocked ? 'Open' : 'Locked'}</span>
            </summary>
            <div className="ph-body">
              {ph.paragraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
              {ph.badge && (
                <div className={`sbdg ${unlocked ? 'unlocked' : ''}`}>
                  <RankDisc tone={ph.badge.tone} />
                  <div className="sb-inf">
                    <div className="sb-nm">{ph.badge.name}</div>
                    <div className="sb-ds">{ph.badge.desc}</div>
                  </div>
                  <span className="sb-st">{unlocked ? 'Reached' : 'Locked'}</span>
                </div>
              )}
              {ph.badges?.map((b) => (
                <div key={b.name} className="sbdg">
                  <RankDisc tone={b.tone} />
                  <div className="sb-inf">
                    <div className="sb-nm">{b.name}</div>
                    <div className="sb-ds">{b.desc}</div>
                  </div>
                  <span className="sb-st">Locked</span>
                </div>
              ))}
              {ph.closing && <p className="ph-closing">{ph.closing}</p>}
            </div>
          </details>
        );
      })}

      <div className="medal-ladder">
        <h2 className="section-title">Medal Ladder</h2>
        <p className="ladder-sub">Every level earned. Never taken away.</p>
        {MEDAL_LADDER.map((m) => (
          <div key={m.name} className="ml-row">
            <RankDisc tone={m.tone} />
            <div>
              <div className="ml-nm">{m.name}</div>
              <div className="ml-rq">{m.req}</div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="section-title">Milestones</h2>
      <div className="milestone-list">
        {MILESTONES.map((m) => (
          <div key={m.d} className={`ms-row ${stats.streak >= m.d ? 'done' : ''}`}>
            <span className="day-mark">{m.d}</span>
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
