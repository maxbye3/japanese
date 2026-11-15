export function albumCount(html) {
  const marker = /AF_initDataCallback\(\{key:\s*'ds:1',[\s\S]*?\bdata:/;
  const match = marker.exec(html);
  if (!match) throw new Error('Google Photos album data unavailable');
  const start = match.index + match[0].length;
  let depth = 0, quoted = false, escaped = false, end = -1;
  for (let i = start; i < html.length; i++) {
    const c = html[i];
    if (quoted) { if (escaped) escaped = false; else if (c === '\\') escaped = true; else if (c === '"') quoted = false; continue; }
    if (c === '"') quoted = true;
    else if (c === '[' || c === '{') depth++;
    else if (c === ']' || c === '}') { if (--depth === 0) { end = i + 1; break; } }
  }
  if (end < 0) throw new Error('Incomplete album data');
  const data = JSON.parse(html.slice(start, end));
  const count = data?.[3]?.[21], items = data?.[1];
  if (!Number.isSafeInteger(count) || count < 0 || !Array.isArray(items)
    || items.length > count || items.some(item => !Array.isArray(item) || typeof item[0] !== 'string')
    || new Set(items.map(item => item[0])).size !== items.length) throw new Error('Unrecognised album count format');
  return count;
}
export function updateSnapshot(previous, count, now = new Date()) {
  if (!Number.isSafeInteger(count) || count < 0) throw new Error('Invalid count');
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London', year:'numeric', month:'2-digit', day:'2-digit' }).format(now);
  const earnedDays = new Set(Array.isArray(previous?.earnedDays) ? previous.earnedDays : []);
  const known = Number.isSafeInteger(previous?.count) && previous.count >= 0;
  if (known && count > previous.count) earnedDays.add(date);
  return { version: 1, count, baselineCount: known ? previous.baselineCount ?? previous.count : count, checkedAt: now.toISOString(), earnedDays: [...earnedDays].sort() };
}
