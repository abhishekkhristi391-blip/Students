// Chat helpers — real Firestore (mirrors src/lib/chat.ts)
import {
  collection, doc, getDoc, setDoc, addDoc, updateDoc, onSnapshot,
  query, where, orderBy, serverTimestamp, increment,
  db,
} from "./firebase.js";

export function getChatId(uidA, uidB) {
  return [uidA, uidB].sort().join("_");
}

export async function findUserByUsername(username) {
  const clean = username.trim().toLowerCase();
  if (!clean) return null;
  const usSnap = await getDoc(doc(db, "usernames", clean));
  if (!usSnap.exists()) return null;
  const { uid } = usSnap.data();
  const uSnap = await getDoc(doc(db, "users", uid));
  if (!uSnap.exists()) return null;
  return { uid, ...uSnap.data() };
}

export async function ensureChatExists(me, other) {
  const chatId = getChatId(me.uid, other.uid);
  const ref = doc(db, "chats", chatId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      participants: [me.uid, other.uid].sort(),
      participantInfo: {
        [me.uid]: { name: me.name, username: me.username || "" },
        [other.uid]: { name: other.name, username: other.username || "" },
      },
      lastMessage: "",
      lastMessageAt: serverTimestamp(),
      unread: { [me.uid]: 0, [other.uid]: 0 },
    });
  }
  return chatId;
}

export function subscribeToChats(myUid, callback, onError) {
  const q = query(
    collection(db, "chats"),
    where("participants", "array-contains", myUid),
    orderBy("lastMessageAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, onError || (() => {}));
}

export function subscribeToMessages(chatId, callback, onError) {
  const q = query(collection(db, "chats", chatId, "messages"), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, onError || (() => {}));
}

export async function sendMessage(chatId, senderId, receiverId, text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  await addDoc(collection(db, "chats", chatId, "messages"), {
    text: trimmed,
    senderId,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "chats", chatId), {
    lastMessage: trimmed,
    lastMessageAt: serverTimestamp(),
    [`unread.${receiverId}`]: increment(1),
  });
}

export async function markChatAsRead(chatId, myUid) {
  await updateDoc(doc(db, "chats", chatId), { [`unread.${myUid}`]: 0 });
}

export function formatTime(timestamp) {
  if (!timestamp?.toDate) return "";
  const date = timestamp.toDate();
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return date.toLocaleDateString([], { day: "2-digit", month: "short" });
}