export const MILESTONES = [
  { d: 1, e: '🌱', t: 'Day 1 — You Showed Up', s: 'Most people never start. You just did.' },
  { d: 3, e: '🔥', t: '3 Days — The Hardest Part', s: 'First 72 hours are chemically the hardest. You beat your brain.' },
  { d: 7, e: '⚡', t: 'One Week Strong', s: 'Your dopamine system is already recalibrating.' },
  { d: 14, e: '🧠', t: 'Two Weeks — Rewiring', s: 'Neural pathways are actively being rewritten.' },
  { d: 30, e: '🥉', t: '30 Days — Discovery Complete', s: 'One month. Bronze Medal earned. Phase 2 begins now.' },
  { d: 60, e: '⚗️', t: '60 Days — Deep Change', s: 'Two months of choosing yourself every single day.' },
  { d: 90, e: '🥈', t: '90 Days — The Master', s: 'A threshold most people never reach. You did.' },
  { d: 180, e: '🥇', t: '180 Days — The Champion', s: 'Six months. You would not recognise who you were.' },
  { d: 365, e: '💎', t: 'One Year — Free', s: '365 days. You are the proof that it is possible.' },
];

export function getMilestoneForStreak(streak) {
  return MILESTONES.find((m) => m.d === streak) ?? null;
}

export const MS = [
  { d: 7, i: '🔥', n: '7 Days', t: 'One week clean' },
  { d: 14, i: '⚡', n: '14 Days', t: 'Two weeks strong' },
  { d: 30, i: '🥉', n: '30 Days', t: 'Bronze threshold' },
  { d: 60, i: '⚗️', n: '60 Days', t: 'Deep change' },
  { d: 90, i: '🥈', n: '90 Days', t: 'Silver Master' },
  { d: 180, i: '🥇', n: '180 Days', t: 'Gold Champion' },
  { d: 365, i: '💎', n: '365 Days', t: 'Diamond — Free' },
];
