import { state, esc } from "../api.js";
import { blob } from "../blob.js";
import { icon } from "../icons.js";

const GOALS = [
  { title: "Daily Challenge", sub: "10 Mixed Questions", time: "10 min", color: "av-yellow", emotion: "happy", nav: "/daily" },
  { title: "Practice Weak Topics", sub: "Optics & Organic Chem", time: "15 min", color: "av-coral", emotion: "dizzy", nav: "/practice/weak-topics" },
  { title: "Mock Test Mini", sub: "Full Syllabus", time: "5 min", color: "av-teal", emotion: "happy", nav: "/test/active" },
];

export const home = {
  protected: true,
  render: () => {
    const u = state.user || {};
    const firstName = (u.name || "Student").split(" ")[0];
    return `
    <div class="view grad-dashboard pb-safe">
      <div class="px-6 pt-16 pb-6 flex items-start justify-between">
        <h2 style="font-size:22px;font-weight:600;line-height:1.2;">Dear ${esc(firstName)},<br />good morning</h2>
        <div class="flex gap-3">
          <button class="icon-btn icon-btn-solid" data-nav="/bookmarks" aria-label="Bookmarks">${icon("bookmark", 18)}</button>
          <button class="icon-btn icon-btn-solid relative" data-nav="/notifications" aria-label="Notifications">${icon("bell", 18)}<span style="position:absolute;top:8px;right:10px;width:8px;height:8px;background:var(--brand-coral);border-radius:50%;border:2px solid var(--surface);"></span></button>
        </div>
      </div>

      <div class="px-6 space-y-6">
        <div class="card-soft card-pad flex items-center justify-between">
          <div class="flex items-center gap-4" style="gap:1rem">
            <div class="relative">
              ${blob("balanced", 48)}
              <div class="flame" style="position:absolute;bottom:-4px;right:-4px;background:var(--surface);border-radius:50%;padding:4px;display:inline-flex"><svg width="14" height="14" viewBox="0 0 24 24" fill="var(--brand-coral)" stroke="var(--brand-coral)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg></div>
          </div>
          <div>
            <p class="h4"><span data-count="${u.streak || 0}">0</span> Day Streak!</p>
            <p class="xs muted" style="font-size:12px">You&apos;re doing great</p>
          </div>
          </div>
          <div class="text-right">
            <p class="brand-yellow bold" style="font-size:18px"><span data-count="${u.totalPoints || 0}">0</span> pts</p>
            <p class="xs semibold muted" style="font-size:12px">${u.rank ? `Rank #${u.rank}` : "Unranked"}</p>
          </div>
        </div>

        <div class="card" style="padding:1.25rem;display:flex;align-items:center;justify-content:space-between" data-nav="/analytics">
          <div>
            <h3 style="font-size:15px;font-weight:600;margin-bottom:4px">Performance Analytics</h3>
            <p style="font-size:12px;color:var(--text-muted)">Track your accuracy &amp; progress</p>
          </div>
          <div style="width:40px;height:40px;border-radius:50%;background:var(--tint-teal);color:var(--teal-ink);display:flex;align-items:center;justify-content:center">${icon("activity", 20, 2)}</div>
        </div>

        <div>
          <h3 class="h3-sm mb-3 px-1">Today&apos;s Goals</h3>
          <div class="space-y-3 stagger">
            ${GOALS.map((g) => `
              <div class="card press hover-rise" style="padding:1rem;display:flex;align-items:center;gap:1rem" data-nav="${g.nav}">
                <div class="circle-icon-sm ${g.color}">${blob(g.emotion, 32)}</div>
                <div class="flex-1">
                  <h4 class="h4">${g.title}</h4>
                  <p class="xs muted" style="font-size:12px">${g.sub}</p>
                </div>
                <div class="text-right shrink-0">
                  <span class="xxs semibold faint" style="font-size:11px">${g.time}</span>
                  <div style="margin-top:4px;display:flex;justify-content:flex-end;color:var(--text-faint)">${icon("chevronLeft", 16)}</div>
                </div>
              </div>`).join("")}
          </div>
        </div>
      </div>
    </div>`;
  },
};