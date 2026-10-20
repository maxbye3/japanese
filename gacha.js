(() => {
  'use strict';

  const STORAGE_KEY = 'katakana-quest-gacha-v1';
  const REWARDS = [
    { id: 'sushi', days: 7, name: 'Sushi' },
    { id: 'ramen', days: 14, name: 'Ramen' },
    { id: 'fuji', days: 30, name: 'Mount Fuji' },
  ];
  const elements = {
    streak: document.querySelector('#practice-streak'),
    best: document.querySelector('#best-streak'),
    link: document.querySelector('#gacha-link'),
    announcement: document.querySelector('#gacha-announcement'),
  };
  let state = load();
  let currentStreak = 0;

  function dayNumber(key) {
    if (typeof key !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
    const [year, month, day] = key.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.toISOString().slice(0, 10) !== key) return null;
    return date.getTime() / 86400000;
  }

  function dateKey() {
    const date = new Date();
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  }

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const rewards = {};
      REWARDS.forEach(({ id }) => {
        const reward = saved.rewards?.[id];
        if (reward && dayNumber(reward.unlockedOn) !== null) {
          rewards[id] = { unlockedOn: reward.unlockedOn, openedOn: dayNumber(reward.openedOn) !== null ? reward.openedOn : null };
        }
      });
      return { bestStreak: Number.isInteger(saved.bestStreak) && saved.bestStreak >= 0 ? saved.bestStreak : 0, rewards };
    } catch {
      return { bestStreak: 0, rewards: {} };
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function announce(message) {
    elements.announcement.textContent = message;
    elements.announcement.hidden = false;
  }

  function render(current) {
    currentStreak = current;
    elements.streak.textContent = current + ' day streak';
    elements.best.textContent = 'Best: ' + state.bestStreak + (state.bestStreak === 1 ? ' day' : ' days');
    const ready = REWARDS.filter(({ id }) => state.rewards[id] && !state.rewards[id].openedOn).length;
    elements.link.textContent = ready ? 'Capsules · ' + ready + ' to open ↘' : 'Your capsule collection ↘';
    REWARDS.forEach(({ id, days, name }) => {
      const reward = state.rewards[id];
      const opened = Boolean(reward?.openedOn);
      const button = document.querySelector('#' + id + '-capsule');
      button.disabled = !reward || opened;
      button.classList.toggle('is-ready', Boolean(reward) && !opened);
      button.classList.toggle('is-opened', opened);
      button.setAttribute('aria-label', opened ? name + ' collected' : reward
        ? 'Open your ' + name.toLowerCase() + ' capsule: ' + days + '-day streak reward'
        : name + ' capsule locked: reach a ' + days + '-day streak');
      document.querySelector('#' + id + '-food').hidden = !opened;
      document.querySelector('#' + id + '-status').textContent = opened ? 'Collected' : reward ? 'Tap to open' : 'Locked';
      document.querySelector('#' + id + '-detail').textContent = opened
        ? 'A little keepsake for showing up.' : reward ? 'You earned this. Crack it open!' : days + ' days in a row to unlock.';
    });
  }

  function update(completions) {
    state = load();
    const today = dayNumber(dateKey());
    const dates = [...new Set([...completions.katakana, ...completions.listening, ...completions.kanji])]
      .filter((key) => dayNumber(key) !== null && dayNumber(key) <= today).sort();
    let run = 0;
    let previous = null;
    let changed = false;
    const unlocked = [];
    dates.forEach((key) => {
      const day = dayNumber(key);
      run = previous !== null && day === previous + 1 ? run + 1 : 1;
      previous = day;
      if (run > state.bestStreak) {
        state.bestStreak = run;
        changed = true;
      }
      REWARDS.forEach(({ id, days, name }) => {
        if (run >= days && !state.rewards[id]) {
          state.rewards[id] = { unlockedOn: key, openedOn: null };
          unlocked.push(name);
          changed = true;
        }
      });
    });
    if (changed) save();
    render(previous !== null && previous >= today - 1 ? run : 0);
    if (unlocked.length) announce('Achievement unlocked! ' + unlocked.join(' and ') + ' capsule' + (unlocked.length > 1 ? 's are' : ' is') + ' ready to open.');
  }

  REWARDS.forEach(({ id, name }) => {
    document.querySelector('#' + id + '-capsule').addEventListener('click', () => {
      // Re-read the shared collection so two open tabs cannot overwrite each other's rewards.
      state = load();
      const reward = state.rewards[id];
      if (!reward || reward.openedOn) return;
      reward.openedOn = dateKey();
      save();
      render(currentStreak);
      announce(name + ' collected! Your keepsake is saved on this browser.');
      elements.announcement.focus();
    });
  });

  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) {
      state = load();
      render(currentStreak);
    }
  });

  window.PracticeGacha = { update };
})();
