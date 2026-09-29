import { signInWithGoogle, createUserProfile, usernameAvailable, resolveRedirectResult, waitForUser, state } from "../api.js";
import { blob } from "../blob.js";
import { GOOGLE_SVG, spinner } from "../icons.js";

export const register = {
  render: () => `
    <div class="view grad-dashboard" style="padding: 4rem 1.5rem 1.5rem">
      <div class="flex-1 flex flex-col items-center justify-center">
        ${blob("balanced", 128)}
        <div class="card card-pad-lg" style="width:100%; margin-top:1.5rem">
          <h1 style="font-size:24px;font-weight:600;">Create Account</h1>
          <p class="muted sm" style="margin-bottom:1.5rem">Start your learning journey today.</p>
          <div id="reg-error" class="form-error hidden"></div>

          <div id="reg-step1">
            <button id="google-signup" class="google-btn">${GOOGLE_SVG}<span>Continue with Google</span></button>
            <p class="text-center sm mt-4"><span class="muted">Already have an account? </span><a href="#/login" class="text-btn">Sign In</a></p>
          </div>

          <form id="reg-step2" class="hidden space-y-4" novalidate>
            <div class="field">
              <label for="reg-name">Full Name</label>
              <input type="text" id="reg-name" name="name" placeholder="John Doe" autocomplete="name" required />
              <p class="feed" id="reg-name-err" role="alert"></p>
            </div>
            <div class="field">
              <label for="reg-username">Choose a Username</label>
              <div class="input-wrap">
                <span class="at" aria-hidden="true">@</span>
                <input type="text" id="reg-username" name="username" placeholder="johndoe" required autocomplete="off" minlength="3" maxlength="20" aria-describedby="reg-username-err" />
                <span class="status" id="username-status" aria-hidden="true"></span>
              </div>
              <div class="feed muted" id="reg-username-err" role="status"></div>
            </div>
            <button type="submit" id="complete-profile" class="btn btn-dark btn-lg mt-4">Complete Profile</button>
          </form>
        </div>
      </div>
    </div>`,
  mount: (el) => {
    const step1 = el.querySelector("#reg-step1");
    const step2 = el.querySelector("#reg-step2");
    const nameIn = el.querySelector("#reg-name");
    const userIn = el.querySelector("#reg-username");
    const status = el.querySelector("#username-status");
    const feed = el.querySelector("#reg-username-err");
    const nameFeed = el.querySelector("#reg-name-err");
    const err = el.querySelector("#reg-error");
    const submit = el.querySelector("#complete-profile");

    let googleUser = null;
    let isAvailable = null;
    let isChecking = false;

    const showErr = (msg) => { err.textContent = msg; err.classList.remove("hidden"); };
    const hideErr = () => err.classList.add("hidden");

    el.querySelector("#google-signup").addEventListener("click", async (e) => {
      const btn = e.currentTarget;
      btn.disabled = true;
      btn.innerHTML = spinner(24);
      hideErr();
      try {
        const res = await signInWithGoogle();
        if (res?.redirected) return; // tab navigating to Google
        if (res?.exists) { await waitForUser(); location.hash = "/"; return; }
        googleUser = res?.firebaseUser;
        nameIn.value = googleUser.displayName || "";
        step1.classList.add("hidden");
        step2.classList.remove("hidden");
      } catch (err2) {
        if (err2.code !== "auth/popup-closed-by-user") showErr(err2.message || "Failed to authenticate with Google");
        btn.innerHTML = `${GOOGLE_SVG}<span>Continue with Google</span>`;
        btn.disabled = false;
      }
    });

    // landing back after a redirect-based sign-in
    (async () => {
      const res = await resolveRedirectResult();
      if (!res) return;
      if (res.exists) { await waitForUser(); location.hash = "/"; return; }
      googleUser = res.firebaseUser;
      nameIn.value = googleUser.displayName || "";
      step1.classList.add("hidden");
      step2.classList.remove("hidden");
    })();

    // username availability check with debounce
    let timer;
    userIn.addEventListener("input", () => {
      const v = userIn.value.replace(/[^a-zA-Z0-9_]/g, "");
      userIn.value = v;
      clearTimeout(timer);
      if (v.length < 3) {
        isAvailable = null; isChecking = false;
        status.innerHTML = "";
        feed.className = "feed muted";
        feed.textContent = v.length > 0 ? "Username must be at least 3 characters." : "";
        return;
      }
      if (v.length > 20) {
        isAvailable = null; isChecking = false;
        status.innerHTML = "";
        feed.className = "feed red";
        feed.textContent = "Username must be 20 characters or fewer.";
        return;
      }
      isChecking = true;
      status.innerHTML = spinner(18);
      feed.className = "feed muted";
      feed.textContent = "Checking availability...";
      timer = setTimeout(async () => {
        let ok;
        try {
          ok = await usernameAvailable(v);
        } catch (e) {
          console.error("register: username check failed", e);
          isChecking = false;
          isAvailable = null;
          status.innerHTML = "";
          feed.className = "feed red";
          feed.textContent = "Couldn't check that username. Try again.";
          return;
        }
        isChecking = false;
        isAvailable = ok;
        if (ok) {
          status.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--teal-ink)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="Available"><path d="M20 6 9 17l-5-5"/></svg>`;
          feed.className = "feed green";
          feed.textContent = "Username is available!";
          userIn.classList.remove("err");
        } else {
          status.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--pink-ink)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="Not available"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;
          feed.className = "feed red";
          feed.textContent = "That username is taken. Try another.";
          userIn.classList.add("err");
        }
      }, 500);
    });

    step2.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!googleUser) return;

      // Specific messages, not one generic failure string.
      const name = nameIn.value.trim();
      if (name.length < 2) {
        nameFeed.className = "feed red";
        nameFeed.textContent = "Please enter your full name (at least 2 characters).";
        nameIn.classList.add("err");
        nameIn.focus();
        return;
      }
      nameFeed.textContent = "";
      nameIn.classList.remove("err");

      const handle = userIn.value.trim().toLowerCase();
      if (handle.length < 3) {
        feed.className = "feed red";
        feed.textContent = "Username must be at least 3 characters.";
        userIn.focus();
        return;
      }
      if (isChecking) {
        feed.className = "feed red";
        feed.textContent = "Still checking that username — one moment.";
        return;
      }
      if (isAvailable === false) { showErr("Please choose an available username."); return; }
      if (isAvailable === null) {
        showErr("Confirm your username is available before continuing.");
        return;
      }
      hideErr();
      submit.disabled = true;
      submit.innerHTML = spinner(22);
      try {
        // Re-check: the debounce result can be minutes stale by submit time.
        const ok = await usernameAvailable(handle);
        if (!ok) {
          showErr("That username was just taken. Please choose another.");
          isAvailable = false;
          submit.disabled = false;
          submit.textContent = "Complete Profile";
          return;
        }
        await createUserProfile({
          uid: googleUser.uid,
          name,
          username: handle,
          email: googleUser.email || "",
        });
        // set the user doc optimistically so the protected home route doesn't bounce to /login
        state.user = {
          uid: googleUser.uid,
          name,
          username: handle,
          email: googleUser.email || "",
          class: "12th Grade",
          board: "CBSE",
          subjects: [],
          totalPoints: 0,
          rank: 0,
          questionsAttempted: 0,
          testsCompleted: 0,
          correctAnswers: 0,
          accuracy: 0,
          badges: [],
          streak: 0,
          status: "active",
        };
        location.hash = "/";
      } catch (err2) {
        console.error(err2);
        showErr(err2.message || "Failed to complete registration");
        submit.disabled = false;
        submit.textContent = "Complete Profile";
      }
    });
  },
};