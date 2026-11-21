// Requires Python with edge-tts installed. Override Python via LISTENING_TTS_PYTHON.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const os = require('node:os');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const run = promisify(execFile);
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'katakana.js'), 'utf8');
const phrases = vm.runInNewContext(source.slice(source.indexOf('  const PHRASES ='), source.indexOf('  const STORAGE_KEY')) + '\nPHRASES');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'japanese-listening-'));
const output = path.join(root, 'assets/listening');
const python = process.env.LISTENING_TTS_PYTHON || 'python3';

async function generate(phrase) {
  const clip = path.join(temporary, phrase.id + '.mp3');
  for (let attempt = 0; ; attempt++) {
    try {
      await run(python, ['-m', 'edge_tts', '--voice', 'ja-JP-NanamiNeural', '--rate=-10%', '--text', phrase.japanese, '--write-media', clip], { timeout: 60000 });
      if (fs.statSync(clip).size < 1000) throw new Error(`Empty audio for ${phrase.id}`);
      return;
    } catch (error) {
      if (attempt === 2) throw error;
    }
  }
}

(async () => {
  try {
    const queue = [...phrases];
    const results = await Promise.allSettled(Array.from({ length: 4 }, async () => {
      while (queue.length) await generate(queue.shift());
    }));
    const failure = results.find(result => result.status === 'rejected');
    if (failure) throw failure.reason;
    // Keep the current bank intact unless all replacement clips were generated.
    fs.mkdirSync(output, { recursive: true });
    for (const phrase of phrases) {
      fs.copyFileSync(path.join(temporary, phrase.id + '.mp3'), path.join(output, phrase.id + '.mp3'));
    }
    console.log(`Generated ${phrases.length} Nanami neural listening clips.`);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
