import { useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { buildAnalysisPrompt } from '../features/becca/prompt.js';
import { useAuth, useUserData } from '../hooks/useUser.jsx';
import { isBeccaEnabled } from '../lib/features.js';
import { getJourneyDay, dayKey } from '../lib/dates.js';
import { computePatternInsights, computeRIFromStats, getRILabel, getRIColor } from '../lib/resilience.js';
import { getBadge, computeConfidence, computeReward } from '../features/checkin/logic.js';
import { getMilestoneForStreak, MS } from '../features/streak/milestones.js';
import CheckinModal, { useCheckinModal } from '../features/checkin/CheckinModal.jsx';
import LeaderboardPanel from '../features/leaderboard/LeaderboardPanel.jsx';
import RIBreakdown from '../components/RIBreakdown.jsx';
import { RankDisc } from '../components/Layout.jsx';
import { SUPPORT_EMAIL, mailtoUrl, openSupportEmail } from '../lib/support.js';
import './Dashboard.css';

export default function Dashboard() {
  const { stats, updateStats } = useUserData();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [milestone, setMilestone] = useState(null);
  const [checkinToast, setCheckinToast] = useState(null);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [riOpen, setRiOpen] = useState(false);
  const modal = useCheckinModal(stats);

  const journeyDay = getJourneyDay(stats.startDate);
  const badge = getBadge(stats);
  const ri = useMemo(
    () => computeRIFromStats({ streak: stats.streak, wins: stats.wins, losses: stats.losses, checkins: stats.checkins }),
    [stats]
  );
  const insights = useMemo(
    () => computePatternInsights(stats.checkins, stats, journeyDay),
    [stats, journeyDay]
  );
  const conf = computeConfidence(stats, journeyDay);
  const rew = computeReward(stats, journeyDay);

  const todayKey = dayKey(journeyDay);
  const hasTodayCheckin = Boolean(stats.checkins[todayKey]);

  const handleCheckinSubmit = useCallback(
    async (outcome) => {
      updateStats({ ...outcome.stats, checkins: outcome.checkins });
      modal.close();

      if (outcome.milestoneStreak) {
        const ms = getMilestoneForStreak(outcome.milestoneStreak);
        if (ms) setMilestone(ms);
      }

      if (outcome.isToday) {
        setCheckedInToday(true);
        const isFirstCheckin = isAuthenticated && !stats.congratsShown;
        if (isFirstCheckin) {
          navigate('/congrats');
          return;
        }
        if (isBeccaEnabled()) {
          const { system, messages } = buildAnalysisPrompt(outcome.stats, [outcome.checkin]);
          navigate('/app/chat', { state: { analysis: { system, messages } } });
        } else {
          setCheckinToast({
            type: 'saved',
            message: 'Check-in saved. You showed up today — that counts.',
          });
        }
      } else {
        setCheckinToast({
          type: 'backfill',
          message: `Day ${outcome.checkin.day} logged. Your journey grid is updated.`,
        });
      }
    },
    [updateStats, modal, navigate, isAuthenticated, stats.congratsShown]
  );

  const gridDays = useMemo(() => {
    const totalDays = 30;
    const days = [];
    for (let d = 1; d <= totalDays; d += 1) {
      const k = dayKey(d);
      const ci = stats.checkins[k];
      let status = 'future';
      if (ci) status = ci.result;
      else if (d < journeyDay) status = 'missed';
      else if (d === journeyDay) status = 'today';
      days.push({ d, status, ci });
    }
    return days;
  }, [stats.checkins, journeyDay]);

  return (
    <div className="dashboard">
      <div className="dash-hero">
        <div className="dash-badge">
          <RankDisc tone={badge.tone} size="lg" />
          <div>
            <div className="dash-title">{badge.name}</div>
            <div className="dash-level">{badge.level}</div>
          </div>
        </div>
        <button type="button" className="ri-badge" style={{ color: getRIColor(ri.ri) }} onClick={() => setRiOpen(true)}>
          <span className="ri-val">RI {ri.ri.toFixed(4)}</span>
          <span className="ri-lbl">Resilience index</span>
        </button>
      </div>

      <div className="flame-row">
        <span className="flame-num">{stats.streak}</span>
        <span className="flame-label">day streak</span>
      </div>

      {!hasTodayCheckin && !checkedInToday && (
        <button type="button" className="ci-btn" onClick={() => modal.openForDay()}>
          Check in today — Day {journeyDay}
        </button>
      )}
      {(hasTodayCheckin || checkedInToday) && (
        <div className="ci-done">Checked in for Day {journeyDay}</div>
      )}

      {checkinToast && (
        <div className={`checkin-toast checkin-toast-${checkinToast.type}`}>
          <p>{checkinToast.message}</p>
          {checkinToast.type === 'saved' && (
            <div className="checkin-toast-actions">
              <Link to="/app/emergency" className="toast-link">Need support now?</Link>
              <button type="button" className="toast-dismiss" onClick={() => setCheckinToast(null)}>Dismiss</button>
            </div>
          )}
          {checkinToast.type === 'backfill' && (
            <button type="button" className="toast-dismiss" onClick={() => setCheckinToast(null)}>Dismiss</button>
          )}
        </div>
      )}

      <div className="dash-tabs" role="tablist">
        {['overview', 'journey', 'progress', 'leaderboard', 'contact'].map((t) => (
          <button key={t} type="button" className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'overview' ? 'Overview' : t === 'journey' ? 'Journey' : t === 'progress' ? 'Progress' : t === 'leaderboard' ? 'Leaderboard' : 'Contact'}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="dash-panel">
          <div className="stat-grid">
            <div className="stat-box"><span className="stat-val">{stats.streak}</span><span className="stat-lbl">Streak</span></div>
            <div className="stat-box"><span className="stat-val">{stats.wins}</span><span className="stat-lbl">Wins</span></div>
            <div className="stat-box"><span className="stat-val">{journeyDay}</span><span className="stat-lbl">Days</span></div>
          </div>
          <div className="bar-card">
            <div className="bar-head"><span>Confidence</span><span>{conf}%</span></div>
            <div className="bar-track"><div className="bar-fill conf" style={{ width: `${conf}%` }} /></div>
          </div>
          <div className="bar-card">
            <div className="bar-head"><span>Rewiring</span><span>{rew}%</span></div>
            <div className="bar-track"><div className="bar-fill rew" style={{ width: `${rew}%` }} /></div>
          </div>
          <div className="ms-list">
            {MS.map((m) => (
              <div key={m.d} className={`ms-it ${stats.streak >= m.d ? 'done' : ''}`}>
                <span className="day-mark">{m.d}</span>
                <div><div className="ms-nm">{m.n}</div><div className="ms-ds">{m.t}</div></div>
                <span className="ms-state">{stats.streak >= m.d ? 'Reached' : 'Locked'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'journey' && (
        <div className="dash-panel">
          <p className="cal-title">Day {journeyDay} of 30</p>
          <div className="cal-grid">
            {gridDays.map(({ d, status }) => (
              <button
                key={d}
                type="button"
                className={`cal-dy ${status}`}
                disabled={status === 'future' || status === 'win' || status === 'loss'}
                onClick={() => modal.openForDay(d)}
                title={status === 'missed' ? `Fill Day ${d}` : undefined}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === 'progress' && (
        <div className="dash-panel">
          <h3 className="panel-title">Pattern insights</h3>
          <div className="pi-grid">
            <div className="pi-item"><span>Win rate</span><strong>{insights.winRate}</strong></div>
            <div className="pi-item"><span>Streak</span><strong>{insights.streak}</strong></div>
            <div className="pi-item"><span>Best</span><strong>{insights.best}</strong></div>
            <div className="pi-item"><span>Last relapse</span><strong>{insights.lastLoss}</strong></div>
            <div className="pi-item"><span>Last 7 days</span><strong>{insights.last7}</strong></div>
            <div className="pi-item"><span>Last 30 days</span><strong>{insights.last30}</strong></div>
            <div className="pi-item"><span>Trend</span><strong>{insights.trend}</strong></div>
          </div>
          <p className="pi-msg">{insights.message}</p>
          <div className="ri-breakdown">
            <h4>Resilience Index — {getRILabel(ri.ri)}</h4>
            <div className="ri-row"><span>Duration (D)</span><span>{ri.d.toFixed(4)}</span></div>
            <div className="ri-row"><span>Recovery (R)</span><span>{ri.r.toFixed(4)}</span></div>
            <div className="ri-row"><span>Comeback (C)</span><span>{ri.c.toFixed(4)}</span></div>
            <div className="ri-total" style={{ color: getRIColor(ri.ri) }}>RI {ri.ri.toFixed(4)}</div>
          </div>
        </div>
      )}

      {tab === 'leaderboard' && <LeaderboardPanel />}

      {tab === 'contact' && (
        <div className="dash-panel contact-panel">
          <p className="contact-label">Contact</p>
          <div className="contact-card">
            <div className="contact-title">Get in touch</div>
            <p className="contact-sub">Questions, feedback, or just want to say hi.<br />We would love to hear from you.</p>
            <a
              href={mailtoUrl()}
              className="contact-mail-btn"
              onClick={openSupportEmail}
            >
              Send us a message
            </a>
            <p className="contact-email-hint">{SUPPORT_EMAIL}</p>
          </div>
          <p className="contact-footer">ReClaim is built by real people who have been through this journey.<br />Your message matters to us.</p>
          <Link to="/learn" className="contact-wp-link">
            <div>
              <strong>How it works</strong>
              <p>Read the ReClaim whitepaper</p>
            </div>
            <span className="contact-arrow">›</span>
          </Link>
        </div>
      )}

      <RIBreakdown open={riOpen} ri={ri} onClose={() => setRiOpen(false)} />

      <CheckinModal
        open={modal.open}
        day={modal.day}
        stats={stats}
        onClose={modal.close}
        onSubmit={handleCheckinSubmit}
      />

      {milestone && (
        <div className="milestone-overlay show" role="dialog" aria-modal="true">
          <div className="milestone-card">
            <span className="day-mark lg">{milestone.d}</span>
            <h2>{milestone.t}</h2>
            <p>{milestone.s}</p>
            <button type="button" className="btn" onClick={() => setMilestone(null)}>Continue</button>
          </div>
        </div>
      )}
    </div>
  );
}
