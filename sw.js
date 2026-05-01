const CACHE = 'estudos-direito-v1'
const STATIC = [
  './',
  './index.html',
  './style.css',
  './meu-espaco.css',
  './app.js',
  './data.js',
  './meu-espaco.js',
]

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)))
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  if (new URL(e.request.url).origin !== location.origin) return

  e.respondWith(
    caches.match(e.request).then(cached => {
      const fresh = fetch(e.request)
        .then(r => {
          if (r.ok) caches.open(CACHE).then(c => c.put(e.request, r.clone()))
          return r
        })
        .catch(() => cached)
      return cached || fresh
    })
  )
})
