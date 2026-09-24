// Free text-to-speech using the browser's built-in voices (Web Speech API).
// Each character's profile picks the best British voice available and tunes its pitch and speed.
const Voice = (() => {
  const synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
  let voices = [];
  let cache = {};
  let token = 0;

  function refresh() {
    if (!synth) return;
    voices = synth.getVoices();
    cache = {};
  }
  if (synth) {
    refresh();
    synth.addEventListener?.('voiceschanged', refresh);
  }

  // Checked in this order, because "female" also contains "male".
  const FEMALE = ['female', 'woman', 'sonia', 'libby', 'maisie', 'hazel', 'susan', 'kate', 'serena', 'fiona', 'moira', 'martha', 'emily', 'amy', 'bella', 'mia', 'tessa', 'karen', 'samantha', 'victoria', 'catherine', 'stephanie'];
  const MALE = ['male', 'ryan', 'thomas', 'george', 'daniel', 'arthur', 'oliver', 'alfie', 'ethan', 'elliot', 'noah', 'gordon', 'lee', 'rishi', 'james', 'fred'];

  function gender(v) {
    const n = v.name.toLowerCase();
    if (FEMALE.some(f => n.includes(f))) return 'female';
    if (MALE.some(m => n.includes(m))) return 'male';
    return null;
  }

  function lang(v) { return (v.lang || '').replace('_', '-').toLowerCase(); }

  function score(v, p) {
    const n = v.name.toLowerCase();
    const l = lang(v);
    let s = 0;
    let hint = 0;
    (p.hints || []).forEach((h, i) => { if (n.includes(h.toLowerCase())) hint = Math.max(hint, 60 - i * 3); });
    s += hint;
    if (l.startsWith('en-gb')) s += 40;
    else if (/^en-(ie|au|nz)/.test(l)) s += 20;
    else if (l.startsWith('en')) s += 5;
    else s -= 100;
    const g = gender(v);
    if (g && p.gender) s += g === p.gender ? 15 : -25;
    if (/natural|online|neural/i.test(v.name)) s += 10;
    return s;
  }

  function pick(p) {
    if (!synth || !voices.length) return null;
    const key = (p.hints || []).join() + p.gender;
    if (!(key in cache)) {
      let best = null, bs = -Infinity;
      for (const v of voices) {
        const s = score(v, p);
        if (s > bs) { bs = s; best = v; }
      }
      cache[key] = best;
    }
    return cache[key];
  }

  // Chrome cuts off long utterances, so speak sentence-sized chunks one after another.
  function chunk(text) {
    const parts = [];
    const re = /[^.!?…]+[.!?…]*["”’)]*\s*/g;
    let m;
    while ((m = re.exec(text))) parts.push({ start: m.index, end: m.index + m[0].length });
    const merged = [];
    for (const p of parts) {
      const last = merged[merged.length - 1];
      if (last && p.end - last.start < 170) last.end = p.end;
      else merged.push({ ...p });
    }
    return merged.map(p => ({ start: p.start, text: text.slice(p.start, p.end) }));
  }

  // onBoundary(charIndex, isWord) lets the Howler reveal words as they're spoken.
  function speak(text, p, { onBoundary, onEnd, force } = {}) {
    const enabled = force || Store.get().settings.voice;
    if (!synth || !enabled) { onEnd?.(); return false; }
    stop();
    const my = ++token;
    const chunks = chunk(text);
    const v = pick(p);
    let i = 0;
    const next = () => {
      if (my !== token) return;
      if (i >= chunks.length) { onEnd?.(); return; }
      const c = chunks[i++];
      const u = new SpeechSynthesisUtterance(c.text);
      if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'en-GB';
      u.pitch = p.pitch ?? 1;
      u.rate = p.rate ?? 1;
      u.onboundary = e => { if (my === token && e.name !== 'sentence') onBoundary?.(c.start + e.charIndex, true); };
      u.onend = () => { if (my === token) { onBoundary?.(c.start + c.text.length, false); next(); } };
      u.onerror = () => { if (my === token) next(); };
      synth.speak(u);
    };
    next();
    return true;
  }

  function stop() {
    token++;
    synth?.cancel();
  }

  function englishVoices() {
    return voices
      .filter(v => lang(v).startsWith('en'))
      .sort((a, b) => (lang(b).startsWith('en-gb') - lang(a).startsWith('en-gb')) || a.name.localeCompare(b.name));
  }

  return { speak, stop, pick, englishVoices, supported: !!synth };
})();
