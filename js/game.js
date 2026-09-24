// Game rules: scheduling, completing and failing tasks, creatures, streaks, spells, House Cup.
const Game = (() => {
  const S = () => Store.get();
  const C = window.HP;
  const GOOD_DAY = 0.8; // share of a day's tasks needed to keep a streak alive

  function isScheduled(t, day) {
    if (t.archivedOn && day >= t.archivedOn) return false;
    if (t.repeat === 'once') return t.date === day;
    if (day < t.createdOn) return false;
    const dow = U.dow(day);
    if (t.repeat === 'weekdays') return dow >= 1 && dow <= 5;
    if (t.repeat === 'weekends') return dow === 0 || dow === 6;
    return true;
  }

  function tasksFor(day) {
    return S().tasks
      .filter(t => isScheduled(t, day))
      .sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99') || a.title.localeCompare(b.title));
  }

  function entry(taskId, day) { return (S().log[day] || {})[taskId]; }

  function setEntry(t, day, e) {
    (S().log[day] ||= {})[t.id] = { ...e, title: t.title, area: t.area, time: t.time, points: t.points };
  }

  function dueDate(t, day) {
    const [h, m] = t.time.split(':').map(Number);
    const d = U.parse(day);
    d.setHours(h, m, 0, 0);
    return d;
  }

  // ---------- Completing ----------
  function complete(taskId, day = U.ymd()) {
    const t = S().tasks.find(x => x.id === taskId);
    if (!t) return null;
    const prev = entry(taskId, day);
    if (prev && prev.status === 'done') return null;
    const late = !!(prev && prev.status === 'missed');
    const pts = late ? Math.ceil(t.points / 2) : t.points;
    setEntry(t, day, { status: 'done', at: Date.now(), late });
    S().points += pts;
    const hit = attack(late ? { taskId, day } : null);
    const patronus = checkPatronus();
    const unlocked = checkUnlocks();
    Store.save();
    return { task: t, pts, late, hit, patronus, unlocked };
  }

  function attackSpell(c) {
    const u = S().unlocked;
    if (c.type === 'boggart' && u.includes('riddikulus')) return 'Riddikulus';
    if (c.type === 'dementor' && u.includes('patronum')) return 'Expecto Patronum';
    for (const id of ['stupefy', 'expelliarmus', 'wingardium', 'lumos']) {
      if (u.includes(id)) return C.spells.find(s => s.id === id).name;
    }
    return 'A burst of red sparks';
  }

  // Each completion hits the oldest creature. Redeeming a missed task banishes its own creature outright.
  function attack(redeem) {
    const cs = S().creatures;
    if (!cs.length) return null;
    let target = redeem && cs.find(c => c.taskId === redeem.taskId && c.day === redeem.day);
    const direct = !!target;
    target = target || cs[0];
    const spell = attackSpell(target);
    const dmg = direct ? target.hp : 1;
    target.hp = Math.max(0, target.hp - dmg);
    let killed = false, bonus = 0;
    if (target.hp === 0) {
      killed = true;
      S().creatures = cs.filter(c => c !== target);
      S().defeated[target.type] = (S().defeated[target.type] || 0) + 1;
      bonus = C.creatures[target.type].hp * 3;
      S().points += bonus;
    }
    return { creature: target, info: C.creatures[target.type], spell, dmg, killed, bonus };
  }

  // ---------- Failing ----------
  function spawn(type, t, day) {
    const hp = C.creatures[type].hp;
    const c = { id: U.id(), type, hp, maxHp: hp, taskId: t ? t.id : null, taskTitle: t ? t.title : 'an overrun dungeon', day, born: Date.now() };
    S().creatures.push(c);
    return c;
  }

  function fail(taskId, day = U.ymd(), auto = false) {
    const t = S().tasks.find(x => x.id === taskId);
    if (!t || entry(taskId, day)) return null;
    const res = { task: t, day, auto, shielded: false, creature: null, boss: null, lost: 0 };
    setEntry(t, day, { status: 'missed', at: Date.now(), auto });
    if (S().patronus > 0) {
      S().patronus--;
      res.shielded = true;
    } else {
      res.lost = Math.min(S().points, Math.ceil(t.points / 2));
      S().points -= res.lost;
      res.creature = spawn(C.areaCreature[t.area] || 'boggart', t, day);
      if (S().creatures.length >= 5 && !S().creatures.some(c => c.type === 'horntail')) {
        res.boss = spawn('horntail', null, day);
      }
    }
    Store.save();
    return res;
  }

  // ---------- Clock: overdue tasks, overnight misses, reminders ----------
  function processTime(now = new Date()) {
    const st = S();
    const today = U.ymd(now);
    const out = { overnight: [], due: [], reminders: [], drained: 0 };
    if (!st.profile) return out;

    if (st.lastProcessed && st.lastProcessed < today) {
      const floor = U.addDays(today, -14);
      for (let d = st.lastProcessed < floor ? floor : st.lastProcessed; d < today; d = U.addDays(d, 1)) {
        for (const t of tasksFor(d)) {
          if (entry(t.id, d)) continue;
          // Tasks added after their time on that same day don't count against you.
          if (t.time && t.createdOn === d && t.createdAt > dueDate(t, d).getTime()) continue;
          const r = fail(t.id, d, true);
          if (r) out.overnight.push(r);
        }
      }
      // Creatures feed on house points each night.
      out.drained = Math.min(st.points, st.creatures.length);
      st.points -= out.drained;
    }
    st.lastProcessed = today;

    const grace = (st.settings.grace || 0) * 60000;
    for (const t of tasksFor(today)) {
      if (!t.time || entry(t.id, today)) continue;
      const due = dueDate(t, today);
      if (t.createdAt > due.getTime()) continue;
      if (now - due > grace) {
        const r = fail(t.id, today, true);
        if (r) out.due.push(r);
      } else if (now >= due && !st.notified[today + t.id]) {
        st.notified[today + t.id] = 1;
        out.reminders.push(t);
      }
    }
    for (const k of Object.keys(st.notified)) if (k.slice(0, 10) < today) delete st.notified[k];
    Store.save();
    return out;
  }

  // ---------- Streaks, spells, Patronus ----------
  function rateFor(day) {
    if (day === U.ymd()) {
      const ts = tasksFor(day);
      if (!ts.length) return null;
      return ts.filter(t => entry(t.id, day)?.status === 'done').length / ts.length;
    }
    const v = Object.values(S().log[day] || {});
    if (!v.length) return null;
    return v.filter(x => x.status === 'done').length / v.length;
  }

  function streak() {
    const today = U.ymd();
    let s = 0;
    const tr = rateFor(today);
    if (tr !== null && tr >= GOOD_DAY) s++;
    const keys = Object.keys(S().log);
    if (!keys.length) return s;
    const earliest = keys.reduce((a, b) => (a < b ? a : b));
    for (let d = U.addDays(today, -1); d >= earliest; d = U.addDays(d, -1)) {
      const r = rateFor(d);
      if (r === null) continue; // rest days don't break a streak
      if (r >= GOOD_DAY) s++;
      else break;
    }
    return s;
  }

  function checkPatronus() {
    const s = streak();
    const today = U.ymd();
    if (s > 0 && s % 7 === 0 && !S().patronusAwarded.includes(today)) {
      S().patronus++;
      S().patronusAwarded = [...S().patronusAwarded.slice(-20), today];
      return true;
    }
    return false;
  }

  function stats() {
    let totalDone = 0, lateDone = 0, maxInDay = 0;
    for (const entries of Object.values(S().log)) {
      let n = 0;
      for (const e of Object.values(entries)) {
        if (e.status !== 'done') continue;
        totalDone++; n++;
        if (e.late) lateDone++;
      }
      maxInDay = Math.max(maxInDay, n);
    }
    const cur = streak();
    S().bestStreak = Math.max(S().bestStreak || 0, cur);
    const defeated = Object.values(S().defeated).reduce((a, b) => a + b, 0);
    return { totalDone, lateDone, maxInDay, defeated, defeatedTypes: S().defeated, streak: cur, bestStreak: S().bestStreak };
  }

  function checkUnlocks() {
    const st = stats();
    const out = [];
    for (const sp of C.spells) {
      if (!S().unlocked.includes(sp.id) && sp.check(st)) {
        S().unlocked.push(sp.id);
        out.push(sp);
      }
    }
    return out;
  }

  // ---------- Flavour ----------
  function prophet() {
    const st = S();
    const today = U.ymd();
    const vars = { name: st.profile.name, house: C.houses[st.profile.house].name, n: st.creatures.length };
    const r = rateFor(U.addDays(today, -1));
    let pool;
    if (st.creatures.length >= 3) pool = C.prophet.overrun;
    else if (r === null) pool = C.prophet.fresh;
    else if (r >= 0.9) pool = C.prophet.great;
    else if (r >= 0.6) pool = C.prophet.good;
    else pool = C.prophet.bad;
    return { headline: U.fill(U.pickSeed(pool, today), vars), quote: U.pickSeed(C.quotes, today + 'q') };
  }

  // Rival houses earn a steady, repeatable amount each day so there's always a race.
  function houseCup() {
    const st = S();
    const start = st.profile.createdOn;
    const days = Math.max(0, Math.round((U.parse(U.ymd()) - U.parse(start)) / 864e5));
    const hourFrac = new Date().getHours() / 24;
    return Object.keys(C.houses).map(h => {
      if (h === st.profile.house) return { house: h, pts: st.points, you: true };
      let seed = U.hash(h + start), pts = 0;
      for (let i = 0; i <= days; i++) {
        seed = (Math.imul(seed, 1103515245) + 12345) >>> 0;
        const dayPts = 12 + (seed % 38);
        pts += i === days ? Math.round(dayPts * hourFrac) : dayPts;
      }
      return { house: h, pts };
    });
  }

  return { isScheduled, tasksFor, entry, complete, fail, processTime, rateFor, streak, stats, checkUnlocks, prophet, houseCup };
})();
