import { useEffect } from 'react';

export function initObservability() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn || import.meta.env.DEV) return;

  // Placeholder: wire @sentry/react when DSN is configured
  console.info('[ReClaim] Observability ready — set VITE_SENTRY_DSN to enable Sentry');
}

export function useNotificationSchedule(enabled, time, name, streak) {
  useEffect(() => {
    if (!enabled || !('serviceWorker' in navigator) || Notification.permission !== 'granted') return;

    navigator.serviceWorker.ready.then((reg) => {
      if (!reg.active) return;
      const [h, m] = (time || '20:00').split(':').map(Number);
      const now = new Date();
      const target = new Date();
      target.setHours(h, m, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);
      const delay = target - now;

      reg.active.postMessage({
        type: 'SCHEDULE_NOTIF',
        delay,
        payload: {
          title: 'ReClaim — Check In Now',
          body: `${name || 'Champion'}, your ${streak}-day streak is waiting.`,
          icon: '/icons/icon.svg',
          badge: '/icons/icon.svg',
        },
      });
    });
  }, [enabled, time, name, streak]);
}
