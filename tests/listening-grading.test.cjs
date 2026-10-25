const assert=require('node:assert/strict');
const test=require('node:test');
const {launch,localDay}=require('./browser-fixture.cjs');
function compare(app,text='my translation'){app.els['listening-input'].value=text;app.els['listening-form'].listeners.submit({preventDefault(){}});}
const flip=app=>app.els['listening-grade-override'].listeners.click();
const next=app=>app.els['listening-next'].listeners.click();
for(const gotIt of [true,false])test(`a ${gotIt?'right':'wrong'} listening result stays visible for corrections, then Next hides them`,()=>{
 let app=launch();assert.equal(app.els['listening-grade-override'].hidden,true);compare(app);
 assert.equal(app.els['listening-grade-override'].hidden,true);
 app.marks[gotIt?0:1].listeners.click();
 assert.equal(app.els['listening-grade-override'].hidden,false);assert.equal(app.els['listening-form'].hidden,true);
 assert.equal(app.els['listening-feedback'].hidden,false);assert.equal(app.els['listening-step'].textContent,'Phrase 1 of 10');
 assert.equal(app.els['listening-mark-actions'].hidden,true);
 flip(app);assert.equal(app.state().listeningSession.answers.length,1);assert.equal(app.state().listeningSession.answers[0].gotIt,!gotIt);
 assert.equal(app.state().listeningReview.length,gotIt?1:0);
 app=launch({saved:app.saved});assert.equal(app.els['listening-grade-override'].hidden,false);
 flip(app);assert.equal(app.state().listeningSession.answers[0].gotIt,gotIt);
 next(app);assert.equal(app.els['listening-grade-override'].hidden,true);assert.equal(app.els['listening-step'].textContent,'Phrase 2 of 10');
 app.els['listening-input'].value='unfinished next';const before=app.state();flip(app);
 assert.deepEqual(app.state(),before);assert.equal(app.els['listening-input'].value,'unfinished next');
 app=launch({saved:app.saved});assert.equal(app.els['listening-grade-override'].hidden,true);
});
test('the tenth answer remains correctable before the summary without changing its stamp',()=>{
 const app=launch();for(let i=0;i<10;i++){compare(app);app.marks[0].listeners.click();if(i<9)next(app);}
 flip(app);assert.equal(app.state().listeningCompletedDays.length,1);
 assert.equal(app.state().listeningReview[0].id,app.state().listeningSession.phraseIds[9]);
 assert.match(app.els['listening-grade-status'].textContent,/wrong/);
 next(app);assert.equal(app.els['listening-done'].hidden,false);assert.match(app.els['listening-summary'].textContent,/9 of 10/);
 assert.equal(app.els['listening-grade-override'].hidden,true);
 const before=app.state();flip(app);assert.deepEqual(app.state(),before);
 app.els['listening-restart'].listeners.click();assert.equal(app.els['listening-grade-override'].hidden,true);
});
test('a stale result correction cannot change yesterday or a new day',()=>{
 const clock={now:localDay(0,23,59)};const app=launch({clock});compare(app);app.marks[0].listeners.click();
 clock.now=localDay(1,0,1);flip(app);assert.equal(app.els['listening-grade-override'].hidden,true);assert.equal(app.state().listeningSession.answers.length,0);
});
