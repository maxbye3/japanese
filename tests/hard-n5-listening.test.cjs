const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const {launch, key, kanjiKey, localDay} = require('./browser-fixture.cjs');
const source = fs.readFileSync(require('node:path').join(__dirname,'../katakana.js'),'utf8');
const phrases = vm.runInNewContext(source.slice(source.indexOf('  const PHRASES ='),source.indexOf('  const STORAGE_KEY'))+'\nPHRASES');
const event = {preventDefault(){}};

test('all 60 exercises are new, unique, longer N5-style prompts with complete translations',()=>{
 assert.equal(phrases.length,60);
 assert.equal(new Set(phrases.map(p=>p.id)).size,60);
 assert.equal(new Set(phrases.map(p=>p.japanese)).size,60);
 for(const phrase of phrases){
  assert.match(phrase.id,/^n5-hard-\d{2}$/);
  assert.ok(phrase.japanese.length>=17,phrase.id);
  assert.match(phrase.japanese,/。$/);
  assert.ok(phrase.meaning.length>30,phrase.id);
 }
});
test('old current session and review are retired immediately; stamps and other practice stay saved',()=>{
 const saved=new Map([[key,JSON.stringify({usedWords:['word-1'],wrongAnswers:[{wordId:'word-1'}],days:{'2026-10-15':{correct:10,completed:true}},
 listeningCompletedDays:['2026-10-14'],usedListeningPhrases:['repeat','n5-cat'],listeningReview:[{id:'repeat'},{id:'n5-cat'}],
 listeningSession:{date:'2026-10-16',phraseIds:Array.from({length:10},(_,i)=>'old-'+i),answers:[]}})],
 [kanjiKey,JSON.stringify({usedIds:['水']})],['gettysburg-activity-v1',JSON.stringify({'2026-10-13':true})]]);
 const app=launch({saved});
 assert.ok(app.state().listeningSession.phraseIds.every(id=>id.startsWith('n5-hard-')));
 assert.equal(app.state().listeningSession.answers.length,0);
 assert.deepEqual(app.state().listeningReview,[]);
 assert.equal(app.state().usedListeningPhrases.length,10);
 assert.deepEqual(app.state().listeningCompletedDays,['2026-10-14']);
 assert.ok(app.state().days['2026-10-15'].completed);
 assert.ok(app.state().usedWords.includes('word-1'));
 assert.equal(app.state().wrongAnswers[0].wordId,'word-1');
 assert.ok(app.kanjiState().usedIds.includes('水'));
 assert.ok(saved.get('gettysburg-activity-v1').includes('2026-10-13'));
});
test('a completed retired session still contributes its stamp when switched to the new bank',()=>{
 const saved=new Map([[key,JSON.stringify({listeningSession:{date:'2026-10-15',phraseIds:[],answers:Array.from({length:10},()=>({id:'repeat',gotIt:true}))}})]]);
 const app=launch({saved});assert.ok(app.state().listeningCompletedDays.includes('2026-10-15'));
});
test('six daily sets exhaust the new bank without fresh repeats; next cycle stays distinct',()=>{
 const saved=new Map(),seen=new Set();
 for(let day=0;day<6;day++){
  const app=launch({saved,clock:{now:localDay(day)}});
  const ids=app.state().listeningSession.phraseIds;assert.equal(new Set(ids).size,10);
  ids.forEach(id=>{assert.ok(!seen.has(id));seen.add(id);});
  for(let i=0;i<10;i++)app.marks[0].listeners.click();
 }
 assert.equal(seen.size,60);
 const next=launch({saved,clock:{now:localDay(6)}}).state().listeningSession.phraseIds;
 assert.equal(new Set(next).size,10);assert.ok(next.every(id=>seen.has(id)));
});
test('new N5 misses lead tomorrow’s set; reload keeps the same phrases and correctable previous answer',()=>{
 let app=launch({random:0});const ids=app.state().listeningSession.phraseIds;
 app.els['listening-not-sure'].listeners.click(event);
 app=launch({saved:app.saved,random:.9});assert.deepEqual(app.state().listeningSession.phraseIds,ids);
 assert.equal(app.state().listeningSession.answers.length,1);
 assert.equal(app.els['listening-grade-override'].hidden,false);
 app=launch({saved:app.saved,clock:{now:localDay(1)}});
 assert.equal(app.state().listeningSession.phraseIds[0],ids[0]);
 assert.equal(new Set(app.state().listeningSession.phraseIds).size,10);
 app.els['listening-play'].listeners.click();
 assert.equal(app.spoken.at(-1).text,phrases[0].japanese);
 app.els['listening-input'].value='my translation';app.els['listening-form'].listeners.submit(event);
 assert.equal(app.els['listening-japanese'].textContent,phrases[0].japanese);
 assert.equal(app.els['listening-meaning'].textContent,phrases[0].meaning);
});
