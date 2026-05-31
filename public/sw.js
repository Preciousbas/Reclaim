const CACHE_NAME = 'reclaim-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      if (list.length > 0) return list[0].focus();
      return clients.openWindow('/');
    })
  );
});

self.addEventListener('message', (e) => {
  if (e.data?.type === 'SCHEDULE_NOTIF') {
    const { delay, payload } = e.data;
    setTimeout(() => {
      self.registration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icons/icon.svg',
        badge: payload.badge || '/icons/icon.svg',
        tag: 'reclaim-daily',
        renotify: true,
        data: { url: '/' },
      });
    }, Math.min(delay, 86400000));
  }
});

self.addEventListener('fetch', (e) => {
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(() => caches.match('/index.html')));
  }
});
