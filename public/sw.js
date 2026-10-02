const CACHE_VERSION = 'v1';
const STATIC_CACHE = `app-static-${CACHE_VERSION}`;
const TILE_CACHE = `map-tiles-${CACHE_VERSION}`;
const FONT_CACHE = `google-fonts-${CACHE_VERSION}`;
const MAX_TILES = 500;

// Install event: precache '/tool25/' and skip waiting
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(['/tool25/']))
      .then(() => self.skipWaiting())
  );
});

// Activate event: clean old caches and claim clients
self.addEventListener('activate', (event) => {
  const currentCaches = [STATIC_CACHE, TILE_CACHE, FONT_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !currentCaches.includes(key))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Helper: Trim cache to max items (FIFO)
async function trimCache(cacheName, maxItems) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxItems) {
      const deleteCount = keys.length - maxItems;
      for (let i = 0; i < deleteCount; i++) {
        await cache.delete(keys[i]);
      }
    }
  } catch {
    // Ignore cache trim errors
  }
}

// Fetch event listener
self.addEventListener('fetch', (event) => {
  // Only intercept GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // 1. Map Tiles (tile.openstreetmap.org): cache-first, max 500 tiles
  if (url.hostname.includes('tile.openstreetmap.org')) {
    event.respondWith(
      caches.open(TILE_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
            trimCache(TILE_CACHE, MAX_TILES);
          }
          return networkResponse;
        } catch {
          // Return non-breaking failure when offline with no cached tile
          return new Response('', { status: 408, statusText: 'Tile Offline' });
        }
      })
    );
    return;
  }

  // 2. Google Fonts (fonts.googleapis.com, fonts.gstatic.com): stale-while-revalidate
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(FONT_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => null);

        if (cachedResponse) {
          return cachedResponse;
        }

        const networkResponse = await fetchPromise;
        if (networkResponse) {
          return networkResponse;
        }

        return new Response('', { status: 408, statusText: 'Font Offline' });
      })
    );
    return;
  }

  // 3. Same-origin requests (pages, assets, manifest, icons): stale-while-revalidate
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);

        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => null);

        // Serve from cache if available while background revalidates
        if (cachedResponse) {
          return cachedResponse;
        }

        const networkResponse = await fetchPromise;
        if (networkResponse) {
          return networkResponse;
        }

        // If navigation request and offline/no cache, fallback to '/tool25/'
        if (event.request.mode === 'navigate') {
          const fallback = await cache.match('/tool25/');
          if (fallback) {
            return fallback;
          }
        }

        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      })
    );
    return;
  }

  // 4. Other cross-origin requests: do not intercept
});
