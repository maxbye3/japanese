import { readFile, writeFile } from 'node:fs/promises';
import { albumCount, updateSnapshot } from './exercise-album.mjs';
const [previousFile, outputFile] = process.argv.slice(2);
if (!previousFile || !outputFile) throw new Error('Provide previous snapshot and output paths');
// Invalid saved history must fail, rather than silently erase earned stamps.
const previous = JSON.parse(await readFile(previousFile, 'utf8'));
const response = await fetch('https://photos.app.goo.gl/Z18e59WB1EXEJXeHA', { signal: AbortSignal.timeout(25000), headers: { 'User-Agent': 'JapanesePracticeAlbumCounter/1.0' } });
if (!response.ok) throw new Error('Album request failed: ' + response.status);
const count = albumCount(await response.text());
const snapshot = updateSnapshot(previous, count);
await writeFile(outputFile, JSON.stringify(snapshot, null, 2) + '\n');
console.log('Album checked: ' + count + ' items; ' + snapshot.earnedDays.length + ' exercise stamp dates.');
