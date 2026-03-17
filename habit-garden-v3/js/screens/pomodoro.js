// ── POMODORO SCREEN ──
HG.screens = HG.screens || {};

HG.screens.pomodoro = {
    // State
    mode: 'focus',         // 'focus' | 'short' | 'long'
    durations: { focus: 25, short: 5, long: 15 }, // minutes
    timeLeft: 25 * 60,     // seconds
    totalTime: 25 * 60,
    running: false,
    _tick: null,
    sessions: 0,           // completed focus sessions today
    plantStage: 0,         // 0-6 (seed→bud→sprout→sapling→young→flowering→tree)
    _rafId: null,
    _startTime: null,
    _pausedAt: 0,

    get elapsed() {
        return this.totalTime - this.timeLeft;
    },

    get progress() {
        return this.elapsed / this.totalTime;
    },

    // ─── RENDER ──────────────────────────────────────────────────
    render() {
        return `
<div class="pomo-screen">

  <!-- Sky + Life Cycle Viewport -->
  <div class="pomo-sky" id="pomo-sky">
    <!-- Stars layer -->
    <div class="star-field" id="star-field">
      ${this._starsSVG()}
    </div>
    <!-- Moon -->
    <div class="pomo-moon" id="pomo-moon">🌙</div>
    <!-- Sun -->
    <div class="pomo-sun-wrap" id="pomo-sun-wrap">
      <div class="pomo-sun" id="pomo-sun"></div>
    </div>
    <!-- Clouds -->
    <div class="pomo-clouds" id="pomo-clouds">
      <div class="pomo-cloud c1">☁</div>
      <div class="pomo-cloud c2">⛅</div>
      <div class="pomo-cloud c3">☁</div>
    </div>
    <!-- Rain layer -->
    <div class="pomo-rain" id="pomo-rain">
      ${Array.from({ length: 22 }, () => `<div class="raindrop" style="left:${Math.random() * 100}%;animation-delay:${(Math.random() * 1.5).toFixed(2)}s;animation-duration:${(0.6 + Math.random() * 0.5).toFixed(2)}s"></div>`).join('')}
    </div>

    <!-- Ground -->
    <div class="pomo-ground">
      <!-- Plant life cycle container -->
      <div class="pomo-plant-stage" id="pomo-plant">
        ${this._plantSVG(0)}
      </div>
    </div>
  </div>

  <!-- Phase badges -->
  <div class="pomo-phases">
    <div class="pphase ${this.mode === 'focus' ? 'on' : ''}" onclick="HG.screens.pomodoro.switchMode('focus')">Focus</div>
    <div class="pphase ${this.mode === 'short' ? 'on' : ''}" onclick="HG.screens.pomodoro.switchMode('short')">Short Break</div>
    <div class="pphase ${this.mode === 'long' ? 'on' : ''}"  onclick="HG.screens.pomodoro.switchMode('long')">Long Break</div>
  </div>

  <!-- Timer ring -->
  <div class="pomo-ring-wrap">
    <svg class="pomo-ring" viewBox="0 0 200 200">
      <circle class="pomo-ring-bg" cx="100" cy="100" r="86"/>
      <circle class="pomo-ring-fill" id="pomo-ring-fill" cx="100" cy="100" r="86"
        stroke-dasharray="540.35" stroke-dashoffset="540.35"/>
    </svg>
    <div class="pomo-ring-inner">
      <div class="pomo-time" id="pomo-time">${this._fmt(this.timeLeft)}</div>
      <div class="pomo-label" id="pomo-label">${this._modeLabel()}</div>
      <div class="pomo-sessions" id="pomo-sessions">
        ${Array.from({ length: 4 }, (_, i) => `<span class="psess${i < this.sessions ? 'done' : ''}">${i < this.sessions ? '🍅' : '○'}</span>`).join('')}
      </div>
    </div>
  </div>

  <!-- Duration preset chips -->
  <div class="pomo-chips" id="pomo-chips">
    ${[15, 20, 25, 30, 45, 60].map(m => `
      <div class="pchip${this.durations.focus === m ? ' on' : ''}"
           onclick="HG.screens.pomodoro.setDuration(${m})">${m}m</div>`).join('')}
  </div>

  <!-- Controls -->
  <div class="pomo-controls">
    <button class="pomo-btn-sm" onclick="HG.screens.pomodoro.reset()" title="Reset">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
        <path d="M3 12a9 9 0 019-9 9 9 0 0 1 6.36 2.64L21 9"/><path d="M21 3v6h-6"/>
      </svg>
    </button>
    <button class="pomo-btn-main" id="pomo-play" onclick="HG.screens.pomodoro.toggle()">
      <svg id="pomo-play-ico" viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
        <polygon points="5,3 19,12 5,21"/>
      </svg>
    </button>
    <button class="pomo-btn-sm" onclick="HG.screens.pomodoro.skip()" title="Skip">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
        <polygon points="5,4 15,12 5,20"/><line x1="19" y1="4" x2="19" y2="20"/>
      </svg>
    </button>
  </div>

  <!-- Motivation text -->
  <div class="pomo-motivate" id="pomo-motivate">🌱 Plant a seed of focus</div>

</div>`;
    },

    // ─── TIMER LOGIC ─────────────────────────────────────────────
    toggle() {
        if (this.running) { this.pause(); } else { this.start(); }
    },

    start() {
        if (this.running) return;
        this.running = true;
        this._updatePlayBtn();
        this._animate();
        this._tick = setInterval(() => {
            this.timeLeft--;
            this._updateDisplay();
            this._updateRing();
            this._updateWorld();    // sky + plant life cycle
            if (this.timeLeft <= 0) this._onComplete();
        }, 1000);
    },

    pause() {
        this.running = false;
        clearInterval(this._tick);
        this._updatePlayBtn();
        this._motivate('⏸ Paused — your plant waits for you…');
    },

    reset() {
        this.running = false;
        clearInterval(this._tick);
        this.timeLeft = this.durations[this.mode] * 60;
        this.totalTime = this.timeLeft;
        this._updateDisplay();
        this._updateRing();
        this._updatePlayBtn();
        this._resetWorld();
        this._motivate('🌱 Plant a seed of focus');
    },

    skip() {
        this._onComplete();
    },

    switchMode(m) {
        this.running = false;
        clearInterval(this._tick);
        this.mode = m;
        this.timeLeft = this.durations[m] * 60;
        this.totalTime = this.timeLeft;
        this._updateDisplay();
        this._updateRing();
        this._updatePlayBtn();
        this._resetWorld();
        // Update phase badges
        document.querySelectorAll('.pphase').forEach((el, i) => {
            el.classList.toggle('on', ['focus', 'short', 'long'][i] === m);
        });
        document.getElementById('pomo-label').textContent = this._modeLabel();
        this._motivate(m === 'focus' ? '🌱 Plant a seed of focus' : m === 'short' ? '🌿 Short break — breathe' : '🌳 Long break — rest deeply');
    },

    setDuration(minutes) {
        if (this.running) return;
        this.durations.focus = minutes;
        if (this.mode === 'focus') {
            this.timeLeft = minutes * 60;
            this.totalTime = this.timeLeft;
            this._updateDisplay();
            this._updateRing();
        }
        document.querySelectorAll('.pchip').forEach(c => {
            c.classList.toggle('on', parseInt(c.textContent) === minutes);
        });
    },

    _onComplete() {
        this.running = false;
        clearInterval(this._tick);
        this.timeLeft = 0;
        this._updateDisplay();
        this._updateRing();
        this._updatePlayBtn();

        if (this.mode === 'focus') {
            this.sessions = Math.min(4, this.sessions + 1);
            this._updateSessions();
            // Grow plant to final tree
            this._growPlant(6);
            this._motivate('🌳 Session complete! 🎉 Your plant has grown!');
            HG.util.toast(`🍅 Focus session done! Plant fully grown! Take a break 🌿`);
            // Auto switch to break
            setTimeout(() => this.switchMode(this.sessions % 4 === 0 ? 'long' : 'short'), 2000);
        } else {
            this._motivate('✅ Break done! Ready to focus again?');
            HG.util.toast('Break over! Time to plant another seed 🌱');
            setTimeout(() => this.switchMode('focus'), 1500);
        }
    },

    // ─── DISPLAY UPDATES ─────────────────────────────────────────
    _fmt(secs) {
        const m = String(Math.floor(secs / 60)).padStart(2, '0');
        const s = String(secs % 60).padStart(2, '0');
        return `${m}:${s}`;
    },

    _modeLabel() {
        return { focus: 'Focus Time', short: 'Short Break', long: 'Long Break' }[this.mode];
    },

    _updateDisplay() {
        const el = document.getElementById('pomo-time');
        if (el) el.textContent = this._fmt(this.timeLeft);
    },

    _updateRing() {
        const el = document.getElementById('pomo-ring-fill');
        if (!el) return;
        const circumference = 540.35;
        const offset = circumference * (1 - this.progress);
        el.style.strokeDashoffset = offset;
    },

    _updatePlayBtn() {
        const ico = document.getElementById('pomo-play-ico');
        if (!ico) return;
        if (this.running) {
            ico.innerHTML = `<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>`;
        } else {
            ico.innerHTML = `<polygon points="5,3 19,12 5,21"/>`;
        }
    },

    _updateSessions() {
        const el = document.getElementById('pomo-sessions');
        if (!el) return;
        el.innerHTML = Array.from({ length: 4 }, (_, i) => `<span class="psess${i < this.sessions ? 'done' : ''}">${i < this.sessions ? '🍅' : '○'}</span>`).join('');
    },

    _motivate(msg) {
        const el = document.getElementById('pomo-motivate');
        if (el) { el.textContent = msg; }
    },

    // ─── ANIMATION ── Sky + Plant Life Cycle ────────────────────
    _animate() {
        // Uses CSS transitions driven by progress 0→1
        // Called once on start; _updateWorld ticks every second
    },

    _updateWorld() {
        const p = this.progress; // 0 → 1

        // ── Sky color: night→dawn→day→dusk→night ──
        const sky = document.getElementById('pomo-sky');
        if (sky) {
            const bg = this._skyGradient(p);
            sky.style.background = bg;
        }

        // ── Stars: fade out as day comes, fade back at night ──
        const stars = document.getElementById('star-field');
        if (stars) {
            const starOpacity = p < 0.15 ? 1 - p / 0.15
                : p < 0.75 ? 0
                    : (p - 0.75) / 0.25;
            stars.style.opacity = starOpacity;
        }

        // ── Moon: rise up until dawn, then set ──
        const moon = document.getElementById('pomo-moon');
        if (moon) {
            if (p < 0.2) {
                moon.style.opacity = 1 - p / 0.2;
                moon.style.transform = `translateX(-50%) translateY(${-40 * p}px)`;
            } else if (p > 0.8) {
                const q = (p - 0.8) / 0.2;
                moon.style.opacity = q;
                moon.style.transform = `translateX(-50%) translateY(${-40 + 40 * q}px)`;
            } else {
                moon.style.opacity = 0;
            }
        }

        // ── Sun arc: rises from left, arcs across, sets right ──
        const sunWrap = document.getElementById('pomo-sun-wrap');
        if (sunWrap) {
            // Sun visible from p=0.15 to p=0.85
            const sunPhase = Math.max(0, Math.min(1, (p - 0.15) / 0.7));
            if (p >= 0.15 && p <= 0.85) {
                const angle = sunPhase * Math.PI;         // 0 → π (left to right arc)
                const sunX = 10 + sunPhase * 80;         // 10% → 90% width
                const sunY = 80 - Math.sin(angle) * 65;  // arc peak at 15% top
                sunWrap.style.left = `${sunX}%`;
                sunWrap.style.bottom = `${sunY}%`;
                sunWrap.style.opacity = `${Math.sin(angle)}`;
            } else {
                sunWrap.style.opacity = '0';
            }
        }

        // ── Clouds: drift in during day, fade at night ──
        const clouds = document.getElementById('pomo-clouds');
        if (clouds) {
            const cloudOp = p > 0.15 && p < 0.85 ? Math.sin((p - 0.15) / 0.7 * Math.PI) : 0;
            clouds.style.opacity = cloudOp;
        }

        // ── Rain: falls during first 30% of focus (watering the seed) ──
        const rain = document.getElementById('pomo-rain');
        if (rain && this.mode === 'focus') {
            if (p > 0.05 && p < 0.35) {
                rain.style.opacity = Math.min(1, (p - 0.05) / 0.15);
                rain.style.display = 'block';
            } else {
                rain.style.opacity = 0;
                if (p >= 0.35) rain.style.display = 'none';
            }
        }

        // ── Plant growth — 7 stages over the session ──
        const stage = Math.floor(p * 7); // 0–6
        if (stage !== this.plantStage) {
            this.plantStage = stage;
            this._growPlant(stage);
        }
    },

    _growPlant(stage) {
        this.plantStage = stage;
        const el = document.getElementById('pomo-plant');
        if (!el) return;
        // Animate in new plant
        el.style.transform = 'scale(0.85)';
        el.style.opacity = '0.4';
        el.innerHTML = this._plantSVG(stage);
        setTimeout(() => {
            el.style.transform = 'scale(1)';
            el.style.opacity = '1';
        }, 50);
    },

    _resetWorld() {
        this.plantStage = 0;
        const sky = document.getElementById('pomo-sky');
        if (sky) sky.style.background = this._skyGradient(0);
        const stars = document.getElementById('star-field'); if (stars) stars.style.opacity = 1;
        const moon = document.getElementById('pomo-moon'); if (moon) { moon.style.opacity = '1'; moon.style.transform = 'translateX(-50%)'; }
        const sunW = document.getElementById('pomo-sun-wrap'); if (sunW) sunW.style.opacity = '0';
        const clouds = document.getElementById('pomo-clouds'); if (clouds) clouds.style.opacity = '0';
        const rain = document.getElementById('pomo-rain'); if (rain) { rain.style.opacity = '0'; rain.style.display = 'none'; }
        const plant = document.getElementById('pomo-plant'); if (plant) { plant.innerHTML = this._plantSVG(0); plant.style.transform = ''; plant.style.opacity = '1'; }
    },

    // ─── SKY GRADIENT ─────────────────────────────────────────────
    _skyGradient(p) {
        // p: 0→night, 0.15→dawn, 0.3→day, 0.7→day, 0.85→dusk, 1→night
        const palettes = [
            // [p_start, top_color, bottom_color]
            [0.00, '#0d1b2a', '#1a2744'],   // deep night
            [0.10, '#1a2744', '#2d3a6a'],   // late night
            [0.15, '#7b4f8e', '#e8865a'],   // violet dawn
            [0.20, '#ff9a5c', '#ffd6a0'],   // golden sunrise
            [0.30, '#87ceeb', '#cce8ff'],   // clear blue day
            [0.60, '#64b5f6', '#b3deff'],   // afternoon
            [0.75, '#ffb347', '#ffd6a0'],   // sunset orange
            [0.85, '#7b4f8e', '#3d1c5e'],   // dusk purple
            [0.92, '#1c1c3a', '#0d1b2a'],   // twilight
            [1.00, '#0d1b2a', '#1a2744'],   // night again
        ];
        // Find surrounding palette entries and interpolate
        let lo = palettes[0], hi = palettes[palettes.length - 1];
        for (let i = 0; i < palettes.length - 1; i++) {
            if (p >= palettes[i][0] && p <= palettes[i + 1][0]) {
                lo = palettes[i]; hi = palettes[i + 1]; break;
            }
        }
        const t = lo[0] === hi[0] ? 0 : (p - lo[0]) / (hi[0] - lo[0]);
        const top = this._lerpColor(lo[1], hi[1], t);
        const bot = this._lerpColor(lo[2], hi[2], t);
        return `linear-gradient(180deg, ${top} 0%, ${bot} 100%)`;
    },

    _lerpColor(a, b, t) {
        const ah = parseInt(a.slice(1), 16);
        const bh = parseInt(b.slice(1), 16);
        const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
        const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
        const r = Math.round(ar + (br - ar) * t);
        const g = Math.round(ag + (bg - ag) * t);
        const bl = Math.round(ab + (bb - ab) * t);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`;
    },

    // ─── PLANT SVG STAGES 0-6 ─────────────────────────────────────
    _plantSVG(stage) {
        const plants = [
            // 0 - Seed
            `<svg width="56" height="80" viewBox="0 0 56 80">
        <ellipse cx="28" cy="68" rx="6" ry="4" fill="#5d4037" opacity=".4"/>
        <ellipse cx="28" cy="65" rx="7" ry="5" fill="#795548"/>
        <ellipse cx="28" cy="63" rx="5" ry="4" fill="#a1887f"/>
        <ellipse cx="26" cy="62" rx="2" ry="1.5" fill="#bcaaa4" opacity=".7"/>
      </svg>`,
            // 1 - Sprout
            `<svg width="56" height="80" viewBox="0 0 56 80">
        <rect x="26" y="55" width="3" height="16" rx="1.5" fill="#66bb6a"/>
        <ellipse cx="28" cy="65" rx="6" ry="4" fill="#a1887f" opacity=".5"/>
        <ellipse cx="28" cy="50" rx="6" ry="5" fill="#81c784"/>
        <ellipse cx="22" cy="54" rx="5" ry="3.5" transform="rotate(-15,22,54)" fill="#a5d6a7"/>
        <ellipse cx="34" cy="54" rx="5" ry="3.5" transform="rotate(15,34,54)" fill="#a5d6a7"/>
      </svg>`,
            // 2 - Small plant
            `<svg width="56" height="80" viewBox="0 0 56 80">
        <rect x="26" y="45" width="4" height="26" rx="2" fill="#4caf50"/>
        <ellipse cx="28" cy="65" rx="7" ry="4" fill="#795548" opacity=".4"/>
        <ellipse cx="28" cy="40" rx="10" ry="9" fill="#66bb6a"/>
        <ellipse cx="18" cy="47" rx="8" ry="5.5" transform="rotate(-20,18,47)" fill="#81c784"/>
        <ellipse cx="38" cy="47" rx="8" ry="5.5" transform="rotate(20,38,47)" fill="#81c784"/>
        <ellipse cx="28" cy="33" rx="7" ry="6" fill="#a5d6a7"/>
      </svg>`,
            // 3 - Sapling
            `<svg width="56" height="80" viewBox="0 0 56 80">
        <rect x="25" y="38" width="5" height="33" rx="2" fill="#5d4037"/>
        <ellipse cx="28" cy="60" rx="8" ry="5" fill="#6d4c41" opacity=".4"/>
        <ellipse cx="28" cy="30" rx="14" ry="13" fill="#4caf50"/>
        <ellipse cx="16" cy="40" rx="9" ry="7" fill="#388e3c"/>
        <ellipse cx="40" cy="40" rx="9" ry="7" fill="#388e3c"/>
        <ellipse cx="28" cy="22" rx="10" ry="9" fill="#66bb6a"/>
        <circle cx="24" cy="27" r="2.5" fill="#ffeb3b" opacity=".8"/>
        <circle cx="32" cy="30" r="2" fill="#ffeb3b" opacity=".7"/>
      </svg>`,
            // 4 - Young tree
            `<svg width="56" height="80" viewBox="0 0 56 80">
        <rect x="24" y="32" width="7" height="40" rx="3" fill="#5d4037"/>
        <ellipse cx="28" cy="58" rx="9" ry="5" fill="#4e342e" opacity=".4"/>
        <ellipse cx="28" cy="22" rx="18" ry="17" fill="#388e3c"/>
        <ellipse cx="14" cy="34" rx="11" ry="9" fill="#2e7d32"/>
        <ellipse cx="42" cy="34" rx="11" ry="9" fill="#2e7d32"/>
        <ellipse cx="28" cy="13" rx="13" ry="11" fill="#43a047"/>
        <circle cx="22" cy="18" r="2.5" fill="#ef5350" opacity=".85"/>
        <circle cx="34" cy="22" r="2.5" fill="#ef5350" opacity=".85"/>
        <circle cx="28" cy="30" r="2" fill="#ef5350" opacity=".7"/>
      </svg>`,
            // 5 - Flowering tree
            `<svg width="56" height="80" viewBox="0 0 56 80">
        <rect x="24" y="28" width="8" height="44" rx="4" fill="#5d4037"/>
        <ellipse cx="28" cy="58" rx="10" ry="5.5" fill="#4e342e" opacity=".4"/>
        <ellipse cx="28" cy="18" rx="21" ry="19" fill="#2e7d32"/>
        <ellipse cx="12" cy="30" rx="13" ry="10" fill="#388e3c"/>
        <ellipse cx="44" cy="30" rx="13" ry="10" fill="#388e3c"/>
        <ellipse cx="28" cy="8" rx="15" ry="12" fill="#43a047"/>
        <circle cx="20" cy="14" r="3.5" fill="#f48fb1"/>
        <circle cx="36" cy="12" r="3.5" fill="#f48fb1"/>
        <circle cx="28" cy="22" r="3" fill="#f48fb1"/>
        <circle cx="14" cy="28" r="3" fill="#ce93d8"/>
        <circle cx="42" cy="28" r="3" fill="#ce93d8"/>
        <circle cx="22" cy="30" r="2.5" fill="#ef5350" opacity=".85"/>
        <circle cx="34" cy="32" r="2.5" fill="#ef5350" opacity=".85"/>
      </svg>`,
            // 6 - Mature tree (full bloom)
            `<svg width="56" height="80" viewBox="0 0 56 80">
        <rect x="23" y="24" width="9" height="48" rx="4" fill="#4e342e"/>
        <ellipse cx="28" cy="60" rx="11" ry="6" fill="#3e2723" opacity=".4"/>
        <ellipse cx="28" cy="14" rx="24" ry="21" fill="#1b5e20"/>
        <ellipse cx="10" cy="26" rx="15" ry="12" fill="#2e7d32"/>
        <ellipse cx="46" cy="26" rx="15" ry="12" fill="#2e7d32"/>
        <ellipse cx="28" cy="5" rx="17" ry="13" fill="#388e3c"/>
        <ellipse cx="28" cy="16" rx="20" ry="17" fill="#43a047" opacity=".6"/>
        <circle cx="19" cy="11" r="4" fill="#f06292"/>
        <circle cx="37" cy="9" r="4" fill="#f06292"/>
        <circle cx="28" cy="5" r="3.5" fill="#f48fb1"/>
        <circle cx="12" cy="22" r="3.5" fill="#ce93d8"/>
        <circle cx="44" cy="22" r="3.5" fill="#ce93d8"/>
        <circle cx="20" cy="27" r="3" fill="#ef5350"/>
        <circle cx="36" cy="28" r="3" fill="#ef5350"/>
        <circle cx="28" cy="30" r="3" fill="#ffeb3b"/>
        <circle cx="18" cy="17" r="2" fill="#fff176" opacity=".9"/>
        <circle cx="38" cy="16" r="2" fill="#fff176" opacity=".9"/>
      </svg>`
        ];
        return plants[Math.min(stage, 6)];
    },

    // ─── STARS SVG ────────────────────────────────────────────────
    _starsSVG() {
        return Array.from({ length: 40 }, () => {
            const x = (Math.random() * 100).toFixed(1);
            const y = (Math.random() * 60).toFixed(1);
            const r = (Math.random() * 1.5 + 0.5).toFixed(1);
            const delay = (Math.random() * 3).toFixed(1);
            return `<div class="star" style="left:${x}%;top:${y}%;width:${r * 2}px;height:${r * 2}px;animation-delay:${delay}s"></div>`;
        }).join('');
    }
};
