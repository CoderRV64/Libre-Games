const CACHE_NAME = 'libre-games-v6';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './games.yaml',
    './manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js'
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
                // Si falla la red al intentar cargar la página principal o recursos críticos, devuelve el index guardado
                if (e.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
                return caches.match(e.request);
            });
        })
    );
});
