import { QUESTIONS } from "../mockdata.js";
import { persistPracticeAnswer, esc } from "../api.js";
import { blob } from "../blob.js";
import { icon } from "../icons.js";

export const mcq = {
  protected: true,
  render: async ({ topicId }) => {
    const questions = QUESTIONS.filter((q) => q.topicId === topicId);
    if (questions.length === 0) {
      return `
      <div class="view grad-insights items-center justify-center px-6 text-center">
        ${blob("worried", 128)}
        <h2 class="h3 mt-4">No questions found</h2>
        <button class="btn btn-dark mt-6" data-nav="-1">Go Back</button>
      </div>`;
    }
    // store questions in a closure via module map keyed by topic
    MCQ_STATE.questions = questions;
    MCQ_STATE.idx = 0;
    MCQ_STATE.selected = null;
    MCQ_STATE.submitted = false;
    MCQ_STATE.bookmarked = false;
    MCQ_STATE.topicId = topicId;

    return `
    <div class="view grad-mood pb-safe flex flex-col">
      <div class="px-6 pt-16 pb-4 flex items-center justify-between">
        <button class="icon-btn icon-btn-solid" data-nav="-1" aria-label="Go back">${icon("chevronLeft", 24)}</button>
        <span class="chip chip-black">Q 1 of ${questions.length}</span>
        <div class="flex gap-2">
          <button id="mcq-bookmark" class="icon-btn icon-btn-solid" aria-label="Bookmark this question" aria-pressed="false">${icon("bookmark", 18)}</button>
          <button class="icon-btn icon-btn-solid" aria-label="Report this question">${icon("flag", 18)}</button>
        </div>
      </div>
      <div class="px-6 flex-1 flex flex-col" id="mcq-body"></div>
    </div>`;
  },

  mount: (el) => {
    if (!MCQ_STATE.questions) return;
    const body = el.querySelector("#mcq-body");
    const bookBtn = el.querySelector("#mcq-bookmark");
    bookBtn?.addEventListener("click", () => {
      MCQ_STATE.bookmarked = !MCQ_STATE.bookmarked;
      bookBtn.style.background = MCQ_STATE.bookmarked ? "var(--brand-yellow)" : "var(--surface)";
      bookBtn.setAttribute("aria-pressed", String(MCQ_STATE.bookmarked));
    });
    drawMcq(body);
  },
};

const MCQ_STATE = { questions: null, idx: 0, selected: null, submitted: false, bookmarked: false, topicId: null };

function drawMcq(body) {
  const { questions, idx } = MCQ_STATE;
  const q = questions[idx];

  // Sync question counter in header
  const counter = body.closest(".view")?.querySelector(".chip-black");
  if (counter) counter.textContent = `Q ${idx + 1} of ${questions.length}`;

  let options = "";
  q.options.forEach((opt, i) => {
    let cls = "option";
    if (!MCQ_STATE.submitted) {
      if (MCQ_STATE.selected === i) cls += " selected";
    } else {
      if (i === q.correctIndex) cls += " correct";
      else if (i === MCQ_STATE.selected) cls += " wrong";
      else cls += " dimmed";
    }
    const iconMark =
      MCQ_STATE.submitted && i === q.correctIndex
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--teal-ink)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`
        : MCQ_STATE.submitted && i === MCQ_STATE.selected
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--pink-ink)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`
        : "";
    options += `<button class="${cls}" data-opt="${i}" ${MCQ_STATE.submitted ? "disabled" : ""}>${esc(opt)}${iconMark}</button>`;
  });

  const isCorrect = MCQ_STATE.selected === q.correctIndex;
  const explanation = MCQ_STATE.submitted ? `
    <div class="explanation ${isCorrect ? "good" : "bad"}">
      ${blob(isCorrect ? "happy" : "negative", 48)}
      <div>
        <h4 style="color:${isCorrect ? "var(--teal-ink)" : "var(--pink-ink)"}">${isCorrect ? "Excellent!" : "Not quite right."}</h4>
        <p>${esc(q.explanation)}</p>
        ${isCorrect ? `<span class="chip chip-yellow" style="margin-top:.75rem;display:inline-block">+10 Points earned</span>` : ""}
      </div>
    </div>` : "";

  const actions = !MCQ_STATE.submitted ? `
    <div class="flex gap-4 pb-8">
      <button class="btn btn-half btn-white" id="mcq-skip">Skip</button>
      <button class="btn btn-mid ${MCQ_STATE.selected !== null ? "btn-dark" : "btn-grey"}" id="mcq-submit" ${MCQ_STATE.selected === null ? "disabled" : ""}>Submit</button>
    </div>`
    : `<button class="btn btn-dark btn-half mt-auto pb-8" id="mcq-next" style="width:100%;background:var(--dark);color:var(--on-primary);padding:1rem;border-radius:var(--radius-md);font-weight:600">${idx < questions.length - 1 ? "Next Question" : "Finish Practice"}</button>`;

  body.innerHTML = `
    <div class="q-card"><p>${esc(q.text)}</p></div>
    <div class="flex flex-col">${options}</div>
    ${explanation}
    <div style="margin-top:auto;padding-top:1rem">${actions}</div>`;

  body.querySelectorAll("[data-opt]").forEach((btn) =>
    btn.addEventListener("click", () => {
      if (MCQ_STATE.submitted) return;
      MCQ_STATE.selected = Number(btn.dataset.opt);
      drawMcq(body);
    })
  );
  const skip = body.querySelector("#mcq-skip");
  skip?.addEventListener("click", () => goNext(body));
  const submit = body.querySelector("#mcq-submit");
  submit?.addEventListener("click", async () => {
    MCQ_STATE.submitted = true;
    persistPracticeAnswer(MCQ_STATE.selected === q.correctIndex); // fire and forget
    drawMcq(body);
  });
  body.querySelector("#mcq-next")?.addEventListener("click", () => goNext(body));
}

function goNext(body) {
  if (MCQ_STATE.idx < MCQ_STATE.questions.length - 1) {
    MCQ_STATE.idx++;
    MCQ_STATE.selected = null;
    MCQ_STATE.submitted = false;
    MCQ_STATE.bookmarked = false;
    drawMcq(body);
  } else {
    location.hash = "/practice";
  }
}