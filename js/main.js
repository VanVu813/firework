'use strict';

const canvas = document.getElementById('sky');
const ctx = canvas.getContext('2d');

let W = 0;
let H = 0;
let stars = [];
let rockets = [];
let particles = [];

const PALETTE = ['#ff6b9d', '#ffd93d', '#6bcbff', '#a78bfa', '#7bf1a8', '#ff9f43'];

function initStars() {
  stars = [];
  const count = Math.floor((W * H) / 3500);
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * W,
      y: Math.random() * H * 0.7,
      r: Math.random() * 1.4 + 0.4,
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 1.5,
    });
  }
}

function resize() {
  W = canvas.width = window.innerWidth * devicePixelRatio;
  H = canvas.height = window.innerHeight * devicePixelRatio;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  initStars();
}

function drawSky(t) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#050514');
  g.addColorStop(0.6, '#0d1030');
  g.addColorStop(1, '#1a1440');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  for (const s of stars) {
    const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * 0.001 * s.speed + s.phase));
    ctx.globalAlpha = tw;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r * devicePixelRatio, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  drawMoon();
  drawHills();
}

function drawMoon() {
  const r = Math.min(W, H) * 0.05;
  const x = W * 0.82;
  const y = H * 0.14;
  ctx.fillStyle = '#fdf6d8';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(253, 246, 216, 0.15)';
  ctx.beginPath();
  ctx.arc(x, y, r * 1.6, 0, Math.PI * 2);
  ctx.fill();
}

function drawHills() {
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
}

const Game = {
  selectedType: 'surprise',
  launch(tx, ty, type) {
    const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    rockets.push(new Rocket(W / 2, H * 0.95, tx, ty, color, type || this.selectedType));
    AudioEngine.playLaunch();
  },
  // 随机位置发射（自动秀模式用）
  randomLaunch() {
    this.launch(
      W * (0.15 + Math.random() * 0.7),
      H * (0.15 + Math.random() * 0.45)
    );
  },
};
window.Game = Game;

function onTap(e) {
  e.preventDefault();
  const p = e.touches ? e.touches[0] : e;
  Game.launch(p.clientX * devicePixelRatio, p.clientY * devicePixelRatio);
}

canvas.addEventListener('mousedown', onTap);
canvas.addEventListener('touchstart', onTap, { passive: false });

function loop(t) {
  drawSky(t);

  rockets = rockets.filter(r => {
    const arrived = r.update();
    r.draw(ctx);
    if (arrived) {
      particles.push(...r.explode());
      AudioEngine.playExplode(r.type === 'dahlia' || r.type === 'surprise');
      return false;
    }
    return true;
  });

  particles = particles.filter(p => {
    p.update();
    p.draw(ctx);
    return !p.dead && p.y < H + 20;
  });
  ctx.globalAlpha = 1;

  requestAnimationFrame(loop);
}

window.addEventListener('resize', resize);
resize();
requestAnimationFrame(loop);
