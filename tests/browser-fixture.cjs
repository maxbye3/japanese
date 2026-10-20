const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const sources = ['kanji-meanings.js', 'kanji-tooltips.js', 'japanese-audio.js', 'gacha.js', 'katakana.js', 'kanji.js'].map((file) => fs.readFileSync(path.join(root, file), 'utf8'));
const key = 'katakana-quest-progress-v1';
const kanjiKey = 'katakana-quest-kanji-v1';
const localDay = (offset, hour = 12, minute = 0) => new Date(2026, 9, 16 + offset, hour, minute).getTime();

function eventTarget() {
  return {
    listeners: {},
    addEventListener(type, callback) {
      const previous = this.listeners[type];
      this.listeners[type] = (event) => {
        if (previous) previous(event);
        callback(event);
      };
    },
    dispatchEvent(event) {
      if (this.listeners[event.type]) this.listeners[event.type](event);
    },
  };
}

function element() {
  const classes = new Set();
  let content = '';
  const item = Object.assign(eventTarget(), {
    children: [], style: {}, dataset: {}, attributes: {},
    hidden: false, disabled: false, value: '', textContent: '', className: '',
    classList: {
      add: (name) => classes.add(name),
      remove: (...names) => names.forEach((name) => classes.delete(name)),
      toggle: (name, active) => active ? classes.add(name) : classes.delete(name),
    },
    append(...items) { this.children.push(...items); },
    appendChild(item) { this.children.push(item); },
    replaceChildren(...items) { content = ''; this.children = items; },
    contains(item) { return item === this || this.children.some((child) => child.contains(item)); },
    getBoundingClientRect() { return { left: 30, top: 30, bottom: 74, width: 44, height: 44 }; },
    setAttribute(name, value) { this.attributes[name] = value; },
    removeAttribute(name) { delete this.attributes[name]; },
    focus() {},
  });
  Object.defineProperty(item, 'textContent', {
    get() { return content + this.children.map((child) => child.textContent).join(''); },
    set(value) { content = String(value); this.children = []; },
  });
  return item;
}

function launch({ saved = new Map(), clock = { now: localDay(0) }, random = 0.37, voice = 'ja-JP', speech = true, autoFinishSpeech = true } = {}) {
  const tags = [...html.matchAll(/<[^>]*\bid="([^"]+)"[^>]*>/g)];
  const els = Object.fromEntries(tags.map((match) => {
    const item = element();
    item.hidden = /\shidden(?:[\s=>])/.test(match[0]);
    return [match[1], item];
  }));
  const tabs = ['quest', 'listening', 'kanji', 'calendar'].map((view) => {
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
  const intervals = [];
  const storage = {
    getItem: (name) => saved.get(name) ?? null,
    setItem: (name, value) => saved.set(name, value),
    removeItem: (name) => saved.delete(name),
  };
  const synth = {
    getVoices: () => [{ lang: voice }],
    cancellations: 0,
    cancel() { this.cancellations += 1; },
    speak(utterance) {
      spoken.push(utterance);
      utterance.onstart();
      if (autoFinishSpeech) utterance.onend();
    },
  };
  class Utterance {
    constructor(text) { this.text = text; }
  }
  class ClockDate extends Date {
    constructor(...args) { super(...(args.length ? args : [clock.now])); }
    static now() { return clock.now; }
  }
  class Event {
    constructor(type) { this.type = type; }
  }
  const document = Object.assign(eventTarget(), {
    hidden: false,
    querySelector: (selector) => els[selector.slice(1)],
    querySelectorAll: (selector) => selector === '[data-view]' ? tabs : marks,
    createElement: element,
  });
  const window = Object.assign(eventTarget(), {
    innerWidth: 375, innerHeight: 900,
    confirm: () => true,
    setInterval: (callback) => intervals.push(callback),
  });
  if (speech) Object.assign(window, { speechSynthesis: synth, SpeechSynthesisUtterance: Utterance });
  const context = vm.createContext({
    document, window, localStorage: storage, Date: ClockDate, Intl, Event,
    Math: Object.assign(Object.create(Math), { random: () => random }),
    requestAnimationFrame: (callback) => callback(),
  });
  sources.forEach((source) => vm.runInContext(source, context));
  return {
    els, marks, tabs, spoken, synth, clock, saved, intervals,
    windowEvents: window.listeners, documentEvents: document.listeners,
    state: () => JSON.parse(saved.get(key)),
    kanjiState: () => JSON.parse(saved.get(kanjiKey) || 'null'),
  };
}

module.exports = { html, key, kanjiKey, localDay, launch };
