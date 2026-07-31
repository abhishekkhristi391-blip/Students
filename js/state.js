/* ============================================================
   GLOBAL STATE
   Poore app ka current data yahan store hota hai (kaunsa page
   khula hai, kaunsa subject select hai, quiz answers, etc.)
   ============================================================ */
const STATE = {
  isDark: localStorage.getItem("notes_isDark") === "true",
  themeId: localStorage.getItem("notes_theme") || "blue",
  tab: "home",           // home | library | progress | settings
  flow: null,           // null | "chapters" | "topicReader" | "quiz"
  subjectId: "science",
  subSectionId: null,
  chapterId: "chem-1",
  activeTopicIndex: 0,
  quizAnswers: {},
  quizSubmitted: false,
  isSpeaking: false,
  aiModalOpen: false,
  aiQuery: "",
  aiResponse: "",

  // --- Real user data (synced with Firestore) ---
  userLoaded: false,          // true once Firestore profile has loaded
  userName: null,             // null until onboarding is completed
  onboardingOpen: false,
  onboardingNameDraft: "",
  currentStreak: 0,
  longestStreak: 0,
  lastStudyDate: null,
  completedTopics: [],        // array of topic ids the user has finished
  lastRead: null,             // { subjectId, subSectionId, chapterId, topicIndex }
  chapterSearch: ""           // chapters-list search query
};

/* ============================================================
   REAL PROGRESS HELPERS
   ============================================================ */
function isTopicDone(topicId) {
  return STATE.completedTopics.includes(topicId);
}
function chapterProgress(chapter) {
  const total = chapter.topics.length;
  const done = chapter.topics.filter(t => isTopicDone(t.id)).length;
  return { done, total, complete: total > 0 && done === total };
}
function toggleTopicComplete(topicId) {
  const idx = STATE.completedTopics.indexOf(topicId);
  if (idx === -1) STATE.completedTopics.push(topicId);
  else STATE.completedTopics.splice(idx, 1);
  persistUser({ completedTopics: STATE.completedTopics });
}
function saveLastRead(subjectId, subSectionId, chapterId, topicIndex) {
  STATE.lastRead = { subjectId, subSectionId, chapterId, topicIndex };
  persistUser({ lastRead: STATE.lastRead });
}

/* ============================================================
   HAPTIC FEEDBACK HELPER
   ============================================================ */
function haptic(intensity = "light") {
  if (!('vibrate' in navigator)) return;
  if (intensity === "light") navigator.vibrate(8);
  else if (intensity === "medium") navigator.vibrate(15);
  else if (intensity === "heavy") navigator.vibrate([20, 30, 20]);
}

/* ============================================================
   CONFETTI BURST — celebrates a perfect quiz score
   ============================================================ */
function fireConfetti() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colors = ["#3A63ED", "#F2A340", "#3FAE86", "#E4643A", "#9333EA"];
  for (let i = 0; i < 32; i++) {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    const size = 5 + Math.random() * 5;
    el.style.width = size + "px";
    el.style.height = size * 0.4 + "px";
    el.style.left = Math.random() * 100 + "vw";
    el.style.background = colors[i % colors.length];
    el.style.animationDuration = (1.6 + Math.random() * 1.2) + "s";
    el.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(el);
    el.addEventListener("animationend", () => el.remove());
  }
}

/* ============================================================
   SPEECH SYNTHESIS (TTS)
   ============================================================ */
function speakText(text) {
  if (!('speechSynthesis' in window)) {
    alert("Speech synthesis is not supported on this device.");
    return;
  }
  window.speechSynthesis.cancel();
  if (STATE.isSpeaking) {
    STATE.isSpeaking = false;
    render();
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.onend = () => { STATE.isSpeaking = false; render(); };
  utterance.onerror = () => { STATE.isSpeaking = false; render(); };
  STATE.isSpeaking = true;
  window.speechSynthesis.speak(utterance);
  render();
}
