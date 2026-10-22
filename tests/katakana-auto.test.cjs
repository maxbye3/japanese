const assert = require('node:assert/strict');
const test = require('node:test');
const { launch, key, localDay } = require('./browser-fixture.cjs');
const words = require('./katakana-bank.cjs');

function submit(app, answer) {
  if (answer !== undefined) app.els['answer-input'].value = answer;
  app.els['answer-form'].listeners.submit({ preventDefault() {} });
}

test('a correct katakana answer immediately shows the next word with feedback and an empty enabled input', () => {
  const app = launch({ random: 0 });
  submit(app, 'ice cream');
  assert.equal(app.els['kana-word'].textContent, 'アニメ');
  assert.equal(app.els['answer-input'].value, '');
  assert.equal(app.els['answer-input'].disabled, false);
  assert.equal(app.els['submit-answer'].disabled, false);
  assert.equal(app.els['correct-count'].textContent, '1');
  assert.equal(app.state().usedWords.length, 2);
  assert.equal(app.state().currentQuestion.wordId, 'word-2');
  assert.equal(app.els['feedback'].hidden, false);
  assert.match(app.els['feedback'].children[1].children[1].textContent, /アイス = ice cream/);
  submit(app, 'anime');
  assert.equal(app.els['kana-word'].textContent, 'アパート');
  assert.equal(app.els['correct-count'].textContent, '2');
});

test('wrong answers wait for Next and save the correction; blank or repeated empty submits do nothing', () => {
  const app = launch({ random: 0 });
  const before = app.state();
  submit(app, '   ');
  assert.deepEqual(app.state(), before);
  submit(app, 'wrong');
  assert.equal(app.els['kana-word'].textContent, 'アイス');
  assert.equal(app.els['answer-input'].disabled, true);
  assert.match(app.els['feedback'].children[1].children[1].textContent, /ice cream/);
  assert.equal(app.state().wrongAnswers.length, 1);
  submit(app);
  assert.equal(app.els['kana-word'].textContent, 'アニメ');
  submit(app, 'anime');
  const after = app.state();
  submit(app);
  assert.deepEqual(app.state(), after);
});

test('the tenth correct answer stamps the day without reserving an eleventh word', () => {
  const app = launch({ random: 0 });
  const meanings = ['ice cream', 'anime', 'apartment', 'america', 'album',
    'air conditioner', 'elevator', 'orange', 'camera', 'calendar'];
  meanings.forEach((meaning) => submit(app, meaning));
  assert.equal(app.els['correct-count'].textContent, '10');
  assert.equal(app.els['answer-form'].hidden, true);
  assert.equal(app.state().usedWords.length, 10);
  assert.equal(app.state().currentQuestion, null);
  assert.equal(app.els['nav-stamp-count'].textContent, '1');
  assert.match(app.els['feedback'].children[1].children[0].textContent, /Quest complete/);
  submit(app);
  assert.equal(app.state().usedWords.length, 10);
});

test('reload resumes the automatically selected next word without reserving another', () => {
  let app = launch({ random: 0 });
  submit(app, 'ice cream');
  app = launch({ saved: app.saved, random: 0.9 });
  assert.equal(app.els['kana-word'].textContent, 'アニメ');
  assert.equal(app.state().usedWords.length, 2);
  assert.equal(app.els['correct-count'].textContent, '1');
});

test('midnight discards the stale answer instead of auto-advancing or crediting the new day', () => {
  const clock = { now: localDay(0, 23, 59) };
  const app = launch({ random: 0, clock });
  clock.now = localDay(1, 0, 1);
  submit(app, 'ice cream');
  assert.equal(app.els['correct-count'].textContent, '0');
  assert.equal(app.els['kana-word'].textContent, 'アニメ');
  assert.equal(app.state().days['2026-10-16'].correct, 0);
});

test('exhausting the word bank keeps the completion message instead of showing a phantom next question', () => {
  const usedWords = words.slice(0, -1).map((word) => word.id);
  const saved = new Map([[key, JSON.stringify({ usedWords })]]);
  const app = launch({ saved, random: 0 });
  assert.equal(app.els['kana-word'].textContent, words.at(-1).kana);
  submit(app, words.at(-1).english);
  assert.equal(app.state().usedWords.length, words.length);
  assert.equal(app.state().currentQuestion, null);
  assert.equal(app.els['answer-form'].hidden, true);
  assert.match(app.els['feedback'].children[1].children[0].textContent, /Word bank complete/);
});
