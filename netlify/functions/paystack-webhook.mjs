import crypto from 'node:crypto';
import { json } from './paystack.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  const secret = process.env.PAYSTACK_SECRET_KEY;
  const signature = event.headers?.['x-paystack-signature'];
  if (!secret || !signature) {
    return json(401, { error: 'Invalid signature' });
  }

  const raw = event.isBase64Encoded
    ? Buffer.from(event.body || '', 'base64')
    : Buffer.from(event.body || '', 'utf8');
  const hash = crypto.createHmac('sha512', secret).update(raw).digest('hex');
  if (hash !== signature) {
    return json(401, { error: 'Invalid signature' });
  }

  return json(200, { received: true });
}
