import { signInWithGoogle, resolveRedirectResult, waitForUser } from "../api.js";
import { blob } from "../blob.js";
import { GOOGLE_SVG, spinner } from "../icons.js";

export const login = {
  render: () => `
    <div class="view grad-mood" style="padding: 6rem 1.5rem 1.5rem">
      <div class="flex-1 flex flex-col items-center justify-center">
        ${blob("happy", 192)}
        <div class="card card-pad-lg" style="width:100%; margin-top: 1.5rem">
          <h1 style="font-size:24px;font-weight:600;">Welcome Back</h1>
          <p class="muted sm mb-4" style="margin-bottom:1.5rem">Let&apos;s continue your exam preparation.</p>
          <div id="login-error" class="form-error hidden"></div>
          <button id="google-login" class="google-btn">${GOOGLE_SVG}<span>Sign In with Google</span></button>
          <p class="text-center sm mt-4 mb-0"><span class="muted">Don&apos;t have an account? </span><a href="#/register" class="text-btn">Register</a></p>
        </div>
      </div>
    </div>`,
  mount: (el) => {
    const btn = el.querySelector("#google-login");
    const err = el.querySelector("#login-error");
    const go = async (res) => {
      if (!res) return false;
      // redirected = the whole tab left for Google; boot page picks it up on return
      if (res.redirected) return true;
      if (!res.exists) { location.hash = "/register"; return true; }
      await waitForUser(); // avoid navigating home before the user snapshot arrives
      location.hash = "/";
      return true;
    };
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      btn.innerHTML = spinner(24);
      err.classList.add("hidden");
      try {
        const res = await signInWithGoogle();
        // redirected means the whole tab left for Google; boot page on return
        if (await go(res)) return;
      } catch (e) {
        if (e.code !== "auth/popup-closed-by-user") {
          err.textContent = e.message || "Login failed. Please try again.";
          err.classList.remove("hidden");
        }
        btn.innerHTML = `${GOOGLE_SVG}<span>Sign In with Google</span>`;
        btn.disabled = false;
      }
    });
    // landing back after a redirect-based sign-in
    (async () => {
      if (await go(await resolveRedirectResult())) return;
      btn.innerHTML = `${GOOGLE_SVG}<span>Sign In with Google</span>`;
      btn.disabled = false;
    })();
  },
};