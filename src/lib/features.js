/** Becca AI chat — enable when ANTHROPIC_API_KEY is configured on Netlify */
export function isBeccaEnabled() {
  return import.meta.env.VITE_BECCA_ENABLED === 'true';
}
