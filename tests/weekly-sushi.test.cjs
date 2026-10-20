const assert = require('node:assert/strict');
const test = require('node:test');
const { launch, key, kanjiKey, localDay } = require('./browser-fixture.cjs');
const gachaKey = 'katakana-quest-gacha-v1';
const collection = (app) => JSON.parse(app.saved.get(gachaKey));
const dateKey = (time) => {
  const date = new Date(time);
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
};
function dates(count, lastOffset = 0) {
  return Array.from({ length: count }, (_, index) => dateKey(localDay(lastOffset - count + 1 + index)));
}
function savedDays(history) {
  return new Map([[key, JSON.stringify({ days: Object.fromEntries(history.map((date) => [date, { completed: true }])) })]]);
}
const open = (app) => app.els['sushi-capsule'].listeners.click();
const next = (app) => app.els['sushi-next'].listeners.click();

test('each complete streak week earns another sushi capsule, including weeks with ramen and Mount Fuji', () => {
  for (const count of [6, 7, 13, 14, 21, 28, 30, 35]) {
    const app = launch({ saved: savedDays(dates(count)) });
    assert.equal(collection(app).sushiWeeks.length, Math.floor(count / 7));
    assert.equal(new Set(collection(app).sushiWeeks.map((reward) => reward.unlockedOn)).size, Math.floor(count / 7));
    assert.equal(Boolean(collection(app).rewards.ramen), count >= 14);
    assert.equal(Boolean(collection(app).rewards.fuji), count >= 30);
  }
});

test('queued sushi capsules open individually into distinct rolls, and the shelf survives reload and reset', () => {
  let app = launch({ saved: savedDays(dates(28)) });
  const names = ['Salmon avocado roll', 'Tuna roll', 'Cucumber roll', 'California roll'];
  const pictures = new Set();
  names.forEach((name, index) => {
    assert.equal(app.els['sushi-name'].textContent, name);
    assert.equal(app.els['sushi-food'].hidden, true);
    open(app);
    assert.equal(app.els['sushi-food'].hidden, false);
    assert.equal(collection(app).sushiWeeks.filter((entry) => entry.openedOn).length, index + 1);
    assert.equal(app.els['sushi-collection'].children.length, index + 1);
    pictures.add(app.els['sushi-food'].attributes.src);
    const before = collection(app);
    open(app);
    assert.deepEqual(collection(app), before);
    if (index === 0) app = launch({ saved: app.saved }); // Reload resumes at the next unopened capsule.
    else if (index < names.length - 1) next(app);
  });
  assert.equal(pictures.size, 4);
  assert.deepEqual(app.els['sushi-collection'].children.map((item) => item.children[1].textContent), names);
  next(app);
  assert.equal(app.els['sushi-name'].textContent, 'Prawn tempura roll');
  assert.equal(app.els['sushi-capsule'].disabled, true);
  assert.equal(app.els['sushi-milestone'].textContent, '35 days in a row');
  const before = collection(app);
  app.els['reset-progress'].listeners.click();
  app = launch({ saved: app.saved, clock: { now: localDay(2) } });
  assert.deepEqual(collection(app).sushiWeeks, before.sushiWeeks);
  assert.equal(app.els['sushi-collection'].children.length, 4);
});

test('a new seven-day streak earns the next roll after a gap without combining incomplete weeks', () => {
  const history = [...dates(7, -10), ...dates(7)];
  let app = launch({ saved: savedDays(history) });
  assert.equal(app.els['practice-streak'].textContent, '7 day streak');
  assert.equal(collection(app).sushiWeeks.length, 2);
  assert.equal(collection(app).rewards.ramen, undefined);
  open(app);
  next(app);
  assert.equal(app.els['sushi-name'].textContent, 'Tuna roll');
  app = launch({ saved: savedDays([...dates(6, -10), ...dates(6)]) });
  assert.equal(collection(app).sushiWeeks.length, 0);
});

test('upgrading preserves the original opened sushi art and specials while backfilling later weeks once', () => {
  const history = dates(35);
  const saved = savedDays(history);
  const rewards = {
    sushi: { unlockedOn: history[6], openedOn: history[7] },
    ramen: { unlockedOn: history[13], openedOn: history[14] },
    fuji: { unlockedOn: history[29], openedOn: history[30] },
  };
  saved.set(gachaKey, JSON.stringify({ bestStreak: 35, rewards }));
  let app = launch({ saved });
  assert.deepEqual(collection(app).rewards, rewards);
  assert.equal(collection(app).sushiWeeks.length, 5);
  assert.equal(app.els['sushi-collection'].children[0].children[0].attributes.src, 'assets/sushi.svg');
  assert.equal(app.els['sushi-collection'].children[0].children[1].textContent, 'Salmon nigiri');
  assert.equal(app.els['sushi-name'].textContent, 'Tuna roll');
  app = launch({ saved });
  assert.equal(collection(app).sushiWeeks.length, 5);
  assert.deepEqual(collection(app).rewards, rewards);
  assert.equal(app.els['gacha-announcement'].hidden, true);
});

test('weekly rolls continue beyond the named selection with unique collectible names and illustrations', () => {
  const app = launch({ saved: savedDays(dates(77)) });
  assert.equal(collection(app).sushiWeeks.length, 11);
  const names = new Set();
  const pictures = new Set();
  for (let i = 0; i < 11; i += 1) {
    names.add(app.els['sushi-name'].textContent);
    pictures.add(app.els['sushi-food'].attributes.src);
    open(app);
    if (i < 10) next(app);
  }
  assert.equal(names.size, 11);
  assert.equal(pictures.size, 11);
  assert(names.has('Chef’s special roll 11'));
});

test('replaying, multiple category stamps, tab changes, and reloads cannot mint the same weekly reward twice', () => {
  const history = dates(14);
  const saved = savedDays(history);
  const progress = JSON.parse(saved.get(key));
  progress.listeningCompletedDays = history;
  saved.set(key, JSON.stringify(progress));
  saved.set(kanjiKey, JSON.stringify({ completedDays: history }));
  let app = launch({ saved });
  app.els['listening-restart'].listeners.click();
  app.tabs[3].listeners.click();
  app.tabs[0].listeners.click();
  app = launch({ saved });
  assert.equal(collection(app).sushiWeeks.length, 2);
  assert.deepEqual(collection(app).sushiWeeks.map((entry) => entry.rollIndex), [0, 1]);
});

test('two tabs cannot overwrite another tab’s opened weekly rolls', () => {
  const saved = savedDays(dates(21));
  const first = launch({ saved });
  const second = launch({ saved });
  open(first);
  open(second); // Stale copy of capsule one: this click does not open capsule two.
  assert.equal(collection(first).sushiWeeks.filter((entry) => entry.openedOn).length, 1);
  second.windowEvents.storage({ key: gachaKey });
  next(second);
  open(second);
  first.windowEvents.storage({ key: gachaKey });
  assert.equal(first.els['sushi-collection'].children.length, 2);
  assert.equal(collection(first).sushiWeeks.filter((entry) => entry.openedOn).length, 2);
});
