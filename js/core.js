'use strict';

/* ---------- 国际化 ---------- */
const I18N = { zh: {}, en: {} };
function mergeI18n(dict) {
  for (const k of ['zh', 'en']) Object.assign(I18N[k], dict[k] || {});
}

/* ---------- 全局状态 ---------- */
const App = {
  lang: localStorage.getItem('kl-lang') || 'zh',
  t(key) {
    return (I18N[this.lang] && I18N[this.lang][key]) ||
           I18N.en[key] || key;
  },
  setLang(l) {
    this.lang = l;
    localStorage.setItem('kl-lang', l);
    document.documentElement.lang = l === 'zh' ? 'zh-CN' : 'en';
    applyShellLang();
    Router.render();
  },
};

/* ---------- 本地存档 ---------- */
const Store = {
  key: 'kl-data',
  data: null,
  load() {
    try {
      this.data = JSON.parse(localStorage.getItem(this.key)) || {};
    } catch {
      this.data = {};
    }
    this.data.learned = this.data.learned || [];
    return this.data;
  },
  save() {
    localStorage.setItem(this.key, JSON.stringify(this.data));
  },
  markLearned(l) {
    if (!this.data.learned.includes(l)) {
      this.data.learned.push(l);
      this.save();
    }
  },
  isLearned(l) {
    return this.data.learned.includes(l);
  },
  recordQuiz(score, total) {
    this.data.quizCount = (this.data.quizCount || 0) + 1;
    this.data.lastScore = score;
    this.data.bestScore = Math.max(this.data.bestScore || 0, score);
    this.save();
  },
};

/* ---------- 页面注册表与路由 ---------- */
const Pages = {};
const Router = {
  current: null,
  pageEl: null,
  historyStack: [],
  prevHash: null,
  routes: [
    { re: /^#\/home$/, page: 'home' },
    { re: /^$/, page: 'home' },
    { re: /^#\/fireworks$/, page: 'fireworks' },
    { re: /^#\/abc$/, page: 'abcHome' },
    { re: /^#\/abc\/learn\/([A-Z])$/, page: 'abcLearn', params: m => [m[1]] },
    { re: /^#\/abc\/trace\/([A-Z])$/, page: 'abcTrace', params: m => [m[1]] },
    { re: /^#\/abc\/quiz$/, page: 'abcQuiz' },
  ],
  start() {
    this.pageEl = document.getElementById('page');
    window.addEventListener('hashchange', () => this._onHash());
    if (!location.hash) location.hash = '#/home';
    this._onHash();
  },
  go(h) {
    if (location.hash === h) this._onHash();
    else location.hash = h;
  },
  back() {
    const prev = this.historyStack.pop();
    this.go(prev || '#/home');
  },
  _onHash() {
    const h = location.hash;
    // 浏览器前进/后退导致的 hash 变化：维护站内历史
    if (this.historyStack[this.historyStack.length - 1] === h) {
      this.historyStack.pop();
    } else if (this.prevHash && this.prevHash !== h) {
      this.historyStack.push(this.prevHash);
      if (this.historyStack.length > 50) this.historyStack.shift();
    }
    this.prevHash = h;
    this.render();
  },
  parse() {
    const h = location.hash;
    for (const r of this.routes) {
      const m = h.match(r.re);
      if (m) return { page: r.page, args: r.params ? r.params(m) : [] };
    }
    return { page: 'home', args: [] };
  },
  render() {
    const { page, args } = this.parse();
    if (this.current && Pages[this.current] && Pages[this.current].destroy) {
      Pages[this.current].destroy();
    }
    this.pageEl.innerHTML = '';
    this.current = page;
    const p = Pages[page];
    if (p) p.render(this.pageEl, ...args);
    applyShellLang();
  },
};

/* ---------- 外壳顶栏 ---------- */
function applyShellLang() {
  document.getElementById('btn-sound').textContent =
    AudioEngine.enabled ? '🔊' : '🔇';
  document.getElementById('btn-lang').textContent =
    App.lang === 'zh' ? 'EN' : '中';
  document.querySelectorAll('#shell-bar [data-i18n]').forEach(el => {
    el.textContent = App.t(el.dataset.i18n);
  });
  const onHome = (location.hash || '#/home') === '#/home' || location.hash === '';
  document.getElementById('btn-back').classList.toggle('hidden', onHome);
  document.getElementById('btn-home').classList.toggle('hidden', onHome);
}

function initShell() {
  document.getElementById('btn-back').addEventListener('click', () => Router.back());
  document.getElementById('btn-home').addEventListener('click', () => Router.go('#/home'));
  document.getElementById('btn-sound').addEventListener('click', () => {
    AudioEngine.enabled = !AudioEngine.enabled;
    applyShellLang();
  });
  document.getElementById('btn-lang').addEventListener('click', () => {
    App.setLang(App.lang === 'zh' ? 'en' : 'zh');
  });
}

mergeI18n({
  zh: { appName: '儿童乐园', back: '返回', home: '首页' },
  en: { appName: 'Kids Land', back: 'Back', home: 'Home' },
});
