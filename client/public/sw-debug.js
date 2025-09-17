// SERVICE WORKER DE EMERGENCIA - SIN CACHE ABSOLUTO
const CACHE_NAME = 'fulltech-debug-v2025-09-17-NO-CACHE';

console.log('[SW-DEBUG] SERVICE WORKER DE EMERGENCIA ACTIVADO - SIN CACHE');

// Instalar inmediatamente
self.addEventListener('install', event => {
  console.log('[SW-DEBUG] Instalando SW sin cache...');
  self.skipWaiting(); // Activar inmediatamente
});

// Activar inmediatamente 
self.addEventListener('activate', event => {
  console.log('[SW-DEBUG] Activando SW sin cache...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      // Borrar TODO el cache existente
      return Promise.all(
        cacheNames.map(cacheName => {
          console.log('[SW-DEBUG] BORRANDO CACHE:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      return self.clients.claim(); // Tomar control inmediatamente
    })
  );
});

// NUNCA cachear NADA - Todo va directo a la red
self.addEventListener('fetch', event => {
  console.log('[SW-DEBUG] FETCH BYPASS:', event.request.url);
  
  // TODO va directo a la red sin cache
  event.respondWith(
    fetch(event.request).catch(error => {
      console.log('[SW-DEBUG] FETCH ERROR:', error);
      throw error;
    })
  );
});

console.log('[SW-DEBUG] SERVICE WORKER CARGADO - MODO BYPASS TOTAL');