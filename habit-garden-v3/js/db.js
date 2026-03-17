import { collection, query, where, getDocs, doc, getDoc, setDoc, addDoc, updateDoc, serverTimestamp, orderBy, limit }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

window.HG = window.HG || {};

// Helper: strip undefined / null values so Firestore never rejects the document
function clean(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null) out[k] = v;
  }
  return out;
}

// Preset color map (fallback palette keyed by presetId)
const PRESET_COLORS = {
  running: '#e8f5e9', walking: '#f0fdf4', meditation: '#fce4ec',
  cycling: '#e3f2fd', reading: '#fff3e0', yoga: '#f3e8ff',
  swimming: '#e0f2fe', badminton: '#fef9c3', sleep: '#ede9fe',
  custom: '#f0fdf4'
};

HG.db = {
  db: null,
  uid: null,

  init() {
    this.db = window.FB?.db;
  },

  // ── HABITS ───────────────────────────────────────────────────
  async fetchHabits() {
    const uid = this.uid || HG.state?.uid;
    if (!this.db || !uid) return [];
    try {
      // Use single-field query to avoid composite index requirements
      const q = query(
        collection(this.db, 'habits'),
        where('ownerId', '==', uid)
      );
      const snap = await getDocs(q);
      const habits = [];
      snap.forEach(d => {
        const data = d.data();
        if (!data.deleted) habits.push({ id: d.id, ...data });
      });
      return habits;
    } catch (e) {
      console.error('fetchHabits error', e);
      return [];
    }
  },

  async addHabit(habitData) {
    if (!this.db || !this.uid) {
      console.error('addHabit: db or uid not set');
      return null;
    }

    const presetId = habitData.presetId || 'custom';
    const color = habitData.color || PRESET_COLORS[presetId] || '#e8f5e9';
    const icon = habitData.icon || '✏️';

    const finalData = clean({
      ownerId: this.uid,
      name: habitData.name || 'New Habit',
      icon,
      color,
      metric: habitData.metric || 'units',
      target: Number(habitData.target) || 1,
      time: habitData.time || '07:00–08:00',
      presetId,
      visibility: habitData.visibility || 'peers',
      streak: 0,
      createdAt: serverTimestamp(),
    });

    try {
      const docRef = await addDoc(collection(this.db, 'habits'), finalData);
      console.log('✅ Habit saved:', docRef.id);

      // Create a matching plant document
      await this.createPlant(docRef.id, presetId, finalData.name, icon);

      // Update user stats
      await this._incrementUserStat('plants', 1);

      return docRef.id;
    } catch (e) {
      console.error('addHabit error', e);
      return null;
    }
  },

  async deleteHabit(habitId) {
    if (!this.db || !this.uid) return;
    try {
      // Mark habit as deleted (soft delete)
      await updateDoc(doc(this.db, 'habits', habitId), { deleted: true });
    } catch (e) {
      console.error('deleteHabit error', e);
    }
  },

  // ── PLANTS ───────────────────────────────────────────────────
  async createPlant(habitId, typeId, name, icon) {
    const plantData = clean({
      ownerId: this.uid,
      habitId,
      type: typeId || 'custom',
      name: name || 'My Plant',
      emoji: icon || '🌱',
      stage: 'Seed',
      streak: 0,
      createdAt: serverTimestamp(),
    });
    try {
      await setDoc(doc(this.db, 'plants', habitId), plantData);
      console.log('✅ Plant created for habit:', habitId);
    } catch (e) {
      console.error('createPlant error', e);
    }
  },

  async fetchPlants() {
    if (!this.db || !this.uid) return {};
    try {
      const q = query(
        collection(this.db, 'plants'),
        where('ownerId', '==', this.uid)
      );
      const snap = await getDocs(q);
      const plants = {};
      snap.forEach(d => {
        const data = d.data();
        plants[d.id] = {
          emoji: data.emoji || '🌱',
          name: data.name || 'My Plant',
          stage: data.stage || 'Seed',
          streak: data.streak || 0,
        };
      });
      return plants;
    } catch (e) {
      console.error('fetchPlants error', e);
      return {};
    }
  },

  // ── COMPLETIONS ──────────────────────────────────────────────
  async completeHabit(habitId, metricVal, caption, loc) {
    if (!this.db || !this.uid) return;
    try {
      // Get habit visibility
      let visibility = 'peers';
      try {
        const habitDoc = await getDoc(doc(this.db, 'habits', habitId));
        if (habitDoc.exists()) visibility = habitDoc.data().visibility || 'peers';
      } catch (_) { }

      const moment = clean({
        userId: this.uid,
        habitId,
        metricVal: String(metricVal || ''),
        caption: caption || '',
        loc: loc || null,
        date: new Date().toISOString().split('T')[0],
        visibility,
        likes: 0,
        comments: 0,
        createdAt: serverTimestamp(),
      });

      await addDoc(collection(this.db, 'completions'), moment);

      // Update plant streak
      const plantRef = doc(this.db, 'plants', habitId);
      const plantDoc = await getDoc(plantRef);
      if (plantDoc.exists()) {
        const newStreak = (plantDoc.data().streak || 0) + 1;
        const newStage = this._streakToStage(newStreak);
        const newEmoji = this._stageToEmoji(newStage);
        await updateDoc(plantRef, { streak: newStreak, stage: newStage, emoji: newEmoji });
      }

      // Update user daily-done stats
      await this._incrementUserStat('daysDone', 1);

      console.log('✅ Habit completed:', habitId);
    } catch (e) {
      console.error('completeHabit error', e);
    }
  },

  // ── FEED ─────────────────────────────────────────────────────
  async fetchFeed() {
    if (!this.db) return [];
    try {
      const q = query(
        collection(this.db, 'completions'),
        limit(50)
      );
      const snap = await getDocs(q);
      const items = [];
      snap.forEach(d => items.push({ id: d.id, ...d.data() }));
      // Sort in memory to avoid index requirements for now
      return items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    } catch (e) {
      console.error('fetchFeed error', e);
      return [];
    }
  },

  // ── HELPERS ──────────────────────────────────────────────────
  async _incrementUserStat(field, amount) {
    if (!this.db || !this.uid) return;
    try {
      const userRef = doc(this.db, 'users', this.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const stats = snap.data().stats || {};
        stats[field] = (stats[field] || 0) + amount;
        await updateDoc(userRef, { stats });
      }
    } catch (_) { } // Non-critical
  },

  _streakToStage(streak) {
    if (streak >= 365) return 'Jungle Mode';
    if (streak >= 84) return 'Mature Tree';
    if (streak >= 56) return 'Flowering';
    if (streak >= 28) return 'Young Plant';
    if (streak >= 14) return 'Sapling';
    if (streak >= 7) return 'Bud';
    return 'Seed';
  },

  _stageToEmoji(stage) {
    const map = {
      'Seed': '🌰', 'Bud': '🌿', 'Sapling': '🌱',
      'Young Plant': '🪴', 'Flowering': '🌸',
      'Mature Tree': '🌳', 'Jungle Mode': '🌴',
    };
    return map[stage] || '🌱';
  },
};
