import { dayKey, journeyDayToDate, getJourneyDay } from '../../lib/dates.js';

export function validateCheckinForm({ result, intensity, mood, trigger, action }) {
  return Boolean(
    result &&
    intensity &&
    mood &&
    trigger?.trim() &&
    action?.trim()
  );
}

export function buildCheckinData({ day, result, intensity, mood, trigger, action, worked, startDate }) {
  return {
    day,
    date: journeyDayToDate(day, startDate).toDateString(),
    result,
    intensity,
    mood,
    trigger: trigger.trim(),
    action: action.trim(),
    worked: worked?.trim() || 'Not noted',
  };
}

/**
 * Apply streak/stats updates when checking in for today only.
 */
export function applyTodayStats(stats, result) {
  const next = { ...stats };
  if (result === 'win') {
    next.wins += 1;
    next.streak += 1;
    if (next.streak > next.best) next.best = next.streak;
  } else {
    next.losses += 1;
    next.streak = 0;
  }
  next.daysIn += 1;
  return next;
}

export function submitCheckin({
  stats,
  checkins,
  day,
  result,
  intensity,
  mood,
  trigger,
  action,
  worked,
  startDate,
  today = getJourneyDay(startDate),
}) {
  const key = dayKey(day);
  if (checkins[key]) {
    return { error: `You already checked in for Day ${day}.` };
  }

  const ciData = buildCheckinData({
    day,
    result,
    intensity,
    mood,
    trigger,
    action,
    worked,
    startDate,
  });

  const nextCheckins = { ...checkins, [key]: ciData };
  const isToday = day === today;
  let nextStats = { ...stats };

  if (isToday) {
    nextStats = applyTodayStats(nextStats, result);
  }

  return {
    checkins: nextCheckins,
    stats: nextStats,
    checkin: ciData,
    isToday,
    milestoneStreak: isToday && result === 'win' ? nextStats.streak : null,
  };
}

export function getBadge(stats) {
  const { streak, wins } = stats;
  if (streak >= 365) return { icon: '💎', name: 'Spiritual Leader', level: 'Phase 3 · Diamond Medal', next: '' };
  if (streak >= 270) return { icon: '🏆', name: 'The Guardian', level: 'Phase 3 · Platinum Medal', next: `${365 - streak} days to Spiritual Leader` };
  if (streak >= 180) return { icon: '🥇', name: 'The Champion', level: 'Phase 3 · Gold Medal', next: `${270 - streak} days to The Guardian` };
  if (streak >= 90) return { icon: '🥈', name: 'The Master', level: 'Phase 3 · Silver Medal', next: `${180 - streak} days to The Champion` };
  if (wins >= 30) return { icon: '⚗️', name: 'The Overcomer', level: 'Phase 2 · Mercury Medal', next: `${90 - streak} days clean to The Master` };
  if (wins >= 20) return { icon: '🥉', name: 'The Seeker', level: 'Phase 1 · Bronze Medal', next: 'Phase 2 started' };
  return { icon: '🌱', name: 'The Next Big Thing', level: 'Beginner', next: `${30 - wins} check-ins to complete Phase 1` };
}

export function computeConfidence(stats, journeyDay) {
  const winRate = stats.wins / Math.max(journeyDay, 1);
  return Math.min(100, Math.round(winRate * 40 + (Math.log(stats.streak + 1) / Math.log(91)) * 40 + (journeyDay / 365) * 20));
}

export function computeReward(stats, journeyDay) {
  const winRate = stats.wins / Math.max(journeyDay, 1);
  return Math.min(100, Math.round((Math.log(stats.streak + 1) / Math.log(366)) * 60 + winRate * Math.min(journeyDay / 30, 1) * 40));
}
