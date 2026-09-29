import { icon } from "../icons.js";

const NOTIFS = [
  { id: 1, title: "Streak Protected!", desc: "You almost lost your 7-day streak.", icon: "flame", color: "var(--accent)", time: "2h ago" },
  { id: 2, title: "New Badge Unlocked", desc: 'You earned the "First Test" badge.', icon: "trophy", color: "var(--accent)", time: "5h ago" },
  { id: 3, title: "Weekly Report Ready", desc: "Your accuracy went up by 5% this week.", icon: "star", color: "var(--accent)", time: "1d ago" },
  { id: 4, title: "Report Resolved", desc: "The question issue you reported was fixed.", icon: "alertCircle", color: "var(--brand-teal)", time: "2d ago" },
];

export const notifications = {
  protected: true,
  render: () => `
    <div class="view grad-dashboard pb-safe flex flex-col">
      <div class="back-header">
        <button class="icon-btn icon-btn-solid" data-nav="-1" aria-label="Go back">${icon("chevronLeft", 24)}</button>
        <div><h2>Notifications</h2><p>Your latest updates</p></div>
      </div>
      <div class="px-6 mt-4 space-y-3 flex-1 stagger">
        ${NOTIFS.map((n) => `
          <div class="card" style="padding:1rem;display:flex;align-items:flex-start;gap:1rem">
            <div class="circle-icon-sm" style="background:${n.color}"><span style="color:var(--on-accent)">${icon(n.icon, 20)}</span></div>
            <div class="flex-1">
              <h4 class="h4" style="font-size:14px">${n.title}</h4>
              <p class="sm muted mt-1">${n.desc}</p>
              <span class="xxs semibold faint mt-2" style="display:block">${n.time}</span>
            </div>
          </div>`).join("")}
      </div>
    </div>`,
};