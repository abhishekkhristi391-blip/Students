import { state, esc, firebaseError } from "../api.js";
import { doc, getDoc, db } from "../firebase.js";
import { ensureChatExists, subscribeToMessages, sendMessage, markChatAsRead } from "../chat.js";
import { icon } from "../icons.js";

export const chatroom = {
  protected: true,
  render: () => `
    <div class="view cr-root" style="max-width:420px;margin:0 auto">
      <div class="cr-head">
        <button class="icon-btn icon-btn-soft-muted" data-nav="/chat" aria-label="Back to messages">${icon("chevronLeft", 24)}</button>
        <div class="cr-avatar" id="cr-avatar" aria-hidden="true"><span>?</span></div>
        <div class="cr-id">
          <div class="cr-name truncate" id="cr-name">Loading...</div>
          <div class="cr-status truncate" id="cr-status">Connecting...</div>
        </div>
      </div>

      <div class="cr-scroll" id="cr-messages" role="log" aria-live="polite" aria-label="Messages"></div>

      <div class="cr-foot">
        <p id="cr-error" class="form-error hidden" role="alert" style="margin:0 0 .5rem"></p>
        <div class="cr-composer">
          <label for="cr-input" class="sr-only">Message</label>
          <input class="cr-input" type="text" id="cr-input" placeholder="Message..." maxlength="2000" autocomplete="off" enterkeyhint="send" />
          <button class="cr-send press" id="cr-send" aria-label="Send message">${icon("send", 18)}</button>
        </div>
      </div>
    </div>`,
  mount: (el, { userId }) => {
    const otherUid = userId;
    const myUid = state.user?.uid;
    const msgsEl = el.querySelector("#cr-messages");
    const inputEl = el.querySelector("#cr-input");
    const nameEl = el.querySelector("#cr-name");
    const statusEl = el.querySelector("#cr-status");
    const avatarEl = el.querySelector("#cr-avatar");
    let chatId = null;
    let unsubMsgs = () => {};
    // The list re-renders on every snapshot, so without this the fade-in would
    // replay on the whole conversation each time a message arrives.
    const painted = new Set();

    const at = (t) => (t && t.toDate ? t.toDate() : null);
    // Two messages count as one run only if they are close in time too, or a
    // conversation spread over hours collapses into a single block.
    const RUN_MS = 5 * 60 * 1000;
    const continues = (a, b) =>
      !!a && !!b && a.senderId === b.senderId &&
      Math.abs((at(a.createdAt)?.getTime() || 0) - (at(b.createdAt)?.getTime() || 0)) < RUN_MS;

    const clock = (t) =>
      t ? t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

    // Presence is derived from the peer's last message, not invented: there is
    // no presence field on the user doc and the rules do not allow writing one.
    const peerStatus = (msgs) => {
      const last = [...msgs].reverse().find((m) => m.senderId === otherUid);
      const t = last && at(last.createdAt);
      if (!t) return last ? "Online" : "No messages yet";
      const mins = (Date.now() - t.getTime()) / 60000;
      if (mins < 5) return "Online";
      if (mins < 60) return `Last seen ${Math.floor(mins)}m ago`;
      if (mins < 1440) return `Last seen ${Math.floor(mins / 60)}h ago`;
      return `Last seen ${Math.floor(mins / 1440)}d ago`;
    };

    async function init() {
      if (!myUid || !otherUid) return;

      let otherName = "User";
      let otherUsername = "";
      try {
        const otherSnap = await getDoc(doc(db, "users", otherUid));
        if (otherSnap.exists()) {
          otherName = otherSnap.data().name || "User";
          otherUsername = otherSnap.data().username || "";
        }
      } catch (e) {
        console.error("chatroom: cannot read peer profile", e);
      }
      nameEl.textContent = otherName;
      avatarEl.querySelector("span").textContent = (otherName || "?").charAt(0).toUpperCase();
      avatarEl.title = otherUsername ? `@${otherUsername}` : otherName;

      chatId = await ensureChatExists(
        { uid: myUid, name: state.user.name, username: state.user.username },
        { uid: otherUid, name: otherName, username: otherUsername }
      );
      markChatAsRead(chatId, myUid).catch((e) => console.error("chatroom: read receipt failed", e));

      unsubMsgs = subscribeToMessages(chatId, (msgs) => {
        statusEl.textContent = peerStatus(msgs);
        if (msgs.length === 0) {
          msgsEl.innerHTML = `<p class="text-center muted sm" style="margin-top:2.5rem">Abhi tak koi message nahi hai. Sabse pehle "Hi" bhejo! &#128075;</p>`;
          return;
        }
        // Only chase the tail if the reader is already there; yanking them down
        // while they scroll back through history is the fastest way to make a
        // chat feel broken.
        const stick = msgsEl.scrollHeight - msgsEl.scrollTop - msgsEl.clientHeight < 96;
        msgsEl.innerHTML = msgs.map((m, i) => {
          const isPeer = m.senderId !== myUid;
          const t = at(m.createdAt);
          const tail = continues(m, msgs[i + 1]) ? "" : " tail";
          const cls = ["cr-msg", isPeer ? "them" : "me", continues(msgs[i - 1], m) ? "cont" : "", painted.has(m.id) ? "" : "new"]
            .filter(Boolean).join(" ");
          return `
          <div class="${cls}">
            <div class="cr-bubble ${isPeer ? "them" : "me"}${tail}">
              <p class="cr-text">${esc(m.text)}</p>
              <span class="cr-time">${clock(t) || "Sending..."}</span>
            </div>
          </div>`;
        }).join("");
        // marked seen only after the markup is built, or the first iteration
        // would mark its own siblings and they would never animate
        msgs.forEach((x) => painted.add(x.id));
        if (stick) msgsEl.scrollTop = msgsEl.scrollHeight;
      }, (err) => {
        console.error("chatroom: message stream failed", err);
        statusEl.textContent = "Offline";
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