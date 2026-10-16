const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const sources = ['katakana.js', 'kanji.js'].map((file) => fs.readFileSync(path.join(root, file), 'utf8'));
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
  return Object.assign(eventTarget(), {
    children: [], style: {}, dataset: {}, attributes: {},
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
    focus() {},
  });
}

function launch({ saved = new Map(), clock = { now: localDay(0) }, random = 0.37, voice = 'ja-JP' } = {}) {
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
    confirm: () => true,
    speechSynthesis: synth,
    SpeechSynthesisUtterance: Utterance,
    setInterval: (callback) => intervals.push(callback),
  });
  const context = vm.createContext({
    document, window, localStorage: storage, Date: ClockDate, Intl, Event,
    Math: Object.assign(Object.create(Math), { random: () => random }),
    requestAnimationFrame: (callback) => callback(),
  });
  sources.forEach((source) => vm.runInContext(source, context));
  return {
    els, marks, tabs, spoken, clock, saved, intervals,
    windowEvents: window.listeners, documentEvents: document.listeners,
    state: () => JSON.parse(saved.get(key)),
    kanjiState: () => JSON.parse(saved.get(kanjiKey) || 'null'),
  };
}

module.exports = { html, key, kanjiKey, localDay, launch };
