// sw.js — Service Worker בסיסי, cache-first עם network fallback

const VERSION = 'kis-v0.2.0';
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
  './js/views/onboarding.js',
  './js/views/dream-wizard.js',
  './js/views/home.js',
  './js/views/dashboard.js',
  './js/views/budget.js',
  './js/views/settings.js',
  './js/views/add-expense.js',
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

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(res => {
        // cache same-origin requests we successfully fetched
        if (res && res.status === 200 && new URL(event.request.url).origin === location.origin) {
          const copy = res.clone();
          caches.open(VERSION).then(c => c.put(event.request, copy));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
