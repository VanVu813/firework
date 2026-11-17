'use strict';

/* ---------- TTS 发音引擎（Web Speech API） ---------- */
const Speech = {
  voice: null,

  _pickVoice() {
    const voices = speechSynthesis.getVoices();
    if (!voices.length) return;
    const prefer = [
      v => /en[-_]US/i.test(v.lang) && /samantha|google us english/i.test(v.name),
      v => /en[-_]US/i.test(v.lang),
      v => /^en/i.test(v.lang),
    ];
    for (const test of prefer) {
      const v = voices.find(test);
      if (v) { this.voice = v; return; }
    }
  },

  _ensureVoice() {
    if (this.voice) return;
    this._pickVoice();
    if (!this.voice) {
      // iOS 上语音列表异步加载，监听变化
      speechSynthesis.onvoiceschanged = () => this._pickVoice();
    }
  },

  speak(text, rate = 0.85) {
    if (!AudioEngine.enabled || !('speechSynthesis' in window)) return;
    this._ensureVoice();
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = rate;
    u.pitch = 1.1;
    if (this.voice) u.voice = this.voice;
    speechSynthesis.speak(u);
  },

  // 读字母名："A"
  letter(l) {
    this.speak(l.toUpperCase());
  },

  // 字母 + 发音示范："A says apple"
  letterSound(l) {
    const item = letterData(l);
    if (item) this.speak(`${item.letter} says ${item.words[0].say}`);
  },

  // 读单词
  word(w) {
    this.speak(w);
  },

  // 鼓励语
  praise() {
    const msgs = ['Great job!', 'Well done!', 'Awesome!', 'Perfect!', 'Good work!'];
    this.speak(msgs[Math.floor(Math.random() * msgs.length)], 0.95);
  },

  stop() {
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  },
};
