// [Working example](/serviceworker-cookbook/offline-status/).

var CACHE_NAME = 'dependencies-cache';

// Files required to make this app work offline
var REQUIRED_FILES = [
  './assets/styles/infra-calc-styles.css',
  './assets/scripts/infra-calc-scripts.js',
];

self.addEventListener('install', function (event) {
  // Perform install step:  loading each required file into cache
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        // Add all offline dependencies to the cache
        console.debug(
          '[install] Caches opened, adding all core components' + 'to cache'
        );
        return cache.addAll(REQUIRED_FILES);
      })
      .then(function () {
        console.debug(
          '[install] All required resources have been cached, ' + "we're good!"
        );
        return self.skipWaiting();
      })
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      // Cache hit - return the response from the cached version
      if (response) {
        console.debug(
          '[fetch] Returning from ServiceWorker cache: ',
          event.request.url
        );
        return response;
      }

      // Not in cache - return the result from the live server
      // `fetch` is essentially a "fallback"
      console.debug('[fetch] Returning from server: ', event.request.url);
      return fetch(event.request);
    })
  );
});

self.addEventListener('activate', function (event) {
  console.debug('[activate] Activating ServiceWorker!');

  // Calling claim() to force a "controllerchange" event on navigator.serviceWorker
  console.debug('[activate] Claiming this ServiceWorker!');
  event.waitUntil(self.clients.claim());
});
