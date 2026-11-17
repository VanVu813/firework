'use strict';

/* ---------- 首页：应用启动台 ---------- */
mergeI18n({
  zh: {
    fwName: '放烟花', abcName: '学字母', coming: '即将上线',
    abcSub: '字母 · 单词 · 描红 · 考试',
  },
  en: {
    fwName: 'Fireworks', abcName: 'ABC Land', coming: 'Coming soon',
    abcSub: 'Letters · Words · Tracing · Quiz',
  },
});

Pages.home = {
  render(el) {
    const card = (emoji, zh, en, hash, extra = '', badge = '') => `
      <button class="app-card" data-go="${hash}" ${extra}>
        ${badge}
        <span class="card-emoji">${emoji}</span>
        <span class="card-zh">${zh}</span>
        <span class="card-en">${en}</span>
      </button>`;
    const learned = Store.data.learned.length;
    el.innerHTML = `
      <div class="home-grid">
        ${card('🎆', App.t('fwName'), 'Fireworks', '#/fireworks')}
        ${card('🔤', App.t('abcName'), App.t('abcSub'), '#/abc',
               '',
               learned ? `<span class="card-badge">⭐ ${learned}/26</span>` : '')}
        ${card('🔢', App.t('coming'), 'Numbers', '', 'disabled')}
        ${card('🎨', App.t('coming'), 'Drawing', '', 'disabled')}
        ${card('🎵', App.t('coming'), 'Music', '', 'disabled')}
      </div>`;
    el.querySelectorAll('.app-card[data-go]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        Router.go(btn.dataset.go);
      });
    });
  },
};
