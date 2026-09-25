import { getString, setItem, STORAGE_KEYS } from './storage.js';

export function todayISO() {
  return formatLocalISO(new Date());
}

export function formatLocalISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function startOfLocalDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function parseStartDate(sd) {
  if (!sd) return startOfLocalDay(new Date());
  if (sd instanceof Date) {
    if (Number.isNaN(sd.getTime())) return startOfLocalDay(new Date());
    return startOfLocalDay(sd);
  }
  const str = String(sd);
  const iso = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  const parsed = new Date(str);
  if (Number.isNaN(parsed.getTime())) return startOfLocalDay(new Date());
  return startOfLocalDay(parsed);
}

/** Read-only. Does not stamp a start date on first visit. */
export function getStartDate() {
  const sd = getString(STORAGE_KEYS.START_DATE);
  return parseStartDate(sd || todayISO());
}

export function getJourneyDay(startDate) {
  const start = parseStartDate(startDate);
  const now = startOfLocalDay(new Date());
  const diff = Math.round((now - start) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff + 1);
}

export function dayKey(journeyDay) {
  return `day-${journeyDay}`;
}

export function journeyDayToDate(journeyDay, startDate) {
  const d = parseStartDate(startDate);
  d.setDate(d.getDate() + (Math.max(1, Number(journeyDay) || 1) - 1));
  return d;
}

export function parseDayFromKey(key) {
  return parseInt(String(key).replace('day-', ''), 10);
}

export function sortCheckinKeys(keys) {
  return [...keys].sort((a, b) => parseDayFromKey(a) - parseDayFromKey(b));
}

/**
 * Journey starts at signup or first check-in, not first page load.
 * If check-ins were stored as Day 50 because startDate was stamped weeks earlier,
 * shift them so the first check-in becomes Day 1.
 */
export function repairStaleJourney(stats) {
  if (!stats) return stats;
  const checkins = stats.checkins || {};
  const keys = Object.keys(checkins);
  const startDate = stats.startDate || '';

  if (keys.length === 0) {
    if (stats.reclaimName && (!startDate || getJourneyDay(startDate) > 1) && !stats.wins && !stats.losses) {
      return { ...stats, startDate: todayISO() };
    }
    return stats;
  }

  const days = keys.map(parseDayFromKey).filter((n) => Number.isFinite(n) && n > 0);
  if (days.length === 0) return stats;

  const minDay = Math.min(...days);
  const maxDay = Math.max(...days);
  const journeyDay = getJourneyDay(startDate || undefined);

  if (minDay <= 1) {
    if (!startDate) return { ...stats, startDate: todayISO() };
    return stats;
  }

  if (maxDay >= journeyDay - 1) {
    const shift = minDay - 1;
    const nextCheckins = {};
    keys.forEach((k) => {
      const oldDay = parseDayFromKey(k);
      const newDay = oldDay - shift;
      nextCheckins[dayKey(newDay)] = { ...checkins[k], day: newDay };
    });
    const span = maxDay - minDay;
    const start = startOfLocalDay(new Date());
    start.setDate(start.getDate() - span);
    return {
      ...stats,
      startDate: formatLocalISO(start),
      checkins: nextCheckins,
    };
  }

  if (!startDate) return { ...stats, startDate: todayISO() };
  return stats;
}

export function withJourneyStart(stats) {
  if (stats.startDate) return stats;
  return { ...stats, startDate: todayISO() };
}
