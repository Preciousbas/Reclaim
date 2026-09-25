import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useUserData } from '../hooks/useUser.jsx';
import { computeRIFromStats, getRILabel, getRIColor } from '../lib/resilience.js';
import { useNotificationSchedule } from '../lib/observability.js';
import { downloadExportReport, printExportReport } from '../lib/exportReport.js';
import { mailtoUrl, openSupportEmail } from '../lib/support.js';
import './Settings.css';
function SettingsModal({ title, children, onClose }) {
  return (
    <div className="settings-modal-overlay" onClick={onClose} role="presentation">
      <div className="settings-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  );
}

export default function Settings() {
  const { stats, updateStats, joinLb, setName } = useUserData();
  const { user, isAuthenticated, logout, changeEmail, changePassword } = useAuth();
  const navigate = useNavigate();
  const [notifTime, setNotifTime] = useState(stats.notifTime || '20:00');
  const [modal, setModal] = useState(null);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [nameInput, setNameInput] = useState(stats.reclaimName || '');
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const isGoogleOnly = user?.providerData?.length === 1 && user.providerData[0].providerId === 'google.com';

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
    downloadExportReport(stats, user?.email);
  };

  const handlePrintReport = () => {
    printExportReport(stats, user?.email);
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

  const submitName = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return setFormError('Please enter a name.');
    setName(nameInput.trim(), !isAuthenticated);
    setModal(null);
    setFormError('');
  };

  const submitEmail = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!newEmail.trim()) return setFormError('Enter a new email.');
    if (!currentPassword) return setFormError('Enter your current password.');
    setFormLoading(true);
    try {
      await changeEmail(newEmail.trim(), currentPassword);
      setModal(null);
      alert('Check your new inbox — Firebase sent a verification link. Your email updates after you confirm it.');
    } catch (err) {
      setFormError(err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential'
        ? 'Incorrect password.'
        : err.code === 'auth/requires-recent-login'
          ? 'Please log out and log back in, then try again.'
          : 'Could not update email. Check the address and try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!currentPassword) return setFormError('Enter your current password.');
    if (newPassword.length < 6) return setFormError('New password must be at least 6 characters.');
    if (newPassword !== confirmPassword) return setFormError('Passwords do not match.');
    setFormLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setModal(null);
      alert('Password updated successfully.');
    } catch (err) {
      setFormError(err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential'
        ? 'Incorrect current password.'
        : 'Could not update password.');
    } finally {
      setFormLoading(false);
    }
  };

  const openModal = (type) => {
    setFormError('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setNameInput(stats.reclaimName || '');
    setNewEmail(user?.email || '');
    setModal(type);
  };

  return (
    <div className="settings-page">
      <h1 className="settings-title">Settings</h1>

      <section className="settings-section">
        <h2>Account</h2>
        <button type="button" className="settings-row-btn" onClick={() => openModal('name')}>
          <div><span>Display name</span><strong>{stats.reclaimName || '—'}</strong></div>
          <span className="settings-chevron">›</span>
        </button>
        {isAuthenticated && !isGoogleOnly && (
          <>
            <button type="button" className="settings-row-btn" onClick={() => openModal('email')}>
              <div><span>Change email</span><strong>{user?.email || '—'}</strong></div>
              <span className="settings-chevron">›</span>
            </button>
            <button type="button" className="settings-row-btn" onClick={() => openModal('password')}>
              <div><span>Change password</span><strong>Update your password</strong></div>
              <span className="settings-chevron">›</span>
            </button>
          </>
        )}
        {isGoogleOnly && (
          <p className="settings-note">Signed in with Google — email and password are managed by Google.</p>
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
        <button type="button" className="settings-btn" onClick={handlePrintReport}>Export as PDF (print)</button>
        <button type="button" className="settings-btn" onClick={handleExport}>Download readable report</button>
        {stats.lbJoined !== 'yes' && (
          <button type="button" className="settings-btn" onClick={() => joinLb()}>Join global leaderboard</button>
        )}
      </section>

      <section className="settings-section">
        <h2>Support</h2>
        <a href={mailtoUrl()} className="settings-link" onClick={openSupportEmail}>Contact us</a>
        <Link to="/app/payment" className="settings-link">Membership & support</Link>
        <Link to="/learn" className="settings-link">Whitepaper, terms & privacy</Link>
      </section>

      <button type="button" className="logout-btn" onClick={handleLogout}>
        Log out
      </button>

      {modal === 'name' && (
        <SettingsModal title="Display name" onClose={() => setModal(null)}>
          <form onSubmit={submitName}>
            <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="Your name" maxLength={30} />
            {formError && <p className="settings-form-error">{formError}</p>}
            <button type="submit" className="btn">Save</button>
          </form>
        </SettingsModal>
      )}

      {modal === 'email' && (
        <SettingsModal title="Change email" onClose={() => setModal(null)}>
          <form onSubmit={submitEmail}>
            <div className="form-group">
              <label htmlFor="new-email">New email</label>
              <input id="new-email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="email-pw">Current password</label>
              <input id="email-pw" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            {formError && <p className="settings-form-error">{formError}</p>}
            <button type="submit" className="btn" disabled={formLoading}>{formLoading ? 'Saving…' : 'Update email'}</button>
          </form>
        </SettingsModal>
      )}

      {modal === 'password' && (
        <SettingsModal title="Change password" onClose={() => setModal(null)}>
          <form onSubmit={submitPassword}>
            <div className="form-group">
              <label htmlFor="cur-pw">Current password</label>
              <input id="cur-pw" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="new-pw">New password</label>
              <input id="new-pw" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="confirm-pw">Confirm new password</label>
              <input id="confirm-pw" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            {formError && <p className="settings-form-error">{formError}</p>}
            <button type="submit" className="btn" disabled={formLoading}>{formLoading ? 'Saving…' : 'Update password'}</button>
          </form>
        </SettingsModal>
      )}
    </div>
  );
}
