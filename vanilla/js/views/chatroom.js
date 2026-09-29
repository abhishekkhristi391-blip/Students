import { state, esc, getAvatarColor, firebaseError } from "../api.js";
import { doc, getDoc, db } from "../firebase.js";
import { ensureChatExists, subscribeToMessages, sendMessage, markChatAsRead } from "../chat.js";
import { icon } from "../icons.js";

export const chatroom = {
  protected: true,
  render: () => `
    <div class="view pb-safe flex flex-col" style="background:var(--surface-muted);max-width:420px;margin:0 auto">
      <div style="padding:3rem 1.5rem 1rem;background:var(--surface);box-shadow:var(--shadow);position:sticky;top:0;z-index:10;display:flex;align-items:center;gap:1rem;border-bottom:1px solid var(--border)">
        <button class="icon-btn icon-btn-soft-muted" data-nav="/chat" aria-label="Back to messages">${icon("chevronLeft", 24)}</button>
        <div style="display:flex;align-items:center;gap:.75rem">
          <div class="circle-icon-sm av-grey" id="cr-avatar" style="width:40px;height:40px"><span class="bold" style="font-size:17px;color:var(--text)">?</span></div>
          <h2 class="h3-sm" id="cr-name">Loading...</h2>
        </div>
      </div>

      <div class="flex-1 px-4 py-6 overflow-y-auto space-y-4" id="cr-messages" role="log" aria-live="polite" aria-label="Messages"></div>

      <div style="position:absolute;bottom:0;left:0;right:0;z-index:10;padding:1rem;background:var(--surface-muted)">
        <p id="cr-error" class="form-error hidden" role="alert" style="margin-bottom:.5rem"></p>
        <div class="chat-composer flex items-center gap-2" style="background:var(--surface);border-radius:var(--radius-pill);padding:8px;box-shadow:var(--shadow);border:1px solid var(--border)">
          <label for="cr-input" class="sr-only">Message</label>
          <input type="text" id="cr-input" placeholder="Message..." maxlength="2000" autocomplete="off" style="flex:1;background:transparent;padding:.5rem .75rem;font-size:14px;border:none;color:var(--text)" />
          <button id="cr-send" aria-label="Send message" style="width:40px;height:40px;background:var(--dark);border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--on-primary);flex-shrink:0">${icon("send", 18)}</button>
        </div>
      </div>
    </div>`,
  mount: (el, { userId }) => {
    const otherUid = userId;
    const myUid = state.user?.uid;
    const msgsEl = el.querySelector("#cr-messages");
    const inputEl = el.querySelector("#cr-input");
    const nameEl = el.querySelector("#cr-name");
    const avatarEl = el.querySelector("#cr-avatar");
    let chatId = null;
    let unsubMsgs = () => {};

    async function init() {
      if (!myUid || !otherUid) return;

      let otherName = "User";
      try {
        const otherSnap = await getDoc(doc(db, "users", otherUid));
        otherName = otherSnap.exists() ? otherSnap.data().name || "User" : "User";
      } catch (e) {
        console.error("chatroom: cannot read peer profile", e);
      }
      nameEl.textContent = otherName;
      const avCls = getAvatarColor(otherUid);
      avatarEl.className = `circle-icon-sm ${avCls} shrink-0`;
      avatarEl.querySelector("span").textContent = (otherName || "?").charAt(0).toUpperCase();

      chatId = await ensureChatExists(
        { uid: myUid, name: state.user.name, username: state.user.username },
        { uid: otherUid, name: otherName }
      );
      markChatAsRead(chatId, myUid).catch((e) => console.error("chatroom: read receipt failed", e));

      unsubMsgs = subscribeToMessages(chatId, (msgs) => {
        msgsEl.innerHTML = msgs.length === 0
          ? `<p class="text-center muted sm" style="margin-top:2.5rem">Abhi tak koi message nahi hai. Sabse pehle "Hi" bhejo! &#128075;</p>`
          : msgs.map((m) => {
              const isPeer = m.senderId !== myUid;
              const time = m.createdAt?.toDate
                ? m.createdAt.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "Sending...";
              return `
              <div style="display:flex;${isPeer ? "justify-content:flex-start" : "justify-content:flex-end"}">
                <div style="max-width:80%;border-radius:var(--radius-lg);padding:12px 16px;border:1px solid ${isPeer ? "var(--border-strong)" : "transparent"};background:${isPeer ? "var(--surface)" : "var(--dark)"};color:${isPeer ? "var(--text)" : "var(--on-primary)"};${isPeer ? "border-top-left-radius:4px" : "border-top-right-radius:4px"}">
                  <p style="font-size:14px;line-height:1.5">${esc(m.text)}</p>
                  <span style="font-size:10px;font-weight:500;display:block;margin-top:4px;color:${isPeer ? "var(--text-faint)" : "currentColor"}">${time}</span>
                </div>
              </div>`;
            }).join("") + `<div id="cr-end"></div>`;
        const end = msgsEl.querySelector("#cr-end");
        if (end) end.scrollIntoView({ behavior: "smooth", block: "end" });
      }, (err) => {
        console.error("chatroom: message stream failed", err);
        msgsEl.innerHTML = `<div class="empty-state" style="padding-top:3rem" role="alert">
          <span style="color:var(--pink-ink)">${icon("wifiOff", 40)}</span>
          <h3 class="h3-sm mt-4 mb-1">Messages didn't load</h3>
          <p class="sm muted" style="text-align:center;max-width:18rem">${esc(firebaseError(err, "Couldn't load messages."))}</p>
        </div>`;
      });
    }
    // init() is async and never awaited by the router — swallow its failures
    // here or they surface as unhandled rejections.
    init().catch((e) => {
      console.error("chatroom: init failed", e);
      nameEl.textContent = "Chat";
      msgsEl.innerHTML = `<div class="empty-state" style="padding-top:3rem" role="alert">
        <span style="color:var(--pink-ink)">${icon("alertCircle", 40)}</span>
        <h3 class="h3-sm mt-4 mb-1">Couldn't open this chat</h3>
        <p class="sm muted" style="text-align:center;max-width:18rem">Check your connection and go back to try again.</p>
      </div>`;
    });

    const send = async () => {
      const text = inputEl.value.trim();
      if (!text) return showSendError("Message can't be empty.");
      if (!chatId) return showSendError("Still connecting — try again in a moment.");
      if (text.length > 2000) return showSendError("Message is too long (2000 characters max).");
      const sendBtn = el.querySelector("#cr-send");
      sendBtn.disabled = true;
      try {
        await sendMessage(chatId, myUid, otherUid, text);
        inputEl.value = "";           // clear only after the write succeeds
        clearSendError();
      } catch (e) {
        console.error("chatroom: send failed", e);
        showSendError(firebaseError(e, "Message didn't send."));
      } finally {
        sendBtn.disabled = false;
      }
    };

    const errorEl = el.querySelector("#cr-error");
    const showSendError = (msg) => { errorEl.textContent = msg; errorEl.classList.remove("hidden"); };
    const clearSendError = () => { errorEl.textContent = ""; errorEl.classList.add("hidden"); };

    el.querySelector("#cr-send").addEventListener("click", send);
    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); send(); }
    });

    return () => unsubMsgs();
  },
};