'use strict';

/* 描红用手写体（与页面显示字形一致：单层 a/g） */
const TRACE_FONT = '"Patrick Hand", "Comic Sans MS", "Chalkboard SE", cursive';

/* ---------- 描红跟写页：沿虚线描字母 ---------- */
Pages.abcTrace = {
  render(el, letter) {
    const item = letterData(letter);
    if (!item) { Router.go('#/abc'); return; }

    el.innerHTML = `
      <div class="abc-page trace-page">
        <div class="abc-head">
          <div class="abc-title">${App.t('traceTip')}</div>
          <div class="abc-head-btns">
            <div class="case-tabs">
              <button class="case-tab active" data-case="up">A</button>
              <button class="case-tab" data-case="low">a</button>
            </div>
            <button id="trace-listen" class="tool-btn">${App.t('listen')}</button>
            <button id="trace-clear" class="tool-btn">${App.t('clear')}</button>
          </div>
        </div>
        <div class="trace-body">
          <canvas id="trace-canvas"></canvas>
          <div class="trace-progress">
            <div class="trace-bar"><div class="trace-fill" style="width:0%"></div></div>
            <span class="trace-pct">0%</span>
          </div>
        </div>
        <div class="trace-done hidden">
          <div class="done-bubble">
            <div class="done-text">⭐ ${App.t('great')}</div>
            <div class="done-btns">
              <button id="trace-rewrite" class="tool-btn">${App.t('rewrite')}</button>
              <button id="trace-next" class="tool-btn primary">${App.t('traceNext')}</button>
            </div>
          </div>
        </div>
      </div>`;

    this.letter = letter;
    this.case = 'up';
    this.canvas = el.querySelector('#trace-canvas');
    this.fillEl = el.querySelector('.trace-fill');
    this.pctEl = el.querySelector('.trace-pct');
    this.doneEl = el.querySelector('.trace-done');
    this.strokes = [];
    this.drawing = false;
    this.onResize = () => this.setup();
    window.addEventListener('resize', this.onResize);

    this.setup();
    this.bind(el);

    // 网络字体加载完成后重建描红目标（否则字形回退导致描线对不上）
    document.fonts.ready.then(() => {
      if (this.canvas && this.canvas.isConnected) this.setup();
    });

    setTimeout(() => Speech.letter(letter), 250);
  },

  destroy() {
    window.removeEventListener('resize', this.onResize);
    Speech.stop();
  },

  char() {
    return this.case === 'up' ? this.letter : this.letter.toLowerCase();
  },

  bind(el) {
    el.querySelectorAll('.case-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        el.querySelectorAll('.case-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.case = tab.dataset.case;
        this.setup();
      });
    });
    el.querySelector('#trace-listen').addEventListener('click', () => Speech.letter(this.letter));
    el.querySelector('#trace-clear').addEventListener('click', () => this.reset());
    el.querySelector('#trace-rewrite').addEventListener('click', () => this.reset());
    el.querySelector('#trace-next').addEventListener('click', () => {
      Router.go(`#/abc/learn/${nextLetter(this.letter)}`);
    });

    const c = this.canvas;
    c.addEventListener('pointerdown', e => {
      e.preventDefault();
      c.setPointerCapture(e.pointerId);
      this.drawing = true;
      this.lastPoint = null; // 新起一笔，不与上一笔之间插值连线
      this.strokes.push([this.point(e)]);
      this.mark(e);
      this.redraw();
    });
    c.addEventListener('pointermove', e => {
      if (!this.drawing) return;
      e.preventDefault();
      this.strokes[this.strokes.length - 1].push(this.point(e));
      this.mark(e);
      this.redraw();
    });
    const up = () => { this.drawing = false; this.lastPoint = null; };
    c.addEventListener('pointerup', up);
    c.addEventListener('pointercancel', up);
  },

  point(e) {
    const r = this.canvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * devicePixelRatio,
      y: (e.clientY - r.top) * devicePixelRatio,
    };
  },

  setup() {
    const body = this.canvas.parentElement;
    this.canvas.width = body.clientWidth * devicePixelRatio;
    this.canvas.height = Math.max(body.clientHeight - 46, 120) * devicePixelRatio;
    this.buildTargets();
    this.reset(false);
  },

  buildTargets() {
    // 离屏画布：粗笔画渲染字母，提取笔画覆盖点
    const off = document.createElement('canvas');
    off.width = this.canvas.width;
    off.height = this.canvas.height;
    const octx = off.getContext('2d');
    const size = Math.min(off.width, off.height) * 0.62;
    octx.font = `${Math.round(size)}px ${TRACE_FONT}`;
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    octx.lineJoin = 'round';
    octx.lineWidth = Math.max(size * 0.2, 24);
    octx.strokeStyle = '#fff';
    octx.strokeText(this.char(), off.width / 2, off.height / 2);

    const img = octx.getImageData(0, 0, off.width, off.height).data;
    this.inkWidth = Math.max(size * 0.11, 14);
    const stride = 4;
    const R = this.inkWidth; // 容差半径
    this.coverR2 = R * R;

    this.targets = [];
    this.targetGrid = new Map();
    const key = (cx, cy) => cx + ':' + cy;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (let y = 0; y < off.height; y += stride) {
      for (let x = 0; x < off.width; x += stride) {
        if (img[(y * off.width + x) * 4 + 3] > 100) {
          this.targets.push({ x, y, hit: false });
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          // 空间哈希：容差半径分桶，便于快速命中检测
          const cx = Math.floor(x / R), cy = Math.floor(y / R);
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const k = key(cx + dx, cy + dy);
              if (!this.targetGrid.has(k)) this.targetGrid.set(k, []);
              this.targetGrid.get(k).push(this.targets[this.targets.length - 1]);
            }
          }
        }
      }
    }

    // 区域网格：把字母包围盒分成若干格，完成时要求大部分格子都有足够覆盖，
    // 防止小朋友只在字母某一小块密集涂抹就"跳成功"
    const cellSize = Math.max(size * 0.3, 60);
    this.cells = [];
    const cellMap = new Map();
    for (const t of this.targets) {
      const k = Math.floor((t.x - minX) / cellSize) + ':' + Math.floor((t.y - minY) / cellSize);
      if (!cellMap.has(k)) {
        const c = { total: 0, hit: 0 };
        cellMap.set(k, c);
        this.cells.push(c);
      }
      t.cell = cellMap.get(k);
      t.cell.total++;
    }
    this.hitCount = 0;
  },

  // 标记以 (x, y) 为圆心、容差半径内的目标点
  markAt(x, y) {
    const R = this.inkWidth;
    const cx = Math.floor(x / R), cy = Math.floor(y / R);
    const bucket = this.targetGrid.get(cx + ':' + cy);
    if (!bucket) return;
    for (const t of bucket) {
      if (t.hit) continue;
      const dx = t.x - x, dy = t.y - y;
      if (dx * dx + dy * dy <= this.coverR2) {
        t.hit = true;
        t.cell.hit++;
        this.hitCount++;
      }
    }
  },

  mark(e) {
    const p = this.point(e);
    // 在上一笔迹点之间插值补点，快速涂画也不漏检
    const last = this.lastPoint;
    if (last) {
      const dist = Math.hypot(p.x - last.x, p.y - last.y);
      const step = this.inkWidth * 0.5;
      for (let d = step; d < dist; d += step) {
        const r = d / dist;
        this.markAt(last.x + (p.x - last.x) * r, last.y + (p.y - last.y) * r);
      }
    }
    this.lastPoint = p;
    this.markAt(p.x, p.y);
    this.updateProgress();
  },

  updateProgress() {
    const total = this.targets.length || 1;
    const overall = this.hitCount / total;

    // 区域覆盖：有效格子（采样点足够多）中，单格覆盖 ≥40% 记为"已写到"
    const activeCells = this.cells.filter(c => c.total >= 8);
    const cellsNeed = Math.max(1, Math.ceil(activeCells.length * 0.85));
    const cellsPassed = activeCells.filter(c => c.hit >= c.total * 0.4).length;
    const regionPct = cellsPassed / cellsNeed;

    // 进度显示取两者较小值，避免"100% 却没成功"的困惑
    const pct = Math.min(100, Math.floor(Math.min(overall, regionPct) * 100));
    this.fillEl.style.width = pct + '%';
    this.pctEl.textContent = pct + '%';
    if (!this.done && overall >= 0.9 && cellsPassed >= cellsNeed) {
      this.done = true;
      this.doneEl.classList.remove('hidden');
      Speech.praise();
    }
  },

  reset(hideDone = true) {
    this.strokes = [];
    this.done = false;
    this.lastPoint = null;
    if (hideDone) this.doneEl.classList.add('hidden');
    for (const t of this.targets) t.hit = false;
    for (const c of this.cells) c.hit = 0;
    this.hitCount = 0;
    this.fillEl.style.width = '0%';
    this.pctEl.textContent = '0%';
    this.redraw();
  },

  redraw() {
    const ctx = this.canvas.getContext('2d');
    const { width: W, height: H } = this.canvas;
    ctx.clearRect(0, 0, W, H);

    // 浅色背景板
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    const pad = 12 * devicePixelRatio;
    ctx.beginPath();
    ctx.roundRect(pad, pad, W - pad * 2, H - pad * 2, 24 * devicePixelRatio);
    ctx.fill();

    // 虚线描红引导（粗轮廓 + 虚线描边）
    const size = Math.min(W, H) * 0.62;
    ctx.font = `${Math.round(size)}px ${TRACE_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(size * 0.2, 24);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.10)';
    ctx.strokeText(this.char(), W / 2, H / 2);
    ctx.strokeStyle = 'rgba(143, 211, 255, 0.75)';
    ctx.setLineDash([10 * devicePixelRatio, 8 * devicePixelRatio]);
    ctx.lineWidth = Math.max(size * 0.045, 6);
    ctx.strokeText(this.char(), W / 2, H / 2);
    ctx.setLineDash([]);

    // 已描笔画（金色，圆头）
    ctx.strokeStyle = '#ffd93d';
    ctx.lineWidth = this.inkWidth;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.9;
    for (const stroke of this.strokes) {
      if (!stroke.length) continue;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (const p of stroke) ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  },
};
