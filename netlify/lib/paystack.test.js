import { describe, expect, it } from 'vitest';
import { centsFromDollars } from '../../src/lib/pricing.js';
import { CURRENCY, resolveCharge } from './paystack.js';

describe('resolveCharge', () => {
  it('charges $7 a month and $70 a year in US cents', () => {
    expect(CURRENCY).toBe('USD');
    expect(resolveCharge('monthly').amount).toBe(centsFromDollars(7));
    expect(resolveCharge('yearly').amount).toBe(7000);
    expect(resolveCharge('yearly').plan.interval).toBe('annually');
  });

  it('rejects unknown checkouts', () => {
    expect(() => resolveCharge('donation')).toThrow(/Unknown checkout/);
  });
});
