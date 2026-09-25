import { json, paystack } from '../lib/paystack.js';

export async function handler(event) {
  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'Method not allowed' });
  }

  const reference = event.queryStringParameters?.reference || event.queryStringParameters?.trxref;
  if (!reference || !/^[\w-]{6,100}$/.test(reference)) {
    return json(400, { error: 'Missing payment reference.' });
  }

  try {
    const result = await paystack(`/transaction/verify/${encodeURIComponent(reference)}`);
    const data = result.data || {};
    return json(200, {
      ok: data.status === 'success',
      status: data.status || 'unknown',
      kind: data.metadata?.kind || '',
      amount: data.amount ?? null,
      currency: data.currency || '',
    });
  } catch (err) {
    return json(err.statusCode || 500, { error: err.message || 'Could not confirm payment' });
  }
}
