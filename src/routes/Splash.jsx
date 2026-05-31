import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout, Logo } from '../components/Layout.jsx';
import './Splash.css';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => {}, 2400);
    return () => clearTimeout(t);
  }, []);

  return (
    <PageLayout>
      <div className="splash page-center">
        <div className="logo-wrap">
          <Logo size="lg" />
        </div>
        <div className="tagline-wrap">
          <p className="tagline">Take back control</p>
        </div>
        <button
          type="button"
          className="enter-wrap"
          onClick={() => navigate('/')}
          aria-label="Enter ReClaim"
        >
          <span className="enter-label">Enter</span>
          <span className="chevron" aria-hidden="true" />
        </button>
      </div>
    </PageLayout>
  );
}
