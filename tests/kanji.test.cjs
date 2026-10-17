const assert = require('node:assert/strict');
const test = require('node:test');
const { kanjiKey, localDay, launch } = require('./browser-fixture.cjs');

function open(app) {
  app.tabs[2].listeners.click();
}

function submit(app, translation) {
  if (translation !== undefined) app.els['kanji-input'].value = translation;
  app.els['kanji-form'].listeners.submit({ preventDefault() {} });
}

function finishReview(app) {
  let tested = 0;
  while (app.kanjiState().reviewSession) {
    assert(tested < 120, 'A review round should ask each saved sign only once');
    const before = app.kanjiState();
    if (!app.els['kanji-input'].disabled) submit(app, 'still learning');
    assert.deepEqual(app.kanjiState().usedIds, before.usedIds);
    assert.deepEqual(app.kanjiState().day.answers, before.day.answers);
    submit(app);
    tested += 1;
  }
}

test('only opening kanji introduces a sign; reload resumes without reserving another', () => {
  let app = launch({ random: 0 });
  assert.equal(app.kanjiState(), null);
  open(app);
  assert.equal(app.els['kanji-view'].hidden, false);
  assert.equal(app.els['quest-view'].hidden, true);
  assert.equal(app.els['listening-view'].hidden, true);
  assert.equal(app.els['calendar-view'].hidden, true);
  assert.equal(app.els['kanji-sign'].textContent, '入口');
  assert.equal(app.els['kanji-reading'].hidden, true);
  assert.equal(app.kanjiState().usedIds.length, 1);
  app = launch({ saved: app.saved, random: 0.95 });
  open(app);
  assert.equal(app.els['kanji-sign'].textContent, '入口');
  assert.equal(app.kanjiState().usedIds.length, 1);
  submit(app, 'The entrance!');
  assert.equal(app.kanjiState().day.answers[0].correct, true);
  assert.equal(app.els['kanji-reading'].textContent, 'いりぐち');
  assert.equal(app.els['kanji-reading'].hidden, false);
  app = launch({ saved: app.saved });
  open(app);
  assert.equal(app.els['kanji-input'].disabled, true);
  assert.equal(app.els['kanji-count'].textContent, '1');
  submit(app);
  assert.notEqual(app.els['kanji-sign'].textContent, '入口');
  assert.equal(app.kanjiState().usedIds.length, 2);
});

test('missed signs stay in review and the katakana/listening reset preserves kanji history', () => {
  const app = launch({ random: 0 });
  open(app);
  submit(app, '   ');
  assert.equal(app.kanjiState().day.answers.length, 0);
  submit(app, 'no idea');
  assert.equal(app.els['kanji-review-count'].textContent, '1 sign');
  const item = app.els['kanji-review-list'].children[0];
  assert.equal(item.children[0].textContent, '入口');
  assert.equal(item.children[1].children[0].textContent, 'entrance');
  assert.equal(item.children[1].children[1].textContent, 'いりぐち');
  const beforeReset = app.kanjiState();
  app.els['reset-progress'].listeners.click();
  assert.deepEqual(app.kanjiState(), beforeReset);
  open(app);
  assert.equal(app.els['kanji-sign'].textContent, '入口');
  assert.equal(app.els['kanji-reading'].hidden, true);
  submit(app, 'entrance');
  assert.equal(app.els['kanji-review-count'].textContent, '0 signs');
  submit(app);
  assert.notEqual(app.els['kanji-sign'].textContent, '入口');
  assert.equal(app.els['kanji-review-count'].textContent, '0 signs');
});

test('120 new signs are introduced once; saved misses remain reviewable after bank exhaustion', () => {
  const saved = new Map();
  const seen = new Set();
  for (let day = 0; day < 12; day += 1) {
    const app = launch({ saved, clock: { now: localDay(day) } });
    open(app);
    finishReview(app);
    for (let count = 0; count < 10; count += 1) {
      const sign = app.els['kanji-sign'].textContent;
      assert.match(sign, /[一-龯]/u);
      assert.equal(seen.has(sign), false, 'A sign was repeated in a new question');
      seen.add(sign);
      submit(app, 'not the meaning');
      if (count < 9) submit(app);
    }
    assert.equal(app.els['kanji-count'].textContent, String(day * 10 + 10));
    assert.equal(app.els['kanji-form'].hidden, false);
    assert.equal(app.els['kanji-input'].disabled, true);
    assert.equal(app.els['kanji-reward'].hidden, false);
    assert.equal(app.els['kanji-submit'].textContent, day === 0 ? 'Keep going →' : 'Next sign →');
    assert.equal(app.kanjiState().day.answers.length, 10);
  }
  assert.equal(seen.size, 120);
  for (const day of [12, 13, 30]) {
    const app = launch({ saved, clock: { now: localDay(day) } });
    open(app);
    assert.equal(app.els['kanji-round'].hidden, false);
    finishReview(app);
    assert.equal(app.els['kanji-form'].hidden, true);
    assert.equal(app.els['kanji-context'].textContent, 'Bank complete');
    assert.equal(app.kanjiState().usedIds.length, 120);
    assert.equal(app.els['kanji-review-count'].textContent, '120 signs');
  }

  const ids = [...seen];
  const partial = new Map([[kanjiKey, JSON.stringify({ usedIds: ids.slice(0, -1) })]]);
  const app = launch({ saved: partial });
  open(app);
  assert.equal(app.els['kanji-sign'].textContent, ids.at(-1));
  submit(app, 'not the meaning');
  submit(app);
  assert.equal(app.els['kanji-form'].hidden, true);
  assert.equal(app.els['kanji-context'].textContent, 'Bank complete');
  assert.equal(app.els['kanji-count'].textContent, '1');
  assert.equal(app.kanjiState().usedIds.length, 120);
});

test('midnight discards a stale answer and never repeats an abandoned sign', () => {
  const clock = { now: localDay(0, 23, 59) };
  const app = launch({ clock, random: 0 });
  open(app);
  const oldSign = app.els['kanji-sign'].textContent;
  clock.now = localDay(1, 0, 1);
  submit(app, 'answer typed yesterday');
  assert.equal(app.els['kanji-count'].textContent, '0');
  assert.notEqual(app.els['kanji-sign'].textContent, oldSign);
  assert.equal(app.kanjiState().usedIds.length, 2);
  assert.equal(app.kanjiState().day.date, '2026-10-17');
  clock.now = localDay(2);
  app.windowEvents.focus();
  assert.equal(app.kanjiState().day.date, '2026-10-18');
  app.tabs[0].listeners.click();
  const reserved = app.kanjiState().usedIds.length;
  clock.now = localDay(3);
  app.intervals.forEach((callback) => callback());
  assert.equal(app.kanjiState().usedIds.length, reserved);
  open(app);
  assert.equal(app.kanjiState().day.date, '2026-10-19');
  assert.equal(app.kanjiState().usedIds.length, reserved + 1);
});

test('returning retests a saved miss before resuming an unfinished new sign', () => {
  let app = launch({ random: 0 });
  open(app);
  submit(app, 'no idea');
  submit(app);
  assert.equal(app.els['kanji-sign'].textContent, '出口');
  app = launch({ saved: app.saved });
  open(app);
  assert.equal(app.els['kanji-sign'].textContent, '入口');
  assert.equal(app.els['kanji-round'].textContent, 'Review from last time · 1 of 1');
  assert.equal(app.els['kanji-reading'].hidden, true);
  assert.equal(app.els['kanji-review-list'].hidden, true);
  assert.equal(app.kanjiState().usedIds.length, 2);
  submit(app, 'The entrance!');
  assert.equal(app.kanjiState().review.length, 0);
  assert.equal(app.kanjiState().day.answers.length, 1);
  assert.equal(app.els['nav-stamp-count'].textContent, '0');

  app = launch({ saved: app.saved });
  open(app);
  assert.equal(app.els['kanji-input'].disabled, true);
  assert.equal(app.kanjiState().reviewSession.answers.length, 1);
  submit(app);
  assert.equal(app.kanjiState().reviewSession, null);
  assert.equal(app.els['kanji-sign'].textContent, '出口');
  assert.equal(app.els['kanji-input'].disabled, false);
  assert.equal(app.kanjiState().usedIds.length, 2);
  submit(app, 'exit');
  assert.equal(app.kanjiState().day.answers.length, 2);
});

test('another miss waits for the next visit without duplicating the saved sign', () => {
  const app = launch({ random: 0 });
  open(app);
  submit(app, 'first miss');
  submit(app);
  app.tabs[0].listeners.click();
  open(app);
  assert.equal(app.els['kanji-sign'].textContent, '入口');
  submit(app, 'second miss');
  assert.equal(app.kanjiState().review.length, 1);
  assert.equal(app.kanjiState().review[0].translation, 'second miss');
  submit(app);
  assert.equal(app.kanjiState().reviewSession, null);
  assert.equal(app.els['kanji-sign'].textContent, '出口');
  assert.equal(app.kanjiState().day.answers.length, 1);
  app.tabs[0].listeners.click();
  open(app);
  assert.equal(app.els['kanji-sign'].textContent, '入口');
  assert.equal(app.els['kanji-reading'].hidden, true);
  assert.equal(app.els['kanji-input'].disabled, false);
  submit(app, 'entrance');
  submit(app);
  assert.equal(app.kanjiState().review.length, 0);
  assert.equal(app.kanjiState().usedIds.length, 2);
  assert.equal(app.els['kanji-count'].textContent, '3');
});

test('review after the daily ten adds to daily progress without consuming new signs or awarding extra stamps', () => {
  const ids = ['入口', '出口', '非常口', '押', '引', '開', '閉', '禁止', '注意', '危険'];
  const saved = new Map([[kanjiKey, JSON.stringify({
    usedIds: ids,
    day: { date: '2026-10-16', currentId: '危険', answers: ids.map((id) => ({ id, correct: false })) },
    review: [{ id: '入口', translation: 'old miss' }, { id: '出口', translation: 'old miss' }],
  })]]);
  const app = launch({ saved });
  open(app);
  assert.equal(app.els['kanji-count'].textContent, '10');
  assert.equal(app.els['nav-stamp-count'].textContent, '1');
  assert.equal(app.els['kanji-form'].hidden, false);
  submit(app, 'entrance');
  submit(app);
  assert.equal(app.els['kanji-sign'].textContent, '出口');
  assert.equal(app.els['kanji-round'].textContent, 'Review from last time · 2 of 2');
  assert.equal(app.els['kanji-reading'].hidden, true);
  submit(app, 'exit');
  submit(app);
  assert.equal(app.els['kanji-form'].hidden, false);
  assert.equal(app.els['kanji-input'].disabled, false);
  assert.equal(app.kanjiState().review.length, 0);
  assert.deepEqual(app.kanjiState().usedIds.slice(0, 10), ids);
  assert.equal(app.kanjiState().usedIds.length, 11);
  assert.equal(ids.includes(app.els['kanji-sign'].textContent), false);
  assert.equal(app.kanjiState().day.answers.length, 10);
  assert.equal(app.els['kanji-count'].textContent, '12');
  assert.deepEqual(app.kanjiState().dailyStats['2026-10-16'], { answered: 12, correct: 2 });
  assert.equal(app.els['nav-stamp-count'].textContent, '1');
  assert.deepEqual(app.kanjiState().completedDays, ['2026-10-16']);
});

test('legacy saved misses carry into the next day and failed retests are scheduled again', () => {
  const ids = ['入口', '出口', '非常口', '押', '引', '開', '閉', '禁止', '注意', '危険'];
  const clock = { now: localDay(1) };
  const saved = new Map([[kanjiKey, JSON.stringify({
    usedIds: ids,
    day: { date: '2026-10-16', currentId: '危険', answers: ids.map((id) => ({ id, correct: false })) },
    review: [{ id: '入口', translation: 'old miss' }, { id: '出口', translation: 'old miss' }],
  })]]);
  const app = launch({ saved, clock, random: 0 });
  open(app);
  assert.equal(app.els['kanji-sign'].textContent, '入口');
  assert.equal(app.els['kanji-count'].textContent, '0');
  assert.equal(app.kanjiState().usedIds.length, 10);
  submit(app, 'entrance');
  submit(app);
  submit(app, 'still unsure');
  submit(app);
  assert.equal(app.kanjiState().review.length, 1);
  assert.equal(app.kanjiState().review[0].id, '出口');
  assert.equal(app.kanjiState().usedIds.length, 11);
  clock.now = localDay(2);
  app.windowEvents.focus();
  assert.equal(app.els['kanji-sign'].textContent, '出口');
  assert.equal(app.els['kanji-reading'].hidden, true);
  assert.equal(app.els['kanji-count'].textContent, '0');
  assert.equal(app.kanjiState().usedIds.length, 11);
  assert.equal(app.els['nav-stamp-count'].textContent, '1');
});
