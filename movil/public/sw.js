// Service Worker — La Rasilla Admin
// Estrategia: Network First (siempre datos frescos), con fallback a caché.

const CACHE = 'rasilla-admin-v1'

// Al instalar: activar inmediatamente sin esperar a que se cierren las pestañas
self.addEventListener('install', () => {
  self.skipWaiting()
})

// Al activar: tomar el control de todos los clientes de inmediato
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim())
})

// Fetch: network-first para navegación, pass-through para el resto
self.addEventListener('fetch', event => {
  const { request } = event

  // Solo interceptar navegaciones (HTML pages)
  if (request.mode !== 'navigate') return

  event.respondWith(
    fetch(request)
      .then(response => {
        // Guardar en caché las navegaciones exitosas
        const clone = response.clone()
        caches.open(CACHE).then(cache => cache.put(request, clone))
        return response
      })
      .catch(() =>
        // Sin red: devolver desde caché
        caches.match(request).then(cached => cached ?? caches.match('/login')),
      ),
  )
})
