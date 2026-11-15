(() => {
  'use strict';
  const key = 'exercise-album-snapshot-v1';
  const source = 'https://raw.githubusercontent.com/maxbye3/japanese/exercise-album-data/exercise-album.json';
  let latest = null, pending = false;
  function validate(value) {
    return value && value.version === 1 && Number.isSafeInteger(value.count) && value.count >= 0
      && typeof value.checkedAt === 'string' && Number.isFinite(Date.parse(value.checkedAt))
      && Array.isArray(value.earnedDays) && value.earnedDays.every(date => /^\d{4}-\d{2}-\d{2}$/.test(date));
  }
  try { const saved = JSON.parse(localStorage.getItem(key)); if (validate(saved)) latest = saved; } catch { /* Keep existing calendar stamps if offline or storage is unavailable. */ }
  window.ExerciseAlbum = {
    days() { return new Set(latest?.earnedDays || []); },
    async check() {
      if (pending) return;
      pending = true;
      const status = document.querySelector('#exercise-album-status');
      status.textContent = 'Checking album count…';
      let timer;
      try {
        const controller = new AbortController();
        timer = window.setTimeout(() => controller.abort(), 15000);
        const response = await fetch(source + '?check=' + Date.now(), { cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error('Album snapshot unavailable');
        const snapshot = await response.json();
        if (!validate(snapshot)) throw new Error('Invalid album snapshot');
        // Preserve previously awarded dates even if an older cached response arrives.
        snapshot.earnedDays = [...new Set([...(latest?.earnedDays || []), ...snapshot.earnedDays])];
        latest = snapshot;
        try { localStorage.setItem(key, JSON.stringify(latest)); } catch { /* Display live result even when local saving is unavailable. */ }
        const time = new Date(snapshot.checkedAt).toLocaleString('en-GB');
        status.textContent = snapshot.count + ' album items · checked ' + time + '. Updates about every 5 minutes; scheduled checks can be delayed.';
        window.dispatchEvent(new Event('exercise:progress'));
      } catch {
        status.textContent = 'Couldn’t refresh the album count. Existing stamps are kept; try opening Calendar again later.';
      } finally { window.clearTimeout(timer); pending = false; }
    },
  };
})();
