const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../gettysburg/core.js');

test('the full sourced address is recognized from beginning through its final word', () => {
  assert.equal(core.words.length, 271);
  assert.deepEqual(core.words.slice(0,6), ['four','score','and','seven','years','ago']);
  assert.deepEqual(core.words.slice(-5), ['not','perish','from','the','earth']);
  assert.equal(core.inspect(core.text).complete, true);
});

test('the first failure gives only the next two expected words, preserving the correct prefix', () => {
  const result = core.inspect('Four score and eight years ago');
  assert.equal(result.matched,3);
  assert.equal(result.wrong,true);
  assert.deepEqual(result.next,['seven','years']);
  assert.equal(result.complete,false);
  assert.deepEqual(core.inspect('something wrong').next,['four','score']);
});

test('correct partial text is allowed, but omissions, extra words and out-of-order words never finish', () => {
  assert.equal(core.inspect('Four score and seven').wrong,false);
  assert.equal(core.inspect('Four score and seven').complete,false);
  assert.equal(core.inspect(core.words.slice(0,-1).join(' ')).complete,false);
  const extra = core.inspect(core.text + ' extra');
  assert.equal(extra.wrong,true);
  assert.equal(extra.complete,false);
  assert.deepEqual(extra.next,[]);
  assert.equal(core.inspect(core.words.slice(1).join(' ')).matched,0);
  assert.equal(core.inspect('score four').wrong,true);
});

test('case, punctuation, whitespace, line breaks and supported spelling variants do not change correctness', () => {
  assert.equal(core.inspect(core.text.toUpperCase()).complete,true);
  assert.equal(core.inspect(core.words.join('\n  ')).complete,true);
  assert.equal(core.inspect(core.text.replaceAll('can not','cannot').replace('battlefield','battle-field')).complete,true);
  assert.equal(core.inspect('Four, SCORE! and seven...').matched,4);
});

test('a failure reveals a hint without changing the draft; repeated checks do not count it again', () => {
  const state=core.restore(null);
  state.draft.text='four score wrong';
  const result=core.check(state);
  assert.equal(result.awarded,false);
  assert.equal(state.draft.hints,1);
  assert.equal(state.draft.text,'four score wrong');
  assert.deepEqual(result.next,['and','seven']);
  core.check(state);
  assert.equal(state.draft.hints,1);
  state.draft.text='four score and seven';
  core.check(state);
  assert.equal(state.draft.hints,1);
  state.draft.text='four score and seven wrong';
  core.check(state);
  assert.equal(state.draft.hints,2);
});

test('each finished attempt earns exactly one hat, including repeat attempts on the same date', () => {
  let state=core.restore(null);
  state.draft.text=core.text;
  assert.equal(core.check(state).awarded,true);
  assert.equal(state.completions.length,1);
  assert.equal(state.completions[0].date,core.dayKey());
  assert.equal(core.check(state).awarded,false);
  state=core.restore(JSON.parse(JSON.stringify(state)));
  assert.equal(core.check(state).awarded,false);
  const first=state.completions[0];
  state.draft=core.newDraft();
  state.draft.text=core.text;
  assert.equal(core.check(state).awarded,true);
  assert.equal(state.completions.length,2);
  assert.notEqual(state.completions[1].id,first.id);
  assert.equal(state.completions[1].date,first.date);
});

test('assisted finishes count, and restarting a draft preserves already-earned hats', () => {
  const state=core.restore(null);
  state.draft.text='wrong';core.check(state);
  state.draft.text=core.text;core.check(state);
  assert.equal(state.completions[0].hints,1);
  state.draft=core.newDraft();
  assert.equal(state.completions.length,1);
  assert.equal(state.draft.hints,0);
  assert.equal(state.draft.text,'');
});

test('empty attempts do not award hats, and restore preserves a draft and deduplicates history', () => {
  const state=core.restore(null);
  state.draft.text=' \n ';
  assert.equal(core.check(state).empty,true);
  assert.equal(state.completions.length,0);
  state.draft.text='Four score';core.check(state);
  const restored=core.restore(JSON.parse(JSON.stringify(state)));
  assert.deepEqual(restored,state);
  const records=[{id:'a',date:'2026-10-25',hints:2},{id:'a',date:'2026-10-25'},
    {id:'b',date:'2026-02-30'},{id:'c',date:'bad'},{id:'d',date:'2026-02-28',hints:-1}];
  assert.deepEqual(core.restore({completions:records}).completions,[
    {id:'a',date:'2026-10-25',hints:2},{id:'d',date:'2026-02-28',hints:0}]);
  assert.equal(core.restore({draft:{text:1}}).draft.text,'');
});

test('calendar date keys use local dates at midnight, year boundaries and daylight-saving changes', () => {
  assert.equal(core.dayKey(new Date(2026,9,25,0,1)),'2026-10-25');
  assert.equal(core.dayKey(new Date(2026,9,25,23,59)),'2026-10-25');
  assert.equal(core.dayKey(new Date(2027,0,1,0,1)),'2027-01-01');
});
