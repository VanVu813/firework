'use strict';

/* ---------- 烟花模块页面 ---------- */
mergeI18n({
  zh: { fwHint: '点按天空，放烟花！🎇', autoShow: '自动秀', stopShow: '停止' },
  en: { fwHint: 'Tap the sky for fireworks! 🎇', autoShow: 'Auto Show', stopShow: 'Stop' },
});

const FireworksPage = {
  el: null,
  canvas: null,
  ctx: null,
  raf: 0,
  W: 0,
  H: 0,
  stars: [],
  rockets: [],
  particles: [],
  onResize: null,
  onTap: null,

  PALETTE: ['#ff6b9d', '#ffd93d', '#6bcbff', '#a78bfa', '#7bf1a8', '#ff9f43'],

  render(container) {
    container.innerHTML = `
      <canvas id="sky"></canvas>
      <div id="fw-hint">${App.t('fwHint')}</div>
      <button id="fw-auto" class="tool-btn">🎆<span>${App.t('autoShow')}</span></button>
      <div id="selector"></div>`;
    this.el = container;
    this.canvas = container.querySelector('#sky');
    this.ctx = this.canvas.getContext('2d');

    this.onResize = () => this.resize();
    this.onTap = e => this.tap(e);
    window.addEventListener('resize', this.onResize);
    this.canvas.addEventListener('mousedown', this.onTap);
    this.canvas.addEventListener('touchstart', this.onTap, { passive: false });

    this.resize();
    const loop = t => {
      this.step(t);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);

    FireworksUI.init(container);
  },

  destroy() {
    cancelAnimationFrame(this.raf);
    FireworksUI.destroy();
    window.removeEventListener('resize', this.onResize);
    if (this.canvas) {
      this.canvas.removeEventListener('mousedown', this.onTap);
      this.canvas.removeEventListener('touchstart', this.onTap);
    }
    this.rockets = [];
    this.particles = [];
    this.el = this.canvas = this.ctx = null;
  },

  resize() {
    this.W = this.canvas.width = this.el.clientWidth * devicePixelRatio;
    this.H = this.canvas.height = this.el.clientHeight * devicePixelRatio;
    this.initStars();
    setFireworkScale(Math.min(this.el.clientWidth, this.el.clientHeight));
  },

  initStars() {
    this.stars = [];
    const count = Math.floor((this.W * this.H) / 3500);
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.W,
        y: Math.random() * this.H * 0.7,
        r: Math.random() * 1.4 + 0.4,
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.5,
      });
    }
  },

  tap(e) {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    this.launch(
      (p.clientX - rect.left) * devicePixelRatio,
      (p.clientY - rect.top) * devicePixelRatio
    );
  },

  launch(tx, ty, type) {
    const color = this.PALETTE[Math.floor(Math.random() * this.PALETTE.length)];
    this.rockets.push(new Rocket(this.W / 2, this.H * 0.95, tx, ty, color,
      type || Game.selectedType));
    AudioEngine.playLaunch();
  },

  randomLaunch() {
    this.launch(
      this.W * (0.15 + Math.random() * 0.7),
      this.H * (0.15 + Math.random() * 0.45)
    );
  },

  step(t) {
    const { ctx, W, H } = this;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#050514');
    g.addColorStop(0.6, '#0d1030');
    g.addColorStop(1, '#1a1440');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    for (const s of this.stars) {
      const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * 0.001 * s.speed + s.phase));
      ctx.globalAlpha = tw;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * devicePixelRatio, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    this.drawMoon();
    this.drawHills();

    this.rockets = this.rockets.filter(r => {
      const arrived = r.update();
      r.draw(ctx);
      if (arrived) {
        this.particles.push(...r.explode());
        AudioEngine.playExplode(r.type === 'dahlia' || r.type === 'surprise');
        return false;
      }
      return true;
    });

    this.particles = this.particles.filter(p => {
      p.update();
      p.draw(ctx);
      return !p.dead && p.y < H + 20;
    });
    ctx.globalAlpha = 1;
  },

  drawMoon() {
    const { ctx, W, H } = this;
    const r = Math.min(W, H) * 0.05;
    const x = W * 0.82;
    // 矮屏时月亮下移，避免与按钮重叠
    const y = this.el.clientHeight < 500 ? H * 0.38 : H * 0.14;
    ctx.fillStyle = '#fdf6d8';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(253, 246, 216, 0.15)';
    ctx.beginPath();
    ctx.arc(x, y, r * 1.6, 0, Math.PI * 2);
    ctx.fill();
  },

  drawHills() {
    const { ctx, W, H } = this;
    ctx.fillStyle = '#0b0d20';
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(0, H * 0.88);
    for (let x = 0; x <= W; x += W / 8) {
      ctx.quadraticCurveTo(
        x + W / 16, H * (0.82 + 0.04 * Math.sin(x * 0.001)),
        x + W / 8, H * 0.88
      );
    }
    ctx.lineTo(W, H);
    ctx.fill();
  },
};

Pages.fireworks = FireworksPage;

/* 供其他模块调用（如考试庆祝） */
window.Game = {
  selectedType: 'surprise',
  launch: (tx, ty, type) => FireworksPage.launch(tx, ty, type),
  randomLaunch: () => FireworksPage.randomLaunch(),
};
