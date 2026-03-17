// ── HABIT GARDEN · APP CONTROLLER ──

window.HG = window.HG || {};
HG.screens = HG.screens || {};

// ── NAVIGATION ───────────────────────────────────────────────
HG.nav = {
  current: 'home',
  go(tab) {
    this.current = tab;
    document.querySelectorAll('.scr').forEach(s => s.classList.remove('on'));
    document.querySelectorAll('.ni').forEach(n => n.classList.remove('on'));
    const s = document.getElementById('scr-' + tab);
    const n = document.getElementById('ni-' + tab);
    if (s) s.classList.add('on');
    if (n) n.classList.add('on');
    // re-render screens that need fresh data
    if (tab === 'home' && s) s.innerHTML = HG.screens.home.render();
    if (tab === 'profile' && s) s.innerHTML = HG.screens.profile.render();
  }
};

// ── UTILITIES ────────────────────────────────────────────────
HG.util = {
  _t: null,
  toast(msg) {
    let t = document.getElementById('hg-toast');
    if (!t) { t = document.createElement('div'); t.id = 'hg-toast'; t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(this._t);
    this._t = setTimeout(() => t.classList.remove('show'), 2600);
  },
  shareGarden() {
    if (navigator.share) {
      navigator.share({ title: 'My Habit Garden 🌿', url: location.href });
    } else {
      this.toast('Link copied! Share your garden 🌿');
    }
  }
};

// ── BOOT ─────────────────────────────────────────────────────
function init() {
  const container = document.getElementById('screen-container');
  if (!container) { console.error('screen-container not found'); return; }

  // Build screen HTML
  container.innerHTML = `
    <div class="scr on"  id="scr-home">${HG.screens.home.render()}</div>
    <div class="scr"     id="scr-feed">${HG.screens.feed.render()}</div>
    <div class="scr"     id="scr-notifs">${HG.screens.notifs.render()}</div>
    <div class="scr"     id="scr-msgs">${HG.screens.messages.render()}</div>
    <div class="scr"     id="scr-profile">${HG.screens.profile.render()}</div>
  `;

  // Inject overlays
  const app = document.getElementById('main-app');
  if (app) {
    // Remove any old overlays first
    ['ov-add','ov-complete','ov-plant'].forEach(id => {
      const old = document.getElementById(id);
      if (old) old.remove();
    });
    app.insertAdjacentHTML('beforeend', HG.screens.addHabit.html());
    app.insertAdjacentHTML('beforeend', HG.screens.complete.html());
    app.insertAdjacentHTML('beforeend', HG.screens.plantDetail.html());
  }

  // Toast element
  if (!document.getElementById('hg-toast')) {
    const t = document.createElement('div');
    t.id = 'hg-toast'; t.className = 'toast';
    document.body.appendChild(t);
  }
}
