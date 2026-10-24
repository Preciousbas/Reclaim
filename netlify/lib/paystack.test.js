import { describe, expect, it } from 'vitest';
import { NAIRA_PER_USD, koboFromDollars } from '../../src/lib/pricing.js';
import { CURRENCY, resolveCharge } from './paystack.js';

describe('resolveCharge', () => {
  it('charges $7 a month and $70 a year in naira kobo', () => {
    expect(CURRENCY).toBe('NGN');
    expect(NAIRA_PER_USD).toBe(1327);
    expect(resolveCharge('monthly').amount).toBe(koboFromDollars(7));
    expect(resolveCharge('yearly').amount).toBe(koboFromDollars(70));
    expect(resolveCharge('yearly').plan.interval).toBe('annually');
  });

  it('rejects unknown checkouts', () => {
    expect(() => resolveCharge('donation')).toThrow(/Unknown checkout/);
  });
});
