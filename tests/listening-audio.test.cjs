const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { launch } = require('./browser-fixture.cjs');

test('every current listening exercise ships a nonempty MP3', () => {
  const source = fs.readFileSync(path.join(__dirname, '../katakana.js'), 'utf8');
  const phrases = vm.runInNewContext(source.slice(source.indexOf('  const PHRASES ='), source.indexOf('  const STORAGE_KEY')) + '\nPHRASES');
  for (const phrase of phrases) {
    const bytes = fs.readFileSync(path.join(__dirname, '../assets/listening', phrase.id + '.mp3'));
    assert.ok(bytes.length > 1000, phrase.id);
    assert.ok(bytes.subarray(0, 3).equals(Buffer.from('ID3')) || bytes[0] === 0xff);
  }
});

test('listening plays without speech synthesis or Japanese voices', () => {
  for (const options of [{ speech: false }, { voice: 'en-US' }]) {
    const app = launch(options);
    app.tabs[1].listeners.click();
    const before = app.saved.get('katakana-quest-progress-v1');
    app.els['listening-play'].listeners.click();
    assert.match(app.audioClips[0].src, /^assets\/listening\/n5-hard-\d\d\.mp3\?v=nanami-1$/);
    assert.equal(app.spoken.length, 0);
    assert.match(app.els['audio-status'].textContent, /Playing/);
    assert.equal(app.saved.get('katakana-quest-progress-v1'), before);
    app.audioClips[0].onended();
    assert.match(app.els['audio-status'].textContent, /listen again/);
  }
});

test('replay and mode changes stop clips; obsolete events cannot change status', () => {
  const app = launch();
  app.tabs[1].listeners.click();
  app.els['listening-play'].listeners.click();
  const first = app.audioClips[0];
  app.els['listening-play'].listeners.click();
  assert.equal(first.paused, true);
  first.onerror();
  first.onended();
  assert.match(app.els['audio-status'].textContent, /Playing/);
  app.tabs[2].listeners.click();
  assert.equal(app.audioClips[1].paused, true);
});

test('failed media playback gives a retry message and can be replayed', () => {
  const app = launch({ speech: false });
  app.els['listening-play'].listeners.click();
  app.audioClips[0].onerror();
  assert.match(app.els['audio-status'].textContent, /connection.*retry/);
  app.els['listening-play'].listeners.click();
  assert.match(app.els['audio-status'].textContent, /Playing/);
});

test('blocked play promises and synchronous playback failures stay recoverable', async () => {
  const source = fs.readFileSync(path.join(__dirname, '../japanese-audio.js'), 'utf8');
  for (const throws of [false, true]) {
    const window = { Audio: class {
      play() {
        if (throws) throw new Error('Blocked');
        return Promise.reject(new Error('Blocked'));
      }
      pause() {}
      removeAttribute() {}
      load() {}
    } };
    vm.runInNewContext(source, { window });
    let status;
    window.JapaneseAudio.playListening({ id: 'n5-hard-01' }, value => { status = value; });
    await Promise.resolve();
    assert.match(status, /tap play to retry/);
  }
});
