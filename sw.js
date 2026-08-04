const CACHE_NAME = 'libre-games-v9';
// Archivos esenciales de la interfaz que deben estar disponibles offline siempre
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './games.yaml',
  './manifest.json',
  './images/icon-192.png'
];

// 1. Instalación: Guarda los elementos esenciales de la tienda
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Activación: Limpia cachés antiguas si actualizas la versión
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && !key.startsWith('juego-')) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Interceptar peticiones (Estrategia Network First con fallback a Caché)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si hay red, clonamos la respuesta y la guardamos en caché dinámicamente
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Si no hay internet, busca en la caché principal o en las cachés independientes de los juegos
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Si se intenta cargar un juego descargado previamente y no hay red
          return caches.match('./index.html');
        });
      })
  );
});
