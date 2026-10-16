(() => {
  'use strict';

  // Stable sign text is the identity: append new entries without recycling old ones.
  const SIGNS = [
    ['入口', 'いりぐち', 'entrance', 'Buildings', ['entry']],
    ['出口', 'でぐち', 'exit', 'Buildings', ['way out']],
    ['非常口', 'ひじょうぐち', 'emergency exit', 'Buildings', ['fire exit']],
    ['押', 'おす', 'push', 'Doors', []],
    ['引', 'ひく', 'pull', 'Doors', []],
    ['開', 'ひらく', 'open', 'Lift buttons', []],
    ['閉', 'とじる', 'close', 'Lift buttons', ['shut']],
    ['禁止', 'きんし', 'prohibited', 'Public notices', ['forbidden', 'not allowed', 'banned']],
    ['注意', 'ちゅうい', 'caution', 'Public notices', ['warning', 'be careful', 'attention']],
    ['危険', 'きけん', 'danger', 'Public notices', ['dangerous']],
    ['立入禁止', 'たちいりきんし', 'no entry', 'Public notices', ['keep out', 'do not enter', 'entry prohibited', 'entry forbidden']],
    ['通行止め', 'つうこうどめ', 'road closed', 'Road signs', ['no passage', 'closed to traffic', 'no through traffic', 'passage prohibited']],
    ['工事中', 'こうじちゅう', 'under construction', 'Public notices', ['construction', 'construction work', 'roadworks']],
    ['禁煙', 'きんえん', 'no smoking', 'Public notices', ['smoking prohibited', 'smoking forbidden', 'non smoking', 'do not smoke']],
    ['喫煙所', 'きつえんじょ', 'smoking area', 'Public facilities', ['smoking room', 'smoking zone']],
    ['撮影禁止', 'さつえいきんし', 'no photography', 'Public notices', ['no photos', 'photography prohibited', 'photography forbidden', 'do not take photos']],
    ['飲食禁止', 'いんしょくきんし', 'no eating or drinking', 'Public notices', ['no food or drink', 'no food or drinks', 'no eating and drinking', 'eating and drinking prohibited']],
    ['無料', 'むりょう', 'free of charge', 'Prices', ['free', 'no charge']],
    ['有料', 'ゆうりょう', 'fee required', 'Prices', ['paid', 'charge applies', 'not free', 'payment required', 'there is a charge']],
    ['受付', 'うけつけ', 'reception', 'Buildings', ['reception desk', 'registration', 'information desk']],

    ['駅', 'えき', 'station', 'Transport', ['train station', 'railway station']],
    ['改札口', 'かいさつぐち', 'ticket gates', 'Stations', ['ticket gate', 'ticket barrier', 'ticket barriers']],
    ['切符', 'きっぷ', 'ticket', 'Stations', ['tickets', 'train ticket']],
    ['乗車券', 'じょうしゃけん', 'basic fare ticket', 'Stations', ['ticket', 'train ticket', 'boarding ticket', 'fare ticket']],
    ['精算', 'せいさん', 'fare adjustment', 'Stations', ['adjust fare', 'fare settlement']],
    ['運賃', 'うんちん', 'fare', 'Transport', ['fares', 'travel fare']],
    ['片道', 'かたみち', 'one way', 'Tickets', ['one way ticket', 'single', 'single ticket']],
    ['往復', 'おうふく', 'round trip', 'Tickets', ['return', 'return ticket', 'round trip ticket', 'two way']],
    ['普通', 'ふつう', 'local train', 'Train services', ['local', 'ordinary', 'ordinary train', 'normal']],
    ['快速', 'かいそく', 'rapid train', 'Train services', ['rapid', 'rapid service']],
    ['急行', 'きゅうこう', 'express train', 'Train services', ['express']],
    ['特急', 'とっきゅう', 'limited express', 'Train services', ['limited express train']],
    ['各駅停車', 'かくえきていしゃ', 'stops at every station', 'Train services', ['local train', 'local', 'all stops', 'all stations', 'stops at all stations']],
    ['指定席', 'していせき', 'reserved seat', 'Train seating', ['reserved seats', 'reserved seating']],
    ['自由席', 'じゆうせき', 'unreserved seat', 'Train seating', ['unreserved seats', 'non reserved seat', 'non reserved seats', 'unreserved seating']],
    ['優先席', 'ゆうせんせき', 'priority seat', 'Train seating', ['priority seats', 'priority seating']],
    ['乗換', 'のりかえ', 'transfer', 'Stations', ['change trains', 'connection', 'interchange', 'train transfer']],
    ['終点', 'しゅうてん', 'last stop', 'Transport', ['final stop', 'terminus', 'terminal station']],
    ['発車', 'はっしゃ', 'departure', 'Transport', ['departing', 'departs', 'depart']],
    ['到着', 'とうちゃく', 'arrival', 'Transport', ['arriving', 'arrives', 'arrive']],

    ['東', 'ひがし', 'east', 'Directions', []],
    ['西', 'にし', 'west', 'Directions', []],
    ['南', 'みなみ', 'south', 'Directions', []],
    ['北', 'きた', 'north', 'Directions', []],
    ['右', 'みぎ', 'right', 'Directions', []],
    ['左', 'ひだり', 'left', 'Directions', []],
    ['上', 'うえ', 'up', 'Directions', ['above', 'upper', 'top']],
    ['下', 'した', 'down', 'Directions', ['below', 'lower', 'bottom']],
    ['地下', 'ちか', 'basement', 'Buildings', ['underground', 'below ground']],
    ['地上', 'ちじょう', 'above ground', 'Buildings', ['ground level', 'aboveground']],
    ['階段', 'かいだん', 'stairs', 'Buildings', ['staircase', 'stairway', 'steps']],
    ['上り', 'のぼり', 'going up', 'Stairs and escalators', ['up', 'upward', 'upwards', 'up escalator']],
    ['下り', 'くだり', 'going down', 'Stairs and escalators', ['down', 'downward', 'downwards', 'down escalator']],
    ['方面', 'ほうめん', 'direction', 'Transport', ['towards', 'toward', 'bound for', 'in the direction of']],
    ['現在地', 'げんざいち', 'you are here', 'Maps', ['current location', 'current position', 'your location']],
    ['案内所', 'あんないじょ', 'information centre', 'Public facilities', ['information center', 'information desk', 'information office', 'tourist information', 'tourist information centre', 'tourist information center']],
    ['駐車場', 'ちゅうしゃじょう', 'car park', 'Public facilities', ['parking', 'parking lot', 'parking area']],
    ['駐輪場', 'ちゅうりんじょう', 'bicycle parking', 'Public facilities', ['bike parking', 'cycle parking', 'bicycle parking area']],
    ['横断歩道', 'おうだんほどう', 'pedestrian crossing', 'Road signs', ['crosswalk', 'zebra crossing']],
    ['出口専用', 'でぐちせんよう', 'exit only', 'Buildings', ['for exit only']],

    ['営業中', 'えいぎょうちゅう', 'open for business', 'Shops', ['open', 'currently open']],
    ['準備中', 'じゅんびちゅう', 'not open yet', 'Shops', ['preparing to open', 'getting ready', 'preparing', 'in preparation']],
    ['本日休業', 'ほんじつきゅうぎょう', 'closed today', 'Shops', ['closed for the day']],
    ['定休日', 'ていきゅうび', 'regular closing day', 'Shops', ['regular day off', 'weekly closing day', 'regular holiday', 'scheduled closing day']],
    ['営業時間', 'えいぎょうじかん', 'opening hours', 'Shops', ['business hours', 'hours of operation', 'operating hours']],
    ['開店', 'かいてん', 'shop opening', 'Shops', ['opening', 'open', 'opening time']],
    ['閉店', 'へいてん', 'shop closing', 'Shops', ['closing', 'closed', 'closing time']],
    ['入口専用', 'いりぐちせんよう', 'entrance only', 'Buildings', ['entry only', 'for entry only']],
    ['会計', 'かいけい', 'checkout', 'Shops and restaurants', ['cashier', 'payment', 'bill', 'check out', 'pay here']],
    ['現金', 'げんきん', 'cash', 'Payments', ['cash money']],
    ['両替', 'りょうがえ', 'money exchange', 'Payments', ['currency exchange', 'change money', 'exchange', 'changing money']],
    ['税込', 'ぜいこみ', 'tax included', 'Price labels', ['including tax', 'includes tax', 'tax inclusive']],
    ['税抜', 'ぜいぬき', 'tax excluded', 'Price labels', ['excluding tax', 'before tax', 'without tax', 'tax not included']],
    ['割引', 'わりびき', 'discount', 'Price labels', ['discounted', 'price reduction']],
    ['半額', 'はんがく', 'half price', 'Price labels', ['50 percent off', '50 off', 'half off']],
    ['特売', 'とくばい', 'special sale', 'Price labels', ['sale', 'special offer', 'bargain sale']],
    ['売り切れ', 'うりきれ', 'sold out', 'Shops and restaurants', ['out of stock', 'unavailable']],
    ['本日', 'ほんじつ', 'today', 'Public notices', ['this day']],
    ['予約', 'よやく', 'reservation', 'Shops and restaurants', ['booking', 'reserve', 'book']],
    ['満席', 'まんせき', 'all seats taken', 'Restaurants and transport', ['full', 'no seats available', 'fully booked', 'no available seats', 'all seats occupied']],

    ['水', 'みず', 'water', 'Food and drink', []],
    ['お湯', 'おゆ', 'hot water', 'Food and drink', []],
    ['飲料水', 'いんりょうすい', 'drinking water', 'Public facilities', ['drinkable water', 'potable water']],
    ['冷水', 'れいすい', 'cold water', 'Taps and dispensers', []],
    ['温水', 'おんすい', 'warm water', 'Taps and dispensers', ['hot water', 'heated water']],
    ['牛肉', 'ぎゅうにく', 'beef', 'Menus and food labels', []],
    ['豚肉', 'ぶたにく', 'pork', 'Menus and food labels', []],
    ['鶏肉', 'とりにく', 'chicken', 'Menus and food labels', ['chicken meat']],
    ['魚', 'さかな', 'fish', 'Menus and food labels', []],
    ['卵', 'たまご', 'egg', 'Menus and food labels', ['eggs']],
    ['野菜', 'やさい', 'vegetables', 'Menus and food labels', ['vegetable', 'veg']],
    ['乳', 'にゅう', 'milk', 'Allergen labels', ['dairy']],
    ['小麦', 'こむぎ', 'wheat', 'Allergen labels', []],
    ['米', 'こめ', 'rice', 'Food labels', ['uncooked rice']],
    ['食券', 'しょっけん', 'meal ticket', 'Restaurants', ['food ticket', 'food voucher']],
    ['持ち帰り', 'もちかえり', 'takeaway', 'Restaurants', ['take away', 'takeout', 'take out', 'to go']],
    ['大盛', 'おおもり', 'large portion', 'Menus', ['large serving', 'large', 'extra large portion', 'big portion']],
    ['小盛', 'こもり', 'small portion', 'Menus', ['small serving', 'small']],
    ['飲み放題', 'のみほうだい', 'all you can drink', 'Menus', ['unlimited drinks', 'unlimited drinking']],
    ['食べ放題', 'たべほうだい', 'all you can eat', 'Menus', ['unlimited food', 'buffet']],

    ['化粧室', 'けしょうしつ', 'restroom', 'Public facilities', ['toilet', 'toilets', 'bathroom', 'washroom', 'lavatory']],
    ['お手洗い', 'おてあらい', 'toilet', 'Public facilities', ['restroom', 'toilets', 'bathroom', 'washroom', 'lavatory']],
    ['男', 'おとこ', 'men', 'Toilet and bath signs', ['male', 'man', 'mens', "men's"]],
    ['女', 'おんな', 'women', 'Toilet and bath signs', ['female', 'woman', 'womens', "women's"]],
    ['病院', 'びょういん', 'hospital', 'Around town', []],
    ['薬局', 'やっきょく', 'pharmacy', 'Around town', ['chemist', 'drugstore', 'drug store']],
    ['交番', 'こうばん', 'police box', 'Around town', ['police booth', 'small police station', 'neighbourhood police station', 'neighborhood police station']],
    ['警察署', 'けいさつしょ', 'police station', 'Around town', []],
    ['郵便局', 'ゆうびんきょく', 'post office', 'Around town', []],
    ['銀行', 'ぎんこう', 'bank', 'Around town', []],
    ['温泉', 'おんせん', 'hot spring', 'Bathing facilities', ['hot springs', 'onsen']],
    ['大浴場', 'だいよくじょう', 'communal bath', 'Hotels and baths', ['public bath', 'large bath', 'large bathing area', 'communal bathing area']],
    ['入浴', 'にゅうよく', 'bathing', 'Bathing facilities', ['taking a bath', 'take a bath', 'bath']],
    ['清掃中', 'せいそうちゅう', 'cleaning in progress', 'Public notices', ['being cleaned', 'cleaning', 'under cleaning']],
    ['使用中', 'しようちゅう', 'in use', 'Public facilities', ['occupied', 'being used']],
    ['空室', 'くうしつ', 'vacant room', 'Hotels', ['vacancy', 'vacancies', 'rooms available', 'room available', 'vacant']],
    ['満室', 'まんしつ', 'no vacancies', 'Hotels', ['fully booked', 'full', 'no rooms available', 'all rooms occupied']],
    ['休憩所', 'きゅうけいじょ', 'rest area', 'Public facilities', ['resting area', 'rest stop', 'resting place']],
    ['忘れ物', 'わすれもの', 'lost property', 'Public facilities', ['lost items', 'lost belongings', 'lost and found', 'forgotten items']],
    ['避難所', 'ひなんじょ', 'evacuation shelter', 'Public notices', ['evacuation centre', 'evacuation center', 'emergency shelter', 'shelter']],
  ].map(([text, reading, meaning, context, alternatives]) => ({
    id: text, text, reading, meaning, context, answers: [meaning, ...alternatives],
  }));

  const STORAGE_KEY = 'katakana-quest-kanji-v1';
  const DAILY_SIZE = 10;
  const view = document.querySelector('#kanji-view');
  const elements = Object.fromEntries([
    'date', 'count', 'progress', 'card', 'context', 'used', 'sign', 'reading',
    'form', 'input', 'submit', 'feedback', 'round', 'review-count', 'review-empty', 'review-list', 'review-note',
  ].map((name) => [name, document.querySelector('#kanji-' + name)]));
  let state = loadState();

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return {
        usedIds: Array.isArray(saved.usedIds) ? saved.usedIds : [],
        review: Array.isArray(saved.review) ? saved.review : [],
        reviewSession: saved.reviewSession && Array.isArray(saved.reviewSession.ids)
          && Array.isArray(saved.reviewSession.answers) ? saved.reviewSession : null,
        completedDays: [...new Set([
          ...(Array.isArray(saved.completedDays) ? saved.completedDays : []),
          ...(saved.day && Array.isArray(saved.day.answers) && saved.day.answers.length >= DAILY_SIZE ? [saved.day.date] : []),
        ])].filter((date) => typeof date === 'string'),
        day: saved.day && typeof saved.day === 'object' ? saved.day : null,
      };
    } catch {
      return { usedIds: [], review: [], reviewSession: null, completedDays: [], day: null };
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event('kanji:progress'));
  }

  function dateKey() {
    const date = new Date();
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  }

  function getDay() {
    if (!state.day || state.day.date !== dateKey()) {
      state.day = { date: dateKey(), answers: [], currentId: null };
      state.reviewSession = null;
      startReview();
      save();
    }
    return state.day;
  }

  function startReview() {
    if (state.reviewSession) return;
    const ids = [...new Set(state.review.filter(Boolean).map((answer) => answer.id))]
      .filter((id) => SIGNS.some((sign) => sign.id === id));
    if (!ids.length) return;
    state.reviewSession = { ids, answers: [], index: 0 };
    // Resume new practice at the next unanswered sign after the review round.
    if (state.day && state.day.answers.some((answer) => answer.id === state.day.currentId)) {
      state.day.currentId = null;
    }
    save();
  }

  function normalize(value) {
    return value.toLowerCase().normalize('NFKD')
      .replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/^(?:a|an|the|to) /, '');
  }

  function showFeedback(correct, title, message) {
    const kind = correct ? 'is-correct' : 'is-wrong';
    elements.card.classList.add(kind);
    elements.feedback.className = 'feedback ' + kind;
    const symbol = document.createElement('span');
    symbol.className = 'feedback-symbol';
    symbol.setAttribute('aria-hidden', 'true');
    symbol.textContent = correct ? '✦' : '✕';
    const copy = document.createElement('div');
    copy.className = 'feedback-copy';
    const heading = document.createElement('strong');
    heading.textContent = title;
    const detail = document.createElement('span');
    detail.textContent = message;
    copy.append(heading, detail);
    elements.feedback.replaceChildren(symbol, copy);
    elements.feedback.hidden = false;
  }

  function renderReview() {
    const entries = state.review
      .filter(Boolean)
      .map((answer) => ({ answer, sign: SIGNS.find((sign) => sign.id === answer.id) }))
      .filter(({ sign }) => sign)
      .reverse();
    elements['review-count'].textContent = entries.length + (entries.length === 1 ? ' sign' : ' signs');
    const testing = Boolean(state.reviewSession);
    elements['review-list'].hidden = testing;
    elements['review-note'].hidden = !testing;
    if (testing) {
      elements['review-empty'].hidden = true;
      elements['review-list'].replaceChildren();
      return;
    }
    elements['review-empty'].hidden = entries.length > 0;
    elements['review-list'].replaceChildren();
    entries.forEach(({ answer, sign }) => {
      const item = document.createElement('li');
      item.className = 'review-item';
      const text = document.createElement('span');
      text.className = 'review-kana';
      text.lang = 'ja';
      text.textContent = sign.text;
      const details = document.createElement('div');
      details.className = 'review-details';
      const meaning = document.createElement('strong');
      meaning.textContent = sign.meaning;
      const reading = document.createElement('span');
      reading.lang = 'ja';
      reading.textContent = sign.reading;
      const attempt = document.createElement('span');
      attempt.textContent = 'You wrote: ' + answer.translation;
      details.append(meaning, reading, attempt);
      item.append(text, details);
      elements['review-list'].appendChild(item);
    });
  }

  function renderSign(sign, answered, reviewing) {
    elements.context.textContent = sign.context;
    elements.sign.textContent = sign.text;
    elements.input.value = answered ? answered.translation : '';
    elements.input.disabled = Boolean(answered);
    const lastReview = reviewing && state.reviewSession.index === state.reviewSession.ids.length - 1;
    elements.submit.textContent = answered
      ? (reviewing ? (lastReview ? 'Continue →' : 'Next review →') : 'Next sign →')
      : 'Check answer ↗';
    if (answered) {
      elements.reading.textContent = sign.reading;
      elements.reading.hidden = false;
      const message = reviewing
        ? (answered.correct ? '. Remembered! Removed from review.' : '. Saved to try again next visit.')
        : (answered.correct ? '. Great reading!' : '. Saved for a retest next visit.');
      showFeedback(answered.correct, answered.correct ? 'Yes! You got it! 🎉' : 'Not this time', sign.meaning + message);
    }
  }

  function render() {
    const day = getDay();
    elements.date.textContent = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
    elements.count.textContent = String(day.answers.length);
    elements.progress.style.width = day.answers.length / DAILY_SIZE * 100 + '%';
    elements.used.textContent = state.usedIds.length + ' / ' + SIGNS.length + ' seen';
    elements.card.classList.remove('is-correct', 'is-wrong');
    elements.feedback.hidden = true;
    elements.reading.hidden = true;
    elements.round.hidden = true;
    elements.form.hidden = false;
    renderReview();

    const round = state.reviewSession;
    if (round) {
      const sign = SIGNS.find((entry) => entry.id === round.ids[round.index]);
      const answered = round.answers.find((answer) => answer.id === sign.id);
      elements.round.hidden = false;
      elements.round.textContent = 'Review from last time · ' + (round.index + 1) + ' of ' + round.ids.length;
      renderSign(sign, answered, true);
      return;
    }

    if (day.answers.length >= DAILY_SIZE) {
      elements.context.textContent = 'All done for today';
      elements.sign.textContent = '✦';
      elements.form.hidden = true;
      const correct = day.answers.filter((answer) => answer.correct).length;
      showFeedback(true, 'Ten signs done! 🎉', correct + ' / 10 correct. Come back tomorrow for fresh signs.');
      return;
    }

    if (!day.currentId) {
      const available = SIGNS.filter((sign) => !state.usedIds.includes(sign.id));
      if (available.length) {
        const sign = available[Math.floor(Math.random() * available.length)];
        day.currentId = sign.id;
        state.usedIds.push(sign.id);
        save();
        elements.used.textContent = state.usedIds.length + ' / ' + SIGNS.length + ' seen';
      }
    }
    const sign = SIGNS.find((entry) => entry.id === day.currentId);
    if (!sign) {
      elements.context.textContent = 'Bank complete';
      elements.sign.textContent = '✦';
      elements.form.hidden = true;
      showFeedback(true, 'Every sign explored!', 'You have seen all ' + SIGNS.length + ' signs. New signs stop here; missed signs will still be retested when you return.');
      return;
    }

    const answered = day.answers.find((answer) => answer.id === sign.id);
    renderSign(sign, answered, false);
  }

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!state.day || state.day.date !== dateKey()) {
      render();
      return;
    }
    const day = getDay();
    const round = state.reviewSession;
    if (round) {
      const sign = SIGNS.find((entry) => entry.id === round.ids[round.index]);
      if (round.answers.some((answer) => answer.id === sign.id)) {
        if (round.index + 1 < round.ids.length) round.index += 1;
        else state.reviewSession = null;
      } else {
        const translation = elements.input.value.trim();
        if (!translation) return;
        const correct = sign.answers.some((answer) => normalize(answer) === normalize(translation));
        const answer = { id: sign.id, translation, correct };
        round.answers.push(answer);
        state.review = state.review.filter((entry) => entry && entry.id !== sign.id);
        if (!correct) state.review.push(answer);
      }
      save();
      render();
      return;
    }
    if (day.answers.length >= DAILY_SIZE) return;
    const sign = SIGNS.find((entry) => entry.id === day.currentId);
    if (!sign) return;
    if (day.answers.some((answer) => answer.id === sign.id)) {
      day.currentId = null;
      save();
      render();
      return;
    }
    const translation = elements.input.value.trim();
    if (!translation) return;
    const correct = sign.answers.some((answer) => normalize(answer) === normalize(translation));
    const answer = { id: sign.id, translation, correct };
    day.answers.push(answer);
    if (day.answers.length === DAILY_SIZE && !state.completedDays.includes(day.date)) {
      state.completedDays.push(day.date);
    }
    if (!correct) state.review.push(answer);
    save();
    render();
  });

  function refreshDay() {
    if (!view.hidden && (!state.day || state.day.date !== dateKey())) render();
  }

  window.addEventListener('kanji:open', () => {
    getDay();
    startReview();
    render();
  });
  window.addEventListener('focus', refreshDay);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refreshDay();
  });
  window.setInterval(refreshDay, 60 * 1000);
  renderReview();
})();
