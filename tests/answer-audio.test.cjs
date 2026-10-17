const assert = require('node:assert/strict');
const test = require('node:test');
const { launch } = require('./browser-fixture.cjs');

function submit(app, mode, answer) {
  const prefix = mode === 'kanji' ? 'kanji' : 'answer';
  if (answer !== undefined) app.els[prefix + '-input'].value = answer;
  app.els[prefix + '-form'].listeners.submit({ preventDefault() {} });
}

test('katakana speaks the checked word on correct and wrong guesses, without speaking the next prompt', () => {
  const app = launch({ random: 0 });
  assert.equal(app.spoken.length, 0);
  submit(app, 'katakana', '   ');
  assert.equal(app.spoken.length, 0);
  submit(app, 'katakana', 'ice cream');
  assert.equal(app.els['kana-word'].textContent, 'アニメ');
  assert.equal(app.spoken[0].text, 'アイス');
  assert.equal(app.spoken[0].lang, 'ja-JP');
  assert.equal(app.spoken[0].voice.lang, 'ja-JP');
  submit(app, 'katakana', 'wrong');
  assert.deepEqual(app.spoken.map((utterance) => utterance.text), ['アイス', 'アニメ']);
  submit(app, 'katakana'); // Next word
  assert.equal(app.spoken.length, 2);
  const reloaded = launch({ saved: app.saved });
  assert.equal(reloaded.spoken.length, 0);
});

test('katakana still speaks the tenth answer when the daily quest finishes', () => {
  const app = launch({ random: 0 });
  const meanings = ['ice cream', 'anime', 'apartment', 'america', 'album',
    'air conditioner', 'elevator', 'orange', 'camera', 'calendar'];
  meanings.forEach((meaning) => submit(app, 'katakana', meaning));
  assert.equal(app.els['answer-form'].hidden, true);
  assert.equal(app.spoken.length, 10);
  assert.equal(app.spoken.at(-1).text, 'カレンダー');
});

test('kanji speaks kana readings only after guesses, including correct and wrong retests', () => {
  const app = launch({ random: 0 });
  app.tabs[2].listeners.click();
  submit(app, 'kanji', ' ');
  app.els['kanji-hint-button'].listeners.click();
  assert.equal(app.spoken.length, 0);
  submit(app, 'kanji', 'wrong');
  assert.equal(app.spoken[0].text, 'いりぐち');
  app.els['kanji-grade-override'].listeners.click();
  assert.equal(app.spoken.length, 1);
  app.els['kanji-grade-override'].listeners.click(); // Save it for review again.
  submit(app, 'kanji'); // Next sign
  assert.equal(app.spoken.length, 1);
  submit(app, 'kanji', 'exit');
  assert.equal(app.spoken[1].text, 'でぐち');
  app.tabs[0].listeners.click();
  app.tabs[2].listeners.click(); // Retest the saved entrance.
  assert.equal(app.spoken.length, 2);
  submit(app, 'kanji', 'wrong again');
  assert.equal(app.spoken[2].text, 'いりぐち');
  submit(app, 'kanji'); // Finish review
  assert.equal(app.spoken.length, 3);
  const reloaded = launch({ saved: app.saved });
  reloaded.tabs[2].listeners.click();
  assert.equal(reloaded.spoken.length, 0);
  submit(reloaded, 'kanji', 'entrance');
  assert.equal(reloaded.spoken[0].text, 'いりぐち');
  assert.equal(reloaded.kanjiState().review.length, 0);
});

test('unavailable or failing speech does not block either quiz', () => {
  for (const options of [{ speech: false }, { voice: 'en-US' }, { fails: true }]) {
    const app = launch({ random: 0, ...options });
    if (options.fails) app.synth.speak = () => { throw new Error('Playback unavailable'); };
    submit(app, 'katakana', 'ice cream');
    assert.equal(app.els['correct-count'].textContent, '1');
    app.tabs[2].listeners.click();
    submit(app, 'kanji', 'entrance');
    assert.equal(app.els['kanji-count'].textContent, '1');
    assert.equal(app.els['kanji-input'].disabled, true);
    assert.equal(app.spoken.length, 0);
  }
});

test('new speech and switching modes cancel active audio instead of queuing words', () => {
  const app = launch({ random: 0, autoFinishSpeech: false });
  submit(app, 'katakana', 'ice cream');
  submit(app, 'katakana', 'anime');
  assert.equal(app.synth.cancellations, 1);
  app.tabs[1].listeners.click();
  assert.equal(app.synth.cancellations, 2);
  app.els['listening-play'].listeners.click();
  app.tabs[2].listeners.click();
  assert.equal(app.synth.cancellations, 3);
  submit(app, 'kanji', 'entrance');
  assert.equal(app.spoken.at(-1).text, 'いりぐち');
});
