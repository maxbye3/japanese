const assert=require('node:assert/strict');
const test=require('node:test');
const {launch,key}=require('./browser-fixture.cjs');
function submit(app,value){if(value!==undefined)app.els['answer-input'].value=value;app.els['answer-form'].listeners.submit({preventDefault(){}});}
const flip=app=>app.els['katakana-grade-override'].listeners.click();
test('both correction directions update the shown answer, score and review without moving on',()=>{
 const app=launch({random:0});submit(app,'my wording');
 assert.equal(app.els['katakana-grade-override'].textContent,'Actually... I got this right');
 flip(app);assert.equal(app.els['correct-count'].textContent,'1');assert.equal(app.state().wrongAnswers.length,0);
 assert.equal(app.els['kana-word'].textContent,'アイス');assert.equal(app.els['answer-input'].value,'my wording');
 assert.equal(app.els['katakana-grade-override'].textContent,'Actually... I got this wrong');
 flip(app);assert.equal(app.els['correct-count'].textContent,'0');assert.equal(app.state().wrongAnswers.length,1);
 assert.equal(app.state().usedWords.length,1);assert.equal(app.spoken.length,1);
});
test('Next hides and disables the previous correction, including after reload',()=>{
 let app=launch({random:0});submit(app,'ice cream');submit(app);
 app.els['answer-input'].value='unfinished next answer';const before=app.state();
 assert.equal(app.els['katakana-grade-override'].hidden,true);flip(app);assert.deepEqual(app.state(),before);
 assert.equal(app.els['answer-input'].value,'unfinished next answer');
 app=launch({saved:app.saved});assert.equal(app.els['katakana-grade-override'].hidden,true);flip(app);assert.deepEqual(app.state(),before);
});
test('the tenth answer can gain and lose its stamp while it remains on its result screen',()=>{
 const app=launch({random:0});
 ['ice cream','anime','apartment','america','album','air conditioner','elevator','orange','camera'].forEach(a=>{submit(app,a);submit(app);});
 submit(app,'calendar wording');flip(app);
 assert.equal(app.els['correct-count'].textContent,'10');assert.equal(app.els['nav-stamp-count'].textContent,'1');
 assert.equal(app.state().usedWords.length,10);assert.equal(app.els['answer-input'].disabled,true);
 flip(app);assert.equal(app.els['correct-count'].textContent,'9');assert.equal(app.els['nav-stamp-count'].textContent,'0');
 submit(app);assert.equal(app.els['katakana-grade-override'].hidden,true);assert.equal(app.els['answer-input'].disabled,false);
});
test('old saved grades without a current result screen cannot leak onto the next question',()=>{
 const saved=new Map([[key,JSON.stringify({usedWords:['word-1'],lastKatakanaGrade:{date:'2026-10-16',wordId:'word-1',givenAnswer:'ice cream',correct:true},days:{'2026-10-16':{correct:1}}})]]);
 const app=launch({saved,random:0});assert.equal(app.els['kana-word'].textContent,'アニメ');
 assert.equal(app.els['katakana-grade-override'].hidden,true);const before=app.state();flip(app);assert.deepEqual(app.state(),before);
});
test('reset removes the checked grade and its correction',()=>{
 const app=launch();submit(app,'wrong');app.els['reset-progress'].listeners.click();
 assert.equal(app.els['katakana-grade-override'].hidden,true);assert.equal(app.state().lastKatakanaGrade,null);
});
