'use strict';

// ---------- 双语 ----------
const I18N = {
  zh: {
    autoShow: '自动秀',
    stopShow: '停止',
    soundOn: '🔊',
    soundOff: '🔇',
    hint: '点按天空，放烟花！🎇',
  },
  en: {
    autoShow: 'Auto Show',
    stopShow: 'Stop',
    soundOn: '🔊',
    soundOff: '🔇',
    hint: 'Tap the sky for fireworks! 🎇',
  },
};

const UI = {
  lang: localStorage.getItem('fw-lang') || 'zh',
  autoTimer: null,

  t(key) {
    return I18N[this.lang][key];
  },

  applyLang() {
    document.documentElement.lang = this.lang === 'zh' ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (I18N[this.lang][key]) el.textContent = I18N[this.lang][key];
    });
    document.getElementById('btn-sound').textContent =
      AudioEngine.enabled ? this.t('soundOn') : this.t('soundOff');
    document.getElementById('btn-lang').textContent = this.lang === 'zh' ? 'EN' : '中';
    this.renderSelector();
    const autoBtn = document.getElementById('btn-auto');
    autoBtn.querySelector('span').textContent = this.autoTimer ? this.t('stopShow') : this.t('autoShow');
  },

  renderSelector() {
    const box = document.getElementById('selector');
    box.innerHTML = '';
    for (const meta of FIREWORK_META) {
      const btn = document.createElement('button');
      btn.className = 'fw-item' + (Game.selectedType === meta.id ? ' selected' : '');
      btn.innerHTML =
        `<span class="fw-emoji">${meta.emoji}</span>` +
        `<span class="fw-name">${this.lang === 'zh' ? meta.zh : meta.en}</span>`;
      btn.addEventListener('click', () => {
        Game.selectedType = meta.id;
        this.renderSelector();
      });
      box.appendChild(btn);
    }
  },

  toggleAuto() {
    const btn = document.getElementById('btn-auto');
    if (this.autoTimer) {
      clearInterval(this.autoTimer);
      this.autoTimer = null;
      btn.classList.remove('active');
    } else {
      Game.randomLaunch();
      this.autoTimer = setInterval(() => {
        Game.randomLaunch();
        if (Math.random() < 0.35) {
          setTimeout(() => Game.randomLaunch(), 250);
        }
      }, 1100);
      btn.classList.add('active');
    }
    btn.querySelector('span').textContent = this.autoTimer ? this.t('stopShow') : this.t('autoShow');
  },

  init() {
    document.getElementById('btn-auto').addEventListener('click', () => this.toggleAuto());
    document.getElementById('btn-sound').addEventListener('click', () => {
      AudioEngine.enabled = !AudioEngine.enabled;
      document.getElementById('btn-sound').textContent =
        AudioEngine.enabled ? this.t('soundOn') : this.t('soundOff');
    });
    document.getElementById('btn-lang').addEventListener('click', () => {
      this.lang = this.lang === 'zh' ? 'en' : 'zh';
      localStorage.setItem('fw-lang', this.lang);
      this.applyLang();
    });
    this.applyLang();
  },
};

UI.init();
