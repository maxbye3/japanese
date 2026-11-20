// Regenerate the checked-in listening clips on macOS with Kyoko and ffmpeg.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const os = require('node:os');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'katakana.js'), 'utf8');
const phrases = vm.runInNewContext(source.slice(source.indexOf('  const PHRASES ='), source.indexOf('  const STORAGE_KEY')) + '\nPHRASES');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'japanese-listening-'));
const output = path.join(root, 'assets/listening');
fs.mkdirSync(output, { recursive: true });
try {
  for (const phrase of phrases) {
    const clip = path.join(output, phrase.id + '.mp3');
    // Resume an interrupted run; delete a clip first when changing its phrase.
    if (fs.existsSync(clip) && fs.statSync(clip).size > 1000) continue;
    const aiff = path.join(temporary, phrase.id + '.aiff');
    for (let attempt = 0; ; attempt++) {
      try {
        execFileSync('say', ['-v', 'Kyoko', '-r', '150', '-o', aiff, phrase.japanese], { timeout: 15000 });
        break;
      } catch (error) {
        if (attempt === 2) throw error;
      }
    }
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', aiff, '-codec:a', 'libmp3lame', '-b:a', '64k', '-ac', '1', clip]);
  }
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
