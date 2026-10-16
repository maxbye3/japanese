const assert = require('node:assert/strict');
const test = require('node:test');
const { key, kanjiKey, localDay, launch } = require('./browser-fixture.cjs');

function cell(app, date) {
  return app.els['calendar-grid'].children.find((item) => item.dataset.date === date);
}

function stamps(app, date) {
  const day = cell(app, date);
  return day && day.children[1] ? day.children[1].children.map((stamp) => stamp.textContent) : [];
}

function submit(app, form) {
  app.els[form].listeners.submit({ preventDefault() {} });
}

function listeningAnswer(app) {
  app.els['listening-input'].value = 'My translation';
  submit(app, 'listening-form');
  app.marks[0].listeners.click();
  app.els['listening-next'].listeners.click();
}

test('each category earns one distinct stamp only when its daily set is complete', () => {
  let app = launch({ random: 0 });
  const meanings = ['ice cream', 'anime', 'apartment', 'america', 'album',
    'air conditioner', 'elevator', 'orange', 'camera', 'calendar'];
  meanings.forEach((meaning, index) => {
    app.els['answer-input'].value = meaning;
    submit(app, 'answer-form');
    if (index < 9) {
      assert.equal(app.els['nav-stamp-count'].textContent, '0');
      submit(app, 'answer-form');
    }
  });
  assert.equal(app.els['nav-stamp-count'].textContent, '1');
  for (let index = 0; index < 10; index += 1) {
    listeningAnswer(app);
    if (index < 9) assert.equal(app.els['nav-stamp-count'].textContent, '1');
  }
  assert.equal(app.els['nav-stamp-count'].textContent, '2');
  app.tabs[2].listeners.click();
  for (let index = 0; index < 10; index += 1) {
    app.els['kanji-input'].value = 'not the meaning';
    submit(app, 'kanji-form');
    if (index < 9) {
      assert.equal(app.els['nav-stamp-count'].textContent, '2');
      submit(app, 'kanji-form');
    }
  }
  assert.equal(app.els['nav-stamp-count'].textContent, '3');
  app.tabs[3].listeners.click();
  assert.deepEqual(stamps(app, '2026-10-16'), ['カ', '♪', '漢']);
  assert.match(cell(app, '2026-10-16').attributes['aria-label'], /Katakana, N4 listening, Everyday kanji/);
  assert.equal(app.els['stamp-total'].textContent, '3');

  app = launch({ saved: app.saved });
  app.tabs[3].listeners.click();
  assert.deepEqual(stamps(app, '2026-10-16'), ['カ', '♪', '漢']);
  app.els['listening-restart'].listeners.click();
  assert.equal(app.els['listening-count'].textContent, '0');
  assert.equal(app.els['nav-stamp-count'].textContent, '3');
  for (let index = 0; index < 10; index += 1) listeningAnswer(app);
  assert.equal(app.els['stamp-total'].textContent, '3');
  assert.deepEqual(app.state().listeningCompletedDays, ['2026-10-16']);
  assert.deepEqual(app.kanjiState().completedDays, ['2026-10-16']);

  app.els['reset-progress'].listeners.click();
  app.tabs[3].listeners.click();
  assert.deepEqual(stamps(app, '2026-10-16'), ['漢']);
  assert.equal(app.els['nav-stamp-count'].textContent, '1');
  assert.equal(app.els['stamp-total'].textContent, '1');
});

test('existing saved completions are backfilled and remain on their original dates across rollover', () => {
  const saved = new Map([
    [key, JSON.stringify({
      days: {
        '2026-09-30': { correct: 10, completed: true },
        '2026-10-15': { correct: 10, completed: true },
        '2026-10-16': { correct: 9, completed: false },
      },
      listeningSession: {
        date: '2026-10-15', phraseIds: [],
        answers: Array.from({ length: 10 }, () => ({ gotIt: true })),
      },
    })],
    [kanjiKey, JSON.stringify({
      day: { date: '2026-10-14', answers: Array.from({ length: 10 }, () => ({ correct: false })) },
    })],
  ]);
  let app = launch({ saved });
  app.tabs[3].listeners.click();
  assert.deepEqual(stamps(app, '2026-10-14'), ['漢']);
  assert.deepEqual(stamps(app, '2026-10-15'), ['カ', '♪']);
  assert.deepEqual(stamps(app, '2026-10-16'), []);
  assert.equal(app.els['stamp-total'].textContent, '4');
  app.els['previous-month'].listeners.click();
  assert.deepEqual(stamps(app, '2026-09-30'), ['カ']);
  app.els['next-month'].listeners.click();
  assert.deepEqual(stamps(app, '2026-10-15'), ['カ', '♪']);
  app.tabs[2].listeners.click();
  assert.deepEqual(app.kanjiState().completedDays, ['2026-10-14']);
  app = launch({ saved, clock: { now: localDay(1) } });
  app.tabs[3].listeners.click();
  assert.deepEqual(stamps(app, '2026-10-14'), ['漢']);
  assert.deepEqual(stamps(app, '2026-10-15'), ['カ', '♪']);
  assert.equal(app.els['stamp-total'].textContent, '4');
});

test('katakana completion after midnight belongs to the new local day', () => {
  const clock = { now: localDay(0, 23, 59) };
  const saved = new Map([[key, JSON.stringify({
    usedWords: ['word-1'],
    days: { '2026-10-16': { correct: 9, completed: false } },
    currentQuestion: { date: '2026-10-16', wordId: 'word-1' },
  })]]);
  const app = launch({ saved, clock, random: 0 });
  app.els['answer-input'].value = 'ice cream';
  clock.now = localDay(1, 0, 1);
  submit(app, 'answer-form');
  assert.equal(app.state().days['2026-10-16'].completed, false);
  assert.equal(app.els['correct-count'].textContent, '0');
  const meanings = ['anime', 'apartment', 'america', 'album', 'air conditioner',
    'elevator', 'orange', 'camera', 'calendar', 'guitar'];
  meanings.forEach((meaning, index) => {
    app.els['answer-input'].value = meaning;
    submit(app, 'answer-form');
    if (index < 9) submit(app, 'answer-form');
  });
  app.tabs[3].listeners.click();
  assert.deepEqual(stamps(app, '2026-10-16'), []);
  assert.deepEqual(stamps(app, '2026-10-17'), ['カ']);
  assert.equal(app.els['stamp-total'].textContent, '1');
});
