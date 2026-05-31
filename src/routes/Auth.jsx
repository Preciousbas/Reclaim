import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, useUserData } from '../hooks/useUser.jsx';
import { PageLayout, Logo } from '../components/Layout.jsx';
import { PublicOnly } from './AuthGuard.jsx';
import './Auth.css';

const AUTH_ERRORS = {
  'auth/email-already-in-use': 'This email is already registered. Try logging in.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect password. Try again.',
  'auth/invalid-credential': 'Email or password is incorrect.',
};

export default function Auth() {
  const [tab, setTab] = useState('signup');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [name, setNameInput] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [anonName, setAnonName] = useState('');
  const [showAnon, setShowAnon] = useState(false);

  const navigate = useNavigate();
  const { signUpEmail, signInEmail, signInGoogle, resetPassword } = useAuth();
  const { setName } = useUserData();

  const goNext = () => {
    navigate('/app/dashboard');
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) return setError('Please enter your name.');
    if (!email.trim()) return setError('Please enter your email.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== password2) return setError('Passwords do not match.');
    setLoading(true);
    try {
      await signUpEmail({ name: name.trim(), email: email.trim(), password });
      goNext();
    } catch (err) {
      setError(AUTH_ERRORS[err.code] || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) return setError('Please enter your email.');
    if (!password) return setError('Please enter your password.');
    setLoading(true);
    try {
      await signInEmail({ email: email.trim(), password });
      goNext();
    } catch (err) {
      setError(AUTH_ERRORS[err.code] || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await signInGoogle();
      goNext();
    } catch (err) {
      setError(err.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnon = (e) => {
    e.preventDefault();
    if (!anonName.trim()) return setError('Please enter a name or alias.');
    setName(anonName.trim(), true);
    navigate('/app/dashboard');
  };

  const handleReset = async () => {
    if (!email.trim()) {
      setError('Enter your email above first, then click reset.');
      return;
    }
    try {
      await resetPassword(email.trim());
      setError('');
      alert(`Password reset email sent to ${email}. Check your inbox.`);
    } catch (err) {
      setError(AUTH_ERRORS[err.code] || 'Could not send reset email.');
    }
  };

  if (showAnon) {
    return (
      <PublicOnly>
        <PageLayout>
          <div className="page-center">
            <div className="card auth-card">
              <span className="safe-badge"><span className="safe-dot" /> Anonymous mode</span>
              <h1 className="anon-heading">What should Becca <span className="warm-text">call you?</span></h1>
              <p className="name-sub">No account needed. Data stays on this device only.</p>
              <form onSubmit={handleAnon}>
                <input
                  className="big-input"
                  placeholder="Alias or first name"
                  value={anonName}
                  onChange={(e) => setAnonName(e.target.value)}
                  maxLength={24}
                />
                {error && <div className="error-banner">{error}</div>}
                <button type="submit" className="btn-name-warm">Continue anonymously →</button>
              </form>
              <p className="anon-switch">
                <button type="button" className="link-btn" onClick={() => setShowAnon(false)}>
                  ← Back to sign up
                </button>
              </p>
            </div>
          </div>
        </PageLayout>
      </PublicOnly>
    );
  }

  return (
    <PublicOnly>
      <PageLayout>
        <div className="page-center">
          <div className="card auth-card">
            <Logo />
            <div className="tabs" role="tablist">
              <button type="button" className={`tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => { setTab('signup'); setError(''); }}>Sign Up</button>
              <button type="button" className={`tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>Log In</button>
            </div>

            {tab === 'signup' ? (
              <form onSubmit={handleSignUp}>
                <div className="form-group">
                  <label htmlFor="su-name">Your name</label>
                  <input id="su-name" value={name} onChange={(e) => setNameInput(e.target.value)} placeholder="What should Becca call you?" />
                </div>
                <div className="form-group">
                  <label htmlFor="su-email">Email</label>
                  <input id="su-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
                </div>
                <div className="form-group">
                  <label htmlFor="pw1">Password</label>
                  <input id="pw1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" />
                </div>
                <div className="form-group">
                  <label htmlFor="pw2">Confirm password</label>
                  <input id="pw2" type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} />
                </div>
                {error && <div className="error-banner">{error}</div>}
                <button type="submit" className="btn" disabled={loading}>{loading ? 'Creating…' : 'Create My Account →'}</button>
              </form>
            ) : (
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label htmlFor="li-email">Email</label>
                  <input id="li-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="pw3">Password</label>
                  <input id="pw3" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                {error && <div className="error-banner">{error}</div>}
                <button type="submit" className="btn" disabled={loading}>{loading ? 'Logging in…' : 'Log In →'}</button>
                <button type="button" className="btn-ghost" onClick={handleReset}>Forgot password?</button>
              </form>
            )}

            <div className="divider"><span className="divider-line" /><span className="divider-text">or</span><span className="divider-line" /></div>
            <button type="button" className="btn-google" onClick={handleGoogle} disabled={loading}>
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
              Continue with Google
            </button>

            <p className="privacy-note">
              <button type="button" className="link-btn" onClick={() => setShowAnon(true)}>Continue anonymously</button>
              {' · '}
              <Link to="/privacy">Privacy</Link>
              {' · '}
              <Link to="/terms">Terms</Link>
            </p>
          </div>
        </div>
      </PageLayout>
    </PublicOnly>
  );
}

export function NameSetup() {
  const [name, setNameLocal] = useState('');
  const [error, setError] = useState('');
  const { setName } = useUserData();
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('Please enter your name.');
    setName(name.trim(), false);
    navigate('/app/dashboard');
  };

  return (
    <PublicOnly>
      <PageLayout>
        <div className="page-center">
          <div className="card auth-card">
            <h1 className="anon-heading">Welcome. What should Becca <span className="gold">call you?</span></h1>
            <p className="name-sub">This is how Becca and the leaderboard will know you.</p>
            <form onSubmit={submit}>
              <input className="big-input" value={name} onChange={(e) => setNameLocal(e.target.value)} placeholder="Your name" maxLength={24} />
              {error && <div className="error-banner">{error}</div>}
              <button type="submit" className="btn-name">Continue →</button>
            </form>
          </div>
        </div>
      </PageLayout>
    </PublicOnly>
  );
}
