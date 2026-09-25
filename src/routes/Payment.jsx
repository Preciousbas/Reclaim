import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { WHITEPAPER } from '../content/whitepaper.js';
import { useAuth } from '../hooks/useUser.jsx';
import { startCheckout, verifyPayment } from '../lib/paystack.js';
import { NAIRA_PER_USD, formatNaira, nairaFromDollars } from '../lib/pricing.js';
import './Payment.css';

const PAYMENTS_ENABLED = import.meta.env.VITE_PAYMENTS_ENABLED === 'true';
const tiers = WHITEPAPER.sections.find((s) => s.id === 'membership')?.tiers || [];
const DONATIONS = [5, 10, 25];

export default function Payment() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const [email, setEmail] = useState(user?.email || '');
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user?.email]);

  useEffect(() => {
    const reference = params.get('reference') || params.get('trxref');
    if (!reference || !PAYMENTS_ENABLED) return undefined;
    let cancelled = false;
    verifyPayment(reference)
      .then((result) => {
        if (cancelled) return;
        setNotice(result.ok
          ? { tone: 'ok', text: 'Payment received. Thank you for keeping ReClaim available.' }
          : { tone: 'err', text: 'Payment was not completed. You can try again whenever you are ready.' });
      })
      .catch((err) => {
        if (!cancelled) setNotice({ tone: 'err', text: err.message });
      });
    return () => { cancelled = true; };
  }, [params]);

  async function checkout(kind, amount) {
    if (!PAYMENTS_ENABLED) {
      setNotice({ tone: 'err', text: 'Payments are not enabled yet.' });
      return;
    }
    const receiptEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(receiptEmail)) {
      setNotice({ tone: 'err', text: 'Enter an email so Paystack can send the receipt.' });
      return;
    }
    setBusy(kind === 'donation' ? `donation-${amount}` : kind);
    setNotice(null);
    try {
      await startCheckout({ kind, amount, email: receiptEmail });
    } catch (err) {
      setNotice({ tone: 'err', text: err.message });
      setBusy('');
    }
  }

  return (
    <div className="payment-page">
      <h1>Membership & Support</h1>
      <p className="payment-sub">
        Core recovery tools are always free. Supporter membership keeps ReClaim running and unlocks the full Becca experience.
      </p>

      {notice && (
        <p className={`pay-status pay-status-${notice.tone}`} role="status">{notice.text}</p>
      )}

      <div className="tier-grid">
        {tiers.map((tier) => (
          <div key={tier.name} className={`tier-card ${tier.name.includes('Supporter') ? 'tier-supporter' : 'tier-free'}`}>
            <h2>{tier.name}</h2>
            <div className="tier-price">{tier.price}</div>
            {tier.features.length > 0 && (
              <>
                <h3>Includes</h3>
                <ul>
                  {tier.features.map((f) => <li key={f}>{f}</li>)}
                </ul>
              </>
            )}
            {tier.limitations.length > 0 && (
              <>
                <h3>Limitations</h3>
                <ul className="tier-limits">
                  {tier.limitations.map((l) => <li key={l}>{l}</li>)}
                </ul>
              </>
            )}
            {tier.name.includes('Supporter') && (
              <div className="plan-actions">
                <p className="plan-note">
                  Yearly is the monthly rate for ten months. Checkout is in naira at {formatNaira(NAIRA_PER_USD)} per dollar.
                </p>
                <button
                  type="button"
                  className="btn tier-cta"
                  disabled={Boolean(busy)}
                  onClick={() => checkout('yearly')}
                >
                  {busy === 'yearly' ? 'Opening Paystack…' : `Pay ${formatNaira(nairaFromDollars(70))} / year`}
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  disabled={Boolean(busy)}
                  onClick={() => checkout('monthly')}
                >
                  {busy === 'monthly' ? 'Opening Paystack…' : `Pay ${formatNaira(nairaFromDollars(7))} / month`}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <label htmlFor="pay-email">Receipt email</label>
      <input
        id="pay-email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
      />

      <h2 className="donate-title">Voluntary donation</h2>
      <p className="payment-sub">
        Every amount keeps ReClaim available for someone who needs it. Charged in naira at {formatNaira(NAIRA_PER_USD)} per dollar.
      </p>

      <div className="amount-grid">
        {DONATIONS.map((amt) => (
          <button
            key={amt}
            type="button"
            className="amount-opt"
            disabled={Boolean(busy)}
            onClick={() => checkout('donation', amt)}
          >
            {busy === `donation-${amt}` ? '…' : `$${amt}`}
          </button>
        ))}
      </div>

      <Link to="/learn#membership" className="back-link">Read full membership details</Link>
      <Link to="/app/settings" className="back-link">Back to settings</Link>
    </div>
  );
}
