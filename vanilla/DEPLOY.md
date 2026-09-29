# Deployment notes

Everything in the audit that **cannot** be verified from a static checkout, plus
the exact config a real host needs. `serve.py` implements all of this locally so
you can develop against the same policy production will enforce.

## 1. Core Web Vitals can only be proven in the field

`localhost` is the fastest machine on the network and serves from an SSD cache.
**No lab score measured on localhost is evidence of field performance.**

| Metric | Good | Needs | How to actually verify |
|---|---|---|---|
| LCP | ≤ 2.5 s | ≤ 4.0 s | [web-vitals](https://github.com/GoogleChrome/web-vitals) library in production, or CrUX |
| INP | ≤ 200 ms | ≤ 500 ms | field only; lab Lighthouse INP is a simulation |
| CLS | ≤ 0.1 | ≤ 0.25 | field only |

Do this:

1. Ship `web-vitals` (3 kB) and `sendBeacon` the values to your own endpoint.
2. Watch the [CrUX API](https://developer.chrome.com/docs/crux/api) once the
   origin has enough traffic (28-day rolling window, needs real users).
3. Test on a **Slow 4G / mid-tier Android** profile, not a flagship. Most
   regressions on an app like this are INP, not LCP.

Things already done that help LCP/CLS, and why:

- **Pre-paint theme script** in `index.html` — no light-to-dark flash, and
  because it sets `data-theme` before first paint it does not shift layout.
- **Font is `<link>` + `preload`, not `@import`** — an `@import` in CSS is
  discovered *after* the stylesheet downloads, serialising the two requests.
  This is the single most common self-inflicted FOUT.
- **Route-level `import()`** in `js/app.js` — login does not download the test
  engine or the 3,850-question bank.
- **The service worker precaches only the shell.** Precaching every route would
  have undone the code splitting above.
- **`content-visibility` / `will-change` are not sprayed around.** `will-change`
  is scoped to the few elements that actually animate, and is removed after
  animations settle.
- `index.html` has no layout-affecting late-loading images, so CLS should be ~0.

## 2. HTTPS, CORS, and headers on a real host

A static file server cannot set headers, so `serve.py` was used to develop
against the real policy. **Your production host must set these itself** —
copy them from `SECURITY_HEADERS` in `serve.py`.

### Deploy the Firestore indexes FIRST — nothing works without them

Two queries filter on one field and order by another, so Firestore rejects them
with `failed-precondition` ("The query requires an index") until a composite
index exists:

| Collection | Fields | Used by |
|---|---|---|
| `users` | `status` ASC, `totalPoints` DESC | Leaderboard |
| `chats` | `participants` (CONTAINS), `lastMessageAt` DESC | Message list |

They are declared in `firestore.indexes.json` and referenced by `firebase.json`.
Deploy them before the app goes anywhere near real users:

```sh
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:indexes
```

Building an index takes a few minutes. Until it finishes, the affected screens
show an error naming the missing index.

### Firebase Hosting — `firebase.json`

```json
{
  "hosting": {
    "public": "vanilla",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "headers": [
      {
        "source": "/sw.js",
        "headers": [{ "key": "Cache-Control", "value": "no-cache" }]
      },
      {
        "source": "/index.html",
        "headers": [{ "key": "Cache-Control", "value": "no-cache" }]
      },
      {
        "source": "/icons/**",
        "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
      },
      {
        "source": "**",
        "headers": [
          { "key": "X-Content-Type-Options", "value": "nosniff" },
          { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
          { "key": "Permissions-Policy", "value": "geolocation=(), microphone=(), camera=()" },
          { "key": "X-Frame-Options", "value": "DENY" },
          { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://accounts.google.com; frame-src https://accounts.google.com https://*.firebaseapp.com; form-action 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; upgrade-insecure-requests" }
        ]
      }
    ]
  }
}
```

Notes on the CSP, since a wrong one breaks the app:

- `style-src 'unsafe-inline'` is **required** — views build markup with
  `style="..."` attributes everywhere. Remove it and the UI renders unstyled.
- `script-src` has **no** `'unsafe-inline'`. The only inline script is the
  theme bootstrap, which is a constant string.
- `frame-src` / `connect-src` must include `accounts.google.com` or Google
  sign-in silently fails.
- `wss://*.firebaseio.com` is required for Firestore's live listeners.
- `Cross-Origin-Opener-Policy: same-origin-allow-popups` — the stricter
  `same-origin` breaks the Google popup.

### Netlify / Cloudflare Pages — `_headers`

```
/sw.js
  Cache-Control: no-cache
/index.html
  Cache-Control: no-cache
/icons/*
  Cache-Control: public, max-age=31536000, immutable
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY
  Content-Security-Policy: <same as above>
```

### Why the cache policy is shaped that way

- `index.html` **and** `sw.js` must be `no-cache`. A cached service worker is
  the single nastiest failure mode: the browser keeps serving the old app
  forever, and no amount of clearing "other cached files" on the host helps.
- Hashed assets get `immutable, max-age=1y` **only if** filenames are hashed.
  Right now they are not, so they get `must-revalidate`. See below.

## 3. Content-hashed filenames need a build

The app is native ESM with no bundler, so files are named `app.js`, not
`app.4f2a1b.js`. Consequences:

- The `?v=4` query on `app.js`/`style.css` busts the cache, and the SW
  `VERSION` constant does the same for the offline cache. **Both must be bumped
  on every deploy** or users get a stale app.
- That is a manual step, and it is the thing most likely to be forgotten.

To make it automatic, add a build that emits hashed names and rewrites the
import graph — Vite does this in one line:

```js
// vite.config.js
export default { build: { rollupOptions: { output: { entryFileNames: "js/[name].[hash].js" } } } }
```

Then drop the `?v=` query strings and the manual `VERSION` bump.

## 4. Firebase config, rules, and what is *not* secret

`js/firebase.js` contains a web config. **This is public information, not a
leak** — it is embedded in every page load and is not an authorisation
mechanism. Google documents this. It cannot be rotated into secrecy, and
pretending otherwise leads people to build auth on top of it, which is wrong.

Your real security boundary is `firestore.rules`. Rules that were tightened
during the audit:

- **`users` stat fields.** Previously a user could `updateDoc({totalPoints:
  999999})` on their own document and top the leaderboard. Stats are now
  constrained to monotonic, bounded increments (`totalPoints` may rise by at
  most 200 per write, `streak` by 1, and may never fall).
  **This is mitigation, not a fix.** A user can still script the console to
  grind points. To make the leaderboard genuinely cheat-proof, move all stat
  writes into a Cloud Function using the Admin SDK (which bypasses these rules)
  and delete the stat fields from the client-writable allowlist.
- **Chat participant takeover.** `participantInfo` is now immutable, so a user
  cannot add themselves to a chat by rewriting the participants map.
- **Username squatting.** Creating a `usernames/{name}` doc now requires that
  you have no `users` profile yet, so a signed-in user can no longer reserve a
  handle that belongs to somebody else and lock them out of registering.

Deploy rules with:

```bash
firebase deploy --only firestore:rules
```

**The rules have not been executed.** They are brace-balanced and reviewed, but
no emulator run has validated them. Before shipping:

```bash
firebase emulators:start --only firestore
```

...then exercise each rule, especially the stat-increment bounds, against a real
authenticated user. A rule that is subtly wrong fails closed (denies
everything), which is safe but locks users out.

## 5. Accessibility checks that need a real browser

These were reasoned about statically and are **not** verified. Run them:

- **Keyboard-only pass** on every screen: Tab order, visible focus on every
  interactive element, modals trap and return focus, Escape closes.
- **200% zoom** (WCAG 1.4.10 Reflow) and 320 CSS px width.
- **`prefers-reduced-motion` and `prefers-color-scheme`** with real OS settings.
- **Both themes rendered** — dark is the default; light is the one most likely
  to have a contrast bug.
- **A screen reader pass** (NVDA/VoiceOver) on the chat view, which has the
  most dynamic content. `role="log"` and `aria-live` are set, but live-region
  behaviour is notoriously easy to get subtly wrong.
- **Lighthouse a11y** per screen, not just once on the home page.

## 6. PWA install and offline

`manifest.json`, the icon set (including maskable), and the service worker are
all present and parse, and every referenced file exists on disk. Still
unverified, because it needs a browser:

- **Add to Home Screen** actually appearing (iOS needs `apple-touch-icon` *and*
  correct `display`/`start_url`; iOS ignores most of `manifest.json`).
- **Offline launch** from a cold start, not just a warm one.
- **Update flow.** Bump `VERSION` in `sw.js` and confirm the new version
  activates and old caches are deleted.

Firebase Auth and Firestore are deliberately **not** cached by the service
worker — stale or fabricated account data is worse than an honest offline
state. Offline shows the real error state instead.
