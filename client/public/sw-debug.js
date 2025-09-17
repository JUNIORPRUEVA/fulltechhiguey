// SERVICE WORKER DE EMERGENCIA - SIN CACHE ABSOLUTO v2
const CACHE_NAME = 'fulltech-debug-v2025-09-17-19-30-NO-CACHE';

console.log('[SW-DEBUG] ⚡⚡⚡ SERVICE WORKER DE EMERGENCIA v2 ACTIVADO - NADA DE CACHE ⚡⚡⚡');

// Instalar inmediatamente
self.addEventListener('install', event => {
  console.log('[SW-DEBUG] ⚡ INSTALANDO SW SIN CACHE v2...');
  self.skipWaiting(); // Activar inmediatamente
});

// Activar inmediatamente 
self.addEventListener('activate', event => {
  console.log('[SW-DEBUG] ⚡ ACTIVANDO SW SIN CACHE v2...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      // Borrar TODO el cache existente
      return Promise.all(
        cacheNames.map(cacheName => {
          console.log('[SW-DEBUG] ⚡ BORRANDO CACHE:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('[SW-DEBUG] ⚡ CLAIMING CLIENTS...');
      return self.clients.claim(); // Tomar control inmediatamente
    })
  );
});

// NUNCA cachear NADA - Todo va directo a la red
self.addEventListener('fetch', event => {
  // TODO va directo a la red sin cache
  event.respondWith(
    fetch(event.request, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    }).catch(error => {
      console.log('[SW-DEBUG] ⚡ FETCH ERROR:', error.message);
      throw error;
    })
  );
});

console.log('[SW-DEBUG] ⚡⚡⚡ SERVICE WORKER v2 CARGADO - MODO BYPASS TOTAL ⚡⚡⚡');