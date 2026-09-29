/* Developer Options console.
 *
 * Hidden by default. Unlock it by tapping the version line in Settings seven
 * times, then flip "Show Console Log" -- only then does the floating button
 * appear. It is a module singleton mounted on document.body, so it survives
 * every route change and is wiped only by a reload, which is the point: you can
 * reproduce a bug on Leaderboard, walk to Profile, and still read the log.
 *
 * Loaded as an external classic script in <head>, so it keeps working even when
 * the app's ES module graph fails to load -- which is exactly when you need it.
 */
(function () {
  "use strict";

  var FLAG = "school-devtools";
  var MAX = 600; // ring buffer cap; a runaway loop must not eat the heap
  var buf = [];
  var bootedAt = 0;
  var panel = null, tab = null, logEl = null, countEl = null;

  var native = {};
  ["log", "info", "warn", "error", "debug"].forEach(function (level) {
    native[level] = console[level].bind(console);
  });

  function now() {
    var d = new Date();
    function p(n, w) {
      return String(n).padStart(w || 2, "0");
    }
    return p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds()) +
      "." + p(d.getMilliseconds(), 3);
  }

  function stringify(v) {
    if (typeof v === "string") return v;
    if (v instanceof Error) return v.name + ": " + v.message;
    if (v === null || v === undefined) return String(v);
    if (typeof v === "object") {
      try {
        if (v instanceof Error) return v.name + ": " + v.message;
        return JSON.stringify(v);
      } catch (e) {
        return "[unserialisable]";
      }
    }
    return String(v);
  }

  function text(args) {
    var out = [];
    for (var i = 0; i < args.length; i++) out.push(stringify(args[i]));
    return out.join(" ");
  }

  var LEVELS = { log: "log", info: "info", debug: "log", warn: "warn", error: "error" };

  function record(level, msg) {
    if (buf.length >= MAX) buf.shift();
    var entry = { t: now(), level: level, msg: msg };
    buf.push(entry);
    if (logEl) render(entry);
    return entry;
  }

  /* ---------- capture ---------- */

  ["log", "info", "warn", "error", "debug"].forEach(function (level) {
    console[level] = function () {
      record(LEVELS[level], text(arguments));
      native[level].apply(null, arguments);
    };
  });

  window.addEventListener("error", function (e) {
    if (e.target && e.target !== window && e.target.src) {
      record("error", "Resource failed to load: " + e.target.src);
      return;
    }
    record("error", e.message + (e.filename ? " @ " + e.filename + ":" + e.lineno : ""));
  }, true);

  window.addEventListener("unhandledrejection", function (e) {
    var r = e.reason;
    record("error", "Unhandled rejection: " + (r && r.message ? r.message : stringify(r)));
  });

  // A blocked inline script or a denied host lands here. This is the signal
  // that identified the CSP outage, so it gets its own loud level.
  document.addEventListener("securitypolicyviolation", function (e) {
    record("error", "CSP BLOCKED " + (e.violatedDirective || "") + " " +
      (e.blockedURI || e.sourceFile || "") + " — " + (e.sample || ""));
  });

  try {
    var po = new PerformanceObserver(function (list) {
      list.getEntries().forEach(function (entry) {
        if (entry.responseStatus >= 400 || entry.responseStatus === 0) {
          record("warn", "HTTP " + entry.responseStatus + " " + entry.name);
        }
      });
    });
    po.observe({ type: "resource", buffered: true });
  } catch (e) { /* no PerformanceObserver: not fatal */ }

  /* ---------- network probe ---------- */

  function probe(url, ms) {
    return new Promise(function (resolve) {
      var done = false;
      var t = setTimeout(function () {
        if (done) return;
        done = true;
        resolve({ url: url, ok: false, note: "timeout after " + ms + "ms" });
      }, ms || 6000);
      fetch(url, { method: "GET", cache: "no-store", mode: "no-cors" })
        .then(function (r) {
          if (done) return;
          done = true; clearTimeout(t);
          // no-cors gives an opaque response, so status is 0 by design
          resolve({ url: url, ok: true, note: "reachable (opaque, status hidden by no-cors)" });
        })
        .catch(function (err) {
          if (done) return;
          done = true; clearTimeout(t);
          resolve({ url: url, ok: false, note: (err && err.message) || "network error" });
        });
    });
  }

  function runNetworkCheck() {
    record("info", "— network check started —");
    var targets = [
      "js/app.js", "js/router.js", "js/api.js", "js/firebase.js",
      "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js",
      "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js",
      "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js"
    ];
    return Promise.all(targets.map(function (u) { return probe(u, 6000); }))
      .then(function (results) {
        results.forEach(function (r) {
          record(r.ok ? "info" : "error", (r.ok ? "OK   " : "FAIL ") + r.url + " — " + r.note);
        });
        return results;
      });
  }

  /* ---------- rendering ---------- */

  function entryHtml(e) {
    var span = document.createElement("span");
    span.className = "devlog-l " + e.level;
    var t = document.createElement("span");
    t.className = "devlog-t";
    t.textContent = e.t;
    var m = document.createElement("span");
    m.className = "devlog-m";
    m.textContent = e.msg;
    span.appendChild(t);
    span.appendChild(m);
    return span;
  }

  // Newest first, so opening the panel shows the failure that just happened
  // without scrolling to hunt for it.
  function render(entry) {
    if (!logEl) return;
    if (entry) logEl.insertBefore(entryHtml(entry), logEl.firstChild);
    while (logEl.childNodes.length > MAX) logEl.removeChild(logEl.lastChild);
    if (countEl) {
      var errs = 0;
      for (var i = 0; i < buf.length; i++) if (buf[i].level === "error") errs++;
      countEl.textContent = buf.length + " entries · " + errs + " errors";
    }
  }

  function redrawAll() {
    if (!logEl) return;
    logEl.textContent = "";
    for (var i = buf.length - 1; i >= 0; i--) logEl.insertBefore(entryHtml(buf[i]), logEl.firstChild);
    render(null);
  }

  function mount() {
    if (tab) return;
    // This file is a classic script in <head>, so mount() can fire (bottom of
    // the IIFE, and from setEnabled) before <body> exists. Defer instead of
    // throwing on document.body being null.
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", mount, { once: true });
      return;
    }
    tab = document.createElement("button");
    tab.id = "devlog-tab";
    tab.type = "button";
    tab.setAttribute("aria-label", "Open developer console log");
    tab.title = "Developer log";
    tab.textContent = "LOG";
    tab.addEventListener("click", function (e) { e.stopPropagation(); togglePanel(); });
    document.body.appendChild(tab);

    panel = document.createElement("div");
    panel.id = "devlog-panel";
    panel.hidden = true;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Developer console log");
    panel.innerHTML =
      '<div class="devlog-bar">' +
        "<strong>Console</strong><span id=\"devlog-count\"></span>" +
        '<button type="button" id="devlog-close" aria-label="Close log">&times;</button>' +
      "</div>" +
      '<div id="devlog-log" role="log" aria-live="polite"></div>' +
      '<div class="devlog-actions">' +
        '<button type="button" id="devlog-copy">Copy all logs</button>' +
        '<button type="button" id="devlog-net">Network check</button>' +
        '<button type="button" id="devlog-clear">Clear</button>' +
      "</div>";
    document.body.appendChild(panel);
    logEl = panel.querySelector("#devlog-log");
    countEl = panel.querySelector("#devlog-count");

    panel.querySelector("#devlog-close").addEventListener("click", function () { togglePanel(false); });
    panel.querySelector("#devlog-clear").addEventListener("click", function () {
      buf.length = 0; redrawAll();
    });
    panel.querySelector("#devlog-net").addEventListener("click", function () { runNetworkCheck(); });
    panel.querySelector("#devlog-copy").addEventListener("click", copyAll);

    redrawAll();
  }

  function unmount() {
    if (panel) { panel.remove(); panel = null; }
    if (tab) { tab.remove(); tab = null; }
    logEl = null; countEl = null;
  }

  function togglePanel(force) {
    if (!panel) return;
    panel.hidden = force === undefined ? !panel.hidden : !force;
    if (!panel.hidden && logEl) logEl.scrollTop = 0;
  }

  function copyAll() {
    var out = buf.map(function (e) { return e.t + "  " + e.level.toUpperCase().padEnd(5) + "  " + e.msg; }).join("\n");
    var header = "Exam Prep developer log — " + buf.length + " entries\n" +
      "userAgent: " + navigator.userAgent + "\n" +
      "url: " + location.href + "\n\n";

    function done(ok) {
      var b = panel && panel.querySelector("#devlog-copy");
      if (!b) return;
      var was = b.textContent;
      b.textContent = ok ? "Copied" : "Copy failed";
      setTimeout(function () { b.textContent = was; }, 1400);
    }

    // navigator.clipboard needs a secure context. Plain http on a LAN IP is
    // not one, and that is exactly how this gets tested on a phone -- so the
    // textarea fallback is the path that will actually run.
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(header + out)
        .then(function () { done(true); })
        .catch(function () { done(legacyCopy(header + out)); });
    } else {
      done(legacyCopy(header + out));
    }
  }

  function legacyCopy(s) {
    var ta = document.createElement("textarea");
    ta.value = s;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, s.length);
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    ta.remove();
    return ok;
  }

  /* ---------- enable / disable ---------- */

  var UNLOCK_FLAG = "school-devtools-unlocked";

  function readFlag(k) {
    try { return localStorage.getItem(k); } catch (e) { return null; }
  }
  function writeFlag(k, v) {
    try { localStorage.setItem(k, v); } catch (e) { /* private mode */ }
  }

  // "unlocked" = the Developer section is visible in Settings (Android keeps
  // these separate). "enabled" = the floating LOG button is on screen.
  function isUnlocked() {
    return readFlag(UNLOCK_FLAG) === "1";
  }

  function isEnabled() {
    return readFlag(FLAG) === "1";
  }

  // No change event: Settings repaints on mount and on click, and the panel is
  // mounted/unmounted here, so there is nothing else that needs to know.
  function setEnabled(on) {
    writeFlag(FLAG, on ? "1" : "0");
    if (on) { mount(); record("info", "Developer console enabled"); }
    else { unmount(); }
    return !!on;
  }

  function unlock() {
    writeFlag(UNLOCK_FLAG, "1");
  }

  function lock() {
    writeFlag(UNLOCK_FLAG, "0");
    writeFlag(FLAG, "0");
    unmount();
  }

  /* ---------- public API ---------- */

  // `__appDiag` is kept because js/app.js already calls into it for boot
  // reporting; __dev is the clearer name for new callers.
  var api = {
    log: function (level, msg) { return record(level || "info", stringify(msg)); },
    booted: function () {
      bootedAt = Date.now();
      record("info", "App booted and painted");
    },
    show: function () { if (isEnabled()) { mount(); togglePanel(true); } },
    isEnabled: isEnabled,
    isUnlocked: isUnlocked,
    enable: function () { return setEnabled(true); },
    disable: function () { return setEnabled(false); },
    unlock: unlock,
    lock: lock,
    runNetworkCheck: runNetworkCheck,
    copyAll: copyAll,
    entries: function () { return buf.slice(); },
    clear: function () { buf.length = 0; redrawAll(); },
  };
  window.__dev = api;
  window.__appDiag = api;

  // Capture is on from the start regardless of visibility: enabling mid-session
  // should show the history that led there, and an array push is far cheaper
  // than the debugging this tool exists to provide.
  if (isEnabled()) mount();
})();
