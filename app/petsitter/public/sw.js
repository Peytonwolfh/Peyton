/* PetSitter CRM service worker — offline app shell.
 * Hand-rolled (no build step) so it is easy to verify and reason about.
 * - App navigations: network-first, fall back to cache, then the offline page.
 * - Static assets: stale-while-revalidate.
 * - Cross-origin requests (Supabase auth + data): never intercepted, always live.
 */
const CACHE = "petsitter-shell-v2";
const SHELL = [
  "/offline.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Only ever handle same-origin GETs. Supabase (auth + data) is cross-origin
  // and must always hit the network so data stays live and sessions are secure.
  if (url.origin !== self.location.origin) return;

  // App navigations: network-first with an offline fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
          return res;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match("/offline.html"))
        )
    );
    return;
  }

  // Static assets: serve from cache immediately, refresh in the background.
  const isAsset =
    url.pathname.startsWith("/_next/") ||
    SHELL.includes(url.pathname) ||
    /\.(?:png|ico|svg|css|js|json|woff2?)$/.test(url.pathname);

  if (isAsset) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});
