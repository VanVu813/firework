'use strict';

/* ---------- 考试页：选字母范围 → 随机出题 → 烟花庆祝 ---------- */
Pages.abcQuiz = {
  selected: new Set(),
  questions: [],
  qIndex: 0,
  score: 0,

  /* ===== 选范围界面 ===== */
  render(el) {
    this.el = el;
    this.selected = new Set();
    this.renderPicker();
  },

  renderPicker() {
    const options = LETTERS.map(l =>
      `<option value="${l.letter}">${l.letter}</option>`).join('');
    const wall = LETTERS.map(l => `
      <button class="wall-cell quiz-cell" data-letter="${l.letter}">
        <span class="wall-up">${l.letter}</span>
        <span class="wall-low">${l.letter.toLowerCase()}</span>
      </button>`).join('');

    this.el.innerHTML = `
      <div class="abc-page">
        <div class="abc-head">
          <div class="abc-title">${App.t('quizPick')}</div>
          <div class="abc-head-btns">
            <button id="quiz-all" class="tool-btn">${App.t('quizAll')}</button>
            <button id="quiz-random5" class="tool-btn">${App.t('quizRandom5')}</button>
            <button id="quiz-clear" class="tool-btn">${App.t('quizClear')}</button>
          </div>
        </div>
        <div class="quiz-range">
          <span>${App.t('quizFrom')}</span>
          <select id="quiz-from">${options}</select>
          <span>${App.t('quizTo')}</span>
          <select id="quiz-to">${options}</select>
          <button id="quiz-apply" class="tool-btn">${App.t('quizApply')}</button>
        </div>
        <div class="letter-wall quiz-wall">${wall}</div>
        <div class="quiz-foot">
          <span id="quiz-count">${App.t('quizSelected')}: 0</span>
          <button id="quiz-start" class="tool-btn primary" disabled>${App.t('quizStart')}</button>
        </div>
      </div>`;

    this.el.querySelectorAll('.quiz-cell').forEach(btn => {
      btn.addEventListener('click', () => {
        const l = btn.dataset.letter;
        if (this.selected.has(l)) this.selected.delete(l);
        else {
          this.selected.add(l);
          Speech.letter(l);
        }
        btn.classList.toggle('picked', this.selected.has(l));
        this.updatePickerState();
      });
    });
    this.el.querySelector('#quiz-all').addEventListener('click', () => {
      this.selected = new Set(LETTERS.map(l => l.letter));
      this.syncWall();
    });
    this.el.querySelector('#quiz-clear').addEventListener('click', () => {
      this.selected.clear();
      this.syncWall();
    });
    this.el.querySelector('#quiz-random5').addEventListener('click', () => {
      this.selected.clear();
      const pool = LETTERS.map(l => l.letter);
      while (this.selected.size < Math.min(5, pool.length)) {
        this.selected.add(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
      }
      this.syncWall();
    });
    this.el.querySelector('#quiz-apply').addEventListener('click', () => {
      const from = this.el.querySelector('#quiz-from').value;
      const to = this.el.querySelector('#quiz-to').value;
      const a = Math.min(LETTER_INDEX[from], LETTER_INDEX[to]);
      const b = Math.max(LETTER_INDEX[from], LETTER_INDEX[to]);
      this.selected.clear();
      for (let i = a; i <= b; i++) this.selected.add(LETTERS[i].letter);
      this.syncWall();
    });
    this.el.querySelector('#quiz-start').addEventListener('click', () => this.startQuiz());
  },

  syncWall() {
    this.el.querySelectorAll('.quiz-cell').forEach(btn => {
      btn.classList.toggle('picked', this.selected.has(btn.dataset.letter));
    });
    this.updatePickerState();
  },

  updatePickerState() {
    const n = this.selected.size;
    this.el.querySelector('#quiz-count').textContent = `${App.t('quizSelected')}: ${n}`;
    const start = this.el.querySelector('#quiz-start');
    start.disabled = n < 3;
    start.textContent = n < 3 ? App.t('quizNeed3') : App.t('quizStart');
  },

  /* ===== 考试界面 ===== */
  startQuiz() {
    const pool = [...this.selected];
    const total = Math.min(5, pool.length);
    const types = ['listen', 'match', 'word'];
    this.questions = [];
    const used = new Set();
    for (let i = 0; i < total; i++) {
      // 尽量不重复字母；不够时允许重复
      let avail = pool.filter(l => !used.has(l));
      if (!avail.length) { used.clear(); avail = pool; }
      const l = avail[Math.floor(Math.random() * avail.length)];
      used.add(l);
      this.questions.push({
        type: types[i % types.length],
        letter: l,
      });
    }
    this.qIndex = 0;
    this.score = 0;
    this.renderQuestion();
  },

  distractors(letter, n, lowerCase = false) {
    const pool = LETTERS.map(l => l.letter).filter(l => l !== letter);
    const out = [];
    while (out.length < n && pool.length) {
      const l = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
      out.push(lowerCase ? l.toLowerCase() : l);
    }
    return out;
  },

  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  renderQuestion() {
    const q = this.questions[this.qIndex];
    const total = this.questions.length;
    const n = this.qIndex + 1;
    let prompt = '', options = [], answer = '', speakText = '';

    if (q.type === 'listen') {
      prompt = App.t('quizListenQ').replace('{l}', q.letter);
      speakText = `Where is the letter ${q.letter}?`;
      answer = q.letter;
      options = this.shuffle([q.letter, ...this.distractors(q.letter, 3)]);
    } else if (q.type === 'match') {
      prompt = App.t('quizMatchQ').replace('{L}', q.letter);
      speakText = `Which is the lowercase of ${q.letter}?`;
      answer = q.letter.toLowerCase();
      options = this.shuffle([
        q.letter.toLowerCase(),
        ...this.distractors(q.letter, 3, true),
      ]).slice(0, 3);
      if (!options.includes(answer)) options[0] = answer; // 保底
      options = this.shuffle(options);
    } else {
      const w = letterData(q.letter).words[
        Math.floor(Math.random() * letterData(q.letter).words.length)];
      prompt = App.t('quizWordQ').replace('{w}', `${w.emoji} ${w.en}`);
      speakText = `${w.say}... ${w.say} starts with which letter?`;
      answer = q.letter;
      options = this.shuffle([q.letter, ...this.distractors(q.letter, 2)]);
    }

    this.el.innerHTML = `
      <div class="abc-page quiz-play">
        <div class="quiz-status">
          <span class="quiz-progress-text">${App.t('quizQ').replace('{n}', n).replace('{total}', total)}</span>
          <span class="quiz-stars">${'⭐'.repeat(this.score)}${'☆'.repeat(total - this.score)}</span>
        </div>
        <button class="quiz-prompt" id="quiz-speak">
          <span class="quiz-prompt-text">${prompt}</span>
          <span class="quiz-speak-icon">🔊</span>
        </button>
        <div class="quiz-options">
          ${options.map(o => `
            <button class="quiz-option" data-v="${o}">
              <span class="quiz-opt-char ${o === o.toLowerCase() ? 'opt-lower' : ''}">${o}</span>
            </button>`).join('')}
        </div>
        <div class="quiz-feedback" id="quiz-feedback"></div>
      </div>`;

    setTimeout(() => Speech.speak(speakText), 300);
    this.el.querySelector('#quiz-speak').addEventListener('click', () => {
      Speech.speak(speakText);
    });
    this.el.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => this.answer(btn, btn.dataset.v === answer));
    });
  },

  answer(btn, correct) {
    const fb = this.el.querySelector('#quiz-feedback');
    if (correct) {
      if (!btn.dataset.done) {
        btn.dataset.done = '1';
        this.score++;
      }
      btn.classList.add('correct');
      this.el.querySelectorAll('.quiz-option').forEach(b => b.disabled = true);
      fb.textContent = App.t('quizGreat');
      fb.className = 'quiz-feedback good';
      Speech.praise();
      setTimeout(() => {
        if (this.qIndex + 1 < this.questions.length) {
          this.qIndex++;
          this.renderQuestion();
        } else {
          this.renderResult();
        }
      }, 1100);
    } else {
      btn.classList.add('wrong');
      btn.disabled = true;
      fb.textContent = App.t('quizTryAgain');
      fb.className = 'quiz-feedback retry';
    }
  },

  renderResult() {
    const total = this.questions.length;
    Store.recordQuiz(this.score, total);
    const msg = this.score === total ? App.t('quizPerfect') : App.t('quizGood');
    this.el.innerHTML = `
      <div class="abc-page quiz-result-page">
        <div class="quiz-result-card">
          <div class="result-stars">${'⭐'.repeat(this.score)}${'☆'.repeat(total - this.score)}</div>
          <div class="result-title">${App.t('quizResult').replace('{n}', this.score)}</div>
          <div class="result-msg">${msg}</div>
          <div class="done-btns">
            <button id="quiz-retry" class="tool-btn">${App.t('quizRetry')}</button>
            <button id="quiz-celebrate" class="tool-btn primary">${App.t('quizCelebrate')}</button>
            <button id="quiz-home" class="tool-btn">${App.t('quizHome')}</button>
          </div>
        </div>
      </div>`;
    Speech.speak(this.score === total
      ? 'Perfect! You are amazing!'
      : `You got ${this.score} out of ${total}. Good job!`);
    this.el.querySelector('#quiz-retry').addEventListener('click', () => {
      this.renderPicker();
    });
    this.el.querySelector('#quiz-celebrate').addEventListener('click', () => {
      Router.go('#/fireworks');
      // 等烟花页面渲染完成后开自动秀
      setTimeout(() => FireworksUI.startAuto(), 300);
    });
    this.el.querySelector('#quiz-home').addEventListener('click', () => {
      Router.go('#/home');
    });
  },

  destroy() {
    Speech.stop();
  },
};
