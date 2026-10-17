const assert = require('node:assert/strict');
const test = require('node:test');
const { kanjiKey, localDay, launch } = require('./browser-fixture.cjs');

const open = (app) => app.tabs[2].listeners.click();
function submit(app, translation) {
  if (translation !== undefined) app.els['kanji-input'].value = translation;
  app.els['kanji-form'].listeners.submit({ preventDefault() {} });
}
function stamp(app, date) {
  app.tabs[3].listeners.click();
  const cell = app.els['calendar-grid'].children.find((entry) => entry.dataset.date === date);
  return { text: cell.children[1]?.children[0].textContent, label: cell.attributes['aria-label'] };
}
const meanings = ['entrance', 'exit', 'emergency exit', 'push', 'pull', 'open', 'close',
  'prohibited', 'caution', 'danger', 'no entry', 'road closed', 'under construction', 'no smoking',
  'smoking area', 'no photography', 'no eating or drinking', 'free of charge', 'fee required', 'reception'];

test('ten earns the reward and a single stamp; practice and hints continue beyond twenty', () => {
  const app = launch({ random: 0 });
  open(app);
  const seen = new Set();
  for (let index = 0; index < 20; index += 1) {
    const id = app.els['kanji-sign'].textContent;
    assert.equal(seen.has(id), false);
    seen.add(id);
    if (index === 10) {
      app.els['kanji-hint-button'].listeners.click();
      assert.equal(app.els['kanji-hint-detail'].hidden, false);
    }
    submit(app, meanings[index]);
    assert.equal(app.els['kanji-count'].textContent, String(index + 1));
    assert.equal(app.els['kanji-reward'].hidden, index < 9);
    assert.equal(app.els['nav-stamp-count'].textContent, index < 9 ? '0' : '1');
    assert.equal(app.els['kanji-form'].hidden, false);
    assert.equal(app.els['kanji-progress'].style.width, Math.min((index + 1) / 10, 1) * 100 + '%');
    if (index === 9) assert.equal(app.els['kanji-submit'].textContent, 'Keep going →');
    if (index < 19) submit(app);
  }
  assert.equal(app.els['kanji-goal'].textContent, 'signs practised today');
  assert.deepEqual(app.kanjiState().dailyStats['2026-10-16'], { answered: 20, correct: 20 });
  assert.deepEqual(app.kanjiState().completedDays, ['2026-10-16']);
  const day = stamp(app, '2026-10-16');
  assert.equal(day.text, '漢 20');
  assert.match(day.label, /20 correct out of 20 signs practised/);
  open(app);
  submit(app);
  assert.equal(app.kanjiState().usedIds.length, 21);
  assert.equal(app.els['kanji-input'].disabled, false);
});

test('calendar shows the correct total after ten attempts, excludes misses and reveals, and updates live', () => {
  const app = launch({ random: 0 });
  open(app);
  for (let index = 0; index < 12; index += 1) {
    if (index === 10) {
      const hint = () => app.els['kanji-hint-button'].listeners.click();
      hint(); hint(); hint();
    }
    submit(app, index === 0 ? 'wrong' : meanings[index]);
    if (index === 8) assert.equal(stamp(app, '2026-10-16').text, undefined);
    if (index === 9) assert.equal(stamp(app, '2026-10-16').text, '漢');
    if (index === 10) assert.equal(stamp(app, '2026-10-16').text, '漢 9');
    // The fixture can dispatch Next while the calendar is visible, without opening a review round.
    if (index < 11) submit(app);
  }
  assert.equal(stamp(app, '2026-10-16').text, '漢 10');
  assert.deepEqual(app.kanjiState().dailyStats['2026-10-16'], { answered: 12, correct: 10 });
  assert.equal(app.kanjiState().review.length, 2);
  open(app);
  submit(app, 'entrance');
  submit(app);
  submit(app, 'no entry');
  submit(app);
  assert.deepEqual(app.kanjiState().dailyStats['2026-10-16'], { answered: 14, correct: 12 });
  assert.equal(stamp(app, '2026-10-16').text, '漢 12');
  assert.equal(app.els['nav-stamp-count'].textContent, '1');
});

test('extended practice resumes after reload and its score is archived through midnight and resets', () => {
  const clock = { now: localDay(0, 23, 59) };
  let app = launch({ random: 0, clock });
  open(app);
  for (let index = 0; index < 15; index += 1) {
    submit(app, meanings[index]);
    if (index < 14) submit(app);
  }
  app = launch({ saved: app.saved, random: 0, clock });
  open(app);
  assert.equal(app.els['kanji-count'].textContent, '15');
  assert.equal(app.els['kanji-input'].disabled, true);
  submit(app);
  assert.equal(app.kanjiState().usedIds.length, 16);
  clock.now = localDay(1, 0, 1);
  submit(app, meanings[15]);
  assert.equal(app.els['kanji-count'].textContent, '0');
  assert.deepEqual(app.kanjiState().dailyStats['2026-10-16'], { answered: 15, correct: 15 });
  submit(app, meanings[16]);
  assert.deepEqual(app.kanjiState().dailyStats['2026-10-17'], { answered: 1, correct: 1 });
  assert.equal(stamp(app, '2026-10-16').text, '漢 15');
  assert.equal(stamp(app, '2026-10-17').text, undefined);
  app.els['reset-progress'].listeners.click();
  app = launch({ saved: app.saved, clock });
  assert.equal(stamp(app, '2026-10-16').text, '漢 15');
  assert.equal(app.els['nav-stamp-count'].textContent, '1');
});

test('legacy completed sessions migrate their score, but old symbol-only stamps stay untouched', () => {
  const saved = new Map([[kanjiKey, JSON.stringify({
    completedDays: ['2026-10-14'], usedIds: ['入口'],
    day: { date: '2026-10-15', currentId: null,
      answers: Array.from({ length: 13 }, (_, index) => ({ correct: index < 11 })) },
  })]]);
  const app = launch({ saved });
  assert.equal(stamp(app, '2026-10-15').text, '漢 11');
  open(app);
  assert.deepEqual(app.kanjiState().dailyStats['2026-10-15'], { answered: 13, correct: 11 });
  assert.equal(stamp(app, '2026-10-14').text, '漢');
  assert.equal(stamp(app, '2026-10-15').text, '漢 11');
  assert.equal(app.els['nav-stamp-count'].textContent, '2');
});

test('a single day can consume all 120 unique signs without recycling or extra stamps', () => {
  const app = launch({ random: 0 });
  open(app);
  const seen = new Set();
  for (let index = 0; index < 120; index += 1) {
    const id = app.els['kanji-sign'].textContent;
    assert.equal(seen.has(id), false);
    seen.add(id);
    submit(app, 'still learning');
    submit(app);
  }
  assert.equal(seen.size, 120);
  assert.equal(app.els['kanji-form'].hidden, true);
  assert.equal(app.els['kanji-context'].textContent, 'Bank complete');
  assert.deepEqual(app.kanjiState().dailyStats['2026-10-16'], { answered: 120, correct: 0 });
  assert.equal(stamp(app, '2026-10-16').text, '漢 0');
  assert.equal(app.els['stamp-total'].textContent, '1');
});
