/* ============================================================
   FIREBASE INIT (Auth + Firestore persistence)
   Apna khud ka Firebase project use karna ho to bas neeche
   'firebaseConfig' object ki values badal do.
   ============================================================ */
const firebaseConfig = {
  apiKey: "AIzaSyAj3Z0Dv5q3ZR31WezZW2n3Wiaxzz4sk6U",
  authDomain: "students-d2341.firebaseapp.com",
  projectId: "students-d2341",
  storageBucket: "students-d2341.firebasestorage.app",
  messagingSenderId: "473088819993",
  appId: "1:473088819993:web:b6638183e10bf977007b88"
};
firebase.initializeApp(firebaseConfig);
const fbAuth = firebase.auth();
const db = firebase.firestore();
let currentUid = null;

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function daysBetween(a, b) {
  const d1 = new Date(a), d2 = new Date(b);
  return Math.round((d2 - d1) / 86400000);
}

/* Loads (or creates) the signed-in user's Firestore profile, applies
   real streak math, and hands control back to render(). Runs once
   per app load after anonymous auth resolves. */
function initUserSession(uid) {
  currentUid = uid;
  const ref = db.collection("users").doc(uid);
  ref.get().then(doc => {
    const data = doc.exists ? doc.data() : {};
    STATE.userName = data.name || null;
    STATE.currentStreak = data.currentStreak || 0;
    STATE.longestStreak = data.longestStreak || 0;
    STATE.lastStudyDate = data.lastStudyDate || null;
    STATE.completedTopics = data.completedTopics || [];
    STATE.lastRead = data.lastRead || null;

    // Seed demo completion state once, from the static content flags,
    // so a brand-new user still sees the sample chapter's progress —
    // after this, completion is driven only by real user interaction.
    if (!doc.exists) {
      const seeded = [];
      APP_DATA.forEach(s => s.chapters.forEach(c => {
        if (c.isCompleted) c.topics.forEach(t => seeded.push(t.id));
      }));
      STATE.completedTopics = seeded;
    }

    // Real streak calculation — runs once per calendar day.
    const today = todayStr();
    if (STATE.lastStudyDate !== today) {
      if (STATE.lastStudyDate && daysBetween(STATE.lastStudyDate, today) === 1) {
        STATE.currentStreak += 1;
      } else {
        STATE.currentStreak = 1;
      }
      STATE.longestStreak = Math.max(STATE.longestStreak, STATE.currentStreak);
      STATE.lastStudyDate = today;
    }

    STATE.userLoaded = true;
    if (!STATE.userName) STATE.onboardingOpen = true;

    persistUser({
      name: STATE.userName || null,
      currentStreak: STATE.currentStreak,
      longestStreak: STATE.longestStreak,
      lastStudyDate: STATE.lastStudyDate,
      completedTopics: STATE.completedTopics,
      lastRead: STATE.lastRead
    });
    render();
  }).catch(err => {
    console.error("Failed to load user profile:", err);
    STATE.userLoaded = true;
    STATE.onboardingOpen = true;
    render();
  });
}

function persistUser(partial) {
  if (!currentUid) return;
  db.collection("users").doc(currentUid).set(partial, { merge: true })
    .catch(err => console.error("Failed to save profile:", err));
}

fbAuth.signInAnonymously().catch(err => console.error("Anonymous sign-in failed:", err));
fbAuth.onAuthStateChanged(user => {
  if (user) initUserSession(user.uid);
});
