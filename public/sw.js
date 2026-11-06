const CACHE_NAME = 'otwptn-cache-v1'
const PRECACHE_ASSETS = [
  '/',
  '/favicon.png',
  '/logo-footer.png',
  '/manifest.webmanifest',
  '/mascot/trophy-graduate.png',
  '/mascot/glasses-writing-desk.png',
  '/mascot/ai-robot.png',
  '/mascot/roadmap-flags.png',
]

// Install: precache essential static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch(() => {})
    })
  )
  self.skipWaiting()
})

// Activate: clean up older cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch strategy
self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return

  const url = new URL(req.url)

  // Never cache API routes, webhooks, or dynamic server auth endpoints
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/auth/') ||
    url.origin !== self.location.origin
  ) {
    return
  }

  // Cache-First for static immutable Next.js chunks, fonts, images, mascot
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/mascot/') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|woff2?|mp4)$/)
  ) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached
        return fetch(req).then((res) => {
          if (res.status === 200) {
            const clone = res.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone))
          }
          return res
        })
      })
    )
    return
  }

  // Network-First with Stale Cache Fallback for HTML page navigation
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.status === 200) {
            const clone = res.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone))
          }
          return res
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match('/')))
    )
    return
  }
})
