// ── NOTIFICATIONS ──
HG.screens = HG.screens || {};

HG.screens.notifs = {
  render() {
    const { requests, activity } = HG.data.notifications;
    const visible = requests.filter(r => !HG.state.dismissed.includes(r.id));
    return `
    <div class="screen-hdr">
      <div class="screen-hl">Notifications</div>
      <div class="hdr-icon" onclick="HG.screens.notifs.markAllRead()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="21" height="21">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
    </div>
    <div class="notif-section-label">Requests</div>
    ${visible.length
        ? visible.map(r => this._req(r)).join('')
        : `<div style="padding:12px 18px;font-size:13px;color:var(--tx3)">No pending requests</div>`}
    <div class="notif-section-label" style="margin-top:4px">Activity</div>
    <div style="background:var(--surf);margin:0 18px;border-radius:14px;border:0.5px solid var(--bdr);overflow:hidden">
      ${activity.map((a, i) => `
      <div class="act-notif${a.unread ? ' unread' : ''}" style="${i === activity.length - 1 ? 'border:none' : ''}">
        <div class="an-av" style="background:${a.avatarBg}">
          ${a.initials}
          ${a.ico ? `<div class="an-ico" style="background:${a.icoBg}">${a.ico}</div>` : ''}
        </div>
        <div class="an-text">${a.text}</div>
        <div class="an-time">${a.time}</div>
        ${a.unread ? '<div class="an-dot"></div>' : ''}
      </div>`).join('')}
    </div>
    <div style="height:16px"></div>`;
  },

  _req(r) {
    return `
    <div class="req-card unread" id="${r.id}">
      <div class="req-av" style="background:${r.avatarBg}">${r.initials}</div>
      <div class="req-body">
        <div class="req-type-badge" style="background:${r.badgeBg};color:${r.badgeColor}">${r.badgeLabel}</div>
        <div class="req-name">${r.name}</div>
        <div class="req-meta">${r.meta}</div>
        <div class="req-actions">
          <button class="ra-btn accept" onclick="HG.screens.notifs.accept('${r.id}','${r.acceptMsg}')">${r.accept}</button>
          <button class="ra-btn"        onclick="HG.screens.notifs.dismiss('${r.id}')">${r.decline}</button>
        </div>
      </div>
    </div>`;
  },

  accept(id, msg) {
    this._hide(id);
    HG.util.toast(msg);
  },
  dismiss(id) {
    this._hide(id);
  },
  _hide(id) {
    HG.state.dismissed.push(id);
    HG.state.save();
    const el = document.getElementById(id);
    if (el) { el.style.opacity = '.35'; el.style.pointerEvents = 'none'; }
  },
  markAllRead() {
    document.querySelectorAll('.act-notif.unread').forEach(n => n.classList.remove('unread'));
    document.querySelectorAll('.an-dot').forEach(d => d.remove());
    HG.util.toast('All caught up ✓');
  }
};

// ── MESSAGES ──────────────────────────────────────────────────
HG.screens.messages = {
  render() {
    const { messages } = HG.data;
    return `
    <div class="screen-hdr">
      <div class="screen-hl">Messages</div>
      <div class="hdr-icon" onclick="HG.util.toast('New message coming soon')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="21" height="21">
          <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
      </div>
    </div>
    <div class="msearch">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
      </svg>
      Search
    </div>
    <div class="msg-section-label">Chats</div>
    <div class="conv-list">
      ${messages.map(m => `
      <div class="conv" onclick="HG.util.toast('Chat with ${m.name} — coming soon')">
        <div class="conv-av" style="background:${m.avatarBg}">
          ${m.initials}
          ${m.online ? '<div class="conv-on"></div>' : ''}
          ${m.type === 'trybe' ? `<div class="conv-gbadge">${m.members}</div>` : ''}
        </div>
        <div style="flex:1;min-width:0">
          <div class="conv-name">${m.name}
            <span class="ctag" style="${m.type === 'trybe'
        ? 'color:var(--amber);background:var(--amber-l)'
        : 'color:var(--tx3);background:var(--surf2)'}">
              ${m.type === 'trybe' ? 'Trybe' : 'Peer'}
            </span>
          </div>
          <div class="conv-prev">${m.preview}</div>
        </div>
        <div class="conv-mc">
          <div class="conv-t">${m.time}</div>
          ${m.unread > 0 ? `<div class="conv-unread">${m.unread}</div>` : ''}
        </div>
      </div>`).join('')}
    </div>
    <div class="msg-section-label" style="margin-top:9px">Message requests</div>
    <div class="msg-req-banner" onclick="HG.util.toast('2 message requests from non-peers')">
      <div class="req-av-stack">
        <span style="background:#9c27b0">AK</span>
        <span style="background:#1565c0">KD</span>
      </div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:500">2 message requests</div>
        <div style="font-size:11.5px;color:var(--tx3);margin-top:1px">Not your peers yet</div>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--tx3)">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </div>
    <div style="height:16px"></div>`;
  }
};

// ── PROFILE ───────────────────────────────────────────────────
HG.screens.profile = {
  render() {
    const { user, plants, pinnedMoments } = HG.data;
    const initials = user.name.split(' ').map(w => w[0]).join('').toUpperCase();
    return `
    <div class="prof-cover">
      <div class="prof-cover-edit" onclick="HG.util.toast('Change cover photo')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
          <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
      </div>
    </div>
    <div class="prof-top-row">
      <div class="prof-av-wrap">
        <div class="prof-av" onclick="HG.util.toast('Change photo')">${initials}</div>
        <div class="prof-av-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </div>
      </div>
      <div class="prof-btns">
        <div class="pa-ico pri" onclick="HG.util.toast('Edit profile')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        </div>
        <div class="pa-ico" onclick="HG.util.shareGarden()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="15" height="15">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51"  x2="8.59"  y2="10.49"/>
          </svg>
        </div>
      </div>
    </div>
    <div class="prof-info">
      <div class="prof-name">${user.name}</div>
      <div class="prof-handle">
        <span>${user.handle}</span>
        <span style="width:3px;height:3px;border-radius:50%;background:var(--tx3);display:inline-block"></span>
        <span>${user.bio}</span>
      </div>
      <div class="prof-loc">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        ${user.city}${user.country ? ' · ' + user.country : ''}
      </div>
      <div class="prof-quote">${user.quote}</div>
    </div>
    <div class="prof-social">
      <div class="ps-item" onclick="HG.util.toast('Peers list')"><div class="ps-v">${user.peers}</div><div class="ps-l">Peers</div></div>
      <div class="ps-item" onclick="HG.util.toast('Following')"><div class="ps-v">${user.following}</div><div class="ps-l">Following</div></div>
      <div class="ps-item" onclick="HG.util.toast('Followers')"><div class="ps-v">${user.followers}</div><div class="ps-l">Followers</div></div>
      <div class="ps-item" onclick="HG.util.toast('Your Trybes')"><div class="ps-v">${user.trybes}</div><div class="ps-l">Trybes</div></div>
    </div>
    <div class="sec-l" style="margin-top:14px">Stats</div>
    <div class="stats-grid">
      <div class="sc"><div class="sc-v">${user.stats.daysDone}</div><div class="sc-l">Days done</div></div>
      <div class="sc"><div class="sc-v">${user.stats.bestStreak}</div><div class="sc-l">Best streak</div></div>
      <div class="sc"><div class="sc-v">${user.stats.consistency}%</div><div class="sc-l">Consistency</div></div>
      <div class="sc"><div class="sc-v">${user.stats.plants}</div><div class="sc-l">Plants</div></div>
      <div class="sc"><div class="sc-v">${user.stats.avgStreak}d</div><div class="sc-l">Avg streak</div></div>
      <div class="sc"><div class="sc-v">${user.stats.weeksActive}</div><div class="sc-l">Wks active</div></div>
    </div>
    <div class="sec-l">My garden</div>
    <div class="plant-scroll">
      ${Object.entries(plants).map(([id, p]) => `
      <div class="mgi" onclick="HG.screens.plantDetail.open('${id}')">
        <div style="font-size:27px">${p.emoji}</div>
        <p>${p.name.split(' ')[0]}</p>
        <p style="font-size:9px;color:var(--g600);margin-top:1px">🔥 ${p.streak}d</p>
      </div>`).join('')}
      <div class="mgi" style="opacity:.45" onclick="HG.util.toast('Upgrade to Premium for more plants')">
        <div style="font-size:27px">🔒</div><p>+ Add</p>
      </div>
    </div>
    <div class="sec-l"><span>Pinned moments</span><span class="sec-l-more" onclick="HG.util.toast('All pinned moments')">See all</span></div>
    <div class="pinned-grid">
      ${pinnedMoments.map(m => `
      <div class="pg-item" style="background:${m.bg}" onclick="HG.util.toast('${m.label}')">
        <span>${m.ico}</span>
        <div class="pg-label">${m.label}</div>
        <div class="pg-share" onclick="event.stopPropagation();HG.util.shareGarden()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="10" height="10">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51"  x2="8.59"  y2="10.49"/>
          </svg>
        </div>
      </div>`).join('')}
      <div class="pg-item" style="background:var(--surf2);border:0.5px dashed var(--bdr)" onclick="HG.util.toast('Pin a moment from feed')">
        <span style="font-size:20px;opacity:.35">+</span>
        <div class="pg-label" style="background:none;color:var(--tx3)">Pin</div>
      </div>
    </div>
    <div class="sec-l" style="margin-top:14px">Achievements</div>
    <div class="achievements-grid">
      <div class="ach-card" style="${user.stats.plants >= 1 ? '' : 'filter:grayscale(1);opacity:0.5'}">
        <div class="ach-ico">🌱</div>
        <div class="ach-info">
          <div class="ach-name">First Sprout</div>
          <div class="ach-desc">Plant 1 habit</div>
        </div>
      </div>
      <div class="ach-card" style="${user.stats.bestStreak >= 7 ? '' : 'filter:grayscale(1);opacity:0.5'}">
        <div class="ach-ico">🔥</div>
        <div class="ach-info">
          <div class="ach-name">On Fire</div>
          <div class="ach-desc">7 day streak</div>
        </div>
      </div>
      <div class="ach-card" style="${user.stats.daysDone >= 30 ? '' : 'filter:grayscale(1);opacity:0.5'}">
        <div class="ach-ico">🌟</div>
        <div class="ach-info">
          <div class="ach-name">Consistency</div>
          <div class="ach-desc">30 days logged</div>
        </div>
      </div>
      <div class="ach-card" style="${user.stats.plants >= 5 ? '' : 'filter:grayscale(1);opacity:0.5'}">
        <div class="ach-ico">🌳</div>
        <div class="ach-info">
          <div class="ach-name">Gardener</div>
          <div class="ach-desc">Grow 5 plants</div>
        </div>
      </div>
    </div>
    <div style="margin:0 18px 24px;background:linear-gradient(135deg,#4527a0,#7c3aed);border-radius:14px;padding:14px;display:flex;align-items:center;gap:12px">
      <div style="font-size:24px">✨</div>
      <div>
        <div style="font-size:13.5px;font-weight:600;color:#fff">Upgrade to Premium</div>
        <div style="font-size:11.5px;color:rgba(255,255,255,.75);margin-top:2px">Unlimited plants · Pro Tracks</div>
      </div>
      <button onclick="HG.util.toast('₹299/mo · Opening plans…')"
        style="margin-left:auto;background:rgba(255,255,255,.2);color:#fff;border:none;
               border-radius:8px;padding:7px 12px;font-size:12px;font-weight:500;
               cursor:pointer;font-family:var(--fn)">Upgrade</button>
    </div>
    <div class="logout-btn-wrap">
      <button class="logout-btn" onclick="HG.screens.profile.signOut()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Sign Out
      </button>
    </div>`;
  },

  async signOut() {
    HG.util.toast('Signing out…');
    try {
      if (window.FB && window.FB.signOutUser) await window.FB.signOutUser();
    } catch (e) { console.error(e); }
    // Reset state and show auth screen
    localStorage.clear();
    location.reload();
  }
};
