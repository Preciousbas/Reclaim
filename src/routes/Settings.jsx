import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useUserData } from '../hooks/useUser.jsx';
import { computeRIFromStats, getRILabel, getRIColor } from '../lib/resilience.js';
import { useNotificationSchedule } from '../lib/observability.js';
import './Settings.css';

/**
 * Single settings surface — no duplicate triggers elsewhere in the app.
 */
export default function Settings() {
  const { stats, updateStats, exportData, joinLb } = useUserData();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [notifTime, setNotifTime] = useState(stats.notifTime || '20:00');

  useNotificationSchedule(stats.notifEnabled, notifTime, stats.reclaimName, stats.streak);

  const ri = computeRIFromStats({
    streak: stats.streak,
    wins: stats.wins,
    losses: stats.losses,
    checkins: stats.checkins,
  });

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to log out? Your local progress will be cleared.')) return;
    await logout();
    navigate('/signup');
  };

  const handleExport = () => {
    const blob = new Blob([exportData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reclaim-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleNotif = () => {
    const next = !stats.notifEnabled;
    updateStats({ notifEnabled: next });
    if (next && 'Notification' in window) {
      Notification.requestPermission();
    }
  };

  const saveNotifTime = (t) => {
    setNotifTime(t);
    updateStats({ notifTime: t });
  };

  return (
    <div className="settings-page">
      <h1 className="settings-title">Settings</h1>

      <section className="settings-section">
        <h2>Profile</h2>
        <div className="settings-row">
          <span>Name</span>
          <strong>{stats.reclaimName || '—'}</strong>
        </div>
        {isAuthenticated && user?.email && (
          <div className="settings-row">
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>
        )}
        <div className="settings-row">
          <span>Resilience Index</span>
          <strong style={{ color: getRIColor(ri.ri) }}>RI {ri.ri.toFixed(4)} — {getRILabel(ri.ri)}</strong>
        </div>
      </section>

      <section className="settings-section">
        <h2>Notifications</h2>
        <label className="toggle-row">
          <span>Daily check-in reminder</span>
          <input type="checkbox" checked={stats.notifEnabled} onChange={toggleNotif} />
        </label>
        {stats.notifEnabled && (
          <div className="form-group">
            <label htmlFor="notif-time">Reminder time</label>
            <input id="notif-time" type="time" value={notifTime} onChange={(e) => saveNotifTime(e.target.value)} />
          </div>
        )}
      </section>

      <section className="settings-section">
        <h2>Data</h2>
        <button type="button" className="settings-btn" onClick={handleExport}>Export my data (JSON)</button>
        {stats.lbJoined !== 'yes' && (
          <button type="button" className="settings-btn" onClick={() => joinLb()}>Join global leaderboard</button>
        )}
      </section>

      <section className="settings-section">
        <h2>Support</h2>
        <Link to="/app/payment" className="settings-link">Support ReClaim</Link>
        <Link to="/learn" className="settings-link">Read the science</Link>
        <Link to="/privacy" className="settings-link">Privacy policy</Link>
        <Link to="/terms" className="settings-link">Terms of use</Link>
      </section>

      <button type="button" className="logout-btn" onClick={handleLogout}>
        🚪 Log out
      </button>
    </div>
  );
}
