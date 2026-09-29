import { blob } from "../blob.js";
import { icon } from "../icons.js";

const WEAK = [
  { id: "c2", title: "Optics", subject: "Physics", accuracy: 42, color: "av-coral", emotion: "dizzy" },
  { id: "c5", title: "Organic Chemistry", subject: "Chemistry", accuracy: 38, color: "av-coral", emotion: "negative" },
];

export const weaktopics = {
  protected: true,
  render: () => `
    <div class="view grad-mood pb-safe flex flex-col">
      <div class="back-header">
        <button class="icon-btn icon-btn-solid" data-nav="-1" aria-label="Go back">${icon("chevronLeft", 24)}</button>
        <div><h2>Weak Topics</h2><p>Needs improvement</p></div>
      </div>
      <div class="px-6 flex-1 flex flex-col gap-3 mt-4 stagger">
        ${WEAK.map((t) => `
          <div class="list-card hover-rise" data-nav="/practice/chapter/${t.id}">
            <span class="arrow">${icon("arrowUpRight", 18, 2.5)}</span>
            <div class="circle-icon ${t.color}">${blob(t.emotion, 40)}</div>
            <div class="flex-1" style="padding-right:1.5rem">
              <h4>${t.title}</h4>
              <p class="sm muted" style="margin:.25rem 0 .375rem">${t.subject}</p>
              <div class="meta-row"><span style="display:inline-flex;align-items:center;gap:.375rem">${icon("target", 12)}<span class="xs semibold faint">${t.accuracy}% accuracy</span></span><span class="chip chip-coral">Weak Topic</span></div>
            </div>
          </div>`).join("")}
      </div>
    </div>`,
};

export const bookmarks = {
  protected: true,
  render: () => `
    <div class="view grad-dashboard pb-safe flex flex-col">
      <div class="back-header">
        <button class="icon-btn icon-btn-solid" data-nav="-1" aria-label="Go back">${icon("chevronLeft", 24)}</button>
        <div><h2>Bookmarks</h2><p>Saved for revision</p></div>
      </div>
      <div class="px-6 flex-1 flex flex-col gap-4 mt-4">
        <div class="card card-pad">
          <div class="flex justify-between items-start mb-3">
            <span class="chip chip-yellow">Physics &bull; Reflection of Light</span>
            ${icon("bookmark", 18, 2)}
          </div>
          <p class="h4" style="line-height:1.4">Which of the following mirrors always forms a virtual, erect, and diminished image?</p>
          <a class="btn btn-half mt-4" href="#/practice/topic/t1/mcq" style="width:100%;background:var(--surface-grey);padding:.75rem;border-radius:var(--radius-pill);font-size:13px;font-weight:600;display:block;text-align:center">Practice Again</a>
        </div>
      </div>
    </div>`,
};