import { SUBJECTS, CHAPTERS, TOPICS } from "../mockdata.js";
import { blob } from "../blob.js";
import { icon } from "../icons.js";

function listCard({ title, subtitle, meta, metaType, colorClass, emotion, isWeak, href }) {
  const metaIcon =
    metaType === "time" ? `<span style="display:inline-flex;align-items:center">${icon("clock", 12)}</span>` :
    metaType === "accuracy" ? `<span style="display:inline-flex;align-items:center">${icon("target", 12)}</span>` :
    `<span style="width:6px;height:6px;border-radius:50%;background:var(--text-faint)"></span>`;
  return `
  <div class="list-card hover-rise" data-nav="${href}">
    <span class="arrow">${icon("arrowUpRight", 18, 2.5)}</span>
    <div class="circle-icon ${colorClass}">${blob(emotion, 40)}</div>
    <div class="flex-1" style="padding-right:1.5rem">
      <h4>${title}</h4>
      ${subtitle ? `<p class="sm muted" style="margin:.25rem 0 .375rem">${subtitle}</p>` : ""}
      <div class="meta-row">
        ${meta ? `<span style="display:inline-flex;align-items:center;gap:.375rem">${metaIcon}<span class="xs semibold faint">${meta}</span></span>` : ""}
        ${isWeak ? `<span class="chip chip-coral">Weak Topic</span>` : ""}
      </div>
    </div>
  </div>`;
}

export const practice = {
  protected: true,
  render: async ({ subjectId, chapterId }) => {
    const isSubjects = !subjectId && !chapterId;
    const isChapters = !!subjectId && !chapterId;
    const isTopics = !!chapterId;

    let title, subtitle, grad, items = [];
    if (isSubjects) {
      title = "Subjects"; subtitle = "Select a subject to begin"; grad = "grad-insights";
      items = SUBJECTS.map((s) => ({
        title: s.name, subtitle: "Complete syllabus", colorClass: s.color, emotion: s.emotion,
        href: `/practice/subject/${s.id}`,
      }));
    } else if (isChapters) {
      const subject = SUBJECTS.find((s) => s.id === subjectId);
      title = subject?.name || "Chapters"; subtitle = "Select a chapter"; grad = "grad-insights";
      items = CHAPTERS.filter((c) => c.subjectId === subjectId).map((c) => ({
        title: c.name, meta: `${c.accuracy}% accuracy`, metaType: "accuracy",
        isWeak: c.accuracy < 50, colorClass: subject?.color || "av-grey",
        emotion: c.accuracy < 50 ? "dizzy" : "balanced", href: `/practice/chapter/${c.id}`,
      }));
    } else {
      const chapter = CHAPTERS.find((c) => c.id === chapterId);
      const subject = SUBJECTS.find((s) => s.id === chapter?.subjectId);
      title = chapter?.name || "Topics"; subtitle = "Select a topic to practice"; grad = "grad-insights";
      items = TOPICS.filter((t) => t.chapterId === chapterId).map((t) => ({
        title: t.name, meta: `${t.qCount} questions`, colorClass: subject?.color || "av-grey",
        emotion: "happy", href: `/practice/topic/${t.id}/mcq`,
      }));
    }

    const list = items.length > 0
      ? items.map((it) => listCard(it)).join("")
      : `<div class="empty-state"><div style="opacity:.8">${blob("worried", 128)}</div><h3 class="mt-4">Nothing here yet</h3><p class="muted sm mt-2">Check back later for updates.</p></div>`;

    return `
    <div class="view ${grad} pb-safe flex flex-col">
      ${isSubjects ? `<div class="back-header"><div><h2>${title}</h2><p>${subtitle}</p></div></div>`
                   : `<div class="back-header">
                        <button class="icon-btn icon-btn-solid" data-nav="-1" aria-label="Go back">${icon("chevronLeft", 24)}</button>
                        <div><h2>${title}</h2><p>${subtitle}</p></div>
                      </div>`}
      <div class="px-6 flex-1 flex flex-col gap-3 mt-4 stagger">
        ${list}
      </div>
    </div>`;
  },
};