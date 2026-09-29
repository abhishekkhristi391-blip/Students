import { state } from "../api.js";
import { icon } from "../icons.js";
import { blob } from "../blob.js";

function sparkline(data, color = "var(--accent)", height = 40, width = 100) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 4;
  const usable = height - padding * 2;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - padding - ((v - min) / range) * usable;
    return `${x},${y}`;
  }).join(" L ");
  return `<svg class="sparkline" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none"><path d="M ${pts}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function bars(data, height = 60) {
  const max = Math.max(...data, 1);
  const colors = ["var(--brand-coral)", "var(--brand-yellow)", "var(--brand-teal)", "var(--brand-purple)"];
  return `<div class="bars" style="height:${height}px">
    ${data.map((v, i) => {
      const h = Math.max((v / max) * 100, 10);
      return `<div class="bar" style="height:${h}%;background:${colors[i % colors.length]}"></div>`;
    }).join("")}
  </div>`;
}

export const analytics = {
  protected: true,
  render: async () => {
    const u = state.user || {};
    const weekSpark = [40, 60, 45, 80, 75, 90, 85];
    const weekBars = [2, 5, 3, 8, 4, 10, 7];
    const acc = u.accuracy || 0;
    const attempted = u.questionsAttempted || 0;
    const correct = u.correctAnswers || 0;
    const incorrect = Math.max(attempted - correct, 0);

    return `
    <div class="view grad-insights pb-safe flex flex-col">
      <div class="back-header">
        <button class="icon-btn icon-btn-solid" data-nav="-1" aria-label="Go back">${icon("chevronLeft", 24)}</button>
        <div><h2>Analytics</h2><p>Your performance overview</p></div>
      </div>

      <div class="px-6 space-y-6 mt-2 stagger">
        <div class="grid grid-cols-2" style="gap:1rem">
          <div class="card" style="padding:1rem">
            <div class="flex justify-between items-center mb-4">
              <span class="sm bold muted">Accuracy Trend</span>
              <span style="color:var(--accent)">${icon("target", 16)}</span>
            </div>
            ${sparkline(weekSpark)}
            <div class="mt-3">
              <span class="bold" style="font-size:20px" data-count="${acc}">0</span>
              <span class="chip chip-green" style="font-size:11px;margin-left:.5rem">&#8593; 5%</span>
            </div>
          </div>
          <div class="card" style="padding:1rem">
            <div class="flex justify-between items-center mb-2">
              <span class="sm bold muted">Questions Done</span>
              <span style="color:var(--accent)">${icon("activity", 16)}</span>
            </div>
            ${bars(weekBars)}
            <div class="mt-2">
              <span class="bold" style="font-size:20px" data-count="${attempted}">0</span>
              <span class="xs semibold faint ml-1">total</span>
            </div>
          </div>
        </div>

        <div class="card-soft card-pad">
          <h3 class="h3-sm mb-4">Overall Breakdown</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="circle-icon-sm" style="background:var(--tint-teal);color:var(--on-accent)">${icon("check", 20, 2.5)}</div>
                <div><p class="h4" style="font-size:14px">Correct Answers</p><p class="xs muted">Solid foundation</p></div>
              </div>
              <span class="bold" style="font-size:16px" data-count="${correct}">0</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="circle-icon-sm" style="background:var(--tint-pink);color:var(--on-accent)">${icon("x", 20, 2.5)}</div>
                <div><p class="h4" style="font-size:14px">Incorrect Answers</p><p class="xs muted">Areas to review</p></div>
              </div>
              <span class="bold" style="font-size:16px" data-count="${incorrect}">0</span>
            </div>
          </div>
        </div>

        <div class="card press" style="padding:1rem;display:flex;align-items:center;gap:1rem" data-nav="/practice/weak-topics">
          <div class="circle-icon-sm av-coral">${blob("dizzy", 32)}</div>
          <div class="flex-1"><h4 class="h4">Focus on Weak Topics</h4><p class="xs muted">2 topics need attention</p></div>
          <div style="background:var(--surface-grey);padding:8px;border-radius:var(--radius-pill);color:var(--text)">${icon("chevronLeft", 16)}</div>
        </div>
      </div>
    </div>`;
  },
};