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
  submit(app);
  assert.notEqual(app.els['kanji-sign'].textContent, '入口');
  assert.equal(app.els['kanji-review-count'].textContent, '1 sign');
});

test('120 signs are introduced once across twelve days, then the bank stops permanently', () => {
  const saved = new Map();
  const seen = new Set();
  for (let day = 0; day < 12; day += 1) {
    const app = launch({ saved, clock: { now: localDay(day) } });
    open(app);
    for (let count = 0; count < 10; count += 1) {
      const sign = app.els['kanji-sign'].textContent;
      assert.match(sign, /[一-龯]/u);
      assert.equal(seen.has(sign), false, 'A sign was repeated in a new question');
      seen.add(sign);
      submit(app, 'not the meaning');
      if (count < 9) submit(app);
    }
    assert.equal(app.els['kanji-count'].textContent, '10');
    assert.equal(app.els['kanji-form'].hidden, true);
    assert.match(app.els['kanji-feedback'].children[1].children[0].textContent, /Ten signs done/);
    submit(app);
    assert.equal(app.kanjiState().day.answers.length, 10);
  }
  assert.equal(seen.size, 120);
  for (const day of [12, 13, 30]) {
    const app = launch({ saved, clock: { now: localDay(day) } });
    open(app);
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
