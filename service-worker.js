const CACHE_NAME = 'DQIG_CACHE';
const headers = new Headers();
headers.set('Cache-Control','max-age=86400');
const toCache = [
    '/',
    '/js/main.min.js',
    '/css/styles.min.css',
    '/js/pwa.webmanifest',
    '/images/apple-touch.png',
    '/images/splash-screen.png',
    '/font/Barlow-Light.ttf',
    '/font/Barlow-Regular.ttf',
    new Request('https://beibootapi.herokuapp.com/random?mode=portrait', {headers: headers}),
    new Request('https://beibootapi.herokuapp.com/random?mode=landscape', {headers: headers})
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll(toCache);
            })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if(cachedResponse && !navigator.onLine){
                    return cachedResponse;
                }
                return fetch(event.request);
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

fetch('https://beibootapi.herokuapp.com/random?mode=portrait').then(response => response.json()).then(data => {
    caches.open(CACHE_NAME)
        .then(function(cache) {
            return cache.add(`https://beibootapi.herokuapp.com/image/${data.image}`);
        });
});
fetch('https://beibootapi.herokuapp.com/random?mode=landscape').then(response => response.json()).then(data => {
    caches.open(CACHE_NAME)
        .then(function(cache) {
            return cache.add(`https://beibootapi.herokuapp.com/image/${data.image}`);
        });
});