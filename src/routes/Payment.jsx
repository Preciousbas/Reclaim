import { Link } from 'react-router-dom';
import './Payment.css';

const PAYMENTS_ENABLED = import.meta.env.VITE_PAYMENTS_ENABLED === 'true';

export default function Payment() {
  const handlePay = (method) => {
    if (!PAYMENTS_ENABLED) {
      alert('Payments are not enabled yet. Set VITE_PAYMENTS_ENABLED=true and configure Stripe/PayPal in Netlify when ready.');
      return;
    }
    alert(`${method} checkout would open here. Configure Stripe or PayPal SDK with server-side keys.`);
  };

  return (
    <div className="payment-page">
      <h1>Support ReClaim</h1>
      <p className="payment-sub">
        ReClaim is free. If it has helped you, consider supporting development so Becca and check-ins stay available for others.
      </p>

      <div className="amount-grid">
        {[5, 10, 25].map((amt) => (
          <button key={amt} type="button" className="amount-opt" onClick={() => handlePay(`$${amt}`)}>
            ${amt}
          </button>
        ))}
      </div>

      <button type="button" className="btn" onClick={() => handlePay('Stripe')}>
        {PAYMENTS_ENABLED ? 'Pay with Stripe' : 'Stripe (coming soon)'}
      </button>
      <button type="button" className="btn-ghost" onClick={() => handlePay('PayPal')}>
        {PAYMENTS_ENABLED ? 'Pay with PayPal' : 'PayPal (coming soon)'}
      </button>

      <Link to="/app/settings" className="back-link">← Back to settings</Link>
    </div>
  );
}
