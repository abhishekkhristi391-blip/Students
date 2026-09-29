// App bootstrap: register views, init store, start router
import { views, start } from "./router.js";
import { initStore, state } from "./api.js";

// Route-level code splitting: each screen is its own chunk, fetched the first
// time it's visited. Firebase is the big dependency and is loaded by api.js,
// so the login/register bundle no longer drags the question bank with it.
// `protected` stays declarative here so the router can gate auth synchronously
// without awaiting the chunk.
const lazy = (loader, isProtected = true) => ({ protected: isProtected, load: loader });

Object.assign(views, {
  "/login": lazy(() => import("./views/login.js").then((m) => m.login), false),
  "/register": lazy(() => import("./views/register.js").then((m) => m.register), false),
  "/": lazy(() => import("./views/home.js").then((m) => m.home)),
  "/practice": lazy(() => import("./views/practice.js").then((m) => m.practice)),
  "/practice/subject/:subjectId": lazy(() => import("./views/practice.js").then((m) => m.practice)),
  "/practice/chapter/:chapterId": lazy(() => import("./views/practice.js").then((m) => m.practice)),
  "/practice/topic/:topicId/mcq": lazy(() => import("./views/mcq.js").then((m) => m.mcq)),
  "/practice/weak-topics": lazy(() => import("./views/practice-extras.js").then((m) => m.weaktopics)),
  "/bookmarks": lazy(() => import("./views/practice-extras.js").then((m) => m.bookmarks)),
  "/test/active": lazy(() => import("./views/testengine.js").then((m) => m.testengine)),
  "/test/result": lazy(() => import("./views/testresult.js").then((m) => m.testresult)),
  "/daily": lazy(() => import("./views/daily.js").then((m) => m.daily)),
  "/leaderboard": lazy(() => import("./views/leaderboard.js").then((m) => m.leaderboard)),
  "/analytics": lazy(() => import("./views/analytics.js").then((m) => m.analytics)),
  "/profile": lazy(() => import("./views/profile.js").then((m) => m.profile)),
  "/settings": lazy(() => import("./views/settings.js").then((m) => m.settings)),
  "/notifications": lazy(() => import("./views/notifications.js").then((m) => m.notifications)),
  "/chat": lazy(() => import("./views/chatlist.js").then((m) => m.chatlist)),
  "/chat/:userId": lazy(() => import("./views/chatroom.js").then((m) => m.chatroom)),
  "/admin/dashboard": lazy(() => import("./views/admin.js").then((m) => m.adminDashboard)),
  "/admin/students": lazy(() => import("./views/admin.js").then((m) => m.adminStudents)),
  "/admin/mcq": lazy(() => import("./views/admin.js").then((m) => m.adminMcq)),
});

// Persisted theme preference (color-spec.md: dark / light tables).
// The <head> inline script already set this before first paint; this re-asserts
// it and adds the OS-follow behaviour. Falls back to the OS setting so a
// first-time visitor isn't forced into dark.
const saved = localStorage.getItem("school-theme");
document.documentElement.dataset.theme =
  saved || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");

// Follow the OS if the user has never made an explicit choice.
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
  if (localStorage.getItem("school-theme")) return; // explicit wins
  document.documentElement.dataset.theme = e.matches ? "dark" : "light";
});

// Register the service worker for offline app-shell loading. Only on a real
// origin — a file:// or insecure context just logs a warning.
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((err) => {
      console.warn("[pwa] service worker registration failed:", err);
    });
  });
}

// initStore() only settles once onAuthStateChanged fires AND the user-doc
// snapshot fires-or-errors. Any of those can stay pending indefinitely —
// blocked/captive network, ad-blocker, CSP, a Firestore socket that never
// errors. Without a deadline the boot spinner spins forever and the app never
// paints. Continue as a signed-out visitor instead; the router will send an
// authenticated user to /login and the app is fully usable there.
const BOOT_TIMEOUT_MS = 8000;

function renderBootError() {
  const app = document.getElementById("app");
  if (!app) return;
  // static strings only, no interpolation, so no escaping needed
  app.innerHTML = `<div class="view" style="display:flex;align-items:center;justify-content:center;min-height:100dvh;padding:2rem">
    <div class="empty-state" role="alert" style="max-width:24rem">
      <h3>Couldn&rsquo;t start</h3>
      <p class="muted sm mt-2">The app failed while loading. This is usually a stale cached copy.</p>
      <div class="flex gap-3 justify-center mt-5">
        <button class="btn btn-dark" id="boot-retry">Try again</button>
        <button class="btn btn-white" id="boot-clear">Clear cache &amp; reload</button>
      </div>
    </div>
  </div>`;
  app.querySelector("#boot-retry")?.addEventListener("click", () => location.reload());
  app.querySelector("#boot-clear")?.addEventListener("click", async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      const regs = await navigator.serviceWorker?.getRegistrations?.() ?? [];
      await Promise.all(regs.map((r) => r.unregister()));
    } catch (e) {
      console.warn("[boot] cache clear failed", e);
    }
    location.reload();
  });
}

// app.js is a module: if this file or anything it imports fails to evaluate,
// NONE of the code below runs. diag.js is an external classic script in <head>
// precisely so that case is still observable on screen.
const diag = window.__appDiag || { log() {}, booted() {}, show() {} };
const status = (t) => {
  const el = document.getElementById("boot-status");
  if (el) el.textContent = t;
};

status("Loading modules…");
diag.log("boot", "app.js module evaluated");

(async function boot() {
  status("Connecting…");
  let settled = "ok";
  try {
    settled = await Promise.race([
      initStore(),
      new Promise((r) => setTimeout(() => r("timeout"), BOOT_TIMEOUT_MS)),
    ]);
    if (settled === "timeout") {
      console.warn(`[boot] auth did not settle in ${BOOT_TIMEOUT_MS}ms — continuing signed out`);
    }
  } catch (e) {
    console.error("[boot] initStore failed", e);
  }
  // let the router treat the session as resolved either way
  state.ready = true;

  status("Rendering…");
  try {
    await start();
    diag.booted();
  } catch (e) {
    console.error("[boot] router failed to start", e);
    renderBootError();
    diag.log("fatal", "router threw during start()", e && e.stack);
    diag.show();
  }
})();
