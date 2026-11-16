const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');
const script=fs.readFileSync(path.join(__dirname,'../exercise-album.js'),'utf8');
function launch({seed,endpoint='https://example.test/api/exercise-album',reply}={}){
 const saved=new Map(seed?[['exercise-album-snapshot-v1',JSON.stringify(seed)]]:[]);const status={textContent:''};let calls=0,events=0;
 const window={EXERCISE_ALBUM_ENDPOINT:endpoint,setTimeout,clearTimeout,dispatchEvent(){events++;}};
 const context=vm.createContext({window,document:{querySelector:()=>status},localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)},Date,Set,Event,AbortController,fetch:async(url,opts)=>{calls++;assert.equal(opts.cache,'no-store');assert.match(url,/api\/exercise-album\?check=/);return reply();}});
 vm.runInContext(script,context);return {api:window.ExerciseAlbum,status,saved,calls:()=>calls,events:()=>events};
}
const snapshot=(count,earnedDays=[])=>({version:1,count,earnedDays,checkedAt:new Date().toISOString()});
const response=count=>({ok:true,json:async()=>({count,checkedAt:new Date().toISOString()})});
test('no background scheduler remains and manual workouts no longer trigger album checks',()=>{
 assert.equal(fs.existsSync(path.join(__dirname,'../.github/workflows/exercise-album.yml')),false);
 assert.doesNotMatch(script,/setInterval|raw\.githubusercontent/);
 const source=fs.readFileSync(path.join(__dirname,'../katakana.js'),'utf8');
 assert.doesNotMatch(source,/ExerciseAlbum\.check\(/);
 assert.doesNotMatch(source,/addEventListener\('focus'.*ExerciseAlbum/);
});
test('first live check sets baseline; subsequent increase stamps once without repeated requests on its own',async()=>{
 let count=74;const app=launch({reply:()=>response(count)});assert.equal(app.calls(),0);
 await app.api.check();assert.equal(app.calls(),1);assert.equal(app.api.days().size,0);
 count++;await app.api.check();assert.equal(app.api.days().size,1);await app.api.check();assert.equal(app.api.days().size,1);
 assert.equal(app.calls(),3);assert.match(app.status.textContent,/Checked live when Calendar opened/);
});
test('failed or malformed live reads preserve cached stamps and baseline',async()=>{
 for(const reply of [()=>({ok:false}),()=>({ok:true,json:async()=>({count:null})}),()=>{throw new Error('offline');}]){
  const app=launch({seed:snapshot(74,['2026-11-15']),reply});await app.api.check();
  assert.deepEqual([...app.api.days()],['2026-11-15']);assert.equal(JSON.parse(app.saved.get('exercise-album-snapshot-v1')).count,74);
  assert.match(app.status.textContent,/Couldn’t refresh/);
 }
});
test('no configured backend makes no requests and clearly explains the blocked live check',async()=>{
 const app=launch({endpoint:'',seed:snapshot(74,['2026-11-15']),reply:()=>response(75)});await app.api.check();
 assert.equal(app.calls(),0);assert.match(app.status.textContent,/Background scans are off/);assert.equal(app.api.days().size,1);
});
test('API requests the fixed Google album afresh and never caches or returns its photos',async()=>{
 const handler=(await import('../api/exercise-album.mjs')).default;const original=global.fetch;
 const headers={};let body,statusCode;const res={setHeader:(k,v)=>headers[k]=v,set statusCode(v){statusCode=v;},end:v=>body=v};
 const data=[null,[['photo']],null,[]];data[3][21]=74;
 try{
  global.fetch=async(url,opts)=>{assert.equal(url,'https://photos.app.goo.gl/Z18e59WB1EXEJXeHA');assert.equal(opts.cache,'no-store');return {ok:true,text:async()=>`AF_initDataCallback({key: 'ds:1', hash: '2', data:${JSON.stringify(data)}, sideChannel: {}});`};};
  await handler({method:'GET'},res);assert.equal(statusCode,200);assert.equal(JSON.parse(body).count,74);assert.equal(headers['Cache-Control'],'no-store, max-age=0');assert.equal(headers['Access-Control-Allow-Origin'],'*');assert.deepEqual(Object.keys(JSON.parse(body)).sort(),['checkedAt','count']);
  global.fetch=async()=>({ok:false});await handler({method:'GET'},res);assert.equal(statusCode,502);assert.equal(JSON.parse(body).count,undefined);
  await handler({method:'POST'},res);assert.equal(statusCode,405);
 }finally{global.fetch=original;}
});
