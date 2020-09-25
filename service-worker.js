const CACHE_NAME = 'DQIG_CACHE';
const toCache = [
    '/',
    '/js/main.min.js',
    '/css/styles.min.css',
    '/js/pwa.webmanifest',
    '/images/apple-touch.png',
    '/images/offlineImage.png',
    '/images/splash-screen.png',
    new Request('https://beibootapi.herokuapp.com/random/single?format=portrait'),
    new Request('https://beibootapi.herokuapp.com/random/single?format=landscape'),
];

fetch('https://beibootapi.herokuapp.com/random/single?format=portrait').then(response => response.json()).then(data => toCache.push(`https://beibootapi.herokuapp.com/image/${data.image}`));
fetch('https://beibootapi.herokuapp.com/random/single?format=landscape').then(response => response.json()).then(data => toCache.push(`https://beibootapi.herokuapp.com/image/${data.image}`));
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll(toCache);
            })
            .then(self.skipWaiting())
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        fetch(event.request)
            .catch(() => {
                return caches.open(CACHE_NAME)
                    .then((cache) => {
                        return cache.match(event.request);
                    });
            })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys()
            .then((keyList) => {
                return Promise.all(keyList.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('[ServiceWorker] Removing old cache', key);
                        return caches.delete(key);
                    }
                }));
            })
            .then(() => self.clients.claim())
    );
});