import { Link } from 'react-router-dom';
import './BeccaComingSoon.css';

export default function BeccaComingSoon() {
  return (
    <div className="becca-soon">
      <div className="becca-soon-glow" aria-hidden="true" />
      <span className="becca-soon-badge">Coming soon</span>
      <div className="becca-soon-avatar" aria-hidden="true">💜</div>
      <h1>Meet Becca</h1>
      <p className="becca-soon-lead">
        Your personal recovery companion — warm, specific, and built around your check-ins. She is on her way.
      </p>

      <ul className="becca-soon-list">
        <li>Personalised analysis after every check-in</li>
        <li>Trigger-specific protocols, not generic advice</li>
        <li>24/7 chat when urges hit hardest</li>
      </ul>

      <p className="becca-soon-note">
        Right now you have check-ins, streaks, pattern insights, and the urge toolkit below — everything you need to keep going.
      </p>

      <Link to="/app/emergency" className="btn becca-soon-emergency">
        🚨 Need help right now? Open urge toolkit
      </Link>
      <Link to="/app/dashboard" className="btn-ghost becca-soon-back">
        ← Back to dashboard
      </Link>
    </div>
  );
}
