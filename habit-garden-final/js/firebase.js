// ── HABIT GARDEN · FIREBASE ──
// Replace the firebaseConfig values below with yours from the Firebase Console
// (Project Settings → Your apps → Web app → SDK setup and configuration)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, orderBy, limit,
  getDocs, addDoc, onSnapshot, serverTimestamp, increment }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// ─────────────────────────────────────────────
// PASTE YOUR CONFIG HERE (from Firebase Console)
// ─────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "PASTE_YOUR_API_KEY",
  authDomain:        "PASTE_YOUR_AUTH_DOMAIN",
  projectId:         "PASTE_YOUR_PROJECT_ID",
  storageBucket:     "PASTE_YOUR_STORAGE_BUCKET",
  messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID",
  appId:             "PASTE_YOUR_APP_ID"
};
// ─────────────────────────────────────────────

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// ── AUTH ──────────────────────────────────────
export const FB = {
  auth, db, storage,

  // Sign in with Google (uses redirect on mobile for reliability)
  async signInGoogle() {
    try {
      if (/Mobi|Android/i.test(navigator.userAgent)) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
      }
    } catch (e) { console.error('signIn error', e); throw e; }
  },

  async handleRedirectResult() {
    const result = await getRedirectResult(auth);
    return result?.user || null;
  },

  async signOutUser() { await signOut(auth); },

  onAuth(cb) { return onAuthStateChanged(auth, cb); },

  // ── USER PROFILE ──────────────────────────────
  async getOrCreateUser(firebaseUser) {
    const ref = doc(db, 'users', firebaseUser.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) return snap.data();
    const newUser = {
      uid: firebaseUser.uid,
      name: firebaseUser.displayName || 'Habit Grower',
      email: firebaseUser.email,
      photoURL: firebaseUser.photoURL || null,
      handle: '@' + (firebaseUser.email?.split('@')[0] || 'user'),
      city: '', country: '', bio: '', quote: '',
      peers: 0, following: 0, followers: 0, trybes: 0,
      stats: { daysDone: 0, bestStreak: 0, consistency: 0, plants: 0, avgStreak: 0, weeksActive: 0 },
      createdAt: serverTimestamp()
    };
    await setDoc(ref, newUser);
    return newUser;
  },

  async updateUser(uid, data) {
    await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() });
  },

  // ── HABITS ────────────────────────────────────
  async createHabit(uid, habit) {
    const ref = await addDoc(collection(db, 'habits'), {
      ...habit, ownerId: uid,
      streak: 0, longestStreak: 0,
      createdAt: serverTimestamp(), updatedAt: serverTimestamp()
    });
    // Create plant document
    await setDoc(doc(db, 'plants', ref.id), {
      habitId: ref.id, ownerId: uid,
      stage: 'seed', streakDays: 0,
      lastCompletionDate: null, jungleUnlocked: false,
      createdAt: serverTimestamp()
    });
    return ref.id;
  },

  async getHabits(uid) {
    const q = query(collection(db, 'habits'), where('ownerId', '==', uid), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  // ── COMPLETIONS ───────────────────────────────
  async logCompletion(uid, habitId, { metricValue, caption, mediaUrl, lat, lon, city, visibility }) {
    const today = new Date().toISOString().slice(0, 10);
    const completion = {
      habitId, userId: uid,
      metricValue, caption: caption || '',
      mediaUrl: mediaUrl || null,
      geo: lat ? { lat, lon, city } : null,
      visibility,
      timestamp: serverTimestamp(),
      habitDate: today
    };
    const compRef = await addDoc(collection(db, 'completions'), completion);

    // Update streak on plant
    const plantRef = doc(db, 'plants', habitId);
    const plantSnap = await getDoc(plantRef);
    if (plantSnap.exists()) {
      const plant = plantSnap.data();
      const lastDate = plant.lastCompletionDate;
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().slice(0, 10);
      const newStreak = (lastDate === yStr || lastDate === today) ? plant.streakDays + 1 : 1;
      const newStage = this._calcStage(newStreak);
      await updateDoc(plantRef, {
        streakDays: newStreak, lastCompletionDate: today,
        stage: newStage, jungleUnlocked: newStreak >= 365
      });
    }
    return compRef.id;
  },

  _calcStage(streak) {
    const days = streak;
    if (days < 7)   return 'seed';
    if (days < 14)  return 'bud';
    if (days < 28)  return 'sapling';
    if (days < 56)  return 'young_plant';
    if (days < 84)  return 'flowers1';
    if (days < 112) return 'flowers2';
    if (days < 168) return 'early_fruit';
    if (days < 252) return 'full_fruit';
    if (days < 365) return 'mature_tree';
    return 'jungle';
  },

  // ── MEDIA UPLOAD ──────────────────────────────
  async uploadMedia(uid, habitId, file) {
    const ext = file.type.startsWith('video') ? 'mp4' : 'jpg';
    const path = `completions/${uid}/${habitId}/${Date.now()}.${ext}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  },

  // ── FEED ──────────────────────────────────────
  async getFeed(uid, tab = 'peers') {
    // For 'peers': get completions from peer connections
    // For 'discover': get public completions
    const visibility = tab === 'peers' ? ['peers', 'public'] : ['public'];
    const q = query(
      collection(db, 'completions'),
      where('visibility', 'in', visibility),
      orderBy('timestamp', 'desc'),
      limit(20)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async toggleLike(uid, completionId) {
    const likeRef = doc(db, 'likes', `${uid}_${completionId}`);
    const snap = await getDoc(likeRef);
    if (snap.exists()) {
      await snap.ref.delete();
      await updateDoc(doc(db, 'completions', completionId), { likeCount: increment(-1) });
      return false;
    } else {
      await setDoc(likeRef, { userId: uid, completionId, createdAt: serverTimestamp() });
      await updateDoc(doc(db, 'completions', completionId), { likeCount: increment(1) });
      return true;
    }
  },

  // ── SOCIAL ────────────────────────────────────
  async sendPeerRequest(fromUid, toUid) {
    await setDoc(doc(db, 'peerRequests', `${fromUid}_${toUid}`), {
      from: fromUid, to: toUid,
      status: 'pending', createdAt: serverTimestamp()
    });
  },

  async acceptPeerRequest(fromUid, toUid) {
    const reqRef = doc(db, 'peerRequests', `${fromUid}_${toUid}`);
    await updateDoc(reqRef, { status: 'accepted' });
    // Add to each other's peers subcollection
    await setDoc(doc(db, 'users', toUid, 'peers', fromUid), { since: serverTimestamp() });
    await setDoc(doc(db, 'users', fromUid, 'peers', toUid), { since: serverTimestamp() });
    await updateDoc(doc(db, 'users', toUid),   { peers: increment(1) });
    await updateDoc(doc(db, 'users', fromUid), { peers: increment(1) });
  },

  async getNotifications(uid) {
    const q = query(
      collection(db, 'notifications'),
      where('toUid', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(30)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  // ── LEADERBOARD ───────────────────────────────
  async getLeaderboard(habitType, scope, city) {
    let q = query(
      collection(db, 'leaderboard'),
      where('habitPresetType', '==', habitType),
      where('scopeType', '==', scope.toUpperCase()),
      orderBy('streakDays', 'desc'),
      limit(50)
    );
    if (scope === 'city' && city) {
      q = query(
        collection(db, 'leaderboard'),
        where('habitPresetType', '==', habitType),
        where('scopeType', '==', 'CITY'),
        where('city', '==', city),
        orderBy('streakDays', 'desc'),
        limit(50)
      );
    }
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  // ── REAL-TIME LISTENERS ───────────────────────
  listenToFeed(uid, cb) {
    const q = query(
      collection(db, 'completions'),
      where('visibility', 'in', ['peers', 'public']),
      orderBy('timestamp', 'desc'),
      limit(20)
    );
    return onSnapshot(q, snap => {
      cb(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  },

  listenToNotifications(uid, cb) {
    const q = query(
      collection(db, 'notifications'),
      where('toUid', '==', uid),
      where('read', '==', false),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, snap => {
      cb(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }
};

export default FB;
