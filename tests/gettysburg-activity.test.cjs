const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const core = require('../gettysburg/core.js');
const root = path.resolve(__dirname,'..');
const html = fs.readFileSync(path.join(root,'gettysburg/index.html'),'utf8');
function launch(saved = new Map()) {
 const clock={now:new Date(2026,10,8,12).getTime()};
 const listeners={};
 const target=(name)=>({addEventListener(type,fn){(listeners[name+':'+type] ||= []).push(fn);}});
 const els=Object.fromEntries([...html.matchAll(/\bid="([^"]+)"/g)].map(([,id])=>[id,{
  ...target(id),style:{},value:'',hidden:false,textContent:'',disabled:false,
  classList:{toggle(){},add(){},remove(){}},setAttribute(){},focus(){},scrollIntoView(){},
 }]));
 const document={...target('document'),hidden:false,getElementById:id=>els[id],querySelector:s=>els[s.slice(1)]};
 const window={...target('window'),GettysburgCore:core,confirm:()=>true,setTimeout(){},clearTimeout(){}};
 class ClockDate extends Date {constructor(...args){super(...(args.length?args:[clock.now]));}}
 const context=vm.createContext({window,document,Date:ClockDate,localStorage:{getItem:k=>saved.get(k)??null,setItem:(k,v)=>saved.set(k,v)},requestAnimationFrame:fn=>fn()});
 for(const file of ['practice-ui.js','gettysburg/gettysburg.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context);
 return {clock,saved,els,document,emit(name,type,event={}){for(const fn of listeners[name+':'+type]||[])fn(event);},days:()=>JSON.parse(saved.get('gettysburg-activity-v1'))};
}
test('Gettysburg has native links to the sole shared calendar and no separate calendar markup',()=>{
 assert.doesNotMatch(html,/id="(?:calendar-view|calendar-grid|previous-month|next-month)"/);
 assert.match(html,/<a id="calendar-tab"[^>]+href="\.\.\/#calendar"/);
 assert.match(html,/<a id="see-calendar"[^>]+href="\.\.\/#calendar"/);
});
test('opening an empty Gettysburg page earns a daily stamp without changing saved Japanese work',()=>{
 const saved=new Map([['katakana-quest-progress-v1','{"days":{"2026-11-08":{"completed":true}}}']]);
 const original=saved.get('katakana-quest-progress-v1');const app=launch(saved);
 assert.deepEqual(app.days(),{'2026-11-08':true});
 assert.equal(app.els.recitation.value,'');
 assert.equal(app.saved.get('katakana-quest-progress-v1'),original);
 assert.equal(JSON.parse(saved.get('gettysburg-practice-v1')).completions.length,0);
 launch(saved);assert.deepEqual(app.days(),{'2026-11-08':true});
});
for(const type of ['pointerdown','click','keydown','focusin','input','submit','scroll','visibilitychange'])test(`${type} after midnight credits the next day, once, even with a blank draft`,()=>{
 const app=launch();app.clock.now+=24*60*60*1000;
 app.emit('document',type);app.emit('document',type);
 assert.deepEqual(app.days(),{'2026-11-08':true,'2026-11-09':true});
 assert.equal(app.els.recitation.value,'');
});
test('returning focus to Gettysburg earns the new local day',()=>{
 const app=launch();app.clock.now+=24*60*60*1000;app.emit('window','focus');
 assert.equal(app.days()['2026-11-09'],true);
});
test('hidden tabs do not earn a new day from visibilitychange alone',()=>{
 const app=launch();app.clock.now+=24*60*60*1000;
 app.document.hidden=true;app.emit('document','visibilitychange');
 assert.equal(app.days()['2026-11-09'],undefined);
});
