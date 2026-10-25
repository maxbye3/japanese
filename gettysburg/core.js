(function (root) {
  'use strict';
  const text = typeof module === 'object' && module.exports ? require('./speech.js') : root.GettysburgText;
  function tokens(value) {
    return String(value).replace(/\p{N}+/gu, '').normalize('NFKC').toLowerCase()
      .replace(/\bcannot\b/g, 'can not').replace(/\bbattle[-\u2010\u2011]field\b/g, 'battlefield')
      .match(/[a-z]+/g) || [];
  }
  const words = tokens(text);
  function inspect(value) {
    const typed = tokens(value);
    let matched = 0;
    while (matched < typed.length && matched < words.length && typed[matched] === words[matched]) matched += 1;
    return {
      matched, total: words.length, typed: typed.length,
      wrong: matched < typed.length,
      complete: matched === words.length && typed.length === words.length,
      next: words.slice(matched, matched + 2),
    };
  }
  function dayKey(date = new Date()) {
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  }
  function validDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parsed = new Date(value + 'T12:00:00Z');
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }
  function newDraft() {
    return { id: crypto.randomUUID(), text: '', checkedText: '', hints: 0, startedAt: Date.now() };
  }
  function restore(saved) {
    const records = new Map();
    if (Array.isArray(saved?.completions)) saved.completions.forEach((entry) => {
      if (entry && typeof entry.id === 'string' && validDate(entry.date) && !records.has(entry.id)) {
        records.set(entry.id, { id: entry.id, date: entry.date, hints: Number.isInteger(entry.hints) && entry.hints >= 0 ? entry.hints : 0 });
      }
    });
    const draft = saved?.draft;
    return {
      version: 1,
      draft: draft && typeof draft.id === 'string' && typeof draft.text === 'string'
        ? { id: draft.id, text: draft.text, checkedText: typeof draft.checkedText === 'string' ? draft.checkedText : '',
          hints: Number.isInteger(draft.hints) && draft.hints >= 0 ? draft.hints : 0,
          startedAt: Number.isFinite(draft.startedAt) ? draft.startedAt : Date.now() }
        : newDraft(),
      completions: [...records.values()],
    };
  }
  function check(state) {
    const draft = state.draft;
    const result = inspect(draft.text);
    if (!result.typed) return { ...result, empty: true, awarded: false };
    // Rechecking the same mistake keeps the hint without charging another one.
    if (result.wrong && draft.text !== draft.checkedText) draft.hints += 1;
    draft.checkedText = draft.text;
    const awarded = result.complete && !state.completions.some((entry) => entry.id === draft.id);
    if (awarded) state.completions.push({ id: draft.id, date: dayKey(), hints: draft.hints });
    return { ...result, awarded };
  }
  const api = { text, words, tokens, inspect, dayKey, newDraft, restore, check };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GettysburgCore = api;
})(typeof window === 'object' ? window : globalThis);
