const assert = require('node:assert/strict');
const test = require('node:test');
const { launch, localDay, kanjiKey } = require('./browser-fixture.cjs');
const open = (app) => app.tabs[2].listeners.click();
const override = (app) => app.els['kanji-grade-override'].listeners.click();
function submit(app, text) {
  if (text !== undefined) app.els['kanji-input'].value = text;
  app.els['kanji-form'].listeners.submit({ preventDefault() {} });
}

test('a rejected answer can be accepted manually, correcting score and review without another attempt', () => {
  const app = launch({ random: 0 });
  open(app);
  assert.equal(app.els['kanji-grade-override'].hidden, true);
  submit(app, 'a valid paraphrase');
  assert.equal(app.els['kanji-grade-override'].textContent, 'Actually... I got this right');
  override(app);
  assert.equal(app.kanjiState().day.answers.length, 1);
  assert.equal(app.kanjiState().day.answers[0].correct, true);
  assert.equal(app.kanjiState().day.answers[0].translation, 'a valid paraphrase');
  assert.equal(app.kanjiState().review.length, 0);
  assert.deepEqual(app.kanjiState().dailyStats['2026-10-16'], { answered: 1, correct: 1 });
  assert.equal(app.els['kanji-grade-override'].textContent, 'Actually... I got this wrong');
  assert.equal(app.els['kanji-input'].disabled, true);
  override(app);
  assert.equal(app.kanjiState().day.answers[0].correct, false);
  assert.equal(app.kanjiState().review.length, 1);
});

test('Next hides the prior correction and a stale click preserves the fresh sign and typed answer', () => {
  let app = launch({ random: 0 }); open(app); submit(app, 'entrance'); submit(app);
  assert.equal(app.els['kanji-grade-override'].hidden, true);
  app.els['kanji-input'].value = 'unfinished exit';
  const before = app.kanjiState(); override(app);
  assert.deepEqual(app.kanjiState(), before);
  assert.equal(app.els['kanji-input'].value, 'unfinished exit');
  app = launch({ saved: app.saved, random: 0 }); open(app);
  assert.equal(app.els['kanji-grade-override'].hidden, true);
  override(app); assert.deepEqual(app.kanjiState(), before);
});

test('a missed sign has a correction until Next, then the fresh prompt has none', () => {
  const app = launch({ random: 0 }); open(app); submit(app, 'my wording');
  assert.equal(app.els['kanji-grade-override'].hidden, false);
  override(app); assert.equal(app.kanjiState().review.length, 0);
  submit(app); assert.equal(app.els['kanji-sign'].textContent, '出口');
  assert.equal(app.els['kanji-grade-override'].hidden, true);
  assert.deepEqual(app.kanjiState().dailyStats['2026-10-16'], { answered: 1, correct: 1 });
});

test('manual corrections on retests update the daily score without changing the earlier new-sign attempt', () => {
  const app = launch({ random: 0 });
  open(app);
  submit(app, 'wrong');
  app.tabs[0].listeners.click();
  open(app);
  submit(app, 'my paraphrase');
  assert.deepEqual(app.kanjiState().dailyStats['2026-10-16'], { answered: 2, correct: 0 });
  override(app);
  assert.equal(app.kanjiState().review.length, 0);
  assert.equal(app.kanjiState().reviewSession.answers[0].correct, true);
  assert.deepEqual(app.kanjiState().dailyStats['2026-10-16'], { answered: 2, correct: 1 });
  submit(app);
  assert.equal(app.kanjiState().reviewSession, null);
  assert.equal(app.els['kanji-sign'].textContent, '出口');
  assert.equal(app.els['kanji-grade-override'].hidden, true);
  override(app);
  assert.equal(app.kanjiState().review.length, 0);
  assert.deepEqual(app.kanjiState().dailyStats['2026-10-16'], { answered: 2, correct: 1 });
  assert.equal(app.kanjiState().day.answers[0].correct, false);
});

test('a correction updates calendar totals without removing the earned stamp', () => {
  const ids = ['入口', '出口', '非常口', '押', '引', '開', '閉', '禁止', '注意', '危険', '立入禁止'];
  const saved = new Map([[kanjiKey, JSON.stringify({ usedIds: ids,
    day: { date: '2026-10-16', currentId: '立入禁止', answers: ids.map((id) => ({ id, correct: true, translation: 'answer' })) },
  })]]);
  const app = launch({ saved });
  open(app);
  override(app);
  assert.equal(app.kanjiState().dailyStats['2026-10-16'].correct, 10);
  assert.equal(app.els['nav-stamp-count'].textContent, '1');
  app.tabs[3].listeners.click();
  const cell = app.els['calendar-grid'].children.find((entry) => entry.dataset.date === '2026-10-16');
  assert.equal(cell.children[1].children[0].textContent, '漢 10');
  assert.match(cell.attributes['aria-label'], /10 correct out of 11 signs practised/);
});

test('revealed meanings remain assisted and a stale correction cannot change a new day', () => {
  const clock = { now: localDay(0, 23, 59) };
  const app = launch({ clock, random: 0 });
  open(app);
  for (let i = 0; i < 3; i++) app.els['kanji-hint-button'].listeners.click();
  submit(app, 'wrong');
  override(app);
  assert.equal(app.kanjiState().day.answers[0].correct, true);
  assert.equal(app.kanjiState().day.answers[0].assisted, true);
  assert.equal(app.kanjiState().review.length, 1);
  assert.equal(app.kanjiState().dailyStats['2026-10-16'].correct, 0);
  clock.now = localDay(1, 0, 1);
  override(app);
  assert.equal(app.kanjiState().day.answers.length, 0);
  assert.equal(app.els['kanji-grade-override'].hidden, true);
});
