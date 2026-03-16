// ── HABIT GARDEN · MAIN APP CONTROLLER ──

HG.nav = {
  current: 'home',

  go(tab) {
    this.current = tab;
    document.querySelectorAll('.scr').forEach(s => s.classList.remove('on'));
    document.querySelectorAll('.ni').forEach(n => n.classList.remove('on'));

    const screenEl = document.getElementById(`scr-${tab}`);
    const navEl = document.getElementById(`ni-${tab}`);
    if (screenEl) screenEl.classList.add('on');
    if (navEl) navEl.classList.add('on');

    // Clear badges on visit
    if (tab === 'msgs') {
      const d = document.getElementById('msgs-nav-dot');
      if (d) d.style.display = 'none';
    }
  }
};

HG.util = {
  _toastTimer: null,

  toast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
  },

  shareGarden() {
    if (navigator.share) {
      navigator.share({ title: 'My Habit Garden', text: `Check out my habit garden! 🌿 84-day running streak`, url: window.location.href });
    } else {
      this.toast('Garden link copied! 🌿');
    }
  },

  sharePost(id) {
    if (navigator.share) {
      navigator.share({ title: 'Habit Garden moment', url: window.location.href });
    } else {
      this.toast('Post link copied!');
    }
  }
};

// ── RENDER & INIT ──
function init() {
  const container = document.getElementById('screen-container');

  // Inject screen HTML
  const screens = {
    home: HG.screens.home.render(),
    feed: HG.screens.feed.render(),
    notifs: HG.screens.notifs.render(),
    msgs: HG.screens.messages.render(),
    profile: HG.screens.profile.render()
  };

  let screensHTML = '';
  Object.entries(screens).forEach(([id, html]) => {
    screensHTML += `<div class="scr${id==='home'?' on':''}" id="scr-${id}">${html}</div>`;
  });

  container.innerHTML = screensHTML;

  // Inject overlays into app shell
  const app = document.getElementById('app');
  app.insertAdjacentHTML('beforeend', HG.screens.addHabit.html());
  app.insertAdjacentHTML('beforeend', HG.screens.complete.html());
  app.insertAdjacentHTML('beforeend', HG.screens.plantDetail.html());
  app.insertAdjacentHTML('beforeend', `<div class="toast" id="toast"></div>`);

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
}

window.addEventListener('load', init);
