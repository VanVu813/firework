'use strict';

/* ---------- 字母墙：选今天要学的字母 ---------- */
Pages.abcHome = {
  render(el) {
    const wall = LETTERS.map(item => {
      const l = item.letter;
      const learned = Store.isLearned(l);
      return `
        <button class="wall-cell" data-letter="${l}">
          <span class="wall-up">${l}</span>
          <span class="wall-low">${l.toLowerCase()}</span>
          ${learned ? '<span class="wall-star">⭐</span>' : ''}
        </button>`;
    }).join('');

    el.innerHTML = `
      <div class="abc-page">
        <div class="abc-head">
          <div class="abc-title">${App.t('pickLetter')}</div>
          <div class="abc-head-btns">
            <button id="abc-random" class="tool-btn">${App.t('randomLetter')}</button>
            <button id="abc-quiz" class="tool-btn">${App.t('goQuiz')}</button>
          </div>
        </div>
        <div class="letter-wall">${wall}</div>
      </div>`;

    el.querySelectorAll('.wall-cell').forEach(btn => {
      btn.addEventListener('click', () => {
        Speech.letter(btn.dataset.letter);
        Router.go(`#/abc/learn/${btn.dataset.letter}`);
      });
    });
    el.querySelector('#abc-random').addEventListener('click', () => {
      const l = LETTERS[Math.floor(Math.random() * LETTERS.length)].letter;
      Speech.letter(l);
      Router.go(`#/abc/learn/${l}`);
    });
    el.querySelector('#abc-quiz').addEventListener('click', () => {
      Router.go('#/abc/quiz');
    });
  },
};
