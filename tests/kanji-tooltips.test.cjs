const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const { launch, kanjiKey, localDay } = require('./browser-fixture.cjs');

const open = (app) => app.tabs[2].listeners.click();
const buttons = (app) => app.els['kanji-sign'].children.filter((item) => item.dataset.kanji);
const click = (button) => button.listeners.click();
function submit(app, translation) {
  if (translation !== undefined) app.els['kanji-input'].value = translation;
  app.els['kanji-form'].listeners.submit({ preventDefault() {} });
}
function withSign(id) {
  return new Map([[kanjiKey, JSON.stringify({ usedIds: [id],
    day: { date: '2026-10-16', currentId: id, answers: [] } })]]);
}

test('each character has its own meaning, without changing text, typed input, score or word hints', () => {
  const app = launch({ random: 0 });
  open(app);
  const before = app.kanjiState();
  const [enter, mouth] = buttons(app);
  assert.equal(enter.textContent, '入');
  assert.equal(mouth.textContent, '口');
  assert.equal(app.els['kanji-sign'].textContent, '入口');
  assert.equal(enter.attributes['aria-describedby'], undefined);
  app.els['kanji-input'].value = 'my unfinished guess';
  click(enter);
  assert.equal(app.els['kanji-tooltip'].hidden, false);
  assert.equal(app.els['kanji-tooltip-character'].textContent, '入');
  assert.match(app.els['kanji-tooltip-meaning'].textContent, /enter/);
  assert.equal(enter.attributes['aria-expanded'], 'true');
  assert.equal(enter.attributes['aria-describedby'], 'kanji-tooltip');
  click(mouth);
  assert.equal(enter.attributes['aria-expanded'], 'false');
  assert.equal(enter.attributes['aria-describedby'], undefined);
  assert.equal(app.els['kanji-tooltip-character'].textContent, '口');
  assert.match(app.els['kanji-tooltip-meaning'].textContent, /mouth/);
  assert.equal(app.els['kanji-input'].value, 'my unfinished guess');
  assert.deepEqual(app.kanjiState(), before);
  assert.equal(app.els['kanji-hint-detail'].hidden, true);
  click(mouth);
  assert.equal(app.els['kanji-tooltip'].hidden, true);
});

test('Escape, blur, outside taps, resize, scroll and changing questions dismiss the tooltip', () => {
  const app = launch({ random: 0 });
  open(app);
  const [button] = buttons(app);
  for (const dismiss of [
    () => app.documentEvents.keydown({ key: 'Escape' }),
    () => button.listeners.blur(),
    () => app.documentEvents.pointerdown({ target: app.els['kanji-input'] }),
    () => app.windowEvents.resize(),
    () => app.windowEvents.scroll(),
  ]) {
    click(button);
    dismiss();
    assert.equal(app.els['kanji-tooltip'].hidden, true);
    assert.equal(button.attributes['aria-expanded'], 'false');
  }
  click(button);
  submit(app, 'entrance');
  assert.equal(app.els['kanji-tooltip'].hidden, true);
  click(buttons(app)[0]);
  submit(app);
  assert.equal(app.els['kanji-tooltip'].hidden, true);
  assert.equal(app.els['kanji-sign'].textContent, '出口');
});

test('looking up a single-character answer counts as a full reveal across reloads and retests', () => {
  let app = launch({ saved: withSign('駅') });
  open(app);
  click(buttons(app)[0]);
  assert.match(app.els['kanji-tooltip-meaning'].textContent, /station/);
  app = launch({ saved: app.saved });
  open(app);
  assert.equal(app.els['kanji-tooltip'].hidden, true);
  submit(app, 'station');
  assert.equal(app.kanjiState().day.answers[0].assisted, true);
  assert.equal(app.kanjiState().review.length, 1);
  assert.equal(app.kanjiState().dailyStats['2026-10-16'].correct, 0);
  app = launch({ saved: app.saved });
  open(app);
  click(buttons(app)[0]);
  submit(app, 'station');
  assert.equal(app.kanjiState().review.length, 1);
  submit(app);
  open(app);
  submit(app, 'station');
  assert.equal(app.kanjiState().review.length, 0);
});

test('a lookup after checking a single-character answer does not change the earned score', () => {
  const app = launch({ saved: withSign('駅') });
  open(app);
  submit(app, 'station');
  const before = app.kanjiState();
  click(buttons(app)[0]);
  assert.deepEqual(app.kanjiState(), before);
  assert.equal(app.kanjiState().dailyStats['2026-10-16'].correct, 1);
});

test('kana and punctuation stay plain; listening kanji are tappable only after marking', () => {
  const app = launch({ saved: withSign('お手洗い'), random: 0 });
  open(app);
  assert.equal(app.els['kanji-sign'].textContent, 'お手洗い');
  assert.deepEqual(buttons(app).map((button) => button.textContent), ['手', '洗']);
  app.tabs[1].listeners.click();
  assert.equal(app.els['listening-japanese'].children.length, 0);
  app.els['listening-play'].listeners.click();
  const japanese = app.spoken.at(-1).text;
  app.els['listening-input'].value = 'My translation';
  app.els['listening-form'].listeners.submit({ preventDefault() {} });
  assert.equal(app.els['listening-japanese'].children.length, 0);
  app.marks[0].listeners.click();
  assert.equal(app.els['listening-japanese'].textContent, japanese);
  const characters = app.els['listening-japanese'].children.filter((item) => item.dataset.kanji);
  assert.equal(characters.length, 3);
  const before = app.state();
  click(characters[0]);
  assert.equal(app.els['kanji-tooltip-character'].textContent, '一');
  assert.match(app.els['kanji-tooltip-meaning'].textContent, /one/);
  assert.deepEqual(app.state(), before);
  app.els['listening-next'].listeners.click();
  assert.equal(app.els['kanji-tooltip'].hidden, true);
  assert.equal(app.els['listening-japanese'].textContent, '');
});

test('a stale character tap after midnight cannot reveal or mark the new question', () => {
  const clock = { now: localDay(0, 23, 59) };
  const app = launch({ saved: withSign('駅'), clock, random: 0 });
  open(app);
  const [old] = buttons(app);
  clock.now = localDay(1, 0, 1);
  click(old);
  assert.equal(app.els['kanji-tooltip'].hidden, true);
  assert.equal(app.kanjiState().day.characterReveals, undefined);
  assert.equal(app.els['kanji-sign'].textContent, '入口');
});

test('the bundled dictionary covers every kanji in both banks without bundling the full upstream file', () => {
  const root = path.resolve(__dirname, '..');
  const meaningsSource = fs.readFileSync(path.join(root, 'kanji-meanings.js'), 'utf8');
  const context = { window: {} };
  vm.runInNewContext(meaningsSource, context);
  const dictionary = context.window.KANJI_MEANINGS;
  const signs = fs.readFileSync(path.join(root, 'kanji.js'), 'utf8').split('const SIGNS = [')[1].split('].map')[0];
  const phrases = fs.readFileSync(path.join(root, 'katakana.js'), 'utf8');
  const texts = [...[...signs.matchAll(/^\s*\['([^']+)'/gm)].map((match) => match[1]),
    ...[...phrases.matchAll(/japanese: '([^']+)'/g)].map((match) => match[1])];
  const characters = new Set(texts.join('').match(/[\u3400-\u4dbf\u4e00-\u9fff]/gu));
  assert.equal(Object.keys(dictionary).length, characters.size);
  for (const character of characters) assert(dictionary[character], 'Missing meaning: ' + character);
  assert(meaningsSource.length < 30000);
});
