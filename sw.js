const CACHE_NAME = 'libre-games-v3';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './games.json',
    './manifest.json'
];

// Instala el Service Worker y guarda los archivos principales de la tienda
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Limpia cachés antiguas si actualizas la versión
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

// Intercepta las peticiones para servirlas desde la caché si no hay red
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(e.request).catch(() => {
                // Si falla la red y no está en caché general, busca en cachés de juegos individuales
                return caches.match(e.request);
            });
        })
    );
});
