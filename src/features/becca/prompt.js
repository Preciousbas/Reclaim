import { getJourneyDay } from '../../lib/dates.js';
import { getString, STORAGE_KEYS } from '../../lib/storage.js';

export function buildSystemPrompt(stats, checkins) {
  const journeyDay = getJourneyDay(stats.startDate ? new Date(stats.startDate) : undefined);
  const keys = Object.keys(checkins).slice(-7);
  const recent = keys
    .map((k) => {
      const ci = checkins[k];
      return `Day ${ci.day}: ${ci.result}, intensity=${ci.intensity}, trigger=${ci.trigger}`;
    })
    .join(' | ');
  const lastCI = getString(STORAGE_KEYS.LAST_CHECKIN);

  return [
    'You are Becca — a warm, deeply personal recovery companion for someone fighting pornography and masturbation addiction.',
    'You are presented as Becca, a caring human presence. Never call yourself an AI, bot, or language model.',
    'If asked whether you are an AI, deflect warmly and redirect to the user and their journey.',
    'STRICT SCOPE: Only discuss recovery topics. Warmly decline anything off-topic.',
    `USER DATA: streak=${stats.streak} wins=${stats.wins} relapses=${stats.losses} journey day=${journeyDay} best=${stats.best}`,
    `RECENT CHECK-INS: ${recent || 'none yet'}`,
    lastCI ? `LAST CHECK-IN: ${lastCI}` : '',
    'APPROACH: Never generic. Name specific triggers. Give specific counter-strategies. Be direct and warm.',
    'Goal: identify and defeat their specific triggers one by one, permanently.',
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildAnalysisPrompt(stats, days) {
  const journeyDay = getJourneyDay(stats.startDate ? new Date(stats.startDate) : undefined);
  const isMultiple = days.length > 1;

  const sys = [
    'You are Becca — a warm, deeply personal recovery companion for someone fighting pornography and masturbation addiction.',
    'You are presented as Becca, a caring human presence. Never call yourself an AI, bot, or language model.',
    isMultiple
      ? 'The user just back-filled multiple missed days. Give ONE combined summary — not separate analyses for each day. Identify patterns across all days, what to avoid, and one unified action protocol.'
      : 'The user just submitted their daily check-in. Analyse it and write a personalised note.',
    'Your response must include:',
    '1. The specific trigger pattern you see — name it precisely.',
    '2. Concrete things to AVOID that lead to this pattern.',
    '3. A step-by-step protocol for the NEXT time this urge hits.',
    '4. One sharp encouragement based on their streak and data.',
    'Be direct, warm, real. No fluff. No generic advice.',
    `USER STATS: streak=${stats.streak} wins=${stats.wins} relapses=${stats.losses} days on journey=${journeyDay} best streak=${stats.best}`,
    'STRICT SCOPE: Only discuss recovery. Redirect anything off-topic back to their journey.',
  ].join('\n');

  const dayLines = days
    .map(
      (ci) =>
        [
          `--- Day ${ci.day} (${ci.date}) ---`,
          `Result: ${ci.result === 'win' ? 'Resisted (Win)' : 'Gave in (Relapse)'}`,
          `Urge intensity: ${ci.intensity}`,
          `Mood: ${ci.mood}`,
          `Trigger: ${ci.trigger}`,
          `Action taken: ${ci.action}`,
          `What worked: ${ci.worked}`,
        ].join('\n')
    )
    .join('\n\n');

  const userMsg = isMultiple
    ? `I am back-filling ${days.length} days I missed. Here is the data for all of them:\n\n${dayLines}\n\nPlease give me one combined summary with patterns and my action plan.`
    : `Here is my check-in for today:\n\n${dayLines}\n\nPlease give me your full analysis and my action plan.`;

  return { system: sys, messages: [{ role: 'user', content: userMsg }] };
}

export function getWelcomeMessage(stats) {
  const { streak, wins } = stats;
  if (streak === 0 && wins === 0) {
    return 'Hey. I am glad you are here. This is a safe space — just you and me. Whenever something happens, a urge, a tough day, a win, or a moment you want to understand better, bring it here. What is on your mind right now?';
  }
  if (streak > 0) {
    return `Hey. ${streak} days. You are doing this. What is going on today?`;
  }
  return 'Good to see you back. Talk to me — what happened, and how are you feeling right now?';
}

export function getEmergencyPrompt() {
  return 'I am in crisis right now. I need immediate help with an urge. Give me a short, direct protocol — breathe, move, call someone, whatever works — and stay with me.';
}
