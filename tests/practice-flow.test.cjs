const test = require('node:test');
const assert = require('node:assert/strict');
const {launch, key, kanjiKey, localDay} = require('./browser-fixture.cjs');
const event = {preventDefault() {}};
const click = (app,id) => app.els[id].listeners.click(event);
const submit = (app,id,value) => { app.els[id+'-input'].value=value; app.els[id+'-form'].listeners.submit(event); };

test('katakana advances immediately; correction changes only the last grade and preserves fresh input across reload',()=>{
 let app=launch({random:0});
 assert.equal(app.els['katakana-grade-override'].hidden,true);
 app.els['answer-input'].value='ice cream';app.els['answer-form'].listeners.submit(event);
 assert.equal(app.els['kana-word'].textContent,'アニメ');
 assert.equal(app.els['answer-win'].hidden,false);
 assert.equal(app.state().days['2026-10-16'].correct,1);
 app.els['answer-input'].value='draft';click(app,'katakana-grade-override');
 assert.equal(app.els['answer-input'].value,'draft');
 assert.equal(app.state().days['2026-10-16'].correct,0);
 assert.equal(app.state().wrongAnswers[0].wordId,'word-1');
 click(app,'katakana-grade-override');assert.equal(app.state().days['2026-10-16'].correct,0);
 app=launch({saved:app.saved,random:0});
 assert.equal(app.els['kana-word'].textContent,'アニメ');
 click(app,'katakana-dont-know');assert.equal(app.state().wrongAnswers.length,2);
 assert.equal(app.state().currentQuestion.wordId,'word-3');
});
test('kanji auto advances; correction survives reload and only affects the previous answer',()=>{
 let app=launch({random:0});app.tabs[2].listeners.click();
 assert.equal(app.els['kanji-grade-override'].hidden,true);
 const id=app.kanjiState().day.currentId;
 submit(app,'kanji','rain');
 assert.notEqual(app.kanjiState().day.currentId,id);
 assert.equal(app.kanjiState().day.answers.length,1);
 assert.equal(app.kanjiState().day.answers[0].correct,true);
 app=launch({saved:app.saved,random:0});app.tabs[2].listeners.click();
 const current=app.kanjiState().day.currentId;
 app.els['kanji-input'].value='draft';click(app,'kanji-grade-override');
 assert.equal(app.els['kanji-input'].value,'draft');
 assert.equal(app.kanjiState().day.currentId,current);
 assert.equal(app.kanjiState().day.answers[0].correct,false);
 assert.equal(app.kanjiState().review[0].id,id);
 click(app,'kanji-dont-know');assert.equal(app.kanjiState().day.answers.length,2);
});
test('listening unknown advances once; last correction does not close an in-progress comparison',()=>{
 const app=launch({random:0});app.tabs[1].listeners.click();
 assert.equal(app.els['listening-grade-override'].hidden,true);
 submit(app,'listening','my translation');app.marks[0].listeners.click();
 assert.equal(app.state().listeningSession.answers.length,1);
 assert.equal(app.els['listening-grade-override'].hidden,false);
 submit(app,'listening','next translation');click(app,'listening-grade-override');
 assert.equal(app.state().listeningSession.answers[0].gotIt,false);
 assert.equal(app.els['listening-feedback'].hidden,false);
 app.marks[0].listeners.click();
 assert.equal(app.state().listeningSession.answers.length,2);
 click(app,'listening-not-sure');
 assert.equal(app.state().listeningSession.answers.length,3);
 assert.equal(app.state().listeningSession.answers[2].gotIt,false);
 assert.equal(app.els['listening-feedback'].hidden,true);
});
test('beginner-heavy daily listening remains distinct and stable on reload',()=>{
 const app=launch({random:0});const ids=app.state().listeningSession.phraseIds;
 assert.equal(new Set(ids).size,10);assert.ok(ids.every(id=>id.startsWith('n5-')));
 assert.deepEqual(launch({saved:app.saved,random:.9}).state().listeningSession.phraseIds,ids);
});
test('shared calendar retains old completion hats and new activity hats with Japanese stamps',()=>{
 const saved=new Map([
 ['gettysburg-activity-v1',JSON.stringify({'2026-10-16':true})],
 ['gettysburg-practice-v1',JSON.stringify({completions:[{date:'2026-10-15'}]})],
 [key,JSON.stringify({days:{'2026-10-16':{completed:true,correct:10}}})],
 ]);
 const app=launch({saved});app.tabs[3].listeners.click();
 assert.equal(app.els['stamp-total'].textContent,'3');
 const cell=app.els['calendar-grid'].children.find(c=>c.dataset.date==='2026-10-16');
 assert.match(cell.textContent,/🎩/);assert.match(cell.textContent,/カ/);
});
test('kanji reviews advance once and a previous correction preserves the next review',()=>{
 const day='2026-10-16';const saved=new Map([[kanjiKey,JSON.stringify({review:[{id:'水'},{id:'火'}],usedIds:['水','火']})]]);
 const app=launch({saved,random:0});app.tabs[2].listeners.click();
 submit(app,'kanji','water');assert.equal(app.els['kanji-sign'].textContent,'火');
 click(app,'kanji-grade-override');assert.equal(app.els['kanji-sign'].textContent,'火');
 assert.equal(app.kanjiState().day.reviewAnswers[0].correct,false);
 click(app,'kanji-dont-know');assert.equal(app.kanjiState().reviewSession,null);
 assert.equal(app.kanjiState().day.reviewAnswers.length,2);
});
