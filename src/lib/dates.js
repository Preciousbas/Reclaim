import { getString, setItem, STORAGE_KEYS } from './storage.js';

export function getStartDate() {
  let sd = getString(STORAGE_KEYS.START_DATE);
  if (!sd) {
    sd = new Date().toISOString().slice(0, 10);
    setItem(STORAGE_KEYS.START_DATE, sd);
  }
  return new Date(sd);
}

export function getJourneyDay(startDate = getStartDate()) {
  const now = new Date();
  const diff = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
  return diff + 1;
}

export function dayKey(journeyDay) {
  return `day-${journeyDay}`;
}

export function journeyDayToDate(journeyDay, startDate = getStartDate()) {
  const d = new Date(startDate);
  d.setDate(d.getDate() + (journeyDay - 1));
  return d;
}

export function parseDayFromKey(key) {
  return parseInt(String(key).replace('day-', ''), 10);
}

export function sortCheckinKeys(keys) {
  return [...keys].sort((a, b) => parseDayFromKey(a) - parseDayFromKey(b));
}
