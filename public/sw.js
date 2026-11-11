const CACHE_NAME = 'otwptn-cache-v2'
const PRECACHE_ASSETS = [
  '/',
  '/honey-fast.mp4',
  '/favicon.png',
  '/logo-footer.png',
  '/manifest.webmanifest',
  '/mascot-hd/mascot-standing.png',
  '/mascot-hd/mascot-happy.png',
  '/mascot-hd/mascot-thumbs-up.png',
  '/mascot-hd/mascot-laptop.png',
]

// Install: precache essential static assets and take control immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch(() => {})
    })
  )
  self.skipWaiting()
})

// Activate: clean up older cache versions and claim all open clients
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

  // Never cache API routes, webhooks, auth, or cross-origin requests
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/auth/') ||
    url.origin !== self.location.origin
  ) {
    return
  }

  // Cache-First strategy for static immutable Next.js chunks, fonts, images, mascot, video
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/mascot-hd/') ||
    url.pathname.startsWith('/mascot/') ||
    url.pathname === '/honey-fast.mp4' ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|woff2?|mp4|css|js)$/)
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

  // Stale-While-Revalidate for HTML page navigations (instant response + background refresh)
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req)
          .then((networkRes) => {
            if (networkRes.status === 200) {
              const clone = networkRes.clone()
              caches.open(CACHE_NAME).then((cache) => cache.put(req, clone))
            }
            return networkRes
          })
          .catch(() => cached || caches.match('/'))

        // If cached page is available, return it immediately for instant navigation
        return cached || fetchPromise
      })
    )
    return
  }
})
