// ── ADD HABIT OVERLAY ──
HG.screens = HG.screens || {};

HG.screens.addHabit = {
  step: 1, preset: null, isCustom: false, selMetric: '', grpOn: false,

  open() {
    this.step = 1; this.preset = null; this.isCustom = false; this.grpOn = false;
    this._showStep(1);
    const ov = document.getElementById('ov-add');
    if (ov) ov.classList.add('open');
  },
  close() {
    const ov = document.getElementById('ov-add');
    if (ov) ov.classList.remove('open');
  },
  _showStep(n) {
    this.step = n;
    document.querySelectorAll('#ov-add .flow-step').forEach(s => s.classList.remove('on'));
    const el = document.getElementById('fs' + n);
    if (el) el.classList.add('on');
    if (n === 2) this._buildStep2();
    if (n === 4) this._buildConfirm();
  },
  selectPreset(el, id) {
    document.querySelectorAll('#ov-add .preset-card').forEach(c => c.classList.remove('sel'));
    const cc = document.getElementById('custom-card');
    if (cc) cc.classList.remove('sel');
    el.classList.add('sel');
    this.preset = HG.data.presets.find(p => p.id === id);
    this.isCustom = false;
  },
  selectCustom() {
    document.querySelectorAll('#ov-add .preset-card').forEach(c => c.classList.remove('sel'));
    const cc = document.getElementById('custom-card');
    if (cc) cc.classList.add('sel');
    this.isCustom = true; this.preset = null;
  },
  goStep(n) {
    if (n === 2 && !this.preset && !this.isCustom) { HG.util.toast('Pick a habit or choose custom'); return; }
    this._showStep(n);
  },
  _buildStep2() {
    const cnw = document.getElementById('cname-w');
    const cmw = document.getElementById('cm-w');
    const mo  = document.getElementById('metric-opts');
    const tu  = document.getElementById('target-unit');
    const st  = document.getElementById('s2-title');
    const all = ['km','min','steps','pages','reps','sets','laps','hr','litres','sessions','pomodoros'];
    if (this.isCustom) {
      if (cnw) cnw.style.display = 'block';
      if (cmw) cmw.style.display = 'block';
      if (st)  st.textContent = 'Custom · Metric';
      if (mo)  mo.innerHTML = all.map(m => `<div class="mopt" onclick="HG.screens.addHabit.selMetricFn(this,'${m}')">${m}</div>`).join('');
    } else {
      if (cnw) cnw.style.display = 'none';
      if (cmw) cmw.style.display = 'none';
      if (st)  st.textContent = this.preset.name + ' · Metric';
      if (mo)  mo.innerHTML = this.preset.metrics.map((m, i) =>
        `<div class="mopt${i===0?' on':''}" onclick="HG.screens.addHabit.selMetricFn(this,'${m}')">${m}</div>`
      ).join('');
      this.selMetric = this.preset.metrics[0];
      if (tu) tu.textContent = this.selMetric;
    }
  },
  selMetricFn(el, m) {
    document.querySelectorAll('#metric-opts .mopt').forEach(o => o.classList.remove('on'));
    el.classList.add('on');
    this.selMetric = m;
    const tu = document.getElementById('target-unit');
    if (tu) tu.textContent = m;
  },
  selFreq(el) { document.querySelectorAll('.freq-opts .fopt').forEach(o => o.classList.remove('on')); el.classList.add('on'); },
  selVis(el)  { document.querySelectorAll('.vis-opts .vopt').forEach(o => o.classList.remove('on'));  el.classList.add('on'); },
  toggleTrybe() {
    this.grpOn = !this.grpOn;
    const sw = document.getElementById('trybe-sw');
    const il = document.getElementById('invite-list');
    if (sw) sw.classList.toggle('on', this.grpOn);
    if (il) il.classList.toggle('show', this.grpOn);
  },
  toggleInv(el) { el.classList.toggle('on'); el.textContent = el.classList.contains('on') ? '✓' : ''; },
  _buildConfirm() {
    const name   = this.isCustom ? (document.getElementById('custom-name')?.value || 'Custom habit') : this.preset.name;
    const ico    = this.isCustom ? '✏️' : this.preset.icon;
    const target = document.getElementById('target-val')?.value || '?';
    const unit   = this.selMetric || (this.preset ? this.preset.default : 'units');
    const from   = document.getElementById('t-from')?.value || '07:00';
    const to     = document.getElementById('t-to')?.value   || '08:00';
    const visEl  = document.querySelector('.vis-opts .vopt.on');
    const vis    = visEl ? visEl.textContent.trim().split('\n')[0] : '👥 Peers';
    const ci = document.getElementById('confirm-ico');   if (ci) ci.textContent = ico;
    const cn = document.getElementById('confirm-name');  if (cn) cn.textContent = name;
    const cm = document.getElementById('confirm-meta');  if (cm) cm.textContent = `${target} ${unit} · Daily · ${from}–${to}`;
    const cv = document.getElementById('confirm-vis');   if (cv) cv.textContent = vis;
    const cg = document.getElementById('confirm-grp');   if (cg) cg.textContent = this.grpOn ? 'Yes · Trybe chat created' : 'No';
    const ca = document.getElementById('confirm-alarm'); if (ca) ca.textContent = `🔔 ${from} start · ${to} end`;
  },
  confirm() {
    const name = this.isCustom ? (document.getElementById('custom-name')?.value || 'New habit') : this.preset.name;
    this.close();
    HG.util.toast(this.grpOn ? `✅ ${name} added! Trybe invites sent 🌿` : `✅ ${name} added! Alarms set 🌿`);
  },

  html() {
    return `
    <div class="ov" id="ov-add" onclick="if(event.target===this)HG.screens.addHabit.close()">
    <div class="sheet">
      <div class="handle"></div>
      <div class="sh-body">

        <div class="flow-step on" id="fs1">
          <div class="step-hdr">
            <div class="step-title">Add a habit</div>
            <div class="step-dots"><div class="sdot on"></div><div class="sdot"></div><div class="sdot"></div><div class="sdot"></div></div>
          </div>
          <div class="fl-label">Choose a preset</div>
          <div class="preset-grid">
            ${HG.data.presets.map(p =>
              `<div class="preset-card" onclick="HG.screens.addHabit.selectPreset(this,'${p.id}')">
                <span>${p.icon}</span><p>${p.name}</p>
              </div>`).join('')}
          </div>
          <div class="custom-card" id="custom-card" onclick="HG.screens.addHabit.selectCustom()">
            <span style="font-size:25px">✏️</span>
            <div><div style="font-size:14px;font-weight:500">Custom habit</div><div style="font-size:12px;color:var(--tx3);margin-top:2px">Name it, pick any metric</div></div>
          </div>
          <button class="primary-btn" onclick="HG.screens.addHabit.goStep(2)">Continue</button>
        </div>

        <div class="flow-step" id="fs2">
          <div class="step-hdr">
            <button class="back-btn" onclick="HG.screens.addHabit.goStep(1)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div class="step-title" id="s2-title">Metric &amp; target</div>
            <div class="step-dots"><div class="sdot on"></div><div class="sdot on"></div><div class="sdot"></div><div class="sdot"></div></div>
          </div>
          <div id="cname-w" style="display:none">
            <div class="fl-label">Habit name</div>
            <input class="fl-inp" id="custom-name" placeholder="e.g. Cold shower, Piano…" autocomplete="off">
          </div>
          <div class="fl-label">Measure in</div>
          <div class="metric-opts" id="metric-opts"></div>
          <div id="cm-w" style="display:none;margin-bottom:13px">
            <div class="fl-label">Custom metric</div>
            <input class="fl-inp" id="custom-metric" placeholder="e.g. pomodoros…" style="margin-bottom:0" autocomplete="off">
          </div>
          <div class="fl-label">Daily target</div>
          <div style="display:flex;gap:9px;align-items:center;margin-bottom:14px">
            <input class="fl-inp-sm" type="number" inputmode="decimal" id="target-val" placeholder="e.g. 5" style="flex:1">
            <span id="target-unit" style="font-size:13px;color:var(--tx2);font-weight:500">km</span>
          </div>
          <button class="primary-btn" onclick="HG.screens.addHabit.goStep(3)">Continue</button>
        </div>

        <div class="flow-step" id="fs3">
          <div class="step-hdr">
            <button class="back-btn" onclick="HG.screens.addHabit.goStep(2)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div class="step-title">Schedule &amp; privacy</div>
            <div class="step-dots"><div class="sdot on"></div><div class="sdot on"></div><div class="sdot on"></div><div class="sdot"></div></div>
          </div>
          <div class="fl-label">Time window</div>
          <div class="time-row">
            <input class="fl-inp-sm" type="time" id="t-from" value="07:00" style="flex:1">
            <span class="time-sep">to</span>
            <input class="fl-inp-sm" type="time" id="t-to" value="08:00" style="flex:1">
          </div>
          <div class="fl-label">Frequency</div>
          <div class="freq-opts">
            <div class="fopt on" onclick="HG.screens.addHabit.selFreq(this)">Daily</div>
            <div class="fopt"    onclick="HG.screens.addHabit.selFreq(this)">Weekdays</div>
            <div class="fopt"    onclick="HG.screens.addHabit.selFreq(this)">Custom</div>
          </div>
          <div class="fl-label">Visibility</div>
          <div class="vis-opts">
            <div class="vopt"    onclick="HG.screens.addHabit.selVis(this)"><span class="vopt-ico">🔒</span>Private<br><span style="font-size:9.5px;color:var(--tx3)">Only you</span></div>
            <div class="vopt on" onclick="HG.screens.addHabit.selVis(this)"><span class="vopt-ico">👥</span>Peers<br><span style="font-size:9.5px;color:var(--g600)">Peers only</span></div>
            <div class="vopt"    onclick="HG.screens.addHabit.selVis(this)"><span class="vopt-ico">🌍</span>Public<br><span style="font-size:9.5px;color:var(--tx3)">Leaderboard</span></div>
          </div>
          <div class="fl-label">Make it a Trybe habit?</div>
          <div class="trybe-toggle" onclick="HG.screens.addHabit.toggleTrybe()">
            <span style="font-size:24px">🌿</span>
            <div><h4>Trybe habit</h4><p>Invite peers · shared plant · auto chat</p></div>
            <div class="tsw" id="trybe-sw"><div class="tkn"></div></div>
          </div>
          <div class="invite-list" id="invite-list">
            <div style="font-size:12px;color:var(--tx3);margin-bottom:8px">Invite peers &amp; followers</div>
            <div class="invite-row"><div class="inv-av" style="background:#5c6bc0">PS</div><div class="inv-name">Priya Sharma <span style="font-size:10px;color:var(--g600)">Peer</span></div><div class="inv-chk" onclick="HG.screens.addHabit.toggleInv(this)"></div></div>
            <div class="invite-row"><div class="inv-av" style="background:#2e7d32">RM</div><div class="inv-name">Rohit M. <span style="font-size:10px;color:var(--g600)">Peer</span></div><div class="inv-chk" onclick="HG.screens.addHabit.toggleInv(this)"></div></div>
            <div class="invite-row"><div class="inv-av" style="background:#ad1457">AK</div><div class="inv-name">Ananya K. <span style="font-size:10px;color:var(--blue)">Following</span></div><div class="inv-chk" onclick="HG.screens.addHabit.toggleInv(this)"></div></div>
          </div>
          <button class="primary-btn" onclick="HG.screens.addHabit.goStep(4)">Continue</button>
        </div>

        <div class="flow-step" id="fs4">
          <div class="step-hdr">
            <button class="back-btn" onclick="HG.screens.addHabit.goStep(3)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div class="step-title">Confirm</div>
            <div class="step-dots"><div class="sdot on"></div><div class="sdot on"></div><div class="sdot on"></div><div class="sdot on"></div></div>
          </div>
          <div class="confirm-card">
            <div style="display:flex;align-items:center;gap:10px">
              <div style="font-size:30px" id="confirm-ico">🏃</div>
              <div>
                <div style="font-size:15px;font-weight:600;color:var(--g700)" id="confirm-name">Running</div>
                <div style="font-size:11.5px;color:var(--tx3)"               id="confirm-meta">5 km · Daily · 7:00–8:00</div>
              </div>
            </div>
            <div class="confirm-grid">
              <div class="confirm-cell"><div class="confirm-cell-label">Visibility</div><div class="confirm-cell-val" id="confirm-vis">👥 Peers</div></div>
              <div class="confirm-cell"><div class="confirm-cell-label">Trybe</div><div class="confirm-cell-val" id="confirm-grp">No</div></div>
              <div class="confirm-cell" style="grid-column:1/-1"><div class="confirm-cell-label">Alarms</div><div class="confirm-cell-val" id="confirm-alarm">🔔 7:00 start · 8:00 end</div></div>
            </div>
          </div>
          <div class="alarm-note">🔔 <b>Start alarm</b>: confirm you're beginning. <b>End alarm</b>: add moments + metric to water your plant.</div>
          <button class="primary-btn" onclick="HG.screens.addHabit.confirm()"><span>🌿</span> Add habit &amp; set alarms</button>
          <button class="ghost-btn"   onclick="HG.screens.addHabit.close()">Cancel</button>
        </div>

      </div>
    </div>
    </div>`;
  }
};

// ── COMPLETE HABIT OVERLAY ──────────────────────────────────
HG.screens.complete = {
  habit: null, moments: 0, locAdded: false,

  open(habit) {
    this.habit = habit; this.moments = 0; this.locAdded = false;
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    set('comp-title',     'Complete ' + habit.name);
    set('comp-sub',       `Target: ${habit.target} ${habit.metric} · Add your moments`);
    set('comp-plant-ico', HG.data.plants[habit.plant]?.emoji || '🌱');
    set('comp-unit',      habit.metric);
    setVal('comp-metric', '');
    const wd = document.getElementById('wdrops'); if (wd) wd.style.display = 'none';
    const lt = document.getElementById('loc-text'); if (lt) lt.textContent = 'Add location (optional)';
    const la = document.getElementById('loc-added'); if (la) la.style.display = 'none';
    const shelf = document.getElementById('media-shelf');
    if (shelf) shelf.innerHTML = `<div class="mthumb add-btn" onclick="HG.screens.complete.addMoment()">+</div>`;
    const ov = document.getElementById('ov-complete');
    if (ov) ov.classList.add('open');
  },
  close() { const ov = document.getElementById('ov-complete'); if (ov) ov.classList.remove('open'); },

  addMoment() {
    this.moments++;
    const shelf = document.getElementById('media-shelf');
    if (!shelf) return;
    const icons = ['📷','🎥','📸','🖼️'];
    const bgs   = ['#e8f5e9','#e3f2fd','#fff3e0','#fce4ec'];
    const th = document.createElement('div');
    th.className = 'mthumb';
    th.style.background = bgs[(this.moments-1)%4];
    th.textContent = icons[(this.moments-1)%4];
    const btn = shelf.querySelector('.add-btn');
    shelf.insertBefore(th, btn);
    HG.util.toast(`Moment ${this.moments} added`);
  },

  toggleLoc() {
    this.locAdded = !this.locAdded;
    const lt = document.getElementById('loc-text');
    const la = document.getElementById('loc-added');
    if (lt) lt.textContent = this.locAdded ? '📍 Viman Nagar, Pune · tap to remove' : 'Add location (optional)';
    if (la) la.style.display = this.locAdded ? 'inline' : 'none';
  },

  submit() {
    if (this.moments === 0) { HG.util.toast('Add at least one photo or video'); return; }
    const val = document.getElementById('comp-metric')?.value;
    if (!val) { HG.util.toast('Enter your metric value'); return; }
    const wd = document.getElementById('wdrops'); if (wd) wd.style.display = 'flex';
    setTimeout(() => {
      this.close();
      if (this.habit) HG.screens.home.markDone(this.habit.id);
      HG.util.toast(`💧 Plant watered! Moment live on feed · 24h`);
    }, 1200);
  },

  html() {
    return `
    <div class="ov" id="ov-complete" onclick="if(event.target===this)HG.screens.complete.close()">
    <div class="sheet">
      <div class="handle"></div>
      <div class="sh-body">
        <div class="sh-t" id="comp-title">Complete habit</div>
        <div class="sh-s" id="comp-sub">Add moments, metric &amp; location</div>
        <div class="water-hero">
          <span class="water-plant-ico" id="comp-plant-ico">🌸</span>
          <div class="water-hint">This plant will be watered on completion</div>
          <div class="wdrops" id="wdrops">
            <span class="wdrop">💧</span><span class="wdrop">💧</span><span class="wdrop">💧</span>
          </div>
        </div>
        <div class="fl-label">Moments <span style="font-size:11px;color:var(--tx3);font-weight:400">— all release together on completion</span></div>
        <div class="media-shelf" id="media-shelf">
          <div class="mthumb add-btn" onclick="HG.screens.complete.addMoment()">+</div>
        </div>
        <div class="fl-label">Metric achieved</div>
        <div style="display:flex;gap:9px;align-items:center;margin-bottom:14px">
          <input class="fl-inp" type="number" inputmode="decimal" id="comp-metric" placeholder="e.g. 22" style="margin:0;flex:1">
          <span id="comp-unit" style="font-size:13px;font-weight:500;color:var(--tx2)">min</span>
        </div>
        <div class="loc-row" onclick="HG.screens.complete.toggleLoc()">
          <span style="font-size:18px">📍</span>
          <span id="loc-text" style="flex:1;font-size:13px;color:var(--tx2)">Add location (optional)</span>
          <span id="loc-added" style="display:none;font-size:11px;color:var(--g600);font-weight:500">✓ Added</span>
        </div>
        <div class="fl-label" style="margin-top:13px">Caption</div>
        <textarea class="fl-inp" style="resize:none;height:60px;margin-bottom:14px" placeholder="What was this session like?"></textarea>
        <button class="primary-btn" onclick="HG.screens.complete.submit()">
          <span>💧</span> Mark complete &amp; water plant
        </button>
      </div>
    </div>
    </div>`;
  }
};

// ── PLANT DETAIL OVERLAY ────────────────────────────────────
HG.screens.plantDetail = {
  open(id) {
    const p = HG.data.plants[id];
    if (!p) return;
    const set = (el, val) => { const e = document.getElementById(el); if (e) e.textContent = val; };
    set('pd-stage', p.emoji);
    set('pd-name',  p.name);
    set('pd-badge', `🔥 ${p.streak} day streak · ${p.stage}`);
    this._heatmap(p.streak);
    this._stages(id);
    const ov = document.getElementById('ov-plant');
    if (ov) ov.classList.add('open');
  },
  close() { const ov = document.getElementById('ov-plant'); if (ov) ov.classList.remove('open'); },

  _heatmap(streak) {
    const hm = document.getElementById('heatmap');
    if (!hm) return;
    hm.innerHTML = '';
    for (let w = 0; w < 13; w++) {
      const col = document.createElement('div'); col.className = 'hw';
      for (let d = 0; d < 7; d++) {
        const day = document.createElement('div');
        const fe  = (12-w)*7 + (6-d);
        day.className = 'hd' + (fe < streak ? (Math.random()>.08?' done':' partial') : fe < streak+10 && Math.random()>.5 ? ' partial' : '');
        col.appendChild(day);
      }
      hm.appendChild(col);
    }
  },

  _stages(id) {
    const stages = [
      ['🌰','Seed','Week 1','done'],
      ['🌿','Bud','Week 2','done'],
      ['🌱','Sapling','Weeks 3–4',    id==='read'?'cur':'done'],
      ['🪴','Young plant','Weeks 5–8', id==='med'?'cur':id==='read'?'':'done'],
      ['🌸','Flowering','Weeks 9–12',  id==='med'?'done':id==='run'?'done':''],
      ['🌳','Mature Tree','Week 12+',  id==='run'?'cur':''],
      ['🌴','Jungle Mode 🔒','52-week streak','lock']
    ];
    const sl = document.getElementById('stage-list');
    if (!sl) return;
    sl.innerHTML = stages.map((s, i) => {
      const dot = s[3]==='done' ? 'background:#2e7d32'
                : s[3]==='cur'  ? 'background:#4caf50;box-shadow:0 0 0 3px #d4f0d4'
                : 'background:var(--surf3)';
      return `<div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:${i<stages.length-1?'0.5px solid var(--bdr)':'none'};${s[3]==='lock'?'opacity:.38':''}">
        <div style="font-size:21px;width:32px;text-align:center">${s[0]}</div>
        <div style="width:8px;height:8px;border-radius:50%;flex-shrink:0;${dot}"></div>
        <div>
          <div style="font-size:13px;font-weight:500">${s[1]}${s[3]==='cur'?' — you are here':''}</div>
          <div style="font-size:11px;color:var(--tx3);margin-top:1px">${s[2]}</div>
        </div>
      </div>`;
    }).join('');
  },

  html() {
    return `
    <div class="ov" id="ov-plant" onclick="if(event.target===this)HG.screens.plantDetail.close()">
    <div class="sheet">
      <div class="handle"></div>
      <div class="plant-detail-hero">
        <div class="pd-stage" id="pd-stage">🌳</div>
        <div class="pd-name"  id="pd-name">Morning Run</div>
        <div class="pd-badge-pill" id="pd-badge">🔥 84 day streak</div>
      </div>
      <div style="padding:16px 18px 0">
        <div class="sec-l" style="margin-top:0;padding-bottom:9px">12-week heatmap</div>
        <div class="heatmap-grid" id="heatmap"></div>
        <div class="sec-l" style="padding-bottom:9px">Growth stages</div>
        <div id="stage-list"></div>
        <div style="height:20px"></div>
      </div>
    </div>
    </div>`;
  }
};
