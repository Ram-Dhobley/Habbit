// ── HABIT GARDEN · APP CONTROLLER ──

window.HG = window.HG || {};
HG.screens = HG.screens || {};

// Global Error Handler to prevent white screen crashes
window.onerror = function (msg, url, line, col, error) {
  console.error("Global error caught:", msg, "at", url, ":", line);
  HG.util.toast('Something went wrong. Recovering...');
  // Ensure main app is visible if it crashed during transition
  const app = document.getElementById('main-app');
  if (app && app.style.display !== 'none') {
    const screens = document.querySelectorAll('.scr');
    screens.forEach(s => { if (s.classList.contains('on')) s.style.opacity = 1; });
  }
  return false;
};

window.onunhandledrejection = function (event) {
  console.error("Unhandled promise rejection:", event.reason);
};

// ── NAVIGATION ───────────────────────────────────────────────
HG.nav = {
  current: 'home',
  go(tab) {
    const isSameTab = this.current === tab;
    this.current = tab;

    // Update nav icons
    document.querySelectorAll('.ni').forEach(n => n.classList.remove('on'));
    const n = document.getElementById('ni-' + tab);
    if (n) n.classList.add('on');

    const prevScreen = document.querySelector('.scr.on');
    const nextScreen = document.getElementById('scr-' + tab);

    // Always re-render screens (data may have changed)
    if (nextScreen) {
      try {
        if (tab === 'home') nextScreen.innerHTML = HG.screens.home.render();
        else if (tab === 'pomo') nextScreen.innerHTML = HG.screens.pomodoro.render();
        else if (tab === 'notifs') nextScreen.innerHTML = HG.screens.notifs.render();
        else if (tab === 'msgs') nextScreen.innerHTML = HG.screens.messages.render();
        else if (tab === 'profile') nextScreen.innerHTML = HG.screens.profile.render();
      } catch (e) {
        console.error(`Render error for ${tab}:`, e);
        nextScreen.innerHTML = `<div style="padding:40px;text-align:center;color:var(--tx3)">
          <div style="font-size:32px;margin-bottom:12px">⚠️</div>
          <div>Unable to load screen</div>
          <button onclick="location.reload()" class="ghost-btn" style="margin-top:12px">Reload app</button>
        </div>`;
      }
    }

    // If same tab, just re-render (no transition needed)
    if (isSameTab) {
      if (nextScreen && window.gsap) {
        gsap.from('.hpill', { opacity: 0, y: 16, stagger: 0.04, duration: 0.35, ease: 'back.out(1.2)' });
      }
      return;
    }

    if (prevScreen && nextScreen && window.gsap) {
      gsap.to(prevScreen, {
        opacity: 0, y: -10, duration: 0.2, onComplete: () => {
          prevScreen.classList.remove('on');
          prevScreen.style.opacity = '';
          prevScreen.style.transform = '';
          nextScreen.classList.add('on');
          gsap.fromTo(nextScreen, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
          if (tab === 'home') gsap.from('.hpill', { opacity: 0, y: 20, stagger: 0.05, duration: 0.4, ease: 'back.out(1.2)' });
        }
      });
      // Safety: if GSAP hangs, ensure next screen is shown after 500ms
      setTimeout(() => { if (!nextScreen.classList.contains('on')) nextScreen.classList.add('on'); nextScreen.style.opacity = 1; }, 500);
    } else {
      if (prevScreen) prevScreen.classList.remove('on');
      if (nextScreen) nextScreen.classList.add('on');
    }
  },

  // Force re-render of the current screen (use after data mutations)
  refresh() {
    const tab = this.current;
    const screen = document.getElementById('scr-' + tab);
    if (!screen) return;
    try {
      if (tab === 'home') screen.innerHTML = HG.screens.home.render();
      if (tab === 'pomo') screen.innerHTML = HG.screens.pomodoro.render();
      if (tab === 'profile') screen.innerHTML = HG.screens.profile.render();
      // Use simpler fade-in for refresh to avoid stagger glitches
      if (window.gsap) gsap.fromTo(screen, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    } catch (e) { console.error('Refresh error:', e); }
    screen.style.opacity = 1; // Ensure visible
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

  // Ensure required data structures exist before rendering
  HG.data = HG.data || {};
  HG.data.habits = HG.data.habits || [];
  HG.data.notifications = HG.data.notifications || { requests: [], activity: [] };
  HG.data.messages = HG.data.messages || [];

  const safeRender = (mod) => {
    try { return HG.screens[mod]?.render() || ''; }
    catch (e) { console.error(`Boot render fail: ${mod}`, e); return ''; }
  };

  container.innerHTML = `
    <div class="scr on"  id="scr-home">${safeRender('home')}</div>
    <div class="scr"     id="scr-pomo">${safeRender('pomodoro')}</div>
    <div class="scr"     id="scr-notifs">${safeRender('notifs')}</div>
    <div class="scr"     id="scr-msgs">${safeRender('messages')}</div>
    <div class="scr"     id="scr-profile">${safeRender('profile')}</div>
  `;

  // Inject overlays
  const app = document.getElementById('main-app');
  if (app) {
    // Remove any old overlays first
    ['ov-add', 'ov-complete', 'ov-plant', 'ov-onboarding'].forEach(id => {
      const old = document.getElementById(id);
      if (old) old.remove();
    });
    app.insertAdjacentHTML('beforeend', HG.screens.addHabit.html());
    app.insertAdjacentHTML('beforeend', HG.screens.complete.html());
    app.insertAdjacentHTML('beforeend', HG.screens.plantDetail.html());
    app.insertAdjacentHTML('beforeend', HG.screens.onboarding.html());
  }

  // Toast element
  if (!document.getElementById('hg-toast')) {
    const t = document.createElement('div');
    t.id = 'hg-toast'; t.className = 'toast';
    document.body.appendChild(t);
  }
}
