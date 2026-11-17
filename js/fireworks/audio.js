'use strict';

// 程序化音效：Web Audio API 生成，无需音频文件
const AudioEngine = {
  enabled: true,
  volume: 0.5,
  _ctx: null,

  _ensureCtx() {
    if (!this._ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this._ctx = new AC();
    }
    if (this._ctx.state === 'suspended') this._ctx.resume();
    return this._ctx;
  },

  _noiseBuffer(ctx, duration) {
    const buf = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  },

  // 发射嗖声：上升扫频
  playLaunch() {
    if (!this.enabled) return;
    const ctx = this._ensureCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.5);
    gain.gain.setValueAtTime(0.12 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.6);
  },

  // 爆炸声：噪声爆发 + 低频闷响，big 为大型烟花
  playExplode(big = false) {
    if (!this.enabled) return;
    const ctx = this._ensureCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const dur = big ? 0.9 : 0.5;
    const vol = (big ? 0.5 : 0.32) * this.volume;

    // 噪声层
    const noise = ctx.createBufferSource();
    noise.buffer = this._noiseBuffer(ctx, dur);
    const nFilter = ctx.createBiquadFilter();
    nFilter.type = 'lowpass';
    nFilter.frequency.setValueAtTime(big ? 1200 : 2000, t);
    nFilter.frequency.exponentialRampToValueAtTime(120, t + dur);
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(vol, t);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    noise.connect(nFilter).connect(nGain).connect(ctx.destination);
    noise.start(t);

    // 低频层
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(big ? 110 : 150, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + dur * 0.8);
    const oGain = ctx.createGain();
    oGain.gain.setValueAtTime(vol * 0.9, t);
    oGain.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.8);
    osc.connect(oGain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur);
  },
};
