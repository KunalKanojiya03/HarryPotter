// Everything is saved in this browser's localStorage: free, private and offline.
const Store = (() => {
  const KEY = 'hogwarts-planner-v1';

  const defaults = () => ({
    version: 1,
    profile: null, // { name, house, createdOn, createdAt }
    settings: { voice: true, sfx: true, grace: 30, notify: false },
    tasks: [], // { id, title, area, time, repeat, date, points, createdAt, createdOn, archivedOn }
    log: {}, // { 'YYYY-MM-DD': { taskId: { status: 'done'|'missed', at, late, auto, title, area, time, points } } }
    points: 0,
    creatures: [],
    defeated: {},
    patronus: 0,
    patronusAwarded: [],
    unlocked: [],
    bestStreak: 0,
    lastProcessed: null,
    notified: {},
  });

  let state = defaults();

  function merge(saved) {
    const d = defaults();
    return { ...d, ...saved, settings: { ...d.settings, ...(saved.settings || {}) } };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) state = merge(JSON.parse(raw));
    } catch (e) {
      console.warn('Could not load saved data', e);
    }
    return state;
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Could not save', e);
    }
  }

  return {
    load,
    save,
    get: () => state,
    replace(s) { state = merge(s); save(); },
    reset() { state = defaults(); save(); },
  };
})();
