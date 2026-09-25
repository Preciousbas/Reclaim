import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  getJourneyDay,
  parseStartDate,
  repairStaleJourney,
  dayKey,
  todayISO,
} from './dates.js';

afterEach(() => {
  vi.useRealTimers();
});

describe('getJourneyDay', () => {
  it('is 1 when start date is today', () => {
    vi.setSystemTime(new Date(2026, 7, 17, 19, 0, 0));
    expect(getJourneyDay('2026-08-17')).toBe(1);
    expect(getJourneyDay(new Date(2026, 7, 17))).toBe(1);
  });

  it('counts calendar days from a YYYY-MM-DD stamp without UTC shift', () => {
    vi.setSystemTime(new Date(2026, 7, 17, 19, 0, 0));
    expect(getJourneyDay('2026-06-29')).toBe(50);
  });
});

describe('parseStartDate', () => {
  it('parses ISO dates as local midnight', () => {
    const d = parseStartDate('2026-08-17');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(7);
    expect(d.getDate()).toBe(17);
  });
});

describe('repairStaleJourney', () => {
  it('shifts a lone high-day check-in to day 1 and resets startDate', () => {
    vi.setSystemTime(new Date(2026, 7, 17, 19, 0, 0));
    const repaired = repairStaleJourney({
      startDate: '2026-06-29',
      reclaimName: 'Ada',
      wins: 1,
      losses: 0,
      streak: 1,
      checkins: {
        'day-50': { day: 50, result: 'win', trigger: 'late' },
      },
    });
    expect(repaired.startDate).toBe('2026-08-17');
    expect(repaired.checkins['day-1'].day).toBe(1);
    expect(repaired.checkins['day-50']).toBeUndefined();
    expect(getJourneyDay(repaired.startDate)).toBe(1);
  });

  it('does not shift a real journey that started on day 1', () => {
    vi.setSystemTime(new Date(2026, 7, 17, 19, 0, 0));
    const stats = {
      startDate: '2026-08-10',
      checkins: {
        'day-1': { day: 1, result: 'win' },
        'day-8': { day: 8, result: 'win' },
      },
    };
    expect(repairStaleJourney(stats).checkins['day-1']).toBeTruthy();
    expect(repairStaleJourney(stats).startDate).toBe('2026-08-10');
  });

  it('stamps today when a named profile has no startDate', () => {
    vi.setSystemTime(new Date(2026, 7, 17, 12, 0, 0));
    const repaired = repairStaleJourney({
      reclaimName: 'Ada',
      startDate: '',
      checkins: {},
    });
    expect(repaired.startDate).toBe(todayISO());
  });

  it('resets a named profile with no check-ins and a stale startDate', () => {
    vi.setSystemTime(new Date(2026, 7, 17, 19, 0, 0));
    const repaired = repairStaleJourney({
      reclaimName: 'Ada',
      startDate: '2026-06-29',
      wins: 0,
      losses: 0,
      checkins: {},
    });
    expect(repaired.startDate).toBe('2026-08-17');
    expect(getJourneyDay(repaired.startDate)).toBe(1);
  });
});

describe('dayKey', () => {
  it('prefixes day numbers', () => {
    expect(dayKey(1)).toBe('day-1');
  });
});
