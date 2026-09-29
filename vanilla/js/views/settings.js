import { state, logoutUser, esc, trapFocus } from "../api.js";
import { icon } from "../icons.js";

let modal = null;

export const settings = {
  protected: true,
  render: () => {
    const handle = (state.user?.username || "").trim();
    return `
    <div class="view pb-safe flex flex-col" style="background:var(--surface-muted)">
      <div style="padding:3rem 1.5rem 1rem;background:var(--surface);box-shadow:var(--shadow);position:sticky;top:0;z-index:10;display:flex;align-items:center;gap:1rem;border-bottom:1px solid var(--border)">
        <button class="icon-btn icon-btn-soft-muted" data-nav="/profile" aria-label="Go back to profile">${icon("chevronLeft", 24)}</button>
        <h2 class="h3-sm">Settings</h2>
      </div>

      <div class="px-4 py-6 space-y-6" id="settings-body">
        <div class="settings-group">
          <h3>Account</h3>
          <div class="settings-card">
            ${handle ? `
            <div class="set-row">
              <div class="l">
                <div class="set-icon" style="background:var(--tint-teal);color:var(--teal-ink)">${icon("user", 20)}</div>
                <div>
                  <div style="font-weight:500;font-size:15px">Username</div>
                  <div class="xxs semibold" style="color:var(--teal-ink)">@${esc(handle)}</div>
                </div>
              </div>
              <div class="flex gap-2" style="flex-shrink:0">
                <button class="icon-btn icon-btn-soft-muted" id="copy-username" aria-label="Copy username">${icon("copy", 18)}</button>
                <button class="icon-btn icon-btn-soft-muted" id="share-username" aria-label="Share username">${icon("share", 18)}</button>
              </div>
            </div>` : ""}
            <button class="set-row" data-modal="Language">
              <div class="l"><div class="set-icon" style="background:var(--tint-teal);color:var(--teal-ink)">${icon("globe", 20)}</div><span>Language</span></div>
              <span class="muted sm semibold">English</span>
            </button>
            <button class="set-row" data-modal="Privacy &amp; Security">
              <div class="l"><div class="set-icon" style="background:var(--tint-lime);color:var(--lime-ink)">${icon("lock", 20)}</div><span>Privacy &amp; Security</span></div>
              <span style="color:var(--text-faint);transform:rotate(180deg)">${icon("chevronLeft", 20)}</span>
            </button>
            <button class="set-row" data-modal="Notifications">
              <div class="l"><div class="set-icon" style="background:var(--tint-pink);color:var(--pink-ink)">${icon("bell", 20)}</div><span>Notifications</span></div>
              <span style="color:var(--text-faint);transform:rotate(180deg)">${icon("chevronLeft", 20)}</span>
            </button>
          </div>
        </div>

        <div class="settings-group">
          <h3>Display &amp; Appearance</h3>
          <div class="settings-card">
            <button class="set-row" id="theme-toggle">
              <div class="l"><div class="set-icon" style="background:var(--tint-lime);color:var(--lime-ink)">${icon("moon", 20)}</div><span>Dark Mode</span></div>
              <div class="toggle" id="theme-knob"><div class="knob"></div></div>
            </button>
          </div>
        </div>

        <div class="settings-group">
          <h3>Support</h3>
          <div class="settings-card">
            <button class="set-row" data-modal="Help Center">
              <div class="l"><div class="set-icon" style="background:var(--tint-teal);color:var(--teal-ink)">${icon("help", 20)}</div><span>Help Center</span></div>
              <span style="color:var(--text-faint);transform:rotate(180deg)">${icon("chevronLeft", 20)}</span>
            </button>
            <button class="set-row" data-modal="About App">
              <div class="l"><div class="set-icon" style="background:var(--surface-grey);color:var(--text-muted)">${icon("info", 20)}</div><span>About App</span></div>
              <span style="color:var(--text-faint);transform:rotate(180deg)">${icon("chevronLeft", 20)}</span>
            </button>
          </div>
        </div>

        <div id="devtools-section" class="settings-group" hidden>
          <h3>Developer</h3>
          <div class="settings-card">
            <button class="set-row" id="devlog-toggle" role="switch" aria-checked="false">
              <div class="l"><div class="set-icon" style="background:var(--surface-grey);color:var(--text-muted)">${icon("terminal", 20)}</div><span>Show Console Log</span></div>
              <div class="toggle" id="devlog-knob"><div class="knob"></div></div>
            </button>
          </div>
          <p class="dev-unlock-hint">A “LOG” button appears on every screen.</p>
        </div>

        <div class="pt-2 space-y-4">
          <button class="btn btn-white" id="settings-logout" style="width:100%;color:var(--pink-ink)">Log Out</button>
          <button class="w-full flex items-center justify-center gap-2 semibold" style="color:var(--pink-ink);padding:.5rem" data-modal="Delete Account">${icon("trash", 18)} Delete Account</button>
          <button class="dev-version" id="dev-version">Exam Prep · v1.0.0</button>
        </div>
      </div>
      <div id="modal-root"></div>
    </div>`;
  },
  mount: (el) => {
    const body = el;
    const knob = el.querySelector("#theme-knob");
    const toggle = el.querySelector("#theme-toggle");
    // Read the live theme on every mount. The module is cached across
    // navigations, so module scope would go stale after a toggle or an OS
    // theme change.
    let dark = document.documentElement.dataset.theme !== "light";
    // Paint the knob to match reality; only the click handler persists.
    knob.classList.toggle("on", dark);
    toggle.setAttribute("aria-pressed", String(dark));

    toggle.addEventListener("click", () => {
      dark = !dark;
      document.documentElement.dataset.theme = dark ? "dark" : "light";
      localStorage.setItem("school-theme", dark ? "dark" : "light");
      knob.classList.toggle("on", dark);
      toggle.setAttribute("aria-pressed", String(dark));
    });

    el.querySelector("#settings-logout").addEventListener("click", async () => {
      await logoutUser();
      location.hash = "/login";
    });

    /* ---- Username copy / share ----
       The handle is the only way another student can find you in chat, and
       until now it was visible on no screen at all after signup. */
    const handle = (state.user?.username || "").trim();
    const copyBtn = el.querySelector("#copy-username");
    if (handle && copyBtn) {
      const text = `@${handle}`;
      const flash = (btn, ok) => {
        const was = btn.innerHTML;
        btn.innerHTML = icon(ok ? "check" : "x", 18);
        setTimeout(() => { btn.innerHTML = was; }, 1400);
      };
      // navigator.clipboard needs a secure context; plain http on a LAN IP is
      // not one, and that is exactly how this gets tested on a phone -- so the
      // textarea fallback is the path that will actually run.
      const copy = async (btn) => {
        if (navigator.clipboard && window.isSecureContext) {
          try {
            await navigator.clipboard.writeText(text);
            return flash(btn, true);
          } catch (e) { /* fall through to the textarea */ }
        }
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
        document.body.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, text.length);
        let ok = false;
        try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
        ta.remove();
        flash(btn, ok);
      };

      copyBtn.addEventListener("click", () => copy(copyBtn));
      el.querySelector("#share-username")?.addEventListener("click", async (e) => {
        const btn = e.currentTarget;
        if (!navigator.share) return copy(btn);
        try {
          await navigator.share({ title: "My username", text, url: location.href });
        } catch (err) {
          if (err && err.name !== "AbortError") copy(btn);
        }
      });
    }

    el.querySelectorAll("[data-modal]").forEach((b) =>
      b.addEventListener("click", () => showModal(body, b.dataset.modal))
    );

    /* ---- Developer Options ----
       Hidden until the version line is tapped 7 times, Android-style. Keeps
       the entry point out of the way for normal users while staying
       discoverable for someone debugging on a phone. */
    const devSection = el.querySelector("#devtools-section");
    const devToggle = el.querySelector("#devlog-toggle");
    const devKnob = el.querySelector("#devlog-knob");
    const dev = window.__dev;
    let taps = 0, tapTimer = null;

    const paintDev = () => {
      const on = dev.isEnabled();
      devKnob.classList.toggle("on", on);
      devToggle.setAttribute("aria-checked", String(on));
      devSection.hidden = !(dev.isUnlocked() || on);
    };

    el.querySelector("#dev-version").addEventListener("click", () => {
      taps++;
      clearTimeout(tapTimer);
      tapTimer = setTimeout(() => { taps = 0; }, 1200);
      if (taps >= 7) {
        taps = 0;
        dev.unlock();
        devSection.hidden = false;
        devToggle.focus();
      }
    });

    devToggle.addEventListener("click", () => {
      const next = !dev.isEnabled();
      if (next) dev.enable(); else dev.disable();
      paintDev();
    });

    paintDev();

    document.addEventListener("keydown", onKey);
    // Route changes call this: the document-level Escape listener must not
    // outlive the view, or it fires against whatever #modal-root is next.
    return () => {
      document.removeEventListener("keydown", onKey);
      clearTimeout(tapTimer);
      closeModal();
    };
  },
};

function onKey(e) {
  if (e.key === "Escape" && modal) closeModal();
}

// `modal` must be an object, not the title string: these are ES modules, so
// assigning a property to a string primitive throws a TypeError.
function showModal(body, title) {
  const isDelete = title === "Delete Account";
  const opener = document.activeElement;
  modal = { title, opener };
  body.querySelector("#modal-root").innerHTML = `
    <div class="modal-overlay" id="modal-overlay">
      <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h3 id="modal-title">${esc(title)}</h3>
        <p class="desc">${isDelete ? "Are you sure you want to permanently delete your account and all data?" : `You can configure your ${esc(title)} preferences here.`}</p>
        <div class="flex gap-3">
          <button class="btn btn-white flex-1" id="modal-cancel">Cancel</button>
          <button class="btn flex-1" id="modal-ok" style="background:${isDelete ? "var(--color-pink)" : "var(--dark)"};color:${isDelete ? "var(--on-accent)" : "var(--on-primary)"};padding:.75rem">${isDelete ? "Delete" : "Save"}</button>
        </div>
      </div>
    </div>`;
  const overlay = body.querySelector("#modal-overlay");
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });
  body.querySelector("#modal-cancel").addEventListener("click", closeModal);
  body.querySelector("#modal-ok").addEventListener("click", closeModal);
  body.querySelector("#modal-overlay").addEventListener("keydown", trapFocus);
  body.querySelector("#modal-cancel").focus();
}

function closeModal() {
  const root = document.querySelector("#modal-root");
  if (root) root.innerHTML = "";
  // hand focus back to whatever opened the dialog
  if (modal && modal.opener && modal.opener.isConnected) modal.opener.focus();
  modal = null;
  // NB: do not remove the `onKey` listener here. mount() adds it once and the
  // view cleanup removes it; dropping it on close left the 2nd+ modal unable
  // to close with Escape.
}