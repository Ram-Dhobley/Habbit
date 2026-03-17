// ── FEED SCREEN ──
HG.screens = HG.screens || {};
HG.screens.feed = {
  activeLb: 'running',

  render() {
    return `
    <div class="screen-hdr">
      <div class="screen-hl">Feed</div>
    </div>
    <div class="tabs-row">
      <div class="tab on"  id="ftab-0" onclick="HG.screens.feed.switchTab(0)">Peers</div>
      <div class="tab"     id="ftab-1" onclick="HG.screens.feed.switchTab(1)">Discover</div>
    </div>
    ${this._lbBar()}
    <div id="feed-posts">${this._posts()}</div>
    <div style="height:12px"></div>`;
  },

  _lbBar() {
    const chips = [
      ['running','🏃 Running'],['meditation','🧘 Meditation'],['reading','📚 Reading'],
      ['cycling','🚴 Cycling'],['walking','🚶 Walking'],
      ['city','📍 City'],['india','🇮🇳 India'],['global','🌍 Global']
    ];
    const data = HG.data.leaderboards[this.activeLb] || HG.data.leaderboards.running;
    return `
    <div class="lb-bar">
      <div class="lb-bh">
        <span class="lb-bt" id="lb-title">🏆 Leaderboard · preset habits only</span>
        <span class="lb-sa" onclick="HG.util.toast('Full leaderboard coming soon')">See all</span>
      </div>
      <div class="lb-chips">
        ${chips.map(([k,l]) => `<div class="lbc${k===this.activeLb?' on':''}" onclick="HG.screens.feed.setLb('${k}')">${l}</div>`).join('')}
      </div>
      <div class="lb-pod" id="lb-pod">
        ${data.map(r=>`<div class="lb-p"><span style="font-size:15px">${r[0]}</span><div><div class="lb-pn">${r[1]}</div><div class="lb-pv">${r[2]}</div></div></div>`).join('')}
      </div>
    </div>`;
  },

  _posts() {
    return HG.data.feedPeers.map(p => {
      const liked = HG.state.liked.includes(p.id);
      return `
      <div class="fi">
        ${p.pinned
          ? `<div class="fi-pinned-badge">📌 Pinned</div>`
          : `<div class="fi-expiry">${p.expiry}</div>`}
        <div class="fi-head">
          <div class="fi-av" style="background:${p.avatarBg}">${p.initials}</div>
          <div>
            <div class="fi-name">${p.user}</div>
            <div class="fi-meta">${p.time}${p.loc ? ' · 📍 '+p.loc : ''}</div>
          </div>
          <div class="fi-chip">${p.habit}</div>
        </div>
        <div class="fi-media" style="background:${p.mediaBg}">
          <span>${p.mediaIco}</span>
          <div class="fi-mb"><div class="fi-ms">${p.stat}</div></div>
        </div>
        <div class="fi-cap">${p.caption}</div>
        <div class="fi-acts">
          <button class="fi-btn${liked?' lk':''}" id="like-${p.id}" onclick="HG.screens.feed.toggleLike('${p.id}')">
            ${liked?'❤️':'🤍'} ${liked ? p.likes+1 : p.likes}
          </button>
          <button class="fi-btn" onclick="HG.util.toast('Comments coming soon')">💬 ${p.comments}</button>
          <div class="fi-plant">${p.plant}</div>
          <div class="fi-icon-btn" style="margin-left:auto" onclick="HG.util.shareGarden()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="16" height="16">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51"  x2="8.59"  y2="10.49"/>
            </svg>
          </div>
          <div class="fi-icon-btn" onclick="HG.util.toast('Pinned to your profile!')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="16" height="16">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        </div>
      </div>`;
    }).join('');
  },

  switchTab(i) {
    [0,1].forEach(j => {
      const t = document.getElementById(`ftab-${j}`);
      if (t) t.classList.toggle('on', j===i);
    });
    const title = document.getElementById('lb-title');
    if (title) title.textContent = i===1
      ? '🏆 Discover · Public preset habits only'
      : '🏆 Leaderboard · preset habits only';
    if (i===1) HG.util.toast('Showing public preset habits');
  },

  setLb(type) {
    this.activeLb = type;
    document.querySelectorAll('.lb-chips .lbc').forEach(c => {
      c.classList.toggle('on', c.getAttribute('onclick').includes(`'${type}'`));
    });
    const data = HG.data.leaderboards[type] || HG.data.leaderboards.running;
    const pod = document.getElementById('lb-pod');
    if (pod) pod.innerHTML = data.map(r =>
      `<div class="lb-p"><span style="font-size:15px">${r[0]}</span><div><div class="lb-pn">${r[1]}</div><div class="lb-pv">${r[2]}</div></div></div>`
    ).join('');
  },

  toggleLike(id) {
    const post = HG.data.feedPeers.find(p => p.id === id);
    const btn  = document.getElementById(`like-${id}`);
    if (!post || !btn) return;
    const idx = HG.state.liked.indexOf(id);
    if (idx > -1) {
      HG.state.liked.splice(idx, 1);
      btn.classList.remove('lk');
      btn.innerHTML = `🤍 ${post.likes}`;
    } else {
      HG.state.liked.push(id);
      btn.classList.add('lk');
      btn.innerHTML = `❤️ ${post.likes + 1}`;
    }
    HG.state.save();
  }
};
