export const PHASES = [
  {
    id: 1,
    title: 'Phase 1 — Discovery',
    subtitle: '30 Days · Badge: The Seeker',
    medal: '01',
    unlock: (s) => s.wins >= 20,
    paragraphs: [
      'This is where it begins. Phase 1 is not about perfection — it is about awareness. For 30 days you check in every day, logging wins and losses without judgment. Every relapse here is not a failure — it is data. A clue about your pattern.',
      'You are mapping the enemy. What time of day does the urge hit hardest? What mood comes first — boredom, stress, loneliness, anger? What did you do on the days you won, and what was different on the days you lost? Most people fight this battle blind. Phase 1 takes the blindfold off.',
      'By the end of this month you will know your triggers, your weak moments, your enemy — in a way you never have before. That knowledge is the foundation everything else is built on. You cannot beat what you refuse to look at. Phase 1 is the looking.',
      'There is no streak to protect yet. There is no punishment for a loss. Show up. Log the truth. Let the picture form. That is the whole assignment.',
      'Complete Phase 1 and earn The Seeker badge and your Bronze Medal.',
    ],
    badge: { tone: 'bronze', name: 'The Seeker', desc: 'Complete 30 check-ins · Bronze Medal' },
  },
  {
    id: 2,
    title: 'Phase 2 — Recovery',
    subtitle: '3 Months · Badge: The Overcomer',
    medal: '02',
    unlock: (s) => s.wins >= 30,
    paragraphs: [
      'Phase 1 gave you the map. Phase 2 is the battle. This is where the real streak begins and where science starts working visibly in your favour.',
      'Research shows 90 days of sustained abstinence causes measurable structural changes in the brain. Dopamine receptors recover. The fog lifts. Focus sharpens. Cravings that used to feel like emergencies start to lose their volume. That is not motivation talk — it is what happens when you give the brain a long enough window without the old hit.',
      'In Phase 2 a relapse resets your streak. That is intentional. The 90-day window is the minimum threshold your brain needs to truly rewire. Protecting that window is the work. When an urge hits, you already know your triggers from Phase 1 — now you use that knowledge in real time.',
      'This phase is harder than Discovery because the stakes are clearer. You will want to negotiate. You will tell yourself one slip does not count. It does. Log it honestly, reset, and start the window again. People who finish Phase 2 are not the ones who never fell. They are the ones who refused to quit after they fell.',
      'Survive the full 3 months and earn The Overcomer and Mercury Medal. Less than 20% of users ever reach it.',
    ],
    badge: { tone: 'mercury', name: 'The Overcomer', desc: '90 consecutive days clean · Mercury Medal' },
  },
  {
    id: 3,
    title: 'Phase 3 — Taking Charge',
    subtitle: '3 Months to 1 Year · Four Titles',
    medal: '03',
    unlock: (s) => s.streak >= 90,
    paragraphs: [
      'If you are here, your brain is no longer the same brain that started this journey. The pathways that pulled you toward compulsion have weakened — new ones built on discipline and genuine choice have taken their place.',
      'Phase 3 is not a battle anymore. It is a walk through. Urges that once felt like emergencies now feel manageable. You still check in. You still tell the truth. But the identity shift has started: you are no longer someone trying to quit. You are someone who does not live that way.',
      'And if you play it right, this phase never has to end. The work becomes maintenance, then mastery, then the ability to help someone else walk the same path.',
      'Four milestones. Four titles. Each one a new level of mastery.',
    ],
    badges: [
      { tone: 'silver', name: 'The Master', desc: '3 months in Phase 3 · Silver Medal' },
      { tone: 'gold', name: 'The Champion', desc: '6 months in Phase 3 · Gold Medal' },
      { tone: 'platinum', name: 'The Guardian', desc: '9 months in Phase 3 · Platinum Medal' },
      { tone: 'diamond', name: 'Spiritual Leader', desc: '1 full year · Diamond Medal · You can now teach others' },
    ],
    closing: 'The Spiritual Leader title means you walked the full path — from addiction to absolute freedom. You are now qualified not just to live this life, but to show someone else the way.',
  },
];

export const MEDAL_LADDER = [
  { tone: 'begin', name: 'The Next Big Thing', req: 'Under 30 days · Beginner' },
  { tone: 'bronze', name: 'Bronze', req: 'Phase 1 · The Seeker · 30 check-ins' },
  { tone: 'mercury', name: 'Mercury', req: 'Phase 2 · The Overcomer · 90 days' },
  { tone: 'silver', name: 'Silver', req: 'Phase 3 · The Master · 6 months' },
  { tone: 'gold', name: 'Gold', req: 'Phase 3 · The Champion · 9 months' },
  { tone: 'platinum', name: 'Platinum', req: 'Phase 3 · The Guardian · 1 year' },
  { tone: 'diamond', name: 'Diamond · Spiritual Leader', req: 'Full year complete · You are now a teacher' },
];
