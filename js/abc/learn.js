'use strict';

/* ---------- 学习页：大小写 + 读音 + 单词卡 ---------- */
Pages.abcLearn = {
  render(el, letter) {
    const item = letterData(letter);
    if (!item) { Router.go('#/abc'); return; }
    Store.markLearned(letter);

    const cards = item.words.map(w => `
      <button class="word-card" data-say="${w.say}">
        <span class="word-emoji">${w.emoji}</span>
        <span class="word-en">${w.en}</span>
        <span class="word-zh">${w.zh}</span>
      </button>`).join('');

    el.innerHTML = `
      <div class="abc-page learn-page">
        <div class="learn-main">
          <div class="big-letter">
            <button class="bl-half bl-up" data-case="up">
              <span class="bl-char">${letter}</span>
              <span class="bl-tag">${App.t('tapHear')} 🔊</span>
            </button>
            <button class="bl-half bl-low" data-case="low">
              <span class="bl-char">${letter.toLowerCase()}</span>
              <span class="bl-tag">${App.t('tapHear')} 🔊</span>
            </button>
          </div>
          <div class="learn-tip">${App.t('wordCardTip')} 👇</div>
          <div class="word-cards">${cards}</div>
        </div>
        <div class="learn-nav">
          <button class="tool-btn" id="learn-prev">${App.t('prev')}</button>
          <button class="tool-btn primary" id="learn-trace">${App.t('goTrace')}</button>
          <button class="tool-btn" id="learn-next">${App.t('next')}</button>
        </div>
      </div>`;

    // 进入即读字母和发音示范
    setTimeout(() => Speech.letterSound(letter), 250);

    el.querySelectorAll('.bl-half').forEach(btn => {
      btn.addEventListener('click', () => Speech.letter(letter));
    });
    el.querySelectorAll('.word-card').forEach(card => {
      card.addEventListener('click', () => Speech.word(card.dataset.say));
    });
    el.querySelector('#learn-trace').addEventListener('click', () => {
      Router.go(`#/abc/trace/${letter}`);
    });
    el.querySelector('#learn-prev').addEventListener('click', () => {
      Router.go(`#/abc/learn/${prevLetter(letter)}`);
    });
    el.querySelector('#learn-next').addEventListener('click', () => {
      Router.go(`#/abc/learn/${nextLetter(letter)}`);
    });
  },
};
