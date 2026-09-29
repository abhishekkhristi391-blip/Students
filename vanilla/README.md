# Vanilla Port (HTML/CSS/JS + Firebase)

A dependency-free rewrite of the React app — no build step, no npm.

## Run

Firebase (importmap CDN, Google OAuth popup) needs an http(s) origin, not `file://`:

```bash
# from project root, serve the vanilla folder, e.g.
python3 -m http.server 8080 --directory vanilla
# or
npx serve vanilla
```

Then open http://localhost:8080

## Layout

- `index.html` — shell + firebase importmap
- `css/style.css` — full design system (light/dark, admin, mobile frame)
- `js/app.js` — bootstrap: registers every view in the router
- `js/router.js` — hash router, mobile frame, bottom nav, admin shell
- `js/api.js` — state, auth, registration, points/accuracy persistence (Firebase)
- `js/chat.js`, `js/leaderboard.js` — real Firestore helpers
- `js/mockdata.js` — subjects/chapters/topics/questions seed
- `js/icons.js`, `js/blob.js` — inline SVG renders
- `js/views/` — one file per page

Auth (Google popup + username) and Firestore unread-chat counters require the
live `students-d2341` rules (`firestore.rules` in the project root).

## Checks

Smoke test with stubbed firebase/DOM lives at
`/data/data/com.termux/files/usr/tmp/opencode/vanilla-test/test.mjs`
(`node test.mjs` inside that folder): 22 view renders + boot + data integrity.