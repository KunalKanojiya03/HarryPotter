// Sound effects synthesised with the Web Audio API, so there are no audio files to download.
const Sfx = (() => {
  let ctx = null;

  function ac() {
    if (!Store.get().settings.sfx) return null;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
    } catch (e) {
      return null;
    }
    return ctx;
  }

  function tone(c, freq, t0, dur, type = 'sine', gain = 0.15, freqEnd) {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }

  function noise(c, t0, dur, { from = 800, to = 100, gain = 0.4, type = 'lowpass' } = {}) {
    const len = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const f = c.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(from, t0);
    f.frequency.exponentialRampToValueAtTime(to, t0 + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f).connect(g).connect(c.destination);
    src.start(t0);
  }

  const play = fn => () => { const c = ac(); if (c) fn(c, c.currentTime); };

  return {
    chime: play((c, t) => [784, 988, 1175, 1568].forEach((f, i) => tone(c, f, t + i * 0.07, 0.6, 'sine', 0.1))),
    spell: play((c, t) => {
      tone(c, 300, t, 0.35, 'triangle', 0.12, 1800);
      [1760, 2093, 2637].forEach((f, i) => tone(c, f, t + 0.3 + i * 0.05, 0.3, 'sine', 0.06));
    }),
    whoosh: play((c, t) => noise(c, t, 0.7, { from: 3000, to: 250, gain: 0.35, type: 'bandpass' })),
    rumble: play((c, t) => { noise(c, t, 1.4, { from: 300, to: 40, gain: 0.6 }); tone(c, 55, t, 1.2, 'sawtooth', 0.05, 40); }),
    boom: play((c, t) => { noise(c, t, 0.9, { from: 2500, to: 60, gain: 0.8 }); tone(c, 90, t, 0.7, 'sine', 0.4, 35); }),
    fail: play((c, t) => [392, 370, 349, 294].forEach((f, i) => tone(c, f, t + i * 0.28, i === 3 ? 0.8 : 0.3, 'sawtooth', 0.06))),
    unlock: play((c, t) => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(c, f, t + i * 0.09, 0.7, 'triangle', 0.09))),
  };
})();
