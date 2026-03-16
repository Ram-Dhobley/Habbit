// ── ADD HABIT OVERLAY ──
HG.screens.addHabit = {
  step: 1,
  preset: null,
  isCustom: false,
  selMetric: '',
  grpOn: false,

  open() {
    this.step = 1; this.preset = null; this.isCustom = false; this.grpOn = false;
    const el = document.getElementById('ov-add');
    if (!el) return;
    document.querySelectorAll('#ov-add .flow-step').forEach(s => s.classList.remove('on'));
    document.getElementById('fs1').classList.add('on');
    el.classList.add('open');
  },

  close() { document.getElementById('ov-add').classList.remove('open'); },

  selectPreset(el, id) {
    document.querySelectorAll('#ov-add .preset-card').forEach(c => c.classList.remove('sel'));
    document.getElementById('custom-card').classList.remove('sel');
    el.classList.add('sel');
    this.preset = HG.data.presets.find(p => p.id === id);
    this.isCustom = false;
  },

  selectCustom() {
    document.querySelectorAll('#ov-add .preset-card').forEach(c => c.classList.remove('sel'));
    document.getElementById('custom-card').classList.add('sel');
    this.isCustom = true; this.preset = null;
  },

  goStep(n) {
    if (n === 2 && !this.preset && !this.isCustom) { HG.util.toast('Pick a habit or choose custom'); return; }
    this.step = n;
    document.querySelectorAll('#ov-add .flow-step').forEach(s => s.classList.remove('on'));
    document.getElementById(`fs${n}`).classList.add('on');
    if (n === 2) this.buildStep2();
    if (n === 4) this.buildConfirm();
  },

  buildStep2() {
    const cnw = document.getElementById('cname-w');
    const cmw = document.getElementById('cm-w');
    const mo = document.getElementById('metric-opts');
    const allMetrics = ['km','min','steps','pages','reps','sets','laps','hr','litres','sessions','pomodoros'];
    if (this.isCustom) {
      cnw.style.display = 'block'; cmw.style.display = 'block';
      document.getElementById('s2-title').textContent = 'Custom · Metric';
      mo.innerHTML = allMetrics.map(m => `<div class="mopt" onclick="HG.screens.addHabit.selMetricFn(this,'${m}')">${m}</div>`).join('');
    } else {
      cnw.style.display = 'none'; cmw.style.display = 'none';
      document.getElementById('s2-title').textContent = this.preset.name + ' · Metric';
      mo.innerHTML = this.preset.metrics.map((m,i) =>
        `<div class="mopt${i===0?' on':''}" onclick="HG.screens.addHabit.selMetricFn(this,'${m}')">${m}</div>`).join('');
      this.selMetric = this.preset.metrics[0];
      document.getElementById('target-unit').textContent = this.selMetric;
    }
  },

  selMetricFn(el, m) {
    document.querySelectorAll('#metric-opts .mopt').forEach(o => o.classList.remove('on'));
    el.classList.add('on');
    this.selMetric = m;
    document.getElementById('target-unit').textContent = m;
  },

  selFreq(el) { document.querySelectorAll('.freq-opts .fopt').forEach(o => o.classList.remove('on')); el.classList.add('on'); },
  selVis(el) { document.querySelectorAll('.vis-opts .vopt').forEach(o => o.classList.remove('on')); el.classList.add('on'); },

  toggleTrybe() {
    this.grpOn = !this.grpOn;
    document.getElementById('trybe-sw').classList.toggle('on', this.grpOn);
    document.getElementById('invite-list').classList.toggle('show', this.grpOn);
  },

  toggleInv(el) { el.classList.toggle('on'); el.textContent = el.classList.contains('on') ? '✓' : ''; },

  buildConfirm() {
    const name = this.isCustom ? (document.getElementById('custom-name').value || 'Custom habit') : this.preset.name;
    const ico = this.isCustom ? '✏️' : this.preset.icon;
    const target = document.getElementById('target-val').value || '?';
    const unit = this.selMetric || (this.preset ? this.preset.default : 'units');
    const from = document.getElementById('t-from').value || '07:00';
    const to = document.getElementById('t-to').value || '08:00';
    const visEl = document.querySelector('.vis-opts .vopt.on');
    const vis = visEl ? visEl.textContent.trim().split('\n')[0] : '👥 Peers';
    document.getElementById('confirm-ico').textContent = ico;
    document.getElementById('confirm-name').textContent = name;
    document.getElementById('confirm-meta').textContent = `${target} ${unit} · Daily · ${from}–${to}`;
    document.getElementById('confirm-vis').textContent = vis;
    document.getElementById('confirm-grp').textContent = this.grpOn ? 'Yes · Trybe chat created' : 'No';
    document.getElementById('confirm-alarm').textContent = `🔔 ${from} start · ${to} end`;
  },

  confirm() {
    const name = this.isCustom ? (document.getElementById('custom-name').value || 'New habit') : this.preset.name;
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
              ${HG.data.presets.map(p => `<div class="preset-card" onclick="HG.screens.addHabit.selectPreset(this,'${p.id}')"><span>${p.icon}</span><p>${p.name}</p></div>`).join('')}
            </div>
            <div class="custom-card" id="custom-card" onclick="HG.screens.addHabit.selectCustom()">
              <span style="font-size:25px">✏️</span>
              <div><div style="font-size:14px;font-weight:500">Custom habit</div><div style="font-size:12px;color:var(--tx3);margin-top:2px">Name it, pick any metric</div></div>
            </div>
            <button class="primary-btn" onclick="HG.screens.addHabit.goStep(2)">Continue</button>
          </div>

          <div class="flow-step" id="fs2">
            <div class="step-hdr">
              <button class="back-btn" onclick="HG.screens.addHabit.goStep(1)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="15 18 9 12 15 6"/></svg></button>
              <div class="step-title" id="s2-title">Metric & target</div>
              <div class="step-dots"><div class="sdot on"></div><div class="sdot on"></div><div class="sdot"></div><div class="sdot"></div></div>
            </div>
            <div id="cname-w" style="display:none"><div class="fl-label">Habit name</div><input class="fl-inp" id="custom-name" placeholder="e.g. Cold shower, Piano…" autocomplete="off"></div>
            <div class="fl-label">Measure in</div>
            <div class="metric-opts" id="metric-opts"></div>
            <div id="cm-w" style="display:none;margin-bottom:13px"><div class="fl-label">Custom metric</div><input class="fl-inp" id="custom-metric" placeholder="e.g. pomodoros, sessions…" style="margin-bottom:0" autocomplete="off"></div>
            <div class="fl-label">Daily target</div>
            <div style="display:flex;gap:9px;align-items:center;margin-bottom:14px">
              <input class="fl-inp-sm" type="number" inputmode="decimal" id="target-val" placeholder="e.g. 5" style="flex:1">
              <span id="target-unit" style="font-size:13px;color:var(--tx2);font-weight:500">km</span>
            </div>
            <button class="primary-btn" onclick="HG.screens.addHabit.goStep(3)">Continue</button>
          </div>

          <div class="flow-step" id="fs3">
            <div class="step-hdr">
              <button class="back-btn" onclick="HG.screens.addHabit.goStep(2)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="15 18 9 12 15 6"/></svg></button>
              <div class="step-title">Schedule & privacy</div>
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
              <div class="fopt" onclick="HG.screens.addHabit.selFreq(this)">Weekdays</div>
              <div class="fopt" onclick="HG.screens.addHabit.selFreq(this)">Custom</div>
            </div>
            <div class="fl-label">Visibility</div>
            <div class="vis-opts">
              <div class="vopt" onclick="HG.screens.addHabit.selVis(this)"><span class="vopt-ico">🔒</span>Private<br><span style="font-size:9.5px;color:var(--tx3)">Only you</span></div>
              <div class="vopt on" onclick="HG.screens.addHabit.selVis(this)"><span class="vopt-ico">👥</span>Peers<br><span style="font-size:9.5px;color:var(--g600)">Peers only</span></div>
              <div class="vopt" onclick="HG.screens.addHabit.selVis(this)"><span class="vopt-ico">🌍</span>Public<br><span style="font-size:9.5px;color:var(--tx3)">Leaderboard</span></div>
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
              <button class="back-btn" onclick="HG.screens.addHabit.goStep(3)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="15 18 9 12 15 6"/></svg></button>
              <div class="step-title">Confirm</div>
              <div class="step-dots"><div class="sdot on"></div><div class="sdot on"></div><div class="sdot on"></div><div class="sdot on"></div></div>
            </div>
            <div class="confirm-card">
              <div style="display:flex;align-items:center;gap:10px">
                <div style="font-size:30px" id="confirm-ico">🏃</div>
                <div><div style="font-size:15px;font-weight:600;color:var(--g700)" id="confirm-name">Running</div><div style="font-size:11.5px;color:var(--tx3)" id="confirm-meta">5 km · Daily · 7:00–8:00</div></div>
              </div>
              <div class="confirm-grid">
                <div class="confirm-cell"><div class="confirm-cell-label">Visibility</div><div class="confirm-cell-val" id="confirm-vis">👥 Peers</div></div>
                <div class="confirm-cell"><div class="confirm-cell-label">Trybe</div><div class="confirm-cell-val" id="confirm-grp">No</div></div>
                <div class="confirm-cell" style="grid-column:1/-1"><div class="confirm-cell-label">Alarms</div><div class="confirm-cell-val" id="confirm-alarm">🔔 7:00 start · 8:00 end</div></div>
              </div>
            </div>
            <div class="alarm-note">🔔 <b>Start alarm</b>: confirm you're beginning. <b>End alarm</b>: add moments + metric to water your plant.</div>
            <button class="primary-btn" onclick="HG.screens.addHabit.confirm()"><span>🌿</span> Add habit & set alarms</button>
            <button class="ghost-btn" onclick="HG.screens.addHabit.close()">Cancel</button>
          </div>

        </div>
      </div>
    </div>`;
  }
};

// ── COMPLETE HABIT OVERLAY ──
HG.screens.complete = {
  habit: null,
  moments: 0,
  locAdded: false,

  open(habit) {
    this.habit = habit; this.moments = 0; this.locAdded = false;
    document.getElementById('comp-title').textContent = 'Complete ' + habit.name;
    document.getElementById('comp-sub').textContent = `Target: ${habit.target} ${habit.metric} · Add your moments`;
    document.getElementById('comp-plant-ico').textContent = HG.data.plants[habit.plant]?.emoji || '🌱';
    document.getElementById('comp-metric').value = '';
    document.getElementById('comp-unit').textContent = habit.metric;
    document.getElementById('wdrops').style.display = 'none';
    document.getElementById('loc-text').textContent = 'Add location (optional)';
    document.getElementById('loc-added').style.display = 'none';
    document.getElementById('media-shelf').innerHTML = `<div class="mthumb add-btn" onclick="HG.screens.complete.addMoment()">+</div>`;
    document.getElementById('ov-complete').classList.add('open');
  },

  close() { document.getElementById('ov-complete').classList.remove('open'); },

  addMoment() {
    this.moments++;
    const shelf = document.getElementById('media-shelf');
    const icons = ['📷','🎥','📸','🖼️'];
    const bgs = ['#e8f5e9','#e3f2fd','#fff3e0','#fce4ec'];
    const th = document.createElement('div');
    th.className = 'mthumb';
    th.style.background = bgs[(this.moments-1)%4];
    th.textContent = icons[(this.moments-1)%4];
    const btn = shelf.querySelector('.add-btn');
    shelf.insertBefore(th, btn);
    HG.util.toast(`Moment ${this.moments} added · releases on completion`);
  },

  toggleLoc() {
    this.locAdded = !this.locAdded;
    document.getElementById('loc-text').textContent = this.locAdded ? '📍 Viman Nagar, Pune · tap to remove' : 'Add location (optional)';
    document.getElementById('loc-added').style.display = this.locAdded ? 'inline' : 'none';
  },

  submit() {
    if (this.moments === 0) { HG.util.toast('Add at least one moment (photo/video)'); return; }
    const val = document.getElementById('comp-metric').value;
    if (!val) { HG.util.toast('Enter your metric value'); return; }
    document.getElementById('wdrops').style.display = 'flex';
    setTimeout(() => {
      this.close();
      HG.screens.home.markDone(this.habit.id);
      HG.util.toast(`💧 Plant watered! ${this.moments > 1 ? this.moments + ' moments live on feed' : 'Moment live on feed · 24h'}`);
    }, 1200);
  },

  html() {
    return `
    <div class="ov" id="ov-complete" onclick="if(event.target===this)HG.screens.complete.close()">
      <div class="sheet">
        <div class="handle"></div>
        <div class="sh-body">
          <div class="sh-t" id="comp-title">Complete Meditation</div>
          <div class="sh-s" id="comp-sub">Add moments, metric & location</div>
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
            <span class="loc-text" id="loc-text">Add location (optional)</span>
            <span class="loc-added" id="loc-added" style="display:none">✓ Added</span>
          </div>
          <div class="fl-label" style="margin-top:13px">Caption</div>
          <textarea class="fl-inp" style="resize:none;height:60px;margin-bottom:14px" placeholder="What was this session like?"></textarea>
          <button class="primary-btn" onclick="HG.screens.complete.submit()"><span>💧</span> Mark complete & water plant</button>
        </div>
      </div>
    </div>`;
  }
};

// ── PLANT DETAIL OVERLAY ──
HG.screens.plantDetail = {
  open(id) {
    const p = HG.data.plants[id];
    document.getElementById('pd-stage').textContent = p.emoji;
    document.getElementById('pd-name').textContent = p.name;
    document.getElementById('pd-badge').textContent = `🔥 ${p.streak} day streak · ${p.stage}`;
    this.buildHeatmap(id, p.streak);
    this.buildStages(id);
    document.getElementById('ov-plant').classList.add('open');
  },
  close() { document.getElementById('ov-plant').classList.remove('open'); },

  buildHeatmap(id, streak) {
    const hm = document.getElementById('heatmap');
    hm.innerHTML = '';
    for (let w = 0; w < 13; w++) {
      const col = document.createElement('div');
      col.className = 'hw';
      for (let d = 0; d < 7; d++) {
        const day = document.createElement('div');
        const fe = (12-w)*7 + (6-d);
        if (fe < streak) day.className = `hd ${Math.random() > 0.08 ? 'done' : 'partial'}`;
        else if (fe < streak + 10 && Math.random() > 0.5) day.className = 'hd partial';
        else day.className = 'hd';
        col.appendChild(day);
      }
      hm.appendChild(col);
    }
  },

  buildStages(id) {
    const stages = [
      ['🌰','Seed','Week 1','done'],
      ['🌿','Bud','Week 2','done'],
      ['🌱','Sapling','Weeks 3–4', id==='read'?'cur':'done'],
      ['🪴','Young plant','Weeks 5–8', id==='med'?'cur':id==='read'?'':'done'],
      ['🌸','Flowering','Weeks 9–12', id==='med'?'done':id==='run'?'done':''],
      ['🌳','Mature Tree','Week 12+', id==='run'?'cur':''],
      ['🌴','Jungle Mode 🔒','52-week streak','lock']
    ];
    const sl = document.getElementById('stage-list');
    sl.innerHTML = stages.map((s, i) => {
      const dotStyle = s[3]==='done' ? 'background:#2e7d32' : s[3]==='cur' ? 'background:#4caf50;box-shadow:0 0 0 3px #d4f0d4' : 'background:var(--surf3)';
      return `<div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:${i<stages.length-1?'0.5px solid var(--bdr)':'none'};${s[3]==='lock'?'opacity:.38':''}">
        <div style="font-size:21px;width:32px;text-align:center">${s[0]}</div>
        <div style="width:8px;height:8px;border-radius:50%;flex-shrink:0;${dotStyle}"></div>
        <div><div style="font-size:13px;font-weight:500">${s[1]}${s[3]==='cur'?' — you are here':''}</div><div style="font-size:11px;color:var(--tx3);margin-top:1px">${s[2]}</div></div>
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
          <div class="pd-name" id="pd-name">Morning Run</div>
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
