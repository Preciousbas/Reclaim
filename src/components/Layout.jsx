import { Link } from 'react-router-dom';
import StarsBackground from './StarsBackground.jsx';
import ConfettiCanvas from './Confetti.jsx';

export function Logo({ size = 'sm' }) {
  return (
    <Link to="/" className={`logo-pill ${size}`} aria-label="ReClaim home">
      <span className="logo-re">Re</span>
      <span className="logo-claim">Claim</span>
    </Link>
  );
}

export function RankDisc({ tone = 'begin', size = 'sm' }) {
  return <span className={`rank-disc ${size === 'lg' ? 'lg' : ''} tone-${tone}`} aria-hidden="true" />;
}

export function AppBackground({ atmosphere = 'full' }) {
  return (
    <>
      <div className="app-bg" aria-hidden="true" />
      {atmosphere === 'full' && <StarsBackground />}
      {atmosphere === 'full' && (
        <>
          <div className="orb orb1" aria-hidden="true" />
          <div className="orb orb2" aria-hidden="true" />
          <div className="orb orb3" aria-hidden="true" />
        </>
      )}
      {atmosphere === 'quiet' && <div className="orb orb-quiet" aria-hidden="true" />}
      <ConfettiCanvas />
    </>
  );
}

export function PageLayout({ children, className = '', atmosphere = 'full' }) {
  return (
    <div className={`page-shell atmosphere-${atmosphere} ${className}`}>
      <AppBackground atmosphere={atmosphere} />
      <div className="page-content">{children}</div>
    </div>
  );
}
