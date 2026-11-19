// Service worker: lets the installed app open offline once the cockpit has been loaded one time.
// - Pages (navigation): network first, cached copy when offline.
// - Same-origin files (JS, CSS, 3D models, sounds, diagram): cache first, saved the first time they load.
// - Google Fonts: cached copy first, refreshed in the background.
// To force every device to download all files again, change VERSION.
const VERSION = 'v1'
const STATIC = `a320-static-${VERSION}`
const PAGES = `a320-pages-${VERSION}`
const FONTS = `a320-fonts-${VERSION}`
const SHELL = ['./', 'manifest.webmanifest', 'favicon.svg', 'icons/icon-192.png', 'icons/apple-touch-icon.png']
// Large downloads that are only offered as links: never stored.
const SKIP = [/flightgear-source\.tar\.gz$/]

self.addEventListener('install', event => {
  event.waitUntil(caches.open(PAGES).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', event => {
  const keep = new Set([STATIC, PAGES, FONTS])
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key.startsWith('a320-') && !keep.has(key)).map(key => caches.delete(key))))
    .then(() => self.clients.claim()))
})

self.addEventListener('fetch', event => {
  const request = event.request
  if (request.method !== 'GET' || request.headers.has('range')) return
  const url = new URL(request.url)
  if (SKIP.some(pattern => pattern.test(url.pathname))) return

  if (request.mode === 'navigate') { event.respondWith(networkFirst(request)); return }
  if (url.origin === self.location.origin) { event.respondWith(cacheFirst(request)); return }
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') event.respondWith(staleWhileRevalidate(request))
})

async function networkFirst(request) {
  const cache = await caches.open(PAGES)
  try {
    const response = await fetch(request)
    if (response.ok && (response.headers.get('content-type') || '').includes('text/html')) cache.put(request, response.clone())
    return response
  } catch {
    return (await cache.match(request, { ignoreSearch: true })) || (await cache.match('./')) || Response.error()
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(STATIC)
  const hit = await cache.match(request)
  if (hit) return hit
  const response = await fetch(request)
  if (response.ok && response.status === 200) cache.put(request, response.clone())
  return response
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(FONTS)
  const hit = await cache.match(request)
  const update = fetch(request).then(response => { if (response.ok || response.type === 'opaque') cache.put(request, response.clone()); return response }).catch(() => hit)
  return hit || update
}
