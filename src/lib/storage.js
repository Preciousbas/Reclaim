export const STORAGE_KEYS = {
  STREAK: 'streak',
  WINS: 'wins',
  LOSSES: 'losses',
  BEST: 'best',
  DAYS_IN: 'daysIn',
  START_DATE: 'startDate',
  CHECKINS: 'checkins',
  RECLAIM_NAME: 'reclaimName',
  RECLAIM_ANON: 'reclaimIsAnon',
  FB_UID: 'fb-uid',
  QUIZ_ANSWERS: 'quiz-answers',
  QUIZ_DONE: 'quiz-done',
  LAST_CHECKIN: 'lastCheckin',
  LB_JOINED: 'lb-joined',
  LB_USERS: 'lb-users',
  NOTIF_ENABLED: 'notif-enabled',
  NOTIF_TIME: 'notif-time',
  RI_MAXED: 'ri-maxed',
};

/** Keys cleared on logout for a consistent session reset */
export const SESSION_KEYS = [
  STORAGE_KEYS.STREAK,
  STORAGE_KEYS.WINS,
  STORAGE_KEYS.LOSSES,
  STORAGE_KEYS.BEST,
  STORAGE_KEYS.DAYS_IN,
  STORAGE_KEYS.START_DATE,
  STORAGE_KEYS.CHECKINS,
  STORAGE_KEYS.RECLAIM_NAME,
  STORAGE_KEYS.RECLAIM_ANON,
  STORAGE_KEYS.FB_UID,
  STORAGE_KEYS.QUIZ_ANSWERS,
  STORAGE_KEYS.QUIZ_DONE,
  STORAGE_KEYS.LAST_CHECKIN,
  STORAGE_KEYS.LB_JOINED,
  STORAGE_KEYS.LB_USERS,
  STORAGE_KEYS.NOTIF_ENABLED,
  STORAGE_KEYS.NOTIF_TIME,
  STORAGE_KEYS.RI_MAXED,
];

export function getInt(key, fallback = 0) {
  const raw = localStorage.getItem(key);
  if (raw === null || raw === '') return fallback;
  const n = parseInt(raw, 10);
  return Number.isNaN(n) ? fallback : n;
}

export function getString(key, fallback = '') {
  return localStorage.getItem(key) ?? fallback;
}

export function setItem(key, value) {
  localStorage.setItem(key, String(value));
}

export function getJSON(key, fallback = null) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function setJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function clearSessionStorage() {
  SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
  // Clear milestone and nudge keys
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('ms-') || key.startsWith('nudge-')) {
      localStorage.removeItem(key);
    }
  });
}

export function loadUserStats() {
  return {
    streak: getInt(STORAGE_KEYS.STREAK),
    wins: getInt(STORAGE_KEYS.WINS),
    losses: getInt(STORAGE_KEYS.LOSSES),
    best: getInt(STORAGE_KEYS.BEST),
    daysIn: getInt(STORAGE_KEYS.DAYS_IN, 1),
    reclaimName: getString(STORAGE_KEYS.RECLAIM_NAME),
    startDate: getString(STORAGE_KEYS.START_DATE),
    checkins: getJSON(STORAGE_KEYS.CHECKINS, {}) ?? {},
    quizAnswers: getJSON(STORAGE_KEYS.QUIZ_ANSWERS, {}) ?? {},
    quizDone: getString(STORAGE_KEYS.QUIZ_DONE),
    lbJoined: getString(STORAGE_KEYS.LB_JOINED),
    notifEnabled: getString(STORAGE_KEYS.NOTIF_ENABLED) === 'yes',
    notifTime: getString(STORAGE_KEYS.NOTIF_TIME, '20:00'),
  };
}

export function saveUserStats(stats) {
  if (stats.streak !== undefined) setItem(STORAGE_KEYS.STREAK, stats.streak);
  if (stats.wins !== undefined) setItem(STORAGE_KEYS.WINS, stats.wins);
  if (stats.losses !== undefined) setItem(STORAGE_KEYS.LOSSES, stats.losses);
  if (stats.best !== undefined) setItem(STORAGE_KEYS.BEST, stats.best);
  if (stats.daysIn !== undefined) setItem(STORAGE_KEYS.DAYS_IN, stats.daysIn);
  if (stats.reclaimName !== undefined) setItem(STORAGE_KEYS.RECLAIM_NAME, stats.reclaimName);
  if (stats.startDate !== undefined) setItem(STORAGE_KEYS.START_DATE, stats.startDate);
  if (stats.checkins !== undefined) setJSON(STORAGE_KEYS.CHECKINS, stats.checkins);
  if (stats.quizAnswers !== undefined) setJSON(STORAGE_KEYS.QUIZ_ANSWERS, stats.quizAnswers);
  if (stats.quizDone !== undefined) setItem(STORAGE_KEYS.QUIZ_DONE, stats.quizDone);
  if (stats.lbJoined !== undefined) setItem(STORAGE_KEYS.LB_JOINED, stats.lbJoined);
  if (stats.notifEnabled !== undefined) {
    setItem(STORAGE_KEYS.NOTIF_ENABLED, stats.notifEnabled ? 'yes' : 'no');
  }
  if (stats.notifTime !== undefined) setItem(STORAGE_KEYS.NOTIF_TIME, stats.notifTime);
}
