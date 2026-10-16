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
  const CLUES = {
    '入口': 'Look for this when you want to go into a building.',
    '出口': 'Look for this when you want to leave a building.',
    '非常口': 'The way out to use in a fire or other emergency.',
    '押': 'Move the door away from you.',
    '引': 'Move the door towards you.',
    '開': 'This lift button makes the doors move apart.',
    '閉': 'This lift button brings the doors together.',
    '禁止': 'A rule telling you that something is not allowed.',
    '注意': 'A notice asking you to be careful.',
    '危険': 'A warning that you could get hurt.',
    '立入禁止': 'You must not go into this area.',
    '通行止め': 'Traffic cannot continue along this road.',
    '工事中': 'Building or repair work is happening here.',
    '禁煙': 'You cannot light a cigarette here.',
    '喫煙所': 'A designated place for people with cigarettes.',
    '撮影禁止': 'Put your camera away here.',
    '飲食禁止': 'Keep your snacks and drinks in your bag.',
    '無料': 'You do not need to pay anything.',
    '有料': 'You will need to pay to use this.',
    '受付': 'The desk where you check in or register.',
    '駅': 'The place where you catch a train.',
    '改札口': 'Pass through these with your ticket or IC card.',
    '切符': 'Buy this to travel on a train.',
    '乗車券': 'The ticket covering the basic cost of your rail journey.',
    '精算': 'Pay the difference if your ticket did not cover the whole journey.',
    '運賃': 'The amount a journey costs.',
    '片道': 'A ticket for going there, but not coming back.',
    '往復': 'A ticket for going there and coming back.',
    '普通': 'The slower, ordinary train service.',
    '快速': 'A faster service that skips some stations.',
    '急行': 'A fast service with fewer stops than a local train.',
    '特急': 'A premium fast train service with very few stops.',
    '各駅停車': 'This train does not skip any stations.',
    '指定席': 'A seat booked for a particular passenger.',
    '自由席': 'Choose an available seat without booking a specific one.',
    '優先席': 'Seats intended for people who need them most.',
    '乗換': 'Leave one train and catch another.',
    '終点': 'Everyone gets off here: the route goes no further.',
    '発車': 'The train is leaving.',
    '到着': 'The train has reached its destination.',
    '東': 'The compass direction where the sun rises.',
    '西': 'The compass direction where the sun sets.',
    '南': 'The compass direction opposite north.',
    '北': 'The compass direction usually at the top of a map.',
    '右': 'The direction opposite left.',
    '左': 'The direction opposite right.',
    '上': 'Towards the ceiling, not the floor.',
    '下': 'Towards the floor, not the ceiling.',
    '地下': 'A level underneath the ground floor.',
    '地上': 'Not underground: at or above the surface.',
    '階段': 'Use these steps instead of the lift.',
    '上り': 'These steps or this escalator take you to a higher floor.',
    '下り': 'These steps or this escalator take you to a lower floor.',
    '方面': 'Tells you which way a service is heading.',
    '現在地': 'The marker on a map showing your present position.',
    '案内所': 'Ask here for maps, directions and local advice.',
    '駐車場': 'Leave your car here.',
    '駐輪場': 'Leave your bicycle here.',
    '横断歩道': 'The marked place where people walk across a road.',
    '出口専用': 'You may leave through here, but not enter.',
    '営業中': 'The shop is ready to welcome customers now.',
    '準備中': 'Staff are getting ready; customers must wait.',
    '本日休業': 'The shop is not serving customers on this date.',
    '定休日': 'The recurring day of the week when a shop does not open.',
    '営業時間': 'The times when a shop serves customers.',
    '開店': 'The start of a shop’s business day.',
    '閉店': 'The end of a shop’s business day.',
    '入口専用': 'You may enter through here, but not leave.',
    '会計': 'Go here when you are ready to pay.',
    '現金': 'Coins and banknotes, rather than a card.',
    '両替': 'Swap one currency or denomination for another.',
    '税込': 'The displayed price already contains the tax.',
    '税抜': 'Tax will be added to the displayed price.',
    '割引': 'A reduction from the usual price.',
    '半額': 'Pay only 50% of the original price.',
    '特売': 'A temporary bargain offer in a shop.',
    '売り切れ': 'There are none left to buy.',
    '本日': 'This calendar day, not yesterday or tomorrow.',
    '予約': 'Arrange a table, room or service in advance.',
    '満席': 'Every seat is already occupied or booked.',
    '水': 'The clear drink that comes from a tap.',
    'お湯': 'What you boil in a kettle for tea.',
    '飲料水': 'Water that is suitable to drink.',
    '冷水': 'Water from the chilly side of the dispenser.',
    '温水': 'Water from the heated side of the dispenser.',
    '牛肉': 'Meat from a cow.',
    '豚肉': 'Meat from a pig.',
    '鶏肉': 'Meat from the bird commonly served fried.',
    '魚': 'An animal from the sea, often served as sashimi.',
    '卵': 'Something a hen lays.',
    '野菜': 'Foods such as carrots, cabbage and spinach.',
    '乳': 'A dairy allergen in cheese and yoghurt.',
    '小麦': 'The grain used for most bread and noodles.',
    '米': 'The grain used to make onigiri.',
    '食券': 'Buy this from a machine and hand it over for your food.',
    '持ち帰り': 'Your order is packed to eat somewhere else.',
    '大盛': 'Ask for this when you want extra food in your bowl.',
    '小盛': 'Ask for this when you want less food in your bowl.',
    '飲み放題': 'One price lets you order as many drinks as allowed.',
    '食べ放題': 'One price lets you help yourself to more food.',
    '化粧室': 'A polite sign pointing to the toilets.',
    'お手洗い': 'Literally mentions washing hands; look for this when nature calls.',
    '男': 'The male side of the toilets or baths.',
    '女': 'The female side of the toilets or baths.',
    '病院': 'A place for medical treatment with doctors and nurses.',
    '薬局': 'A shop where you get medicines.',
    '交番': 'A small neighbourhood police booth.',
    '警察署': 'The main local building where police officers work.',
    '郵便局': 'Send letters and parcels from here.',
    '銀行': 'A place for money accounts and financial services.',
    '温泉': 'A bath fed by naturally heated spring water.',
    '大浴場': 'A large shared bathing area in a hotel.',
    '入浴': 'The activity of getting into a bath.',
    '清掃中': 'Staff are washing or tidying this area now.',
    '使用中': 'Someone is already using this facility.',
    '空室': 'A hotel has a room available for you.',
    '満室': 'A hotel has no rooms left to book.',
    '休憩所': 'A place to sit down and take a break.',
    '忘れ物': 'Belongings that someone accidentally left behind.',
    '避難所': 'A safe place to go during a disaster.',
  };
  const DAILY_SIZE = 10;
  const view = document.querySelector('#kanji-view');
  const elements = Object.fromEntries([
    'date', 'count', 'progress', 'card', 'context', 'used', 'sign', 'reading',
    'form', 'input', 'submit', 'feedback', 'round', 'review-count', 'review-empty', 'review-list', 'review-note',
    'hints', 'hint-button', 'hint-detail', 'hint-clue', 'hint-reading', 'hint-meaning', 'hint-note',
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
      attempt.textContent = (answer.assisted ? 'Meaning revealed · You wrote: ' : 'You wrote: ') + answer.translation;
      details.append(meaning, reading, attempt);
      item.append(text, details);
      elements['review-list'].appendChild(item);
    });
  }

  function hintLevel(sign) {
    const session = state.reviewSession || state.day;
    return Math.max(0, Math.min(3, Number(session.hints && session.hints[sign.id]) || 0));
  }

  function renderHints(sign, answered) {
    elements.hints.hidden = Boolean(answered);
    const level = hintLevel(sign);
    elements['hint-button'].hidden = level === 3;
    elements['hint-button'].textContent = ['Need a hint?', 'Show reading →', 'Reveal meaning (save for review)'][level] || '';
    elements['hint-button'].setAttribute('aria-expanded', String(level > 0));
    elements['hint-detail'].hidden = level === 0;
    elements['hint-clue'].textContent = level ? 'Clue: ' + CLUES[sign.id] : '';
    elements['hint-reading'].hidden = level < 2;
    elements['hint-reading'].textContent = level >= 2 ? sign.reading : '';
    elements['hint-meaning'].hidden = level < 3;
    elements['hint-meaning'].textContent = level >= 3 ? 'Meaning: ' + sign.meaning : '';
    elements['hint-note'].textContent = level === 3
      ? 'Type the meaning to practise. After you check it, this sign stays saved for another try.'
      : level === 2 ? 'Still stuck? Revealing the meaning will keep this sign for review.'
        : 'Start with a clue, then the reading. Reveal the meaning if you’re stuck.';
  }

  function makeAnswer(sign, translation) {
    return {
      id: sign.id, translation,
      correct: sign.answers.some((answer) => normalize(answer) === normalize(translation)),
      assisted: hintLevel(sign) === 3,
    };
  }

  function renderSign(sign, answered, reviewing) {
    elements.context.textContent = sign.context;
    elements.sign.textContent = sign.text;
    elements.input.value = answered ? answered.translation : '';
    elements.input.disabled = Boolean(answered);
    renderHints(sign, answered);
    const lastReview = reviewing && state.reviewSession.index === state.reviewSession.ids.length - 1;
    elements.submit.textContent = answered
      ? (reviewing ? (lastReview ? 'Continue →' : 'Next review →') : 'Next sign →')
      : 'Check answer ↗';
    if (answered) {
      elements.reading.textContent = sign.reading;
      elements.reading.hidden = false;
      if (answered.assisted) {
        showFeedback(true, 'Keep learning — you’ve got this!', sign.meaning + '. Meaning revealed, so this sign is saved for another try.');
        return;
      }
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
    elements.hints.hidden = true;
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
      const correct = day.answers.filter((answer) => answer.correct && !answer.assisted).length;
      showFeedback(true, 'Ten signs done! 🎉', correct + ' / 10 correct without revealing the meaning. Come back tomorrow for fresh signs.');
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
        const answer = makeAnswer(sign, translation);
        round.answers.push(answer);
        state.review = state.review.filter((entry) => entry && entry.id !== sign.id);
        if (!answer.correct || answer.assisted) state.review.push(answer);
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
    const answer = makeAnswer(sign, translation);
    day.answers.push(answer);
    if (day.answers.length === DAILY_SIZE && !state.completedDays.includes(day.date)) {
      state.completedDays.push(day.date);
    }
    if (!answer.correct || answer.assisted) state.review.push(answer);
    save();
    render();
  });

  elements['hint-button'].addEventListener('click', () => {
    if (!state.day || state.day.date !== dateKey()) {
      render();
      return;
    }
    const session = state.reviewSession || state.day;
    const id = state.reviewSession ? session.ids[session.index] : session.currentId;
    const sign = SIGNS.find((entry) => entry.id === id);
    if (!sign || session.answers.some((answer) => answer.id === id)
      || (!state.reviewSession && session.answers.length >= DAILY_SIZE)) return;
    const level = hintLevel(sign);
    if (level >= 3) return;
    session.hints = { ...session.hints, [id]: level + 1 };
    save();
    // Update hints only: do not erase an answer already being typed.
    renderHints(sign, false);
    if (level === 2) elements.input.focus();
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
