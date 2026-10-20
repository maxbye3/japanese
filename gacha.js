(() => {
  'use strict';

  const STORAGE_KEY = 'katakana-quest-gacha-v1';
  const REWARDS = [
    { id: 'ramen', days: 14, name: 'Ramen' },
    { id: 'fuji', days: 30, name: 'Mount Fuji' },
    { id: 'ikebana', days: 60, name: 'Ikebana' },
  ];
  const elements = {
    streak: document.querySelector('#practice-streak'),
    best: document.querySelector('#best-streak'),
    link: document.querySelector('#gacha-link'),
    announcement: document.querySelector('#gacha-announcement'),
    sushi: document.querySelector('#sushi-capsule'),
    sushiNext: document.querySelector('#sushi-next'),
    sushiShelf: document.querySelector('#sushi-shelf'),
    sushiList: document.querySelector('#sushi-collection'),
  };
  let state = load();
  let currentStreak = 0;
  let shownSushiDate = null;
  let previewNextSushi = false;

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
      [...REWARDS, { id: 'sushi' }].forEach(({ id }) => {
        const reward = saved.rewards?.[id];
        if (reward && dayNumber(reward.unlockedOn) !== null) {
          rewards[id] = { unlockedOn: reward.unlockedOn, openedOn: dayNumber(reward.openedOn) !== null ? reward.openedOn : null };
        }
      });
      const sushiWeeks = [];
      const seen = new Set();
      if (Array.isArray(saved.sushiWeeks)) saved.sushiWeeks.forEach((reward) => {
        if (!reward || dayNumber(reward.unlockedOn) === null || seen.has(reward.unlockedOn)
          || !Number.isInteger(reward.rollIndex) || reward.rollIndex < 0) return;
        seen.add(reward.unlockedOn);
        sushiWeeks.push({
          unlockedOn: reward.unlockedOn,
          openedOn: dayNumber(reward.openedOn) !== null ? reward.openedOn : null,
          rollIndex: reward.rollIndex, legacy: reward.legacy === true,
        });
      });
      // Keep an already opened original sushi illustration as a legacy collectible.
      if (!sushiWeeks.length && rewards.sushi) {
        sushiWeeks.push({ ...rewards.sushi, rollIndex: 0, legacy: Boolean(rewards.sushi.openedOn) });
      }
      return {
        version: saved.version,
        bestStreak: Number.isInteger(saved.bestStreak) && saved.bestStreak >= 0 ? saved.bestStreak : 0,
        rewards, sushiWeeks,
      };
    } catch {
      return { bestStreak: 0, rewards: {}, sushiWeeks: [] };
    }
  }

  function save() {
    state.version = 2;
    // Preserve the original first-capsule record alongside the weekly collection.
    const first = state.sushiWeeks[0];
    if (first) state.rewards.sushi = { unlockedOn: first.unlockedOn, openedOn: first.openedOn };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function announce(message) {
    elements.announcement.textContent = message;
    elements.announcement.hidden = false;
  }

  function roll(reward) {
    return reward.legacy ? { name: 'Salmon nigiri', src: 'assets/sushi.svg' } : window.SushiRolls.get(reward.rollIndex);
  }

  function renderCard(id, reward, name, milestone, lockedDetail) {
    const opened = Boolean(reward?.openedOn);
    const button = document.querySelector('#' + id + '-capsule');
    button.disabled = !reward || opened;
    button.classList.toggle('is-ready', Boolean(reward) && !opened);
    button.classList.toggle('is-opened', opened);
    button.setAttribute('aria-label', opened ? name + ' collected' : reward
      ? 'Open your ' + name.toLowerCase() + ' capsule: ' + milestone
      : name + ' capsule locked: ' + lockedDetail);
    document.querySelector('#' + id + '-food').hidden = !opened;
    document.querySelector('#' + id + '-status').textContent = opened ? 'Collected' : reward ? 'Tap to open' : 'Locked';
    document.querySelector('#' + id + '-detail').textContent = opened
      ? 'A little keepsake for showing up.' : reward ? 'You earned this. Crack it open!' : lockedDetail;
  }

  function nextRollIndex() {
    return state.sushiWeeks.reduce((next, reward) => Math.max(next, reward.rollIndex + 1), 0);
  }

  function renderSushi() {
    const pending = state.sushiWeeks.find((reward) => !reward.openedOn);
    const reward = state.sushiWeeks.find((entry) => entry.unlockedOn === shownSushiDate)
      || pending || (previewNextSushi ? null : state.sushiWeeks.at(-1));
    shownSushiDate = reward?.unlockedOn || null;
    const collectible = reward ? roll(reward) : window.SushiRolls.get(nextRollIndex());
    const target = (Math.floor(currentStreak / 7) + 1) * 7;
    const milestone = reward ? 'Sushi capsule ' + (reward.rollIndex + 1) : target + ' days in a row';
    document.querySelector('#sushi-name').textContent = collectible.name;
    document.querySelector('#sushi-milestone').textContent = milestone;
    document.querySelector('#sushi-food').setAttribute('src', collectible.src);
    renderCard('sushi', reward, collectible.name, milestone, 'A different roll every 7-day streak week.');
    elements.sushiNext.hidden = !reward?.openedOn;
    elements.sushiNext.textContent = pending ? 'Next sushi capsule (' + state.sushiWeeks.filter((entry) => !entry.openedOn).length + ' ready) →' : 'Preview your next roll →';
    const opened = state.sushiWeeks.filter((entry) => entry.openedOn);
    elements.sushiShelf.hidden = !opened.length;
    document.querySelector('#sushi-collected-count').textContent = opened.length + (opened.length === 1 ? ' roll' : ' rolls');
    elements.sushiList.replaceChildren();
    opened.forEach((entry) => {
      const collectible = roll(entry);
      const item = document.createElement('li');
      const illustration = document.createElement('img');
      illustration.setAttribute('src', collectible.src);
      illustration.setAttribute('alt', '');
      illustration.setAttribute('width', '80');
      illustration.setAttribute('height', '80');
      const label = document.createElement('strong');
      label.textContent = collectible.name;
      const number = document.createElement('span');
      number.textContent = 'Sushi capsule ' + (entry.rollIndex + 1);
      item.append(illustration, label, number);
      elements.sushiList.appendChild(item);
    });
  }

  function render(current) {
    currentStreak = current;
    elements.streak.textContent = current + ' day streak';
    elements.best.textContent = 'Best: ' + state.bestStreak + (state.bestStreak === 1 ? ' day' : ' days');
    const ready = REWARDS.filter(({ id }) => state.rewards[id] && !state.rewards[id].openedOn).length
      + state.sushiWeeks.filter((reward) => !reward.openedOn).length;
    elements.link.textContent = ready ? 'Capsules · ' + ready + ' to open ↘' : 'Your capsule collection ↘';
    renderSushi();
    REWARDS.forEach(({ id, days, name }) => renderCard(id, state.rewards[id], name, days + '-day streak reward', days + ' days in a row to unlock.'));
  }

  function update(completions) {
    state = load();
    const today = dayNumber(dateKey());
    const dates = [...new Set([...completions.katakana, ...completions.listening, ...completions.kanji])]
      .filter((key) => dayNumber(key) !== null && dayNumber(key) <= today).sort();
    const earnedWeeks = new Set(state.sushiWeeks.map((reward) => reward.unlockedOn));
    let run = 0;
    let previous = null;
    let changed = state.version !== 2;
    let sushiUnlocked = 0;
    const unlocked = [];
    dates.forEach((key) => {
      const day = dayNumber(key);
      run = previous !== null && day === previous + 1 ? run + 1 : 1;
      previous = day;
      if (run > state.bestStreak) {
        state.bestStreak = run;
        changed = true;
      }
      if (run % 7 === 0 && !earnedWeeks.has(key)) {
        const reward = { unlockedOn: key, openedOn: null, rollIndex: nextRollIndex(), legacy: false };
        state.sushiWeeks.push(reward);
        earnedWeeks.add(key);
        if (!sushiUnlocked) shownSushiDate = key;
        sushiUnlocked += 1;
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
    const rewardCount = sushiUnlocked + unlocked.length;
    if (sushiUnlocked) unlocked.unshift(sushiUnlocked === 1 ? 'Sushi' : sushiUnlocked + ' sushi');
    if (unlocked.length) announce('Achievement unlocked! ' + unlocked.join(' and ') + ' capsule' + (rewardCount > 1 ? 's are' : ' is') + ' ready to open.');
  }

  elements.sushi.addEventListener('click', () => {
    state = load();
    const reward = state.sushiWeeks.find((entry) => entry.unlockedOn === shownSushiDate);
    if (!reward || reward.openedOn) return;
    reward.openedOn = dateKey();
    save();
    render(currentStreak);
    announce(roll(reward).name + ' collected! Your sushi shelf is saved on this browser.');
    elements.announcement.focus();
  });
  elements.sushiNext.addEventListener('click', () => {
    state = load();
    shownSushiDate = null;
    previewNextSushi = true;
    render(currentStreak);
    if (!elements.sushi.disabled) elements.sushi.focus();
    else {
      announce('Next sushi roll: ' + document.querySelector('#sushi-name').textContent + '. Complete another 7-day streak week to unlock it.');
      elements.announcement.focus();
    }
  });

  REWARDS.forEach(({ id, name }) => {
    document.querySelector('#' + id + '-capsule').addEventListener('click', () => {
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
