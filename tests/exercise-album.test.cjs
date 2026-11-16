const test=require('node:test');
const assert=require('node:assert/strict');
const {launch}=require('./browser-fixture.cjs');
const fs=require('node:fs');
const page=data=>`<script>AF_initDataCallback({key: 'ds:1', hash: '2', data:${JSON.stringify(data)}, sideChannel: {}});</script>`;
const payload=(count,items=[])=>{const meta=[];meta[21]=count;return [null,items,'',meta];};
test('public album parser reads the total even when viewer results are paginated',async()=>{
 const {albumCount}=await import('../scripts/exercise-album.mjs');
 assert.equal(albumCount(page(payload(74,[['photo1'],['photo2']]))),74);
 assert.equal(albumCount(page(payload(0))),0);
 for(const bad of ['<h1>Sign in</h1>',page(payload(null)),page(payload(-1)),page(payload(0,[['photo1']]))])assert.throws(()=>albumCount(bad));
});
test('first check, unchanged count and removals do not stamp; increases stamp once per detection day',async()=>{
 const {updateSnapshot}=await import('../scripts/exercise-album.mjs');
 const day=new Date('2026-11-15T12:00:00Z');let saved=updateSnapshot(null,74,day);assert.deepEqual(saved.earnedDays,[]);
 saved=updateSnapshot(saved,74,day);assert.deepEqual(saved.earnedDays,[]);
 saved=updateSnapshot(saved,75,day);assert.deepEqual(saved.earnedDays,['2026-11-15']);
 saved=updateSnapshot(saved,77,day);assert.deepEqual(saved.earnedDays,['2026-11-15']);
 saved=updateSnapshot(saved,76,new Date('2026-11-16T12:00:00Z'));assert.deepEqual(saved.earnedDays,['2026-11-15']);
 saved=updateSnapshot(saved,77,new Date('2026-11-16T12:00:00Z'));assert.deepEqual(saved.earnedDays,['2026-11-15','2026-11-16']);
});
test('detection uses London date across British Summer Time midnight',async()=>{
 const {updateSnapshot}=await import('../scripts/exercise-album.mjs');
 assert.deepEqual(updateSnapshot({count:1,earnedDays:[]},2,new Date('2026-06-01T23:30:00Z')).earnedDays,['2026-06-02']);
});
test('shared calendar merges automatic and old exercise stamps; manual exercise control is restored',()=>{
 const saved=new Map([
  ['practice-checkins-v1',JSON.stringify({exercised:['2026-10-15']})],
  ['exercise-album-snapshot-v1',JSON.stringify({version:1,count:75,checkedAt:'2026-10-16T10:00:00Z',earnedDays:['2026-10-16']})],
 ]);
 const app=launch({saved});app.tabs[3].listeners.click();
 assert.ok(app.els['checkin-exercised']);
 assert.equal(app.els['stamp-total'].textContent,'2');
 for(const date of ['2026-10-15','2026-10-16']){
  const cell=app.els['calendar-grid'].children.find(c=>c.dataset.date===date);
  assert.ok(cell.attributes['aria-label'].includes('Exercised'));
 }
 app.els['checkin-aiInvestment'].listeners.click();
 assert.deepEqual(JSON.parse(saved.get('practice-checkins-v1')).exercised,['2026-10-15']);
});
test('workout card restores the manual button without the wrong AI description or album link',()=>{
 const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
 const card=html.slice(html.indexOf('<h4>Exercised'),html.indexOf('id="checkin-status"'));
 assert.doesNotMatch(card,/AI research|Z18e59WB1EXEJXeHA/);assert.match(card,/work out\. 15 mins or more a day of unadulterated shred\./);
});
