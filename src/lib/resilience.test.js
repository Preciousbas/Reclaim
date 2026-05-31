import { describe, it, expect } from 'vitest';
import { calcRI, computePatternInsights, countComebacks } from './resilience.js';
import { submitCheckin, applyTodayStats } from '../features/checkin/logic.js';

describe('calcRI', () => {
  it('returns higher RI for longer streaks with good check-in rate', () => {
    const low = calcRI(7, 5, 4, 1, 1);
    const high = calcRI(60, 50, 40, 10, 8);
    expect(high.ri).toBeGreaterThan(low.ri);
  });

  it('caps RI at 1.0 scale (displayed as 0.xxxx)', () => {
    const result = calcRI(365, 300, 280, 20, 15);
    expect(result.ri).toBeLessThanOrEqual(1);
    expect(result.ri).toBeGreaterThan(0);
  });

  it('counts comebacks from checkin sequence', () => {
    const checkins = {
      'day-1': { result: 'loss' },
      'day-2': { result: 'win' },
      'day-3': { result: 'loss' },
      'day-4': { result: 'win' },
    };
    expect(countComebacks(checkins)).toBe(2);
  });
});

describe('computePatternInsights', () => {
  it('reads from checkins not journeyGrid', () => {
    const checkins = {
      'day-1': { day: 1, result: 'win' },
      'day-2': { day: 2, result: 'win' },
      'day-3': { day: 3, result: 'loss' },
      'day-4': { day: 4, result: 'win' },
      'day-5': { day: 5, result: 'win' },
    };
    const insights = computePatternInsights(checkins, { wins: 4, losses: 1, streak: 2, best: 2 }, 5);
    expect(insights.lastLoss).toBe('Day 3');
    expect(insights.last7).toMatch(/\d+W/);
  });
});

describe('check-in streak', () => {
  const baseStats = {
    streak: 5,
    wins: 10,
    losses: 2,
    best: 5,
    daysIn: 12,
    checkins: {},
  };

  it('increments streak on win for today', () => {
    const result = submitCheckin({
      stats: baseStats,
      checkins: {},
      day: 12,
      result: 'win',
      intensity: 'Moderate',
      mood: '😊',
      trigger: 'Late night phone',
      action: 'Put phone away',
      worked: 'Walk',
      startDate: new Date(),
      today: 12,
    });
    expect(result.stats.streak).toBe(6);
    expect(result.stats.wins).toBe(11);
    expect(result.stats.best).toBe(6);
  });

  it('resets streak on loss for today', () => {
    const result = submitCheckin({
      stats: baseStats,
      checkins: {},
      day: 12,
      result: 'loss',
      intensity: 'Strong',
      mood: '😔',
      trigger: 'Stress',
      action: 'Gave in',
      worked: '',
      startDate: new Date(),
      today: 12,
    });
    expect(result.stats.streak).toBe(0);
    expect(result.stats.losses).toBe(3);
  });

  it('does not change streak for backfill', () => {
    const result = submitCheckin({
      stats: baseStats,
      checkins: {},
      day: 8,
      result: 'loss',
      intensity: 'Mild',
      mood: '😐',
      trigger: 'Boredom',
      action: 'Resisted partially',
      worked: 'Left room',
      startDate: new Date(),
      today: 12,
    });
    expect(result.stats.streak).toBe(5);
    expect(result.isToday).toBe(false);
  });

  it('applyTodayStats matches submitCheckin win path', () => {
    const next = applyTodayStats(baseStats, 'win');
    expect(next.streak).toBe(6);
    expect(next.wins).toBe(11);
  });
});
