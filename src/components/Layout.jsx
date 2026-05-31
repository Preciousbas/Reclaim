import { Link } from 'react-router-dom';

export function Logo({ size = 'sm' }) {
  return (
    <Link to="/" className={`logo-pill ${size}`} aria-label="ReClaim home">
      <span className="logo-re">Re</span>
      <span className="logo-claim">Claim</span>
    </Link>
  );
}

export function AppBackground() {
  return (
    <>
      <div className="app-bg" aria-hidden="true" />
      <div className="orb orb1" aria-hidden="true" />
      <div className="orb orb2" aria-hidden="true" />
    </>
  );
}

export function PageLayout({ children, className = '' }) {
  return (
    <div className={`page-shell ${className}`}>
      <AppBackground />
      {children}
    </div>
  );
}
