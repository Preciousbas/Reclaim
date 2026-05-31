/** Offline urge protocols — no API required */

export const URGE_STEPS = [
  { n: 1, title: 'Stop', body: 'Freeze for 10 seconds. Do not open a browser. Do not "just look."' },
  { n: 2, title: 'Breathe', body: 'Four slow breaths — in 4, hold 4, out 6. Your nervous system needs a downshift.' },
  { n: 3, title: 'Move', body: 'Stand up. Walk to another room. Cold water on wrists or face for 30 seconds.' },
  { n: 4, title: 'Name it', body: 'Say out loud: "This is an urge, not a command." Urges peak and pass in ~15 minutes.' },
  { n: 5, title: 'Reach', body: 'Text one person: "Having a hard moment — can you check in?" You do not have to explain everything.' },
];

export const GROUNDING_54321 = [
  { sense: '5 things you see', prompt: 'Name them slowly.' },
  { sense: '4 things you feel', prompt: 'Chair, feet on floor, temperature…' },
  { sense: '3 things you hear', prompt: 'Even subtle sounds count.' },
  { sense: '2 things you smell', prompt: 'Or two things you like the smell of.' },
  { sense: '1 thing you taste', prompt: 'Or one good thing about right now.' },
];

export const CRISIS_RESOURCES = [
  { label: '988 Suicide & Crisis Lifeline (US)', href: 'tel:988', sub: 'Call or text 988 — 24/7' },
  { label: 'Crisis Text Line (US)', href: 'https://www.crisistextline.org/', sub: 'Text HOME to 741741' },
  { label: 'Find international helplines', href: 'https://findahelpline.com/', sub: 'By country — free support' },
];

export function getPersonalAnchor(checkins) {
  const keys = Object.keys(checkins || {}).sort();
  if (!keys.length) return null;
  const last = checkins[keys[keys.length - 1]];
  if (!last?.action) return null;
  return {
    trigger: last.trigger,
    action: last.action,
    worked: last.worked,
  };
}
