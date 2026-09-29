import { state, esc, logoutUser } from "../api.js";
import { blob } from "../blob.js";
import { icon } from "../icons.js";

const BADGES = [
  { id: "b1", name: "First Test", icon: "target", earned: true, color: "var(--pink-ink)", bg: "var(--tint-pink)" },
  { id: "b2", name: "7 Day Streak", icon: "flame", earned: true, color: "var(--lime-ink)", bg: "var(--tint-lime)" },
  { id: "b3", name: "Top 100", icon: "medal", earned: false, color: "var(--text-faint)", bg: "var(--surface-grey)" },
  { id: "b4", name: "100 Questions", icon: "activity", earned: true, color: "var(--teal-ink)", bg: "var(--tint-teal)" },
];

export const profile = {
  protected: true,
  render: () => {
    const u = state.user || {};
    return `
    <div class="view pb-safe flex flex-col" style="background:var(--bg-page)">
      <div class="grad-mood px-6 pt-16 pb-8" style="border-radius:0 0 40px 40px;position:relative">
        <div style="position:absolute;top:4rem;right:1.5rem;display:flex;gap:.75rem">
          <button class="icon-btn icon-btn-solid" data-nav="/settings" aria-label="Settings" style="background:var(--surface-soft)">${icon("settings", 20)}</button>
          <button class="icon-btn icon-btn-solid" id="profile-logout" aria-label="Log out" style="background:var(--surface-soft);color:var(--pink-ink)">${icon("logout", 20)}</button>
        </div>
        <div class="flex flex-col items-center mt-4">
          <div style="width:96px;height:96px;background:var(--surface);border-radius:50%;padding:4px;border:1px solid var(--border-strong);margin-bottom:12px">
            <div style="width:100%;height:100%;background:var(--dark);border-radius:50%;display:flex;align-items:center;justify-content:center;overflow:hidden">${blob("happy", 64)}</div>
          </div>
          <h2 class="h3">${esc(u.name || "Student")}</h2>
          <p class="sm semibold" style="color:var(--text-soft)">${esc(u.class || "")} &bull; ${esc(u.board || "")}</p>
        </div>
        <div class="grid grid-cols-3 gap-3 mt-8">
          <div class="card-soft" style="border-radius:var(--radius-md);padding:.75rem 0;display:flex;flex-direction:column;align-items:center"><span class="bold" style="font-size:18px" data-count="${u.totalPoints || 0}">0</span><span class="xxs bold muted">Points</span></div>
          <div class="card-soft" style="border-radius:var(--radius-md);padding:.75rem 0;display:flex;flex-direction:column;align-items:center"><span class="bold" style="font-size:18px">${u.rank ? `#${u.rank}` : "—"}</span><span class="xxs bold muted">Rank</span></div>
          <div class="card-soft" style="border-radius:var(--radius-md);padding:.75rem 0;display:flex;flex-direction:column;align-items:center"><span class="bold" style="font-size:18px" data-count="${u.streak || 0}">0</span><span class="xxs bold muted">Streak</span></div>
        </div>
      </div>

      <div class="px-6 mt-6 space-y-6">
        <a class="btn btn-dark" href="#/admin" target="_blank" style="background:var(--dark);color:var(--on-primary);padding:1rem;border-radius:var(--radius-md);font-weight:600;display:flex;align-items:center;justify-content:center;gap:.5rem">${icon("settings", 18)} Open Admin Panel</a>

        <div>
          <h3 class="h3-sm mb-4 px-1">Achievements</h3>
          <div class="grid grid-cols-2 stagger" style="gap:1rem">
            ${BADGES.map((b) => `
              <div class="card ${b.earned ? "badge-earned" : ""}" style="padding:1rem;display:flex;flex-direction:column;align-items:center;text-align:center;${b.earned ? "" : "opacity:.55;filter:grayscale(1)"}">
                <div class="circle-icon-sm" style="width:56px;height:56px;background:${b.bg};margin-bottom:12px">
                  ${b.earned && b.id === "b1" ? blob("balanced", 32) : `<span style="color:${b.color}">${icon(b.icon, 24)}</span>`}
                </div>
                <h4 class="h4" style="font-size:13px">${b.name}</h4>
                <p class="xxs faint mt-1">${b.earned ? "Earned" : "Locked"}</p>
              </div>`).join("")}
          </div>
        </div>
      </div>
    </div>`;
  },
  mount: (el) => {
    el.querySelector("#profile-logout")?.addEventListener("click", async () => {
      await logoutUser();
      location.hash = "/login";
    });
  },
};