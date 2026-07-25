const CACHE_NAME = 'libre-games-v4';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './games.json',
    './manifest.json'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME && key.startsWith('libre-games')) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.claim();
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(e.request).catch(() => {
                return caches.match(e.request);
            });
        })
    );
});
