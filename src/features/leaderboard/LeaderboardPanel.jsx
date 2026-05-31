import { useEffect, useState } from 'react';
import { useUserData } from '../../hooks/useUser.jsx';
import { fetchLeaderboard } from '../../lib/firestore.js';
import { computeRIFromStats, getRIColor } from '../../lib/resilience.js';
import { getJourneyDay } from '../../lib/dates.js';
import { calcRI } from '../../lib/resilience.js';
import './Leaderboard.css';

const DUMMY_NAMES = ['Alex', 'Jordan', 'Sam', 'Chris', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Avery'];

function genDummies(count = 50) {
  if (import.meta.env.PROD) return [];
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const nm = DUMMY_NAMES[i % DUMMY_NAMES.length] + (i >= DUMMY_NAMES.length ? ` ${Math.floor(i / DUMMY_NAMES.length) + 1}` : '');
    const days = Math.floor(Math.random() * 60) + 5;
    const ec = Math.floor(days * 0.7);
    const ew = Math.floor(ec * 0.65);
    const el = ec - ew;
    const ri = calcRI(days, ec, ew, el, Math.floor(el / 3)).ri;
    out.push({ name: nm, days, ri, dummy: true });
  }
  return out.sort((a, b) => b.ri - a.ri);
}

function lbBadge(days) {
  if (days >= 365) return '💎';
  if (days >= 270) return '🏆';
  if (days >= 180) return '🥇';
  if (days >= 90) return '🥈';
  if (days >= 30) return '🥉';
  return '🌱';
}

export default function LeaderboardPanel() {
  const { stats, joinLb, updateStats } = useUserData();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const journeyDay = getJourneyDay(stats.startDate ? new Date(stats.startDate) : undefined);
  const joined = stats.lbJoined;
  const myRI = computeRIFromStats({
    streak: stats.streak,
    wins: stats.wins,
    losses: stats.losses,
    checkins: stats.checkins,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        if (joined === 'yes') {
          const remote = await fetchLeaderboard(50);
          if (!cancelled) setEntries(remote.map((r) => ({ name: r.displayName, days: r.streak, ri: r.ri, real: true, uid: r.uid })));
        } else {
          const dummies = genDummies(50);
          if (!cancelled) setEntries(dummies);
        }
      } catch {
        if (!cancelled) setEntries(genDummies(30));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [joined, stats.streak]);

  const all = [...entries];
  if (joined === 'yes') {
    const me = { name: stats.reclaimName, days: stats.streak, ri: myRI.ri, isMe: true, real: true };
    if (!all.some((u) => u.isMe)) all.push(me);
    else {
      const idx = all.findIndex((u) => u.isMe);
      if (idx >= 0) all[idx] = me;
    }
    all.sort((a, b) => b.ri - a.ri);
  }

  const myRank = all.findIndex((u) => u.isMe) + 1;

  if (journeyDay < 30 && joined !== 'yes') {
    return (
      <div className="lb-lock">
        <p>🔒 Leaderboard unlocks at Day 30</p>
        <p className="lb-sub">Keep checking in — {30 - journeyDay} days to go.</p>
      </div>
    );
  }

  if (joined !== 'yes' && joined !== 'no') {
    return (
      <div className="lb-join">
        <h3>Join the global leaderboard</h3>
        <p>Share your RI score anonymously with others on the same journey.</p>
        <button type="button" className="btn" onClick={() => joinLb()}>Join leaderboard</button>
        <button type="button" className="btn-ghost" onClick={() => updateStats({ lbJoined: 'no' })}>Not now</button>
      </div>
    );
  }

  return (
    <div className="lb-panel">
      {joined === 'yes' && (
        <div className="lb-you">
          <span>Your rank</span>
          <strong>#{myRank || '—'}</strong>
          <span>{stats.reclaimName} · {stats.streak}d · RI {myRI.ri.toFixed(4)}</span>
        </div>
      )}
      {loading ? <p>Loading…</p> : (
        <ul className="lb-list">
          {all.slice(0, 50).map((u, i) => {
            const rank = i + 1;
            const icon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
            return (
              <li key={`${u.name}-${rank}`} className={`lb-row ${u.isMe ? 'me' : ''} ${rank <= 3 ? 'top3' : ''}`}>
                <span className="lb-rank">{icon}</span>
                <div className="lb-info">
                  <div className="lb-name">{u.isMe ? '⭐ ' : ''}{lbBadge(u.days)} {u.name}</div>
                  <div className="lb-meta" style={{ color: getRIColor(u.ri) }}>RI {(u.ri || 0).toFixed(4)} · {u.days}d clean</div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className="lb-count">{all.length.toLocaleString()} people on this journey</p>
    </div>
  );
}
