const test=require('node:test');
const assert=require('node:assert/strict');
const {launch,key}=require('./browser-fixture.cjs');
const words=require('./katakana-bank.cjs');
const submit=(app,text)=>{if(text!==undefined)app.els['answer-input'].value=text;app.els['answer-form'].listeners.submit({preventDefault(){}});};
function exhausted(extra={}){return new Map([[key,JSON.stringify({usedWords:words.map(w=>w.id),wrongAnswers:[{wordId:'word-1',givenAnswer:'old miss'},{wordId:'word-2',givenAnswer:'old miss'}],...extra})]]);}
test('an exhausted save resumes with missed words and removes each correct review without consuming new words',()=>{
 let app=launch({saved:exhausted(),random:0});
 assert.equal(app.els['kana-word'].textContent,'アイス');assert.match(app.els['card-prompt'].textContent,/Review/);
 assert.equal(app.state().usedWords.length,words.length);submit(app,'ice cream');
 assert.equal(app.els['review-count'].textContent,'1 word');assert.equal(app.els['correct-count'].textContent,'1');submit(app);
 app=launch({saved:app.saved});assert.equal(app.els['kana-word'].textContent,'アニメ');submit(app,'anime');submit(app);
 assert.equal(app.els['review-count'].textContent,'0 words');assert.equal(app.els['answer-form'].hidden,true);
 assert.equal(app.state().usedWords.length,words.length);
});
test('missed reviews rotate through the queue and return until correct without duplicate review records',()=>{
 const app=launch({saved:exhausted()});submit(app,'wrong again');submit(app);
 assert.equal(app.els['kana-word'].textContent,'アニメ');submit(app,'wrong');submit(app);
 assert.equal(app.els['kana-word'].textContent,'アイス');assert.equal(app.state().wrongAnswers.length,2);
 app.els['answer-input'].value='my wording';submit(app);app.els['katakana-grade-override'].listeners.click();
 assert.equal(app.state().wrongAnswers.length,1);assert.equal(app.els['correct-count'].textContent,'1');
 app.els['katakana-grade-override'].listeners.click();assert.equal(app.state().wrongAnswers.length,2);
});
test('correct review answers earn the usual tenth-answer stamp and empty or invalid misses do not create questions',()=>{
 const app=launch({saved:exhausted({days:{'2026-10-16':{correct:9,completed:false}}})});submit(app,'ice cream');
 assert.equal(app.els['nav-stamp-count'].textContent,'1');assert.equal(app.els['correct-count'].textContent,'10');
 const empty=launch({saved:exhausted({wrongAnswers:[null,{wordId:'deleted'}]})});assert.equal(empty.els['answer-form'].hidden,true);
});
