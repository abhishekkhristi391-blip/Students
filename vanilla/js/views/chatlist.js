import { state, esc, getAvatarColor, trapFocus, firebaseError } from "../api.js";
import { subscribeToChats, findUserByUsername, ensureChatExists, formatTime } from "../chat.js";
import { icon } from "../icons.js";

let chats = [];
let chatsLoaded = false;
let chatsError = null;
// set while the add-friend dialog is open, so route teardown can dismiss it
let routeCleanup = null;

export const chatlist = {
  protected: true,
  render: () => `
    <div class="view pb-safe flex flex-col" style="background:var(--surface-muted)">
      <div style="padding:4rem 1.5rem 1rem;background:var(--surface);box-shadow:var(--shadow);z-index:10;position:sticky;top:0">
        <div class="flex justify-between items-center mb-6">
          <h2 class="h3" style="font-size:22px">Messages</h2>
          <button class="icon-btn icon-btn-soft-muted" id="chat-new" aria-label="Start a new chat">${icon("userPlus", 18)}</button>
        </div>
        <div class="searchchip" style="width:100%">
          <label for="chat-filter" class="sr-only">Search messages</label>
          <span style="color:var(--text-faint)" aria-hidden="true">${icon("search", 18)}</span>
          <input type="search" id="chat-filter" placeholder="Search messages..." />
        </div>
      </div>

      <div>
        <div id="chat-list" class="px-4 py-4 space-y-2 stagger" role="list" aria-live="polite" aria-busy="true"></div>
      </div>
      <div id="chat-modal-root"></div>
    </div>`,
  mount: (el) => {
    const listEl = el.querySelector("#chat-list");
    const filterEl = el.querySelector("#chat-filter");
    const myUid = state.user?.uid;

    const draw = () => {
      listEl.setAttribute("aria-busy", String(!chatsLoaded));
      if (!chatsLoaded) {
        listEl.innerHTML = `<div class="flex flex-col gap-2" aria-hidden="true">${
          Array.from({ length: 5 }, () => '<div class="skeleton" style="height:80px"></div>').join("")
        }</div><p class="sr-only" role="status">Loading conversations</p>`;
        return;
      }
      if (chatsError) {
        listEl.innerHTML = `
          <div class="empty-state" style="padding-top:4rem;min-height:50vh" role="alert">
            <span style="color:var(--pink-ink)">${icon("wifiOff", 44)}</span>
            <h3 class="h3-sm mt-4 mb-1">Couldn't load messages</h3>
            <p class="sm muted" style="text-align:center;max-width:18rem">${esc(chatsError)}</p>
            <button class="btn btn-dark mt-5" data-retry>${icon("refreshCw", 16)} Try Again</button>
          </div>`;
        return;
      }
      const q = filterEl.value.toLowerCase();
      const filtered = chats.filter((c) => {
        const otherUid = c.participants.find((p) => p !== myUid) || "";
        const otherName = c.participantInfo?.[otherUid]?.name || "";
        return otherName.toLowerCase().includes(q);
      });
      if (filtered.length === 0) {
        listEl.innerHTML = `
          <div class="empty-state" style="padding-top:4rem;min-height:50vh">
            <span style="color:var(--text-faint)">${icon("messageCircle", 48)}</span>
            <h3 class="h3-sm mt-4 mb-1">Koi chat nahi hai</h3>
            <p class="sm muted" style="text-align:center">Upar right me + button dabakar kisi ka username daalo aur chat shuru karo.</p>
          </div>`;
        return;
      }
      listEl.innerHTML = filtered.map((chat) => {
        const otherUid = chat.participants.find((p) => p !== myUid) || "";
        const other = chat.participantInfo?.[otherUid] || {};
        const unread = chat.unread?.[myUid || ""] || 0;
        const avCls = getAvatarColor(otherUid);
        const initial = (other.name || "?").charAt(0).toUpperCase();
        return `
          <div class="card press" role="listitem" style="padding:12px;display:flex;align-items:center;gap:1rem" data-nav="/chat/${encodeURIComponent(otherUid)}">
            <div class="circle-icon-sm ${avCls}" style="width:56px;height:56px" aria-hidden="true"><span class="bold" style="font-size:17px;color:var(--on-accent)">${esc(initial)}</span></div>
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-center mb-1">
                <h4 class="h4 truncate" style="font-size:15px">${esc(other.name || "Unknown")}</h4>
                <span class="xs ${unread > 0 ? "bold brand-purple" : "muted semibold"}" style="white-space:nowrap">${formatTime(chat.lastMessageAt)}</span>
              </div>
              <p class="sm truncate ${unread > 0 ? "bold" : "muted"}" style="font-size:13px">${esc(chat.lastMessage || "Chat shuru karo...")}</p>
            </div>
            ${unread > 0 ? `<span class="chip chip-purple" style="flex-shrink:0">${unread} new</span>` : ""}
          </div>`;
      }).join("");
    };

    chatsError = null;
    draw(); // skeleton first

    const subscribe = () => {
      chatsLoaded = false; chatsError = null; draw();
      return subscribeToChats(myUid, (data) => {
        chats = data; chatsLoaded = true; chatsError = null; draw();
      }, (err) => {
        chatsLoaded = true;
        chatsError = firebaseError(err, "Couldn't load your messages.");
        console.error("chatlist:", err);
        draw();
      });
    };

    let unsub = subscribe();
    listEl.addEventListener("click", (e) => {
      if (e.target.closest("[data-retry]")) { unsub(); unsub = subscribe(); }
    });
    filterEl.addEventListener("input", draw);
    el.querySelector("#chat-new").addEventListener("click", () => addFriendModal(el));

    return () => { unsub(); if (routeCleanup) routeCleanup(); };
  },
};

function addFriendModal(el) {
  const root = el.querySelector("#chat-modal-root");
  const opener = document.activeElement;
  root.innerHTML = `
    <div class="modal-overlay" id="cf-overlay">
      <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="cf-title">
        <div class="flex justify-between items-center mb-6">
          <h3 class="h3-sm" id="cf-title">Start a Chat</h3>
          <button class="icon-btn icon-btn-soft-muted" id="cf-close" aria-label="Close">${icon("x", 16)}</button>
        </div>
        <div class="space-y-4">
          <div>
            <label for="cf-username" class="xxs bold muted" style="display:block;margin-bottom:.5rem">Search by Username</label>
            <div class="searchchip" style="border:1px solid var(--border-strong)">
              <span class="bold faint" aria-hidden="true">@</span>
              <input type="text" id="cf-username" placeholder="username" autocomplete="off" />
            </div>
            <p class="feed" id="cf-error" role="alert"></p>
          </div>
          <button class="btn btn-dark" id="cf-go">Start Chat</button>
        </div>
      </div>
    </div>`;

  const overlay = el.querySelector("#cf-overlay");
  const input = el.querySelector("#cf-username");
  const feed = el.querySelector("#cf-error");
  const go = el.querySelector("#cf-go");

  const close = () => {
    if (routeCleanup === close) routeCleanup = null;
    root.innerHTML = "";
    document.removeEventListener("keydown", onEsc);
    if (opener && opener.isConnected) opener.focus();
  };
  const onEsc = (e) => { if (e.key === "Escape") close(); };
  document.addEventListener("keydown", onEsc);
  overlay.addEventListener("keydown", trapFocus);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  el.querySelector("#cf-close").addEventListener("click", close);
  input.focus();
  // a route change can tear the view down with the dialog still open
  routeCleanup = close;

  const start = async () => {
    const q = input.value.trim();
    if (!q) { feed.className = "feed red"; feed.textContent = "Username daalo."; input.focus(); return; }
    if (!/^[a-zA-Z0-9_]{3,}$/.test(q)) {
      feed.className = "feed red";
      feed.textContent = "Username must be at least 3 characters — letters, numbers and _ only.";
      input.focus();
      return;
    }
    go.disabled = true;
    go.textContent = "Searching...";
    feed.textContent = "";
    try {
      const other = await findUserByUsername(q);
      if (!other) { feed.className = "feed red"; feed.textContent = "Yeh username nahi mila. Sahi username check karo."; go.disabled = false; go.textContent = "Start Chat"; input.focus(); return; }
      if (other.uid === state.user.uid) { feed.className = "feed red"; feed.textContent = "Aap khud ko add nahi kar sakte."; go.disabled = false; go.textContent = "Start Chat"; input.focus(); return; }
      await ensureChatExists(
        { uid: state.user.uid, name: state.user.name, username: state.user.username },
        { uid: other.uid, name: other.name, username: other.username }
      );
      close();
      location.hash = `/chat/${encodeURIComponent(other.uid)}`;
    } catch (e) {
      console.error("chatlist: start chat failed", e);
      feed.className = "feed red";
      feed.textContent = "Kuch galat ho gaya, dobara try karo.";
      go.disabled = false;
      go.textContent = "Start Chat";
    }
  };

  go.addEventListener("click", start);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); start(); } });
}