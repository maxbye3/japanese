const assert = require('node:assert/strict');
const test = require('node:test');
const { kanjiKey, launch, localDay } = require('./browser-fixture.cjs');

const open = (app) => app.tabs[2].listeners.click();
const hint = (app) => app.els['kanji-hint-button'].listeners.click();
function submit(app, text) {
  if (text !== undefined) app.els['kanji-input'].value = text;
  app.els['kanji-form'].listeners.submit({ preventDefault() {} });
}

test('hints reveal a clue, reading, then meaning without advancing or clearing typed text', () => {
  const app = launch({ random: 0 });
  open(app);
  const before = app.kanjiState();
  assert.equal(app.els['kanji-hints'].hidden, false);
  assert.equal(app.els['kanji-hint-detail'].hidden, true);
  assert.equal(app.els['kanji-hint-meaning'].textContent, '');
  app.els['kanji-input'].value = 'my guess';
  hint(app);
  assert.match(app.els['kanji-hint-clue'].textContent, /go into a building/);
  assert.equal(app.els['kanji-hint-reading'].hidden, true);
  assert.equal(app.els['kanji-hint-meaning'].hidden, true);
  assert.equal(app.els['kanji-hint-button'].attributes['aria-expanded'], 'true');
  hint(app);
  assert.equal(app.els['kanji-hint-reading'].textContent, 'いりぐち');
  assert.equal(app.els['kanji-hint-reading'].hidden, false);
  assert.equal(app.els['kanji-hint-meaning'].textContent, '');
  hint(app);
  assert.equal(app.els['kanji-hint-meaning'].textContent, 'Meaning: entrance');
  assert.equal(app.els['kanji-hint-button'].hidden, true);
  hint(app);
  assert.equal(app.kanjiState().day.hints['入口'], 3);
  assert.equal(app.els['kanji-input'].value, 'my guess');
  assert.deepEqual(app.kanjiState().usedIds, before.usedIds);
  assert.deepEqual(app.kanjiState().day.answers, before.day.answers);
  assert.equal(app.els['kanji-count'].textContent, '0');
  assert.equal(app.els['nav-stamp-count'].textContent, '0');
});

test('full reveals survive reload and are saved for review even with the correct translation', () => {
  let app = launch({ random: 0 });
  open(app);
  hint(app); hint(app); hint(app);
  app = launch({ saved: app.saved, random: 0 });
  open(app);
  assert.equal(app.els['kanji-hint-meaning'].hidden, false);
  submit(app, 'entrance');
  assert.equal(app.kanjiState().day.answers[0].assisted, true);
  assert.equal(app.kanjiState().review.length, 1);
  assert.equal(app.els['kanji-hints'].hidden, true);
  assert.match(app.els['kanji-feedback'].children[1].children[1].textContent, /saved for another try/);
  submit(app);
  assert.equal(app.els['kanji-sign'].textContent, '出口');
  assert.equal(app.els['kanji-hint-detail'].hidden, true);
  assert.equal(app.els['kanji-hint-meaning'].textContent, '');
  assert.equal(app.els['kanji-hint-button'].hidden, false);
  assert.equal(app.els['kanji-hint-button'].attributes['aria-expanded'], 'false');
});

test('retests offer hints, keep revealed answers pending, and clear a later unrevealed answer', () => {
  let app = launch({ random: 0 });
  open(app);
  submit(app, 'not sure');
  app = launch({ saved: app.saved, random: 0 });
  open(app);
  const before = app.kanjiState();
  assert.equal(app.els['kanji-hint-detail'].hidden, true);
  hint(app); hint(app); hint(app);
  app = launch({ saved: app.saved, random: 0 });
  open(app);
  assert.equal(app.els['kanji-hint-meaning'].hidden, false);
  submit(app, 'entry');
  assert.equal(app.kanjiState().review.length, 1);
  assert.equal(app.kanjiState().reviewSession.answers[0].assisted, true);
  assert.deepEqual(app.kanjiState().day.answers, before.day.answers);
  assert.deepEqual(app.kanjiState().usedIds, before.usedIds);
  assert.equal(app.els['nav-stamp-count'].textContent, '0');
  submit(app);
  open(app);
  assert.equal(app.els['kanji-sign'].textContent, '入口');
  assert.equal(app.els['kanji-hint-detail'].hidden, true);
  hint(app); hint(app);
  submit(app, 'entrance');
  assert.equal(app.kanjiState().review.length, 0);
  assert.match(app.els['kanji-feedback'].children[1].children[1].textContent, /Removed from review/);
});

test('clues and readings alone do not mark a correct new answer as revealed', () => {
  for (const count of [1, 2]) {
    const app = launch({ random: 0 });
    open(app);
    for (let i = 0; i < count; i += 1) hint(app);
    submit(app, 'entrance');
    assert.equal(app.kanjiState().review.length, 0);
    assert.equal(app.kanjiState().day.answers[0].assisted, false);
  }
});

test('midnight resets hints instead of applying a stale click to the next question', () => {
  const clock = { now: localDay(0, 23, 59) };
  const app = launch({ clock, random: 0 });
  open(app);
  hint(app); hint(app); hint(app);
  clock.now = localDay(1, 0, 1);
  hint(app);
  assert.equal(app.els['kanji-sign'].textContent, '出口');
  assert.equal(app.els['kanji-hint-detail'].hidden, true);
  assert.equal(app.kanjiState().day.hints, undefined);
  assert.equal(app.kanjiState().day.answers.length, 0);
});

test('all 120 signs have clues; hints stay hidden after completion and bank exhaustion', () => {
  const ids = [];
  for (let day = 0; day < 12; day += 1) {
    const saved = new Map([[kanjiKey, JSON.stringify({ usedIds: ids })]]);
    const app = launch({ saved, clock: { now: localDay(day) }, random: 0 });
    open(app);
    for (let question = 0; question < 10; question += 1) {
      ids.push(app.els['kanji-sign'].textContent);
      hint(app);
      assert.doesNotMatch(app.els['kanji-hint-clue'].textContent, /undefined/);
      assert(app.els['kanji-hint-clue'].textContent.length > 20);
      hint(app); hint(app);
      const meaning = app.els['kanji-hint-meaning'].textContent.replace('Meaning: ', '');
      submit(app, meaning);
      if (question < 9) submit(app);
    }
    assert.equal(app.els['kanji-hints'].hidden, true);
    assert.match(app.els['kanji-feedback'].children[1].children[1].textContent, /0 \/ 10 correct without revealing/);
    assert.equal(app.kanjiState().review.length, 10);
    assert.equal(app.els['nav-stamp-count'].textContent, '1');
  }
  const app = launch({ saved: new Map([[kanjiKey, JSON.stringify({ usedIds: ids })]]) });
  open(app);
  assert.equal(app.els['kanji-hints'].hidden, true);
  hint(app);
  assert.equal(app.kanjiState().day.answers.length, 0);
});
