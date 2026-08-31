// Simple service worker caching app shell for offline demo
const CACHE = 'demo-mail-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  // add other assets if needed
];

self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', evt => {
  evt.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', evt => {
  // Try cache-first for app shell, then network fallback
  evt.respondWith(
    caches.match(evt.request).then(resp => {
      if (resp) return resp;
      return fetch(evt.request).catch(()=> {
        // fallback: if HTML request, serve cached index.html
        if (evt.request.headers.get('accept') && evt.request.headers.get('accept').includes('text/html')) {
          return caches.match('/index.html');
        }
      });
    })
  );
});
