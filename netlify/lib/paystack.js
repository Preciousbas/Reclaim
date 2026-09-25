import { DONATION_DOLLARS, PRICES, koboFromDollars } from '../../src/lib/pricing.js';

export const CURRENCY = 'NGN';

export const PLANS = {
  monthly: {
    name: PRICES.monthly.name,
    interval: PRICES.monthly.interval,
    amount: koboFromDollars(PRICES.monthly.dollars),
  },
  yearly: {
    name: PRICES.yearly.name,
    interval: PRICES.yearly.interval,
    amount: koboFromDollars(PRICES.yearly.dollars),
  },
};

const DONATION_AMOUNTS = new Set(DONATION_DOLLARS);

export function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

export function readJson(event, maxBytes = 4096) {
  if (!event.body) return {};
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf8')
    : event.body;
  if (raw.length > maxBytes) {
    const err = new Error('Request too large');
    err.statusCode = 413;
    throw err;
  }
  try {
    return JSON.parse(raw);
  } catch {
    const err = new Error('Invalid JSON');
    err.statusCode = 400;
    throw err;
  }
}

export function isEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function siteOrigin(event) {
  const raw = event.headers?.origin || event.headers?.referer || '';
  if (raw) {
    try {
      return new URL(raw).origin;
    } catch {
      /* ignore malformed origin */
    }
  }
  const host = event.headers?.['x-forwarded-host'] || event.headers?.host;
  if (!host) return '';
  const proto = event.headers?.['x-forwarded-proto'] || 'https';
  return `${proto}://${host}`;
}

export function resolveCharge(kind, donationDollars) {
  if (kind === 'monthly' || kind === 'yearly') {
    return { kind, amount: PLANS[kind].amount, plan: PLANS[kind] };
  }
  if (kind === 'donation') {
    const dollars = Number(donationDollars);
    if (!DONATION_AMOUNTS.has(dollars)) {
      const err = new Error('Choose $5, $10, or $25.');
      err.statusCode = 400;
      throw err;
    }
    return { kind, amount: koboFromDollars(dollars), plan: null };
  }
  const err = new Error('Unknown checkout.');
  err.statusCode = 400;
  throw err;
}

export async function paystack(path, { method = 'GET', body } = {}) {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    const err = new Error('PAYSTACK_SECRET_KEY is not set');
    err.statusCode = 500;
    throw err;
  }
  const res = await fetch(`https://api.paystack.co${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.status === false) {
    const err = new Error(data.message || 'Paystack request failed');
    err.statusCode = res.status >= 400 && res.status < 500 ? 400 : 502;
    throw err;
  }
  return data;
}

export async function ensurePlan(plan) {
  const listed = await paystack('/plan?perPage=100');
  const found = (listed.data || []).find((row) => (
    row.name === plan.name
    && row.interval === plan.interval
    && Number(row.amount) === plan.amount
    && String(row.currency || '').toUpperCase() === CURRENCY
  ));
  if (found?.plan_code) return found.plan_code;

  const created = await paystack('/plan', {
    method: 'POST',
    body: {
      name: plan.name,
      interval: plan.interval,
      amount: plan.amount,
      currency: CURRENCY,
    },
  });
  return created.data.plan_code;
}
