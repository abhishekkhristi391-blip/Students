// Global app state + auth + firestore helpers
// (mirrors src/context/AuthContext.tsx + points persistence)
import {
  onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, signOut,
  doc, getDoc, setDoc, updateDoc, writeBatch, onSnapshot, increment, serverTimestamp,
  auth, db, googleProvider,
} from "./firebase.js";

export const state = {
  user: null,          // current Firestore user doc (real-time)
  authUser: null,      // firebase auth user
  ready: false,
  // Firestore error code from the users/{uid} stream, or null. Distinguishes
  // "rules denied the read" from "not signed in" -- they look identical from
  // state.user alone but need completely different fixes.
  userDocError: null,
};

const authListeners = new Set();
const userListeners = new Set();

// Subscribe once: listen to auth state, then stream the users/{uid} doc.
export function initStore() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (firebaseUser) => {
      state.authUser = firebaseUser;

      if (firebaseUser) {
        const unsub = onSnapshot(doc(db, "users", firebaseUser.uid), (snap) => {
          state.user = snap.exists() ? snap.data() : null;
          state.userDocError = null;
          state.ready = true;
          notifyAuth();
          resolve(true);
        }, (err) => {
          // Don't deadlock the boot spinner if the doc can't load.
          // A rules failure is NOT "signed out": the user is authenticated, so
          // nulling state.user silently bounced them to /login and told them to
          // sign in again, which cannot possibly help. Record the cause so the
          // UI can say what is actually wrong.
          state.userDocError = err && err.code ? err.code : "unknown";
          console.error(
            `[auth] authenticated as ${firebaseUser.uid} but users/{uid} was ` +
            `denied (${state.userDocError}). The deployed Firestore rules are ` +
            `almost certainly stale -- run: firebase deploy --only firestore:rules`
          );
          state.user = null;
          state.ready = true;
          notifyAuth();
          resolve(true);
        });
        userListeners.add(unsub);
      } else {
        state.user = null;
        state.ready = true;
        notifyAuth();
        resolve(true);
      }
    });
  });
}

export function onAuthChange(cb) {
  authListeners.add(cb);
  if (state.ready) cb(state.user);
  return () => authListeners.delete(cb);
}

// Resolve once the user doc has streamed in (post-login / post-registration), else after timeout.
export function waitForUser(timeout = 3000) {
  return new Promise((resolve) => {
    if (state.user) return resolve(state.user);
    const un = onAuthChange((u) => { if (u) { un(); resolve(u); } });
    setTimeout(() => { un(); resolve(state.user); }, timeout);
  });
}

function notifyAuth() {
  authListeners.forEach((cb) => cb(state.user));
}

export function isAuthorized() {
  return !!state.user;
}

// Firebase surfaces a dozen failure modes behind one rejected promise. Showing
// "check your connection" for all of them hid a missing composite index
// (failed-precondition) behind a network message, which cost real debugging
// time -- so name the actual cause.
const FIREBASE_ERRORS = {
  "permission-denied": "Your account doesn't have permission to do that. Check the Firestore rules.",
  "failed-precondition": "This query needs a Firestore composite index that isn't deployed. Run: firebase deploy --only firestore:indexes",
  "unavailable": "Can't reach Firebase. Check your connection.",
  "deadline-exceeded": "Firebase took too long to respond. Try again.",
  "unauthenticated": "You need to sign in again.",
  "unauthorized": "This project's API key rejected the request. Check the Firebase project settings.",
  "not-found": "That record no longer exists.",
  "already-exists": "That already exists.",
  "resource-exhausted": "Firebase quota reached. Try again later.",
  "aborted": "Conflicting write. Try again.",
  "invalid-argument": "Firebase rejected the request as malformed.",
  "internal": "Firebase had an internal error. Try again.",
  "network-request-failed": "Network request failed. The device may be offline.",
};

export function firebaseError(err, fallback) {
  const code = err && (err.code || err.name);
  const base = FIREBASE_ERRORS[code] || fallback || "Something went wrong.";
  const detail = err && err.message ? String(err.message).slice(0, 200) : "";
  // keep the code visible: it is the only reliable way to diagnose this remotely
  return detail && detail !== base ? `${base} (${code}: ${detail})` : `${base} (${code})`;
}

// UI-level admin gate. Defence-in-depth and convenience only -- the real
// boundary is firestore.rules. Reads the `admin` custom claim, which cannot be
// set by the client (a Firestore `role` field can, so don't trust that).
export async function isAdmin() {
  if (!state.user) return false;
  try {
    const t = await state.user.getIdTokenResult();
    return t.claims?.admin === true;
  } catch (e) {
    console.error("isAdmin: token read failed", e);
    return false;
  }
}

// ---------- Auth actions ----------
async function completeSignIn(firebaseUser) {
  const snap = await getDoc(doc(db, "users", firebaseUser.uid));
  return { exists: snap.exists(), firebaseUser };
}

// Returns { exists, firebaseUser } for a cached Google account, or null.
export async function resolveRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    if (!result?.user) return null;
    return await completeSignIn(result.user);
  } catch {
    return null;
  }
}

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return await completeSignIn(result.user);
  } catch (e) {
    // popup flows break in storage-partitioned browsers; fall back to same-tab redirect
    if (e.code === "auth/popup-closed-by-user") throw e;
    await signInWithRedirect(auth, googleProvider);
    return { redirected: true };
  }
}

export async function logoutUser() {
  await signOut(auth);
}

// ---------- Registration ----------
export async function createUserProfile({ uid, name, username, email }) {
  const lowerUser = username.toLowerCase();
  const batch = writeBatch(db);

  batch.set(doc(db, "users", uid), {
    uid,
    name,
    username: lowerUser,
    email,
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
  });

  batch.set(doc(db, "usernames", lowerUser), { uid });
  await batch.commit();
}

export async function usernameAvailable(username) {
  const lower = username.toLowerCase();
  if (lower.length < 3) return null;
  const snap = await getDoc(doc(db, "usernames", lower));
  return !snap.exists();
}

// ---------- Points / stats persistence ----------
// Mirrors src/services/pointsService.ts
export function calculateTestPoints(correctCount, totalCount, timeTakenSeconds, isDailyChallenge = false) {
  const POINTS_PER_CORRECT = 10;
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  const basePoints = correctCount * POINTS_PER_CORRECT;

  let bonusPoints = 0;
  if (accuracy === 100) bonusPoints += 50;
  else if (accuracy >= 80) bonusPoints += 20;
  if (isDailyChallenge) bonusPoints += 100;
  if (accuracy >= 70 && timeTakenSeconds < totalCount * 30) bonusPoints += 15;

  return {
    basePoints,
    bonusPoints,
    totalPoints: basePoints + bonusPoints,
    accuracy,
    streakMaintained: true,
  };
}

export async function persistTestResult({ correctCount, totalCount, timeTakenSeconds, isDailyChallenge = false }) {
  if (!state.user) return null;
  const p = calculateTestPoints(correctCount, totalCount, timeTakenSeconds, isDailyChallenge);
  const uid = state.user.uid;
  const ref = doc(db, "users", uid);

  // These must not fail silently: a swallowed permission-denied looks exactly
  // like "your points didn't save" with no way to diagnose it.
  await updateDoc(ref, {
    totalPoints: increment(p.totalPoints),
    questionsAttempted: increment(totalCount),
    correctAnswers: increment(correctCount),
    testsCompleted: increment(1),
  }).catch((e) => console.error("persistTestResult: stat write rejected", e.code, e));

  // accuracy update separately (read current, compute, write back)
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const d = snap.data();
    const attempted = (d.questionsAttempted || 0);
    const correct = (d.correctAnswers || 0);
    const acc = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    await updateDoc(ref, { accuracy: acc }).catch((e) => console.error("persistTestResult: accuracy rejected", e.code, e));
  }

  if (!state.user.streak) {
    await updateDoc(ref, { streak: 1 }).catch((e) => console.error("persistTestResult: streak rejected", e.code, e));
  }
  return p;
}

// Persist a single practice answer (correct/wrong) for analytics accuracy
export async function persistPracticeAnswer(correct) {
  if (!state.user) return;
  const ref = doc(db, "users", state.user.uid);
  await updateDoc(ref, {
    questionsAttempted: increment(1),
    correctAnswers: increment(correct ? 1 : 0),
  }).catch((e) => console.error("persistPracticeAnswer: stat write rejected", e.code, e));
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const d = snap.data();
    const attempted = (d.questionsAttempted || 0);
    const correctCount = (d.correctAnswers || 0);
    const acc = attempted > 0 ? Math.round((correctCount / attempted) * 100) : 0;
    await updateDoc(ref, { accuracy: acc }).catch((e) => console.error("persistPracticeAnswer: accuracy rejected", e.code, e));
  }
}

// Animate a number from 0 to its data-count value.
// transform/opacity-free on purpose: this is text, so the only cost is a few
// style writes per frame. One rAF, torn down by the router on re-render.
export function countUp(el, dur = 600) {
  const to = Number(el.dataset.count);
  if (!Number.isFinite(to)) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || dur <= 0) { el.textContent = to.toLocaleString(); return; }
  const t0 = performance.now();
  const tick = (now) => {
    const p = Math.min((now - t0) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
    el.textContent = Math.round(to * eased).toLocaleString();
    if (p < 1) requestAnimationFrame(tick);
  };
  el.textContent = "0";
  requestAnimationFrame(tick);
}

// Drive every [data-count] in a subtree on ONE shared rAF loop.
// Running countUp() per element means N separate rAF callbacks and N
// interleaved text writes per frame; batching keeps it to one write phase.
export function countUpAll(root, dur = 600) {
  const els = [...root.querySelectorAll("[data-count]")];
  if (!els.length) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const targets = els.map((el) => ({ el, to: Number(el.dataset.count) })).filter((t) => Number.isFinite(t.to));
  if (!targets.length) return;
  if (reduce || dur <= 0) {
    targets.forEach((t) => { t.el.textContent = t.to.toLocaleString(); });
    return;
  }
  const t0 = performance.now();
  const tick = (now) => {
    const p = Math.min((now - t0) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    for (const t of targets) t.el.textContent = Math.round(t.to * eased).toLocaleString();
    if (p < 1) requestAnimationFrame(tick);
  };
  targets.forEach((t) => { t.el.textContent = "0"; });
  requestAnimationFrame(tick);
}

// Consistent avatar color per uid (mirrors lib/chat.ts getAvatarColor)
const AVATAR_COLORS = ["av-yellow", "av-teal", "av-coral", "av-purple"];
export function getAvatarColor(uid) {
  let hash = 0;
  for (let i = 0; i < uid.length; i++) hash = uid.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// Escape user-provided strings before inserting into innerHTML
export function esc(v) {
  return String(v == null ? "" : v)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// Keep Tab focus inside an open dialog (WCAG 2.1.2 No Keyboard Trap is the
// opposite requirement — the trap is deliberate, Escape is always the way out).
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';
export function trapFocus(e) {
  if (e.key !== "Tab") return;
  const box = e.currentTarget;
  const items = [...box.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null);
  if (!items.length) return;
  const first = items[0], last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

export { doc, onSnapshot, serverTimestamp };
export const fs = { doc, getDoc, setDoc, updateDoc }; // for views that need direct access