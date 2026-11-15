(() => {
  'use strict';
  const key = 'exercise-album-snapshot-v1';
  const source = window.EXERCISE_ALBUM_ENDPOINT;
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
      const status = document.querySelector('#exercise-album-status');
      if (!source) {
        status.textContent = 'Live album checks need a backend connection. Background scans are off; existing stamps are kept.';
        return;
      }
      pending = true;
      status.textContent = 'Checking album count…';
      let timer;
      try {
        const controller = new AbortController();
        timer = window.setTimeout(() => controller.abort(), 15000);
        const response = await fetch(source + (source.includes('?') ? '&' : '?') + 'check=' + Date.now(), { cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error('Live album count unavailable');
        const result = await response.json();
        if (!Number.isSafeInteger(result.count) || result.count < 0
          || typeof result.checkedAt !== 'string' || !Number.isFinite(Date.parse(result.checkedAt))) throw new Error('Invalid album count');
        const earnedDays = new Set(latest?.earnedDays || []);
        if (latest && result.count > latest.count) {
          const date = new Date();
          earnedDays.add([date.getFullYear(), String(date.getMonth()+1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-'));
        }
        const snapshot = { version: 1, count: result.count, checkedAt: result.checkedAt, earnedDays: [...earnedDays] };
        // Preserve previously awarded dates even if an older cached response arrives.
        snapshot.earnedDays = [...new Set([...(latest?.earnedDays || []), ...snapshot.earnedDays])];
        latest = snapshot;
        try { localStorage.setItem(key, JSON.stringify(latest)); } catch { /* Display live result even when local saving is unavailable. */ }
        const time = new Date(snapshot.checkedAt).toLocaleString('en-GB');
        status.textContent = snapshot.count + ' album items · checked ' + time + '. Checked live when Calendar opened.';
        window.dispatchEvent(new Event('exercise:progress'));
      } catch {
        status.textContent = 'Couldn’t refresh the album count. Existing stamps are kept; try opening Calendar again later.';
      } finally { window.clearTimeout(timer); pending = false; }
    },
  };
})();
