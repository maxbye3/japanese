(() => {
  'use strict';

  const meanings = window.KANJI_MEANINGS;
  const tooltip = document.querySelector('#kanji-tooltip');
  const characterLabel = document.querySelector('#kanji-tooltip-character');
  const meaningLabel = document.querySelector('#kanji-tooltip-meaning');
  let activeButton = null;

  function close() {
    if (activeButton) {
      activeButton.setAttribute('aria-expanded', 'false');
      activeButton.removeAttribute('aria-describedby');
    }
    activeButton = null;
    tooltip.hidden = true;
  }

  function show(button, character) {
    close();
    activeButton = button;
    characterLabel.textContent = character;
    meaningLabel.textContent = meanings[character];
    button.setAttribute('aria-expanded', 'true');
    button.setAttribute('aria-describedby', 'kanji-tooltip');
    tooltip.hidden = false;
    const anchor = button.getBoundingClientRect();
    const box = tooltip.getBoundingClientRect();
    const left = Math.max(12, Math.min(anchor.left + anchor.width / 2 - box.width / 2, window.innerWidth - box.width - 12));
    const below = anchor.bottom + 9;
    const top = below + box.height <= window.innerHeight - 12 ? below : anchor.top - box.height - 9;
    tooltip.style.left = left + 'px';
    tooltip.style.top = Math.max(12, Math.min(top, window.innerHeight - box.height - 12)) + 'px';
  }

  function render(parent, text, onLookup) {
    if (activeButton && parent.contains(activeButton)) close();
    const nodes = [];
    let plain = '';
    const flush = () => {
      if (!plain) return;
      const span = document.createElement('span');
      span.textContent = plain;
      nodes.push(span);
      plain = '';
    };
    for (const character of text) {
      if (!Object.hasOwn(meanings, character)) {
        plain += character;
        continue;
      }
      flush();
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'kanji-character';
      button.lang = 'ja';
      button.textContent = character;
      button.dataset.kanji = character;
      button.setAttribute('aria-label', character + ' — show character meaning');
      button.setAttribute('aria-expanded', 'false');
      button.addEventListener('click', () => {
        if (activeButton === button) {
          close();
          return;
        }
        if (onLookup && onLookup(character) === false) return;
        show(button, character);
      });
      button.addEventListener('blur', () => {
        if (activeButton === button) close();
      });
      nodes.push(button);
    }
    flush();
    parent.replaceChildren(...nodes);
  }

  document.addEventListener('pointerdown', (event) => {
    if (activeButton && !activeButton.contains(event.target) && !tooltip.contains(event.target)) close();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
  window.addEventListener('resize', close);
  window.addEventListener('scroll', close, true);
  window.KanjiTooltips = { render, close };
})();
