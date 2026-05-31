import { Link, useNavigate } from 'react-router-dom';
import { PageLayout, Logo } from '../components/Layout.jsx';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <PageLayout className="landing-page">
      <div className="landing-inner page-center">
        <Logo />
        <p className="hero-eyebrow">Recovery reimagined</p>
        <h1 className="hero-title">
          Take back
          <span className="highlight break">what was stolen</span>
        </h1>
        <p className="hero-sub">
          ReClaim is your private companion for breaking free — daily check-ins, pattern insights, and an urge toolkit when you need it most.
        </p>
        <div className="stats">
          <div className="stat">
            <span className="stat-num">90</span>
            <span className="stat-label">Day rewiring</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-num">24/7</span>
            <span className="stat-label">Urge toolkit</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-num">100%</span>
            <span className="stat-label">Private</span>
          </div>
        </div>
        <div className="cta-row">
          <button type="button" className="btn-primary" onClick={() => navigate('/signup')}>
            Get Started →
          </button>
          <Link to="/learn" className="btn-secondary">
            Read the science
          </Link>
        </div>
        <p className="bottom-msg">
          Already on your journey? <Link to="/signup">Log in</Link>
        </p>
      </div>
    </PageLayout>
  );
}
