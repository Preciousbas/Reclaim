import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  verifyBeforeUpdateEmail,
  updatePassword,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { auth } from '../lib/firebase.js';
import {
  loadUserStats,
  saveUserStats,
  clearSessionStorage,
  STORAGE_KEYS,
  setItem,
} from '../lib/storage.js';
import { loadUserData, saveUserData, joinLeaderboard, updateLeaderboardScore } from '../lib/firestore.js';
import { repairStaleJourney, todayISO, withJourneyStart } from '../lib/dates.js';

const UserContext = createContext(null);

function googleProvider() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return provider;
}

function mergeRemote(remote, local) {
  if (!remote) return repairStaleJourney(local);
  return repairStaleJourney({
    streak: remote.streak ?? local.streak ?? 0,
    wins: remote.wins ?? local.wins ?? 0,
    losses: remote.losses ?? local.losses ?? 0,
    best: remote.best ?? local.best ?? 0,
    daysIn: remote.daysIn ?? local.daysIn ?? 1,
    reclaimName: remote.reclaimName || local.reclaimName || '',
    startDate: remote.startDate || local.startDate || '',
    checkins: remote.checkins ?? local.checkins ?? {},
    quizAnswers: remote.quizAnswers ?? local.quizAnswers ?? {},
    quizDone: remote.quizDone ?? local.quizDone ?? '',
    lbJoined: local.lbJoined,
    notifEnabled: local.notifEnabled,
    notifTime: local.notifTime,
    congratsShown: remote.congratsShown ?? local.congratsShown ?? false,
  });
}

async function hydrateGoogleUser(fbUser, persistLocal, currentStats) {
  const remote = await loadUserData(fbUser.uid);
  if (remote?.reclaimName) {
    persistLocal(mergeRemote(remote, loadUserStats()));
    return fbUser;
  }
  const first = fbUser.displayName?.split(' ')[0];
  if (first && !currentStats.reclaimName) {
    const next = withJourneyStart({
      ...currentStats,
      reclaimName: first,
      startDate: Object.keys(currentStats.checkins || {}).length
        ? (currentStats.startDate || todayISO())
        : todayISO(),
    });
    persistLocal(next);
    await saveUserData(fbUser.uid, next);
  }
  return fbUser;
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [stats, setStats] = useState(() => {
    const loaded = loadUserStats();
    const repaired = repairStaleJourney(loaded);
    if (repaired !== loaded) saveUserStats(repaired);
    return repaired;
  });
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        setItem(STORAGE_KEYS.FB_UID, fbUser.uid);
        try {
          const remote = await loadUserData(fbUser.uid);
          if (remote && !cancelled) {
            const merged = mergeRemote(remote, loadUserStats());
            saveUserStats(merged);
            setStats(merged);
            if (merged.startDate !== remote.startDate || merged.checkins !== remote.checkins) {
              saveUserData(fbUser.uid, merged).catch(() => {});
            }
          }
        } catch (e) {
          console.warn('Failed to load remote user data', e);
        }
      }
      if (!cancelled) setAuthReady(true);
    });

    getRedirectResult(auth)
      .then(async (result) => {
        if (!result?.user) return;
        const local = loadUserStats();
        await hydrateGoogleUser(result.user, (next) => {
          saveUserStats(next);
          setStats(next);
        }, local);
      })
      .catch((e) => console.warn('Google redirect result', e));

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  const persistLocal = useCallback((next) => {
    const repaired = repairStaleJourney(next);
    saveUserStats(repaired);
    setStats(repaired);
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
    const next = withJourneyStart({ ...stats, reclaimName: name, startDate: todayISO() });
    persistLocal(next);
    await saveUserData(cred.user.uid, next);
    return cred.user;
  }, [stats, persistLocal]);

  const signInEmail = useCallback(async ({ email, password }) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const remote = await loadUserData(cred.user.uid);
    persistLocal(mergeRemote(remote, stats));
    return cred.user;
  }, [stats, persistLocal]);

  const signInGoogle = useCallback(async () => {
    const provider = googleProvider();
    try {
      const cred = await signInWithPopup(auth, provider);
      await hydrateGoogleUser(cred.user, persistLocal, stats);
      return cred.user;
    } catch (err) {
      const code = err.code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        throw err;
      }
      const needsRedirect = code === 'auth/popup-blocked'
        || code === 'auth/operation-not-supported-in-this-environment';
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (needsRedirect || isMobile) {
        await signInWithRedirect(auth, provider);
        return null;
      }
      throw err;
    }
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
      const next = withJourneyStart({
        ...stats,
        reclaimName: name,
        reclaimIsAnon: isAnon,
        startDate: stats.startDate && Object.keys(stats.checkins || {}).length
          ? stats.startDate
          : todayISO(),
      });
      if (isAnon) setItem(STORAGE_KEYS.RECLAIM_ANON, 'yes');
      persistLocal(next);
      if (user) {
        saveUserData(user.uid, next).catch(() => {});
        if (user.providerData?.some((p) => p.providerId === 'password') || user.email) {
          updateProfile(user, { displayName: name }).catch(() => {});
        }
      }
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
        if (!u?.email) throw new Error('Not signed in.');
        const cred = EmailAuthProvider.credential(u.email, password);
        await reauthenticateWithCredential(u, cred);
        await verifyBeforeUpdateEmail(u, newEmail);
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
