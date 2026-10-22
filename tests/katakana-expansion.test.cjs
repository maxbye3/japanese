const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const test = require('node:test');
const { launch, key, localDay } = require('./browser-fixture.cjs');
const words = require('./katakana-bank.cjs');

function submit(app, answer) {
  app.els['answer-input'].value = answer;
  app.els['answer-form'].listeners.submit({ preventDefault() {} });
}
const originalIds = Array.from({ length: 83 }, (_, i) => `word-${i + 1}`);

test('the expanded bank adds 200 distinct words while retaining every original saved word identity', () => {
  assert(words.length >= 283);
  // Snapshot of the original 83 ID/kana pairs, which must never be reassigned.
  const original = JSON.stringify(words.slice(0, 83).map(({ id, kana }) => [id, kana]));
  assert.equal(createHash('sha256').update(original).digest('hex'), '6a3d14c249090d0d50cf71cf5e0b6e177fb7bac137cfd2bbbf37f63f1bb0ca60');
  assert.equal(new Set(words.map((word) => word.id)).size, words.length);
  assert.equal(new Set(words.map((word) => word.kana)).size, words.length);
  for (const word of words) {
    assert.match(word.kana, /^[\p{Script=Katakana}ー]+$/u);
    assert(word.english.trim());
    assert(word.answers.every((answer) => typeof answer === 'string' && answer.trim()));
    assert(word.answers.some((answer) => answer.toLowerCase() === word.english.toLowerCase()), word.kana + ' must accept its displayed meaning');
  }
});

test('an exhausted original save resumes with new words while keeping misses, stamps, progress and collectibles', () => {
  const misses = [{ wordId: 'word-15', givenAnswer: 'my earlier answer' }];
  const collectibles = JSON.stringify({ bestStreak: 7, rewards: { sushi: { unlockedOn: '2026-10-10', openedOn: '2026-10-10' } } });
  const saved = new Map([
    [key, JSON.stringify({
      usedWords: originalIds, wrongAnswers: misses,
      days: { '2026-10-15': { correct: 10, completed: true }, '2026-10-16': { correct: 2, completed: false } },
    })],
    ['katakana-quest-gacha-v1', collectibles],
  ]);
  let app = launch({ saved, random: 0 });
  assert.equal(app.els['kana-word'].textContent, 'バス');
  assert.equal(app.els['answer-form'].hidden, false);
  assert.equal(app.state().currentQuestion.wordId, 'word-84');
  assert.deepEqual(app.state().usedWords.slice(0, 83), originalIds);
  assert.deepEqual(app.state().wrongAnswers, misses);
  assert.equal(app.els['correct-count'].textContent, '2');
  assert.equal(app.els['nav-stamp-count'].textContent, '1');
  submit(app, 'bus');
  assert.equal(app.spoken.at(-1).text, 'バス');
  assert.equal(app.els['correct-count'].textContent, '3');
  assert.equal(app.state().currentQuestion.wordId, 'word-85');
  app = launch({ saved, random: 0.9 });
  assert.equal(app.state().currentQuestion.wordId, 'word-85');
  assert.equal(app.state().usedWords.length, 85);
  assert.deepEqual(app.state().wrongAnswers, misses);
  assert.deepEqual(JSON.parse(saved.get('katakana-quest-gacha-v1')).rewards.sushi, JSON.parse(collectibles).rewards.sushi);
});

test('all added words can be answered across daily quests without returning to an old or used word', () => {
  const clock = { now: localDay(0) };
  const saved = new Map([[key, JSON.stringify({ usedWords: originalIds })]]);
  const app = launch({ saved, clock, random: 0 });
  const introduced = new Set();
  words.slice(83).forEach((word, index) => {
    if (index && index % 10 === 0) {
      clock.now = localDay(index / 10);
      app.windowEvents.focus();
    }
    assert.equal(app.state().currentQuestion.wordId, word.id);
    assert.equal(app.els['kana-word'].textContent, word.kana);
    assert.equal(introduced.has(word.id), false);
    introduced.add(word.id);
    submit(app, word.english);
    assert.equal(app.els['correct-count'].textContent, String(index % 10 + 1));
  });
  assert.equal(introduced.size, words.length - 83);
  assert.equal(app.state().usedWords.length, words.length);
  clock.now = localDay(100);
  app.windowEvents.focus();
  assert.equal(app.els['answer-form'].hidden, true);
  assert.match(app.els['feedback'].textContent, /Word bank complete/);
});
