// Hash-based router + mobile frame + bottom nav
import { state, isAuthorized, isAdmin, countUpAll, esc } from "./api.js";
import { icon } from "./icons.js";

// view registry filled by app.js
export const views = {};

const ADMINS = ["dashboard", "students", "mcq", "subjects", "settings"];

let navStack = [];
let lastPath = null;

// Bottom-nav order — slide direction is derived from it
const NAV_ORDER = ["/", "/practice", "/leaderboard", "/chat", "/profile"];
const navIndex = (p) => {
  if (!p) return -1;
  if (p === "/") return 0;
  const i = NAV_ORDER.findIndex((t) => t !== "/" && p.startsWith(t));
  return i < 0 ? -1 : i + 1;
};
function dirFor(from, to) {
  const a = navIndex(from), b = navIndex(to);
  return a < 0 || b < 0 || a === b ? "" : b > a ? "fwd" : "back";
}

let currentCleanup = null; // cleanup returned by the last view.mount()

function parsePath() {
  const raw = location.hash.replace(/^#/, "") || "/";
  const parts = raw.split("/").filter(Boolean); // e.g. ["practice","topic","t1","mcq"]
  return { parts, raw };
}

// Find a view key matching the path parts (ordered match, ":" = param)
function matchRoute(parts) {
  for (const key of Object.keys(views)) {
    const keyParts = key.split("/").filter(Boolean);
    if (keyParts.length !== parts.length) continue;
    let ok = true;
    const params = {};
    for (let i = 0; i < keyParts.length; i++) {
      if (keyParts[i].startsWith(":")) params[keyParts[i].slice(1)] = decodeURIComponent(parts[i]);
      else if (keyParts[i] !== parts[i]) { ok = false; break; }
    }
    if (ok) return { key, params };
  }
  return null;
}

export function navigate(to) {
  if (to === -1 || to === "-1") {
    const prev = navStack[navStack.length - 2];
    if (prev) location.hash = prev;
    else location.hash = "/";
    return;
  }
  location.hash = to.startsWith("/") ? to : "/" + to;
}

function getCurrentPath() {
  return location.hash.replace(/^#/, "") || "/";
}

// Shared UI pieces ------------------------------------------------
export function bottomNavHtml(currentPath) {
  const tabs = [
    { id: "home", icon: "home", path: "/" },
    { id: "practice", icon: "fileText", path: "/practice" },
    { id: "leaderboard", icon: "barChart", path: "/leaderboard" },
    { id: "chat", icon: "messageCircle", path: "/chat" },
    { id: "profile", icon: "user", path: "/profile" },
  ];
  const html = tabs.map((t) => {
    const isActive = currentPath === t.path || (t.path !== "/" && currentPath.startsWith(t.path));
    return `<button class="nav-tab ${isActive ? "active" : ""}" data-nav="${t.path}" aria-label="${t.id}"${isActive ? ' aria-current="page"' : ""}>
      <span class="nav-icon">${icon(t.icon, 22, isActive ? 2.5 : 2)}</span>
    </button>`;
  }).join("");
  return `<div class="nav-wrap"><div class="nav-pill"><span class="nav-pill-fill" id="nav-pill"></span>${html}</div></div>`;
}

export function mobileFrame(viewHtml, applyPadding = true) {
  const path = getCurrentPath();
  const isAdmin = path.startsWith("/admin");
  const isDeepChatRoom = /^\/chat\/.+/.test(path) && path !== "/chat";
  const showNav = state.user && !isAdmin && !isDeepChatRoom;
  // Login/Register don't show nav even when a stale user is signed in
  const pubAuthOnly = path === "/login" || path === "/register";
  if (showNav && !pubAuthOnly) {
    return `<div class="frame-wrap"><div class="phone">
      <div class="phone-scroll">${viewHtml}</div>${bottomNavHtml(path)}
    </div></div>`;
  }
  return `<div class="frame-wrap"><div class="phone"><div class="phone-scroll">${viewHtml}</div></div></div>`;
}

function adminShell(activePath, bodyHtml) {
  const items = [
    { label: "Dashboard", path: "/admin", icon: "layoutDashboard" },
    { label: "Students", path: "/admin/students", icon: "users" },
    { label: "MCQ Bank", path: "/admin/mcq", icon: "fileQuestion" },
    { label: "Subjects", path: "/admin/subjects", icon: "bookOpen" },
    { label: "Settings", path: "/admin/settings", icon: "settings" },
  ];
  const nav = items.map((it) =>
    `<a href="#${it.path}" class="${activePath === it.path ? "active" : ""}">${icon(it.icon, 18)}<span>${it.label}</span></a>`
  ).join("");
  const title = activePath === "/admin" ? "Dashboard" : activePath.split("/").pop();
  return `<div class="admin-wrap">
    <aside class="admin-side">
      <div class="admin-brand"><div class="circle-icon-sm av-yellow"><span class="bold">A</span></div><h1>Admin Panel</h1></div>
      <nav class="admin-nav">${nav}</nav>
      <div class="admin-exit"><a href="#/" class="admin-nav-exit" style="display:flex;align-items:center;gap:.75rem;padding:.75rem 1rem;border-radius:var(--radius-md);color:var(--text-muted);font-weight:600;font-size:14px;">${icon("logout", 18)}<span>Exit to App</span></a></div>
    </aside>
    <main class="admin-main">
      <header class="admin-head"><h2 class="capitalize">${title}</h2>
        <span class="chip chip-green">Super Admin</span></header>
      <div class="admin-body" id="admin-body">${bodyHtml}</div>
    </main>
  </div>`;
}

// Shown when the user IS authenticated but the users/{uid} read was denied.
// Deliberately not a /login redirect: re-authenticating cannot fix a rules
// problem, and bouncing to login just hides the real cause.
function renderRulesDenied(code) {
  const app = document.getElementById("app");
  if (!app) return;
  app.innerHTML = `<div class="view" style="display:flex;align-items:center;justify-content:center;min-height:100dvh;padding:2rem">
    <div class="empty-state" role="alert" style="max-width:24rem">
      <h3>Firestore rules blocked your profile</h3>
      <p class="muted sm mt-2">You are signed in, but the app was denied access to your own user document (<code>${esc(code)}</code>). The deployed security rules are out of date.</p>
      <p class="muted sm mt-2">Publish the current rules, then reload:</p>
      <p class="muted sm mt-2"><code style="font-size:12px">firebase deploy --only firestore:rules</code></p>
      <div class="flex gap-3 justify-center mt-5">
        <button class="btn btn-dark" id="rules-retry">Reload</button>
      </div>
    </div>
  </div>`;
  app.querySelector("#rules-retry")?.addEventListener("click", () => location.reload());
  document.getElementById("nav-wrap")?.remove();
}

async function renderRoute() {
  const { parts, raw } = parsePath();
  const app = document.getElementById("app");

  // run previous view's cleanup (unsubscribe firestore, clear timers)
  if (currentCleanup) { try { currentCleanup(); } catch (e) { console.error(e); } currentCleanup = null; }

  // Admin routes -- authentication AND the admin custom claim. Hiding the nav
  // is not security; this stops a normal student rendering an admin shell at
  // all. firestore.rules is still the real boundary.
  if (parts[0] === "admin") {
    if (!isAuthorized()) { location.hash = "/login"; return; }
    if (!(await isAdmin())) {
      app.innerHTML = `<div class="empty-state" role="alert"><h3>Admins only</h3>
        <p>Your account doesn't have access to this area.</p></div>`;
      document.title = "Admins only — Exam Prep";
      return;
    }
    const sub = parts[1] || "dashboard";
    const activePath = "/admin" + (sub === "dashboard" ? "" : "/" + sub);
    const entry = ADMINS.includes(sub) ? views["/admin/" + sub] : null;
    let view = null;
    // Same guard as the main path: an unguarded load() rejection here would
    // propagate out of renderRoute and blank the whole app.
    if (entry) {
      try {
        view = entry.load ? await entry.load() : entry;
      } catch (e) {
        console.error("admin route load failed:", e);
        document.title = "Couldn't load — Exam Prep";
        app.innerHTML = `<div class="empty-state" role="alert" style="padding:2rem">
          <h3>Couldn&rsquo;t load this page</h3>
          <p class="muted sm mt-2">Check your connection and go back.</p>
          <button class="btn btn-dark mt-5" data-nav="/">Go Home</button>
        </div>`;
        makeNavigable(app);
        return;
      }
    }
    const body = view?.render
      ? await view.render({})
      : `<div class="empty-state"><h3>Coming soon</h3></div>`;
    document.title = `${activePath.split("/").pop() || "Admin"} — Exam Prep`;
    app.innerHTML = adminShell(activePath, body);
    makeNavigable(app);
    attachAdmin(view, app);
    return;
  }

  // Student routes
  const route = matchRoute(parts);
  if (!route) {
    document.title = "Page not found — Exam Prep";
    app.innerHTML = `<div class="frame-wrap"><div class="phone"><div class="phone-scroll">
      <div class="empty-state" style="padding-top:8rem">
        <span style="color:var(--text-faint)">${icon("search", 48)}</span>
        <h3 class="h3-sm mt-4 mb-1">Page not found</h3>
        <p class="sm muted" style="text-align:center;max-width:18rem">
          <code style="font-size:12px">${esc(raw)}</code> doesn't exist.
        </p>
        <button class="btn btn-dark mt-5" data-nav="/">Go Home</button>
      </div>
    </div></div></div>`;
    return;
  }

  const view = views[route.key];
  if (view.protected && !isAuthorized()) {
    // Authenticated but the users/{uid} read was denied: sending them to
    // /login asks them to do something that cannot help. Say what is wrong.
    if (state.authUser && state.userDocError) {
      renderRulesDenied(state.userDocError);
      return;
    }
    location.hash = "/login";
    return;
  }

  // Public-only routes redirect signed-in users home
  if ((route.key === "/login" || route.key === "/register") && isAuthorized()) {
    location.hash = "/";
    return;
  }

  navStack.push(raw);

  let v;
  try {
    v = view.load ? await view.load() : view;
  } catch (e) {
    console.error(e);
    app.innerHTML = mobileFrame(`<div class="empty-state" style="padding-top:8rem">
      <h3>Couldn&rsquo;t load this page</h3>
      <p class="muted sm mt-2">Check your connection and go back.</p>
      <button class="btn btn-dark mt-5" data-nav="/">Go Home</button>
    </div>`);
    return;
  }

  let html;
  try {
    html = v.render ? await v.render(route.params) : `<!-- empty -->`;
  } catch (e) {
    console.error(e);
    html = `<div class="empty-state"><h3>Something went wrong</h3><p class="muted sm mt-2">${esc(e.message)}</p></div>`;
  }
  app.innerHTML = mobileFrame(html);
  afterRender(app, dirFor(lastPath, raw));
  document.title = `${viewTitle(route.key)} — Exam Prep`;

  if (v.mount) {
    const el = app.querySelector(".view");
    try {
      const ret = v.mount(el, route.params);
      if (typeof ret === "function") currentCleanup = ret;
    } catch (e) { console.error(e); }
  }
  lastPath = raw;
}

const TITLES = {
  "/": "Home", "/practice": "Practice", "/leaderboard": "Leaderboard", "/chat": "Messages",
  "/profile": "Profile", "/settings": "Settings", "/analytics": "Analytics", "/daily": "Daily Practice",
  "/bookmarks": "Bookmarks", "/notifications": "Notifications", "/login": "Sign In", "/register": "Create Account",
  "/test/active": "Test", "/test/result": "Your Result", "/practice/weak-topics": "Weak Topics",
};
function viewTitle(key) {
  return TITLES[key] || key.split("/").filter(Boolean).pop()?.replace(/[-_]/g, " ") || "Exam Prep";
}

// Post-render wiring: slide direction, sliding nav pill, count-up numbers
function afterRender(app, dir) {
  const scroll = app.querySelector(".phone-scroll");
  if (scroll) {
    if (dir) scroll.dataset.dir = dir;
    else delete scroll.dataset.dir;
  }
  makeNavigable(app);
  syncNavPill(app);
  countUpAll(app);
  app.querySelectorAll(".bar-fill[data-w]").forEach((el) => {
    el.style.transform = `scaleX(${el.dataset.w})`;
  });
}

// Pill geometry only — safe to call on resize without restarting animations
function syncNavPill(app) {
  const pill = app.querySelector("#nav-pill");
  if (!pill) return;
  const active = app.querySelector(".nav-tab.active");
  if (!active) { pill.style.setProperty("--pill-w", "0px"); return; }
  pill.style.setProperty("--pill-x", active.offsetLeft + "px");
  pill.style.setProperty("--pill-w", active.offsetWidth + "px");
}

function attachAdmin(view, app) {
  if (!view?.mount) return;
  const el = app.querySelector("#admin-body");
  if (!el) return;
  try {
    const ret = view.mount(el, {});
    if (typeof ret === "function") currentCleanup = ret;
  } catch (e) { console.error(e); }
}
// Global click delegation -----------------------------------------
document.addEventListener("click", (e) => {
  const nav = e.target.closest("[data-nav]");
  if (nav) {
    e.preventDefault();
    navigate(nav.getAttribute("data-nav"));
    return;
  }
  const ext = e.target.closest("[data-href]");
  if (ext) {
    e.preventDefault();
    location.hash = ext.getAttribute("data-href");
  }
});

// Cards are authored as <div data-nav>, which are unreachable by keyboard.
// Promote them to role=button+tabindex on every render so the whole app is
// keyboard-navigable without touching each view's markup.
const FOCUSABLE_TAGS = new Set(["BUTTON", "A", "INPUT", "SELECT", "TEXTAREA"]);
function makeNavigable(root) {
  root.querySelectorAll("[data-nav]").forEach((el) => {
    if (FOCUSABLE_TAGS.has(el.tagName)) return;
    el.setAttribute("role", "button");
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "0");
  });
}

// Enter/Space activate the promoted cards (native <button>/<a> do this already).
// Only when the event target IS the card: a card may contain a nested control,
// and hijacking its keystrokes would fire navigation *and* the inner action.
document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  if (e.altKey || e.ctrlKey || e.metaKey) return;
  const el = e.target.closest?.("[data-nav]");
  if (!el || FOCUSABLE_TAGS.has(el.tagName)) return;
  // let the inner control keep the keystroke
  if (e.target !== el) return;
  if (e.target.isContentEditable) return;
  e.preventDefault();
  navigate(el.getAttribute("data-nav"));
});

export async function start() {
  navStack = [];
  // The skip link must not fall through to the hash router: "#app" would be
  // parsed as the route "/app" and 404 the page out from under the user.
  const skip = document.getElementById("skip-link");
  const app = document.getElementById("app");
  if (skip && app) {
    skip.addEventListener("click", (e) => {
      e.preventDefault();
      if (!app.hasAttribute("tabindex")) app.setAttribute("tabindex", "-1");
      app.focus({ preventScroll: true });
      app.scrollIntoView({ block: "start" });
    });
  }
  window.addEventListener("hashchange", () => renderRoute());
  window.addEventListener("resize", () => syncNavPill(document.getElementById("app")));
  await renderRoute();
}