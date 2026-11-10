const test=require('node:test');
const assert=require('node:assert/strict');
const {launch,localDay}=require('./browser-fixture.cjs');
const storageKey='practice-checkins-v1';
const keys=['aiInvestment','quietMoment','exercised'];
const click=(app,key)=>app.els['checkin-'+key].listeners.click();
const state=app=>JSON.parse(app.saved.get(storageKey)||'{}');
test('all three daily buttons stamp today once, preserve other stamps and survive reload',()=>{
 let app=launch();app.tabs[3].listeners.click();
 for(const [index,key] of keys.entries()){
  assert.equal(app.els['checkin-'+key].disabled,false);click(app,key);click(app,key);
  assert.deepEqual(state(app)[key],['2026-10-16']);
  assert.equal(app.els['stamp-total'].textContent,String(index+1));
  assert.equal(app.els['checkin-'+key].attributes['aria-pressed'],'true');
 }
 assert.equal(app.els['practice-streak'].textContent,'1 day streak');
 const cell=app.els['calendar-grid'].children.find(c=>c.dataset.date==='2026-10-16');
 for(const name of ['AI investment','Quiet moment','Exercised'])assert.ok(cell.attributes['aria-label'].includes(name));
 app=launch({saved:app.saved});
 for(const key of keys)assert.equal(app.els['checkin-'+key].disabled,true);
 assert.equal(app.els['stamp-total'].textContent,'3');
});
test('midnight enables the buttons for a new day while preserving previous dates',()=>{
 const clock={now:localDay(0,23,59)};const app=launch({clock});
 keys.forEach(key=>click(app,key));clock.now=localDay(1,0,1);app.windowEvents.focus();
 keys.forEach(key=>{assert.equal(app.els['checkin-'+key].disabled,false);click(app,key);assert.deepEqual(state(app)[key],['2026-10-16','2026-10-17']);});
 assert.equal(app.els['stamp-total'].textContent,'6');
 assert.equal(app.els['practice-streak'].textContent,'2 day streak');
});
test('Japanese reset leaves check-ins intact; a second tab preserves previously recorded categories',()=>{
 const app=launch();click(app,'aiInvestment');
 const other=launch({saved:app.saved});click(other,'quietMoment');click(app,'exercised');
 for(const key of keys)assert.deepEqual(state(app)[key],['2026-10-16']);
 app.els['reset-progress'].listeners.click();
 assert.equal(app.els['stamp-total'].textContent,'3');
});
test('unreadable stored check-ins recover and can be stamped',()=>{
 const app=launch({saved:new Map([[storageKey,'broken']])});click(app,'aiInvestment');
 assert.deepEqual(state(app).aiInvestment,['2026-10-16']);
});
