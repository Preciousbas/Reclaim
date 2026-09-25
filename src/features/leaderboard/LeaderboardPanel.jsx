import { useEffect, useRef, useState } from 'react';
import { useUserData } from '../../hooks/useUser.jsx';
import { fetchLeaderboard, fetchLeaderboardTotal, fetchUserRank } from '../../lib/firestore.js';
import { computeRIFromStats, getRIColor } from '../../lib/resilience.js';
import { getJourneyDay } from '../../lib/dates.js';
import { calcRI } from '../../lib/resilience.js';
import { RankDisc } from '../../components/Layout.jsx';
import './Leaderboard.css';

const DUMMY_NAMES = ['Alex', 'Jordan', 'Sam', 'Chris', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Avery'];
const PAGE_SIZE = 50;

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

function lbTone(days) {
  if (days >= 365) return 'diamond';
  if (days >= 270) return 'platinum';
  if (days >= 180) return 'gold';
  if (days >= 90) return 'silver';
  if (days >= 30) return 'bronze';
  return 'begin';
}

export default function LeaderboardPanel() {
  const { stats, joinLb, updateStats } = useUserData();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(null);
  const [myRank, setMyRank] = useState(null);
  const lastDocRef = useRef(null);
  const journeyDay = getJourneyDay(stats.startDate);
  const joined = stats.lbJoined;
  const myRI = computeRIFromStats({
    streak: stats.streak,
    wins: stats.wins,
    losses: stats.losses,
    checkins: stats.checkins,
  });

  const loadBoard = async (append = false) => {
    if (joined !== 'yes') return;
    if (append) setLoadingMore(true);
    else setLoading(true);
    try {
      const { entries: remote, lastDoc: ld, hasMore: more } = await fetchLeaderboard(
        PAGE_SIZE,
        append ? lastDocRef.current : null
      );
      lastDocRef.current = ld;
      const mapped = remote.map((r, i) => ({
        name: r.displayName,
        days: r.streak,
        ri: r.ri,
        real: true,
        uid: r.uid,
        rank: append ? undefined : i + 1,
      }));
      setEntries((prev) => {
        const next = append ? [...prev, ...mapped] : mapped;
        return next.map((row, i) => ({ ...row, rank: row.rank || i + 1 }));
      });
      setHasMore(more);
      if (!append) {
        const total = await fetchLeaderboardTotal();
        setTotalCount(total);
        const rank = await fetchUserRank(myRI.ri);
        setMyRank(rank);
      }
    } catch {
      if (!append) setEntries(genDummies(30));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (joined === 'yes') {
        await loadBoard(false);
      } else {
        setEntries(genDummies(50));
        setLoading(false);
      }
      if (cancelled) return;
    })();
    return () => { cancelled = true; };
  }, [joined]);

  useEffect(() => {
    if (joined === 'yes') loadBoard(false);
  }, [stats.streak]);

  const displayList = [...entries];
  if (joined === 'yes') {
    const meInList = displayList.some((u) => u.uid && u.name === stats.reclaimName);
    if (!meInList && myRank) {
      displayList.push({
        name: stats.reclaimName,
        days: stats.streak,
        ri: myRI.ri,
        isMe: true,
        real: true,
        rank: myRank,
      });
    } else {
      displayList.forEach((u, i) => {
        if (u.name === stats.reclaimName) u.isMe = true;
      });
    }
  }

  if (journeyDay < 30 && joined !== 'yes') {
    return (
      <div className="lb-lock">
        <p>Leaderboard unlocks at Day 30</p>
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
          {displayList.slice(0, joined === 'yes' ? undefined : 50).map((u) => {
            const rank = u.rank || displayList.indexOf(u) + 1;
            return (
              <li key={`${u.name}-${rank}`} className={`lb-row ${u.isMe ? 'me' : ''} ${rank <= 3 ? 'top3' : ''}`}>
                <span className="lb-rank">#{rank}</span>
                <RankDisc tone={lbTone(u.days)} />
                <div className="lb-info">
                  <div className="lb-name">{u.isMe ? 'You · ' : ''}{u.name}</div>
                  <div className="lb-meta" style={{ color: getRIColor(u.ri) }}>RI {(u.ri || 0).toFixed(4)} · {u.days}d clean</div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {hasMore && joined === 'yes' && (
        <button type="button" className="btn-ghost lb-more" disabled={loadingMore} onClick={() => loadBoard(true)}>
          {loadingMore ? 'Loading…' : 'Load more'}
        </button>
      )}
      <p className="lb-count">
        {(totalCount ?? displayList.length).toLocaleString()} people on this journey
      </p>
    </div>
  );
}
