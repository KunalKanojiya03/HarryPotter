// Small shared helpers: dates are handled as local "YYYY-MM-DD" strings.
const U = {
  ymd(d = new Date()) {
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  },
  parse(s) {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
  },
  addDays(s, n) {
    const d = U.parse(s);
    d.setDate(d.getDate() + n);
    return U.ymd(d);
  },
  dow(s) { return U.parse(s).getDay(); },
  id() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4); },
  esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  },
  pick(a) { return a[Math.floor(Math.random() * a.length)]; },
  hash(s) {
    let h = 2166136261;
    for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
    return h >>> 0;
  },
  // Stable choice for a given seed, so text doesn't reshuffle on every render.
  pickSeed(a, seed) { return a[U.hash(seed) % a.length]; },
  fill(t, vars) { return t.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m)); },
  listNames(names, max = 5) {
    const q = names.slice(0, max).map(n => `“${n}”`);
    if (names.length > max) q.push(`${names.length - max} more`);
    if (q.length <= 1) return q[0] || '';
    return q.slice(0, -1).join(', ') + ' and ' + q[q.length - 1];
  },
  fmtTime(t) {
    if (!t) return 'Any time';
    const [h, m] = t.split(':').map(Number);
    return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h >= 12 ? 'pm' : 'am'}`;
  },
  prettyDate(s) {
    return U.parse(s).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  },
  pct(x) { return Math.round(x * 100) + '%'; },
};
