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

    // Append new entries here: their positions determine the saved word IDs.
    // Travel and transport.
    ['バス', 'bus', ['bus']],
    ['バイク', 'motorcycle', ['motorcycle', 'motorbike', 'bike']],
    ['オートバイ', 'motorcycle', ['motorcycle', 'motorbike']],
    ['トラック', 'truck', ['truck', 'lorry']],
    ['エスカレーター', 'escalator', ['escalator']],
    ['エンジン', 'engine', ['engine']],
    ['タイヤ', 'tyre', ['tyre', 'tire']],
    ['ハンドル', 'steering wheel', ['steering wheel', 'handle']],
    ['ブレーキ', 'brake', ['brake', 'brakes']],
    ['ヘルメット', 'helmet', ['helmet']],
    ['シートベルト', 'seat belt', ['seat belt', 'seatbelt', 'safety belt']],
    ['ガソリンスタンド', 'petrol station', ['petrol station', 'gas station', 'filling station']],
    ['ホーム', 'platform', ['platform', 'train platform', 'home']],
    ['チケット', 'ticket', ['ticket', 'tickets']],
    ['スーツケース', 'suitcase', ['suitcase']],
    ['バッグ', 'bag', ['bag']],
    ['リュック', 'backpack', ['backpack', 'rucksack']],
    ['コイン', 'coin', ['coin', 'coins']],
    ['カード', 'card', ['card']],
    ['クレジットカード', 'credit card', ['credit card']],

    // Clothing and accessories.
    ['コート', 'coat', ['coat']],
    ['ジャケット', 'jacket', ['jacket']],
    ['ズボン', 'trousers', ['trousers', 'pants']],
    ['スカート', 'skirt', ['skirt']],
    ['スーツ', 'suit', ['suit']],
    ['ジーンズ', 'jeans', ['jeans']],
    ['パンツ', 'underpants', ['underpants', 'underwear', 'pants', 'trousers']],
    ['スニーカー', 'sneakers', ['sneakers', 'trainers', 'sneaker', 'trainer']],
    ['サンダル', 'sandals', ['sandals', 'sandal']],
    ['ブーツ', 'boots', ['boots', 'boot']],
    ['スリッパ', 'slippers', ['slippers', 'slipper']],
    ['マフラー', 'scarf', ['scarf', 'muffler']],
    ['ハンカチ', 'handkerchief', ['handkerchief', 'hanky']],
    ['タオル', 'towel', ['towel']],
    ['パジャマ', 'pyjamas', ['pyjamas', 'pajamas']],
    ['アクセサリー', 'accessories', ['accessories', 'accessory']],
    ['ネックレス', 'necklace', ['necklace']],
    ['イヤリング', 'earrings', ['earrings', 'earring', 'clip-on earrings']],
    ['ピアス', 'pierced earrings', ['pierced earrings', 'earrings', 'earring', 'piercing', 'body piercing']],
    ['マスク', 'mask', ['mask', 'face mask']],

    // Around the home.
    ['カーテン', 'curtains', ['curtains', 'curtain']],
    ['カーペット', 'carpet', ['carpet']],
    ['クッション', 'cushion', ['cushion']],
    ['デスク', 'desk', ['desk']],
    ['チェア', 'chair', ['chair']],
    ['ランプ', 'lamp', ['lamp']],
    ['ライト', 'light', ['light']],
    ['シャワー', 'shower', ['shower']],
    ['バスタブ', 'bathtub', ['bathtub', 'bath tub', 'bath']],
    ['シャンプー', 'shampoo', ['shampoo']],
    ['リンス', 'hair conditioner', ['hair conditioner', 'conditioner', 'hair rinse']],
    ['ドライヤー', 'hair dryer', ['hair dryer', 'hairdryer', 'blow dryer']],
    ['ブラシ', 'brush', ['brush']],
    ['トイレットペーパー', 'toilet paper', ['toilet paper', 'toilet roll']],
    ['ティッシュ', 'tissue', ['tissue', 'tissues', 'facial tissue']],
    ['スポンジ', 'sponge', ['sponge']],
    ['バケツ', 'bucket', ['bucket', 'pail']],
    ['フライパン', 'frying pan', ['frying pan', 'skillet', 'frypan']],
    ['ボウル', 'bowl', ['bowl', 'mixing bowl']],
    ['コップ', 'cup', ['cup', 'glass', 'drinking glass', 'tumbler']],

    // Meals, snacks and cooking.
    ['ハンバーガー', 'hamburger', ['hamburger', 'burger']],
    ['ハンバーグ', 'hamburger steak', ['hamburger steak', 'hamburg steak', 'hamburg']],
    ['ピザ', 'pizza', ['pizza']],
    ['パスタ', 'pasta', ['pasta']],
    ['スパゲッティ', 'spaghetti', ['spaghetti']],
    ['カレー', 'curry', ['curry']],
    ['オムレツ', 'omelette', ['omelette', 'omelet']],
    ['オムライス', 'omelette rice', ['omelette rice', 'omelet rice', 'omurice', 'rice omelette', 'rice omelet']],
    ['スープ', 'soup', ['soup']],
    ['ステーキ', 'steak', ['steak']],
    ['ソーセージ', 'sausage', ['sausage', 'sausages']],
    ['ベーコン', 'bacon', ['bacon']],
    ['ハム', 'ham', ['ham']],
    ['チキン', 'chicken', ['chicken']],
    ['ツナ', 'tuna', ['tuna', 'canned tuna', 'tinned tuna']],
    ['エビ', 'shrimp', ['shrimp', 'prawn', 'prawns', 'shrimps']],
    ['サーモン', 'salmon', ['salmon']],
    ['マグロ', 'tuna', ['tuna']],
    ['ポテト', 'potato', ['potato', 'potatoes', 'fries', 'french fries']],
    ['フライドポテト', 'French fries', ['french fries', 'fries', 'chips']],
    ['コロッケ', 'croquette', ['croquette', 'croquettes']],
    ['グラタン', 'gratin', ['gratin']],
    ['ドリア', 'rice gratin', ['rice gratin', 'doria', 'baked rice casserole']],
    ['ドーナツ', 'doughnut', ['doughnut', 'donut', 'doughnuts', 'donuts']],
    ['クッキー', 'cookie', ['cookie', 'cookies', 'biscuit', 'biscuits']],
    ['ビスケット', 'biscuit', ['biscuit', 'biscuits', 'cookie', 'cookies']],
    ['パンケーキ', 'pancake', ['pancake', 'pancakes']],
    ['ワッフル', 'waffle', ['waffle', 'waffles']],
    ['パフェ', 'parfait', ['parfait']],
    ['ゼリー', 'jelly', ['jelly', 'jello', 'gelatin dessert']],
    ['キャラメル', 'caramel', ['caramel']],
    ['キャンディー', 'candy', ['candy', 'sweets', 'sweet']],
    ['ガム', 'chewing gum', ['chewing gum', 'gum']],
    ['バター', 'butter', ['butter']],
    ['ジャム', 'jam', ['jam']],
    ['マヨネーズ', 'mayonnaise', ['mayonnaise', 'mayo']],
    ['ケチャップ', 'ketchup', ['ketchup', 'tomato ketchup']],
    ['ソース', 'sauce', ['sauce']],
    ['ドレッシング', 'salad dressing', ['salad dressing', 'dressing']],
    ['オリーブオイル', 'olive oil', ['olive oil']],

    // Fruit, vegetables and drinks.
    ['ブロッコリー', 'broccoli', ['broccoli']],
    ['キャベツ', 'cabbage', ['cabbage']],
    ['レタス', 'lettuce', ['lettuce']],
    ['セロリ', 'celery', ['celery']],
    ['ピーマン', 'green pepper', ['green pepper', 'bell pepper', 'green bell pepper']],
    ['パプリカ', 'bell pepper', ['bell pepper', 'sweet pepper', 'paprika']],
    ['ニンジン', 'carrot', ['carrot', 'carrots']],
    ['ジャガイモ', 'potato', ['potato', 'potatoes']],
    ['タマネギ', 'onion', ['onion', 'onions']],
    ['キュウリ', 'cucumber', ['cucumber']],
    ['カボチャ', 'pumpkin', ['pumpkin', 'squash']],
    ['ナス', 'aubergine', ['aubergine', 'eggplant']],
    ['イチゴ', 'strawberry', ['strawberry', 'strawberries']],
    ['メロン', 'melon', ['melon']],
    ['スイカ', 'watermelon', ['watermelon']],
    ['ブドウ', 'grapes', ['grapes', 'grape']],
    ['モモ', 'peach', ['peach', 'peaches']],
    ['パイナップル', 'pineapple', ['pineapple']],
    ['マンゴー', 'mango', ['mango', 'mangoes', 'mangos']],
    ['キウイ', 'kiwi fruit', ['kiwi fruit', 'kiwifruit', 'kiwi']],
    ['グレープフルーツ', 'grapefruit', ['grapefruit']],
    ['ブルーベリー', 'blueberry', ['blueberry', 'blueberries']],
    ['チェリー', 'cherry', ['cherry', 'cherries']],
    ['ココア', 'cocoa', ['cocoa', 'hot chocolate']],
    ['コーラ', 'cola', ['cola', 'coke']],
    ['ソーダ', 'soda', ['soda', 'soda water']],
    ['サイダー', 'lemon-lime soda', ['lemon-lime soda', 'soda', 'lemonade', 'soft drink']],
    ['カフェ', 'cafe', ['cafe', 'café', 'coffee shop']],
    ['ミネラルウォーター', 'mineral water', ['mineral water', 'bottled water']],
    ['エスプレッソ', 'espresso', ['espresso']],

    // Technology and study.
    ['スマートフォン', 'smartphone', ['smartphone', 'smart phone', 'mobile phone', 'cell phone']],
    ['スマホ', 'smartphone', ['smartphone', 'smart phone', 'mobile phone', 'cell phone']],
    ['パソコン', 'personal computer', ['personal computer', 'computer', 'pc']],
    ['ノート', 'notebook', ['notebook', 'exercise book']],
    ['ノートパソコン', 'laptop', ['laptop', 'laptop computer', 'notebook computer']],
    ['タブレット', 'tablet', ['tablet', 'tablet computer']],
    ['キーボード', 'keyboard', ['keyboard']],
    ['マウス', 'mouse', ['mouse', 'computer mouse']],
    ['モニター', 'monitor', ['monitor', 'screen']],
    ['スクリーン', 'screen', ['screen']],
    ['プリンター', 'printer', ['printer']],
    ['スキャナー', 'scanner', ['scanner']],
    ['インターネット', 'internet', ['internet', 'the internet']],
    ['メール', 'email', ['email', 'e-mail', 'mail']],
    ['アプリ', 'app', ['app', 'application']],
    ['パスワード', 'password', ['password']],
    ['アカウント', 'account', ['account']],
    ['サイト', 'website', ['website', 'web site', 'site']],
    ['ページ', 'page', ['page']],
    ['リンク', 'link', ['link', 'hyperlink']],
    ['データ', 'data', ['data']],
    ['フォルダー', 'folder', ['folder']],
    ['ダウンロード', 'download', ['download']],
    ['アップロード', 'upload', ['upload']],
    ['ログイン', 'log in', ['log in', 'login', 'sign in']],
    ['ログアウト', 'log out', ['log out', 'logout', 'sign out']],
    ['クリック', 'click', ['click']],
    ['ボタン', 'button', ['button']],
    ['バッテリー', 'battery', ['battery']],
    ['ケーブル', 'cable', ['cable']],

    // Sport, music and leisure.
    ['サッカー', 'football', ['football', 'soccer']],
    ['テニス', 'tennis', ['tennis']],
    ['バスケットボール', 'basketball', ['basketball']],
    ['バレーボール', 'volleyball', ['volleyball']],
    ['ゴルフ', 'golf', ['golf']],
    ['ラグビー', 'rugby', ['rugby']],
    ['バドミントン', 'badminton', ['badminton']],
    ['マラソン', 'marathon', ['marathon']],
    ['ジョギング', 'jogging', ['jogging', 'jog']],
    ['トレーニング', 'training', ['training', 'workout', 'exercise']],
    ['ジム', 'gym', ['gym', 'gymnasium']],
    ['プール', 'swimming pool', ['swimming pool', 'pool']],
    ['キャンプ', 'camping', ['camping', 'camp']],
    ['ハイキング', 'hiking', ['hiking', 'hike']],
    ['ピクニック', 'picnic', ['picnic']],
    ['コンサート', 'concert', ['concert']],
    ['ライブ', 'live performance', ['live performance', 'live concert', 'live show', 'gig', 'concert']],
    ['カラオケ', 'karaoke', ['karaoke']],
    ['ダンス', 'dance', ['dance', 'dancing']],
    ['ドラム', 'drums', ['drums', 'drum']],

    // Shops, work and everyday life.
    ['コンビニ', 'convenience store', ['convenience store', 'corner shop']],
    ['デパート', 'department store', ['department store']],
    ['ショッピング', 'shopping', ['shopping']],
    ['ショッピングモール', 'shopping mall', ['shopping mall', 'mall', 'shopping centre', 'shopping center']],
    ['レジ', 'cash register', ['cash register', 'checkout', 'till']],
    ['レシート', 'receipt', ['receipt']],
    ['サービス', 'service', ['service']],
    ['スタッフ', 'staff', ['staff', 'staff member']],
    ['アルバイト', 'part-time job', ['part-time job', 'part time job', 'part-time work', 'part time work']],
    ['オフィス', 'office', ['office']],
    ['ミーティング', 'meeting', ['meeting']],
    ['スケジュール', 'schedule', ['schedule', 'timetable']],
    ['プレゼント', 'gift', ['gift', 'present']],
    ['メッセージ', 'message', ['message']],
    ['ポスター', 'poster', ['poster']],
    ['パンフレット', 'pamphlet', ['pamphlet', 'brochure', 'leaflet']],
    ['ペットボトル', 'plastic bottle', ['plastic bottle', 'pet bottle']],
    ['リサイクル', 'recycling', ['recycling', 'recycle']],
    ['クリーニング', 'dry cleaning', ['dry cleaning', 'dry-cleaning', 'cleaning']],
    ['アイロン', 'iron', ['iron', 'clothes iron']],
  ].map(([kana, english, answers], index) => ({ id: `word-${index + 1}`, kana, english, answers }));

  // Original N5-style listening practice: longer sentences and contrasting details.
  // These are practice materials, not official JLPT exam questions.
  const PHRASES = [
    { id: 'n5-hard-01', japanese: '明日は八時に家を出ます。学校には八時半に着きます。', meaning: "Tomorrow I will leave home at eight. I will arrive at school at half past eight." },
    { id: 'n5-hard-02', japanese: '授業は九時から十二時までです。昼ご飯は十二時半に食べます。', meaning: "Class is from nine until twelve. I will eat lunch at half past twelve." },
    { id: 'n5-hard-03', japanese: '毎朝六時に起きます。でも、日曜日は八時に起きます。', meaning: "I get up at six every morning. But on Sundays I get up at eight." },
    { id: 'n5-hard-04', japanese: '昨日は十一時に寝ました。今日は十時に寝ます。', meaning: "Yesterday I went to bed at eleven. Today I will go to bed at ten." },
    { id: 'n5-hard-05', japanese: '電車は七時二十分に来ます。今は七時十分です。', meaning: "The train comes at seven twenty. It is seven ten now." },
    { id: 'n5-hard-06', japanese: '図書館は午後五時に閉まります。今から一時間、本を読みます。', meaning: "The library closes at five in the afternoon. I will read for an hour from now." },
    { id: 'n5-hard-07', japanese: '土曜日の午前中は働きます。午後は友達と遊びます。', meaning: "I work on Saturday morning. In the afternoon I spend time with a friend." },
    { id: 'n5-hard-08', japanese: '映画は六時に始まります。五時四十分に駅で会いましょう。', meaning: "The film starts at six. Let's meet at the station at five forty." },
    { id: 'n5-hard-09', japanese: '毎日三十分、日本語を勉強します。昨日は一時間勉強しました。', meaning: "I study Japanese for thirty minutes every day. Yesterday I studied for an hour." },
    { id: 'n5-hard-10', japanese: '月曜日と木曜日に学校へ行きます。火曜日は家で勉強します。', meaning: "I go to school on Mondays and Thursdays. On Tuesdays I study at home." },
    { id: 'n5-hard-11', japanese: 'りんごを三つと、バナナを二本ください。みかんはいりません。', meaning: "Please give me three apples and two bananas. I do not need any mandarins." },
    { id: 'n5-hard-12', japanese: 'このパンは一つ百円です。二つ買います。', meaning: "This bread costs one hundred yen each. I will buy two." },
    { id: 'n5-hard-13', japanese: '牛乳を一本買いました。でも、卵は買いませんでした。', meaning: "I bought one bottle of milk. But I did not buy any eggs." },
    { id: 'n5-hard-14', japanese: '青いシャツは二千円です。白いシャツは千五百円です。', meaning: "The blue shirt costs two thousand yen. The white shirt costs one thousand five hundred yen." },
    { id: 'n5-hard-15', japanese: 'コーヒーを二杯と、お茶を一杯お願いします。砂糖はいりません。', meaning: "Two cups of coffee and one cup of tea, please. I do not need sugar." },
    { id: 'n5-hard-16', japanese: '切手を五枚ください。それから、はがきを二枚ください。', meaning: "Please give me five stamps. Then please give me two postcards." },
    { id: 'n5-hard-17', japanese: 'このかばんは高いです。あの小さいかばんを買います。', meaning: "This bag is expensive. I will buy that small bag over there." },
    { id: 'n5-hard-18', japanese: '冷蔵庫に卵が四つあります。牛乳はありません。', meaning: "There are four eggs in the fridge. There is no milk." },
    { id: 'n5-hard-19', japanese: '今日は千円あります。六百円の本を買います。', meaning: "I have one thousand yen today. I will buy a book that costs six hundred yen." },
    { id: 'n5-hard-20', japanese: 'ケーキを四つ買いました。一つは母にあげました。', meaning: "I bought four cakes. I gave one to my mother." },
    { id: 'n5-hard-21', japanese: '駅の前に銀行があります。郵便局は駅の後ろです。', meaning: "There is a bank in front of the station. The post office is behind the station." },
    { id: 'n5-hard-22', japanese: '本は机の上にあります。かばんは机の下です。', meaning: "The book is on the desk. The bag is under the desk." },
    { id: 'n5-hard-23', japanese: '猫は椅子の下にいます。犬はドアの近くにいます。', meaning: "The cat is under the chair. The dog is near the door." },
    { id: 'n5-hard-24', japanese: 'スーパーは銀行の隣です。学校の隣ではありません。', meaning: "The supermarket is next to the bank. It is not next to the school." },
    { id: 'n5-hard-25', japanese: '二階に教室が三つあります。先生の部屋は一階です。', meaning: "There are three classrooms on the second floor. The teachers' room is on the first floor." },
    { id: 'n5-hard-26', japanese: '台所に母がいます。父は庭にいます。', meaning: "My mother is in the kitchen. My father is in the garden." },
    { id: 'n5-hard-27', japanese: '駅までバスで十分です。歩いて二十分です。', meaning: "It takes ten minutes to the station by bus. It takes twenty minutes on foot." },
    { id: 'n5-hard-28', japanese: '学校へは自転車で行きます。でも、雨の日はバスで行きます。', meaning: "I go to school by bicycle. But on rainy days I go by bus." },
    { id: 'n5-hard-29', japanese: 'この道をまっすぐ行ってください。右に小さい公園があります。', meaning: "Please go straight along this road. There is a small park on the right." },
    { id: 'n5-hard-30', japanese: '入口は左です。右のドアから入らないでください。', meaning: "The entrance is on the left. Please do not enter through the door on the right." },
    { id: 'n5-hard-31', japanese: '昨日は魚を食べました。今日は肉を食べたいです。', meaning: "Yesterday I ate fish. Today I want to eat meat." },
    { id: 'n5-hard-32', japanese: '朝ご飯は食べませんでした。でも、お茶を飲みました。', meaning: "I did not eat breakfast. But I drank tea." },
    { id: 'n5-hard-33', japanese: '先週は忙しかったです。今週はあまり忙しくないです。', meaning: "Last week was busy. This week is not very busy." },
    { id: 'n5-hard-34', japanese: '昨日の天気はよくなかったです。今日はいい天気です。', meaning: "The weather was not good yesterday. The weather is nice today." },
    { id: 'n5-hard-35', japanese: '去年は京都に住んでいました。今は東京に住んでいます。', meaning: "Last year I lived in Kyoto. Now I live in Tokyo." },
    { id: 'n5-hard-36', japanese: '昨日、映画を見ました。とてもおもしろかったです。', meaning: "I watched a film yesterday. It was very interesting." },
    { id: 'n5-hard-37', japanese: '日曜日はどこにも行きませんでした。家で本を読みました。', meaning: "I did not go anywhere on Sunday. I read a book at home." },
    { id: 'n5-hard-38', japanese: '今朝は寒くなかったです。でも、今は寒いです。', meaning: "It was not cold this morning. But it is cold now." },
    { id: 'n5-hard-39', japanese: '昨日は宿題がありませんでした。今日はたくさんあります。', meaning: "I did not have any homework yesterday. Today I have a lot." },
    { id: 'n5-hard-40', japanese: '先月、新しい靴を買いました。今日はその靴を履いています。', meaning: "I bought new shoes last month. Today I am wearing those shoes." },
    { id: 'n5-hard-41', japanese: '私は魚が好きです。でも、弟は魚が好きではありません。', meaning: "I like fish. But my younger brother does not like fish." },
    { id: 'n5-hard-42', japanese: '姉は英語が上手です。私はまだあまり上手ではありません。', meaning: "My older sister is good at English. I am not very good at it yet." },
    { id: 'n5-hard-43', japanese: 'この部屋は広いです。でも、少し暗いです。', meaning: "This room is spacious. But it is a little dark." },
    { id: 'n5-hard-44', japanese: '今日は暑いですから、冷たい水を飲みたいです。', meaning: "It is hot today, so I want to drink cold water." },
    { id: 'n5-hard-45', japanese: '明日は休みですから、早く起きません。', meaning: "Tomorrow is a day off, so I will not get up early." },
    { id: 'n5-hard-46', japanese: '母はコーヒーをよく飲みます。父はお茶をよく飲みます。', meaning: "My mother often drinks coffee. My father often drinks tea." },
    { id: 'n5-hard-47', japanese: 'この町は静かです。そして、公園がたくさんあります。', meaning: "This town is quiet. And there are many parks." },
    { id: 'n5-hard-48', japanese: '朝はいつもパンを食べます。でも、今日はご飯を食べました。', meaning: "I always eat bread in the morning. But today I ate rice." },
    { id: 'n5-hard-49', japanese: '私は毎日テレビを見ます。兄はあまり見ません。', meaning: "I watch television every day. My older brother does not watch it very much." },
    { id: 'n5-hard-50', japanese: '赤い花が好きです。でも、今日は白い花を買いました。', meaning: "I like red flowers. But today I bought white flowers." },
    { id: 'n5-hard-51', japanese: '窓を開けてください。ドアは閉めてください。', meaning: "Please open the window. Please close the door." },
    { id: 'n5-hard-52', japanese: 'ここで写真を撮ってもいいです。でも、食べ物を食べてはいけません。', meaning: "You may take photographs here. But you must not eat food." },
    { id: 'n5-hard-53', japanese: '名前を書いてください。それから、この紙を先生に渡してください。', meaning: "Please write your name. Then please give this paper to the teacher." },
    { id: 'n5-hard-54', japanese: '明日、友達と昼ご飯を食べます。その後で、買い物をします。', meaning: "Tomorrow I will eat lunch with a friend. After that I will go shopping." },
    { id: 'n5-hard-55', japanese: 'シャワーを浴びてから、寝ます。まだ宿題があります。', meaning: "I will go to bed after taking a shower. I still have homework." },
    { id: 'n5-hard-56', japanese: '一緒に公園へ行きませんか。三時に家を出ましょう。', meaning: "Would you like to go to the park together? Let's leave home at three." },
    { id: 'n5-hard-57', japanese: '今日は病院へ行きますから、学校を休みます。', meaning: "I am going to the hospital today, so I will be absent from school." },
    { id: 'n5-hard-58', japanese: '明日は母の誕生日です。花を買って、母にあげます。', meaning: "Tomorrow is my mother's birthday. I will buy flowers and give them to her." },
    { id: 'n5-hard-59', japanese: '今、妹は本を読んでいます。私は手紙を書いています。', meaning: "My younger sister is reading a book now. I am writing a letter." },
    { id: 'n5-hard-60', japanese: 'この本を借りてもいいですか。金曜日に返します。', meaning: "May I borrow this book? I will return it on Friday." },
  ];

  const STORAGE_KEY = 'katakana-quest-progress-v1';
  const QUEST_SIZE = 10;
  const LISTENING_SIZE = 10;
  const CHECKIN_KEY = 'practice-checkins-v1';
  const CHECKINS = [
    { key: 'aiInvestment', label: 'AI investment', symbol: '🤖' },
    { key: 'quietMoment', label: 'Quiet moment', icon: 'assets/meditating-buddha.svg' },
    { key: 'exercised', label: 'Exercised', icon: 'assets/dumbbell.svg' },
  ];
  const STAMP_TYPES = [
    ...CHECKINS,
    { key: 'gettysburg', label: 'Gettysburg practice', symbol: '🎩' },
    { key: 'katakana', label: 'Katakana', symbol: 'カ' },
    { key: 'listening', label: 'Hard N5 listening', symbol: '♪' },
    { key: 'kanji', label: 'Everyday kanji', symbol: '漢' },
  ];
  let today = dateKey(new Date());
  let calendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  let state = loadState();
  let listeningAttempt = null;

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
    gradeOverride: document.querySelector('#katakana-grade-override'),
    listeningCount: document.querySelector('#listening-count'),
    listeningProgress: document.querySelector('#listening-progress'),
    listeningStep: document.querySelector('#listening-step'),
    listeningPrompt: document.querySelector('#listening-prompt'),
    listeningInstruction: document.querySelector('#listening-instruction'),
    listeningPlay: document.querySelector('#listening-play'),
    audioStatus: document.querySelector('#audio-status'),
    listeningForm: document.querySelector('#listening-form'),
    listeningInput: document.querySelector('#listening-input'),
    listeningNotSure: document.querySelector('#listening-not-sure'),
    listeningFeedback: document.querySelector('#listening-feedback'),
    listeningTranscript: document.querySelector('#listening-transcript'),
    listeningMeaning: document.querySelector('#listening-meaning'),
    listeningAttempt: document.querySelector('#listening-attempt'),
    listeningMarks: [...document.querySelectorAll('[data-listening-mark]')],
    listeningGradeOverride: document.querySelector('#listening-grade-override'),
    listeningNext: document.querySelector('#listening-next'),
    listeningMarkActions: document.querySelector('#listening-mark-actions'),
    listeningGradePrompt: document.querySelector('#listening-grade-prompt'),
    listeningGradeStatus: document.querySelector('#listening-grade-status'),
    listeningJapanese: document.querySelector('#listening-japanese'),
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
        katakanaReviewQueue: Array.isArray(saved.katakanaReviewQueue) ? saved.katakanaReviewQueue : [],
        lastKatakanaGrade: saved.lastKatakanaGrade && typeof saved.lastKatakanaGrade === 'object' ? saved.lastKatakanaGrade : null,
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
      return { usedWords: [], wrongAnswers: [], lastKatakanaGrade: null, listeningSession: null, usedListeningPhrases: [], listeningReview: [], listeningCompletedDays: [], days: {}, currentQuestion: null };
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
    if (!available.length) {
      const missed = new Set(state.wrongAnswers.filter(Boolean).map((entry) => entry.wordId));
      state.katakanaReviewQueue = (state.katakanaReviewQueue || []).filter((id) => missed.has(id) && WORDS.some((word) => word.id === id));
      if (!state.katakanaReviewQueue.length) state.katakanaReviewQueue = [...missed].filter((id) => WORDS.some((word) => word.id === id));
      const nextId = state.katakanaReviewQueue.shift();
      const word = WORDS.find((entry) => entry.id === nextId);
      if (!word) return null;
      state.currentQuestion = { date: today, wordId: word.id, review: true };
      saveState();
      return word;
    }
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
    stopListeningAudio();
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
    renderKatakanaCorrection();
    renderCalendarStats();
  }

  function correctableKatakanaWord() {
    const grade = state.lastKatakanaGrade;
    if (!grade || grade.date !== today || typeof grade.correct !== 'boolean') return null;
    return WORDS.find((word) => word.id === grade.wordId) || null;
  }

  function renderKatakanaCorrection() {
    const word = correctableKatakanaWord();
    elements.gradeOverride.hidden = !word;
    if (word) {
      elements.gradeOverride.textContent = 'I got that last one wrong';
      elements.gradeOverride.setAttribute('aria-label', `${elements.gradeOverride.textContent}: ${word.kana}`);
    }
  }

  function loadCheckins() {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(CHECKIN_KEY) || '{}') || {}; } catch { /* Recover unreadable check-ins. */ }
    return Object.fromEntries(CHECKINS.map(({key}) => [key, new Set(
      (Array.isArray(saved[key]) ? saved[key] : []).filter((date) => typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date))
    )]));
  }

  CHECKINS.forEach(({key, label}) => {
    document.querySelector('#checkin-' + key).addEventListener('click', () => {
      const checkins = loadCheckins();
      const date = dateKey(new Date());
      if (checkins[key].has(date)) return;
      checkins[key].add(date);
      try {
        localStorage.setItem(CHECKIN_KEY, JSON.stringify(Object.fromEntries(
          CHECKINS.map(({key}) => [key, [...checkins[key]]])
        )));
      } catch {
        document.querySelector('#checkin-status').textContent = 'Your browser could not save this stamp. Please try again.';
        return;
      }
      refreshCalendar();
      document.querySelector('#checkin-status').textContent = label + ' stamped for today.';
    });
  });

  function getCalendarCompletions() {
    let kanjiDays = [];
    let kanjiStats = {};
    try {
      const kanji = JSON.parse(localStorage.getItem('katakana-quest-kanji-v1') || '{}');
      kanjiDays = Array.isArray(kanji.completedDays) ? kanji.completedDays : [];
      kanjiStats = kanji.dailyStats && typeof kanji.dailyStats === 'object' ? { ...kanji.dailyStats } : {};
      if (kanji.day && Array.isArray(kanji.day.answers)) {
        const reviewAnswers = Array.isArray(kanji.day.reviewAnswers) ? kanji.day.reviewAnswers
          : (kanji.reviewSession && Array.isArray(kanji.reviewSession.answers) ? kanji.reviewSession.answers : []);
        const answers = [...kanji.day.answers, ...reviewAnswers];
        kanjiStats[kanji.day.date] = {
          answered: answers.length,
          correct: answers.filter((answer) => answer.correct && !answer.assisted).length,
        };
        if (answers.length >= 10) kanjiDays = [...kanjiDays, kanji.day.date];
      }
    } catch {
      // Katakana and listening stamps remain available if kanji storage cannot be read.
    }
    return {
      ...loadCheckins(),
      gettysburg: window.PracticeUI.hats(),
      katakana: new Set(Object.keys(state.days).filter((date) => state.days[date] && state.days[date].completed)),
      listening: new Set(state.listeningCompletedDays),
      kanji: new Set(kanjiDays.filter((date) => typeof date === 'string')),
      kanjiStats,
    };
  }

  function renderCalendarStats() {
    const completions = getCalendarCompletions();
    CHECKINS.forEach(({key, label}) => {
      const button = document.querySelector('#checkin-' + key);
      const stamped = completions[key].has(dateKey(new Date()));
      button.disabled = stamped;
      button.setAttribute('aria-pressed', String(stamped));
      button.textContent = stamped ? label + ' · Stamped today ✓' : label;
    });
    const total = STAMP_TYPES.reduce((sum, type) => sum + completions[type.key].size, 0);
    elements.navStampCount.textContent = String(total);
    elements.stampTotal.textContent = String(total);
    window.PracticeGacha.update(completions);
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
    window.JapaneseAudio.stop();
  }

  function getListeningSession() {
    const date = dateKey(new Date());
    const session = state.listeningSession;
    const phraseIds = new Set(PHRASES.map((phrase) => phrase.id));
    // Retired exercises must disappear from saved review and selection history too.
    state.listeningReview = state.listeningReview.filter((answer) => answer && phraseIds.has(answer.id));
    state.usedListeningPhrases = state.usedListeningPhrases.filter((id) => phraseIds.has(id));
    if (session && session.date === date
      && Array.isArray(session.phraseIds) && session.phraseIds.length === LISTENING_SIZE
      && new Set(session.phraseIds).size === LISTENING_SIZE
      && session.phraseIds.every((id) => phraseIds.has(id))
      && Array.isArray(session.answers) && session.answers.length <= LISTENING_SIZE) return session;

    stopListeningAudio();
    listeningAttempt = null;
    let used = new Set(state.usedListeningPhrases.filter((id) => phraseIds.has(id)));
    // Most recently missed phrases lead the daily ten, even if used in this cycle.
    const selected = [...new Set(state.listeningReview.filter(Boolean).map((answer) => answer.id).reverse())]
      .filter((id) => phraseIds.has(id)).slice(0, LISTENING_SIZE);
    selected.forEach((id) => used.add(id));
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
    const index = session.showGradedAnswer ? session.answers.length - 1 : session.answers.length;
    return PHRASES.find((phrase) => phrase.id === session.phraseIds[index]);
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
    refreshCalendar();
  }

  function playListening(phrase) {
    window.JapaneseAudio.speak(phrase.japanese, setAudioStatus);
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
      attempt.textContent = answer.translation ? `You wrote: ${answer.translation}` : 'Not sure';
      details.append(meaning, attempt);
      item.append(replay, details);
      elements.listeningReviewList.appendChild(item);
    });
  }

  function renderListeningCorrection() {
    const session = getListeningSession();
    const answer = session.answers.at(-1);
    elements.listeningGradeOverride.hidden = !answer;
    if (answer) {
      elements.listeningGradeOverride.textContent = 'I got that last one wrong';
      const phrase = PHRASES.find((entry) => entry.id === answer.id);
      elements.listeningGradeOverride.setAttribute('aria-label', elements.listeningGradeOverride.textContent + ': ' + phrase.meaning);
    }
  }

  elements.listeningGradeOverride.addEventListener('click', () => {
    if (refreshListeningDay()) return;
    const session = getListeningSession();
    const answer = session.answers.at(-1);
    if (!answer) return;
    answer.gotIt = false;
    answer.manuallyGraded = true;
    state.listeningReview = state.listeningReview.filter((entry) => entry && entry.id !== answer.id);
    if (!answer.gotIt) state.listeningReview.push({ id: answer.id, translation: answer.translation });
    saveState();
    renderListeningCorrection();
    renderListeningReview();
    if (session.answers.length === LISTENING_SIZE) {
      const understood = session.answers.filter((entry) => entry.gotIt).length;
      elements.listeningSummary.textContent = `You marked ${understood} of ${LISTENING_SIZE} as understood. Come back tomorrow for a new set, or replay saved phrases below.`;
    }
  });

  function renderListening() {
    const session = getListeningSession();
    const count = session.answers.length;
    const graded = Boolean(session.showGradedAnswer && count);
    const done = count === LISTENING_SIZE && !graded;
    elements.listeningDate.textContent = formatToday();
    elements.listeningCount.textContent = String(count);
    elements.listeningProgress.style.width = `${count / LISTENING_SIZE * 100}%`;
    elements.listeningStep.textContent = done ? 'Complete' : `Phrase ${graded ? count : count + 1} of ${LISTENING_SIZE}`;
    elements.listeningPrompt.hidden = done;
    elements.listeningInstruction.textContent = 'Listen again if you need to. Catch the times, quantities, negatives and changes of plan.';
    elements.listeningForm.hidden = done || graded;
    elements.listeningFeedback.hidden = true;
    elements.listeningNext.hidden = !graded;
    elements.listeningMarkActions.hidden = done || graded;
    elements.listeningGradePrompt.hidden = graded;
    elements.listeningGradeStatus.hidden = !graded;
    elements.listeningTranscript.hidden = true;
    window.KanjiTooltips.render(elements.listeningJapanese, '');
    elements.listeningDone.hidden = !done;
    elements.audioStatus.hidden = true;
    elements.listeningInput.value = '';
    if (done) {
      const understood = session.answers.filter((answer) => answer && answer.gotIt).length;
      elements.listeningSummary.textContent = `You marked ${understood} of ${LISTENING_SIZE} as understood. Come back tomorrow for a new set, or replay saved phrases below.`;
    }
    if (graded) {
      const answer = session.answers.at(-1);
      const phrase = currentListeningPhrase();
      elements.listeningMeaning.textContent = phrase.meaning;
      elements.listeningAttempt.textContent = answer.translation || 'Not sure';
      window.KanjiTooltips.render(elements.listeningJapanese, phrase.japanese);
      elements.listeningTranscript.hidden = false;
      elements.listeningFeedback.hidden = false;
      elements.listeningInstruction.textContent = 'Answer checked. Correct the grade if needed, then continue.';
      elements.listeningGradeStatus.textContent = answer.gotIt ? 'Marked as correct.' : 'Marked as wrong. Saved for review.';
      elements.listeningNext.textContent = count === LISTENING_SIZE ? 'See today’s result →' : 'Next phrase →';
    }
    renderListeningCorrection();
    renderListeningReview();
  }

  function submitListening(event, allowBlank = false) {
    event.preventDefault();
    if (refreshListeningDay() || getListeningSession().showGradedAnswer) return;
    const phrase = currentListeningPhrase();
    if (!phrase) return;
    const translation = elements.listeningInput.value.trim();
    if (!translation && !allowBlank) {
      elements.listeningInput.focus();
      return;
    }
    listeningAttempt = translation;
    elements.listeningForm.hidden = true;
    elements.listeningMeaning.textContent = phrase.meaning;
    elements.listeningAttempt.textContent = listeningAttempt || 'Not sure';
    window.KanjiTooltips.render(elements.listeningJapanese, phrase.japanese);
    elements.listeningTranscript.hidden = false;
    elements.listeningInstruction.textContent = 'Read the Japanese and replay the audio before marking your answer.';
    elements.listeningFeedback.hidden = false;
  }

  function markListening(gotIt) {
    if (refreshListeningDay()) return;
    if (getListeningSession().showGradedAnswer) return;
    if (listeningAttempt === null) listeningAttempt = elements.listeningInput.value.trim();
    const phrase = currentListeningPhrase();
    if (!phrase) return;
    const session = getListeningSession();
    session.answers.push({ id: phrase.id, translation: listeningAttempt, gotIt });
    if (session.answers.length === LISTENING_SIZE && !state.listeningCompletedDays.includes(session.date)) {
      state.listeningCompletedDays.push(session.date);
    }
    state.listeningReview = state.listeningReview.filter((answer) => answer && answer.id !== phrase.id);
    if (!gotIt) state.listeningReview.push({ id: phrase.id, translation: listeningAttempt });
    listeningAttempt = null;
    session.showGradedAnswer = false;
    saveState();
    stopListeningAudio();
    renderListening();
    refreshCalendar();
    if (gotIt) window.PracticeUI.win();
    if (session.answers.length === LISTENING_SIZE) elements.listeningRestart.focus();
    else elements.listeningPlay.focus();
  }

  function renderQuestion() {
    const day = getToday();
    renderStats();
    elements.cardPrompt.textContent = 'Translate this word';
    elements.answerForm.hidden = false;
    elements.practiceCard.classList.remove('is-correct', 'is-wrong');
    const gradedWord = state.lastKatakanaGrade?.showResult ? correctableKatakanaWord() : null;
    if (gradedWord) {
      elements.kanaWord.textContent = gradedWord.kana;
      elements.answerInput.value = state.lastKatakanaGrade.givenAnswer || '';
      elements.cardPrompt.textContent = state.lastKatakanaGrade.reviewing ? 'Review a missed word' : 'Translate this word';
      showFeedback(state.lastKatakanaGrade.correct, gradedWord);
      if (day.completed) elements.submitAnswer.textContent = 'Finish today’s quest →';
      return;
    }
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
      setFeedback('is-neutral', 'Word bank complete', 'Every available word has been used and no missed words are waiting for review.');
      return;
    }
    elements.cardPrompt.textContent = state.currentQuestion?.review ? 'Review a missed word' : 'Translate this word';
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
      correct ? `${word.kana} = ${word.english}. Great reading!` : `The answer is ${word.english}. Saved for review below.`,
    );
    elements.answerInput.disabled = true;
    elements.submitAnswer.disabled = false;
    elements.submitAnswer.textContent = 'Next word  →';
  }

  function submitAnswer(event, dontKnow = false) {
    event.preventDefault();
    if (refreshKatakanaDay()) return;
    if (elements.answerInput.disabled) {
      if (state.lastKatakanaGrade) state.lastKatakanaGrade.showResult = false;
      state.currentQuestion = null;
      saveState();
      renderQuestion();
      return;
    }
    const word = currentWord();
    if (!word) return;
    if (!elements.answerInput.value.trim() && !dontKnow) {
      elements.answerInput.focus();
      return;
    }
    const correct = word.answers.some((answer) => normalize(answer) === normalize(elements.answerInput.value));
    const reviewing = Boolean(state.currentQuestion?.review);
    state.lastKatakanaGrade = { date: today, wordId: word.id, givenAnswer: elements.answerInput.value.trim(), correct, reviewing, showResult: false };
    state.wrongAnswers = state.wrongAnswers.filter((answer) => answer && answer.wordId !== word.id);
    if (correct) {
      getToday().correct += 1;
      renderReview();
    }
    else {
      state.wrongAnswers.push({ wordId: word.id, givenAnswer: elements.answerInput.value.trim() });
      renderReview();
    }
    state.currentQuestion = null;
    getToday().completed = getToday().correct >= QUEST_SIZE;
    saveState();
    renderQuestion();
    window.JapaneseAudio.speak(word.kana);
    if (correct) window.PracticeUI.win();
    else window.PracticeUI.notice(`${word.kana} = ${word.english} · saved for review`);
  }

  elements.gradeOverride.addEventListener('click', () => {
    if (refreshKatakanaDay()) return;
    const word = correctableKatakanaWord();
    if (!word) return;
    const grade = state.lastKatakanaGrade;
    if (!grade.correct) return;
    grade.correct = false;
    grade.manuallyGraded = true;
    const day = getToday();
    day.correct = Math.max(0, day.correct + (grade.correct ? 1 : -1));
    day.completed = day.correct >= QUEST_SIZE;
    state.wrongAnswers = state.wrongAnswers.filter((answer) => answer && answer.wordId !== word.id);
    if (!grade.correct) state.wrongAnswers.push({ wordId: word.id, givenAnswer: grade.givenAnswer });
    saveState();
    const typed = elements.answerInput.value;
    renderReview();
    renderQuestion();
    if (!elements.answerInput.disabled) elements.answerInput.value = typed;
  });

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
            ? ': ' + kanjiStats.correct + ' correct out of ' + kanjiStats.answered + ' signs practised (including reviews, without revealing the meaning)' : '')).join(', ') : '');
        cell.setAttribute('aria-label', label);
        cell.setAttribute('title', label);
        if (earned.length) {
          const stamps = document.createElement('div');
          stamps.className = 'day-stamps';
          stamps.setAttribute('aria-hidden', 'true');
          earned.forEach((type) => {
            const stamp = document.createElement('span');
            stamp.className = 'day-stamp stamp-' + type.key;
            if (type.icon) {
              const icon = document.createElement('img');
              icon.src = type.icon; icon.alt = ''; icon.width = 18; icon.height = 18;
              stamp.appendChild(icon);
            } else stamp.textContent = type.symbol;
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

  document.querySelector('#katakana-dont-know').addEventListener('click', (event) => { elements.answerInput.value = ''; submitAnswer(event, true); });
  elements.answerForm.addEventListener('submit', submitAnswer);
  elements.tabs.forEach((tab) => tab.addEventListener('click', () => setView(tab.dataset.view)));
  elements.listeningPlay.addEventListener('click', () => {
    refreshListeningDay();
    const phrase = currentListeningPhrase();
    if (phrase) playListening(phrase);
  });
  elements.listeningForm.addEventListener('submit', submitListening);
  elements.listeningNotSure.addEventListener('click', (event) => { submitListening(event, true); markListening(false); });
  elements.listeningMarks.forEach((button) => button.addEventListener('click', () => markListening(button.dataset.listeningMark === 'got')));
  elements.listeningNext.addEventListener('click', () => {
    if (refreshListeningDay()) return;
    const session = getListeningSession();
    if (!session.showGradedAnswer) return;
    session.showGradedAnswer = false;
    saveState();
    stopListeningAudio();
    renderListening();
    if (session.answers.length === LISTENING_SIZE) elements.listeningRestart.focus();
    else elements.listeningPlay.focus();
  });
  elements.listeningRestart.addEventListener('click', () => {
    stopListeningAudio();
    const session = getListeningSession();
    session.answers = [];
    session.showGradedAnswer = false;
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
    state = { usedWords: [], wrongAnswers: [], lastKatakanaGrade: null, listeningSession: null, usedListeningPhrases: [], listeningReview: [], listeningCompletedDays: [], days: {}, currentQuestion: null };
    setView('quest');
    renderReview();
    renderQuestion();
    renderListening();
  });

  if (state.lastKatakanaGrade?.showResult) { state.lastKatakanaGrade.showResult = false; state.currentQuestion = null; saveState(); }
  if (state.listeningSession?.showGradedAnswer) { state.listeningSession.showGradedAnswer = false; saveState(); }
  if (window.location?.hash === '#calendar') setView('calendar');
  renderReview();
  renderQuestion();
  renderListening();
  window.addEventListener('storage', refreshCalendar);
  window.addEventListener('focus', refreshCalendar);
  window.addEventListener('kanji:progress', refreshCalendar);
  window.addEventListener('gacha:calendar', () => {
    setView('calendar');
    requestAnimationFrame(() => {
      const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      document.querySelector('#gacha-collection').scrollIntoView?.({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      document.querySelector('#gacha-title').focus({ preventScroll: true });
    });
  });
  window.addEventListener('focus', refreshDailyPractice);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refreshDailyPractice();
  });
  window.setInterval(refreshDailyPractice, 60 * 1000);
})();
