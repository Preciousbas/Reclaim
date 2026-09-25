import { describe, expect, it } from 'vitest';
import { NAIRA_PER_USD, koboFromDollars } from '../../src/lib/pricing.js';
import { resolveCharge } from './paystack.js';

describe('resolveCharge', () => {
  it('charges $7 a month and $70 a year in naira kobo', () => {
    expect(NAIRA_PER_USD).toBe(1327);
    expect(resolveCharge('monthly').amount).toBe(koboFromDollars(7));
    expect(resolveCharge('yearly').amount).toBe(koboFromDollars(70));
    expect(resolveCharge('yearly').plan.interval).toBe('annually');
  });

  it('accepts the donation amounts and rejects anything else', () => {
    expect(resolveCharge('donation', 5).amount).toBe(koboFromDollars(5));
    expect(resolveCharge('donation', 25).amount).toBe(koboFromDollars(25));
    expect(() => resolveCharge('donation', 7)).toThrow(/Choose/);
    expect(() => resolveCharge('stripe')).toThrow(/Unknown checkout/);
  });
});
