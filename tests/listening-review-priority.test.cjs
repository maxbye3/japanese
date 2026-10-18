const assert = require('node:assert/strict');
const test = require('node:test');
const { launch, key, localDay } = require('./browser-fixture.cjs');

function answer(app, gotIt) {
  app.els['listening-input'].value = 'My translation';
  app.els['listening-form'].listeners.submit({ preventDefault() {} });
  app.marks[gotIt ? 0 : 1].listeners.click();
}

test('yesterday’s misses lead the next daily ten, with fresh phrases filling the remaining places', () => {
  let app = launch({ random: 0 });
  const yesterday = app.state().listeningSession.phraseIds;
  for (let index = 0; index < 10; index += 1) answer(app, index !== 2 && index !== 7);
  app = launch({ saved: app.saved, clock: { now: localDay(1) }, random: 0 });
  const selected = app.state().listeningSession.phraseIds;
  assert.deepEqual(selected.slice(0, 2), [yesterday[7], yesterday[2]]);
  assert.equal(selected.length, 10);
  assert.equal(new Set(selected).size, 10);
  assert(selected.slice(2).every((id) => !yesterday.includes(id)));
  assert.equal(app.els['listening-transcript'].hidden, true);
  answer(app, true);
  assert.equal(app.els['listening-count'].textContent, '1');
  assert(!app.state().listeningReview.some((entry) => entry.id === yesterday[7]));
  const resumed = launch({ saved: app.saved, clock: { now: localDay(1) }, random: 0.9 });
  assert.deepEqual(resumed.state().listeningSession.phraseIds, selected);
  assert.equal(resumed.els['listening-count'].textContent, '1');
  for (let index = 1; index < 10; index += 1) answer(resumed, true);
  assert.equal(resumed.state().listeningReview.length, 0);
  assert.equal(resumed.els['listening-count'].textContent, '10');
  assert.equal(resumed.els['nav-stamp-count'].textContent, '2');
  resumed.els['listening-restart'].listeners.click();
  assert.deepEqual(resumed.state().listeningSession.phraseIds, selected);
  const tomorrow = launch({ saved: resumed.saved, clock: { now: localDay(2) }, random: 0 });
  assert(tomorrow.state().listeningSession.phraseIds.every((id) => !selected.includes(id) && !yesterday.includes(id)));
});

test('a review backlog is capped at ten distinct valid phrases, newest misses first', () => {
  const source = launch({ random: 0 });
  const first = source.state().listeningSession.phraseIds;
  const second = launch({ saved: source.saved, clock: { now: localDay(1) }, random: 0 }).state().listeningSession.phraseIds;
  const all = [...first, ...second];
  const review = [null, { id: 'unknown-phrase' }, ...all.slice(0, 13).map((id) => ({ id })), { id: all[0] }];
  const saved = new Map([[key, JSON.stringify({ usedListeningPhrases: all, listeningReview: review })]]);
  const app = launch({ saved, random: 0 });
  const selected = app.state().listeningSession.phraseIds;
  assert.deepEqual(selected, [all[0], all[12], all[11], all[10], all[9], all[8], all[7], all[6], all[5], all[4]]);
  assert.equal(new Set(selected).size, 10);
  for (let index = 0; index < 10; index += 1) answer(app, false);
  assert.equal(app.els['listening-done'].hidden, false);
  assert.equal(app.els['nav-stamp-count'].textContent, '1');
});

test('misses added during an existing set do not reroll it, and stay prioritised until understood', () => {
  const clock = { now: localDay(0) };
  let app = launch({ clock, random: 0 });
  const original = app.state().listeningSession.phraseIds;
  answer(app, false);
  app = launch({ saved: app.saved, clock, random: 0.9 });
  assert.deepEqual(app.state().listeningSession.phraseIds, original);
  app.els['listening-restart'].listeners.click();
  assert.deepEqual(app.state().listeningSession.phraseIds, original);
  clock.now = localDay(1);
  app.windowEvents.focus();
  assert.equal(app.state().listeningSession.phraseIds[0], original[0]);
  answer(app, false);
  clock.now = localDay(2);
  app.windowEvents.focus();
  assert.equal(app.state().listeningSession.phraseIds[0], original[0]);
  answer(app, true);
  clock.now = localDay(3);
  app.windowEvents.focus();
  assert(!app.state().listeningSession.phraseIds.includes(original[0]));
});

test('review priority still keeps each daily set distinct at a fresh-phrase cycle boundary', () => {
  const saved = new Map();
  for (let day = 0; day < 12; day += 1) launch({ saved, clock: { now: localDay(day) }, random: 0 });
  const all = JSON.parse(saved.get(key)).usedListeningPhrases;
  const reviewId = all[0];
  saved.set(key, JSON.stringify({
    usedListeningPhrases: all.slice(0, -3), listeningReview: [{ id: reviewId }],
  }));
  const app = launch({ saved, random: 0 });
  const selected = app.state().listeningSession.phraseIds;
  assert.equal(selected[0], reviewId);
  assert(all.slice(-3).every((id) => selected.includes(id)));
  assert.equal(selected.length, 10);
  assert.equal(new Set(selected).size, 10);
});
