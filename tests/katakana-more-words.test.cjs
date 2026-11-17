const test=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const words=require('./katakana-bank.cjs');
const {launch,key,localDay}=require('./browser-fixture.cjs');
const oldIds=Array.from({length:283},(_,i)=>`word-${i+1}`);
test('200 unique words are appended and all previous identities, meanings and accepted answers stay unchanged',()=>{
 assert.equal(words.length,483);
 const previous=JSON.stringify(words.slice(0,283).map(({id,kana,english,answers})=>({id,kana,english,answers})));
 assert.equal(createHash('sha256').update(previous).digest('hex'),'fadb2cfd7aa54935e57d1c39f3a277ab891c8da8525e95615b81160481c2cae7');
 assert.equal(new Set(words.map(w=>w.kana)).size,483);
 assert.equal(new Set(words.map(w=>w.id)).size,483);
 for(const word of words.slice(283)){
  assert.match(word.kana,/^[\p{Script=Katakana}ー]+$/u);
  assert.ok(word.answers.includes(word.english.toLowerCase()),word.kana);
 }
});
test('an exhausted 283-word save receives a new word and keeps missed answers and stamps across reload',()=>{
 const misses=[{wordId:'word-15',givenAnswer:'old answer'}];
 const saved=new Map([[key,JSON.stringify({usedWords:oldIds,wrongAnswers:misses,days:{'2026-10-15':{completed:true,correct:10}}})]]);
 let app=launch({saved,random:0});
 assert.equal(app.state().currentQuestion.wordId,'word-284');assert.equal(app.els['kana-word'].textContent,'クロワッサン');
 assert.deepEqual(app.state().wrongAnswers,misses);assert.deepEqual(app.state().usedWords.slice(0,283),oldIds);
 assert.ok(app.state().days['2026-10-15'].completed);
 app=launch({saved,random:.9});assert.equal(app.state().currentQuestion.wordId,'word-284');assert.equal(app.state().usedWords.length,284);
});
test('the complete new bank can be practised across daily quests without returning to previously used words',()=>{
 const clock={now:localDay(0)},saved=new Map([[key,JSON.stringify({usedWords:oldIds})]]);
 const app=launch({saved,clock,random:0});
 for(const [i,word] of words.slice(283).entries()){
  if(i&&i%10===0){clock.now=localDay(i/10);app.windowEvents.focus();}
  assert.equal(app.state().currentQuestion.wordId,word.id);
  app.els['answer-input'].value=word.english;app.els['answer-form'].listeners.submit({preventDefault(){}});
  assert.equal(app.els['correct-count'].textContent,String(i%10+1));
 }
 assert.equal(app.state().usedWords.length,483);assert.equal(new Set(app.state().usedWords).size,483);
 assert.equal(app.els['nav-stamp-count'].textContent,'20');
});
