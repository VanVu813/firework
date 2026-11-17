'use strict';

class Particle {
  constructor(x, y, vx, vy, color, size) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.alpha = 1;
    this.decay = 0.012 + Math.random() * 0.01;
  }

  update() {
    this.vy += 0.045;
    this.vx *= 0.985;
    this.vy *= 0.985;
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.decay;
  }

  draw(ctx) {
    if (this.alpha <= 0) return;
    ctx.globalAlpha = Math.max(this.alpha, 0);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }

  get dead() {
    return this.alpha <= 0;
  }
}

class Rocket {
  constructor(sx, sy, tx, ty, color) {
    this.x = sx;
    this.y = sy;
    this.tx = tx;
    this.ty = ty;
    this.color = color;
    this.speed = 9;
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
           this.vy > -1; // 到达目标或开始下坠时爆炸
  }

  explode() {
    const particles = [];
    const count = 60 + Math.floor(Math.random() * 30);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const speed = 1.5 + Math.random() * 3;
      particles.push(new Particle(
        this.x, this.y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        this.color,
        2 + Math.random() * 1.5
      ));
    }
    return particles;
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
