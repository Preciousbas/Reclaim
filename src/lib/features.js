/** Becca companion — enable when VITE_BECCA_ENABLED=true on Netlify */
export function isBeccaEnabled() {
  return import.meta.env.VITE_BECCA_ENABLED === 'true';
}
