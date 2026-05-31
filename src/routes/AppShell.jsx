import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useUserData } from '../hooks/useUser.jsx';
import { isBeccaEnabled } from '../lib/features.js';
import { PageLayout, Logo } from '../components/Layout.jsx';
import './AppShell.css';

export default function AppShell() {
  const { stats } = useUserData();
  const navigate = useNavigate();
  const beccaLive = isBeccaEnabled();

  return (
    <PageLayout>
      <div className="app-shell">
        <header className="app-header">
          <Logo />
          <span className="app-greeting">Hey, {stats.reclaimName || 'Champion'}</span>
        </header>
        <main className="app-main">
          <Outlet />
        </main>
        <nav className="app-nav" aria-label="Main">
          <NavLink to="/app/dashboard" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            Home
          </NavLink>
          <NavLink to="/app/chat" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            Becca
            {!beccaLive && <span className="nav-soon">Soon</span>}
          </NavLink>
          <NavLink to="/app/phases" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            Phases
          </NavLink>
          <NavLink to="/app/settings" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            Settings
          </NavLink>
        </nav>
        <button
          type="button"
          className="emergency-btn"
          aria-label="Urge toolkit — immediate help without chat"
          onClick={() => navigate('/app/emergency')}
        >
          🚨 Urge hitting now?
        </button>
      </div>
    </PageLayout>
  );
}
