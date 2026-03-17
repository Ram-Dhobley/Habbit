// ── HABIT GARDEN · DATA STORE ──
window.HG = window.HG || {};

HG.data = {
  user: {
    name: 'Habit Grower', handle: '@user',
    city: 'Pune', country: 'India',
    bio: 'Building good habits 🌱',
    quote: '"Discipline is choosing between what you want now and what you want most."',
    peers: 47, following: 142, followers: 89, trybes: 4,
    stats: { daysDone: 247, bestStreak: 84, consistency: 78, plants: 3, avgStreak: 31, weeksActive: 42 }
  },

  habits: [
    { id: 'run', name: 'Morning Run', icon: '🏃', color: '#e8f5e9', metric: 'km', target: 5, time: '7–8am', plant: 'run', streak: 84, doneVal: '5.2 km', type: 'preset', vis: 'public' },
    { id: 'med', name: 'Meditation', icon: '🧘', color: '#fce4ec', metric: 'min', target: 20, time: '6–7am', plant: 'med', streak: 31, couple: 'Priya', type: 'preset', vis: 'peers' },
    { id: 'read', name: 'Reading', icon: '📚', color: '#fff3e0', metric: 'min', target: 30, time: '9–10pm', plant: 'read', streak: 12, type: 'preset', vis: 'peers' }
  ],

  plants: {
    run: { emoji: '🌳', name: 'Morning Run', stage: 'Mature Tree', streak: 84 },
    med: { emoji: '🌸', name: 'Meditation', stage: 'Flowering', streak: 31 },
    read: { emoji: '🌱', name: 'Reading', stage: 'Sapling', streak: 12 }
  },

  feedPeers: [
    { id: 'f1', user: 'Priya Sharma', initials: 'PS', avatarBg: '#5c6bc0', time: 'Just now', loc: 'Koregaon Park', habit: '🧘 Meditation', mediaBg: 'linear-gradient(135deg,#e8eaf6,#c5cae9)', mediaIco: '🧘', stat: '25 min · 🔥 32 day streak', caption: 'Another peaceful morning 🌅', likes: 12, comments: 3, plant: '🌸 Flowering', expiry: '23h left', pinned: false },
    { id: 'f2', user: 'Rohit M.', initials: 'RM', avatarBg: '#2e7d32', time: '2h ago', loc: 'Baner', habit: '🏃 Running', mediaBg: 'linear-gradient(135deg,#e8f5e9,#c8e6c9)', mediaIco: '🏃', stat: '6.2 km · 🔥 45 days', caption: 'Personal best this week! 💪', likes: 8, comments: 1, plant: '🌳 Mature Tree', expiry: '21h left', pinned: true },
    { id: 'f3', user: 'Ananya K.', initials: 'AK', avatarBg: '#ad1457', time: '5h ago', loc: null, habit: '📚 Reading', mediaBg: 'linear-gradient(135deg,#fff3e0,#ffe0b2)', mediaIco: '📖', stat: '35 min · 🔥 18 days', caption: 'Habit stacking is 🔑', likes: 5, comments: 0, plant: '🌿 Young plant', expiry: '18h left', pinned: false }
  ],

  notifications: {
    requests: [
      { id: 'req-sneha', badgeBg: '#fce4ec', badgeColor: '#880e4f', badgeLabel: '👥 Peer request', avatarBg: '#e91e63', initials: 'SP', name: 'Sneha Patil wants to be your peer', meta: 'Runner · Koregaon Park · 🔥 142d', accept: 'Accept', decline: 'Decline', acceptMsg: 'Sneha accepted as peer! 🌿' },
      { id: 'req-yoga', badgeBg: '#fef3c7', badgeColor: '#92400e', badgeLabel: '🌿 Trybe invite', avatarBg: '#ff8f00', initials: '🧘', name: 'Vikram invited you to Yoga at Sunrise', meta: '5 members · Yoga · 6–7am · Baner', accept: 'Join Trybe', decline: 'Ignore', acceptMsg: 'Joined! Trybe chat created ✅' },
      { id: 'req-karan', badgeBg: '#eff6ff', badgeColor: '#1e3a5f', badgeLabel: '👁 Follow request', avatarBg: '#1565c0', initials: 'KD', name: 'Karan Desai wants to follow you', meta: 'Runner · Baner', accept: 'Allow', decline: 'Deny', acceptMsg: 'Karan can now follow you' }
    ],
    activity: [
      { avatarBg: '#5c6bc0', initials: 'PS', ico: '❤️', icoBg: '#e11d48', text: '<b>Priya</b> liked your 6.2km run', time: '2m', unread: true },
      { avatarBg: '#2e7d32', initials: 'RM', ico: '💬', icoBg: '#4caf50', text: '<b>Rohit</b> commented · "Crushing it!"', time: '18m', unread: true },
      { avatarBg: '#f57c00', initials: '🚴', ico: null, icoBg: null, text: '<b>Morning Cyclists</b> — 5/8 done today', time: '1h', unread: true },
      { avatarBg: '#9c27b0', initials: 'AK', ico: '❤️', icoBg: '#e11d48', text: '<b>Ananya</b> liked your meditation moment', time: '3h', unread: false },
      { avatarBg: '#388e3c', initials: '🌿', ico: null, icoBg: null, text: '<b>Reading</b> plant grew to Sapling 🌱', time: 'Yesterday', unread: false },
      { avatarBg: '#f59e0b', initials: '🏆', ico: null, icoBg: null, text: 'You moved to <b>rank #47</b> in Running', time: 'Yesterday', unread: false }
    ]
  },

  messages: [
    { id: 'm1', name: 'Priya Sharma', initials: 'PS', avatarBg: '#5c6bc0', type: 'peer', preview: 'Same streak day! See my post?', time: 'Now', unread: 2, online: true },
    { id: 'm2', name: 'Morning Cyclists', initials: '🚴', avatarBg: '#f57c00', type: 'trybe', preview: 'Vikram: Great ride today!', time: '1h', unread: 5, members: 8 },
    { id: 'm3', name: 'Rohit M.', initials: 'RM', avatarBg: '#2e7d32', type: 'peer', preview: 'Up for Sinhagad run Sunday?', time: '2h', unread: 0 },
    { id: 'm4', name: 'Pune Readers Club', initials: '📚', avatarBg: '#6d4c41', type: 'trybe', preview: 'Meera: Who finished Atomic Habits?', time: 'Tue', unread: 0, members: 12 }
  ],

  leaderboards: {
    running: [['🥇', 'Sneha P.', '142 days'], ['🥈', 'Vikram S.', '118 days'], ['🥉', 'Rohit M.', '98 days']],
    meditation: [['🥇', 'Priya S.', '54 days'], ['🥈', 'Arjun M.', '31 days'], ['🥉', 'Meera J.', '28 days']],
    reading: [['🥇', 'Ananya K.', '42 days'], ['🥈', 'Aakash R.', '38 days'], ['🥉', 'Neha P.', '22 days']],
    cycling: [['🥇', 'Rohan K.', '67 days'], ['🥈', 'Suresh P.', '48 days'], ['🥉', 'Amit T.', '39 days']],
    walking: [['🥇', 'Lata M.', '91 days'], ['🥈', 'Dinesh V.', '77 days'], ['🥉', 'Uma S.', '65 days']],
    city: [['🥇', 'Sneha P.', '142 days'], ['🥈', 'Lata M.', '91 days'], ['🥉', 'Rohit M.', '98 days']],
    india: [['🥇', 'Raj T.', '201 days'], ['🥈', 'Sneha P.', '142 days'], ['🥉', 'Vikram S.', '118 days']],
    global: [['🥇', 'Maria C.', '312 days'], ['🥈', 'Jin L.', '287 days'], ['🥉', 'Raj T.', '201 days']]
  },

  presets: [
    { id: 'running', name: 'Running', icon: '🏃', color: '#e8f5e9', metrics: ['km', 'min', 'steps'], default: 'km' },
    { id: 'walking', name: 'Walking', icon: '🚶', color: '#f0fdf4', metrics: ['steps', 'km', 'min'], default: 'steps' },
    { id: 'meditation', name: 'Meditation', icon: '🧘', color: '#fce4ec', metrics: ['min'], default: 'min' },
    { id: 'cycling', name: 'Cycling', icon: '🚴', color: '#e3f2fd', metrics: ['km', 'min'], default: 'km' },
    { id: 'reading', name: 'Reading', icon: '📚', color: '#fff3e0', metrics: ['min', 'pages'], default: 'min' },
    { id: 'yoga', name: 'Yoga', icon: '🤸', color: '#f3e8ff', metrics: ['min'], default: 'min' },
    { id: 'swimming', name: 'Swimming', icon: '🏊', color: '#e0f2fe', metrics: ['min', 'laps', 'km'], default: 'min' },
    { id: 'badminton', name: 'Badminton', icon: '🏸', color: '#fef9c3', metrics: ['min', 'sets'], default: 'min' },
    { id: 'sleep', name: 'Sleep', icon: '😴', color: '#ede9fe', metrics: ['hr', 'min'], default: 'hr' }
  ],

  pinnedMoments: [
    { bg: 'linear-gradient(135deg,#e8f5e9,#c8e6c9)', ico: '🏃', label: '6.2km run' },
    { bg: 'linear-gradient(135deg,#e8eaf6,#c5cae9)', ico: '🧘', label: '25 min meditate' },
    { bg: 'linear-gradient(135deg,#fff3e0,#ffe0b2)', ico: '📚', label: '35 min reading' },
    { bg: 'linear-gradient(135deg,#e8f5e9,#a5d6a7)', ico: '🏔️', label: 'Trail 8km' },
    { bg: 'linear-gradient(135deg,#fce4ec,#f48fb1)', ico: '📖', label: 'Morning pages' }
  ]
};

// ── STATE (persisted in localStorage, daily-scoped) ───────────
HG.state = (() => {
  const today   = new Date().toISOString().split('T')[0];
  const raw     = localStorage.getItem('hg_state');
  const stored  = raw ? JSON.parse(raw) : {};
  // Reset to empty if it's a new day
  const data    = stored.date === today
    ? stored
    : { date: today, done: [], progress: {}, dismissed: [], liked: [] };

  return {
    completedToday: data.done,
    progress:       data.progress,   // { [habitId]: { logged: number, done: bool } }
    dismissed:      data.dismissed,
    liked:          data.liked,

    save() {
      localStorage.setItem('hg_state', JSON.stringify({
        date:      today,
        done:      this.completedToday,
        progress:  this.progress,
        dismissed: this.dismissed,
        liked:     this.liked,
      }));
    }
  };
})();
