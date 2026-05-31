import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { auth } from '../lib/firebase.js';
import {
  loadUserStats,
  saveUserStats,
  clearSessionStorage,
  STORAGE_KEYS,
  setItem,
  setJSON,
} from '../lib/storage.js';
import { loadUserData, saveUserData, joinLeaderboard, updateLeaderboardScore } from '../lib/firestore.js';
import { getStartDate } from '../lib/dates.js';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [stats, setStats] = useState(() => loadUserStats());
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    getStartDate();
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        setItem(STORAGE_KEYS.FB_UID, fbUser.uid);
        try {
          const remote = await loadUserData(fbUser.uid);
          if (remote) {
            const merged = {
              streak: remote.streak ?? 0,
              wins: remote.wins ?? 0,
              losses: remote.losses ?? 0,
              best: remote.best ?? 0,
              daysIn: remote.daysIn ?? 1,
              reclaimName: remote.reclaimName ?? '',
              startDate: remote.startDate ?? stats.startDate,
              checkins: remote.checkins ?? {},
              quizAnswers: remote.quizAnswers ?? {},
              quizDone: remote.quizDone ?? '',
              lbJoined: stats.lbJoined,
              notifEnabled: stats.notifEnabled,
              notifTime: stats.notifTime,
            };
            saveUserStats(merged);
            setStats(merged);
          }
        } catch (e) {
          console.warn('Failed to load remote user data', e);
        }
      }
      setAuthReady(true);
    });
    return unsub;
  }, []);

  const persistLocal = useCallback((next) => {
    saveUserStats(next);
    setStats(next);
  }, []);

  const syncToFirestore = useCallback(
    async (nextStats = stats) => {
      if (!user) return;
      setSyncing(true);
      try {
        await saveUserData(user.uid, nextStats);
        if (nextStats.lbJoined === 'yes') {
          await updateLeaderboardScore(user.uid, nextStats);
        }
      } catch (e) {
        console.warn('Firestore sync failed', e);
      } finally {
        setSyncing(false);
      }
    },
    [user, stats]
  );

  const updateStats = useCallback(
    (patch) => {
      setStats((prev) => {
        const next = { ...prev, ...patch };
        saveUserStats(next);
        if (user) {
          saveUserData(user.uid, next).catch(() => {});
          if (next.lbJoined === 'yes') {
            updateLeaderboardScore(user.uid, next).catch(() => {});
          }
        }
        return next;
      });
    },
    [user]
  );

  const signUpEmail = useCallback(async ({ name, email, password }) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const next = { ...stats, reclaimName: name };
    persistLocal(next);
    await saveUserData(cred.user.uid, next);
    return cred.user;
  }, [stats, persistLocal]);

  const signInEmail = useCallback(async ({ email, password }) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const remote = await loadUserData(cred.user.uid);
    if (remote) {
      const merged = {
        streak: remote.streak ?? 0,
        wins: remote.wins ?? 0,
        losses: remote.losses ?? 0,
        best: remote.best ?? 0,
        daysIn: remote.daysIn ?? 1,
        reclaimName: remote.reclaimName ?? '',
        startDate: remote.startDate ?? stats.startDate,
        checkins: remote.checkins ?? {},
        quizAnswers: remote.quizAnswers ?? {},
        quizDone: remote.quizDone ?? '',
        lbJoined: stats.lbJoined,
        notifEnabled: stats.notifEnabled,
        notifTime: stats.notifTime,
      };
      persistLocal(merged);
    }
    return cred.user;
  }, [stats, persistLocal]);

  const signInGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const remote = await loadUserData(cred.user.uid);
    if (remote?.reclaimName) {
      persistLocal({
        ...loadUserStats(),
        ...remote,
        reclaimName: remote.reclaimName,
        checkins: remote.checkins ?? {},
      });
    } else if (cred.user.displayName && !stats.reclaimName) {
      persistLocal({ ...stats, reclaimName: cred.user.displayName.split(' ')[0] });
      await saveUserData(cred.user.uid, { ...stats, reclaimName: cred.user.displayName.split(' ')[0] });
    }
    return cred.user;
  }, [stats, persistLocal]);

  const logout = useCallback(async () => {
    await signOut(auth);
    clearSessionStorage();
    setStats(loadUserStats());
  }, []);

  const resetPassword = useCallback(async (email) => {
    await sendPasswordResetEmail(auth, email);
  }, []);

  const setName = useCallback(
    (name, isAnon = false) => {
      const next = {
        ...stats,
        reclaimName: name,
        reclaimIsAnon: isAnon,
      };
      if (isAnon) setItem(STORAGE_KEYS.RECLAIM_ANON, 'yes');
      persistLocal(next);
      if (user) saveUserData(user.uid, next).catch(() => {});
    },
    [stats, user, persistLocal]
  );

  const joinLb = useCallback(async () => {
    const next = { ...stats, lbJoined: 'yes' };
    persistLocal(next);
    if (user) {
      await joinLeaderboard(user.uid, next);
    }
  }, [stats, user, persistLocal]);

  const exportData = useCallback(() => {
    return JSON.stringify({ ...stats, exportedAt: new Date().toISOString() }, null, 2);
  }, [stats]);

  const value = useMemo(
    () => ({
      user,
      authReady,
      stats,
      syncing,
      isAuthenticated: Boolean(user),
      hasProfile: Boolean(stats.reclaimName),
      updateStats,
      syncToFirestore,
      signUpEmail,
      signInEmail,
      signInGoogle,
      logout,
      resetPassword,
      setName,
      joinLb,
      exportData,
      changeEmail: async (newEmail, password) => {
        const u = auth.currentUser;
        const cred = EmailAuthProvider.credential(u.email, password);
        await reauthenticateWithCredential(u, cred);
        await updateEmail(u, newEmail);
      },
      changePassword: async (currentPassword, newPassword) => {
        const u = auth.currentUser;
        const cred = EmailAuthProvider.credential(u.email, currentPassword);
        await reauthenticateWithCredential(u, cred);
        await updatePassword(u, newPassword);
      },
    }),
    [
      user,
      authReady,
      stats,
      syncing,
      updateStats,
      syncToFirestore,
      signUpEmail,
      signInEmail,
      signInGoogle,
      logout,
      resetPassword,
      setName,
      joinLb,
      exportData,
    ]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}

export function useAuth() {
  const { user, authReady, isAuthenticated, signUpEmail, signInEmail, signInGoogle, logout, resetPassword, changeEmail, changePassword } = useUser();
  return { user, authReady, isAuthenticated, signUpEmail, signInEmail, signInGoogle, logout, resetPassword, changeEmail, changePassword };
}

export function useUserData() {
  const { stats, updateStats, syncToFirestore, hasProfile, setName, joinLb, exportData, syncing } = useUser();
  return { stats, updateStats, syncToFirestore, hasProfile, setName, joinLb, exportData, syncing };
}
