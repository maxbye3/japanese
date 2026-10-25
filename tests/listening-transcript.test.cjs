const assert = require('node:assert/strict');
const test = require('node:test');
const { html, key, launch, localDay } = require('./browser-fixture.cjs');

const open = (app) => app.tabs[1].listeners.click();
const next = (app) => app.els['listening-next'].listeners.click();
const play = (app) => app.els['listening-play'].listeners.click();
function compare(app, translation = 'My translation') {
  app.els['listening-input'].value = translation;
  app.els['listening-form'].listeners.submit({ preventDefault() {} });
}

function assertFreshPrompt(app, step) {
  assert.equal(app.els['listening-transcript'].hidden, true);
  assert.equal(app.els['listening-japanese'].textContent, '');
  assert.equal(app.els['listening-feedback'].hidden, true);
  assert.equal(app.els['listening-form'].hidden, false);
  assert.equal(app.els['listening-input'].value, '');
  assert.equal(app.els['listening-step'].textContent, `Phrase ${step} of 10`);
}

test('compare reveals the spoken Japanese; a graded result remains until Next opens an audio-only prompt', () => {
  assert.match(html, /id="listening-next"/);
  for (const gotIt of [true, false]) {
    const app = launch({ random: 0 });
    open(app);
    assertFreshPrompt(app, 1);
    play(app);
    const japanese = app.spoken.at(-1).text;
    compare(app);
    assert.equal(app.els['listening-feedback'].hidden, false);
    assert.equal(app.els['listening-transcript'].hidden, false);
    assert.equal(app.els['listening-japanese'].textContent, japanese);
    assert.equal(app.state().listeningSession.answers.length, 0);
    play(app);
    assert.equal(app.spoken.at(-1).text, japanese);
    app.marks[gotIt ? 0 : 1].listeners.click();
    assert.equal(app.els['listening-transcript'].hidden, false);
    assert.equal(app.els['listening-next'].hidden, false);
    play(app);
    assert.equal(app.spoken.at(-1).text, japanese);
    next(app);
    assertFreshPrompt(app, 2);
    assert.equal(app.els['listening-count'].textContent, '1');
    assert.equal(app.state().listeningSession.answers[0].translation, 'My translation');
    assert.equal(app.state().listeningSession.answers[0].gotIt, gotIt);
    assert.equal(app.state().listeningReview.length, gotIt ? 0 : 1);
    app.marks[0].listeners.click();
    assert.equal(app.state().listeningSession.answers.length, 1);
    play(app);
    assert.notEqual(app.spoken.at(-1).text, japanese);
  }
});

test('reload and tab changes preserve the graded answer until Next; old flags cannot leak corrections', () => {
  let app = launch();
  compare(app);
  app.marks[1].listeners.click();
  const saved = app.saved;
  // A previous version persisted this flag while waiting for an extra Next click.
  const progress = app.state();
  progress.listeningSession.showLastAnswer = true;
  saved.set(key, JSON.stringify(progress));
  app = launch({ saved });
  open(app);
  assert.equal(app.els['listening-grade-override'].hidden, false);
  next(app);
  assertFreshPrompt(app, 2);
  app.tabs[0].listeners.click();
  open(app);
  assertFreshPrompt(app, 2);
  assert.equal(app.state().listeningSession.answers.length, 1);
  assert.equal(app.state().listeningReview.length, 1);
  play(app);
  const japanese = app.spoken.at(-1).text;
  compare(app);
  assert.equal(app.els['listening-japanese'].textContent, japanese);
});

test('the tenth mark awards one stamp, then Next opens the summary with no correction', () => {
  const app = launch();
  for (let index = 0; index < 10; index += 1) {
    play(app);
    compare(app);
    assert.equal(app.els['listening-japanese'].textContent, app.spoken.at(-1).text);
    app.marks[0].listeners.click();
    next(app);
  }
  assert.equal(app.els['listening-count'].textContent, '10');
  assert.equal(app.els['listening-step'].textContent, 'Complete');
  assert.equal(app.els['listening-done'].hidden, false);
  assert.equal(app.els['listening-prompt'].hidden, true);
  assert.equal(app.els['listening-form'].hidden, true);
  assert.equal(app.els['listening-transcript'].hidden, true);
  assert.equal(app.els['nav-stamp-count'].textContent, '1');
  assert.equal(app.state().listeningCompletedDays.length, 1);
  app.marks[0].listeners.click();
  assert.equal(app.state().listeningSession.answers.length, 10);
  // Older completed sessions also skip their former confirmation screen.
  const progress = app.state();
  progress.listeningSession.showLastAnswer = true;
  app.saved.set(key, JSON.stringify(progress));
  const resumed = launch({ saved: app.saved });
  assert.equal(resumed.els['listening-done'].hidden, false);
  resumed.els['listening-restart'].listeners.click();
  assertFreshPrompt(resumed, 1);
  assert.equal(resumed.els['nav-stamp-count'].textContent, '1');
});

test('new days and resets clear the comparison without marking or skipping the new first phrase', () => {
  const clock = { now: localDay(0, 23, 59) };
  const app = launch({ clock });
  open(app);
  compare(app);
  clock.now = localDay(1, 0, 1);
  app.marks[1].listeners.click();
  assert.equal(app.state().listeningSession.answers.length, 0);
  assertFreshPrompt(app, 1);
  compare(app);
  assert.notEqual(app.els['listening-japanese'].textContent, '');
  app.els['reset-progress'].listeners.click();
  assertFreshPrompt(app, 1);
  assert.equal(app.els['listening-count'].textContent, '0');
});


test('Not sure reveals the phrase without typing and saves an unanswered phrase for review', () => {
  const app = launch();
  open(app);
  play(app);
  const japanese = app.spoken.at(-1).text;
  compare(app, '');
  assertFreshPrompt(app, 1);
  app.els['listening-not-sure'].listeners.click({ preventDefault() {} });
  assert.equal(app.els['listening-transcript'].hidden, false);
  assert.equal(app.els['listening-japanese'].textContent, japanese);
  assert.equal(app.els['listening-feedback'].hidden, false);
  assert.equal(app.els['listening-attempt'].textContent, 'Not sure');
  assert.notEqual(app.els['listening-meaning'].textContent, '');
  assert.equal(app.state().listeningSession.answers.length, 0);
  app.marks[1].listeners.click();
  assert.equal(app.els['listening-grade-override'].hidden, false);
  next(app);
  assertFreshPrompt(app, 2);
  assert.equal(app.state().listeningSession.answers[0].translation, '');
  assert.equal(app.state().listeningSession.answers[0].gotIt, false);
  assert.equal(app.state().listeningReview.length, 1);
  assert.match(app.els['listening-review-list'].textContent, /Not sure/);
  const resumed = launch({ saved: app.saved });
  assert.equal(resumed.state().listeningReview.length, 1);
  assertFreshPrompt(resumed, 2);
});
