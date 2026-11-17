'use strict';

const PARTICLE_GRAVITY = 0.045;
const AIR_RESIST = 0.985;

class Particle {
  constructor(opts) {
    this.x = opts.x;
    this.y = opts.y;
    this.vx = opts.vx || 0;
    this.vy = opts.vy || 0;
    this.color = opts.color;
    this.size = opts.size || 2;
    this.alpha = 1;
    this.decay = opts.decay || (0.008 + Math.random() * 0.01);
    this.behavior = opts.behavior || 'gravity';
    this.gravity = opts.gravity !== undefined ? opts.gravity : PARTICLE_GRAVITY;
    this.sway = opts.sway || 0;          // 左右摇摆幅度（樱花雨等）
    this.phase = Math.random() * Math.PI * 2;
    this.flicker = opts.flicker || false; // 金色闪烁
  }

  update() {
    switch (this.behavior) {
      case 'fall': // 缓缓飘落 + 摇摆
        this.phase += 0.05;
        this.vx += Math.sin(this.phase) * this.sway;
        this.vx *= 0.96;
        this.vy += this.gravity;
        if (this.vy > 1.2) this.vy = 1.2;
        break;
      case 'ring': // 圆环：沿径向外扩后减速
        this.vx *= 0.955;
        this.vy *= 0.955;
        break;
      case 'shape': // 定型：快速阻尼保持形状，再缓缓下飘
        this.vx *= 0.9;
        this.vy *= 0.9;
        this.vy += 0.012;
        break;
      default: // 'gravity'
        this.vy += this.gravity;
        this.vx *= AIR_RESIST;
        this.vy *= AIR_RESIST;
    }
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.decay;
  }

  draw(ctx) {
    if (this.alpha <= 0) return;
    let a = this.alpha;
    if (this.flicker) {
      a *= 0.55 + 0.45 * Math.sin(this.phase * 3 + this.x);
      this.phase += 0.15;
    }
    ctx.globalAlpha = Math.max(a, 0);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }

  get dead() {
    return this.alpha <= 0;
  }
}

// 颜色工具
function hsl(h, s, l) {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

// ---------- 烟花类型 ----------
// 每种类型返回一组粒子
const FireworkTypes = {
  // 🌸 樱花雨：粉色粒子，缓缓飘落摇摆
  sakura(x, y) {
    const ps = [];
    const count = 70 + Math.floor(Math.random() * 20);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.8 + Math.random() * 2.8;
      ps.push(new Particle({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.8 - 0.5,
        color: hsl(340 + Math.random() * 20, 85, 68 + Math.random() * 15),
        size: 1.8 + Math.random() * 1.6,
        behavior: 'fall',
        sway: 0.06,
        gravity: 0.018,
        decay: 0.004 + Math.random() * 0.005,
      }));
    }
    return ps;
  },

  // ✨ 金菊：经典球形，金色闪烁拖尾
  chrysanthemum(x, y) {
    const ps = [];
    const layers = 3;
    for (let l = 0; l < layers; l++) {
      const count = 50;
      const baseSpeed = 1.2 + l * 1.3;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + l * 0.06;
        const speed = baseSpeed + Math.random() * 0.3;
        ps.push(new Particle({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: hsl(42 + Math.random() * 12, 95, 55 + Math.random() * 20),
          size: 1.6 + Math.random() * 1.2,
          flicker: true,
          gravity: 0.03,
          decay: 0.007 + Math.random() * 0.006,
        }));
      }
    }
    return ps;
  },

  // 🌈 彩虹环：彩色圆环均匀扩散
  rainbowRing(x, y) {
    const ps = [];
    const count = 90;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 3.2 + Math.random() * 0.2;
      ps.push(new Particle({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: hsl(Math.floor((i / count) * 360), 90, 62),
        size: 2.2,
        behavior: 'ring',
        decay: 0.009 + Math.random() * 0.004,
      }));
    }
    return ps;
  },

  // 💥 大丽花：大范围、多层次、巨响
  dahlia(x, y) {
    const ps = [];
    const layers = 4;
    for (let l = 0; l < layers; l++) {
      const count = 60;
      const baseSpeed = 1.5 + l * 1.1;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + l * 0.13;
        const speed = baseSpeed + Math.random() * 0.5;
        const hue = [350, 25, 55, 280][l % 4];
        ps.push(new Particle({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: hsl(hue + Math.random() * 15, 90, 58 + Math.random() * 15),
          size: 1.8 + Math.random() * 1.4,
          flicker: l % 2 === 0,
          gravity: 0.028,
          decay: 0.006 + Math.random() * 0.005,
        }));
      }
    }
    return ps;
  },

  // ❤️ 爱心：粒子组成爱心形状
  heart(x, y) {
    const ps = [];
    const count = 80;
    const scale = 0.42;
    for (let i = 0; i < count; i++) {
      const t = (Math.PI * 2 * i) / count;
      // 爱心参数方程
      const hx = 16 * Math.pow(Math.sin(t), 3);
      const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      ps.push(new Particle({
        x: x + hx * scale + (Math.random() - 0.5) * 2,
        y: y + hy * scale + (Math.random() - 0.5) * 2,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        color: hsl(345 + Math.random() * 15, 90, 60 + Math.random() * 15),
        size: 2 + Math.random() * 1.2,
        behavior: 'shape',
        decay: 0.005 + Math.random() * 0.004,
      }));
    }
    return ps;
  },

  // 🐟 流星鱼：粒子呈流线型游动 + 摇摆尾巴
  meteorFish(x, y) {
    const ps = [];
    const count = 55;
    const headAngle = Math.random() * Math.PI * 2;
    for (let i = 0; i < count; i++) {
      const ratio = i / count; // 0=头 1=尾
      const spread = ratio * 14; // 尾巴展开角度
      const angle = headAngle + (Math.random() - 0.5) * (0.3 + spread * 0.06);
      const speed = 3.2 - ratio * 1.8 + Math.random() * 0.3;
      ps.push(new Particle({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: hsl(190 + ratio * 60, 90, 60 + Math.random() * 15),
        size: 2.4 - ratio * 1.2,
        behavior: 'fall',
        sway: 0.09,
        gravity: 0.012,
        decay: 0.006 + ratio * 0.006,
      }));
    }
    return ps;
  },

  // 🎁 惊喜盲盒：随机类型 + 随机配色
  surprise(x, y) {
    const keys = ['sakura', 'chrysanthemum', 'rainbowRing', 'dahlia', 'heart', 'meteorFish'];
    const pick = keys[Math.floor(Math.random() * keys.length)];
    return FireworkTypes[pick](x, y);
  },
};

// UI 展示用元数据（双语）
const FIREWORK_META = [
  { id: 'sakura', emoji: '🌸', zh: '樱花雨', en: 'Sakura Rain' },
  { id: 'chrysanthemum', emoji: '✨', zh: '金菊', en: 'Golden Chrys' },
  { id: 'rainbowRing', emoji: '🌈', zh: '彩虹环', en: 'Rainbow Ring' },
  { id: 'dahlia', emoji: '💥', zh: '大丽花', en: 'Big Dahlia' },
  { id: 'heart', emoji: '❤️', zh: '爱心', en: 'Lovely Heart' },
  { id: 'meteorFish', emoji: '🐟', zh: '流星鱼', en: 'Meteor Fish' },
  { id: 'surprise', emoji: '🎁', zh: '惊喜盲盒', en: 'Surprise!' },
];

class Rocket {
  constructor(sx, sy, tx, ty, color, type) {
    this.x = sx;
    this.y = sy;
    this.tx = tx;
    this.ty = ty;
    this.color = color;
    this.type = type || 'chrysanthemum';
    this.speed = 9 + Math.random() * 2;
    const dx = tx - sx;
    const dy = ty - sy;
    const dist = Math.hypot(dx, dy) || 1;
    this.vx = (dx / dist) * this.speed;
    this.vy = (dy / dist) * this.speed;
    this.trail = [];
  }

  update() {
    this.trail.push({ x: this.x, y: this.y, alpha: 0.8 });
    if (this.trail.length > 12) this.trail.shift();
    for (const t of this.trail) t.alpha -= 0.06;
    this.x += this.vx;
    this.y += this.vy;
    return Math.hypot(this.tx - this.x, this.ty - this.y) < this.speed ||
           this.vy > -1;
  }

  explode() {
    const factory = FireworkTypes[this.type] || FireworkTypes.chrysanthemum;
    return factory(this.x, this.y);
  }

  draw(ctx) {
    for (const t of this.trail) {
      if (t.alpha <= 0) continue;
      ctx.globalAlpha = t.alpha;
      ctx.fillStyle = '#ffdca8';
      ctx.beginPath();
      ctx.arc(t.x, t.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
}
