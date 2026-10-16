const assert = require('node:assert/strict');
const test = require('node:test');
const { launch, localDay } = require('./browser-fixture.cjs');

const open = (app) => app.tabs[1].listeners.click();
const play = (app) => app.els['listening-play'].listeners.click();
const next = (app) => app.els['listening-next'].listeners.click();
function compare(app, translation = 'My translation') {
  app.els['listening-input'].value = translation;
  app.els['listening-form'].listeners.submit({ preventDefault() {} });
}

test('both right and wrong marks reveal exactly the spoken Japanese, without exposing the next prompt', () => {
  for (const gotIt of [true, false]) {
    const app = launch({ random: 0 });
    open(app);
    assert.equal(app.els['listening-result'].hidden, true);
    assert.equal(app.els['listening-japanese'].textContent, '');
    play(app);
    const japanese = app.spoken.at(-1).text;
    compare(app);
    assert.equal(app.els['listening-result'].hidden, true);
    assert.equal(app.els['listening-japanese'].textContent, '');
    const meaning = app.els['listening-meaning'].textContent;
    app.marks[gotIt ? 0 : 1].listeners.click();
    assert.equal(app.els['listening-japanese'].textContent, japanese);
    assert.equal(app.els['listening-result-meaning'].textContent, meaning);
    assert.equal(app.els['listening-result-attempt'].textContent, 'You wrote: My translation');
    assert.equal(app.els['listening-result'].hidden, false);
    assert.equal(app.els['listening-feedback'].hidden, true);
    assert.equal(app.els['listening-form'].hidden, true);
    assert.equal(app.els['listening-count'].textContent, '1');
    assert.equal(app.els['listening-step'].textContent, 'Phrase 1 of 10');
    assert.match(app.els['listening-result-title'].textContent, gotIt ? /You got it/ : /Saved for review/);
    assert.equal(app.state().listeningReview.length, gotIt ? 0 : 1);
    play(app);
    assert.equal(app.spoken.at(-1).text, japanese);
    compare(app, 'Another attempt must not advance');
    app.marks[0].listeners.click();
    assert.equal(app.state().listeningSession.answers.length, 1);
    next(app);
    assert.equal(app.els['listening-result'].hidden, true);
    assert.equal(app.els['listening-japanese'].textContent, '');
    assert.equal(app.els['listening-form'].hidden, false);
    assert.equal(app.els['listening-step'].textContent, 'Phrase 2 of 10');
    play(app);
    assert.notEqual(app.spoken.at(-1).text, japanese);
  }
});

test('the result resumes across reload and tab changes; next clears it without marking another answer', () => {
  let app = launch();
  play(app);
  const japanese = app.spoken.at(-1).text;
  compare(app);
  app.marks[1].listeners.click();
  app = launch({ saved: app.saved });
  open(app);
  assert.equal(app.els['listening-japanese'].textContent, japanese);
  assert.equal(app.els['listening-result'].hidden, false);
  app.tabs[0].listeners.click();
  open(app);
  assert.equal(app.els['listening-japanese'].textContent, japanese);
  play(app);
  assert.equal(app.spoken.at(-1).text, japanese);
  next(app); next(app);
  assert.equal(app.state().listeningSession.answers.length, 1);
  assert.equal(app.els['listening-japanese'].textContent, '');
  app = launch({ saved: app.saved });
  assert.equal(app.els['listening-result'].hidden, true);
  assert.equal(app.els['listening-japanese'].textContent, '');
  assert.equal(app.els['listening-step'].textContent, 'Phrase 2 of 10');
});

test('the tenth transcript is readable before finishing, without delaying or duplicating its stamp', () => {
  const app = launch();
  for (let index = 0; index < 10; index += 1) {
    compare(app);
    app.marks[0].listeners.click();
    if (index < 9) next(app);
  }
  assert.equal(app.els['listening-count'].textContent, '10');
  assert.equal(app.els['listening-step'].textContent, 'Phrase 10 of 10');
  assert.equal(app.els['listening-result'].hidden, false);
  assert.equal(app.els['listening-done'].hidden, true);
  assert.equal(app.els['listening-next'].textContent, 'Finish today’s set →');
  assert.equal(app.els['nav-stamp-count'].textContent, '1');
  assert.equal(app.state().listeningCompletedDays.length, 1);
  const japanese = app.els['listening-japanese'].textContent;
  play(app);
  assert.equal(app.spoken.at(-1).text, japanese);
  const resumed = launch({ saved: app.saved });
  assert.equal(resumed.els['listening-japanese'].textContent, japanese);
  next(resumed);
  assert.equal(resumed.els['listening-done'].hidden, false);
  assert.equal(resumed.els['listening-japanese'].textContent, '');
  resumed.els['listening-restart'].listeners.click();
  assert.equal(resumed.els['listening-count'].textContent, '0');
  assert.equal(resumed.els['listening-result'].hidden, true);
  assert.equal(resumed.els['listening-japanese'].textContent, '');
  assert.equal(resumed.els['nav-stamp-count'].textContent, '1');
});

test('new days and resets remove the old transcript and never skip the new first phrase', () => {
  const clock = { now: localDay(0, 23, 59) };
  const app = launch({ clock });
  open(app);
  compare(app);
  app.marks[1].listeners.click();
  clock.now = localDay(1, 0, 1);
  next(app);
  assert.equal(app.state().listeningSession.answers.length, 0);
  assert.equal(app.els['listening-japanese'].textContent, '');
  assert.equal(app.els['listening-result'].hidden, true);
  assert.equal(app.els['listening-form'].hidden, false);
  assert.equal(app.els['listening-step'].textContent, 'Phrase 1 of 10');
  compare(app);
  app.marks[0].listeners.click();
  assert.notEqual(app.els['listening-japanese'].textContent, '');
  app.els['reset-progress'].listeners.click();
  assert.equal(app.els['listening-japanese'].textContent, '');
  assert.equal(app.els['listening-result'].hidden, true);
  assert.equal(app.els['listening-count'].textContent, '0');
});
