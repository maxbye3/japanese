const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const source = fs.readFileSync(path.join(root, 'katakana.js'), 'utf8');
const key = 'katakana-quest-progress-v1';
const localDay = (offset, hour = 12, minute = 0) => new Date(2026, 9, 16 + offset, hour, minute).getTime();

function element() {
  const classes = new Set();
  return {
    children: [], style: {}, dataset: {}, listeners: {}, attributes: {},
    hidden: false, disabled: false, value: '', textContent: '', className: '',
    classList: {
      add: (name) => classes.add(name),
      remove: (...names) => names.forEach((name) => classes.delete(name)),
      toggle: (name, active) => active ? classes.add(name) : classes.delete(name),
    },
    append(...items) { this.children.push(...items); },
    appendChild(item) { this.children.push(item); },
    replaceChildren(...items) { this.children = items; },
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(type, callback) { this.listeners[type] = callback; },
    focus() {},
  };
}

function launch({ saved = new Map(), clock = { now: localDay(0) }, random = 0.37, voice = 'ja-JP' } = {}) {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  const els = Object.fromEntries(ids.map((id) => [id, element()]));
  const tabs = ['quest', 'listening', 'calendar'].map((view) => {
    const tab = element();
    tab.dataset.view = view;
    return tab;
  });
  const marks = ['got', 'review'].map((mark) => {
    const button = element();
    button.dataset.listeningMark = mark;
    return button;
  });
  const spoken = [];
  const windowEvents = {};
  const documentEvents = {};
  const intervals = [];
  const storage = {
    getItem: (name) => saved.get(name) ?? null,
    setItem: (name, value) => saved.set(name, value),
    removeItem: (name) => saved.delete(name),
  };
  const synth = {
    getVoices: () => [{ lang: voice }],
    cancel() {},
    speak(utterance) {
      spoken.push(utterance);
      utterance.onstart();
      utterance.onend();
    },
  };
  class Utterance {
    constructor(text) { this.text = text; }
  }
  class ClockDate extends Date {
    constructor(...args) { super(...(args.length ? args : [clock.now])); }
    static now() { return clock.now; }
  }
  const document = {
    hidden: false,
    querySelector: (selector) => els[selector.slice(1)],
    querySelectorAll: (selector) => selector === '[data-view]' ? tabs : marks,
    createElement: element,
    addEventListener: (type, callback) => { documentEvents[type] = callback; },
  };
  vm.runInNewContext(source, {
    document, localStorage: storage, Date: ClockDate, Intl,
    Math: Object.assign(Object.create(Math), { random: () => random }),
    requestAnimationFrame: (callback) => callback(),
    window: {
      confirm: () => true,
      speechSynthesis: synth,
      SpeechSynthesisUtterance: Utterance,
      addEventListener: (type, callback) => { windowEvents[type] = callback; },
      setInterval: (callback) => intervals.push(callback),
    },
  });
  return {
    els, marks, tabs, spoken, clock, saved, windowEvents, documentEvents, intervals,
    state: () => JSON.parse(saved.get(key)),
  };
}

function compare(app, translation = 'My English translation') {
  app.els['listening-input'].value = translation;
  app.els['listening-form'].listeners.submit({ preventDefault() {} });
}

function answer(app, gotIt = true) {
  compare(app);
  app.marks[gotIt ? 0 : 1].listeners.click();
}

test('today has ten fixed phrases, saved progress, and replay without rerolling', () => {
  let app = launch();
  const chosen = app.state().listeningSession.phraseIds;
  assert.equal(chosen.length, 10);
  assert.equal(new Set(chosen).size, 10);
  app.tabs[1].listeners.click();
  assert.equal(app.els['listening-view'].hidden, false);
  assert.equal(app.els['calendar-view'].hidden, true);
  app.els['listening-play'].listeners.click();
  assert.equal(app.spoken[0].lang, 'ja-JP');
  assert.match(app.spoken[0].text, /[ぁ-んァ-ン一-龯]/u);
  answer(app, false);
  assert.equal(app.els['listening-count'].textContent, '1');
  app = launch({ saved: app.saved, random: 0.91 });
  assert.deepEqual(app.state().listeningSession.phraseIds, chosen);
  assert.equal(app.els['listening-count'].textContent, '1');
  for (let i = 1; i < 10; i += 1) answer(app);
  assert.equal(app.els['listening-done'].hidden, false);
  assert.match(app.els['listening-summary'].textContent, /9 of 10/);
  const used = app.state().usedListeningPhrases;
  app.els['listening-restart'].listeners.click();
  assert.deepEqual(app.state().listeningSession.phraseIds, chosen);
  assert.deepEqual(app.state().usedListeningPhrases, used);
  assert.equal(app.els['listening-count'].textContent, '0');
  assert.equal(app.els['listening-review-count'].textContent, '1 phrase');
});

test('twelve daily sets cover 120 distinct prompts before the bank cycles', () => {
  const saved = new Map();
  const ids = new Set();
  const japanese = new Set();
  for (let day = 0; day < 12; day += 1) {
    const app = launch({ saved, clock: { now: localDay(day) } });
    const selected = app.state().listeningSession.phraseIds;
    assert.equal(selected.length, 10);
    selected.forEach((id) => {
      assert.equal(ids.has(id), false, 'A phrase repeated before the bank was exhausted');
      ids.add(id);
    });
    for (let i = 0; i < 10; i += 1) {
      app.els['listening-play'].listeners.click();
      const spoken = app.spoken.at(-1).text;
      assert.equal(japanese.has(spoken), false, 'Duplicate Japanese prompts in the bank');
      japanese.add(spoken);
      answer(app);
    }
    assert.equal(app.els['listening-count'].textContent, '10');
  }
  assert.equal(ids.size, 120);
  assert.equal(japanese.size, 120);
  const nextCycle = launch({ saved, clock: { now: localDay(12) } });
  const selected = nextCycle.state().listeningSession.phraseIds;
  assert.equal(new Set(selected).size, 10);
  assert(selected.every((id) => ids.has(id)));
});

test('midnight discards an old pending answer and preserves review', () => {
  const clock = { now: localDay(0, 23, 59) };
  const app = launch({ clock });
  const yesterday = app.state().listeningSession.phraseIds;
  answer(app, false);
  compare(app, 'Pending answer from yesterday');
  clock.now = localDay(1, 0, 1);
  app.marks[0].listeners.click();
  const session = app.state().listeningSession;
  assert.equal(session.date, '2026-10-17');
  assert.equal(session.answers.length, 0);
  assert.equal(app.els['listening-feedback'].hidden, true);
  assert.equal(app.els['listening-review-count'].textContent, '1 phrase');
  assert(session.phraseIds.every((id) => !yesterday.includes(id)));
  answer(app);
  assert.equal(app.state().listeningSession.answers[0].id, session.phraseIds[0]);
  clock.now = localDay(2);
  app.windowEvents.focus();
  assert.equal(app.state().listeningSession.date, '2026-10-18');
  clock.now = localDay(3);
  app.documentEvents.visibilitychange();
  assert.equal(app.state().listeningSession.date, '2026-10-19');
  clock.now = localDay(4);
  app.intervals[0]();
  assert.equal(app.state().listeningSession.date, '2026-10-20');
});

test('the former five phrase quiz migrates without losing review or repeating answered phrases', () => {
  const saved = new Map([[key, JSON.stringify({
    usedWords: ['word-1'],
    listeningAnswers: [{ id: 'repeat', gotIt: false }, { id: 'station', gotIt: true }],
    listeningReview: [{ id: 'repeat', translation: 'My old attempt' }],
  })]]);
  const app = launch({ saved });
  assert(!app.state().listeningSession.phraseIds.includes('repeat'));
  assert(!app.state().listeningSession.phraseIds.includes('station'));
  assert.equal(app.els['listening-review-count'].textContent, '1 phrase');
  assert(app.state().usedWords.includes('word-1'));
  app.els['listening-review-list'].children[0].children[0].listeners.click();
  assert.equal(app.spoken.at(-1).text, 'もう一度言ってください。');
  assert.equal(app.els['listening-count'].textContent, '0');
});

test('a cycle boundary mid-set still produces ten distinct prompts', () => {
  const saved = new Map();
  for (let day = 0; day < 12; day += 1) launch({ saved, clock: { now: localDay(day) } });
  const all = JSON.parse(saved.get(key)).usedListeningPhrases;
  assert.equal(all.length, 120);
  const lastThree = all.slice(-3);
  saved.set(key, JSON.stringify({ usedListeningPhrases: all.slice(0, -3) }));
  const app = launch({ saved });
  const chosen = app.state().listeningSession.phraseIds;
  assert.equal(new Set(chosen).size, 10);
  assert(lastThree.every((id) => chosen.includes(id)));
  const tomorrow = launch({ saved, clock: { now: localDay(1) } });
  assert(tomorrow.state().listeningSession.phraseIds.every((id) => !chosen.includes(id)));
});

test('Japanese stays audio only, blank answers do not advance, and reset clears daily history', () => {
  const listeningHtml = html.split('<section id="listening-view"')[1].split('<section id="calendar-view"')[0];
  assert(!/[ぁ-んァ-ン一-龯]/u.test(listeningHtml));
  const app = launch({ voice: 'en-US' });
  app.els['listening-play'].listeners.click();
  assert.equal(app.spoken.length, 0);
  assert.match(app.els['audio-status'].textContent, /No Japanese voice/);
  compare(app, '   ');
  app.marks[0].listeners.click();
  assert.equal(app.state().listeningSession.answers.length, 0);
  answer(app, false);
  app.els['reset-progress'].listeners.click();
  assert.equal(app.els['listening-review-count'].textContent, '0 phrases');
  assert.equal(app.els['listening-count'].textContent, '0');
  assert.equal(app.state().usedListeningPhrases.length, 10);
});
