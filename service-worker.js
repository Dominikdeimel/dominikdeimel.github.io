const CACHE_NAME = 'DQIG_CACHE';
const headers = new Headers();
headers.set('Cache-Control', 'max-age=86400');

const requestPortrait = new Request('https://beibootapi.herokuapp.com/random?mode=portrait', {headers: headers});
const requestLandscape = new Request('https://beibootapi.herokuapp.com/random?mode=landscape', {headers: headers});
const requestQuote = new Request('https://quotes.rest/qod');

const toCache = [
    '/',
    '/js/main.min.js',
    '/css/styles.min.css',
    '/js/pwa.webmanifest',
    '/images/apple-touch.png',
    '/images/splash-screen.png',
    '/font/Barlow-Light.ttf',
    '/font/Barlow-Regular.ttf',
    requestPortrait,
    requestLandscape
];

self.addEventListener('install', function (event) {
    if (navigator.onLine) {
        event.waitUntil(
            caches.delete(CACHE_NAME)
                .then(() => caches.open(CACHE_NAME))
                .then((cache) => cacheImages(cache))
                .then(self.skipWaiting())
        );
    }
});

async function cacheImages(cache) {
    try {
        await cache.add(requestQuote);
    } catch (e) {
        await cache.put(requestQuote, new Response(null));
    }

    await cache.addAll(toCache);

    const portraitImage = await (await cache.match(requestPortrait)).json();
    const landscapeImage = await (await cache.match(requestLandscape)).json();

    await cache.add(new Request(`https://beibootapi.herokuapp.com/image/${portraitImage.image}`));
    await cache.add(new Request(`https://beibootapi.herokuapp.com/image/${landscapeImage.image}`));
}

self.addEventListener('fetch', function (event) {
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

self.addEventListener('activate', function (event) {
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

setInterval(async () => {
    await caches.delete(CACHE_NAME);
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(toCache);
    await cacheImages(cache);
}, 1000 * 60 * 60 * 24);