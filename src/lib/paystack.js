const API_BASE = import.meta.env.VITE_API_BASE ?? '';

function endpoint(path) {
  return `${API_BASE.replace(/\/$/, '')}${path}`;
}

export async function startCheckout({ kind, amount, email }) {
  const res = await fetch(endpoint('/api/paystack/initialize'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind, amount, email }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.authorization_url) {
    throw new Error(data.error || 'Could not start checkout');
  }
  window.location.assign(data.authorization_url);
}

export async function verifyPayment(reference) {
  const res = await fetch(endpoint(`/api/paystack/verify?reference=${encodeURIComponent(reference)}`));
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Could not confirm payment');
  }
  return data;
}
