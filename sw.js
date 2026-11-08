
const CACHE_NAME = 'lakbay-app-v1';

const APP_FILES = [
  './',
  './index.html',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      for (const file of APP_FILES) {
        try {
          await cache.add(file);
        } catch (error) {
          console.log('Could not cache:', file);
        }
      }
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never cache map tiles. Use map data only
  // according to the tile provider's usage policy.
  if (
    url.hostname.includes('tile.openstreetmap.org') ||
    url.hostname.includes('nominatim.openstreetmap.org') ||
    url.hostname.includes('router.project-osrm.org')
  ) return;

  // Cache the app and Leaflet library.
  if (
    url.origin === self.location.origin ||
    url.hostname === 'unpkg.com'
  ) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;

        return fetch(request).then(response => {
          if (response && (response.ok || response.type === 'opaque')) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache =>
              cache.put(request, copy)
            );
          }
          return response;
        }).catch(() => {
          if (request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return new Response('', {status: 503});
        })
      })
    );
  }
});
