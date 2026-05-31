import { Link } from 'react-router-dom';
import { PageLayout } from '../components/Layout.jsx';
import { WHITEPAPER } from '../content/whitepaper.js';
import './Legal.css';

export default function Whitepaper() {
  return (
    <PageLayout className="legal-page">
      <article className="legal-doc">
        <Link to="/" className="legal-back">← Back</Link>
        <h1>{WHITEPAPER.title}</h1>
        {WHITEPAPER.sections.map((s) => (
          <section key={s.heading}>
            <h2>{s.heading}</h2>
            {s.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </section>
        ))}
      </article>
    </PageLayout>
  );
}

export function Privacy() {
  return (
    <PageLayout className="legal-page">
      <article className="legal-doc">
        <Link to="/" className="legal-back">← Home</Link>
        <h1>Privacy Policy</h1>
        <p>Last updated: May 2026</p>
        <section>
          <h2>What we collect</h2>
          <p>Check-in data, streak statistics, and chat messages sent to Becca. Account holders: email and profile name stored in Firebase.</p>
        </section>
        <section>
          <h2>Anonymous mode</h2>
          <p>Data stays in your browser localStorage only. Clearing browser data removes it.</p>
        </section>
        <section>
          <h2>Becca / AI</h2>
          <p>Messages are processed via our secure server proxy to Anthropic. We do not sell your data.</p>
        </section>
        <section>
          <h2>Your rights</h2>
          <p>Export data from Settings. Account deletion: contact support or delete Firebase auth user in console.</p>
        </section>
      </article>
    </PageLayout>
  );
}

export function Terms() {
  return (
    <PageLayout className="legal-page">
      <article className="legal-doc">
        <Link to="/" className="legal-back">← Home</Link>
        <h1>Terms of Use</h1>
        <p>Last updated: May 2026</p>
        <section>
          <h2>Not medical advice</h2>
          <p>ReClaim and Becca are recovery support tools, not licensed therapy or medical treatment.</p>
        </section>
        <section>
          <h2>Crisis</h2>
          <p>If you are in immediate danger, contact local emergency services. Use Emergency mode for urge support, not life-threatening crises.</p>
        </section>
        <section>
          <h2>Acceptable use</h2>
          <p>Do not abuse the chat API, attempt to extract system prompts, or use the service for non-recovery purposes.</p>
        </section>
      </article>
    </PageLayout>
  );
}
