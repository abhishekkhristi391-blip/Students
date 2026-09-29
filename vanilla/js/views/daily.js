import { blob } from "../blob.js";
import { icon } from "../icons.js";

// Week starts Monday, so the letters must too.
const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];
// Token names, not class names: consumed via var() below.
const DAY_COLORS = ["brand-yellow", "brand-teal", "brand-coral"];

// Real calendar week ending today, so the streak row is never a lie.
function currentWeek() {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      letter: DAY_LETTERS[i],
      date: d.getDate(),
      isFuture: d > today,
      isToday: d.toDateString() === today.toDateString(),
      color: DAY_COLORS[i % DAY_COLORS.length],
    };
  });
}

function dateRow() {
  const week = currentWeek();
  return `<div class="date-row">
    ${week.map((d) => `
      <div class="date-item">
        <span class="day ${d.isFuture ? "future" : "past"}">${d.letter}</span>
        <div class="date-bubble ${d.isFuture ? "future" : "past"} ${d.isToday ? "active" : ""}"
          ${d.isFuture ? "" : `style="background:var(--${d.color})"`}
          ${d.isToday ? 'aria-current="date"' : ""}>${d.date}</div>
      </div>`).join("")}
  </div>`;
}

export const daily = {
  protected: true,
  render: () => `
    <div class="view grad-dashboard pb-safe flex flex-col">
      <div class="back-header">
        <button class="icon-btn icon-btn-solid" data-nav="-1" aria-label="Go back">${icon("chevronLeft", 24)}</button>
        <div><h2>Daily Practice</h2><p>Keep your streak alive</p></div>
      </div>

      <div class="px-6 flex-1 flex flex-col gap-6 mt-4">
        <div class="card card-pad">
          <div class="flex justify-between items-center mb-5">
            <h3 class="h3-sm">This Week</h3>
            <span class="chip chip-yellow"><span class="flame">${icon("flame", 14)}</span> 7 Days</span>
          </div>
          ${dateRow()}
        </div>

        <div class="card-soft card-pad-lg" style="display:flex;flex-direction:column;align-items:center;text-align:center">
          ${blob("happy", 96)}
          <h3 class="h3 mb-1">Today&apos;s Target</h3>
          <p class="muted sm mb-6">Complete 10 mixed questions</p>
          <div class="bar-track" style="width:100%;height:12px;margin-bottom:8px"><div class="bar-fill" data-w="0.4" style="width:100%"></div></div>
          <div class="w-full flex justify-between xs bold faint mb-6"><span>4 completed</span><span>10 total</span></div>
          <div class="w-full flex gap-3">
            <div class="flex-1" style="background:var(--tint-lime);color:var(--on-accent);padding:.75rem;border-radius:var(--radius-md)">
              ${icon("target", 18)}<p class="xs bold deep-yellow mt-1">+100 pts</p>
            </div>
            <div class="flex-1" style="background:var(--tint-teal);color:var(--on-accent);padding:.75rem;border-radius:var(--radius-md)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--teal-ink)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto;display:block"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
              <p class="xs bold deep-teal mt-1">Streak +1</p>
            </div>
          </div>
        </div>

        <button class="btn btn-dark mt-auto" data-nav="/test/active">Resume Practice</button>
      </div>
    </div>`,
};