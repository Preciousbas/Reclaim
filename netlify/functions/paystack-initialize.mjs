import { ensurePlan, isEmail, json, paystack, readJson, resolveCharge, siteOrigin, CURRENCY } from './paystack.js';

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;
const rateMap = new Map();

function clientIp(event) {
  return event.headers?.['x-forwarded-for']?.split(',')[0]?.trim()
    || event.headers?.['client-ip']
    || 'unknown';
}

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateMap.get(ip) || { count: 0, reset: now + WINDOW_MS };
  if (now > entry.reset) {
    entry.count = 0;
    entry.reset = now + WINDOW_MS;
  }
  entry.count += 1;
  rateMap.set(ip, entry);
  return entry.count > MAX_REQUESTS;
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }
  if (isRateLimited(clientIp(event))) {
    return json(429, { error: 'Too many checkout attempts. Try again shortly.' });
  }

  try {
    const body = readJson(event);
    const email = String(body.email || '').trim();
    if (!isEmail(email)) {
      return json(400, { error: 'Enter an email so Paystack can send the receipt.' });
    }

    const charge = resolveCharge(body.kind, body.amount);
    const origin = siteOrigin(event);
    if (!origin) {
      return json(400, { error: 'Missing site origin.' });
    }

    const payload = {
      email,
      amount: charge.amount,
      currency: CURRENCY,
      callback_url: `${origin}/app/payment`,
      metadata: { kind: charge.kind },
    };
    if (charge.plan) {
      payload.plan = await ensurePlan(charge.plan);
    }

    const started = await paystack('/transaction/initialize', { method: 'POST', body: payload });
    return json(200, {
      authorization_url: started.data.authorization_url,
      reference: started.data.reference,
    });
  } catch (err) {
    return json(err.statusCode || 500, { error: err.message || 'Could not start checkout' });
  }
}
