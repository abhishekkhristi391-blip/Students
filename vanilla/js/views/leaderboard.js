import { state, getAvatarColor, countUpAll, esc, firebaseError } from "../api.js";
import { subscribeToLeaderboard, getMyRank } from "../leaderboard.js";
import { blob } from "../blob.js";

const diag = window.__appDiag || { log() {} };

const TOP_N = 20;
let LB = { period: "Overall", entries: [], myRank: null, unsub: null, loading: true, counted: false, error: null };

export const leaderboard = {
  protected: true,
  // No inner overflow-y-auto: a scroller nested inside .phone-scroll swallows
  // the touch gesture, so the page appears stuck while the inner list moves.
  // The list grows naturally and .phone-scroll does the scrolling; pb-safe
  // reserves room for the nav bar, which this view was previously missing.
  render: () => `<div class="view grad-insights flex flex-col relative pb-safe">
    <div id="lb-scroll"></div>
  </div>`,
  mount: (el) => {
    const scroll = el.querySelector("#lb-scroll");
    if (LB.unsub) LB.unsub();
    LB.entries = [];
    LB.myRank = null;
    LB.loading = true;
    LB.counted = false;
    LB.error = null;

    const draw = () => drawLeaderboard(scroll, LB.entries, LB.myRank, LB.period,
      (p) => { LB.period = p; draw(); }, subscribe);

    const countOnce = () => {
      if (LB.loading || LB.counted) return;
      LB.counted = true;
      countUpAll(scroll, 500);
    };

    // function declaration, not const: `draw` below calls subscribe() and
    // draws a skeleton first, which would hit the TDZ on a const binding.
    function subscribe() {
      if (LB.unsub) { LB.unsub(); LB.unsub = null; }
      LB.loading = true; LB.error = null; draw();
      LB.unsub = subscribeToLeaderboard(TOP_N, (entries) => {
        LB.entries = entries;
        LB.loading = false;
        if (state.user) {
          const me = entries.find((e) => e.uid === state.user.uid);
          if (me) LB.myRank = me.rank;
          else getMyRank(state.user.uid, state.user.totalPoints || 0)
            .then((r) => { LB.myRank = r; draw(); countOnce(); })
            .catch((e) => console.error("leaderboard: myRank failed", e));
        }
        draw();          // rows must exist in the DOM...
        countOnce();      // ...before the count-up pass can find them
      }, (err) => {
        LB.loading = false;
        LB.error = firebaseError(err, "Couldn't load the leaderboard.");
        diag.log("error", "leaderboard query failed", `${err?.code}: ${err?.message}`);
        console.error("leaderboard:", err);
        draw();
      });
    }
    subscribe();
    return () => { LB.unsub && LB.unsub(); LB.unsub = null; };
  },
};

function skeletonRows(n = 6) {
  return Array.from({ length: n }, () =>
    `<div class="skeleton" style="height:64px"></div>`).join("");
}

function drawLeaderboard(root, entries, myRank, period, onChange, onRetry) {
  const loading = LB.loading;
  const meUid = state.user?.uid;
  const top3 = entries.slice(0, 3);
  const meInTop = top3.some((e) => e.uid === meUid);

  const toggle = `
    <div class="seg">
      ${["Daily", "Weekly", "Monthly", "Overall"].map((p) =>
        `<button class="${p === period ? "active" : ""}" data-period="${p}">${p}</button>`).join("")}
    </div>`;

  let listBlock;
  if (loading) {
    listBlock = `<div class="px-6 flex flex-col gap-2 pb-6" aria-hidden="true">${skeletonRows()}</div>
      <p class="sr-only" role="status">Loading leaderboard</p>`;
  } else if (LB.error) {
    listBlock = `
    <div class="empty-state" style="padding-top:3rem;padding-bottom:3rem" role="alert">
      <span style="color:var(--pink-ink)">${icon("alertCircle", 48)}</span>
      <h3 class="h3-sm mt-4 mb-1">Leaderboard unavailable</h3>
      <p class="sm muted" style="text-align:center;max-width:18rem">${esc(LB.error)}</p>
      <button class="btn btn-dark mt-5" data-retry>${icon("refreshCw", 16)} Try Again</button>
    </div>`;
  } else if (entries.length === 0) {
    listBlock = `
    <div class="empty-state" style="padding-top:3rem;padding-bottom:3rem">
      <span style="color:var(--text-faint)">${icon("barChart", 48)}</span>
      <h3 class="h3-sm mt-4 mb-1">Leaderboard khaali hai</h3>
      <p class="sm muted" style="text-align:center;max-width:16rem">Practice ya test complete karo — sabse pehle rank tumhara hoga.</p>
    </div>`;
  } else {
    listBlock = `
    <div class="px-6 flex flex-col gap-3 pb-6">
      <div class="card stagger" style="padding:8px;border-radius:var(--radius-lg);display:flex;flex-direction:column;gap:4px">
        ${entries.map((e) => {
          const isMe = e.uid === meUid;
          const avatar = e.rank === 1
            ? `<div class="circle-icon-sm ${e.avatarColor || getAvatarColor(e.uid)}" style="width:40px;height:40px">${blob("happy", 24)}</div>`
            : `<div class="circle-icon-sm ${e.avatarColor || getAvatarColor(e.uid)}" style="width:40px;height:40px"><span style="font-weight:700;font-size:12px;color:var(--on-accent)">${esc(e.name.charAt(0))}</span></div>`;
          return `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:.75rem;border-radius:var(--radius-md);${isMe ? "background:var(--surface-grey)" : ""}">
            <div style="display:flex;align-items:center;gap:.75rem">
              <span class="bold sm faint" style="width:24px;text-align:center">${e.rank}</span>
              ${avatar}
              <span class="bold sm">${isMe ? "You" : esc(e.name)}</span>
            </div>
            <span class="bold sm" style="color:${isMe ? "var(--accent)" : "var(--text)"}"><span data-count="${e.points}">${e.points}</span></span>
          </div>`;
        }).join("")}
      </div>
    </div>`;
  }

  root.innerHTML = `
    <div class="px-6 pt-16 pb-4">
      <h2 class="h2">Leaderboard</h2>
      <p class="sub mb-4">See how you rank globally</p>
      ${toggle}
    </div>
    ${podiumBlock(top3, meUid)}
    ${listBlock}
    ${state.user && !meInTop && entries.length > 0 ? pinnedCard(meUid, myRank) : ""}`;

  root.querySelectorAll("[data-period]").forEach((b) =>
    b.addEventListener("click", () => onChange(b.dataset.period))
  );
  const retry = root.querySelector("[data-retry]");
  if (retry && onRetry) retry.addEventListener("click", onRetry);
}

function podiumBlock(top3, meUid) {
  if (top3.length === 0) return "";
  const pos = (rank, e, avatarPx, blobPx) => `
    <div class="flex flex-col items-center">
      <div class="circle-icon ${e.avatarColor}" style="width:${avatarPx}px;height:${avatarPx}px;border:4px solid ${rank === 1 ? "var(--brand-yellow)" : "var(--border-strong)"};z-index:10;margin-bottom:-12px">
        ${rank === 1 ? blob("happy", blobPx) : `<span style="color:var(--on-accent);font-weight:700;font-size:14px">${esc(e.name.charAt(0))}</span>`}
      </div>
      <div style="background:${rank === 1 ? "var(--surface)" : "var(--surface-soft)"};width:${rank === 1 ? 96 : 80}px;height:${rank === 1 ? 128 : 96}px;border-radius:var(--radius-md) 16px 0 0;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:12px;box-shadow:var(--shadow)">
        <span style="font-size:${rank === 1 ? 24 : 18}px;font-weight:600">${rank}</span>
      </div>
    </div>`;
  const rank2 = top3[1] ? pos(2, top3[1], 48, 30) : "";
  const rank1 = top3[0] ? pos(1, top3[0], 64, 40) : "";
  const rank3 = top3[2] ? pos(3, top3[2], 48, 30) : "";
  return `<div class="px-6 py-6 flex justify-center items-end gap-3" style="height:180px">${rank2}${rank1}${rank3}</div>`;
}

function pinnedCard(meUid, myRank) {
  const u = state.user;
  return `<div style="position:absolute;bottom:6.5rem;left:1.5rem;right:1.5rem;z-index:20">
    <div style="background:var(--surface);border:1px solid var(--border-strong);border-radius:var(--radius-lg);padding:1rem;display:flex;align-items:center;justify-content:space-between">
      <div style="display:flex;align-items:center;gap:.75rem">
        <span class="bold sm" style="width:24px;text-align:center">${myRank ?? "—"}</span>
        <div class="circle-icon-sm av-grey" style="width:40px;height:40px"><span class="bold xs" style="color:var(--on-accent)">You</span></div>
        <span class="bold sm">You</span>
      </div>
      <span class="bold sm brand-yellow"><span data-count="${u.totalPoints || 0}">${u.totalPoints || 0}</span> pts</span>
    </div>
  </div>`;
}