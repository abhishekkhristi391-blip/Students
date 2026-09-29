import { blob } from "../blob.js";
import { icon } from "../icons.js";

function statCard(title, value, iconHtml, color = "var(--text)") {
  return `
  <div class="stat-card">
    <div class="top"><span>${title}</span><span style="color:${color}">${iconHtml}</span></div>
    <span class="val">${value}</span>
  </div>`;
}

export const testresult = {
  render: () => {
    const raw = sessionStorage.getItem("TEST_RESULT");
    if (!raw) {
      return `
      <div class="view items-center justify-center px-6 text-center">
        <p class="muted">Result not found.</p>
        <a class="btn btn-dark mt-4" href="#/">Go Home</a>
      </div>`;
    }
    const r = JSON.parse(raw);
    const { score, total, correctCount, incorrectCount, skippedCount, timeTaken, totalPoints, accuracy, basePoints, bonusPoints } = r;
    const mins = Math.floor(timeTaken / 60), secs = timeTaken % 60;
    const timeString = `${mins}m ${secs}s`;

    let emotion = "happy", title = "Great Job!", grad = "grad-dashboard";
    if (accuracy < 50) { emotion = "worried"; title = "Keep Practicing"; grad = "grad-mood"; }
    else if (accuracy === 100) { emotion = "happy"; title = "Perfect Score!"; }
    else if (accuracy >= 70) { emotion = "balanced"; title = "Well Done!"; }

    return `
    <div class="view ${grad} pb-safe" style="margin-bottom:0">
      <div style="padding-top:4rem;padding-bottom:2rem;display:flex;flex-direction:column;align-items:center;justify-content:center">
        ${blob(emotion, 128)}
        <h1 style="font-size:28px;font-weight:600;margin-top:1rem">${title}</h1>
        <p class="semibold mt-1" style="color:var(--text-soft)">You earned <span class="bold deep-yellow">+${totalPoints} points</span></p>
      </div>

      <div class="px-6 flex-1 flex flex-col gap-6">
        <div class="grid grid-cols-2" style="gap:1rem">
          ${statCard("Score", `${score} / ${total}`, icon("target", 16))}
          ${statCard("Accuracy", `${accuracy}%`, icon("alertCircle", 16))}
          ${statCard("Time Taken", timeString, icon("clock", 16))}
          ${statCard("Points Breakdown", `+${basePoints} / +${bonusPoints}`, `<span style="display:inline-block;width:16px;height:16px;border-radius:50%;background:var(--brand-yellow)"></span>`)}
        </div>

        <div class="card card-pad">
          <h3 class="h3-sm mb-4">Performance Breakdown</h3>
          <div class="flex flex-col gap-3">
            <div class="breakdown-row br-green"><span style="display:flex;align-items:center;gap:.75rem">${icon("check", 20)} Correct</span><span>${correctCount}</span></div>
            <div class="breakdown-row br-red"><span style="display:flex;align-items:center;gap:.75rem">${icon("x", 20)} Incorrect</span><span>${incorrectCount}</span></div>
            <div class="breakdown-row br-grey"><span style="display:flex;align-items:center;gap:.75rem"><span style="display:inline-block;width:20px;height:20px;border-radius:50%;border:2px dashed var(--text-faint)"></span> Skipped</span><span>${skippedCount}</span></div>
          </div>
        </div>

        <div class="flex flex-col gap-3 mt-2 pb-4">
          <a class="btn btn-dark" href="#/">Back to Home</a>
          <button class="btn btn-white" id="review-answers">Review Answers</button>
        </div>
        <p id="tr-live" class="sr-only" role="status" aria-live="polite"></p>
      </div>
    </div>`;
  },
  mount: (el) => {
    el.querySelector("#review-answers")?.addEventListener("click", () => {
      // alert() is modal and blocks the a11y tree; announce politely instead.
      const live = el.querySelector("#tr-live");
      if (live) {
        live.textContent = "Full answer review is coming soon. Keep practicing meanwhile!";
        live.classList.remove("hidden");
      }
    });
  },
};