// ── HOME SCREEN ──
HG.screens = HG.screens || {};

HG.screens.home = {
  render() {
    const done  = HG.state.completedToday;
    const total = HG.data.habits.length;
    const count = done.length;
    const pct   = Math.round(count / total * 100);
    const name  = (HG.data.user.name || 'there').split(' ')[0];

    return `
    <div class="home-header">
      <div>
        <div class="home-hl">Habit Garden</div>
        <div class="home-sub">Good morning, ${name} · ${count} of ${total} done</div>
      </div>
      <div class="hdr-icon" onclick="HG.nav.go('notifs')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="22" height="22">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        <div class="bell-dot"></div>
      </div>
    </div>

    <div class="garden-wrap">
      <div class="share-garden-btn" onclick="HG.util.shareGarden()">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
          <line x1="15.41" y1="6.51"  x2="8.59"  y2="10.49"/>
        </svg>
        Share
      </div>
      <div class="gc">
        <div class="sky"></div>
        <div class="gsun"></div>
        <svg style="position:absolute;top:16px;left:24px;opacity:.6" width="50" height="22" viewBox="0 0 52 24">
          <ellipse cx="26" cy="18" rx="24" ry="6" fill="white" opacity=".9"/>
          <ellipse cx="18" cy="15" rx="12" ry="8" fill="white" opacity=".9"/>
          <ellipse cx="32" cy="14" rx="10" ry="7" fill="white" opacity=".9"/>
        </svg>
        <div class="ggrass"></div>
        <div class="gground"></div>

        <div class="pslot" style="left:9%" onclick="HG.screens.plantDetail.open('run')">
          <svg width="56" height="92" viewBox="0 0 56 92">
            <rect x="26" y="68" width="4" height="24" fill="#5d4037"/>
            <ellipse cx="28" cy="42" rx="18" ry="27" fill="#388e3c"/>
            <ellipse cx="17" cy="56" rx="11" ry="14" fill="#2e7d32"/>
            <ellipse cx="39" cy="56" rx="11" ry="14" fill="#2e7d32"/>
            <ellipse cx="28" cy="29" rx="12" ry="18" fill="#43a047"/>
            <circle cx="22" cy="36" r="3" fill="#ef5350" opacity=".85"/>
            <circle cx="34" cy="41" r="3" fill="#ef5350" opacity=".85"/>
            <circle cx="27" cy="49" r="2.5" fill="#ef5350" opacity=".85"/>
          </svg>
          <div class="plbl">Run</div>
          <div class="pstreak">🔥 84d</div>
        </div>

        <div class="pslot" style="left:37%" onclick="HG.screens.plantDetail.open('med')">
          <svg width="42" height="70" viewBox="0 0 42 70">
            <rect x="19" y="52" width="3" height="18" fill="#5d4037"/>
            <ellipse cx="21" cy="30" rx="13" ry="22" fill="#4caf50"/>
            <ellipse cx="12" cy="45" rx="9"  ry="11" fill="#388e3c"/>
            <ellipse cx="30" cy="45" rx="9"  ry="11" fill="#388e3c"/>
            <ellipse cx="21" cy="21" rx="9"  ry="13" fill="#66bb6a"/>
            <circle cx="16" cy="28" r="4"   fill="#f06292" opacity=".9"/>
            <circle cx="25" cy="33" r="3.5" fill="#f06292" opacity=".9"/>
            <circle cx="20" cy="40" r="3"   fill="#f06292" opacity=".9"/>
          </svg>
          <div class="plbl">Meditate</div>
          <div class="pstreak" style="background:rgba(240,98,146,.45)">💑 31d</div>
        </div>

        <div class="pslot" style="left:62%" onclick="HG.screens.plantDetail.open('read')">
          <svg width="28" height="48" viewBox="0 0 28 48">
            <rect x="12" y="35" width="3" height="13" fill="#6d4c41"/>
            <ellipse cx="14" cy="21" rx="9"  ry="15" fill="#81c784"/>
            <ellipse cx="7"  cy="32" rx="6"  ry="8"  fill="#66bb6a"/>
            <ellipse cx="21" cy="32" rx="6"  ry="8"  fill="#66bb6a"/>
          </svg>
          <div class="plbl">Read</div>
          <div class="pstreak">🔥 12d</div>
        </div>

        <div class="pslot" style="right:9%;opacity:.44;cursor:pointer" onclick="HG.screens.addHabit.open()">
          <svg width="20" height="32" viewBox="0 0 22 36">
            <rect x="10" y="26" width="2" height="10" fill="#8d6e63"/>
            <ellipse cx="11" cy="16" rx="7" ry="11" fill="#aed581" opacity=".5"/>
          </svg>
          <div class="plbl" style="background:rgba(0,0,0,.18)">+</div>
        </div>
      </div>
    </div>

    <div class="today-strip">
      <div class="sh2">
        <span class="sh2-t">Today</span>
        <span class="sh2-p">${count} / ${total}</span>
      </div>
      <div class="prog-track">
        <div class="prog-fill" style="width:${pct}%"></div>
      </div>
      ${HG.data.habits.map(h => this._pill(h)).join('')}
    </div>`;
  },

  _pill(h) {
    const done = HG.state.completedToday.includes(h.id);
    return `
    <div class="hpill${done?' done':''}" onclick="HG.screens.home.pillTap('${h.id}')">
      <div class="hpill-ic" style="background:${h.color}">${h.icon}</div>
      <div class="hpill-inf">
        <div class="hpill-n">${h.name}</div>
        <div class="hpill-s">${done
          ? `${h.doneVal || h.target+' '+h.metric} · done ✓`
          : `Target: ${h.target} ${h.metric}${h.couple ? ' · Couple with '+h.couple : ''}`
        }</div>
      </div>
      <span class="htm">${h.time}</span>
      <div class="chk${done?' done':''}">
        ${done
          ? `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`
          : `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg>`
        }
      </div>
    </div>`;
  },

  pillTap(id) {
    if (HG.state.completedToday.includes(id)) {
      HG.util.toast('Already logged today! 🌿');
      return;
    }
    const habit = HG.data.habits.find(h => h.id === id);
    if (habit) HG.screens.complete.open(habit);
  },

  markDone(id) {
    if (!HG.state.completedToday.includes(id)) {
      HG.state.completedToday.push(id);
      HG.state.save();
    }
    // Re-render home if visible
    const s = document.getElementById('scr-home');
    if (s && s.classList.contains('on')) s.innerHTML = HG.screens.home.render();
  }
};
