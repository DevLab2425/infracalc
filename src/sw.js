const CACHE_NAME = 'dependencies-cache';
const CACHED_FILES = [
  './assets/styles/infra-calc-styles.css',
  './assets/scripts/infra-calc-scripts.js',
  './index.html',
];

const installListener = (event) =>
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.debug('[sw install] Adding files to cache...');
        return cache.addAll(CACHED_FILES);
      })
      .then(() => {
        console.debug('[sw install] Files cached!');
        return self.skipWaiting();
      })
  );

const fetchListener = (event) => {
  const { url } = event.request;

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit
      if (response) {
        console.debug('[sw fetch] Returning from SW cache:', url);
        return response;
      }
      console.debug('[fetch] Returning from server: ', url);
      return fetch(event.request);
    })
  );
};

const activateListener = (event) => {
  console.debug('[sw activate] Activating SW!');

  // Calling claim() to force a "controllerchange" event on navigator.serviceWorker
  console.debug('[activate] Claiming this ServiceWorker!');
  event.waitUntil(self.clients.claim());
};

self.addEventListener('activate', activateListener);
self.addEventListener('fetch', fetchListener);
self.addEventListener('install', installListener);
