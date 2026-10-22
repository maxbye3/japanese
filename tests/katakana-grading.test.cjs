const assert = require('node:assert/strict');
const test = require('node:test');
const { launch, key, localDay } = require('./browser-fixture.cjs');
const words = require('./katakana-bank.cjs');

function submit(app, answer) {
  if (answer !== undefined) app.els['answer-input'].value = answer;
  app.els['answer-form'].listeners.submit({ preventDefault() {} });
}
const correct = (app) => app.els['katakana-grade-override'].listeners.click();

test('a rejected katakana answer can be credited once, removed from review, and followed by the next word', () => {
  const app = launch({ random: 0 });
  assert.equal(app.els['katakana-grade-override'].hidden, true);
  submit(app, 'a valid paraphrase');
  assert.equal(app.els['katakana-grade-override'].hidden, false);
  assert.match(app.els['katakana-grade-override'].attributes['aria-label'], /アイス/);
  correct(app);
  assert.equal(app.els['correct-count'].textContent, '1');
  assert.equal(app.els['review-count'].textContent, '0 words');
  assert.equal(app.els['kana-word'].textContent, 'アニメ');
  assert.equal(app.state().usedWords.length, 2);
  assert.equal(app.state().lastKatakanaGrade.manuallyGraded, true);
  assert.equal(app.els['katakana-grade-override'].hidden, true);
  const before = app.state();
  correct(app);
  assert.deepEqual(app.state(), before);
  assert.equal(app.spoken.length, 1); // A correction does not submit or speak another guess.
});

test('katakana corrections survive Next and reload without replacing the current question or typed answer', () => {
  let app = launch({ random: 0 });
  submit(app, 'my wording');
  submit(app);
  app = launch({ saved: app.saved, random: 0.9 });
  assert.equal(app.els['katakana-grade-override'].hidden, false);
  app.els['answer-input'].value = 'unfinished answer';
  const question = app.state().currentQuestion;
  correct(app);
  assert.deepEqual(app.state().currentQuestion, question);
  assert.equal(app.els['answer-input'].value, 'unfinished answer');
  assert.equal(app.els['answer-input'].disabled, false);
  assert.equal(app.els['correct-count'].textContent, '1');
  assert.equal(app.state().usedWords.length, 2);
  app = launch({ saved: app.saved });
  assert.equal(app.els['correct-count'].textContent, '1');
  assert.equal(app.els['katakana-grade-override'].hidden, true);
});

test('correcting the tenth katakana answer completes the quest and earns one stamp without another word', () => {
  const app = launch({ random: 0 });
  ['ice cream', 'anime', 'apartment', 'america', 'album', 'air conditioner',
    'elevator', 'orange', 'camera'].forEach((answer) => submit(app, answer));
  submit(app, 'my calendar paraphrase');
  correct(app);
  assert.equal(app.els['correct-count'].textContent, '10');
  assert.equal(app.els['answer-form'].hidden, true);
  assert.equal(app.els['nav-stamp-count'].textContent, '1');
  assert.equal(app.state().usedWords.length, 10);
  assert.equal(app.state().currentQuestion, null);
  correct(app);
  assert.equal(app.els['correct-count'].textContent, '10');
});

test('a new checked answer, a new day, or reset prevents correcting an older katakana attempt', () => {
  const clock = { now: localDay(0, 23, 59) };
  const app = launch({ random: 0, clock });
  submit(app, 'wrong');
  submit(app);
  submit(app, 'anime');
  correct(app);
  assert.equal(app.els['correct-count'].textContent, '1');
  assert.equal(app.state().wrongAnswers[0].wordId, 'word-1');
  submit(app, 'another paraphrase');
  clock.now = localDay(1, 0, 1);
  correct(app);
  assert.equal(app.els['correct-count'].textContent, '0');
  assert.equal(app.els['katakana-grade-override'].hidden, true);
  assert.equal(app.state().days['2026-10-16'].correct, 1);
  app.els['reset-progress'].listeners.click();
  correct(app);
  assert.equal(app.els['correct-count'].textContent, '0');
  assert.equal(app.state().lastKatakanaGrade, null);
});

test('correcting the last word in the bank keeps the bank complete without a phantom question', () => {
  const saved = new Map([[key, JSON.stringify({ usedWords: words.slice(0, -1).map((word) => word.id) })]]);
  const app = launch({ saved, random: 0 });
  submit(app, 'my paraphrase of the last word');
  correct(app);
  assert.equal(app.els['correct-count'].textContent, '1');
  assert.equal(app.els['answer-form'].hidden, true);
  assert.equal(app.state().usedWords.length, words.length);
  assert.match(app.els['feedback'].textContent, /Word bank complete/);
});
