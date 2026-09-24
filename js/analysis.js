// The Pensieve: finds patterns in your history, gives O.W.L. grades, and writes the Headmaster's letter.
// It runs entirely on your device. If Chrome's free built-in AI (Gemini Nano) is available,
// the letter is written by that model; otherwise it's composed from templates.
const Pensieve = (() => {
  const C = window.HP;
  const GRADES = [[0.9, 'O', 'Outstanding'], [0.75, 'E', 'Exceeds Expectations'], [0.6, 'A', 'Acceptable'], [0.45, 'P', 'Poor'], [0.25, 'D', 'Dreadful'], [-1, 'T', 'Troll']];
  const DAYS = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];

  function grade(r) {
    const g = GRADES.find(g => r >= g[0]);
    return { letter: g[1], name: g[2] };
  }

  function tally(from, to) {
    const out = { d: 0, n: 0, late: 0, areas: {}, dows: Array.from({ length: 7 }, () => ({ d: 0, n: 0 })), slots: { morning: { d: 0, n: 0 }, afternoon: { d: 0, n: 0 }, evening: { d: 0, n: 0 } }, tasks: {} };
    for (const [day, entries] of Object.entries(Store.get().log)) {
      if (day < from || day > to) continue;
      const w = U.dow(day);
      for (const e of Object.values(entries)) {
        const ok = e.status === 'done';
        const add = x => { x.n++; if (ok) x.d++; };
        add(out);
        if (e.late) out.late++;
        add(out.areas[e.area] ||= { d: 0, n: 0 });
        add(out.dows[w]);
        if (e.time) {
          const h = +e.time.slice(0, 2);
          add(out.slots[h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening']);
        }
        const t = out.tasks[e.title] ||= { d: 0, n: 0, miss: 0 };
        add(t);
        if (!ok) t.miss++;
      }
    }
    return out;
  }

  const rate = x => (x && x.n ? x.d / x.n : null);

  function report(days = 7) {
    const st = Store.get();
    const today = U.ymd();
    const from = U.addDays(today, -(days - 1));
    const cur = tally(from, today);
    const prev = tally(U.addDays(from, -days), U.addDays(from, -1));
    const name = st.profile.name;

    const areas = Object.entries(C.areas).map(([key, area]) => {
      const c = cur.areas[key] || { d: 0, n: 0 };
      const r = rate(c), pr = rate(prev.areas[key]);
      const prof = C.professors[area.prof];
      const a = { key, area, prof, done: c.d, total: c.n, rate: r, prevRate: pr, trend: r !== null && pr !== null ? r - pr : null, grade: r === null ? null : grade(r) };
      if (r !== null) {
        const tier = r >= 0.75 ? 'good' : r >= 0.45 ? 'mid' : 'bad';
        a.comment = U.fill(U.pickSeed(prof.grades[tier], key + today + days), { pct: U.pct(r), area: area.label, name });
      }
      return a;
    });

    const overall = { done: cur.d, total: cur.n, rate: rate(cur), prevRate: rate(prev), late: cur.late };
    overall.grade = overall.rate === null ? null : grade(overall.rate);
    return { days, areas, overall, insights: insights(cur, areas, overall), streak: Game.streak(), bestStreak: st.bestStreak || 0, creatures: st.creatures.length };
  }

  function insights(cur, areas, overall) {
    const st = Store.get();
    const out = [];
    if (!cur.n) return [{ icon: '🌫️', text: 'The Pensieve is empty for this period. Complete (or miss) a few lessons and the memories will begin to swirl.' }];

    let t = `You completed ${cur.d} of ${cur.n} tasks (${U.pct(overall.rate)}).`;
    if (overall.prevRate !== null) {
      const diff = overall.rate - overall.prevRate;
      t += Math.abs(diff) < 0.03 ? ' That is about the same as the period before.'
        : diff > 0 ? ` That is ${U.pct(diff)} better than the period before. Splendid!`
        : ` That is ${U.pct(-diff)} worse than the period before.`;
    }
    out.push({ icon: '📈', text: t });

    const rated = areas.filter(a => a.total >= 2).sort((a, b) => b.rate - a.rate);
    if (rated.length >= 2 && rated[0].rate > rated[rated.length - 1].rate) {
      const best = rated[0], worst = rated[rated.length - 1];
      out.push({ icon: '🏆', text: `Strongest subject: ${best.area.subject} (${best.area.label}) at ${U.pct(best.rate)}.` });
      out.push({ icon: '⚠️', text: `Needs attention: ${worst.area.subject} (${worst.area.label}) at ${U.pct(worst.rate)}. ${worst.prof.name} has noticed.` });
    }

    const dws = cur.dows.map((x, i) => ({ i, r: rate(x), n: x.n })).filter(x => x.n >= 2).sort((a, b) => b.r - a.r);
    if (dws.length >= 3 && dws[0].r - dws[dws.length - 1].r >= 0.2) {
      const b = dws[0], w = dws[dws.length - 1];
      out.push({ icon: '📅', text: `You shine on ${DAYS[b.i]} (${U.pct(b.r)}) but struggle on ${DAYS[w.i]} (${U.pct(w.r)}). Plan lighter ${DAYS[w.i]}, or prepare the night before.` });
    }

    const sl = Object.entries(cur.slots).filter(([, x]) => x.n >= 2).map(([k, x]) => ({ k, r: rate(x) })).sort((a, b) => b.r - a.r);
    if (sl.length >= 2 && sl[0].r - sl[sl.length - 1].r >= 0.2) {
      const b = sl[0], w = sl[sl.length - 1];
      out.push({ icon: '🕰️', text: `Your magic is strongest in the ${b.k} (${U.pct(b.r)}) and weakest in the ${w.k} (${U.pct(w.r)}). Move your hardest tasks to the ${b.k}.` });
    }

    const miss = Object.entries(cur.tasks).filter(([, x]) => x.miss >= 2).sort((a, b) => b[1].miss - a[1].miss)[0];
    if (miss) out.push({ icon: '🎭', text: `“${miss[0]}” has escaped you ${miss[1].miss} times. It may be a Boggart in disguise. Try making it smaller, or pair it with something you already do every day.` });

    if (cur.late) out.push({ icon: '🗝️', text: `You redeemed ${cur.late} missed task${cur.late > 1 ? 's' : ''} by finishing late. That is the true spirit of ${C.houses[st.profile.house].name}.` });

    const s = Game.streak();
    if (s >= 2) out.push({ icon: '🔥', text: `You are on a ${s}-day streak. ${s >= 7 ? 'Your Patronus shines brightly!' : `${7 - (s % 7)} more good day${7 - (s % 7) > 1 ? 's' : ''} earns a Patronus shield.`}` });
    if (st.creatures.length >= 3) out.push({ icon: '🕯️', text: `${st.creatures.length} creatures lurk in your dungeon, eating ${st.creatures.length} points every night. Finish a few easy tasks to fight them off.` });
    return out;
  }

  // Template letter. Works everywhere, offline.
  function letter(rep) {
    const st = Store.get();
    const name = st.profile.name;
    const house = C.houses[st.profile.house].name;
    const o = rep.overall;
    if (o.rate === null) {
      return `Dear ${name},\n\nThe Pensieve holds no memories of these ${rep.days} days yet. Fill your timetable, keep a few small promises to yourself, and return. I shall be waiting, as I usually am, with a bowl of lemon drops.\n\nYours, most sincerely,\nAlbus Dumbledore`;
    }
    const lines = [`Dear ${name},`, ''];
    const g = o.grade.letter;
    lines.push(
      g === 'O' || g === 'E' ? `I have been gazing into the Pensieve at your last ${rep.days} days, and I confess I am delighted. ${U.pct(o.rate)} of your tasks, done. ${house} is fortunate to have you.`
        : g === 'A' ? `I have been gazing into the Pensieve at your last ${rep.days} days. You kept ${U.pct(o.rate)} of your promises to yourself, a respectable foundation on which greater things are built.`
        : `I have been gazing into the Pensieve at your last ${rep.days} days. Only ${U.pct(o.rate)} of your tasks were completed, and I sense the days have been heavier than you would like.`
    );
    const rated = rep.areas.filter(a => a.total >= 2).sort((a, b) => b.rate - a.rate);
    if (rated.length >= 2) {
      const best = rated[0], worst = rated[rated.length - 1];
      lines.push('', `Your finest work is in ${best.area.subject}. ${best.prof.name} speaks well of it. Your ${worst.area.label.toLowerCase()}, however, has been drifting. Perhaps make those tasks smaller, so small they are almost impossible to refuse, and do them at the time of day your magic runs strongest.`);
    }
    const tip = rep.insights.find(i => ['📅', '🕰️', '🎭'].includes(i.icon));
    if (tip) lines.push('', `One more thing the Pensieve showed me: ${tip.text.charAt(0).toLowerCase() + tip.text.slice(1)}`);
    lines.push('', rep.streak >= 3 ? `Your ${rep.streak}-day streak tells me you already know the secret: it is not the grand gestures but the small, repeated ones that change a life.` : `Remember that it is not the grand gestures but the small, repeated ones that change a life. Tomorrow, begin with the easiest task, and let momentum do the rest.`);
    lines.push('', 'With great affection,', 'Albus Dumbledore');
    return lines.join('\n');
  }

  // ---------- Optional: Chrome's free, on-device AI ----------
  async function aiStatus() {
    try {
      if (!('LanguageModel' in self)) return 'unsupported';
      return await LanguageModel.availability({ expectedInputs: [{ type: 'text', languages: ['en'] }], expectedOutputs: [{ type: 'text', languages: ['en'] }] });
    } catch (e) {
      return 'unsupported';
    }
  }

  async function aiLetter(rep, onProgress) {
    const st = Store.get();
    const system = 'You are Albus Dumbledore, the wise, warm and gently whimsical Headmaster of Hogwarts. ' +
      'You write a short personal letter (130 to 190 words) to a student about their daily habits, based on data you are given. ' +
      'Be specific about the numbers, kind but honest, and give two or three concrete, practical suggestions. ' +
      'Use magical-world metaphors lightly. No lists, no markdown, no headings. Begin with "Dear <name>," and sign off as "Albus Dumbledore".';
    const data = {
      student: st.profile.name,
      house: C.houses[st.profile.house].name,
      period_days: rep.days,
      overall: { done: rep.overall.done, total: rep.overall.total, rate: rep.overall.rate, previous_period_rate: rep.overall.prevRate, completed_late: rep.overall.late },
      areas: rep.areas.filter(a => a.total).map(a => ({ area: a.area.label, subject: a.area.subject, professor: a.prof.name, done: a.done, total: a.total, owl_grade: a.grade.name })),
      patterns: rep.insights.map(i => i.text),
      current_streak_days: rep.streak,
      creatures_in_dungeon: rep.creatures,
    };
    const session = await LanguageModel.create({
      initialPrompts: [{ role: 'system', content: system }],
      expectedInputs: [{ type: 'text', languages: ['en'] }],
      expectedOutputs: [{ type: 'text', languages: ['en'] }],
      monitor(m) { m.addEventListener('downloadprogress', e => onProgress?.(e.loaded)); },
    });
    try {
      const text = await session.prompt(`Here is the student's record:\n${JSON.stringify(data, null, 1)}\n\nWrite the letter now.`);
      return text.replace(/[*#_]/g, '').trim();
    } finally {
      session.destroy?.();
    }
  }

  return { report, letter, aiStatus, aiLetter, grade };
})();
