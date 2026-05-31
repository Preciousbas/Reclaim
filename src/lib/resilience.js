import { sortCheckinKeys, parseDayFromKey } from './dates.js';

export function calcRI(days, totalCheckins, wins, losses, comebacks) {
  days = days || 0;
  totalCheckins = totalCheckins || 0;
  wins = wins || 0;
  losses = losses || 0;
  comebacks = comebacks || 0;

  const D = (Math.log(days + 1) / Math.log(366)) * 100;
  const consistency = Math.min(totalCheckins / Math.max(days, 1), 1);
  const winRate = totalCheckins > 0 ? wins / totalCheckins : 0;
  const R = consistency * Math.pow(winRate + 0.01, 0.7) * 100;
  const C = losses > 0 ? (comebacks / (losses + 1)) * (Math.min(losses, 5) / 5) * 100 : 0;
  const RI = D * 0.55 + R * 0.25 + C * 0.2;

  return {
    ri: Math.round(Math.min(RI, 100) * 100) / 10000,
    d: Math.round(D * 100) / 10000,
    r: Math.round(R * 100) / 10000,
    c: Math.round(C * 100) / 10000,
  };
}

export function getRILabel(ri) {
  if (ri >= 1.0) return '🌟 Unbreakable';
  if (ri >= 0.9) return 'Unbreakable';
  if (ri >= 0.75) return 'Forged';
  if (ri >= 0.6) return 'Rising';
  if (ri >= 0.45) return 'Rebuilding';
  if (ri >= 0.3) return 'Awakening';
  if (ri >= 0.15) return 'Emerging';
  return 'Beginning';
}

export function getRIColor(ri) {
  if (ri >= 0.9) return '#f5c518';
  if (ri >= 0.75) return '#a374ff';
  if (ri >= 0.6) return '#6ee7b7';
  if (ri >= 0.45) return '#60a5fa';
  if (ri >= 0.3) return '#f9a8d4';
  return 'rgba(255,255,255,0.5)';
}

export function countComebacks(checkins) {
  let comebacks = 0;
  let wasLosing = false;
  const keys = sortCheckinKeys(Object.keys(checkins));
  keys.forEach((k) => {
    if (checkins[k].result === 'loss') wasLosing = true;
    else if (checkins[k].result === 'win' && wasLosing) {
      comebacks += 1;
      wasLosing = false;
    }
  });
  return comebacks;
}

export function computeRIFromStats({ streak, wins, losses, checkins }) {
  const totalCheckins = Object.keys(checkins).length;
  const comebacks = countComebacks(checkins);
  return calcRI(streak, totalCheckins, wins, losses, comebacks);
}

/**
 * Pattern insights — uses checkins (NOT journeyGrid).
 */
export function computePatternInsights(checkins, stats, journeyDay) {
  const { wins, losses, streak, best } = stats;
  const total = wins + losses;
  const wr = total > 0 ? Math.round((wins / total) * 100) : 0;

  const keys = sortCheckinKeys(Object.keys(checkins));
  let lastLoss = 'None recorded';
  for (let i = keys.length - 1; i >= 0; i -= 1) {
    if (checkins[keys[i]].result === 'loss') {
      lastLoss = `Day ${parseDayFromKey(keys[i])}`;
      break;
    }
  }

  let last7w = 0;
  let last7l = 0;
  let last30w = 0;
  let last30l = 0;

  keys.forEach((k) => {
    const n = parseDayFromKey(k);
    const v = checkins[k].result;
    if (n > journeyDay - 8) {
      if (v === 'win') last7w += 1;
      else last7l += 1;
    }
    if (n > journeyDay - 31) {
      if (v === 'win') last30w += 1;
      else last30l += 1;
    }
  });

  let trend = 'Not enough data';
  if (last7w + last7l >= 3) {
    const r7 = last7w / (last7w + last7l);
    if (r7 >= 0.7) trend = '📈 Strong';
    else if (r7 >= 0.5) trend = '➡️ Steady';
    else trend = '📉 Needs focus';
  }

  let message = '';
  if (total === 0) message = 'Check in daily to start seeing your patterns here.';
  else if (wr >= 70) message = 'Winning more than losing. Consistency is how the brain rewires.';
  else if (wr >= 50) message = 'Holding steady. Find what makes win days different and repeat it.';
  else message = 'More losses than wins right now — but every pattern spotted is a chain broken. Keep checking in.';

  return {
    winRate: total > 0 ? `${wr}%` : 'No data yet',
    streak: streak > 0 ? `${streak} day${streak === 1 ? '' : 's'} 🔥` : '0 days',
    best: best > 0 ? `${best} day${best === 1 ? '' : 's'}` : '0 days',
    lastLoss,
    last7: `${last7w}W / ${last7l}L`,
    last30: `${last30w}W / ${last30l}L`,
    trend,
    message,
  };
}
