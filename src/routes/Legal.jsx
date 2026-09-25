import { useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { PageLayout, Logo } from '../components/Layout.jsx';
import { WHITEPAPER } from '../content/whitepaper.js';
import './Legal.css';

export default function Whitepaper() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace('#', '');
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.hash]);

  return (
    <PageLayout className="wp-page" atmosphere="quiet">
      <article className="wp-body">
        <div className="wp-top">
          <Logo />
          <Link to="/landing" className="wp-back">Back</Link>
        </div>
        {WHITEPAPER.sections.map((s) => (
          <section key={s.id} id={s.id} className="wp-section">
            <h2>{s.heading}</h2>
            {s.paragraphs?.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {s.tiers && (
              <div className="tier-grid">
                {s.tiers.map((tier) => (
                  <div key={tier.name} className={`tier-card ${tier.name.includes('Supporter') ? 'tier-supporter' : 'tier-free'}`}>
                    <h3>{tier.name}</h3>
                    <div className="tier-price">{tier.price}</div>
                    {tier.features.length > 0 && (
                      <>
                        <h4>Includes</h4>
                        <ul>
                          {tier.features.map((f) => <li key={f}>{f}</li>)}
                        </ul>
                      </>
                    )}
                    {tier.limitations.length > 0 && (
                      <>
                        <h4>Limitations</h4>
                        <ul className="tier-limits">
                          {tier.limitations.map((l) => <li key={l}>{l}</li>)}
                        </ul>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
        <div className="wp-footer-card">
          <div className="wp-footer-logo">
            <span className="wp-logo-re">Re</span>
            <span className="wp-logo-claim">Claim</span>
          </div>
          <p>A M. Peters Group Initiative</p>
          <p className="wp-footer-tag">Take back control of your sexuality</p>
        </div>
      </article>
    </PageLayout>
  );
}

export function Privacy() {
  return <Navigate to="/learn#terms" replace />;
}

export function Terms() {
  return <Navigate to="/learn#terms" replace />;
}
