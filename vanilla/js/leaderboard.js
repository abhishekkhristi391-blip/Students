// Leaderboard — real Firestore (mirrors src/lib/leaderboard.ts)
import { collection, query, orderBy, limit, onSnapshot, where, getCountFromServer, db } from "./firebase.js";
import { getAvatarColor } from "./api.js";

export function subscribeToLeaderboard(topN, callback, onError) {
  const q = query(
    collection(db, "users"),
    where("status", "==", "active"),
    orderBy("totalPoints", "desc"),
    limit(topN)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d, i) => {
      const data = d.data();
      return {
        uid: d.id,
        name: data.name || "Student",
        points: data.totalPoints || 0,
        rank: i + 1,
        avatarColor: getAvatarColor(d.id),
      };
    }));
  }, onError || (() => {}));
}

export async function getMyRank(myUid, myPoints) {
  const q = query(
    collection(db, "users"),
    where("status", "==", "active"),
    where("totalPoints", ">", myPoints)
  );
  const snap = await getCountFromServer(q);
  return snap.data().count + 1;
}