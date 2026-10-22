const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const { launch, key, localDay } = require('./browser-fixture.cjs');
const gachaKey = 'katakana-quest-gacha-v1';
function prepare(days) {
  const history = Object.fromEntries(Array.from({length: days}, (_, i) => {
    const d = new Date(localDay(i - days));
    const date = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    return [date, {correct: 10, completed: true}];
  }));
  history['2026-10-16'] = {correct: 9, completed: false};
  return launch({saved: new Map([[key, JSON.stringify({days: history})]]), random: 0});
}
function finish(app) {
  app.els['answer-input'].value = 'my paraphrase';
  app.els['answer-form'].listeners.submit({preventDefault() {}});
  app.els['katakana-grade-override'].listeners.click();
}
test('collection markup belongs to Calendar, while the earning notification is global', () => {
  const html = fs.readFileSync(require.resolve('../index.html'),'utf8');
  const calendar = html.indexOf('id="calendar-view"');
  const collection = html.indexOf('id="gacha-collection"');
  const back = html.indexOf('id="back-to-quest"');
  assert.ok(calendar < collection && collection < back);
  assert.ok(html.indexOf('id="capsule-celebration"') > html.indexOf('</main>'));
});
for (const [days, count] of [[6,1],[13,2],[29,1],[59,1]]) {
  test(`earning day ${days+1} celebrates once and preserves unopened rewards`, () => {
    const app = prepare(days);
    assert.equal(app.els['capsule-celebration'].hidden, true);
    finish(app);
    assert.equal(app.els['capsule-celebration'].hidden, false);
    assert.equal(app.els['celebration-title'].textContent, count===1 ? 'Capsule unlocked!' : '2 capsules unlocked!');
    assert.match(app.els['celebration-message'].textContent, new RegExp(`${days+1}-day streak`));
    const rewards = JSON.parse(app.saved.get(gachaKey));
    assert.ok(rewards.sushiWeeks.every(r => r.openedOn===null));
    assert.ok(Object.values(rewards.rewards).every(r => r.openedOn===null));
    assert.equal(app.els['quest-view'].hidden, false);
    assert.equal(app.els['calendar-view'].hidden, true);
    app.windowEvents.focus();
    assert.equal(app.timeouts.size,1);
    const reloaded = launch({saved: app.saved});
    assert.equal(reloaded.els['capsule-celebration'].hidden,true);
    assert.equal(reloaded.timeouts.size,0);
  });
}
test('reward CTA and streak link navigate to Calendar; dismiss and expiry leave rewards earned', () => {
  const app = prepare(6);
  finish(app);
  app.els['celebration-view'].listeners.click();
  assert.equal(app.els['capsule-celebration'].hidden,true);
  assert.equal(app.els['calendar-view'].hidden,false);
  assert.equal(app.els['quest-view'].hidden,true);
  assert.equal(app.timeouts.size,0);
  app.els['back-to-quest'].listeners.click();
  app.els['gacha-link'].listeners.click({preventDefault() {}});
  assert.equal(app.els['calendar-view'].hidden,false);
  const expiring = prepare(6);
  finish(expiring);
  [...expiring.timeouts.values()][0]();
  assert.equal(expiring.els['capsule-celebration'].hidden,true);
  assert.equal(JSON.parse(expiring.saved.get(gachaKey)).rewards.sushi.openedOn,null);
  const dismissing = prepare(6);
  finish(dismissing);
  dismissing.els['celebration-dismiss'].listeners.click();
  assert.equal(dismissing.els['capsule-celebration'].hidden,true);
  assert.equal(dismissing.timeouts.size,0);
});

test('Escape dismisses the celebration without leaving practice', () => {
  const app = prepare(6);
  finish(app);
  app.documentEvents.keydown({key: 'Escape'});
  assert.equal(app.els['capsule-celebration'].hidden, true);
  assert.equal(app.els['quest-view'].hidden, false);
  assert.equal(app.timeouts.size, 0);
});
