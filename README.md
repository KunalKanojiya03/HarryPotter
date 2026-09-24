# 🏰 Hogwarts Daily Planner

A Harry Potter–themed daily routine planner. Keep your promises to yourself and earn House Points.
Miss them and your professors send you a **Howler**.

It is **free to use and free to host**. There is no server, no account, no API keys and no subscription.

## ✨ Features

| | |
|---|---|
| 🎩 **Sorting Hat** | A short quiz sorts you into a house (or you choose one), then you pick a starter timetable. |
| 📜 **Timetable** | Tasks are "lessons" in 8 life areas, each taught by a professor. Tasks can repeat daily, on weekdays, on weekends, or happen once. |
| ✉️ **Howlers** | Miss a task (or tap ✘) and a red envelope flies in, smokes and shakes. Tap it and it bursts open, then reads its letter aloud while the words ink onto the page. Each professor speaks with their own voice and personality. |
| 🗣️ **Accents** | Uses the browser's free built-in voices. Each character picks the best British voice available and gets its own pitch and speed (a slow, low Snape; a brisk Madam Hooch; a deep, dialect-heavy Hagrid). |
| 🕯️ **Dungeon** | Each missed task releases a creature (Boggart, Dementor, Troll, Niffler, and more). They eat your points every night. Completing tasks casts spells at them. Five or more creatures wake a **Hungarian Horntail**. |
| 🔥 **Streaks and Patronus** | Days with at least 80% of tasks done build a streak. Every 7-day streak earns a Patronus shield that blocks one punishment. |
| 🪄 **Spellbook** | Unlock spells (Lumos, Expelliarmus, Riddikulus, Expecto Patronum…) by reaching milestones. |
| 🦉 **O.W.L. Report** | Grades from O (Outstanding) to T (Troll) for each life area, with in-character comments, a 14-day chart and pattern insights: your best and worst weekdays, your strongest time of day, tasks you keep missing, and trends. |
| 🔮 **Pensieve (AI)** | The Headmaster writes a personal letter about your progress. On desktop Chrome with built-in AI, a real on-device model writes it (free, and nothing leaves your device). Everywhere else, a built-in analysis engine writes it. |
| 🏆 **House Cup** | Race the other three houses. |
| 📰 **Daily Prophet** | A headline about how you did yesterday, and a quote for the day. |
| 🦉 **Owl Post** | Reminders at task time. The app installs to your home screen (PWA) and works offline. |

All data stays in your browser's local storage. Use **Common Room → Export backup** to move it to another device.

## 🚀 Run it

It's plain HTML, CSS and JavaScript with no build step.

- **Quickest:** open `index.html` in your browser.
- **Full features** (offline mode, install to home screen): serve the folder locally, for example:
  ```bash
  npx serve .
  # or
  python3 -m http.server 8000
  ```

## 🌍 Host it free on GitHub Pages

1. Merge this code into your default branch.
2. In the repo, go to **Settings → Pages**, set **Source: Deploy from a branch**, and choose your branch and `/ (root)`.
3. Your planner will be live at `https://<username>.github.io/<repo>/`. Open it on your phone and use **Add to Home Screen**.

## 🗣️ Getting the best voices (free)

- **Microsoft Edge** has very natural British voices (Ryan, Sonia, Libby, Thomas). This is the best free option.
- **Google Chrome** has "Google UK English Male" and "Google UK English Female".
- **Android and iOS:** install extra English (UK) voices in your system text-to-speech settings.
- You can hear each professor's voice in **Common Room → Voices of Hogwarts**.

## 🤖 Free AI (optional)

The O.W.L. analysis always works offline. For AI-written letters, use desktop Google Chrome with its built-in
[Prompt API / Gemini Nano](https://developer.chrome.com/docs/ai/built-in). The app detects it automatically and
downloads the model once. It is free and nothing leaves your device.

## 🧩 Customising

All themed content (professors, lines, voices, creatures, spells, headlines, quiz) is in `js/config.js`.
Edit the lines, add professors or rename things there.

| File | Purpose |
|---|---|
| `js/config.js` | All themed content |
| `js/game.js` | Rules: scheduling, points, creatures, streaks, spells |
| `js/howler.js` | Howler animation and speech sync |
| `js/voice.js` | Voice picking and speech |
| `js/analysis.js` | O.W.L. grades, insights, Headmaster's letter, on-device AI |
| `js/sfx.js` | Sound effects synthesised in the browser (no audio files) |
| `js/app.js` | Screens and interactions |

---

*An unofficial fan-made project for personal use. Not affiliated with or endorsed by J.K. Rowling, Warner Bros. or Wizarding World. All character dialogue is original.*
