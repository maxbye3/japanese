const assert=require('node:assert/strict');
const test=require('node:test');
const {launch,localDay,html}=require('./browser-fixture.cjs');
function compare(app,text='my translation'){app.els['listening-input'].value=text;app.els['listening-form'].listeners.submit({preventDefault(){}});}
for(const understood of [true,false])test(`one ${understood?'Correct':'Wrong'} click advances directly without a second Next`,()=>{
 let app=launch();compare(app);app.marks[understood?0:1].listeners.click();
 assert.equal(app.els['listening-step'].textContent,'Phrase 2 of 10');assert.equal(app.els['listening-form'].hidden,false);
 assert.equal(app.els['listening-next'].hidden,true);assert.equal(app.els['listening-grade-override'].hidden,false);
 assert.equal(app.state().listeningSession.answers[0].gotIt,understood);
 assert.equal(app.state().listeningReview.length,understood?0:1);
 const before=app.state();app.marks[0].listeners.click();app.els['listening-next'].listeners.click();
 assert.deepEqual(app.state(),before);
 app=launch({saved:app.saved});assert.equal(app.els['listening-step'].textContent,'Phrase 2 of 10');
});
test('the tenth grade immediately shows the summary and earns one stamp',()=>{
 const app=launch();for(let i=0;i<10;i++){compare(app);app.marks[i===9?1:0].listeners.click();}
 assert.equal(app.els['listening-done'].hidden,false);assert.match(app.els['listening-summary'].textContent,/9 of 10/);
 assert.equal(app.els['nav-stamp-count'].textContent,'1');assert.equal(app.els['listening-next'].hidden,true);
});
test('stale grading after midnight cannot skip or grade the new first phrase',()=>{
 const clock={now:localDay(0,23,59)};const app=launch({clock});compare(app);
 clock.now=localDay(1,0,1);app.marks[0].listeners.click();
 assert.equal(app.state().listeningSession.answers.length,0);assert.equal(app.els['listening-form'].hidden,false);
});

test('listening controls only show grading after comparison and correction toggles both ways',()=>{
 const app=launch();
 assert.match(html, /<h2 id="listening-title">Listening exercise<\/h2>/);
 assert.match(html, /data-listening-mark="got">Correct<\/button>/);
 assert.match(html, /data-listening-mark="review">Wrong<\/button>/);
 assert.equal(app.els['listening-mark-actions'].hidden,true);
 assert.equal(app.els['listening-not-sure'].hidden,false);
 assert.equal(app.els['listening-grade-override'].hidden,true);
 app.marks[0].listeners.click();
 assert.equal(app.state().listeningSession.answers.length,0);
 compare(app);
 assert.equal(app.els['listening-mark-actions'].hidden,false);
 assert.equal(app.els['listening-not-sure'].hidden,true);
 app.marks[1].listeners.click();
 assert.equal(app.els['listening-mark-actions'].hidden,true);
 assert.equal(app.els['listening-not-sure'].hidden,false);
 assert.equal(app.els['listening-grade-override'].hidden,false);
 assert.equal(app.els['listening-grade-override'].textContent,'I got that last one right');
 assert.equal(app.state().listeningReview.length,1);
 app.els['listening-input'].value='unfinished next translation';
 app.els['listening-grade-override'].listeners.click();
 assert.equal(app.els['listening-grade-override'].textContent,'I got that last one wrong');
 assert.equal(app.state().listeningSession.answers[0].gotIt,true);
 assert.equal(app.state().listeningReview.length,0);
 assert.equal(app.els['listening-input'].value,'unfinished next translation');
 app.els['listening-grade-override'].listeners.click();
 assert.equal(app.els['listening-grade-override'].textContent,'I got that last one right');
 assert.equal(app.state().listeningSession.answers[0].gotIt,false);
 assert.equal(app.state().listeningReview.length,1);
});
