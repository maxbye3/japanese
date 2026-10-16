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
  ];

  const STORAGE_KEY = 'katakana-quest-progress-v1';
  const QUEST_SIZE = 10;
  const today = dateKey(new Date());
  let calendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  let state = loadState();
  let listeningAttempt = null;
  let activeUtterance = null;

  const elements = {
    questView: document.querySelector('#quest-view'),
    listeningView: document.querySelector('#listening-view'),
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
    listeningPlay: document.querySelector('#listening-play'),
    audioStatus: document.querySelector('#audio-status'),
    listeningForm: document.querySelector('#listening-form'),
    listeningInput: document.querySelector('#listening-input'),
    listeningFeedback: document.querySelector('#listening-feedback'),
    listeningMeaning: document.querySelector('#listening-meaning'),
    listeningAttempt: document.querySelector('#listening-attempt'),
    listeningMarks: [...document.querySelectorAll('[data-listening-mark]')],
    listeningDone: document.querySelector('#listening-done'),
    listeningSummary: document.querySelector('#listening-summary'),
    listeningRestart: document.querySelector('#listening-restart'),
    listeningReviewCount: document.querySelector('#listening-review-count'),
    listeningReviewEmpty: document.querySelector('#listening-review-empty'),
    listeningReviewList: document.querySelector('#listening-review-list'),
    navStampCount: document.querySelector('#nav-stamp-count'),
    completedDays: document.querySelector('#completed-days'),
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
        listeningAnswers: Array.isArray(saved.listeningAnswers) ? saved.listeningAnswers : [],
        listeningReview: Array.isArray(saved.listeningReview) ? saved.listeningReview : [],
        days: saved.days && typeof saved.days === 'object' ? saved.days : {},
        currentQuestion: saved.currentQuestion && typeof saved.currentQuestion === 'object' ? saved.currentQuestion : null,
      };
    } catch {
      return { usedWords: [], wrongAnswers: [], listeningAnswers: [], listeningReview: [], days: {}, currentQuestion: null };
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
    elements.calendarView.hidden = view !== 'calendar';
    elements.tabs.forEach((tab) => {
      const active = tab.dataset.view === view;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    if (view !== 'listening') stopListeningAudio();
    if (view === 'calendar') renderCalendar();
  }

  function renderStats() {
    const day = getToday();
    const completed = Object.values(state.days).filter((item) => item && item.completed).length;
    elements.todayLabel.textContent = formatToday();
    elements.correctCount.textContent = String(day.correct);
    elements.progressFill.style.width = `${Math.min(day.correct / QUEST_SIZE, 1) * 100}%`;
    elements.wordsUsed.textContent = `${state.usedWords.length} word${state.usedWords.length === 1 ? '' : 's'} used`;
    elements.navStampCount.textContent = String(completed);
    elements.completedDays.textContent = String(completed);
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
    const count = Math.min(state.listeningAnswers.length, PHRASES.length);
    const done = count === PHRASES.length;
    elements.listeningCount.textContent = String(count);
    elements.listeningProgress.style.width = `${count / PHRASES.length * 100}%`;
    elements.listeningStep.textContent = done ? 'Complete' : `Phrase ${count + 1} of ${PHRASES.length}`;
    elements.listeningPrompt.hidden = done;
    elements.listeningForm.hidden = done;
    elements.listeningFeedback.hidden = true;
    elements.listeningDone.hidden = !done;
    elements.audioStatus.hidden = true;
    elements.listeningInput.value = '';
    if (done) {
      const understood = state.listeningAnswers.filter((answer) => answer && answer.gotIt).length;
      elements.listeningSummary.textContent = `You marked ${understood} of ${PHRASES.length} as understood. Replay any saved phrases below.`;
    }
    renderListeningReview();
  }

  function submitListening(event) {
    event.preventDefault();
    const phrase = PHRASES[state.listeningAnswers.length];
    if (!phrase) return;
    listeningAttempt = elements.listeningInput.value.trim();
    if (!listeningAttempt) {
      elements.listeningInput.focus();
      return;
    }
    elements.listeningForm.hidden = true;
    elements.listeningMeaning.textContent = phrase.meaning;
    elements.listeningAttempt.textContent = listeningAttempt;
    elements.listeningFeedback.hidden = false;
  }

  function markListening(gotIt) {
    if (listeningAttempt === null) return;
    const phrase = PHRASES[state.listeningAnswers.length];
    if (!phrase) return;
    state.listeningAnswers.push({ id: phrase.id, translation: listeningAttempt, gotIt });
    state.listeningReview = state.listeningReview.filter((answer) => answer && answer.id !== phrase.id);
    if (!gotIt) state.listeningReview.push({ id: phrase.id, translation: listeningAttempt });
    listeningAttempt = null;
    saveState();
    stopListeningAudio();
    renderListening();
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
    requestAnimationFrame(() => elements.answerInput.focus());
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
    elements.monthLabel.textContent = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(calendarMonth);
    elements.calendarGrid.innerHTML = '';
    const firstDay = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const previousMonthDays = new Date(year, month, 0).getDate();
    for (let index = 0; index < 42; index += 1) {
      const dayNumber = index - startOffset + 1;
      const cellDate = new Date(year, month, dayNumber);
      const cell = document.createElement('div');
      cell.className = 'day-cell';
      cell.setAttribute('role', 'gridcell');
      if (dayNumber < 1) {
        cell.classList.add('is-outside');
        cell.innerHTML = `<span class="day-number">${previousMonthDays + dayNumber}</span>`;
      } else if (dayNumber > daysInMonth) {
        cell.classList.add('is-outside');
        cell.innerHTML = `<span class="day-number">${dayNumber - daysInMonth}</span>`;
      } else {
        const key = dateKey(cellDate);
        if (key === today) cell.classList.add('is-today');
        const stamped = state.days[key] && state.days[key].completed;
        cell.setAttribute('aria-label', `${cellDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}${stamped ? ', quest complete' : ''}`);
        cell.innerHTML = `<span class="day-number">${dayNumber}</span>${stamped ? '<span class="day-stamp" aria-hidden="true">✦</span>' : ''}`;
      }
      elements.calendarGrid.appendChild(cell);
    }
  }

  elements.answerForm.addEventListener('submit', submitAnswer);
  elements.tabs.forEach((tab) => tab.addEventListener('click', () => setView(tab.dataset.view)));
  elements.listeningPlay.addEventListener('click', () => {
    const phrase = PHRASES[state.listeningAnswers.length];
    if (phrase) playListening(phrase);
  });
  elements.listeningForm.addEventListener('submit', submitListening);
  elements.listeningMarks.forEach((button) => button.addEventListener('click', () => markListening(button.dataset.listeningMark === 'got')));
  elements.listeningRestart.addEventListener('click', () => {
    stopListeningAudio();
    state.listeningAnswers = [];
    listeningAttempt = null;
    saveState();
    renderListening();
  });
  elements.backToQuest.addEventListener('click', () => setView('quest'));
  elements.previousMonth.addEventListener('click', () => { calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1); renderCalendar(); });
  elements.nextMonth.addEventListener('click', () => { calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1); renderCalendar(); });
  elements.resetProgress.addEventListener('click', () => {
    if (!window.confirm('Reset all words, listening practice, and calendar stamps on this device?')) return;
    localStorage.removeItem(STORAGE_KEY);
    stopListeningAudio();
    listeningAttempt = null;
    state = { usedWords: [], wrongAnswers: [], listeningAnswers: [], listeningReview: [], days: {}, currentQuestion: null };
    setView('quest');
    renderReview();
    renderQuestion();
    renderListening();
  });

  renderReview();
  renderQuestion();
  renderListening();
})();
