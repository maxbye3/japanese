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

  const STORAGE_KEY = 'katakana-quest-progress-v1';
  const QUEST_SIZE = 10;
  const today = dateKey(new Date());
  let calendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  let state = loadState();

  const elements = {
    questView: document.querySelector('#quest-view'),
    calendarView: document.querySelector('#calendar-view'),
    tabs: [...document.querySelectorAll('[data-view]')],
    todayLabel: document.querySelector('#today-label'),
    correctCount: document.querySelector('#correct-count'),
    wordsUsed: document.querySelector('#words-used'),
    progressFill: document.querySelector('#progress-fill'),
    practiceCard: document.querySelector('#practice-card'),
    kanaWord: document.querySelector('#kana-word'),
    answerForm: document.querySelector('#answer-form'),
    answerInput: document.querySelector('#answer-input'),
    submitAnswer: document.querySelector('#submit-answer'),
    feedback: document.querySelector('#feedback'),
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
        days: saved.days && typeof saved.days === 'object' ? saved.days : {},
        currentQuestion: saved.currentQuestion && typeof saved.currentQuestion === 'object' ? saved.currentQuestion : null,
      };
    } catch {
      return { usedWords: [], days: {}, currentQuestion: null };
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
    const isQuest = view === 'quest';
    elements.questView.hidden = !isQuest;
    elements.calendarView.hidden = isQuest;
    elements.tabs.forEach((tab) => {
      const active = tab.dataset.view === view;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    if (!isQuest) renderCalendar();
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

  function renderQuestion() {
    const day = getToday();
    renderStats();
    if (day.completed) {
      setView('calendar');
      return;
    }
    let word = currentWord();
    if (!word) word = chooseQuestion();
    if (!word) {
      elements.practiceCard.innerHTML = '<div class="feedback"><strong>You reached the end of the word bank.</strong><span>Every available word has been used.</span></div>';
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
    elements.feedback.hidden = false;
    elements.feedback.className = `feedback${correct ? '' : ' is-wrong'}`;
    elements.feedback.innerHTML = correct
      ? '<strong>Nice one.</strong><span>That word is safely logged.</span>'
      : `<strong>Not quite.</strong><span>The answer was <strong>${word.english}</strong> — it won’t come back.</span>`;
    elements.answerInput.disabled = true;
    elements.submitAnswer.disabled = false;
    elements.submitAnswer.textContent = 'Next word  →';
  }

  function completeToday() {
    getToday().completed = true;
    state.currentQuestion = null;
    saveState();
    renderStats();
    elements.feedback.hidden = false;
    elements.feedback.className = 'feedback';
    elements.feedback.innerHTML = '<strong>Quest complete ✦</strong><span>Your calendar has been stamped.</span>';
    elements.answerInput.disabled = true;
    elements.submitAnswer.disabled = true;
    window.setTimeout(() => setView('calendar'), 900);
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
  elements.backToQuest.addEventListener('click', () => setView('quest'));
  elements.previousMonth.addEventListener('click', () => { calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1); renderCalendar(); });
  elements.nextMonth.addEventListener('click', () => { calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1); renderCalendar(); });
  elements.resetProgress.addEventListener('click', () => {
    if (!window.confirm('Reset all words and calendar stamps on this device?')) return;
    localStorage.removeItem(STORAGE_KEY);
    state = { usedWords: [], days: {}, currentQuestion: null };
    setView('quest');
    renderQuestion();
  });

  renderQuestion();
})();
