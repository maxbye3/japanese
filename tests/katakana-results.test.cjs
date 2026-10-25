const assert = require('node:assert/strict');
const test = require('node:test');
const { launch, key, localDay } = require('./browser-fixture.cjs');
const words = require('./katakana-bank.cjs');
function submit(app, answer) {
  if (answer !== undefined) app.els['answer-input'].value = answer;
  app.els['answer-form'].listeners.submit({ preventDefault() {} });
}

test('a checked correct answer keeps its word and correction until Next opens a fresh prompt', () => {
  const app=launch({random:0});
  submit(app,'ice cream');
  assert.equal(app.els['kana-word'].textContent,'アイス');
  assert.equal(app.els['answer-input'].disabled,true);
  assert.equal(app.els['katakana-grade-override'].hidden,false);
  assert.equal(app.state().usedWords.length,1);
  assert.equal(app.els['correct-count'].textContent,'1');
  assert.match(app.els['feedback'].textContent,/アイス = ice cream/);
  submit(app);
  assert.equal(app.els['kana-word'].textContent,'アニメ');
  assert.equal(app.els['answer-input'].disabled,false);
  assert.equal(app.els['answer-input'].value,'');
  assert.equal(app.els['katakana-grade-override'].hidden,true);
  assert.equal(app.state().usedWords.length,2);
  assert.equal(app.state().currentQuestion.wordId,'word-2');
  submit(app,'anime');
  assert.equal(app.els['kana-word'].textContent,'アニメ');
  assert.equal(app.els['correct-count'].textContent,'2');
});
test('wrong answers also wait for Next and blank fresh submissions do nothing', () => {
  const app=launch({random:0});const before=app.state();
  submit(app,'   ');assert.deepEqual(app.state(),before);
  submit(app,'wrong');assert.equal(app.els['kana-word'].textContent,'アイス');
  assert.equal(app.els['answer-input'].disabled,true);
  assert.equal(app.state().wrongAnswers.length,1);
  submit(app);assert.equal(app.els['kana-word'].textContent,'アニメ');
  const fresh=app.state();submit(app,' ');assert.deepEqual(app.state(),fresh);
  assert.equal(app.els['katakana-grade-override'].hidden,true);
});
test('the tenth checked answer earns its stamp while remaining correctable before Finish', () => {
  const app=launch({random:0});
  ['ice cream','anime','apartment','america','album','air conditioner','elevator','orange','camera','calendar'].forEach((answer,i)=>{
    submit(app,answer);if(i<9)submit(app);
  });
  assert.equal(app.els['correct-count'].textContent,'10');
  assert.equal(app.state().usedWords.length,10);
  assert.equal(app.state().currentQuestion,null);
  assert.equal(app.els['nav-stamp-count'].textContent,'1');
  assert.equal(app.els['katakana-grade-override'].hidden,false);
  assert.equal(app.els['kana-word'].textContent,'カレンダー');
  submit(app);assert.equal(app.els['answer-form'].hidden,true);
  assert.match(app.els['feedback'].textContent,/Quest complete/);
  assert.equal(app.els['katakana-grade-override'].hidden,true);
  assert.equal(app.state().usedWords.length,10);
});
test('reload resumes the checked answer without reserving a new word; after Next it resumes the fresh word', () => {
  let app=launch({random:0});submit(app,'ice cream');
  app=launch({saved:app.saved,random:0.9});
  assert.equal(app.els['kana-word'].textContent,'アイス');
  assert.equal(app.els['katakana-grade-override'].hidden,false);
  assert.equal(app.state().usedWords.length,1);
  submit(app);const next=app.state().currentQuestion;
  app=launch({saved:app.saved});assert.deepEqual(app.state().currentQuestion,next);
  assert.equal(app.els['katakana-grade-override'].hidden,true);
  assert.equal(app.state().usedWords.length,2);
});
test('midnight discards the stale answer and correction without crediting the new day', () => {
  const clock={now:localDay(0,23,59)};const app=launch({random:0,clock});
  submit(app,'ice cream');clock.now=localDay(1,0,1);
  app.els['katakana-grade-override'].listeners.click();
  assert.equal(app.els['correct-count'].textContent,'0');
  assert.equal(app.els['katakana-grade-override'].hidden,true);
  assert.equal(app.state().days['2026-10-16'].correct,1);
});
test('the last bank word remains correctable, then Next displays bank completion', () => {
  const saved=new Map([[key,JSON.stringify({usedWords:words.slice(0,-1).map(w=>w.id)})]]);
  const app=launch({saved,random:0});submit(app,words.at(-1).english);
  assert.equal(app.state().usedWords.length,words.length);
  assert.equal(app.els['katakana-grade-override'].hidden,false);
  submit(app);assert.equal(app.els['answer-form'].hidden,true);
  assert.match(app.els['feedback'].textContent,/Word bank complete/);
  assert.equal(app.els['katakana-grade-override'].hidden,true);
});
