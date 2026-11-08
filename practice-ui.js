(() => {
  'use strict';
  const activityKey = 'gettysburg-activity-v1';
  const read = (key) => { try { return JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch { return {}; } };
  window.PracticeUI = {
    notice(message) { this.win(message, false); },
    win(message = 'You got it! ✦', celebrate = true) {
      const banner = document.querySelector('#answer-win');
      if (!banner) return;
      banner.hidden = false;
      banner.classList.toggle('is-learning', !celebrate);
      banner.textContent = message;
      banner.classList.remove('play-win');
      void banner.offsetWidth;
      if (celebrate) requestAnimationFrame(() => banner.classList.add('play-win'));
      window.clearTimeout(this.winTimer);
      this.winTimer = window.setTimeout(() => { banner.hidden = true; }, celebrate ? 1400 : 3500);
    },
    hats() {
      const days = new Set(Object.keys(read(activityKey)).filter((key) => /^\d{4}-\d{2}-\d{2}$/.test(key)));
      const saved = read('gettysburg-practice-v1');
      (Array.isArray(saved.completions) ? saved.completions : []).forEach((entry) => { if (entry && entry.date) days.add(entry.date); });
      return days;
    },
    recordActivity() {
      const date = new Date();
      const key = [date.getFullYear(), String(date.getMonth()+1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
      const days = read(activityKey);
      if (!days[key]) { days[key] = true; localStorage.setItem(activityKey, JSON.stringify(days)); }
    },
  };
})();
