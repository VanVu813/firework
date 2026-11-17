'use strict';

/* ---------- 首页：应用启动台 ---------- */
mergeI18n({
  zh: {
    fwName: '放烟花', abcName: '学字母', coming: '即将上线',
    quizEntry: '字母考试', quizSub: '听音选字母 · 大小写配对',
  },
  en: {
    fwName: 'Fireworks', abcName: 'ABC Land', coming: 'Coming soon',
    quizEntry: 'ABC Quiz', quizSub: 'Listen & match letters',
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
        ${card('🔤', App.t('abcName'), 'ABC · a~z', '#/abc',
               '',
               learned ? `<span class="card-badge">⭐ ${learned}/26</span>` : '')}
        ${card('📝', App.t('quizEntry'), App.t('quizSub'), '#/abc/quiz')}
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
