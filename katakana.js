(() => {
  'use strict';

  // Every id is unique. A word is added to usedWords as soon as it is shown,
  // which means a refresh or an incorrect answer can never serve it again.
  const WORDS = [
    ['アイス', 'ice cream', ['ice cream', 'ice-cream']],
    ['アニメ', 'anime', ['anime']],
    ['アパート', 'apartment', ['apartment', 'flat']],
    ['アメリカ', 'America', ['america', 'the united states', 'united states', 'usa']],
    ['アルバム', 'album', ['album']],
    ['エアコン', 'air conditioner', ['air conditioner', 'air conditioning']],
    ['エレベーター', 'elevator', ['elevator', 'lift']],
    ['オレンジ', 'orange', ['orange']],
    ['カメラ', 'camera', ['camera']],
    ['カレンダー', 'calendar', ['calendar']],
    ['ギター', 'guitar', ['guitar']],
    ['ケーキ', 'cake', ['cake']],
    ['コーヒー', 'coffee', ['coffee']],
    ['コンピューター', 'computer', ['computer']],
    ['サラダ', 'salad', ['salad']],
    ['サンドイッチ', 'sandwich', ['sandwich']],
    ['シャツ', 'shirt', ['shirt']],
    ['ジュース', 'juice', ['juice']],
    ['スーパー', 'supermarket', ['supermarket', 'grocery store', 'supermarket']],
    ['スプーン', 'spoon', ['spoon']],
    ['スポーツ', 'sport', ['sport', 'sports']],
    ['セーター', 'sweater', ['sweater', 'jumper']],
    ['タクシー', 'taxi', ['taxi', 'cab']],
    ['チーズ', 'cheese', ['cheese']],
    ['テーブル', 'table', ['table']],
    ['テレビ', 'television', ['television', 'tv', 'telly']],
    ['トイレ', 'toilet', ['toilet', 'bathroom', 'restroom']],
    ['トマト', 'tomato', ['tomato']],
    ['ドア', 'door', ['door']],
    ['ナイフ', 'knife', ['knife']],
    ['ニュース', 'news', ['news']],
    ['ネクタイ', 'tie', ['tie', 'necktie']],
    ['パーティー', 'party', ['party']],
    ['パン', 'bread', ['bread']],
    ['ピアノ', 'piano', ['piano']],
    ['ビール', 'beer', ['beer']],
    ['ビデオ', 'video', ['video']],
    ['ファイル', 'file', ['file']],
    ['フォーク', 'fork', ['fork']],
    ['フルーツ', 'fruit', ['fruit']],
    ['ベッド', 'bed', ['bed']],
    ['ペン', 'pen', ['pen']],
    ['ホテル', 'hotel', ['hotel']],
    ['ボール', 'ball', ['ball']],
    ['ポケット', 'pocket', ['pocket']],
    ['マイク', 'microphone', ['microphone', 'mic']],
    ['ミルク', 'milk', ['milk']],
    ['メニュー', 'menu', ['menu']],
    ['モーター', 'motor', ['motor']],
    ['ヨーグルト', 'yogurt', ['yogurt', 'yoghurt']],
    ['ラジオ', 'radio', ['radio']],
    ['ラーメン', 'ramen', ['ramen']],
    ['リモコン', 'remote control', ['remote control', 'remote']],
    ['リンゴ', 'apple', ['apple']],
    ['ルール', 'rule', ['rule', 'rules']],
    ['レストラン', 'restaurant', ['restaurant']],
    ['レモン', 'lemon', ['lemon']],
    ['ロボット', 'robot', ['robot']],
    ['ワイン', 'wine', ['wine']],
    ['ワンピース', 'dress', ['dress']],
    ['アイデア', 'idea', ['idea']],
    ['イベント', 'event', ['event']],
    ['ガソリン', 'gasoline', ['gasoline', 'petrol', 'gas']],
    ['キッチン', 'kitchen', ['kitchen']],
    ['クラス', 'class', ['class']],
    ['ゲーム', 'game', ['game']],
    ['コピー', 'copy', ['copy']],
    ['サイン', 'sign', ['sign']],
    ['システム', 'system', ['system']],
    ['スキー', 'skiing', ['skiing', 'ski']],
    ['ソファ', 'sofa', ['sofa', 'couch']],
    ['チョコレート', 'chocolate', ['chocolate']],
    ['デート', 'date', ['date']],
    ['デザイン', 'design', ['design']],
    ['ドライバー', 'driver', ['driver', 'screwdriver']],
    ['バナナ', 'banana', ['banana']],
    ['パスポート', 'passport', ['passport']],
    ['ビル', 'building', ['building']],
    ['ブランド', 'brand', ['brand']],
    ['プリン', 'pudding', ['pudding', 'custard']],
    ['ベルト', 'belt', ['belt']],
    ['ペット', 'pet', ['pet']],
    ['ポスト', 'postbox', ['postbox', 'mailbox', 'post']],
  ].map(([kana, english, answers], index) => ({ id: `word-${index + 1}`, kana, english, answers }));

  // The Japanese prompt is spoken, never rendered as text in the listening UI.
  const PHRASES = [
    { id: 'repeat', japanese: 'もう一度言ってください。', meaning: 'Please say that again.' },
    { id: 'station', japanese: '駅までどうやって行きますか。', meaning: 'How do I get to the station?' },
    { id: 'rain', japanese: '明日は雨が降るかもしれません。', meaning: 'It might rain tomorrow.' },
    { id: 'closing', japanese: 'この店は何時まで開いていますか。', meaning: 'What time does this shop close?' },
    { id: 'home', japanese: '今日は早く帰らなければなりません。', meaning: 'I have to go home early today.' },
    { id: 'speak-slowly', japanese: 'もう少しゆっくり話していただけませんか。', meaning: 'Could you speak a little more slowly?' },
    { id: 'write-name', japanese: '名前をここに書いてください。', meaning: 'Please write your name here.' },
    { id: 'word-meaning', japanese: 'この言葉の意味を教えてもらえますか。', meaning: 'Could you tell me what this word means?' },
    { id: 'not-understood', japanese: 'すみませんが、よく分かりませんでした。', meaning: "I'm sorry, I didn't quite understand." },
    { id: 'call-later', japanese: '後で電話してもいいですか。', meaning: 'May I call you later?' },

    { id: 'change-trains', japanese: '次の駅で電車を乗り換えてください。', meaning: 'Please change trains at the next station.' },
    { id: 'last-train', japanese: '最後の電車に間に合わないかもしれません。', meaning: 'I might not make it in time for the last train.' },
    { id: 'bus-stop', japanese: 'バスが止まってから降りてください。', meaning: 'Please get off after the bus has stopped.' },
    { id: 'walk-station', japanese: '駅まで歩いて十分ぐらいかかります。', meaning: 'It takes about ten minutes to walk to the station.' },
    { id: 'missed-bus', japanese: 'バスに乗れなかったので、歩いて帰りました。', meaning: "I couldn't catch the bus, so I walked home." },
    { id: 'ticket-before', japanese: '電車に乗る前に、切符を買ってください。', meaning: 'Please buy a ticket before boarding the train.' },
    { id: 'bus-faster', japanese: '歩くより、バスで行ったほうが早いです。', meaning: 'Taking the bus is faster than walking.' },
    { id: 'train-delay', japanese: '電車が遅れているので、少し待ちましょう。', meaning: "The train is delayed, so let's wait a little." },
    { id: 'seat-free', japanese: 'この席に座ってもいいですか。', meaning: 'May I sit in this seat?' },
    { id: 'next-bus', japanese: '次のバスが来るまで、ここで待ちましょう。', meaning: "Let's wait here until the next bus comes." },

    { id: 'try-clothes', japanese: 'この服を着てみてもいいですか。', meaning: 'May I try on these clothes?' },
    { id: 'smaller-size', japanese: 'もう少し小さいサイズはありませんか。', meaning: 'Do you have a slightly smaller size?' },
    { id: 'pay-card', japanese: 'カードで払うことができますか。', meaning: 'Can I pay by card?' },
    { id: 'bag-lighter', japanese: 'このかばんはあのかばんより軽いです。', meaning: 'This bag is lighter than that bag.' },
    { id: 'too-expensive', japanese: '少し高すぎるので、今日は買いません。', meaning: "It's a little too expensive, so I won't buy it today." },
    { id: 'buy-present', japanese: '友達にあげるプレゼントを探しています。', meaning: "I'm looking for a present to give to a friend." },
    { id: 'shop-closed', japanese: '店が閉まっていたので、何も買えませんでした。', meaning: "The shop was closed, so I couldn't buy anything." },
    { id: 'return-item', japanese: '昨日買ったシャツを返したいんですが。', meaning: "I'd like to return the shirt I bought yesterday." },
    { id: 'cheaper-shop', japanese: 'もっと安い店があるかもしれません。', meaning: 'There might be a cheaper shop.' },
    { id: 'look-only', japanese: '今日は見るだけにしておきます。', meaning: "I'll just have a look today." },

    { id: 'order-ready', japanese: '注文してもいいですか。', meaning: 'May I order?' },
    { id: 'no-meat', japanese: '肉が入っていない料理はありますか。', meaning: 'Do you have any dishes without meat?' },
    { id: 'less-spicy', japanese: 'あまり辛くしないでください。', meaning: "Please don't make it too spicy." },
    { id: 'looks-good', japanese: 'このケーキはおいしそうですね。', meaning: "This cake looks delicious, doesn't it?" },
    { id: 'too-hot', japanese: '熱すぎて、まだ飲めません。', meaning: "It's too hot to drink yet." },
    { id: 'try-food', japanese: 'この料理を食べてみたいです。', meaning: "I'd like to try this dish." },
    { id: 'already-eaten', japanese: 'もう昼ご飯を食べてしまいました。', meaning: "I've already eaten lunch." },
    { id: 'eat-before', japanese: '出かける前に、何か食べておきましょう。', meaning: "Let's eat something before going out." },
    { id: 'drink-water', japanese: 'コーヒーではなく、水をお願いします。', meaning: "I'd like water instead of coffee, please." },
    { id: 'bill-separate', japanese: '別々に払ってもいいですか。', meaning: 'May we pay separately?' },

    { id: 'close-window', japanese: '寒いので、窓を閉めてもいいですか。', meaning: "It's cold, so may I close the window?" },
    { id: 'light-left', japanese: '電気をつけたまま寝てしまいました。', meaning: 'I fell asleep with the light on.' },
    { id: 'clean-room', japanese: '友達が来る前に、部屋を掃除しておきます。', meaning: "I'll clean the room before my friend comes." },
    { id: 'take-shoes', japanese: 'ここで靴を脱いでください。', meaning: 'Please take off your shoes here.' },
    { id: 'lost-key', japanese: '家の鍵をなくしてしまいました。', meaning: "I've lost my house key." },
    { id: 'wash-dishes', japanese: 'ご飯を食べてから、お皿を洗います。', meaning: "I'll wash the dishes after eating." },
    { id: 'help-carry', japanese: 'この箱を運ぶのを手伝ってもらえますか。', meaning: 'Could you help me carry this box?' },
    { id: 'door-open', japanese: 'ドアが開いているので、閉めてください。', meaning: 'The door is open, so please close it.' },
    { id: 'quiet-home', japanese: '子供が寝ているので、静かにしてください。', meaning: 'The child is sleeping, so please be quiet.' },
    { id: 'laundry-rain', japanese: '雨が降る前に、洗濯物を中に入れましょう。', meaning: "Let's bring the laundry inside before it rains." },

    { id: 'homework-tomorrow', japanese: '明日までに宿題を出さなければなりません。', meaning: 'I have to hand in my homework by tomorrow.' },
    { id: 'forgot-book', japanese: '教科書を持ってくるのを忘れました。', meaning: 'I forgot to bring my textbook.' },
    { id: 'borrow-pen', japanese: 'ペンを貸してもらえませんか。', meaning: 'Could you lend me a pen?' },
    { id: 'meeting-time', japanese: '会議は三時に始まる予定です。', meaning: 'The meeting is scheduled to start at three.' },
    { id: 'study-library', japanese: '図書館なら、静かに勉強できます。', meaning: 'You can study quietly at the library.' },
    { id: 'late-work', japanese: '寝坊したので、仕事に遅れてしまいました。', meaning: 'I overslept, so I was late for work.' },
    { id: 'finish-report', japanese: 'この仕事は今日中に終わると思います。', meaning: 'I think this work will be finished today.' },
    { id: 'read-again', japanese: '分からなかったら、もう一度読んでください。', meaning: "If you don't understand, please read it again." },
    { id: 'teacher-ask', japanese: '先生に聞いてから、答えを書きます。', meaning: "I'll write the answer after asking the teacher." },
    { id: 'work-together', japanese: '一人でやるより、二人でやったほうがいいです。', meaning: "It's better to do it with another person than alone." },

    { id: 'headache-rest', japanese: '頭が痛いので、少し休んでもいいですか。', meaning: 'I have a headache, so may I rest for a while?' },
    { id: 'medicine-after', japanese: 'この薬は食事の後で飲んでください。', meaning: 'Please take this medicine after meals.' },
    { id: 'see-doctor', japanese: '熱があるなら、病院に行ったほうがいいです。', meaning: 'If you have a fever, you should go to the hospital.' },
    { id: 'feel-better', japanese: '昨日より、ずっと元気になりました。', meaning: "I feel much better than yesterday." },
    { id: 'no-running', japanese: '足が痛くて、走ることができません。', meaning: "My leg hurts, so I can't run." },
    { id: 'sleep-early', japanese: '今日は早く寝たほうがいいですよ。', meaning: 'You should go to bed early today.' },
    { id: 'cold-maybe', japanese: '風邪をひいたかもしれません。', meaning: 'I might have caught a cold.' },
    { id: 'water-often', japanese: '水をたくさん飲むようにしています。', meaning: 'I make a point of drinking plenty of water.' },
    { id: 'better-medicine', japanese: '薬を飲んだら、少し楽になりました。', meaning: 'After taking the medicine, I felt a little better.' },
    { id: 'not-overdo', japanese: '疲れているときは、無理をしないでください。', meaning: "When you're tired, please don't push yourself too hard." },

    { id: 'weekend-plan', japanese: '週末は友達と映画を見るつもりです。', meaning: 'I plan to watch a film with a friend at the weekend.' },
    { id: 'after-shopping', japanese: '買い物が終わったら、電話します。', meaning: "I'll call you when I've finished shopping." },
    { id: 'meet-station', japanese: '駅の前で待ち合わせることにしました。', meaning: 'We decided to meet in front of the station.' },
    { id: 'free-sunday', japanese: '日曜日なら、時間があります。', meaning: "If it's Sunday, I'm free." },
    { id: 'cancel-rain', japanese: '雨だったら、出かけないつもりです。', meaning: "If it rains, I don't plan to go out." },
    { id: 'reserve-early', japanese: '旅行の前に、ホテルを予約しておきます。', meaning: "I'll book a hotel before the trip." },
    { id: 'change-time', japanese: '約束の時間を変えてもいいですか。', meaning: 'May we change the time we arranged to meet?' },
    { id: 'arrive-soon', japanese: 'あと十分ぐらいで着くと思います。', meaning: "I think I'll arrive in about ten minutes." },
    { id: 'wait-five', japanese: 'もう五分だけ待ってもらえませんか。', meaning: 'Could you wait just five more minutes?' },
    { id: 'next-month-move', japanese: '来月、引っ越すことになりました。', meaning: "It's been arranged that I'll move house next month." },

    { id: 'umbrella-take', japanese: '雨が降りそうなので、傘を持っていきます。', meaning: "It looks like rain, so I'll take an umbrella." },
    { id: 'getting-cold', japanese: '夕方になると、寒くなります。', meaning: 'It gets cold in the evening.' },
    { id: 'snow-first', japanese: 'こんなに雪が降るのを見たのは初めてです。', meaning: "This is the first time I've seen this much snow fall." },
    { id: 'wind-strong', japanese: '風が強いので、窓を開けないでください。', meaning: "The wind is strong, so please don't open the window." },
    { id: 'sunny-walk', japanese: '天気がよければ、公園を散歩しましょう。', meaning: "If the weather is good, let's take a walk in the park." },
    { id: 'rain-stopped', japanese: '雨がやんだので、外に出ても大丈夫です。', meaning: "The rain has stopped, so it's all right to go outside." },
    { id: 'hot-yesterday', japanese: '今日は昨日ほど暑くありません。', meaning: "Today isn't as hot as yesterday." },
    { id: 'wet-clothes', japanese: '傘を忘れて、服がぬれてしまいました。', meaning: 'I forgot my umbrella and my clothes got wet.' },
    { id: 'weather-news', japanese: '天気予報によると、明日は晴れるそうです。', meaning: 'According to the weather forecast, it will be sunny tomorrow.' },
    { id: 'dark-soon', japanese: '暗くなる前に、家に帰りましょう。', meaning: "Let's go home before it gets dark." },

    { id: 'been-kyoto', japanese: '京都に行ったことがありますか。', meaning: 'Have you ever been to Kyoto?' },
    { id: 'hotel-bag', japanese: '荷物をここに置いておいてもいいですか。', meaning: 'May I leave my luggage here?' },
    { id: 'photo-permission', japanese: 'ここで写真を撮ってもいいですか。', meaning: 'May I take photos here?' },
    { id: 'no-parking', japanese: 'ここに車を止めてはいけません。', meaning: 'You must not park here.' },
    { id: 'show-map', japanese: '地図を見せてもらえますか。', meaning: 'Could you show me the map?' },
    { id: 'lost-way', japanese: '道が分からなくなってしまいました。', meaning: "I've lost my way." },
    { id: 'room-view', japanese: 'この部屋から海が見えます。', meaning: 'You can see the sea from this room.' },
    { id: 'travel-alone', japanese: '一人で旅行するのは初めてです。', meaning: 'This is my first time travelling alone.' },
    { id: 'passport-needed', japanese: 'パスポートを見せなければなりませんか。', meaning: 'Do I have to show my passport?' },
    { id: 'leave-hotel', japanese: '何時までに部屋を出ればいいですか。', meaning: 'By what time should I leave the room?' },

    { id: 'help-friend', japanese: '困ったら、いつでも連絡してください。', meaning: 'If you have a problem, please contact me anytime.' },
    { id: 'friend-taught', japanese: '友達が日本語を教えてくれました。', meaning: 'My friend taught me Japanese.' },
    { id: 'give-directions', japanese: '駅までの道を教えてあげました。', meaning: 'I told someone how to get to the station.' },
    { id: 'invite-dinner', japanese: 'よかったら、一緒に晩ご飯を食べませんか。', meaning: "If you'd like, shall we have dinner together?" },
    { id: 'sorry-late', japanese: '遅れてしまって、すみません。', meaning: "I'm sorry I'm late." },
    { id: 'thanks-help', japanese: '手伝ってくれて、ありがとうございます。', meaning: 'Thank you for helping me.' },
    { id: 'looking-forward', japanese: 'また会えるのを楽しみにしています。', meaning: "I'm looking forward to seeing you again." },
    { id: 'bring-friend', japanese: '友達を連れてきてもいいですか。', meaning: 'May I bring a friend?' },
    { id: 'seems-busy', japanese: '今日は忙しそうですね。', meaning: 'You seem busy today.' },
    { id: 'friend-moving', japanese: '友達は来年、日本に住むつもりだそうです。', meaning: 'I hear my friend plans to live in Japan next year.' },

    { id: 'music-studying', japanese: '音楽を聞きながら、日本語を勉強しています。', meaning: "I'm studying Japanese while listening to music." },
    { id: 'weekend-activities', japanese: '休みの日は、本を読んだり、散歩したりします。', meaning: 'On my days off, I do things like read books and take walks.' },
    { id: 'exercise-daily', japanese: '毎日、少し運動するようにしています。', meaning: 'I try to get a little exercise every day.' },
    { id: 'stop-sweets', japanese: '夜は甘い物を食べないことにしました。', meaning: "I've decided not to eat sweet things at night." },
    { id: 'used-early', japanese: '最近、早く起きられるようになりました。', meaning: "Recently, I've become able to wake up early." },
    { id: 'forgot-phone', japanese: '携帯電話を家に忘れてきました。', meaning: 'I left my mobile phone at home.' },
    { id: 'pack-phone', japanese: '出かける前に、携帯電話をかばんに入れておきます。', meaning: "I'll put my mobile phone in my bag before going out." },
    { id: 'read-book', japanese: 'この本は読みやすいので、おすすめです。', meaning: "This book is easy to read, so I recommend it." },
    { id: 'cook-able', japanese: '簡単な料理なら、作ることができます。', meaning: 'I can cook simple dishes.' },
    { id: 'practice-daily', japanese: '毎日練習すれば、少しずつ上手になります。', meaning: "If you practise every day, you'll gradually improve." },
  ];

  const STORAGE_KEY = 'katakana-quest-progress-v1';
  const QUEST_SIZE = 10;
  const LISTENING_SIZE = 10;
  const STAMP_TYPES = [
    { key: 'katakana', label: 'Katakana', symbol: 'カ' },
    { key: 'listening', label: 'N4 listening', symbol: '♪' },
    { key: 'kanji', label: 'Everyday kanji', symbol: '漢' },
  ];
  let today = dateKey(new Date());
  let calendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  let state = loadState();
  let listeningAttempt = null;
  let activeUtterance = null;

  const elements = {
    questView: document.querySelector('#quest-view'),
    listeningView: document.querySelector('#listening-view'),
    kanjiView: document.querySelector('#kanji-view'),
    calendarView: document.querySelector('#calendar-view'),
    tabs: [...document.querySelectorAll('[data-view]')],
    todayLabel: document.querySelector('#today-label'),
    correctCount: document.querySelector('#correct-count'),
    wordsUsed: document.querySelector('#words-used'),
    cardPrompt: document.querySelector('#card-prompt'),
    reviewCount: document.querySelector('#review-count'),
    reviewEmpty: document.querySelector('#review-empty'),
    reviewList: document.querySelector('#review-list'),
    progressFill: document.querySelector('#progress-fill'),
    practiceCard: document.querySelector('#practice-card'),
    kanaWord: document.querySelector('#kana-word'),
    answerForm: document.querySelector('#answer-form'),
    answerInput: document.querySelector('#answer-input'),
    submitAnswer: document.querySelector('#submit-answer'),
    feedback: document.querySelector('#feedback'),
    listeningCount: document.querySelector('#listening-count'),
    listeningProgress: document.querySelector('#listening-progress'),
    listeningStep: document.querySelector('#listening-step'),
    listeningPrompt: document.querySelector('#listening-prompt'),
    listeningInstruction: document.querySelector('#listening-instruction'),
    listeningPlay: document.querySelector('#listening-play'),
    audioStatus: document.querySelector('#audio-status'),
    listeningForm: document.querySelector('#listening-form'),
    listeningInput: document.querySelector('#listening-input'),
    listeningFeedback: document.querySelector('#listening-feedback'),
    listeningMeaning: document.querySelector('#listening-meaning'),
    listeningAttempt: document.querySelector('#listening-attempt'),
    listeningMarks: [...document.querySelectorAll('[data-listening-mark]')],
    listeningResult: document.querySelector('#listening-result'),
    listeningResultTitle: document.querySelector('#listening-result-title'),
    listeningJapanese: document.querySelector('#listening-japanese'),
    listeningResultMeaning: document.querySelector('#listening-result-meaning'),
    listeningResultAttempt: document.querySelector('#listening-result-attempt'),
    listeningNext: document.querySelector('#listening-next'),
    listeningDone: document.querySelector('#listening-done'),
    listeningSummary: document.querySelector('#listening-summary'),
    listeningRestart: document.querySelector('#listening-restart'),
    listeningDate: document.querySelector('#listening-date'),
    listeningReviewCount: document.querySelector('#listening-review-count'),
    listeningReviewEmpty: document.querySelector('#listening-review-empty'),
    listeningReviewList: document.querySelector('#listening-review-list'),
    navStampCount: document.querySelector('#nav-stamp-count'),
    stampTotal: document.querySelector('#stamp-total'),
    monthLabel: document.querySelector('#month-label'),
    calendarGrid: document.querySelector('#calendar-grid'),
    previousMonth: document.querySelector('#previous-month'),
    nextMonth: document.querySelector('#next-month'),
    backToQuest: document.querySelector('#back-to-quest'),
    resetProgress: document.querySelector('#reset-progress'),
  };

  function dateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return {
        usedWords: Array.isArray(saved.usedWords) ? saved.usedWords : [],
        wrongAnswers: Array.isArray(saved.wrongAnswers) ? saved.wrongAnswers : [],
        listeningSession: saved.listeningSession && typeof saved.listeningSession === 'object' ? saved.listeningSession : null,
        usedListeningPhrases: Array.isArray(saved.usedListeningPhrases)
          ? saved.usedListeningPhrases
          : (Array.isArray(saved.listeningAnswers) ? saved.listeningAnswers.filter(Boolean).map((answer) => answer.id) : []),
        listeningReview: Array.isArray(saved.listeningReview) ? saved.listeningReview : [],
        listeningCompletedDays: [...new Set([
          ...(Array.isArray(saved.listeningCompletedDays) ? saved.listeningCompletedDays : []),
          ...(saved.listeningSession && Array.isArray(saved.listeningSession.answers)
            && saved.listeningSession.answers.length >= LISTENING_SIZE ? [saved.listeningSession.date] : []),
        ])].filter((date) => typeof date === 'string'),
        days: saved.days && typeof saved.days === 'object' ? saved.days : {},
        currentQuestion: saved.currentQuestion && typeof saved.currentQuestion === 'object' ? saved.currentQuestion : null,
      };
    } catch {
      return { usedWords: [], wrongAnswers: [], listeningSession: null, usedListeningPhrases: [], listeningReview: [], listeningCompletedDays: [], days: {}, currentQuestion: null };
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function getToday() {
    if (!state.days[today]) state.days[today] = { correct: 0, completed: false };
    return state.days[today];
  }

  function chooseQuestion() {
    const available = WORDS.filter((word) => !state.usedWords.includes(word.id));
    if (!available.length) return null;
    const word = available[Math.floor(Math.random() * available.length)];
    state.usedWords.push(word.id);
    state.currentQuestion = { date: today, wordId: word.id };
    saveState();
    return word;
  }

  function currentWord() {
    const question = state.currentQuestion;
    if (!question || question.date !== today) return null;
    return WORDS.find((word) => word.id === question.wordId) || null;
  }

  function normalize(value) {
    return value.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/&/g, 'and').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  }

  function formatToday() {
    return new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  }

  function setView(view) {
    elements.questView.hidden = view !== 'quest';
    elements.listeningView.hidden = view !== 'listening';
    elements.kanjiView.hidden = view !== 'kanji';
    elements.calendarView.hidden = view !== 'calendar';
    elements.tabs.forEach((tab) => {
      const active = tab.dataset.view === view;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    if (view !== 'listening') stopListeningAudio();
    if (view === 'quest') refreshKatakanaDay();
    if (view === 'listening') refreshListeningDay();
    if (view === 'kanji') window.dispatchEvent(new Event('kanji:open'));
    if (view === 'calendar') renderCalendar();
  }

  function renderStats() {
    const day = getToday();
    elements.todayLabel.textContent = formatToday();
    elements.correctCount.textContent = String(day.correct);
    elements.progressFill.style.width = `${Math.min(day.correct / QUEST_SIZE, 1) * 100}%`;
    elements.wordsUsed.textContent = `${state.usedWords.length} word${state.usedWords.length === 1 ? '' : 's'} used`;
    renderCalendarStats();
  }

  function getCalendarCompletions() {
    let kanjiDays = [];
    let kanjiStats = {};
    try {
      const kanji = JSON.parse(localStorage.getItem('katakana-quest-kanji-v1') || '{}');
      kanjiDays = Array.isArray(kanji.completedDays) ? kanji.completedDays : [];
      kanjiStats = kanji.dailyStats && typeof kanji.dailyStats === 'object' ? { ...kanji.dailyStats } : {};
      if (kanji.day && Array.isArray(kanji.day.answers)) {
        kanjiStats[kanji.day.date] = {
          answered: kanji.day.answers.length,
          correct: kanji.day.answers.filter((answer) => answer.correct && !answer.assisted).length,
        };
      }
      if (kanji.day && Array.isArray(kanji.day.answers) && kanji.day.answers.length >= 10) {
        kanjiDays = [...kanjiDays, kanji.day.date];
      }
    } catch {
      // Katakana and listening stamps remain available if kanji storage cannot be read.
    }
    return {
      katakana: new Set(Object.keys(state.days).filter((date) => state.days[date] && state.days[date].completed)),
      listening: new Set(state.listeningCompletedDays),
      kanji: new Set(kanjiDays.filter((date) => typeof date === 'string')),
      kanjiStats,
    };
  }

  function renderCalendarStats() {
    const completions = getCalendarCompletions();
    const total = STAMP_TYPES.reduce((sum, type) => sum + completions[type.key].size, 0);
    elements.navStampCount.textContent = String(total);
    elements.stampTotal.textContent = String(total);
  }

  function refreshCalendar() {
    renderCalendarStats();
    if (!elements.calendarView.hidden) renderCalendar();
  }

  function renderReview() {
    const entries = state.wrongAnswers
      .filter((entry) => entry && typeof entry.wordId === 'string')
      .map((entry) => ({ entry, word: WORDS.find((word) => word.id === entry.wordId) }))
      .filter(({ word }) => word)
      .reverse();
    elements.reviewCount.textContent = `${entries.length} word${entries.length === 1 ? '' : 's'}`;
    elements.reviewEmpty.hidden = entries.length > 0;
    elements.reviewList.replaceChildren();
    entries.forEach(({ entry, word }) => {
      const item = document.createElement('li');
      item.className = 'review-item';
      const kana = document.createElement('span');
      kana.className = 'review-kana';
      kana.lang = 'ja';
      kana.textContent = word.kana;
      const details = document.createElement('div');
      details.className = 'review-details';
      const answer = document.createElement('strong');
      answer.textContent = word.english;
      const attempt = document.createElement('span');
      attempt.textContent = `You wrote: ${entry.givenAnswer || '—'}`;
      details.append(answer, attempt);
      item.append(kana, details);
      elements.reviewList.appendChild(item);
    });
  }

  function setFeedback(kind, title, message) {
    elements.practiceCard.classList.remove('is-correct', 'is-wrong');
    if (kind !== 'is-neutral') elements.practiceCard.classList.add(kind);
    elements.feedback.hidden = false;
    elements.feedback.className = `feedback ${kind}`;
    const symbol = document.createElement('span');
    symbol.className = 'feedback-symbol';
    symbol.setAttribute('aria-hidden', 'true');
    symbol.textContent = kind === 'is-correct' ? '✦' : kind === 'is-wrong' ? '✕' : '•';
    const copy = document.createElement('div');
    copy.className = 'feedback-copy';
    const heading = document.createElement('strong');
    heading.textContent = title;
    const detail = document.createElement('span');
    detail.textContent = message;
    copy.append(heading, detail);
    const flourish = document.createElement('span');
    flourish.className = 'feedback-flourish';
    flourish.setAttribute('aria-hidden', 'true');
    flourish.textContent = kind === 'is-correct' ? '✦  ✧  ✦' : kind === 'is-wrong' ? '↺' : '';
    elements.feedback.replaceChildren(symbol, copy, flourish);
  }

  function setAudioStatus(message) {
    elements.audioStatus.textContent = message;
    elements.audioStatus.hidden = false;
  }

  function stopListeningAudio() {
    const wasPlaying = activeUtterance;
    activeUtterance = null;
    if (wasPlaying && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  function getListeningSession() {
    const date = dateKey(new Date());
    const session = state.listeningSession;
    const phraseIds = new Set(PHRASES.map((phrase) => phrase.id));
    if (session && session.date === date
      && Array.isArray(session.phraseIds) && session.phraseIds.length === LISTENING_SIZE
      && new Set(session.phraseIds).size === LISTENING_SIZE
      && session.phraseIds.every((id) => phraseIds.has(id))
      && Array.isArray(session.answers) && session.answers.length <= LISTENING_SIZE) return session;

    stopListeningAudio();
    listeningAttempt = null;
    let used = new Set(state.usedListeningPhrases.filter((id) => phraseIds.has(id)));
    const selected = [];
    while (selected.length < LISTENING_SIZE) {
      let available = PHRASES.filter((phrase) => !used.has(phrase.id));
      if (!available.length) {
        // Start a new cycle, keeping this day's phrases distinct at the boundary.
        used = new Set(selected);
        available = PHRASES.filter((phrase) => !used.has(phrase.id));
      }
      const phrase = available[Math.floor(Math.random() * available.length)];
      selected.push(phrase.id);
      used.add(phrase.id);
    }
    state.usedListeningPhrases = [...used];
    state.listeningSession = { date, phraseIds: selected, answers: [] };
    saveState();
    return state.listeningSession;
  }

  function currentListeningPhrase() {
    const session = getListeningSession();
    const revealed = shownListeningAnswer(session);
    return PHRASES.find((phrase) => phrase.id === (revealed ? revealed.id : session.phraseIds[session.answers.length]));
  }

  function shownListeningAnswer(session) {
    const answer = session.answers[session.answers.length - 1];
    return session.showLastAnswer && answer && answer.id === session.phraseIds[session.answers.length - 1]
      ? answer : null;
  }

  function refreshListeningDay() {
    if (state.listeningSession && state.listeningSession.date === dateKey(new Date())) return false;
    renderListening();
    return true;
  }

  function refreshKatakanaDay() {
    const date = dateKey(new Date());
    if (today === date) return false;
    today = date;
    renderQuestion();
    return true;
  }

  function refreshDailyPractice() {
    const katakanaChanged = refreshKatakanaDay();
    const listeningChanged = refreshListeningDay();
    if (katakanaChanged || listeningChanged) refreshCalendar();
  }

  function playListening(phrase) {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      setAudioStatus('Japanese audio is not supported in this browser.');
      return;
    }
    const synth = window.speechSynthesis;
    const voices = synth.getVoices();
    const japaneseVoice = voices.find((voice) => /^ja(?:$|[-_])/i.test(voice.lang));
    if (voices.length && !japaneseVoice) {
      setAudioStatus('No Japanese voice is installed on this device.');
      return;
    }
    stopListeningAudio();
    const utterance = new window.SpeechSynthesisUtterance(phrase.japanese);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85;
    if (japaneseVoice) utterance.voice = japaneseVoice;
    activeUtterance = utterance;
    utterance.onstart = () => {
      if (activeUtterance === utterance) setAudioStatus('Playing Japanese audio…');
    };
    utterance.onend = () => {
      if (activeUtterance === utterance) {
        activeUtterance = null;
        setAudioStatus('Tap play to listen again.');
      }
    };
    utterance.onerror = () => {
      if (activeUtterance === utterance) {
        activeUtterance = null;
        setAudioStatus('Audio could not play. Check that your device has a Japanese voice.');
      }
    };
    setAudioStatus('Preparing Japanese audio…');
    synth.speak(utterance);
  }

  function renderListeningReview() {
    const saved = state.listeningReview
      .filter((answer) => answer && typeof answer.id === 'string')
      .map((answer) => ({ answer, phrase: PHRASES.find((phrase) => phrase.id === answer.id) }))
      .filter(({ phrase }) => phrase);
    elements.listeningReviewCount.textContent = `${saved.length} phrase${saved.length === 1 ? '' : 's'}`;
    elements.listeningReviewEmpty.hidden = saved.length > 0;
    elements.listeningReviewList.replaceChildren();
    saved.forEach(({ answer, phrase }) => {
      const item = document.createElement('li');
      item.className = 'review-item listening-review-item';
      const replay = document.createElement('button');
      replay.type = 'button';
      replay.className = 'review-play';
      replay.textContent = '▶ Replay';
      replay.setAttribute('aria-label', `Replay Japanese phrase ${PHRASES.indexOf(phrase) + 1}`);
      replay.addEventListener('click', () => playListening(phrase));
      const details = document.createElement('div');
      details.className = 'review-details';
      const meaning = document.createElement('strong');
      meaning.textContent = phrase.meaning;
      const attempt = document.createElement('span');
      attempt.textContent = `You wrote: ${answer.translation}`;
      details.append(meaning, attempt);
      item.append(replay, details);
      elements.listeningReviewList.appendChild(item);
    });
  }

  function renderListening() {
    const session = getListeningSession();
    const count = session.answers.length;
    const revealed = shownListeningAnswer(session);
    const done = count === LISTENING_SIZE && !revealed;
    elements.listeningDate.textContent = formatToday();
    elements.listeningCount.textContent = String(count);
    elements.listeningProgress.style.width = `${count / LISTENING_SIZE * 100}%`;
    elements.listeningStep.textContent = done ? 'Complete' : `Phrase ${revealed ? count : count + 1} of ${LISTENING_SIZE}`;
    elements.listeningPrompt.hidden = done;
    elements.listeningInstruction.textContent = revealed
      ? 'Read the Japanese and replay the audio before moving on.'
      : 'Listen as often as you like, then translate into English.';
    elements.listeningForm.hidden = done || Boolean(revealed);
    elements.listeningFeedback.hidden = true;
    elements.listeningResult.hidden = !revealed;
    elements.listeningJapanese.textContent = '';
    elements.listeningResultMeaning.textContent = '';
    elements.listeningResultAttempt.textContent = '';
    elements.listeningDone.hidden = !done;
    elements.audioStatus.hidden = true;
    elements.listeningInput.value = '';
    if (revealed) {
      const phrase = currentListeningPhrase();
      elements.listeningResultTitle.textContent = revealed.gotIt ? 'You got it! 🎉' : 'Saved for review — keep learning!';
      elements.listeningJapanese.textContent = phrase.japanese;
      elements.listeningResultMeaning.textContent = phrase.meaning;
      elements.listeningResultAttempt.textContent = 'You wrote: ' + revealed.translation;
      elements.listeningNext.textContent = count === LISTENING_SIZE ? 'Finish today’s set →' : 'Next phrase →';
    }
    if (done) {
      const understood = session.answers.filter((answer) => answer && answer.gotIt).length;
      elements.listeningSummary.textContent = `You marked ${understood} of ${LISTENING_SIZE} as understood. Come back tomorrow for a new set, or replay saved phrases below.`;
    }
    renderListeningReview();
  }

  function submitListening(event) {
    event.preventDefault();
    if (refreshListeningDay()) return;
    if (shownListeningAnswer(getListeningSession())) return;
    const phrase = currentListeningPhrase();
    if (!phrase) return;
    const translation = elements.listeningInput.value.trim();
    if (!translation) {
      elements.listeningInput.focus();
      return;
    }
    listeningAttempt = translation;
    elements.listeningForm.hidden = true;
    elements.listeningMeaning.textContent = phrase.meaning;
    elements.listeningAttempt.textContent = listeningAttempt;
    elements.listeningFeedback.hidden = false;
  }

  function markListening(gotIt) {
    if (refreshListeningDay()) return;
    if (listeningAttempt === null) return;
    const phrase = currentListeningPhrase();
    if (!phrase) return;
    const session = getListeningSession();
    session.answers.push({ id: phrase.id, translation: listeningAttempt, gotIt });
    session.showLastAnswer = true;
    if (session.answers.length === LISTENING_SIZE && !state.listeningCompletedDays.includes(session.date)) {
      state.listeningCompletedDays.push(session.date);
    }
    state.listeningReview = state.listeningReview.filter((answer) => answer && answer.id !== phrase.id);
    if (!gotIt) state.listeningReview.push({ id: phrase.id, translation: listeningAttempt });
    listeningAttempt = null;
    saveState();
    stopListeningAudio();
    renderListening();
    refreshCalendar();
    elements.listeningNext.focus();
  }

  function renderQuestion() {
    const day = getToday();
    renderStats();
    elements.cardPrompt.textContent = 'Translate this word';
    elements.answerForm.hidden = false;
    elements.practiceCard.classList.remove('is-correct', 'is-wrong');
    if (day.completed) {
      elements.cardPrompt.textContent = 'All done for today';
      elements.kanaWord.textContent = '✦';
      elements.answerForm.hidden = true;
      setFeedback('is-correct', 'Quest complete! 🎉', '10 right answers today. Your calendar is stamped.');
      return;
    }
    let word = currentWord();
    if (!word) word = chooseQuestion();
    if (!word) {
      elements.cardPrompt.textContent = 'Practice complete';
      elements.kanaWord.textContent = '—';
      elements.answerForm.hidden = true;
      setFeedback('is-neutral', 'Word bank complete', 'Every available word has been used.');
      return;
    }
    elements.kanaWord.textContent = word.kana;
    elements.answerInput.value = '';
    elements.answerInput.disabled = false;
    elements.submitAnswer.disabled = false;
    elements.submitAnswer.innerHTML = 'Check answer <span aria-hidden="true">↗</span>';
    elements.feedback.hidden = true;
    elements.feedback.className = 'feedback';
    requestAnimationFrame(() => {
      if (!elements.questView.hidden) elements.answerInput.focus();
    });
  }

  function showFeedback(correct, word) {
    setFeedback(
      correct ? 'is-correct' : 'is-wrong',
      correct ? 'Yes! You got it! 🎉' : 'Not this time',
      correct ? 'Brilliant reading. Keep it going!' : `The answer is ${word.english}. Saved for review below.`,
    );
    elements.answerInput.disabled = true;
    elements.submitAnswer.disabled = false;
    elements.submitAnswer.textContent = 'Next word  →';
  }

  function completeToday() {
    getToday().completed = true;
    state.currentQuestion = null;
    saveState();
    renderStats();
    renderQuestion();
  }

  function submitAnswer(event) {
    event.preventDefault();
    if (refreshKatakanaDay()) return;
    if (elements.answerInput.disabled) {
      state.currentQuestion = null;
      saveState();
      renderQuestion();
      return;
    }
    const word = currentWord();
    if (!word) return;
    const correct = word.answers.some((answer) => normalize(answer) === normalize(elements.answerInput.value));
    if (correct) getToday().correct += 1;
    else {
      state.wrongAnswers.push({ wordId: word.id, givenAnswer: elements.answerInput.value.trim() });
      renderReview();
    }
    state.currentQuestion = null;
    saveState();
    renderStats();
    showFeedback(correct, word);
    if (correct && getToday().correct >= QUEST_SIZE) completeToday();
  }

  function renderCalendar() {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const completions = getCalendarCompletions();
    renderCalendarStats();
    elements.monthLabel.textContent = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(calendarMonth);
    elements.calendarGrid.replaceChildren();
    const startOffset = (new Date(year, month, 1).getDay() + 6) % 7;
    for (let index = 0; index < 42; index += 1) {
      const cellDate = new Date(year, month, index - startOffset + 1);
      const key = dateKey(cellDate);
      const cell = document.createElement('div');
      cell.className = 'day-cell';
      cell.dataset.date = key;
      cell.setAttribute('role', 'gridcell');
      const number = document.createElement('span');
      number.className = 'day-number';
      number.textContent = String(cellDate.getDate());
      cell.appendChild(number);
      const dateLabel = cellDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      if (cellDate.getMonth() !== month) {
        cell.classList.add('is-outside');
        cell.setAttribute('aria-label', dateLabel);
      } else {
        if (key === dateKey(new Date())) cell.classList.add('is-today');
        const earned = STAMP_TYPES.filter((type) => completions[type.key].has(key));
        const kanjiStats = completions.kanjiStats[key];
        const showKanjiScore = kanjiStats && Number.isInteger(kanjiStats.answered) && kanjiStats.answered > 10
          && Number.isInteger(kanjiStats.correct) && kanjiStats.correct >= 0 && kanjiStats.correct <= kanjiStats.answered;
        const label = dateLabel + (earned.length ? ', completed: ' + earned.map((type) =>
          type.label + (type.key === 'kanji' && showKanjiScore
            ? ': ' + kanjiStats.correct + ' correct out of ' + kanjiStats.answered + ' new signs (without revealing the meaning)' : '')).join(', ') : '');
        cell.setAttribute('aria-label', label);
        cell.setAttribute('title', label);
        if (earned.length) {
          const stamps = document.createElement('div');
          stamps.className = 'day-stamps';
          stamps.setAttribute('aria-hidden', 'true');
          earned.forEach((type) => {
            const stamp = document.createElement('span');
            stamp.className = 'day-stamp stamp-' + type.key;
            stamp.textContent = type.symbol;
            if (type.key === 'kanji' && showKanjiScore) {
              stamp.classList.add('has-score');
              stamp.textContent += ' ' + kanjiStats.correct;
            }
            stamps.appendChild(stamp);
          });
          cell.appendChild(stamps);
        }
      }
      elements.calendarGrid.appendChild(cell);
    }
  }

  elements.answerForm.addEventListener('submit', submitAnswer);
  elements.tabs.forEach((tab) => tab.addEventListener('click', () => setView(tab.dataset.view)));
  elements.listeningPlay.addEventListener('click', () => {
    refreshListeningDay();
    const phrase = currentListeningPhrase();
    if (phrase) playListening(phrase);
  });
  elements.listeningForm.addEventListener('submit', submitListening);
  elements.listeningMarks.forEach((button) => button.addEventListener('click', () => markListening(button.dataset.listeningMark === 'got')));
  elements.listeningNext.addEventListener('click', () => {
    if (refreshListeningDay()) return;
    const session = getListeningSession();
    if (!shownListeningAnswer(session)) return;
    stopListeningAudio();
    session.showLastAnswer = false;
    saveState();
    renderListening();
    if (session.answers.length === LISTENING_SIZE) elements.listeningRestart.focus();
    else elements.listeningPlay.focus();
  });
  elements.listeningRestart.addEventListener('click', () => {
    stopListeningAudio();
    const session = getListeningSession();
    session.answers = [];
    session.showLastAnswer = false;
    listeningAttempt = null;
    saveState();
    renderListening();
  });
  elements.backToQuest.addEventListener('click', () => setView('quest'));
  elements.previousMonth.addEventListener('click', () => { calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1); renderCalendar(); });
  elements.nextMonth.addEventListener('click', () => { calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1); renderCalendar(); });
  elements.resetProgress.addEventListener('click', () => {
    if (!window.confirm('Reset katakana, listening practice, and their stamps? Your kanji history, review, and stamps will be kept.')) return;
    localStorage.removeItem(STORAGE_KEY);
    stopListeningAudio();
    listeningAttempt = null;
    state = { usedWords: [], wrongAnswers: [], listeningSession: null, usedListeningPhrases: [], listeningReview: [], listeningCompletedDays: [], days: {}, currentQuestion: null };
    setView('quest');
    renderReview();
    renderQuestion();
    renderListening();
  });

  renderReview();
  renderQuestion();
  renderListening();
  window.addEventListener('kanji:progress', refreshCalendar);
  window.addEventListener('focus', refreshDailyPractice);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refreshDailyPractice();
  });
  window.setInterval(refreshDailyPractice, 60 * 1000);
})();
