'use strict';

/* ---------- 烟花模块 UI：选择栏 + 自动秀 ---------- */
const FireworksUI = {
  autoTimer: null,

  init(container) {
    this.container = container;
    this.renderSelector();
    this.autoBtn = container.querySelector('#fw-auto');
    this.autoBtn.addEventListener('click', () => this.toggleAuto());
    this.updateAutoBtn();
  },

  destroy() {
    this.stopAuto();
    this.container = null;
  },

  renderSelector() {
    const box = this.container.querySelector('#selector');
    box.innerHTML = '';
    for (const meta of FIREWORK_META) {
      const btn = document.createElement('button');
      btn.className = 'fw-item' + (Game.selectedType === meta.id ? ' selected' : '');
      btn.innerHTML =
        `<span class="fw-emoji">${meta.emoji}</span>` +
        `<span class="fw-name">${App.lang === 'zh' ? meta.zh : meta.en}</span>`;
      btn.addEventListener('click', () => {
        Game.selectedType = meta.id;
        this.renderSelector();
      });
      box.appendChild(btn);
    }
  },

  updateAutoBtn() {
    if (!this.autoBtn) return;
    this.autoBtn.querySelector('span').textContent =
      App.t(this.autoTimer ? 'stopShow' : 'autoShow');
    this.autoBtn.classList.toggle('active', !!this.autoTimer);
  },

  startAuto() {
    if (this.autoTimer) return;
    FireworksPage.randomLaunch();
    this.autoTimer = setInterval(() => {
      FireworksPage.randomLaunch();
      if (Math.random() < 0.35) {
        setTimeout(() => FireworksPage.randomLaunch(), 250);
      }
    }, 1100);
    this.updateAutoBtn();
  },

  stopAuto() {
    if (this.autoTimer) clearInterval(this.autoTimer);
    this.autoTimer = null;
    this.updateAutoBtn();
  },

  toggleAuto() {
    if (this.autoTimer) this.stopAuto();
    else this.startAuto();
  },
};
