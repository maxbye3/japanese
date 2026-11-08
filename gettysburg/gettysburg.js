(() => {
  'use strict';
  const core = window.GettysburgCore;
  const STORAGE_KEY = 'gettysburg-practice-v1';
  const ids = ['practice-tab', 'practice-view', 'storage-notice',
    'word-count', 'word-total', 'progress-track', 'progress-fill', 'progress-description', 'hint-count',
    'recitation-form', 'recitation', 'check-answer', 'answer-feedback', 'feedback-title', 'feedback-message',
    'two-word-hint', 'hint-words', 'completion', 'completion-message', 'write-again', 'see-calendar',
    'start-over'];
  const el = Object.fromEntries(ids.map((id) => [id, document.getElementById(id)]));
  let state;
  try { state = core.restore(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')); }
  catch { state = core.restore(null); }

  function save() {
    try {
      try {
        const latest = core.restore(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'));
        state.completions = [...new Map([...latest.completions, ...state.completions].map((entry) => [entry.id, entry])).values()];
      } catch { /* Replace unreadable saved data with the current valid state. */ }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      el['storage-notice'].hidden = true;
    } catch { el['storage-notice'].hidden = false; }
  }
  function finished() { return state.completions.some((entry) => entry.id === state.draft.id); }

  function renderProgress(result) {
    el['word-count'].textContent = String(result.matched);
    el['word-total'].textContent = String(result.total);
    el['progress-track'].setAttribute('aria-valuemax', String(result.total));
    el['progress-track'].setAttribute('aria-valuenow', String(result.matched));
    el['progress-fill'].style.width = `${result.matched / result.total * 100}%`;
    el['progress-description'].textContent = result.matched ? 'Words remembered, in order.' : 'Begin with the opening words.';
    el['hint-count'].textContent = state.draft.hints + (state.draft.hints === 1 ? ' hint used' : ' hints used');
  }

  function showFeedback(result) {
    el['answer-feedback'].hidden = false;
    el['two-word-hint'].hidden = true;
    el['answer-feedback'].classList.toggle('is-wrong', result.wrong);
    el.recitation.setAttribute('aria-invalid', String(result.wrong));
    if (result.empty || !result.typed) {
      el['feedback-title'].textContent = 'Start with what you remember.';
      el['feedback-message'].textContent = 'Write a word, a sentence, or a passage, then check it.';
    } else if (result.wrong && result.matched === result.total) {
      el['feedback-title'].textContent = 'You’ve reached the end. A little too far!';
      el['feedback-message'].textContent = 'Remove the extra words after “earth” and check again to finish the address.';
    } else if (result.wrong) {
      el['feedback-title'].textContent = result.matched ? `A stumble at word ${result.matched + 1}. Keep going.` : 'A little help to get started.';
      el['feedback-message'].textContent = result.matched
        ? `The first ${result.matched} words match. Fix what comes next in your text, using these two words.`
        : 'The opening doesn’t match yet. Start with these two words, then continue from memory.';
      el['two-word-hint'].hidden = false;
      el['hint-words'].textContent = result.next.join(' ');
    } else {
      el['feedback-title'].textContent = 'Every word so far is right.';
      el['feedback-message'].textContent = result.complete
        ? 'Check your finished address to complete this attempt.'
        : 'Keep adding to your text. The next words stay a secret until you need a hand.';
    }
  }

  function renderCompletion(animate = false) {
    const record = state.completions.find((entry) => entry.id === state.draft.id);
    const complete = Boolean(record);
    el['completion'].hidden = !complete;
    el.recitation.disabled = complete;
    el['check-answer'].hidden = complete;
    el['start-over'].hidden = complete;
    el['completion'].classList.toggle('just-earned', animate);
    if (complete) {
      el['answer-feedback'].hidden = true;
      el.recitation.setAttribute('aria-invalid', 'false');
      el['completion-message'].textContent = `Your practice stamp is on the shared calendar. ${record.hints === 0 ? 'No hints needed this time.' : record.hints + (record.hints === 1 ? ' hint helped' : ' hints helped') + ' you get there.'}`;
    }
  }

  function check(event) {
    event.preventDefault();
    if (finished()) return;
    state.draft.text = el.recitation.value;
    const result = core.check(state);
    save();
    renderProgress(result);
    showFeedback(result);
    renderCompletion(result.awarded);
    if (result.matched && !result.wrong) window.PracticeUI.win(result.complete ? 'Address complete! 🎩' : 'Every word so far is right! ✦');
    if (result.awarded) {
      el['feedback-title'].textContent = 'Address complete!';
      el['write-again'].focus();
    } else {
      el.recitation.focus();
      el['answer-feedback'].scrollIntoView({ block: 'nearest', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
  }

  function newAttempt() {
    state.draft = core.newDraft();
    el.recitation.value = '';
    el['answer-feedback'].hidden = true;
    save();
    renderProgress(core.inspect(''));
    renderCompletion();
    el.recitation.focus();
  }

  // A visit counts, and every later interaction can credit a new local day.
  // Recording activity never changes the draft or requires a checked/correct answer.
  function recordInteraction() {
    try { window.PracticeUI.recordActivity(); }
    catch { el['storage-notice'].hidden = false; }
  }
  ['pointerdown', 'click', 'keydown', 'focusin', 'input', 'submit'].forEach((type) => {
    document.addEventListener(type, recordInteraction, { capture: true, passive: true });
  });
  document.addEventListener('scroll', recordInteraction, { capture: true, passive: true });
  window.addEventListener('focus', recordInteraction);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) recordInteraction(); });

  el.recitation.addEventListener('input', () => {
    if (finished()) return;
    state.draft.text = el.recitation.value;
    save();
  });
  el['recitation-form'].addEventListener('submit', check);
  el.recitation.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && !event.isComposing) check(event);
  });
  el['write-again'].addEventListener('click', newAttempt);
  el['start-over'].addEventListener('click', () => {
    if (!state.draft.text || window.confirm('Start this attempt over? Your earned top hats will stay on the calendar.')) newAttempt();
  });
  el['practice-tab'].addEventListener('click', () => el.recitation.focus());
  // Merge earned hats from other tabs while keeping this tab’s draft in progress.
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY || event.newValue === null) return;
    try {
      const incoming = core.restore(JSON.parse(event.newValue));
      state.completions = [...new Map([...state.completions, ...incoming.completions].map((entry) => [entry.id, entry])).values()];
      renderCompletion();
    } catch { /* Keep the current draft when another tab contains an unreadable value. */ }
  });

  el.recitation.value = state.draft.text;
  renderProgress(core.inspect(state.draft.checkedText));
  if (state.draft.checkedText) showFeedback(core.inspect(state.draft.checkedText));
  renderCompletion();
  save();
  recordInteraction();
})();
