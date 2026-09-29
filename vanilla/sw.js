/* Service worker: precache the app shell so the app opens with no network.
 *
 * Firebase auth/firestore is NOT cached — stale or fabricated account data
 * would be worse than an honest offline state. Those routes render their
 * existing empty/error states instead.
 *
 * Route chunks are deliberately NOT precached. js/app.js loads them with
 * dynamic import(), so precaching them here would undo that code splitting and
 * make every visitor download the whole app on install. The fetch handler
 * runtime-caches them as they are visited, so they are available offline once
 * the user has actually been to that screen. The two auth gates are included
 * because they are the only routes reachable with no network.
 */
const VERSION = "v10";
const SHELL_CACHE = `shell-${VERSION}`;

// Bump the version whenever any of these change, or the SW serves stale files.
const SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css?v=10",
  "./js/app.js?v=10",
  "./js/router.js",
  "./js/api.js",
  "./js/firebase.js",
  "./js/icons.js",
  "./js/blob.js",
  "./js/diag.js",
  "./js/theme-init.js",
  "./js/views/settings.js",
  "./js/views/login.js",
  "./js/views/register.js",
  "./icons/favicon.svg",
  "./icons/favicon-32.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-192-maskable.png",
  "./icons/icon-512-maskable.png",
  "./icons/apple-touch-icon.png",
];

// Files without which the app cannot boot at all. If any of these fail to
// cache, the install must NOT activate: a half-populated worker that controls
// the page is worse than no worker, because it fails requests the network
// would have served. Failing install = the browser keeps the previous worker
// (or none) and the app still works.
const CRITICAL = ["./index.html", "./css/style.css?v=10", "./js/app.js?v=10",
  "./js/router.js", "./js/api.js", "./js/firebase.js",
  "./js/diag.js"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(SHELL_CACHE)
      .then(async (cache) => {
        // icons are optional; a missing one must not take the app down
        await Promise.all(
          SHELL.filter((u) => !CRITICAL.includes(u))
            .map((url) => cache.add(url).catch((err) => console.warn("[sw] optional skip", url, err)))
        );
        // critical files are not optional
        const results = await Promise.allSettled(CRITICAL.map((url) => cache.add(url)));
        const failed = results
          .map((r, i) => (r.status === "rejected" ? CRITICAL[i] : null))
          .filter(Boolean);
        if (failed.length) {
          // wipe the partial cache so a retry starts clean
          await cache.keys().then((ks) => Promise.all(ks.map((k) => cache.delete(k))));
          throw new Error("[sw] critical shell files failed to cache: " + failed.join(", "));
        }
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== SHELL_CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Never touch auth/firestore — let them fail honestly so the UI can show
  // its offline/error state.
  if (url.hostname.endsWith("googleapis.com") || url.hostname.endsWith("firebaseio.com")) return;

  // Navigations: network first (so deploys land immediately), fall back to the
  // cached shell when offline. Must never resolve undefined, or the navigation
  // fails and the user gets a blank page with no way back.
  if (request.mode === "navigate") {
    e.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put("./index.html", copy));
          return res;
        })
        .catch(async () => {
          const shell = await caches.match("./index.html") || await caches.match("./");
          return shell || new Response(
            "<!doctype html><meta charset=utf-8><title>Offline</title>" +
            "<body style=\"font:16px system-ui;padding:2rem\">You're offline." +
            "Reconnect and reload.</body>",
            { status: 503, headers: { "Content-Type": "text/html" } }
          );
        })
    );
    return;
  }

  // JS/CSS: network first, cache as the offline fallback. A stale module is
  // served to the browser verbatim, so a cache-first hit on an edited file is a
  // SyntaxError in that route's chunk (e.g. "Identifier 'esc' has already been
  // declared") that revalidating in the background cannot fix until the *next*
  // load. One network round trip per file is cheaper than that.
  if (/\.(js|css)$/.test(url.pathname)) {
    e.respondWith(
      fetch(request)
        .then((res) => {
          if (res && res.status === 200 && res.type === "basic") {
            const copy = res.clone();
            caches.open(SHELL_CACHE).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(async () => (await caches.match(request)) || offlineResponse(request))
    );
    return;
  }

  // Everything else: cache first, revalidate in the background.
  //
  // respondWith() must ALWAYS be handed a Response. Resolving it with
  // `undefined` (cache miss + network failure) makes the browser reject the
  // request outright — which for a module or a dynamic import() means the
  // app never boots and sits on the spinner forever. So a 504 is returned
  // instead, which surfaces as a catchable rejection the UI can render.
  e.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          if (res && res.status === 200 && res.type === "basic") {
            const copy = res.clone();
            caches.open(SHELL_CACHE).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(() => null);
      return cached || network.then((r) => r || offlineResponse(request));
    })
  );
});

// Never hand respondWith() an undefined value.
function offlineResponse(request) {
  if (/\.(js|mjs|css)$/.test(new URL(request.url).pathname)) {
    return new Response("/* offline */", {
      status: 504,
      statusText: "Offline",
      headers: { "Content-Type": "text/javascript" },
    });
  }
  return new Response("offline", { status: 504, statusText: "Offline" });
}
