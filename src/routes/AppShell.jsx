import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useUserData } from '../hooks/useUser.jsx';
import { isBeccaEnabled } from '../lib/features.js';
import { getString, setItem, STORAGE_KEYS } from '../lib/storage.js';
import { PageLayout, Logo } from '../components/Layout.jsx';
import './AppShell.css';

const NAV = [
  { to: '/app/dashboard', label: 'Home', mark: 'H' },
  { to: '/app/chat', label: 'Becca', mark: 'B', soon: true },
  { to: '/app/phases', label: 'Phases', mark: 'P' },
  { to: '/app/settings', label: 'Settings', mark: 'S' },
];

export default function AppShell() {
  const { stats } = useUserData();
  const navigate = useNavigate();
  const beccaLive = isBeccaEnabled();
  const [collapsed, setCollapsed] = useState(
    () => getString(STORAGE_KEYS.RAIL_COLLAPSED) === 'yes'
  );

  const toggleRail = () => {
    setCollapsed((prev) => {
      const next = !prev;
      setItem(STORAGE_KEYS.RAIL_COLLAPSED, next ? 'yes' : 'no');
      return next;
    });
  };

  return (
    <PageLayout atmosphere="quiet">
      <div className={`app-shell${collapsed ? ' is-rail-collapsed' : ''}`}>
        <aside className="app-rail">
          <header className="app-header">
            <Logo />
            <span className="app-greeting">{stats.reclaimName || 'Welcome back'}</span>
            <button
              type="button"
              className="rail-toggle"
              aria-expanded={!collapsed}
              aria-controls="app-nav"
              aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
              onClick={toggleRail}
            >
              {collapsed ? '›' : '‹'}
            </button>
          </header>
          <nav className="app-nav" id="app-nav" aria-label="Main">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                title={item.label}
                className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
              >
                <span className="nav-mark" aria-hidden="true">{item.mark}</span>
                <span className="nav-label">{item.label}</span>
                {item.soon && !beccaLive && <span className="nav-soon">Soon</span>}
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            className="emergency-btn"
            aria-label="Urge toolkit — immediate help without chat"
            title="Need help now"
            onClick={() => navigate('/app/emergency')}
          >
            <span className="emergency-full">Need help now</span>
            <span className="emergency-short">Help</span>
          </button>
        </aside>
        <main className="app-main">
          <div className="app-main-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </PageLayout>
  );
}
