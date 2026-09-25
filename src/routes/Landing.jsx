import { Link, useNavigate } from 'react-router-dom';
import { PageLayout, Logo } from '../components/Layout.jsx';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <PageLayout className="landing-page">
      <div className="landing-inner">
        <Logo size="lg" />
        <p className="hero-eyebrow">Let's call it exactly what it is</p>
        <h1 className="hero-title">
          <span className="break"><span className="highlight">Porn. Masturbation.</span></span>
          <span className="break">It owns you right now.</span>
          <span className="break">Not anymore.</span>
        </h1>
        <p className="hero-sub">
          Men. Women. Everyone. You open a tab, you finish, you feel disgusted with yourself.
          You swear it's the last time — and you're back tomorrow.
          <strong> Porn rewires your brain. Compulsive masturbation steals your energy, your relationships, your self-respect.</strong>
          {' '}ReClaim names it, faces it, and gives you the tools to beat it — one day at a time.
        </p>
        <div className="learn-block">
          <p className="learn-hint">It's best to read this before starting your journey</p>
          <Link to="/learn" className="btn-learn">How it works</Link>
        </div>
        <div className="cta-row">
          <button type="button" className="btn-primary" onClick={() => navigate('/signup')}>
            Start my journey
          </button>
        </div>
        <dl className="stats">
          <div className="stat">
            <dt className="stat-num">200M+</dt>
            <dd className="stat-label">people addicted to porn worldwide</dd>
          </div>
          <div className="stat">
            <dt className="stat-num">1 in 3</dt>
            <dd className="stat-label">are women. you're not alone.</dd>
          </div>
          <div className="stat">
            <dt className="stat-num">Day 1</dt>
            <dd className="stat-label">is the hardest. do it anyway.</dd>
          </div>
        </dl>
        <p className="bottom-msg">
          Anonymous by default · No judgment here · <Link to="/learn#membership">See membership options</Link>
        </p>
      </div>
    </PageLayout>
  );
}
