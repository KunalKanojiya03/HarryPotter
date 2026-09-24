// The user interface: onboarding (Sorting Hat), timetable, dungeon, O.W.L.s, spellbook and settings.
(() => {
  const C = window.HP;
  const $ = (s, r = document) => r.querySelector(s);
  const S = () => Store.get();
  const view = $('#view');

  let tab = 'today';
  let owlDays = 7;
  let editingId = null;
  let lastLetter = '';
  let sorting = null;

  // ---------- Ambience ----------
  function ambience() {
    let stars = '';
    for (let i = 0; i < 90; i++) {
      const size = (Math.random() * 2 + 0.6).toFixed(1);
      stars += `<i style="left:${(Math.random() * 100).toFixed(1)}%;top:${(Math.random() * 100).toFixed(1)}%;width:${size}px;height:${size}px;animation-delay:${(Math.random() * 5).toFixed(1)}s"></i>`;
    }
    $('#sky').innerHTML = stars;
    let candles = '';
    for (let i = 0; i < 9; i++) {
      candles += `<div class="candle" style="left:${(4 + Math.random() * 92).toFixed(1)}%;top:${(4 + Math.random() * 45).toFixed(1)}%;--s:${(0.6 + Math.random() * 0.6).toFixed(2)};animation-delay:-${(Math.random() * 6).toFixed(1)}s;animation-duration:${(5 + Math.random() * 4).toFixed(1)}s"><span class="flame"></span></div>`;
    }
    $('#candles').innerHTML = candles;
  }

  function theme() {
    const h = S().profile && C.houses[S().profile.house];
    if (!h) return;
    document.documentElement.style.setProperty('--house', h.primary);
    document.documentElement.style.setProperty('--accent', h.accent);
  }

  // ---------- Feedback: toasts, sparkles, floating points ----------
  function toast(html, { cls = '', undo, ms = 4500 } = {}) {
    const el = document.createElement('div');
    el.className = `toast ${cls}`;
    el.innerHTML = `<div>${html}</div>${undo ? '<button class="btn ghost small">Undo</button>' : ''}`;
    $('#toasts').appendChild(el);
    const kill = () => { el.classList.add('out'); setTimeout(() => el.remove(), 300); };
    if (undo) el.querySelector('button').onclick = () => { undo(); kill(); };
    setTimeout(kill, undo ? 6000 : ms);
  }

  function sparkles(x, y, color = '#ffd700') {
    for (let i = 0; i < 16; i++) {
      const s = document.createElement('span');
      s.className = 'sparkle';
      const a = Math.random() * Math.PI * 2, d = 40 + Math.random() * 60;
      s.style.cssText = `left:${x}px;top:${y}px;--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px;--c:${color}`;
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 900);
    }
  }

  function floatText(x, y, text) {
    const el = document.createElement('div');
    el.className = 'float-pts';
    el.textContent = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1600);
  }

  function spellFlash(color) {
    const el = document.createElement('div');
    el.className = 'spell-flash';
    el.style.setProperty('--c', color);
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 900);
  }

  function patronusMoment() {
    const el = document.createElement('div');
    el.className = 'patronus-moment';
    el.innerHTML = '<div class="stag">🦌</div><div class="patronus-text">Expecto Patronum!</div><div class="patronus-sub">A 7-day streak! Your Patronus will shield you from one missed task.</div>';
    document.body.appendChild(el);
    Sfx.unlock();
    Voice.speak('Expecto Patronum!', C.professors.dumbledore.voice);
    setTimeout(() => el.remove(), 3600);
  }

  const vars = t => ({ name: S().profile.name, house: C.houses[S().profile.house].name, task: t ? `“${t.title}”` : '' });

  // ---------- Header & tabs ----------
  function renderHeader() {
    const st = S();
    const h = C.houses[st.profile.house];
    $('#topbar').innerHTML = `
      <div class="crest" title="${h.name}">${h.crest}</div>
      <div class="who"><div class="who-name">${U.esc(st.profile.name)}</div><div class="who-house">House ${h.name}</div></div>
      <div class="stats">
        <span class="stat" title="House points">🏆 <b>${st.points}</b></span>
        <span class="stat" title="Day streak">🔥 <b>${Game.streak()}</b></span>
        <span class="stat" title="Patronus shields">🦌 <b>${st.patronus}</b></span>
        <button class="stat icon-btn" data-action="toggle-voice" title="Voices on or off" aria-label="Toggle voices">${st.settings.voice ? '🔊' : '🔇'}</button>
      </div>`;
    document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
    const n = st.creatures.length;
    const badge = $('#tabs [data-tab="dungeon"] .badge');
    badge.textContent = n;
    badge.hidden = !n;
  }

  function render() {
    if (!S().profile) return;
    renderHeader();
    const views = { today: viewToday, dungeon: viewDungeon, owl: viewOwl, spells: viewSpells, settings: viewSettings };
    view.innerHTML = views[tab]();
    if (tab === 'owl') updateAiStatus();
    if (tab === 'settings') fillVoiceInfo();
  }

  // ---------- Timetable ----------
  function viewToday() {
    const today = U.ymd();
    const tasks = Game.tasksFor(today);
    const done = tasks.filter(t => Game.entry(t.id, today)?.status === 'done').length;
    const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
    const p = Game.prophet();
    return `
      <section class="card prophet">
        <div class="prophet-top"><span>${U.prettyDate(today)}</span><span>One Knut</span></div>
        <h1 class="prophet-title">The Daily Prophet</h1>
        <h2 class="prophet-headline">${U.esc(p.headline)}</h2>
        <p class="prophet-quote">“${U.esc(p.quote)}”</p>
      </section>
      <section class="card">
        <div class="row-between"><h2>📜 Today's Timetable</h2><span class="muted">${done}/${tasks.length} complete</span></div>
        <div class="progress" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct}%"></span></div>
        ${tasks.length ? `<ul class="tasks">${tasks.map(t => taskRow(t, today)).join('')}</ul>` : '<p class="empty">Your timetable is empty. Add your first lesson below. Every great witch or wizard started with just one.</p>'}
        ${tasks.length && done === tasks.length ? '<p class="perfect">✨ Mischief managed! Every task complete today. ✨</p>' : ''}
      </section>
      <section class="card">
        <h2>✒️ Add to Timetable</h2>
        ${taskForm()}
      </section>
      <section class="card">
        <details ${editingId ? 'open' : ''}>
          <summary><h2>📚 All Lessons (${S().tasks.filter(t => !t.archivedOn).length})</h2></summary>
          ${manageList()}
        </details>
      </section>
      <section class="card">${houseCupHtml()}</section>`;
  }

  function taskRow(t, day) {
    const e = Game.entry(t.id, day);
    const a = C.areas[t.area];
    const p = C.professors[a.prof];
    const status = e?.status || 'pending';
    let actions;
    if (status === 'pending') {
      actions = `<button class="btn ok round" data-action="done" data-id="${t.id}" title="Done!" aria-label="Mark done">✔</button>
                 <button class="btn bad round" data-action="fail" data-id="${t.id}" title="I failed this one" aria-label="Mark failed">✘</button>`;
    } else if (status === 'missed') {
      actions = `<button class="btn ghost small" data-action="done" data-id="${t.id}" title="Complete it late for half points and banish its creature">🗝️ Redeem</button>`;
    } else {
      actions = `<span class="done-mark">${e.late ? 'Redeemed' : 'Done'} ✨</span>`;
    }
    return `<li class="task ${status}">
      <div class="task-time">${U.fmtTime(t.time)}</div>
      <div class="task-main">
        <div class="task-title">${U.esc(t.title)}</div>
        <div class="task-meta">${a.icon} ${a.subject} · ${p.name} · ${t.points} pts</div>
      </div>
      <div class="task-actions">${actions}</div>
    </li>`;
  }

  const REPEATS = [['daily', 'Every day'], ['weekdays', 'Weekdays'], ['weekends', 'Weekends'], ['once', 'Just once']];
  const DIFFICULTY = [[5, 'Easy · 5 pts'], [10, 'Normal · 10 pts'], [20, 'Hard · 20 pts'], [30, 'N.E.W.T. · 30 pts']];

  function taskForm(edit) {
    const t = edit || { title: '', area: 'learning', time: '', repeat: 'daily', points: 10, date: U.ymd() };
    const opts = (list, cur) => list.map(([v, l]) => `<option value="${v}" ${String(v) === String(cur) ? 'selected' : ''}>${l}</option>`).join('');
    return `<form class="task-form" data-form="${edit ? 'edit' : 'add'}" ${edit ? `data-id="${t.id}"` : ''}>
      <label>Task<input name="title" required maxlength="80" placeholder="e.g. Read 20 pages" value="${U.esc(t.title)}"></label>
      <label>Subject<select name="area">${Object.entries(C.areas).map(([k, a]) => `<option value="${k}" ${k === t.area ? 'selected' : ''}>${a.icon} ${a.label} (${a.subject})</option>`).join('')}</select></label>
      <div class="form-row">
        <label>Time<input type="time" name="time" value="${t.time || ''}"></label>
        <label>Repeats<select name="repeat">${opts(REPEATS, t.repeat)}</select></label>
        <label class="once-date" ${t.repeat === 'once' ? '' : 'hidden'}>Date<input type="date" name="date" value="${t.date || U.ymd()}"></label>
        <label>Difficulty<select name="points">${opts(DIFFICULTY, t.points)}</select></label>
      </div>
      <div class="form-actions">
        <button class="btn primary" type="submit">${edit ? 'Save changes' : '🪶 Add to timetable'}</button>
        ${edit ? '<button class="btn ghost" type="button" data-action="cancel-edit">Cancel</button>' : ''}
      </div>
    </form>`;
  }

  function manageList() {
    const ts = S().tasks.filter(t => !t.archivedOn);
    if (!ts.length) return '<p class="empty">No lessons yet.</p>';
    const rep = t => (t.repeat === 'once' ? `Once on ${t.date}` : REPEATS.find(r => r[0] === t.repeat)[1]);
    return `<ul class="manage">${ts.map(t => (t.id === editingId
      ? `<li class="editing">${taskForm(t)}</li>`
      : `<li>
          <div><b>${U.esc(t.title)}</b><div class="task-meta">${C.areas[t.area].icon} ${C.areas[t.area].subject} · ${rep(t)} · ${U.fmtTime(t.time)} · ${t.points} pts</div></div>
          <div class="task-actions">
            <button class="btn ghost small" data-action="edit" data-id="${t.id}">Edit</button>
            <button class="btn ghost small" data-action="delete" data-id="${t.id}">Evanesco</button>
          </div>
        </li>`)).join('')}</ul>`;
  }

  function houseCupHtml() {
    const rows = Game.houseCup().sort((a, b) => b.pts - a.pts);
    const max = Math.max(1, ...rows.map(r => r.pts));
    return `<h2>🏆 House Cup Standings</h2>
      <div class="cup">${rows.map((r, i) => {
        const h = C.houses[r.house];
        return `<div class="cup-row ${r.you ? 'you' : ''}">
          <span class="cup-name">${i === 0 ? '👑 ' : ''}${h.crest} ${h.name}${r.you ? ' (you)' : ''}</span>
          <div class="cup-bar"><span style="width:${(r.pts / max) * 100}%;background:${h.primary}"></span></div>
          <b>${r.pts}</b>
        </div>`;
      }).join('')}</div>`;
  }

  // ---------- Dungeon ----------
  function viewDungeon() {
    const st = S();
    const cs = st.creatures;
    const defeated = Object.values(st.defeated).reduce((a, b) => a + b, 0);
    return `
      <section class="card dungeon">
        <h2>🕯️ The Dungeons</h2>
        <p class="dim">Each missed task lets a creature loose down here. Every night they feed on your house points (−1 each). Completing any task casts a spell at the oldest creature, and redeeming a missed task banishes its creature instantly.</p>
        <div class="dungeon-stats">
          <span>Lurking: <b>${cs.length}</b></span><span>Defeated: <b>${defeated}</b></span><span>Patronus shields: <b>${st.patronus}</b></span>
        </div>
        ${cs.length ? `<div class="creatures">${cs.map((c, i) => {
          const info = C.creatures[c.type];
          return `<div class="creature c-${c.type}">
            ${i === 0 ? '<div class="target">🎯 Next target</div>' : ''}
            <div class="c-emoji">${info.emoji}</div>
            <div class="c-name">${info.name}</div>
            <div class="hp"><span style="width:${(c.hp / c.maxHp) * 100}%"></span></div>
            <div class="c-hp">${c.hp}/${c.maxHp} HP</div>
            <div class="c-from">Born from: ${U.esc(c.taskTitle)}</div>
            <div class="c-taunt">${info.taunt}</div>
          </div>`;
        }).join('')}</div>` : '<div class="empty-dungeon"><div>🕸️</div><p>The dungeons are quiet… for now.</p></div>'}
      </section>
      <section class="card">
        <h2>📖 Bestiary</h2>
        <ul class="bestiary">${Object.entries(C.areaCreature).map(([area, type]) => {
          const info = C.creatures[type];
          return `<li><span class="b-emoji">${info.emoji}</span><div><b>${info.name}</b> <span class="muted">(${info.hp} HP)</span><div class="task-meta">Appears when you miss ${C.areas[area].label.toLowerCase()} tasks. ${info.taunt}</div></div></li>`;
        }).join('')}
        <li><span class="b-emoji">${C.creatures.horntail.emoji}</span><div><b>${C.creatures.horntail.name}</b> <span class="muted">(boss, ${C.creatures.horntail.hp} HP)</span><div class="task-meta">Awakens when five or more creatures lurk in your dungeon.</div></div></li>
        </ul>
      </section>`;
  }

  // ---------- O.W.L.s ----------
  function viewOwl() {
    const rep = Pensieve.report(owlDays);
    const o = rep.overall;
    const bars = [];
    for (let i = 13; i >= 0; i--) {
      const d = U.addDays(U.ymd(), -i);
      const r = Game.rateFor(d);
      bars.push(`<div class="bar" title="${d}: ${r === null ? 'no lessons' : U.pct(r)}"><span style="height:${r === null ? 2 : Math.max(4, r * 100)}%" class="${r === null ? 'none' : r >= 0.8 ? 'good' : r >= 0.5 ? 'mid' : 'bad'}"></span><em>${'SMTWTFS'[U.dow(d)]}</em></div>`);
    }
    return `
      <section class="card owl">
        <div class="row-between">
          <h2>🦉 O.W.L. Report Card</h2>
          <div class="seg">${[7, 30].map(d => `<button class="${d === owlDays ? 'on' : ''}" data-action="owl-days" data-days="${d}">${d} days</button>`).join('')}</div>
        </div>
        <div class="overall">
          ${o.grade ? `<div class="grade big g-${o.grade.letter}">${o.grade.letter}</div>` : '<div class="grade big g-none">?</div>'}
          <div>
            <div class="overall-title">${o.grade ? o.grade.name : 'Not yet graded'}</div>
            <div class="muted">${o.total ? `${o.done} of ${o.total} tasks · ${U.pct(o.rate)}` : 'No lessons recorded in this period'} · 🔥 ${rep.streak} day streak (best ${rep.bestStreak})</div>
          </div>
        </div>
        <div class="grades">${rep.areas.map(a => `
          <div class="grade-card">
            <div class="grade g-${a.grade ? a.grade.letter : 'none'}">${a.grade ? a.grade.letter : '–'}</div>
            <div class="grade-body">
              <div class="grade-title">${a.area.icon} ${a.area.subject} <span class="muted">${a.area.label}</span></div>
              ${a.total ? `<div class="task-meta">${a.done}/${a.total} done${a.trend !== null && Math.abs(a.trend) >= 0.05 ? ` · ${a.trend > 0 ? '▲' : '▼'} ${U.pct(Math.abs(a.trend))}` : ''}</div><div class="grade-comment">${a.prof.emoji} <i>“${U.esc(a.comment)}”</i></div>` : '<div class="task-meta">No lessons in this subject yet.</div>'}
            </div>
          </div>`).join('')}
        </div>
      </section>
      <section class="card">
        <h2>📊 The Last Fortnight</h2>
        <div class="bars">${bars.join('')}</div>
      </section>
      <section class="card">
        <h2>🔮 What the Pensieve Reveals</h2>
        <ul class="insights">${rep.insights.map(i => `<li><span>${i.icon}</span><div>${U.esc(i.text)}</div></li>`).join('')}</ul>
      </section>
      <section class="card">
        <h2>📜 A Letter from the Headmaster</h2>
        <p class="muted" id="ai-status">Consulting the stars…</p>
        <button class="btn primary" data-action="pensieve">🌀 Consult the Pensieve</button>
        <div id="letter">${lastLetter ? letterHtml(lastLetter.text, lastLetter.src) : ''}</div>
      </section>`;
  }

  async function updateAiStatus() {
    const el = $('#ai-status');
    const s = await Pensieve.aiStatus();
    if (!el || !document.body.contains(el)) return;
    el.textContent = s === 'available' ? '✨ On-device AI is ready. The Headmaster will write you a personal letter (free and private: nothing leaves your device).'
      : s === 'downloadable' || s === 'downloading' ? '✨ Your browser can download a free on-device AI model (once). Press the button and the Headmaster will use it.'
      : 'The Pensieve will divine your letter from your own records (free, offline and private). Tip: desktop Google Chrome with built-in AI turned on lets the Headmaster write with a real AI model.';
  }

  function letterHtml(text, src) {
    return `<div class="letter-parchment">${U.esc(text).replace(/\n/g, '<br>')}</div>
      <div class="row"><button class="btn ghost" data-action="read-letter">🔊 Read it aloud</button><span class="muted small">${src === 'ai' ? 'Written by on-device AI' : 'Divined by the Pensieve'}</span></div>`;
  }

  async function runPensieve(btn) {
    const box = $('#letter');
    btn.disabled = true;
    box.innerHTML = '<div class="pensieve-swirl"></div><p class="muted center" id="swirl-msg">The Pensieve swirls…</p>';
    const rep = Pensieve.report(owlDays);
    let text = null, src = 'divination';
    const status = await Pensieve.aiStatus();
    if (rep.overall.total && ['available', 'downloadable', 'downloading'].includes(status)) {
      try {
        text = await Pensieve.aiLetter(rep, p => { const m = $('#swirl-msg'); if (m) m.textContent = `Gathering memories (downloading AI model)… ${Math.round(p * 100)}%`; });
        src = 'ai';
      } catch (e) {
        console.warn('On-device AI unavailable, using the Pensieve templates', e);
      }
    }
    if (!text) {
      await new Promise(r => setTimeout(r, 1200));
      text = Pensieve.letter(rep);
    }
    lastLetter = { text, src };
    btn.disabled = false;
    box.innerHTML = letterHtml(text, src);
    Sfx.chime();
  }

  // ---------- Spellbook ----------
  function viewSpells() {
    const st = Game.stats();
    const u = S().unlocked;
    return `<section class="card">
      <h2>✨ Spellbook</h2>
      <p class="muted">Keep your routine and you'll learn new spells. Learned spells fight the creatures in your dungeon. Tap one to cast it.</p>
      <div class="spells">${C.spells.map(sp => {
        const on = u.includes(sp.id);
        return `<button class="spell ${on ? 'on' : 'locked'}" ${on ? `data-action="cast" data-id="${sp.id}"` : 'disabled'} style="--c:${sp.color}">
          <span class="spell-emoji">${on ? sp.emoji : '🔒'}</span>
          <span class="spell-name">${on ? sp.name : '???'}</span>
          <span class="spell-desc">${sp.desc}</span>
        </button>`;
      }).join('')}</div>
    </section>
    <section class="card">
      <h2>🧙 Your Record</h2>
      <div class="record">
        <div><b>${st.totalDone}</b><span>tasks done</span></div>
        <div><b>${st.streak}</b><span>day streak</span></div>
        <div><b>${st.bestStreak}</b><span>best streak</span></div>
        <div><b>${st.defeated}</b><span>creatures defeated</span></div>
        <div><b>${st.lateDone}</b><span>redeemed late</span></div>
        <div><b>${st.maxInDay}</b><span>most in one day</span></div>
      </div>
    </section>`;
  }

  // ---------- Common Room (settings) ----------
  function viewSettings() {
    const st = S();
    const set = st.settings;
    return `
      <section class="card">
        <h2>🛋️ Common Room</h2>
        <label>Your name<input data-profile="name" value="${U.esc(st.profile.name)}" maxlength="30"></label>
        <div class="row"><span>House: <b>${C.houses[st.profile.house].crest} ${C.houses[st.profile.house].name}</b></span><button class="btn ghost small" data-action="resort">🎩 Visit the Sorting Hat again</button></div>
      </section>
      <section class="card">
        <h2>🪄 Magic Settings</h2>
        <label class="switch"><input type="checkbox" data-setting="voice" ${set.voice ? 'checked' : ''}> Professors speak aloud</label>
        <label class="switch"><input type="checkbox" data-setting="sfx" ${set.sfx ? 'checked' : ''}> Sound effects</label>
        <label>Grace period before a timed task counts as missed
          <select data-setting="grace">${[0, 15, 30, 60, 120, 240].map(m => `<option value="${m}" ${m === set.grace ? 'selected' : ''}>${m ? `${m} minutes` : 'None (strict!)'}</option>`).join('')}</select>
        </label>
        <div class="row"><button class="btn ghost" data-action="notify">🦉 ${set.notify ? 'Owl Post reminders are on' : 'Turn on Owl Post reminders'}</button></div>
        <p class="muted small">Reminders arrive while the app is open in a tab (or installed on your home screen).</p>
      </section>
      <section class="card">
        <h2>🗣️ Voices of Hogwarts</h2>
        <p class="muted small">Voices are free and built into your browser. For the best British accents, use <b>Microsoft Edge</b> (its "Natural" voices are excellent) or <b>Google Chrome</b> (Google UK English). On phones, install extra English (UK) voices in your system text-to-speech settings.</p>
        <ul class="voices">${Object.entries(C.professors).map(([id, p]) => `<li><span>${p.emoji} <b>${p.name}</b><br><span class="muted small" data-voice="${id}">…</span></span><button class="btn ghost small" data-action="test-voice" data-id="${id}">▶ Hear</button></li>`).join('')}</ul>
        <div class="row"><button class="btn danger" data-action="demo-howler">✉ Send myself a test Howler</button></div>
      </section>
      <section class="card">
        <h2>🗝️ Your Vault</h2>
        <p class="muted small">Everything is stored privately in this browser. Export a backup to move to another device.</p>
        <div class="row">
          <button class="btn ghost" data-action="export">⬇ Export backup</button>
          <button class="btn ghost" data-action="import">⬆ Import backup</button>
          <button class="btn bad" data-action="reset">Obliviate (erase everything)</button>
        </div>
        <input type="file" id="import-file" accept="application/json" hidden>
      </section>
      <p class="fineprint">An unofficial fan-made planner for personal use. Not affiliated with or endorsed by J.K. Rowling, Warner Bros. or Wizarding World.</p>`;
  }

  function fillVoiceInfo() {
    for (const [id, p] of Object.entries(C.professors)) {
      const el = document.querySelector(`[data-voice="${id}"]`);
      if (!el) continue;
      const v = Voice.pick(p.voice);
      el.textContent = !Voice.supported ? 'Speech is not supported in this browser' : v ? `${v.name} (${v.lang})` : 'Default voice';
    }
  }

  // ---------- Actions ----------
  function doComplete(id, el) {
    const snap = JSON.stringify(S());
    const r = Game.complete(id);
    if (!r) return;
    const rect = el.getBoundingClientRect();
    sparkles(rect.left + rect.width / 2, rect.top + rect.height / 2);
    floatText(rect.left - 40, rect.top - 10, `+${r.pts} to ${C.houses[S().profile.house].name}!`);
    Sfx.chime();
    const P = C.professors[C.areas[r.task.area].prof];
    const line = U.fill(U.pick(P.praise), vars(r.task));
    toast(`${P.emoji} <b>${P.name}:</b> ${U.esc(line)}`, {
      undo: () => { Voice.stop(); Store.replace(JSON.parse(snap)); render(); toast('⏳ Time-Turner used. It never happened.'); },
    });
    Voice.speak(line, P.voice);
    if (r.hit) {
      setTimeout(() => {
        Sfx.spell();
        spellFlash(r.hit.killed ? '#ffd700' : '#ff6b6b');
        toast(r.hit.killed
          ? `💥 <b>${r.hit.spell}!</b> You defeated the ${r.hit.info.name}! +${r.hit.bonus} bonus points.`
          : `⚡ <b>${r.hit.spell}!</b> The ${r.hit.info.name} takes a hit (${r.hit.creature.hp}/${r.hit.creature.maxHp} HP left).`, { cls: r.hit.killed ? 'gold' : '' });
      }, 700);
    }
    if (r.patronus) setTimeout(patronusMoment, 1300);
    r.unlocked.forEach((sp, i) => setTimeout(() => { Sfx.unlock(); toast(`${sp.emoji} New spell learned: <b>${sp.name}</b>!`, { cls: 'gold' }); }, 1800 + i * 900));
    render();
  }

  function consequenceNote(rs) {
    const lost = rs.reduce((a, r) => a + r.lost, 0);
    const shielded = rs.filter(r => r.shielded).length;
    const parts = [];
    if (lost) parts.push(`−${lost} house points`);
    for (const r of rs) {
      if (r.creature) parts.push(`${C.creatures[r.creature.type].emoji} A ${C.creatures[r.creature.type].name} escaped into your dungeon`);
      if (r.boss) parts.push(`${C.creatures.horntail.emoji} A <b>Hungarian Horntail</b> has awoken!`);
    }
    if (shielded) parts.push(`🦌 Your Patronus shielded you from ${shielded > 1 ? `${shielded} punishments` : 'the punishment'}`);
    return parts.join(' · ');
  }

  // Missed tasks are grouped by professor so each teacher sends one Howler.
  function sendHowlers(results, overnight = false) {
    if (!results.length) return;
    Sfx.fail();
    const groups = {};
    for (const r of results) (groups[C.areas[r.task.area].prof] ||= []).push(r);
    let entries = Object.entries(groups);
    const v = vars();
    if (overnight && entries.length > 2) {
      const names = U.listNames(results.map(r => r.task.title));
      Howler.send({
        prof: 'dumbledore',
        heading: 'While you were away',
        text: `${v.name}. While you were away, ${results.length} of your lessons went unattended: ${names}. Your professors are... unhappy. It is not our stumbles that define us, but how we rise from them. Rise well today.`,
        note: consequenceNote(results),
      });
      return;
    }
    for (const [pid, rs] of entries) {
      const text = U.fill(U.pick(C.professors[pid].howler), { ...v, task: U.listNames(rs.map(r => r.task.title)) });
      Howler.send({
        prof: pid,
        heading: `${C.areas[rs[0].task.area].subject}${overnight ? ' · while you were away' : ''}`,
        text,
        note: consequenceNote(rs),
      });
    }
  }

  function doFail(id) {
    const r = Game.fail(id, U.ymd(), false);
    if (!r) return;
    render();
    sendHowlers([r]);
  }

  function demoHowler() {
    const pid = U.pick(Object.keys(C.professors));
    const areaKey = Object.keys(C.areas).find(k => C.areas[k].prof === pid);
    Howler.send({
      prof: pid,
      heading: `${C.areas[areaKey].subject} · practice Howler`,
      text: U.fill(U.pick(C.professors[pid].howler), { ...vars(), task: '“an imaginary task”' }),
      note: 'This was only a test. No points were lost.',
    });
  }

  function castSpell(id) {
    const sp = C.spells.find(s => s.id === id);
    spellFlash(sp.color);
    Sfx.spell();
    const r = document.querySelector(`[data-action="cast"][data-id="${id}"]`)?.getBoundingClientRect();
    if (r) sparkles(r.left + r.width / 2, r.top + r.height / 2, sp.color);
    Voice.speak(`${sp.name}!`, C.sortingHat);
    if (id === 'patronum') patronusMoment();
  }

  function notifyOwl(title, body) {
    try {
      if (!S().settings.notify || !('Notification' in window) || Notification.permission !== 'granted') return;
      if (navigator.serviceWorker?.controller) navigator.serviceWorker.ready.then(reg => reg.showNotification(title, { body, icon: 'icon.svg', tag: title }));
      else new Notification(title, { body, icon: 'icon.svg' });
    } catch (e) {
      console.warn(e);
    }
  }

  function tick() {
    if (!S().profile) return;
    const out = Game.processTime();
    for (const t of out.reminders) {
      const a = C.areas[t.area];
      toast(`🦉 <b>Owl Post:</b> time for “${U.esc(t.title)}” (${a.subject}).`, { ms: 8000 });
      notifyOwl(`🦉 Owl Post: ${t.title}`, `${C.professors[a.prof].name} expects you in ${a.subject}.`);
    }
    if (out.drained) toast(`🦇 The creatures in your dungeon fed overnight: −${out.drained} house points.`, { ms: 7000 });
    if (out.overnight.length) sendHowlers(out.overnight, true);
    if (out.due.length) {
      sendHowlers(out.due);
      notifyOwl('✉ You have received a Howler!', `You missed ${out.due.map(r => r.task.title).join(', ')}.`);
    }
    if (out.reminders.length || out.drained || out.overnight.length || out.due.length) render();
  }

  // ---------- Events ----------
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-action]');
    if (!b || b.closest('#sorting')) return;
    const id = b.dataset.id;
    switch (b.dataset.action) {
      case 'tab': tab = b.dataset.tab; editingId = null; render(); window.scrollTo({ top: 0 }); break;
      case 'done': doComplete(id, b); break;
      case 'fail': doFail(id); break;
      case 'edit': editingId = id; render(); break;
      case 'cancel-edit': editingId = null; render(); break;
      case 'delete': {
        const t = S().tasks.find(x => x.id === id);
        if (!t || !confirm(`Vanish “${t.title}” from your timetable? Past records are kept.`)) return;
        const used = Object.values(S().log).some(day => day[id]);
        if (used) t.archivedOn = U.ymd();
        else S().tasks = S().tasks.filter(x => x.id !== id);
        Store.save();
        render();
        toast(`✨ Evanesco! “${U.esc(t.title)}” has vanished.`);
        break;
      }
      case 'toggle-voice': S().settings.voice = !S().settings.voice; if (!S().settings.voice) Voice.stop(); Store.save(); render(); break;
      case 'owl-days': owlDays = +b.dataset.days; lastLetter = ''; render(); break;
      case 'pensieve': runPensieve(b); break;
      case 'read-letter': if (lastLetter) Voice.speak(lastLetter.text, C.professors.dumbledore.voice, { force: true }); break;
      case 'cast': castSpell(id); break;
      case 'test-voice': {
        const P = C.professors[id];
        Voice.speak(U.fill(P.praise[0], vars()), P.voice, { force: true });
        break;
      }
      case 'demo-howler': demoHowler(); break;
      case 'notify': {
        if (!('Notification' in window)) { toast('This browser cannot receive Owl Post notifications.'); return; }
        if (S().settings.notify) { S().settings.notify = false; Store.save(); render(); return; }
        Notification.requestPermission().then(p => {
          S().settings.notify = p === 'granted';
          Store.save();
          render();
          toast(p === 'granted' ? '🦉 Owl Post reminders are on.' : 'The owls were turned away. Allow notifications in your browser settings.');
        });
        break;
      }
      case 'resort': openSorting(true); break;
      case 'export': {
        const blob = new Blob([JSON.stringify(S(), null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `hogwarts-planner-${U.ymd()}.json`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        break;
      }
      case 'import': $('#import-file').click(); break;
      case 'reset':
        if (confirm('Obliviate? This erases your house, tasks, points and history from this browser. It cannot be undone.')) {
          Voice.stop();
          Store.reset();
          lastLetter = '';
          tab = 'today';
          openSorting(false);
        }
        break;
    }
  });

  document.addEventListener('submit', e => {
    const f = e.target;
    if (!f.matches('.task-form')) return;
    e.preventDefault();
    const fd = new FormData(f);
    const title = String(fd.get('title')).trim();
    if (!title) return;
    const data = { title, area: fd.get('area'), time: fd.get('time') || '', repeat: fd.get('repeat'), points: +fd.get('points'), date: fd.get('date') || U.ymd() };
    if (f.dataset.form === 'edit') {
      Object.assign(S().tasks.find(t => t.id === f.dataset.id), data);
      editingId = null;
      toast('🪶 Timetable amended.');
    } else {
      S().tasks.push({ id: U.id(), createdAt: Date.now(), createdOn: U.ymd(), ...data });
      toast(`🪶 “${U.esc(title)}” added to ${C.areas[data.area].subject}.`);
      Sfx.chime();
    }
    Store.save();
    render();
  });

  document.addEventListener('change', e => {
    const el = e.target;
    if (el.name === 'repeat' && el.form) el.form.querySelector('.once-date').hidden = el.value !== 'once';
    if (el.dataset.setting) {
      const k = el.dataset.setting;
      S().settings[k] = el.type === 'checkbox' ? el.checked : +el.value;
      if (k === 'voice' && !el.checked) Voice.stop();
      Store.save();
      renderHeader();
    }
    if (el.dataset.profile === 'name' && el.value.trim()) {
      S().profile.name = el.value.trim();
      Store.save();
      renderHeader();
    }
    if (el.id === 'import-file' && el.files[0]) {
      el.files[0].text().then(txt => {
        const data = JSON.parse(txt);
        if (!data.profile || !Array.isArray(data.tasks)) throw new Error('Not a planner backup');
        Store.replace(data);
        theme();
        render();
        toast('🗝️ Backup restored from the vault.');
      }).catch(() => toast('That file is not a valid Hogwarts Planner backup.'));
    }
  });

  // ---------- Sorting Hat onboarding ----------
  const HAT_SVG = `<svg class="hat-svg" viewBox="0 0 120 110" aria-hidden="true">
    <path d="M62 4 C58 28 44 42 45 66 L22 76 C8 81 10 93 30 95 L94 95 C114 93 114 81 100 76 L80 68 C84 50 70 40 78 24 C71 20 66 12 62 4Z" fill="#6b4a2b" stroke="#2e1d0e" stroke-width="3"/>
    <path d="M50 58 q7-6 13 0 M68 55 q7-6 13 0" stroke="#2a1b0e" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path class="hat-mouth" d="M52 74 q13 9 28 -1" stroke="#2a1b0e" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M47 40 q10 4 20 -2 M44 86 q20 -6 44 0" stroke="#4a321b" stroke-width="2" fill="none"/>
  </svg>`;

  function openSorting(resort) {
    sorting = { step: resort ? 'q' : 'welcome', i: 0, tally: { gryffindor: 0, slytherin: 0, ravenclaw: 0, hufflepuff: 0 }, name: S().profile?.name || '', resort, house: null };
    renderSorting();
  }

  function renderSorting() {
    let root = $('#sorting');
    if (!root) {
      root = document.createElement('div');
      root.id = 'sorting';
      root.className = 'sorting';
      document.body.appendChild(root);
    }
    const s = sorting;
    let html = '';
    if (s.step === 'welcome') {
      html = `<div class="card sort-card acceptance">
        <div class="seal-big">H</div>
        <h1 class="deco">Hogwarts</h1>
        <p class="center muted-ink">School of Witchcraft, Wizardry &amp; Daily Routines</p>
        <p>Your owl has arrived! A place awaits you at Hogwarts, where every day is a lesson and every habit is a spell.</p>
        <p>Your professors will watch over your timetable. Keep your promises and earn House Points, learn spells and win the House Cup. Neglect them and… well. You will hear about it. <i>Loudly.</i></p>
        <button class="btn primary wide" data-s="next">Break the seal ✉</button>
      </div>`;
    } else if (s.step === 'name') {
      html = `<div class="card sort-card">
        <h2 class="center">What is your name, young witch or wizard?</h2>
        <form data-s-form="name"><input name="name" required maxlength="30" placeholder="Your name" value="${U.esc(s.name)}" autofocus>
        <button class="btn primary wide" type="submit">Onward to the Great Hall</button></form>
      </div>`;
    } else if (s.step === 'q') {
      const q = C.sorting[s.i];
      const answers = [...q.a].sort(() => Math.random() - 0.5);
      html = `<div class="card sort-card">
        <div class="hat-wrap small">${HAT_SVG}</div>
        <p class="center muted-ink">The Sorting Hat asks… (${s.i + 1}/${C.sorting.length})</p>
        <h2 class="center">${q.q}</h2>
        <div class="answers">${answers.map(([label, house]) => `<button class="btn answer" data-s="answer" data-house="${house}">${label}</button>`).join('')}</div>
      </div>`;
    } else if (s.step === 'hat') {
      html = `<div class="card sort-card">
        <div class="hat-wrap">${HAT_SVG}</div>
        <p class="hat-speech" id="hat-speech"></p>
        <div id="hat-result" class="hat-result" hidden></div>
        <div id="hat-next" hidden>
          <button class="btn primary wide" data-s="${s.resort ? 'finish' : 'starter'}">${s.resort ? 'Return to the castle' : 'Continue'}</button>
          <p class="center"><button class="linkish" data-s="choose">…or choose your own house</button></p>
        </div>
      </div>`;
    } else if (s.step === 'choose') {
      html = `<div class="card sort-card">
        <h2 class="center">The Hat takes your choice into account.</h2>
        <div class="answers">${Object.entries(C.houses).map(([k, h]) => `<button class="btn answer" data-s="pick-house" data-house="${k}">${h.crest} ${h.name}</button>`).join('')}</div>
      </div>`;
    } else if (s.step === 'starter') {
      html = `<div class="card sort-card">
        <h2 class="center">Your first timetable</h2>
        <p class="center muted-ink">Pick a few lessons to start. You can change them any time.</p>
        <form data-s-form="starter" class="starter">
          ${C.starterTasks.map(([title, area, time, on], i) => `<label class="check"><input type="checkbox" name="t" value="${i}" ${on ? 'checked' : ''}><span><b>${U.esc(title)}</b><br><span class="task-meta">${C.areas[area].icon} ${C.areas[area].subject} · ${U.fmtTime(time)}</span></span></label>`).join('')}
          <button class="btn primary wide" type="submit">Enter the Great Hall 🏰</button>
        </form>
      </div>`;
    }
    root.innerHTML = html;
    if (s.step === 'hat') hatSpeaks();
  }

  function hatSpeaks() {
    const s = sorting;
    const max = Math.max(...Object.values(s.tally));
    const top = Object.keys(s.tally).filter(k => s.tally[k] === max);
    s.house = U.pick(top);
    const h = C.houses[s.house];
    const text = `Hmm... let me see inside that head of yours, ${s.name}. Ah, I see ${h.trait}. Yes... I know exactly where you belong. It shall be... ${h.name.toUpperCase()}!`;
    const speech = $('#hat-speech');
    const hat = $('#sorting .hat-wrap');
    hat.classList.add('talking');
    let shown = false;
    const reveal = () => {
      if (shown || !$('#hat-result')) return;
      shown = true;
      hat.classList.remove('talking');
      const res = $('#hat-result');
      res.hidden = false;
      res.innerHTML = `<div class="house-crest" style="--h:${h.primary};--a:${h.accent}">${h.crest}</div><div class="house-name" style="color:${h.accent}">${h.name}!</div>`;
      $('#hat-next').hidden = false;
      sparkles(innerWidth / 2, innerHeight / 2, h.accent);
      Sfx.unlock();
    };
    // Reveal once the words are written out and the Hat has finished speaking.
    let i = 0, typed = false, spoken = false;
    const words = text.split(' ');
    const typer = setInterval(() => {
      if (!$('#hat-speech')) return clearInterval(typer);
      speech.textContent = words.slice(0, ++i).join(' ');
      if (i >= words.length) { clearInterval(typer); typed = true; if (spoken) reveal(); }
    }, 260);
    Voice.speak(text, C.sortingHat, { onEnd: () => { spoken = true; if (typed) reveal(); } });
    setTimeout(reveal, words.length * 260 + 12000);
  }

  function finishSorting(starterIdx) {
    const s = sorting;
    const today = U.ymd();
    if (s.resort) {
      S().profile.house = s.house;
    } else {
      S().profile = { name: s.name, house: s.house, createdOn: today, createdAt: Date.now() };
      S().lastProcessed = today;
      const now = Date.now();
      for (const i of starterIdx) {
        const [title, area, time] = C.starterTasks[i];
        S().tasks.push({ id: U.id(), title, area, time, repeat: 'daily', points: 10, date: today, createdAt: now, createdOn: today });
      }
    }
    Store.save();
    $('#sorting')?.remove();
    sorting = null;
    Voice.stop();
    theme();
    tab = 'today';
    render();
    const h = C.houses[S().profile.house];
    if (!s.resort) {
      const text = `Welcome to Hogwarts, ${S().profile.name}. ${h.name} is lucky to have you. Keep your promises, and the House Cup may yet be yours.`;
      toast(`${C.professors.dumbledore.emoji} <b>Dumbledore:</b> ${U.esc(text)}`, { ms: 8000 });
      Voice.speak(text, C.professors.dumbledore.voice);
    } else {
      toast(`${h.crest} Welcome to ${h.name}!`);
    }
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('#sorting [data-s]');
    if (!b) return;
    const s = sorting;
    switch (b.dataset.s) {
      case 'next': Sfx.boom(); s.step = 'name'; break;
      case 'answer':
        s.tally[b.dataset.house]++;
        s.i++;
        if (s.i >= C.sorting.length) s.step = 'hat';
        Sfx.chime();
        break;
      case 'choose': Voice.stop(); s.step = 'choose'; break;
      case 'pick-house': s.house = b.dataset.house; s.step = s.resort ? 'done' : 'starter'; break;
      case 'starter': s.step = 'starter'; break;
      case 'finish': finishSorting([]); return;
    }
    if (s.step === 'done') { finishSorting([]); return; }
    // Keep the house the Hat chose when moving to the next step.
    renderSorting();
  });

  document.addEventListener('submit', e => {
    const f = e.target.closest('#sorting form');
    if (!f) return;
    e.preventDefault();
    if (f.dataset.sForm === 'name') {
      const name = String(new FormData(f).get('name')).trim();
      if (!name) return;
      sorting.name = name;
      sorting.step = 'q';
      renderSorting();
    } else if (f.dataset.sForm === 'starter') {
      finishSorting(new FormData(f).getAll('t').map(Number));
    }
  });

  // ---------- Start ----------
  Store.load();
  ambience();
  if (!S().profile) {
    openSorting(false);
  } else {
    theme();
    render();
    Game.checkUnlocks();
    setTimeout(tick, 800);
  }
  setInterval(tick, 30000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(e => console.warn('Service worker not registered', e));
  }
})();
