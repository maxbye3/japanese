(() => {
  'use strict';
  const core = window.GettysburgCore;
  const STORAGE_KEY = 'gettysburg-practice-v1';
  const ids = ['practice-tab', 'calendar-tab', 'practice-view', 'calendar-view', 'storage-notice', 'hat-total',
    'word-count', 'word-total', 'progress-track', 'progress-fill', 'progress-description', 'hint-count',
    'recitation-form', 'recitation', 'check-answer', 'answer-feedback', 'feedback-title', 'feedback-message',
    'two-word-hint', 'hint-words', 'completion', 'completion-message', 'write-again', 'see-calendar',
    'start-over', 'completion-total', 'month-label', 'calendar-grid', 'calendar-empty', 'previous-month',
    'next-month', 'back-to-writing'];
  const el = Object.fromEntries(ids.map((id) => [id, document.getElementById(id)]));
  let state;
  try { state = core.restore(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')); }
  catch { state = core.restore(null); }
  const now = new Date();
  let month = new Date(now.getFullYear(), now.getMonth(), 1);

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
    el['hat-total'].textContent = String(state.completions.length);
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
      el['feedback-message'].textContent = 'Remove the extra words after “earth” and check again to earn your hat.';
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
        ? 'Check your finished address to earn a top hat.'
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
      el['completion-message'].textContent = `One top hat added to your calendar. ${record.hints === 0 ? 'No hints needed this time.' : record.hints + (record.hints === 1 ? ' hint helped' : ' hints helped') + ' you get there.'}`;
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
    if (result.awarded) {
      el['feedback-title'].textContent = 'Address complete! One top hat earned.';
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
    setView('practice');
    el.recitation.focus();
  }

  function setView(view) {
    const calendar = view === 'calendar';
    el['practice-view'].hidden = calendar;
    el['calendar-view'].hidden = !calendar;
    el['practice-tab'].setAttribute('aria-pressed', String(!calendar));
    el['calendar-tab'].setAttribute('aria-pressed', String(calendar));
    if (calendar) renderCalendar();
  }

  function renderCalendar() {
    const counts = new Map();
    state.completions.forEach((entry) => counts.set(entry.date, (counts.get(entry.date) || 0) + 1));
    el['completion-total'].textContent = String(state.completions.length);
    el['calendar-empty'].hidden = state.completions.length > 0;
    el['month-label'].textContent = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(month);
    const today = core.dayKey();
    const first = (month.getDay() + 6) % 7;
    const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const cells = Math.ceil((first + days) / 7) * 7;
    el['calendar-grid'].replaceChildren();
    for (let i = 0; i < cells; i++) {
      const date = new Date(month.getFullYear(), month.getMonth(), i - first + 1);
      const key = core.dayKey(date);
      const count = counts.get(key) || 0;
      const day = document.createElement('div');
      day.className = 'day-cell';
      day.dataset.date = key;
      day.setAttribute('role', 'listitem');
      day.classList.toggle('is-outside', date.getMonth() !== month.getMonth());
      day.classList.toggle('is-today', key === today);
      day.classList.toggle('has-hats', count > 0);
      if (key === today) day.setAttribute('aria-current', 'date');
      day.setAttribute('aria-label', new Intl.DateTimeFormat('en-GB', { dateStyle: 'full' }).format(date)
        + `: ${count} completed recitation${count === 1 ? '' : 's'}, ${count} top hat${count === 1 ? '' : 's'}`);
      const number = document.createElement('span');
      number.className = 'day-number';
      number.textContent = String(date.getDate());
      day.append(number);
      if (count) {
        const hats = document.createElement('span');
        hats.className = 'day-hats';
        hats.setAttribute('aria-hidden', 'true');
        // Show individual hats for small totals; larger totals always retain their exact count.
        for (let hat = 0; hat < Math.min(count, 3); hat++) {
          const image = document.createElement('img');
          image.src = 'top-hat.svg'; image.alt = ''; image.width = 25; image.height = 25;
          hats.append(image);
        }
        if (count > 3) {
          const badge = document.createElement('small');
          badge.textContent = '×' + count;
          hats.append(badge);
        }
        day.append(hats);
      }
      el['calendar-grid'].append(day);
    }
  }

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
  el['practice-tab'].addEventListener('click', () => setView('practice'));
  el['calendar-tab'].addEventListener('click', () => setView('calendar'));
  el['back-to-writing'].addEventListener('click', () => { setView('practice'); el.recitation.focus(); });
  el['see-calendar'].addEventListener('click', () => { setView('calendar'); document.getElementById('calendar-title').focus(); });
  el['previous-month'].addEventListener('click', () => { month.setMonth(month.getMonth() - 1); renderCalendar(); });
  el['next-month'].addEventListener('click', () => { month.setMonth(month.getMonth() + 1); renderCalendar(); });
  window.addEventListener('focus', () => { if (!el['calendar-view'].hidden) renderCalendar(); });
  // Merge earned hats from other tabs while keeping this tab’s draft in progress.
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY || event.newValue === null) return;
    try {
      const incoming = core.restore(JSON.parse(event.newValue));
      state.completions = [...new Map([...state.completions, ...incoming.completions].map((entry) => [entry.id, entry])).values()];
      el['hat-total'].textContent = String(state.completions.length);
      renderCompletion();
      if (!el['calendar-view'].hidden) renderCalendar();
    } catch { /* Keep the current draft when another tab contains an unreadable value. */ }
  });

  el.recitation.value = state.draft.text;
  renderProgress(core.inspect(state.draft.checkedText));
  if (state.draft.checkedText) showFeedback(core.inspect(state.draft.checkedText));
  renderCompletion();
  save();
})();
