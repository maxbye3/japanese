const assert = require('node:assert/strict');
const test = require('node:test');
const { launch, key, kanjiKey, localDay } = require('./browser-fixture.cjs');
const gachaKey = 'katakana-quest-gacha-v1';
const collection = (app) => JSON.parse(app.saved.get(gachaKey) || '{"rewards":{}}');
const dateKey = (time) => {
  const date = new Date(time);
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
};
function history(count, lastOffset = 0) {
  return Array.from({ length: count }, (_, index) => dateKey(localDay(lastOffset - count + 1 + index)));
}
function savedDays(dates) {
  return new Map([[key, JSON.stringify({ days: Object.fromEntries(dates.map((date) => [date, { correct: 10, completed: true }])) })]]);
}
const open = (app, reward) => app.els[reward + '-capsule'].listeners.click();

test('six stamped dates stay locked; seven unlock a sushi capsule that stays unopened until clicked', () => {
  let app = launch({ saved: savedDays(history(6)) });
  assert.equal(app.els['sushi-capsule'].disabled, true);
  assert.equal(app.els['ramen-capsule'].disabled, true);
  open(app, 'sushi');
  assert.equal(collection(app).rewards.sushi, undefined);
  app = launch({ saved: savedDays(history(7)) });
  assert.equal(app.els['practice-streak'].textContent, '7 day streak');
  assert.equal(app.els['sushi-capsule'].disabled, false);
  assert.equal(app.els['sushi-food'].hidden, true);
  assert.equal(app.els['ramen-capsule'].disabled, true);
  assert.deepEqual(collection(app).rewards.sushi, { unlockedOn: '2026-10-16', openedOn: null });
  assert.match(app.els['gacha-announcement'].textContent, /Achievement unlocked.*Sushi/);
});

test('fourteen consecutive dates across practice modes unlock both capsules, with multiple stamps counting once', () => {
  const dates = history(14);
  const saved = new Map([
    [key, JSON.stringify({
      days: Object.fromEntries(dates.filter((_, i) => i % 3 === 0).map((date) => [date, { completed: true }])),
      listeningCompletedDays: dates.filter((_, i) => i % 3 === 1),
    })],
    [kanjiKey, JSON.stringify({ completedDays: dates.filter((_, i) => i % 3 === 2) })],
  ]);
  let app = launch({ saved });
  assert.equal(app.els['practice-streak'].textContent, '14 day streak');
  assert.equal(app.els['ramen-capsule'].disabled, false);
  assert.equal(collection(app).rewards.sushi.unlockedOn, dates[6]);
  assert.equal(collection(app).rewards.ramen.unlockedOn, dates[13]);
  open(app, 'ramen');
  assert.equal(app.els['ramen-food'].hidden, false);
  assert.equal(app.els['ramen-status'].textContent, 'Collected');
  assert.equal(app.els['sushi-food'].hidden, true);
  app = launch({ saved });
  assert.equal(app.els['ramen-status'].textContent, 'Collected');
  assert.equal(app.els['ramen-food'].hidden, false);
  assert.equal(app.els['sushi-capsule'].disabled, false);
  const sameDates = history(3);
  app = launch({ saved: new Map([
    [key, JSON.stringify({ days: Object.fromEntries(sameDates.map((date) => [date, { completed: true }])), listeningCompletedDays: sameDates })],
    [kanjiKey, JSON.stringify({ completedDays: sameDates })],
  ]) });
  assert.equal(app.els['practice-streak'].textContent, '3 day streak');
  assert.equal(app.els['sushi-capsule'].disabled, true);
});

test('gaps break streaks; incomplete, invalid and future dates cannot unlock a capsule', () => {
  const dates = [...history(6, -8), ...history(6)];
  const saved = savedDays([...dates, '2026-02-30', 'not-a-date', ...history(14, 30)]);
  const progress = JSON.parse(saved.get(key));
  progress.days['2026-10-10'] = { correct: 9, completed: false };
  saved.set(key, JSON.stringify(progress));
  const app = launch({ saved });
  assert.equal(app.els['practice-streak'].textContent, '6 day streak');
  assert.equal(app.els['best-streak'].textContent, 'Best: 6 days');
  assert.equal(app.els['sushi-capsule'].disabled, true);
  assert.equal(app.els['ramen-capsule'].disabled, true);
});

test('today stays available to continue yesterday’s streak; a missed day resets the counter without losing a reward', () => {
  const saved = savedDays(history(7, -1));
  const clock = { now: localDay(0, 23, 59) };
  let app = launch({ saved, clock });
  assert.equal(app.els['practice-streak'].textContent, '7 day streak');
  clock.now = localDay(1, 0, 1);
  app.windowEvents.focus();
  assert.equal(app.els['practice-streak'].textContent, '0 day streak');
  assert.equal(app.els['best-streak'].textContent, 'Best: 7 days');
  assert.equal(app.els['sushi-capsule'].disabled, false);
  open(app, 'sushi');
  const reward = collection(app).rewards.sushi;
  assert.equal(reward.openedOn, '2026-10-17');
  open(app, 'sushi');
  assert.deepEqual(collection(app).rewards.sushi, reward);
  app.els['reset-progress'].listeners.click();
  app = launch({ saved, clock });
  assert.equal(app.els['sushi-status'].textContent, 'Locked');
  assert.equal(app.els['sushi-name'].textContent, 'Salmon avocado roll');
  assert.equal(app.els['sushi-collection'].children.length, 1);
  assert.deepEqual(collection(app).rewards.sushi, reward);
});

for (const [days, reward] of [[7, 'sushi'], [30, 'fuji'], [60, 'ikebana']]) test('a day-' + days + ' katakana correction unlocks ' + reward + ' immediately when it earns the daily stamp', () => {
  const saved = savedDays(history(days - 1, -1));
  const progress = JSON.parse(saved.get(key));
  progress.days['2026-10-16'] = { correct: 9, completed: false };
  saved.set(key, JSON.stringify(progress));
  const app = launch({ saved, random: 0 });
  app.els['answer-input'].value = 'my paraphrase';
  app.els['answer-form'].listeners.submit({ preventDefault() {} });
  assert.equal(app.els[reward + '-capsule'].disabled, true);
  app.els['katakana-grade-override'].listeners.click();
  assert.equal(app.els[reward + '-capsule'].disabled, false);
  assert.equal(app.els['practice-streak'].textContent, days + ' day streak');
});

test('Mount Fuji stays locked at 29 days and is backfilled at 30 without changing existing collectibles', () => {
  let app = launch({ saved: savedDays(history(29)) });
  assert.equal(app.els['fuji-capsule'].disabled, true);
  open(app, 'fuji');
  assert.equal(collection(app).rewards.fuji, undefined);
  const saved = savedDays(history(30));
  const existing = {
    sushi: { unlockedOn: '2026-09-23', openedOn: '2026-09-23' },
    ramen: { unlockedOn: '2026-09-30', openedOn: '2026-10-01' },
  };
  saved.set(gachaKey, JSON.stringify({ bestStreak: 30, rewards: existing }));
  app = launch({ saved });
  assert.equal(app.els['fuji-capsule'].disabled, false);
  assert.equal(app.els['fuji-food'].hidden, true);
  assert.deepEqual(collection(app).rewards.sushi, existing.sushi);
  assert.deepEqual(collection(app).rewards.ramen, existing.ramen);
  assert.deepEqual(collection(app).rewards.fuji, { unlockedOn: '2026-10-16', openedOn: null });
  open(app, 'fuji');
  assert.equal(app.els['fuji-status'].textContent, 'Collected');
  assert.equal(app.els['fuji-food'].hidden, false);
  const reward = collection(app).rewards.fuji;
  app.els['reset-progress'].listeners.click();
  app = launch({ saved, clock: { now: localDay(3) } });
  assert.equal(app.els['fuji-status'].textContent, 'Collected');
  open(app, 'fuji');
  assert.deepEqual(collection(app).rewards.fuji, reward);
});

test('ikebana unlocks at 60 days and stays collected across reloads and resets without changing earlier rewards', () => {
  let app = launch({ saved: savedDays(history(59, -1)) });
  assert.equal(app.els['ikebana-capsule'].disabled, true);
  open(app, 'ikebana');
  assert.equal(collection(app).rewards.ikebana, undefined);
  open(app, 'sushi');
  open(app, 'ramen');
  open(app, 'fuji');
  const earlier = collection(app);
  const sixtyDays = JSON.parse(savedDays(history(60)).get(key));
  app.saved.set(key, JSON.stringify(sixtyDays));
  app = launch({ saved: app.saved });
  assert.deepEqual(collection(app).rewards.sushi, earlier.rewards.sushi);
  assert.deepEqual(collection(app).rewards.ramen, earlier.rewards.ramen);
  assert.deepEqual(collection(app).rewards.fuji, earlier.rewards.fuji);
  assert.equal(app.els['ikebana-capsule'].disabled, false);
  assert.equal(app.els['ikebana-food'].hidden, true);
  assert.deepEqual(collection(app).rewards.ikebana, { unlockedOn: '2026-10-16', openedOn: null });
  open(app, 'ikebana');
  assert.equal(app.els['ikebana-status'].textContent, 'Collected');
  assert.equal(app.els['ikebana-food'].hidden, false);
  const reward = collection(app).rewards.ikebana;
  app.els['reset-progress'].listeners.click();
  app = launch({ saved: app.saved, clock: { now: localDay(3) } });
  assert.equal(app.els['ikebana-status'].textContent, 'Collected');
  open(app, 'ikebana');
  assert.deepEqual(collection(app).rewards.ikebana, reward);
});

test('finishing the daily listening ten unlocks sushi in the same session', () => {
  const saved = new Map([[key, JSON.stringify({ listeningCompletedDays: history(6, -1) })]]);
  const app = launch({ saved });
  for (let i = 0; i < 10; i += 1) {
    app.els['listening-input'].value = 'my translation';
    app.els['listening-form'].listeners.submit({ preventDefault() {} });
    app.marks[0].listeners.click();
    assert.equal(app.els['sushi-capsule'].disabled, i < 9);
  }
  assert.equal(app.els['practice-streak'].textContent, '7 day streak');
});

test('kanji review completing day fourteen unlocks ramen immediately', () => {
  const ids = ['入口', '出口', '非常口', '押', '引', '開', '閉', '禁止', '注意', '危険'];
  const saved = new Map([[kanjiKey, JSON.stringify({ completedDays: history(13, -1), usedIds: ids, review: ids.map((id) => ({ id })) })]]);
  const app = launch({ saved });
  app.tabs[2].listeners.click();
  for (let i = 0; i < 10; i += 1) {
    app.els['kanji-input'].value = 'still learning';
    app.els['kanji-form'].listeners.submit({ preventDefault() {} });
    assert.equal(app.els['ramen-capsule'].disabled, i < 9);
    if (i < 9) app.els['kanji-form'].listeners.submit({ preventDefault() {} });
  }
  assert.equal(app.els['practice-streak'].textContent, '14 day streak');
  open(app, 'ramen');
  assert.equal(collection(app).rewards.ramen.openedOn, '2026-10-16');
});

test('old streaks are backfilled once, including leap days and year boundaries', () => {
  const dates = ['2024-02-28', '2024-02-29', '2024-03-01', '2024-03-02', '2024-03-03', '2024-03-04', '2024-03-05'];
  const saved = savedDays(dates);
  saved.set(gachaKey, '{invalid json');
  let app = launch({ saved });
  assert.equal(app.els['practice-streak'].textContent, '0 day streak');
  assert.equal(collection(app).rewards.sushi.unlockedOn, '2024-03-05');
  app = launch({ saved });
  assert.equal(app.els['gacha-announcement'].hidden, true);
  assert.equal(collection(app).rewards.sushi.unlockedOn, '2024-03-05');
  const yearDates = Array.from({ length: 14 }, (_, i) => dateKey(new Date(2025, 11, 24 + i, 12).getTime()));
  app = launch({ saved: savedDays(yearDates) });
  assert.equal(collection(app).rewards.ramen.unlockedOn, '2026-01-06');
});

test('a seven-day streak across the daylight-saving boundary still counts calendar days', () => {
  const dates = Array.from({ length: 7 }, (_, i) => dateKey(new Date(2026, 9, 21 + i, 12).getTime()));
  const app = launch({ saved: savedDays(dates), clock: { now: new Date(2026, 9, 27, 12).getTime() } });
  assert.equal(app.els['practice-streak'].textContent, '7 day streak');
  assert.equal(app.els['sushi-capsule'].disabled, false);
});

test('two tabs opening different capsules preserve both collectibles and cannot reopen them', () => {
  const saved = savedDays(history(14));
  const first = launch({ saved });
  const second = launch({ saved });
  open(first, 'sushi');
  open(second, 'ramen');
  first.windowEvents.storage({ key: gachaKey });
  assert.equal(first.els['ramen-status'].textContent, 'Collected');
  const before = collection(first);
  first.windowEvents.focus();
  first.tabs[3].listeners.click();
  open(second, 'sushi');
  assert.deepEqual(collection(first), before);
  assert.equal(before.rewards.sushi.openedOn, '2026-10-16');
  assert.equal(before.rewards.ramen.openedOn, '2026-10-16');
});
