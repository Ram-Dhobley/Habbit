import { collection, query, where, getDocs, doc, getDoc, setDoc, addDoc, updateDoc, serverTimestamp, orderBy, arrayUnion, arrayRemove } 
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

window.HG = window.HG || {};

HG.db = {
  db: null,
  uid: null,
  
  init() {
    this.db = window.FB?.db;
    // this will be populated on auth change
  },

  async fetchHabits() {
    if (!this.db || !this.uid) return [];
    try {
      const q = query(collection(this.db, "habits"), where("ownerId", "==", this.uid));
      const snap = await getDocs(q);
      const habits = [];
      snap.forEach(d => {
        habits.push({ id: d.id, ...d.data() });
      });
      return habits;
    } catch(e) {
      console.error("fetchHabits error", e);
      return [];
    }
  },

  async addHabit(habitData) {
     if (!this.db || !this.uid) return null;
     
     // default habit setup
     const finalData = {
       ...habitData,
       ownerId: this.uid,
       createdAt: serverTimestamp(),
       streak: 0,
       plant: habitData.presetId || 'custom', // associate a plant
     };
     
     try {
       const docRef = await addDoc(collection(this.db, 'habits'), finalData);
       
       // Create corresponding plant if it doesn't exist
       await this.createPlant(docRef.id, finalData.plant, habitData.name);
       
       return docRef.id;
     } catch(e) {
       console.error("addHabit error", e);
       return null;
     }
  },
  
  async createPlant(habitId, typeId, name) {
     const plantData = {
         ownerId: this.uid,
         habitId: habitId,
         type: typeId,
         name: name,
         emoji: '🌱',
         stage: 'Sapling',
         streak: 0,
         createdAt: serverTimestamp()
     };
     try {
         await setDoc(doc(this.db, 'plants', habitId), plantData); // 1:1 map habit to plant
     } catch(e) {
         console.error("createPlant error", e);
     }
  },
  
  async fetchPlants() {
     if (!this.db || !this.uid) return {};
     try {
         const q = query(collection(this.db, 'plants'), where("ownerId", "==", this.uid));
         const snap = await getDocs(q);
         const plants = {};
         snap.forEach(d => {
             plants[d.id] = d.data();
         });
         return plants;
     } catch(e) {
        console.error("fetchPlants error", e);
        return {};
     }
  },

  async completeHabit(habitId, metrics, caption, loc) {
     if (!this.db || !this.uid) return;
     try {
         // Create the completion moment
         const moment = {
             userId: this.uid,
             habitId: habitId,
             metrics: metrics,
             caption: caption || '',
             loc: loc || null,
             date: new Date().toISOString().split('T')[0], // easy matching
             createdAt: serverTimestamp(),
             likes: 0,
             comments: 0
         };
         
         const habitDoc = await getDoc(doc(this.db, 'habits', habitId));
         if (habitDoc.exists()) {
             moment.visibility = habitDoc.data().visibility || 'peers';
         }
         
         await addDoc(collection(this.db, "completions"), moment);
         
         // Update plant streak
         const plantRef = doc(this.db, 'plants', habitId);
         const plantDoc = await getDoc(plantRef);
         if (plantDoc.exists()) {
             const newStreak = (plantDoc.data().streak || 0) + 1;
             await updateDoc(plantRef, { streak: newStreak });
         }
         
     } catch(e) {
         console.error("completeHabit error", e);
     }
  },
  
  async fetchFeed() {
      // Just returning mock for now until we fully integrate auth/peer system
      return [];
  }
};
