import { useNavigate } from 'react-router-dom';
import { PageLayout, Logo } from '../components/Layout.jsx';
import { useUserData } from '../hooks/useUser.jsx';
import './Congrats.css';

export default function Congrats() {
  const navigate = useNavigate();
  const { stats, updateStats } = useUserData();
  const name = stats.reclaimName;

  const continueJourney = () => {
    updateStats({ congratsShown: true });
    navigate('/app/dashboard');
  };

  return (
    <PageLayout>
      <div className="congrats page-center">
        <Logo />
        <div className="congrats-badge">You're already ahead of 73% of users</div>
        <h1 className="congrats-title">
          You just did something
          <br />
          <span className="congrats-gold">most people can't.</span>
        </h1>
        <p className="congrats-body">
          {name && <><strong className="congrats-name">{name}</strong> — </>}
          you didn't hide behind a screen name.
          You put your real self on the line. That alone separates you from the crowd.
        </p>
        <p className="congrats-body">
          Most people who battle porn and compulsive masturbation never admit it —
          not to a friend, not to themselves, not to anyone.
          You just owned it. Publicly. Fully.
          <strong> That single act of courage puts you ahead of 73% of people who walk through these doors and choose to hide.</strong>
        </p>
        <p className="congrats-body congrats-italic">
          The hardest step was never quitting. It was being honest enough to begin.
          You just did that.
        </p>
        <button type="button" className="btn-congrats" onClick={continueJourney}>
          Begin my journey
        </button>
      </div>
    </PageLayout>
  );
}
