import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getCountFromServer,
  startAfter,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase.js';
import { computeRIFromStats } from './resilience.js';

export async function saveUserData(uid, stats) {
  const userData = {
    streak: stats.streak ?? 0,
    wins: stats.wins ?? 0,
    losses: stats.losses ?? 0,
    best: stats.best ?? 0,
    daysIn: stats.daysIn ?? 1,
    reclaimName: stats.reclaimName ?? '',
    startDate: stats.startDate ?? '',
    checkins: stats.checkins ?? {},
    quizAnswers: stats.quizAnswers ?? {},
    quizDone: stats.quizDone ?? '',
    congratsShown: stats.congratsShown ?? false,
    lastUpdated: serverTimestamp(),
  };
  await setDoc(doc(db, 'users', uid), userData, { merge: true });
}

export async function loadUserData(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return snap.data();
}

export async function getUniqueLbName(baseName) {
  const q = query(collection(db, 'leaderboard'), where('baseName', '==', baseName));
  const snap = await getDocs(q);
  if (snap.empty) return baseName;
  const existing = snap.docs.map((d) => d.data().displayName);
  let i = 1;
  while (existing.includes(`${baseName}_${String(i).padStart(2, '0')}`)) i += 1;
  return `${baseName}_${String(i).padStart(2, '0')}`;
}

export async function joinLeaderboard(uid, stats) {
  const baseName = stats.reclaimName || 'Anonymous';
  const displayName = await getUniqueLbName(baseName);
  const ri = computeRIFromStats({
    streak: stats.streak,
    wins: stats.wins,
    losses: stats.losses,
    checkins: stats.checkins,
  });
  await setDoc(doc(db, 'leaderboard', uid), {
    uid,
    baseName,
    displayName,
    streak: stats.streak,
    ri: ri.ri,
    updatedAt: serverTimestamp(),
  });
  return displayName;
}

export async function updateLeaderboardScore(uid, stats) {
  const ref = doc(db, 'leaderboard', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const ri = computeRIFromStats({
    streak: stats.streak,
    wins: stats.wins,
    losses: stats.losses,
    checkins: stats.checkins,
  });
  await updateDoc(ref, {
    streak: stats.streak,
    ri: ri.ri,
    updatedAt: serverTimestamp(),
  });
}

export async function fetchLeaderboard(limitCount = 50, afterDoc = null) {
  let q = query(collection(db, 'leaderboard'), orderBy('ri', 'desc'), limit(limitCount));
  if (afterDoc) {
    q = query(collection(db, 'leaderboard'), orderBy('ri', 'desc'), startAfter(afterDoc), limit(limitCount));
  }
  const snap = await getDocs(q);
  return {
    entries: snap.docs.map((d, i) => ({
      id: d.id,
      rank: i + 1,
      ...d.data(),
    })),
    lastDoc: snap.docs[snap.docs.length - 1] || null,
    hasMore: snap.docs.length === limitCount,
  };
}

export async function fetchLeaderboardTotal() {
  const snap = await getCountFromServer(collection(db, 'leaderboard'));
  return snap.data().count;
}

export async function fetchUserRank(myRI) {
  const q = query(collection(db, 'leaderboard'), where('ri', '>', myRI));
  const snap = await getCountFromServer(q);
  return snap.data().count + 1;
}
