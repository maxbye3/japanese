const assert = require('node:assert/strict');
const test = require('node:test');
const { launch, kanjiKey, localDay } = require('./browser-fixture.cjs');

const ids = ['入口', '出口', '非常口', '押', '引', '開', '閉', '禁止', '注意', '危険'];
const meanings = ['entrance', 'exit', 'emergency exit', 'push', 'pull', 'open', 'close', 'prohibited', 'caution', 'danger'];
const open = (app) => app.tabs[2].listeners.click();
function submit(app, answer) {
  if (answer !== undefined) app.els['kanji-input'].value = answer;
  app.els['kanji-form'].listeners.submit({ preventDefault() {} });
}
function savedState(overrides = {}) {
  return new Map([[kanjiKey, JSON.stringify({
    usedIds: ids,
    review: ids.map((id) => ({ id, translation: 'old miss' })),
    ...overrides,
  })]]);
}

test('ten reviews earn the daily stamp, resume across reloads, and include misses and assisted attempts', () => {
  let app = launch({ saved: savedState(), random: 0 });
  open(app);
  submit(app, ' ');
  assert.equal(app.els['kanji-count'].textContent, '0');
  for (let index = 0; index < 10; index += 1) {
    if (index === 1) {
      for (let hint = 0; hint < 3; hint += 1) app.els['kanji-hint-button'].listeners.click();
      assert.equal(app.els['kanji-count'].textContent, '1');
    }
    submit(app, index === 0 ? 'wrong' : meanings[index]);
    assert.equal(app.els['kanji-count'].textContent, String(index + 1));
    assert.equal(app.els['kanji-progress'].style.width, (index + 1) * 10 + '%');
    assert.equal(app.els['kanji-reward'].hidden, index < 9);
    assert.equal(app.els['nav-stamp-count'].textContent, index < 9 ? '0' : '1');
    assert.deepEqual(app.kanjiState().usedIds, ids);
    assert.equal(app.kanjiState().day.answers.length, 0);
    if (index === 3) {
      app = launch({ saved: app.saved, random: 0 });
      open(app);
      assert.equal(app.els['kanji-count'].textContent, '4');
      assert.equal(app.els['kanji-input'].disabled, true);
    }
    if (index < 9) submit(app);
  }
  assert.deepEqual(app.kanjiState().dailyStats['2026-10-16'], { answered: 10, correct: 8 });
  assert.deepEqual(app.kanjiState().completedDays, ['2026-10-16']);
  submit(app); // Completing the round does not add an attempt.
  assert.equal(app.els['kanji-count'].textContent, '10');
  submit(app, 'no entry'); // Continue with an unseen sign after the daily goal.
  assert.equal(app.els['kanji-count'].textContent, '11');
  assert.equal(app.els['nav-stamp-count'].textContent, '1');
  app.tabs[3].listeners.click();
  const cell = app.els['calendar-grid'].children.find((entry) => entry.dataset.date === '2026-10-16');
  assert.equal(cell.children[1].children[0].textContent, '漢 9');
  assert.match(cell.attributes['aria-label'], /9 correct out of 11 signs practised \(including reviews/);
});

test('mixed new signs and reviews reach ten together and their totals survive day rollover', () => {
  const clock = { now: localDay(0, 23, 59) };
  let app = launch({ saved: savedState({
    review: [{ id: '入口', translation: 'old miss' }],
    day: { date: '2026-10-16', currentId: null, answers: ids.slice(0, 9).map((id) => ({ id, correct: true })) },
  }), clock, random: 0 });
  open(app);
  assert.equal(app.els['kanji-count'].textContent, '9');
  submit(app, 'entrance');
  assert.equal(app.els['kanji-count'].textContent, '10');
  assert.equal(app.els['nav-stamp-count'].textContent, '1');
  app = launch({ saved: app.saved, clock, random: 0 });
  open(app);
  assert.equal(app.els['kanji-count'].textContent, '10');
  submit(app);
  clock.now = localDay(1, 0, 1);
  app.windowEvents.focus();
  assert.equal(app.els['kanji-count'].textContent, '0');
  assert.deepEqual(app.kanjiState().day.reviewAnswers, []);
  assert.deepEqual(app.kanjiState().dailyStats['2026-10-16'], { answered: 10, correct: 10 });
  assert.deepEqual(app.kanjiState().completedDays, ['2026-10-16']);
  submit(app, 'wrong');
  assert.equal(app.els['kanji-count'].textContent, '1');
  assert.equal(app.els['nav-stamp-count'].textContent, '1');
});

test('legacy saved review answers are credited once and corrections remain linked after reload but close on round completion', () => {
  let app = launch({ saved: savedState({
    review: [],
    reviewSession: { ids: ['入口'], index: 0, answers: [{ id: '入口', correct: true, translation: 'entrance' }] },
    day: { date: '2026-10-16', currentId: null, answers: ids.slice(0, 9).map((id) => ({ id, correct: true })) },
  }), random: 0 });
  assert.equal(app.els['nav-stamp-count'].textContent, '1'); // Calendar sees migration before opening kanji.
  open(app);
  assert.equal(app.els['kanji-count'].textContent, '10');
  app = launch({ saved: app.saved, random: 0 });
  open(app);
  app.els['kanji-grade-override'].listeners.click();
  assert.equal(app.kanjiState().reviewSession.answers[0].correct, false);
  assert.deepEqual(app.kanjiState().dailyStats['2026-10-16'], { answered: 10, correct: 9 });
  app.els['kanji-grade-override'].listeners.click();
  submit(app); // End the round; the correction closes before the next sign.
  app = launch({ saved: app.saved, random: 0 });
  open(app);
  app.els['kanji-input'].value = 'unfinished translation';
  app.els['kanji-grade-override'].listeners.click();
  assert.equal(app.els['kanji-input'].value, 'unfinished translation');
  assert.equal(app.els['kanji-grade-override'].hidden, true);
  assert.equal(app.kanjiState().day.reviewAnswers[0].correct, true);
  assert.deepEqual(app.kanjiState().dailyStats['2026-10-16'], { answered: 10, correct: 10 });
  assert.equal(app.els['nav-stamp-count'].textContent, '1');
});
