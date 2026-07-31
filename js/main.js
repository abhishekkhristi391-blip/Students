/* ============================================================
   MAIN RENDER ENGINE
   Ye file poore app ko jodta hai: kaunsa page dikhana hai
   (render()), bottom nav bar, aur saare click events
   (attachEventListeners()).
   ============================================================ */
function render() {
  document.body.className = STATE.isDark ? "dark" : "";
  const root = document.getElementById("app");

  if (!STATE.userLoaded) {
    root.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-soft);font-size:13.5px;font-weight:600;">Loading your progress…</div>`;
    return;
  }

  let bodyContent = "";
  if (STATE.flow === "chapters") bodyContent = renderChaptersView();
  else if (STATE.flow === "topicReader") bodyContent = renderTopicReaderView();
  else if (STATE.flow === "quiz") bodyContent = renderQuizView();
  else if (STATE.tab === "home") bodyContent = renderHomeView();
  else if (STATE.tab === "library") bodyContent = renderLibraryView();
  else if (STATE.tab === "progress") bodyContent = renderProgressView();
  else if (STATE.tab === "settings") bodyContent = renderSettingsView();

  root.innerHTML = `
    <div class="scroll-container view-enter">${bodyContent}</div>
    ${STATE.flow ? "" : renderBottomNav()}
    ${STATE.aiModalOpen ? renderAIModal() : ""}
    ${STATE.onboardingOpen ? renderOnboardingModal() : ""}
  `;

  attachEventListeners();
  wireSearchInput();
}

/* ============================================================
   BOTTOM NAVIGATION BAR
   ============================================================ */
function renderBottomNav() {
  const items = [
    { id: "home", icon: "home", label: "Home" },
    { id: "library", icon: "library", label: "Courses" },
    { id: "progress", icon: "chart", label: "Analytics" },
    { id: "settings", icon: "gear", label: "Settings" }
  ];

  const btns = items.map(it => {
    const active = STATE.tab === it.id;
    return `
      <button data-action="go-tab" data-id="${it.id}" class="nav-btn animated-btn" aria-label="${it.label}" ${active ? 'aria-current="page"' : ''}>
        <span class="nav-btn-inner" style="background:${active ? 'var(--accent-10)' : 'transparent'};">
          ${svgIcon(it.icon, active ? '#FFFFFF' : 'var(--text-soft)', 20)}
        </span>
      </button>
    `;
  }).join("");

  return `<div class="nav-bar">${btns}</div>`;
}

/* ============================================================
   SEARCH INPUT WIRING — live filter as you type, with focus/cursor
   preserved across the full-DOM re-render (innerHTML re-renders would
   otherwise steal focus on every keystroke).
   ============================================================ */
function wireSearchInput() {
  const input = document.getElementById("chapter-search-input");
  if (!input) return;
  if (STATE._searchHadFocus) {
    input.focus();
    const pos = input.value.length;
    input.setSelectionRange(pos, pos);
  }
  input.oninput = (e) => {
    STATE.chapterSearch = e.target.value;
    STATE._searchHadFocus = true;
    render();
  };
}

/* ============================================================
   EVENT HANDLERS
   ============================================================ */
function attachEventListeners() {
  document.getElementById("app").onclick = (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;

    const action = btn.getAttribute("data-action");
    const id = btn.getAttribute("data-id");

    if (action === "go-tab") {
      haptic("medium");
      STATE.tab = id;
      STATE.flow = null;
    } else if (action === "toggle-dark") {
      haptic("light");
      applyTheme(STATE.themeId, !STATE.isDark);
      render();
      return;
    } else if (action === "change-theme") {
      haptic("light");
      applyTheme(id);
      render();
      return;
    } else if (action === "select-subject") {
      haptic("light");
      STATE.subjectId = id;
      const sub = btn.getAttribute("data-sub");
      STATE.subSectionId = sub ? sub : null;
      STATE.flow = "chapters";
    } else if (action === "filter-subsection") {
      haptic("light");
      STATE.subSectionId = id === "ALL" ? null : id;
    } else if (action === "open-topic") {
      haptic("light");
      STATE.chapterId = id;
      STATE.activeTopicIndex = 0;
      STATE.flow = "topicReader";
      saveLastRead(STATE.subjectId, STATE.subSectionId, id, 0);
    } else if (action === "toggle-topic-complete") {
      haptic("medium");
      toggleTopicComplete(id);
    } else if (action === "clear-chapter-search") {
      haptic("light");
      STATE.chapterSearch = "";
      STATE._searchHadFocus = false;
    } else if (action === "save-onboarding-name") {
      const input = document.getElementById("onboarding-name-input");
      const name = input ? input.value.trim() : "";
      if (!name) { haptic("light"); return; }
      haptic("medium");
      STATE.userName = name;
      STATE.onboardingOpen = false;
      persistUser({ name });
    } else if (action === "open-edit-name") {
      haptic("light");
      STATE.onboardingNameDraft = STATE.userName || "";
      STATE.onboardingOpen = true;
    } else if (action === "open-quiz") {
      haptic("medium");
      STATE.chapterId = id;
      STATE.quizAnswers = {};
      STATE.quizSubmitted = false;
      STATE.flow = "quiz";
    } else if (action === "close-flow") {
      haptic("light");
      STATE.flow = null;
    } else if (action === "back-to-chapters") {
      haptic("light");
      STATE.flow = "chapters";
      if (STATE.isSpeaking) window.speechSynthesis.cancel();
      STATE.isSpeaking = false;
    } else if (action === "switch-topic-tab") {
      haptic("light");
      const idx = parseInt(btn.getAttribute("data-index"));
      STATE.activeTopicIndex = idx;
      saveLastRead(STATE.subjectId, STATE.subSectionId, STATE.chapterId, idx);
      if (STATE.isSpeaking) window.speechSynthesis.cancel();
      STATE.isSpeaking = false;
    } else if (action === "prev-topic") {
      haptic("light");
      if (STATE.activeTopicIndex > 0) STATE.activeTopicIndex--;
      saveLastRead(STATE.subjectId, STATE.subSectionId, STATE.chapterId, STATE.activeTopicIndex);
    } else if (action === "next-topic") {
      haptic("light");
      STATE.activeTopicIndex++;
      saveLastRead(STATE.subjectId, STATE.subSectionId, STATE.chapterId, STATE.activeTopicIndex);
    } else if (action === "speak-topic") {
      haptic("medium");
      const text = decodeURIComponent(btn.getAttribute("data-text"));
      speakText(text);
      return;
    } else if (action === "select-quiz-option") {
      if (STATE.quizSubmitted) return;
      haptic("light");
      const qIdx = parseInt(btn.getAttribute("data-qidx"));
      const oIdx = parseInt(btn.getAttribute("data-oidx"));
      STATE.quizAnswers[qIdx] = oIdx;
    } else if (action === "submit-quiz") {
      haptic("heavy");
      STATE.quizSubmitted = true;
      const subj = APP_DATA.find(s => s.id === STATE.subjectId);
      const chap = subj ? subj.chapters.find(c => c.id === STATE.chapterId) : null;
      if (chap && chap.quiz) {
        const perfect = chap.quiz.every((q, idx) => STATE.quizAnswers[idx] === q.correct);
        if (perfect) {
          setTimeout(fireConfetti, 150);
          let changed = false;
          chap.topics.forEach(t => {
            if (!STATE.completedTopics.includes(t.id)) { STATE.completedTopics.push(t.id); changed = true; }
          });
          if (changed) persistUser({ completedTopics: STATE.completedTopics });
        }
      }
    } else if (action === "retry-quiz") {
      haptic("medium");
      STATE.quizAnswers = {};
      STATE.quizSubmitted = false;
    } else if (action === "open-ai") {
      haptic("medium");
      STATE.aiModalOpen = true;
    } else if (action === "close-ai") {
      haptic("light");
      STATE.aiModalOpen = false;
    } else if (action === "continue-study") {
      haptic("light");
      let resumed = false;
      if (STATE.lastRead) {
        const s = APP_DATA.find(s => s.id === STATE.lastRead.subjectId);
        const c = s ? s.chapters.find(c => c.id === STATE.lastRead.chapterId) : null;
        if (c) {
          STATE.subjectId = STATE.lastRead.subjectId;
          STATE.subSectionId = STATE.lastRead.subSectionId;
          STATE.chapterId = STATE.lastRead.chapterId;
          STATE.activeTopicIndex = Math.min(STATE.lastRead.topicIndex || 0, c.topics.length - 1);
          resumed = true;
        }
      }
      if (!resumed) {
        // No history yet, or the last-read chapter was removed —
        // fall back to the first available chapter.
        const firstSubject = APP_DATA[0];
        const firstChapter = firstSubject && firstSubject.chapters[0];
        STATE.subjectId = firstSubject ? firstSubject.id : STATE.subjectId;
        STATE.subSectionId = firstChapter ? firstChapter.subSectionId : null;
        STATE.chapterId = firstChapter ? firstChapter.id : STATE.chapterId;
        STATE.activeTopicIndex = 0;
      }
      STATE.flow = "topicReader";
    }

    render();
  };
}

/* Initial theme apply + first render kick-off */
applyTheme(STATE.themeId, STATE.isDark);
render();
