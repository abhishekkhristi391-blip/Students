import { QUESTIONS } from "../mockdata.js";
import { persistTestResult, esc } from "../api.js";
import { icon } from "../icons.js";

const TEST = { questions: null, timeLimit: 300, idx: 0, answers: {}, marked: new Set(), timeLeft: 300, submitting: false };

export const testengine = {
  protected: true,
  render: () => {
    TEST.questions = QUESTIONS.slice(0, 5);
    TEST.idx = 0;
    TEST.answers = {};
    TEST.marked = new Set();
    TEST.timeLeft = TEST.timeLimit;
    TEST.submitting = false;
    return `
    <div class="view test-shell">
      <div class="test-sticky">
        <div class="flex justify-between items-center mb-4">
          <div class="timer">${icon("clock", 18)}<span id="test-time">5:00</span></div>
          <button class="btn btn-dark btn-sm" id="test-submit">Submit Test</button>
        </div>
        <div class="nav-chips" id="test-chips">${chipsHtml()}</div>
      </div>
      <div class="px-6 flex-1 flex flex-col pt-6">
        <div class="flex justify-between items-center mb-4">
          <span class="chip chip-black" id="test-counter">Q 1 / ${TEST.questions.length}</span>
          <button class="review-btn" id="test-review">${icon("bookmark", 14)}<span>Review</span></button>
        </div>
        <div class="q-card" id="test-qcard"></div>
        <div class="flex flex-col" id="test-options"></div>
      </div>
      <div class="px-6 mt-auto flex gap-4">
        <button class="btn btn-half btn-white" id="test-prev">Previous</button>
        <button class="btn btn-half btn-white" id="test-next">Next</button>
      </div>
    </div>`;
  },

  mount: (el) => {
    const timerEl = el.querySelector("#test-time");
    const interval = setInterval(() => {
      TEST.timeLeft--;
      timerEl.textContent = fmt(TEST.timeLeft);
      if (TEST.timeLeft <= 0) {
        clearInterval(interval);
        if (!TEST.submitting) processResults();
      }
    }, 1000);
    // store interval for cleanup on auto-submit / manual submit / route change
    TEST._interval = interval;

    el.querySelector("#test-prev").addEventListener("click", () => { TEST.idx = Math.max(0, TEST.idx - 1); drawTest(el); });
    el.querySelector("#test-next").addEventListener("click", () => { TEST.idx = Math.min(TEST.questions.length - 1, TEST.idx + 1); drawTest(el); });
    el.querySelector("#test-review").addEventListener("click", (e) => {
      const q = TEST.questions[TEST.idx];
      TEST.marked.has(q.id) ? TEST.marked.delete(q.id) : TEST.marked.add(q.id);
      const btn = e.currentTarget;
      btn.classList.toggle("on");
      renderChips(el);
    });
    el.querySelector("#test-submit").addEventListener("click", manualSubmit);
    drawTest(el);

    return () => { clearInterval(TEST._interval); TEST._interval = null; };
  },
};

function fmt(s) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function chipsHtml() {
  return TEST.questions.map((q, i) => {
    let cls = "nav-chip";
    if (i === TEST.idx) cls += " current";
    else if (TEST.marked.has(q.id)) cls += " marked";
    else if (TEST.answers[q.id] !== undefined) cls += " answered";
    return `<button class="${cls}" data-chip="${i}">${i + 1}</button>`;
  }).join("");
}

function renderChips(el) {
  const chips = el.querySelector("#test-chips");
  chips.innerHTML = chipsHtml();
  chips.querySelectorAll("[data-chip]").forEach((c) =>
    c.addEventListener("click", () => { TEST.idx = Number(c.dataset.chip); drawTest(el); })
  );
}

function drawTest(el) {
  const q = TEST.questions[TEST.idx];
  el.querySelector("#test-counter").textContent = `Q ${TEST.idx + 1} / ${TEST.questions.length}`;
  el.querySelector("#test-qcard").innerHTML = `<p>${esc(q.text)}</p>`;

  const opts = el.querySelector("#test-options");
  opts.innerHTML = q.options.map((opt, i) => {
    const selected = TEST.answers[q.id] === i;
    return `<button class="option ${selected ? "selected" : ""}" data-opt="${i}">${esc(opt)}</button>`;
  }).join("");
  opts.querySelectorAll("[data-opt]").forEach((b) =>
    b.addEventListener("click", () => { TEST.answers[q.id] = Number(b.dataset.opt); drawTest(el); })
  );

  const reviewBtn = el.querySelector("#test-review");
  reviewBtn.classList.toggle("on", TEST.marked.has(q.id));
  el.querySelector("#test-prev").disabled = TEST.idx === 0;
  el.querySelector("#test-next").disabled = TEST.idx === TEST.questions.length - 1;
  renderChips(el);
}

function manualSubmit() {
  const unanswered = TEST.questions.length - Object.keys(TEST.answers).length;
  if (unanswered > 0 && !window.confirm(`You have ${unanswered} unanswered questions. Submit anyway?`)) return;
  if (TEST.submitting) return;
  processResults();
}

async function processResults() {
  if (TEST.submitting) return;
  TEST.submitting = true;
  clearInterval(TEST._interval);

  let correct = 0, incorrect = 0;
  TEST.questions.forEach((q) => {
    const sel = TEST.answers[q.id];
    if (sel !== undefined) sel === q.correctIndex ? correct++ : incorrect++;
  });
  const skipped = TEST.questions.length - correct - incorrect;
  const timeTaken = TEST.timeLimit - TEST.timeLeft;

  const result = await persistTestResult({
    correctCount: correct,
    totalCount: TEST.questions.length,
    timeTakenSeconds: timeTaken,
    isDailyChallenge: false,
  });

  sessionStorage.setItem("TEST_RESULT", JSON.stringify({
    score: correct,
    total: TEST.questions.length,
    correctCount: correct,
    incorrectCount: incorrect,
    skippedCount: skipped,
    timeTaken,
    ...result,
  }));
  location.hash = "/test/result";
}