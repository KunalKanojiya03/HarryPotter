// The Howler: a red envelope flies in, smokes and shakes, then bursts open and reads itself aloud.
const Howler = (() => {
  const queue = [];
  let busy = false;

  function send(h) {
    queue.push(h);
    if (!busy) next();
  }

  async function next() {
    const h = queue.shift();
    if (!h) { busy = false; return; }
    busy = true;
    await play(h);
    setTimeout(next, 400);
  }

  function play(h) {
    return new Promise(resolve => {
      const P = HP.professors[h.prof];
      const root = document.createElement('div');
      root.className = 'howler-overlay';
      root.setAttribute('role', 'dialog');
      root.setAttribute('aria-label', `Howler from ${P.name}`);

      const words = [];
      const re = /\S+\s*/g;
      let m;
      while ((m = re.exec(h.text))) words.push({ start: m.index, text: m[0] });
      const textHtml = words.map((w, i) => `<span class="w" data-i="${i}">${U.esc(w.text)}</span>`).join('');

      root.innerHTML = `
        <div class="howler-stage">
          <div class="howler-hint">✉ A Howler has arrived!</div>
          <button class="envelope" aria-label="Open the Howler">
            <span class="env-body"></span>
            <span class="env-flap"></span>
            <span class="env-seal">H</span>
            <span class="smoke s1"></span><span class="smoke s2"></span><span class="smoke s3"></span>
          </button>
          <div class="howler-tap">Tap the envelope. Quickly, before it explodes!</div>
          <article class="howler-letter">
            <header>
              <span class="prof-emoji">${P.emoji}</span>
              <div>
                <div class="from">From the desk of</div>
                <div class="prof-name">${P.name}</div>
                ${h.heading ? `<div class="prof-sub">${U.esc(h.heading)}</div>` : ''}
              </div>
            </header>
            <p class="letter-text">${textHtml}</p>
            ${h.note ? `<div class="letter-note">${h.note}</div>` : ''}
            <footer>${P.name}</footer>
          </article>
          <div class="howler-actions">
            <button class="btn ghost" data-h="replay">🔁 Hear it again</button>
            <button class="btn danger" data-h="close">I accept my punishment</button>
          </div>
        </div>`;
      document.body.appendChild(root);

      const env = root.querySelector('.envelope');
      const spans = [...root.querySelectorAll('.letter-text .w')];
      let opened = false;
      let timer = null;
      let autoOpen = null;

      const revealUpTo = idx => {
        words.forEach((w, i) => { if (w.start <= idx) spans[i].classList.add('said'); });
      };
      const revealAll = () => spans.forEach(s => s.classList.add('said'));
      const stopTimer = () => { clearInterval(timer); timer = null; };

      // Fallback word reveal for voices that don't report word boundaries (or when muted).
      const startTimer = (msPerWord) => {
        stopTimer();
        let i = spans.findIndex(s => !s.classList.contains('said'));
        if (i < 0) return;
        timer = setInterval(() => {
          if (i >= spans.length) { stopTimer(); return; }
          spans[i++].classList.add('said');
        }, msPerWord);
      };

      const finish = () => {
        stopTimer();
        revealAll();
        root.classList.remove('talking');
      };

      function speakNow() {
        spans.forEach(s => s.classList.remove('said'));
        root.classList.add('talking');
        let gotWord = false;
        const spoke = Voice.speak(h.text, P.voice, {
          onBoundary: (idx, isWord) => {
            if (isWord && !gotWord) { gotWord = true; stopTimer(); }
            revealUpTo(idx);
          },
          onEnd: finish,
        });
        if (spoke) startTimer(330 / (P.voice.rate || 1));
        else { startTimer(110); setTimeout(finish, spans.length * 110 + 300); }
      }

      function open() {
        if (opened) return;
        opened = true;
        clearTimeout(autoOpen);
        root.classList.remove('shake');
        root.classList.add('open', 'quake');
        Sfx.boom();
        setTimeout(() => root.classList.remove('quake'), 600);
        setTimeout(() => { root.classList.add('reading'); speakNow(); }, 550);
      }

      function close() {
        Voice.stop();
        stopTimer();
        clearTimeout(autoOpen);
        root.classList.add('burn');
        setTimeout(() => { root.remove(); resolve(); }, 800);
      }

      env.addEventListener('click', open);
      root.addEventListener('click', e => {
        const b = e.target.closest('[data-h]');
        if (!b) return;
        if (b.dataset.h === 'close') close();
        if (b.dataset.h === 'replay') speakNow();
      });

      requestAnimationFrame(() => {
        root.classList.add('arrive');
        Sfx.whoosh();
      });
      setTimeout(() => {
        if (opened) return;
        root.classList.add('shake');
        Sfx.rumble();
        // Browsers only allow speech after the user has interacted with the page.
        if (navigator.userActivation?.hasBeenActive) autoOpen = setTimeout(open, 6000);
      }, 1000);
    });
  }

  return { send, busy: () => busy };
})();
