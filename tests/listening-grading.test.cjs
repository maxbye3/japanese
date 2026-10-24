const assert = require('node:assert/strict');
const test = require('node:test');
const { launch, localDay } = require('./browser-fixture.cjs');
function compare(app, text='my translation') {
  app.els['listening-input'].value=text;
  app.els['listening-form'].listeners.submit({preventDefault() {}});
}
const correct = app => app.els['listening-grade-override'].listeners.click();
const button = app => app.els['listening-grade-override'];
for (const gotIt of [false,true]) test(`listening ${gotIt?'right':'wrong'} answers can be corrected both ways without advancing or losing the next translation`, () => {
  let app=launch();
  assert.equal(button(app).hidden,true);
  compare(app);
  app.marks[gotIt?0:1].listeners.click();
  assert.equal(button(app).hidden,false);
  assert.equal(button(app).textContent,gotIt?'Actually... I got this wrong':'Actually... I got this right');
  const ids=app.state().listeningSession.phraseIds;
  app.els['listening-input'].value='unfinished next translation';
  correct(app);
  assert.equal(app.state().listeningSession.answers.length,1);
  assert.equal(app.state().listeningSession.answers[0].gotIt,!gotIt);
  assert.equal(app.state().listeningReview.length,gotIt?1:0);
  assert.equal(app.els['listening-input'].value,'unfinished next translation');
  assert.deepEqual(app.state().listeningSession.phraseIds,ids);
  app=launch({saved:app.saved});
  assert.equal(button(app).textContent,gotIt?'Actually... I got this right':'Actually... I got this wrong');
  correct(app);
  assert.equal(app.state().listeningSession.answers[0].gotIt,gotIt);
  assert.equal(app.state().listeningReview.length,gotIt?0:1);
  compare(app);
  assert.equal(button(app).hidden,true);
  correct(app);
  assert.equal(app.state().listeningSession.answers[0].gotIt,gotIt);
});
test('a listening correction updates the completed summary and missed-phrase priority while keeping the earned stamp', () => {
  const app=launch();
  for(let i=0;i<10;i++) { compare(app);app.marks[0].listeners.click(); }
  correct(app);
  assert.match(app.els['listening-summary'].textContent,/9 of 10/);
  assert.equal(app.state().listeningCompletedDays.length,1);
  assert.equal(app.state().listeningReview[0].id,app.state().listeningSession.phraseIds[9]);
  correct(app);
  assert.match(app.els['listening-summary'].textContent,/10 of 10/);
  assert.equal(app.state().listeningReview.length,0);
  app.els['listening-restart'].listeners.click();
  assert.equal(button(app).hidden,true);
  correct(app);
  assert.equal(app.state().listeningSession.answers.length,0);
});
test('a stale listening correction cannot change yesterday or a new day', () => {
  const clock={now:localDay(0,23,59)};
  const app=launch({clock});compare(app);app.marks[0].listeners.click();
  clock.now=localDay(1,0,1);
  correct(app);
  assert.equal(button(app).hidden,true);
  assert.equal(app.state().listeningSession.answers.length,0);
});
