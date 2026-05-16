// sw.js — Service Worker בסיסי, cache-first עם network fallback

const VERSION = 'kis-v0.7.0';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/tokens.css',
  './css/base.css',
  './css/components.css',
  './css/views.css',
  './js/main.js',
  './js/storage.js',
  './js/i18n.js',
  './js/ui.js',
  './js/coin.js',
  './js/insights.js',
  './js/voice-parse.js',
  './js/views/onboarding.js',
  './js/views/dream-wizard.js',
  './js/views/home.js',
  './js/views/dashboard.js',
  './js/views/budget.js',
  './js/views/settings.js',
  './js/views/add-expense.js',
  './js/views/menu.js',
  './js/views/reflection.js',
  './js/views/canvas.js',
  './js/views/portfolio.js',
  './js/views/simulation.js',
  './js/views/toolbox.js',
  './js/views/weekly-recap.js',
  './js/views/welcome-back.js',
  './i18n/he.json',
  './icons/icon.svg',
  './icons/icon-maskable.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// תמיכה בשליחת הודעת SKIP_WAITING מהאפליקציה (כפתור "טען גרסה חדשה")
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(res => {
        if (res && res.status === 200 && new URL(event.request.url).origin === location.origin) {
          const copy = res.clone();
          caches.open(VERSION).then(c => c.put(event.request, copy));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
