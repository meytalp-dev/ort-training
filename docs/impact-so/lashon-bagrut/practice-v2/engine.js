/* ================================================================
   תרגול חכם · לשון 70% · v2
   מערכת תרגול דיפרנציאלית עם מנוע התאמת רמה ותובנות AI
   ================================================================ */

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyLwo3jrseEDJ4GLnVNCzoJTRJBK_IAkJE0IiGGcx18buwJQ0XSRgOcJ2FmbMtA5ojU/exec';
const STORAGE_KEY = 'lashonPracticeV2';

const $ = (id) => document.getElementById(id);
const escapeHtml = (str) => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function showToast(msg, isError) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.toggle('toast-error', !!isError);
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2400);
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ================================================================
   APP — orchestration, navigation, session state
   ================================================================ */
const App = {
  state: {
    student: { name: '', class: '' },
    index: null,
    currentTopic: null,
    currentBank: null,
  },

  async init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.name) $('nameInput').value = data.name;
        if (data.class) $('classInput').value = data.class;
      } catch (e) {}
    }

    try {
      const res = await fetch('banks/_index.json');
      this.state.index = await res.json();
    } catch (e) {
      showToast('שגיאה בטעינת מערכת התרגול', true);
    }
  },

  startSession() {
    const name = $('nameInput').value.trim();
    const cls = $('classInput').value.trim();
    let valid = true;

    $('nameError').classList.toggle('show', !name);
    $('classError').classList.toggle('show', !cls);
    if (!name || !cls) return;

    this.state.student = { name, class: cls };
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, class: cls }));

    $('topbarUser').innerHTML = `<span class="user-chip">${escapeHtml(name)} · ${escapeHtml(cls)}</span><button class="btn-icon" onclick="App.signOut()">החלפת משתמש</button>`;

    this.renderTopics();
    showScreen('screenTopics');
  },

  signOut() {
    this.state.student = { name: '', class: '' };
    $('topbarUser').innerHTML = '';
    showScreen('screenWelcome');
  },

  renderTopics() {
    const idx = this.state.index;
    if (!idx) return;

    // Full exam button
    $('fullExamSection').innerHTML = `
      <div class="topic-grid" style="margin-bottom:14px">
        <a class="topic-card" style="border-color:var(--purple);background:linear-gradient(135deg,#fff,var(--purple-l));grid-column:1/-1" onclick="App.startFullExam();return false;">
          <div class="topic-card-head">
            <div>
              <div class="topic-card-title">📝 ${escapeHtml(idx.fullExam.label)}</div>
              <div class="topic-card-desc" style="margin-top:6px">${escapeHtml(idx.fullExam.description)}</div>
            </div>
            <div class="topic-card-icon" style="background:linear-gradient(135deg,var(--purple),var(--pink))">בג</div>
          </div>
          <div class="topic-card-meta">
            <span class="topic-pill topic-pill-bagrut">בגרות מלאה</span>
            <span class="topic-pill">${idx.fullExam.examFormat.totalQuestions} שאלות</span>
            <span class="topic-pill">${idx.fullExam.examFormat.timeMinutes} דק'</span>
          </div>
        </a>
      </div>`;

    // Categories
    const html = idx.categories.map(cat => {
      const cards = cat.topics.map(topic => {
        const isAvailable = topic.status === 'draft' || topic.status === 'active';
        const statusLabel = topic.status === 'soon' ? 'בקרוב' : (topic.status === 'active' ? 'זמין' : 'תרגול חי');
        const statusClass = topic.status === 'soon' ? 'topic-pill-soon' : 'topic-pill-active';
        return `
          <a class="topic-card" ${isAvailable ? `onclick="App.startTopic('${topic.id}', '${topic.bank}');return false;"` : 'style="opacity:.55;cursor:not-allowed"'}>
            <div class="topic-card-head">
              <div>
                <div class="topic-card-title">${escapeHtml(topic.label)}</div>
              </div>
              <div class="topic-card-icon" style="background:${cat.color}">${getCategoryInitial(cat.id)}</div>
            </div>
            <div class="topic-card-meta">
              <span class="topic-pill ${statusClass}">${statusLabel}</span>
            </div>
          </a>`;
      }).join('');

      return `
        <div class="section-head">
          <h3 style="color:${cat.color}">${escapeHtml(cat.label)}</h3>
        </div>
        <p class="lead" style="font-size:.88rem;margin:0 4px 8px">${escapeHtml(cat.description)}</p>
        <div class="topic-grid">${cards}</div>
      `;
    }).join('');

    $('topicsContainer').innerHTML = html;
  },

  async loadBank(bankFile) {
    try {
      const res = await fetch(`banks/${bankFile}`);
      if (!res.ok) throw new Error('bank not found');
      return await res.json();
    } catch (e) {
      showToast(`בנק השאלות ${bankFile} עדיין לא הוכן`, true);
      return null;
    }
  },

  async startTopic(topicId, bankFile) {
    const bank = await this.loadBank(bankFile);
    if (!bank) return;
    if (!bank.questions || bank.questions.length === 0) {
      showToast('בנק שאלות ריק לנושא הזה', true);
      return;
    }
    this.state.currentTopic = topicId;
    this.state.currentBank = bank;
    Practice.start(bank);
  },

  async startFullExam() {
    const bank = await this.loadBank(this.state.index.fullExam.bank);
    if (!bank) return;
    this.state.currentTopic = 'full-exam';
    this.state.currentBank = bank;
    Exam.start(bank);
  },

  goTopics() {
    this.renderTopics();
    showScreen('screenTopics');
  },

  confirmExitPractice() {
    if (confirm('לצאת מהתרגול? ההתקדמות שלך תאבד.')) {
      this.goTopics();
    }
  },
};

function getCategoryInitial(id) {
  const map = { 'gizrot':'גז','binyanim':'בנ','tezurat-hashem':'תצ','shoresh':'שר','speech-parts':'חד','hagiya':'הג' };
  return map[id] || '·';
}

/* ================================================================
   PRACTICE — adaptive engine for topic practice
   ================================================================ */
const Practice = {
  state: null,

  start(bank) {
    // Group questions by level, prepare adaptive queue
    const byLevel = { 1: [], 2: [], 3: [] };
    bank.questions.forEach(q => { byLevel[q.level || 1].push(q); });

    this.state = {
      bank,
      byLevel,
      currentLevel: 1,
      asked: new Set(),
      answeredList: [],
      currentQ: null,
      streak: 0,
      streakWrong: 0,
      hintsUsed: 0,
      questionsAskedAtLevel: { 1: 0, 2: 0, 3: 0 },
      correctAtLevel: { 1: 0, 2: 0, 3: 0 },
      maxQuestions: Math.min(bank.questions.length, 12),
      hintShown: false,
      answered: false,
      skillStats: {}, // skillTag -> {correct, total}
    };

    $('practiceTopic').textContent = bank.topicLabel;
    $('practiceSub').textContent = bank.subtopics ? bank.subtopics.map(s => s.label).join(' · ') : '';

    // Show teaching once
    this.renderTeaching();

    showScreen('screenPractice');
    this.nextQuestion();
  },

  renderTeaching() {
    const t = this.state.bank.lesson;
    if (!t) { $('teachingArea').innerHTML = ''; return; }
    let html = `<div class="teaching">
      <div class="teaching-title">📚 ${escapeHtml(t.title)}</div>
      <p>${t.intro || ''}</p>`;
    if (t.rules && t.rules.length) {
      html += '<ul>' + t.rules.map(r => `<li>${r}</li>`).join('') + '</ul>';
    }
    if (t.examples && t.examples.length) {
      html += `<div class="example"><strong>דוגמאות:</strong><br>` +
        t.examples.map(ex => {
          if (typeof ex === 'string') return ex;
          return `<strong>${ex.word}</strong> → שורש: ${ex.shoresh || '—'} · משקל: ${ex.mishkal || '—'}${ex.meaning ? ' · ' + ex.meaning : ''}`;
        }).join('<br>') + `</div>`;
    }
    if (t.warning) {
      html += `<div class="warning">${t.warning}</div>`;
    }
    html += `</div>`;
    $('teachingArea').innerHTML = html;
  },

  pickNextQuestion() {
    const s = this.state;
    const pool = s.byLevel[s.currentLevel].filter(q => !s.asked.has(q.id));
    if (pool.length > 0) {
      return pool[Math.floor(Math.random() * pool.length)];
    }
    // No more questions at this level — try adjacent levels
    for (const lvl of [s.currentLevel - 1, s.currentLevel + 1, 1, 2, 3]) {
      if (lvl < 1 || lvl > 3) continue;
      const alt = s.byLevel[lvl].filter(q => !s.asked.has(q.id));
      if (alt.length > 0) return alt[Math.floor(Math.random() * alt.length)];
    }
    return null;
  },

  nextQuestion() {
    const s = this.state;
    if (s.answeredList.length >= s.maxQuestions) {
      this.finish();
      return;
    }

    const q = this.pickNextQuestion();
    if (!q) {
      this.finish();
      return;
    }

    s.currentQ = q;
    s.asked.add(q.id);
    s.hintShown = false;
    s.answered = false;
    s.questionsAskedAtLevel[s.currentLevel]++;
    this.render(q);
  },

  render(q) {
    const s = this.state;
    const total = s.maxQuestions;
    const current = s.answeredList.length + 1;
    $('progFill').style.width = (current / total * 100) + '%';
    $('progText').textContent = `שאלה ${current} מתוך ${total}`;

    // Stats
    $('streakPill').textContent = `רצף: ${s.streak}`;
    $('levelPill').textContent = `רמה: ${s.currentLevel}`;
    $('levelPill').className = `stat-pill stat-level-${s.currentLevel}`;

    // Tags
    const tags = [];
    if (q.source === 'bagrut') {
      const meta = q.bagrutMeta || {};
      tags.push(`<span class="q-tag tag-bagrut">⭐ בגרות${meta.year ? ' · ' + meta.year : ''}${meta.moed ? ' · ' + meta.moed : ''}</span>`);
    } else {
      tags.push(`<span class="q-tag tag-ours">תרגול שלנו</span>`);
    }
    tags.push(`<span class="q-tag tag-level">רמה ${q.level || 1}</span>`);
    $('qTags').innerHTML = tags.join('');

    // Context
    $('qContext').innerHTML = q.context ? `<div class="q-context">${q.context}</div>` : '';

    // Question text
    $('qText').innerHTML = q.question || '';

    // Body — options or input
    const body = $('qBody');
    body.innerHTML = '';

    if (q.type === 'open_text') {
      body.innerHTML = `<input type="text" class="q-input" id="openInput" placeholder="כתבי את התשובה כאן..." autocomplete="off">`;
      $('submitBtn').style.display = 'block';
      $('submitBtn').disabled = false;
      setTimeout(() => $('openInput').focus(), 100);
      $('openInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.submitAnswer();
      });
    } else {
      const letters = ['א', 'ב', 'ג', 'ד'];
      const opts = q.options || [];
      const html = opts.map((opt, i) => `
        <button class="opt-btn" data-i="${i}" onclick="Practice.selectOption(${i})">
          <span class="opt-letter">${letters[i] || (i+1)}</span>
          <span>${opt}</span>
        </button>`).join('');
      body.innerHTML = `<div class="options" id="optionsList">${html}</div>`;
      $('submitBtn').style.display = 'none';
    }

    // Reset UI
    $('hintBox').classList.remove('show');
    $('hintBox').textContent = '';
    $('feedbackBox').classList.remove('show', 'correct-fb', 'wrong-fb');
    $('feedbackBox').innerHTML = '';
    $('nextBtn').style.display = 'none';
    $('hintBtn').disabled = false;
    $('hintBtn').style.display = q.hint ? 'inline-block' : 'none';
  },

  showHint() {
    const q = this.state.currentQ;
    if (!q || this.state.answered || this.state.hintShown) return;
    this.state.hintShown = true;
    this.state.hintsUsed++;
    $('hintBox').textContent = q.hint || 'אין רמז זמין לשאלה זו.';
    $('hintBox').classList.add('show');
    $('hintBtn').disabled = true;
  },

  selectOption(i) {
    if (this.state.answered) return;
    const q = this.state.currentQ;
    const isCorrect = (i === q.correctIndex);
    this.recordAnswer(isCorrect, i);
  },

  submitAnswer() {
    if (this.state.answered) return;
    const q = this.state.currentQ;
    const input = $('openInput');
    if (!input) return;
    const value = input.value.trim();
    if (!value) {
      showToast('כתבי תשובה תחילה', true);
      return;
    }
    // Loose match: any expected keyword
    const expected = q.expectedKeywords || [q.expectedAnswer || ''];
    const norm = (s) => s.replace(/[.,;'"\s־-]/g, '').toLowerCase();
    const userN = norm(value);
    const isCorrect = expected.some(k => k && (norm(k) === userN || userN.includes(norm(k)) || norm(k).includes(userN)));
    this.recordAnswer(isCorrect, value);
  },

  recordAnswer(isCorrect, response) {
    const s = this.state;
    const q = s.currentQ;
    s.answered = true;

    // Record
    s.answeredList.push({
      qid: q.id,
      level: q.level || 1,
      source: q.source,
      isCorrect,
      hintUsed: s.hintShown,
      skillTags: q.skillTags || [],
      bagrutMeta: q.bagrutMeta || null,
    });

    // Track skills
    (q.skillTags || []).forEach(tag => {
      if (!s.skillStats[tag]) s.skillStats[tag] = { correct: 0, total: 0 };
      s.skillStats[tag].total++;
      if (isCorrect) s.skillStats[tag].correct++;
    });

    if (isCorrect) {
      s.correctAtLevel[s.currentLevel]++;
      s.streak++;
      s.streakWrong = 0;
    } else {
      s.streak = 0;
      s.streakWrong++;
    }

    // Visual feedback on options
    if (q.type !== 'open_text') {
      document.querySelectorAll('.opt-btn').forEach(b => {
        b.classList.add('disabled');
        const i = parseInt(b.dataset.i);
        if (i === q.correctIndex) b.classList.add('correct');
        if (i === response && !isCorrect) b.classList.add('wrong');
      });
    } else {
      const input = $('openInput');
      input.disabled = true;
      input.style.borderColor = isCorrect ? 'var(--green)' : 'var(--secondary)';
      input.style.background = isCorrect ? 'var(--green-l)' : 'var(--sec-l)';
      $('submitBtn').style.display = 'none';
    }

    // Feedback box
    const fb = $('feedbackBox');
    fb.classList.add('show', isCorrect ? 'correct-fb' : 'wrong-fb');
    let html = `<div class="fb-title">${isCorrect ? '✅ מצוין!' : '❌ לא נכון'}${s.hintShown && isCorrect ? ' (עם רמז)' : ''}</div>`;
    if (q.teaching) {
      html += `<div class="fb-teaching"><strong>${escapeHtml(q.teaching.title || '')}</strong><br>${q.teaching.text || ''}${q.teaching.example ? '<br><em>' + q.teaching.example + '</em>' : ''}</div>`;
    }
    if (q.solution) {
      html += `<div class="fb-solution"><strong>פתרון:</strong> ${q.solution}</div>`;
    }
    fb.innerHTML = html;

    $('hintBtn').style.display = 'none';
    $('nextBtn').style.display = 'block';
    $('nextBtn').textContent = (s.answeredList.length >= s.maxQuestions) ? 'סיום וצפייה בתוצאות ←' : 'שאלה הבאה ←';

    // Adaptive difficulty
    this.adjustLevel();
  },

  adjustLevel() {
    const s = this.state;
    // Level up after 2 correct in a row at current level
    if (s.streak >= 2 && s.currentLevel < 3) {
      s.currentLevel++;
      s.streak = 0;
      this.celebrateLevelUp();
    }
    // Level down after 2 wrong in a row
    else if (s.streakWrong >= 2 && s.currentLevel > 1) {
      s.currentLevel--;
      s.streakWrong = 0;
      showToast(`חוזרים לרמה ${s.currentLevel} — נחזק לפני שנעלה שוב`);
    }
  },

  celebrateLevelUp() {
    const lvl = this.state.currentLevel;
    const messages = {
      2: 'השאלות הבאות יהיו קצת יותר מאתגרות',
      3: 'הגעת לרמת בגרות מתקדמת — כל הכבוד!',
    };
    $('levelUpText').textContent = messages[lvl] || 'ממשיכים!';
    $('levelUp').classList.add('show');
    setTimeout(() => $('levelUp').classList.remove('show'), 1800);
  },

  next() {
    this.nextQuestion();
  },

  finish() {
    Results.show(this.state, 'topic');
  },
};

/* ================================================================
   EXAM — full Bagrut mode (no hints, feedback at end)
   ================================================================ */
const Exam = {
  state: null,

  start(bank) {
    const questions = [...bank.questions];
    // Optionally shuffle
    if (bank.examMode && bank.examMode.shuffleOptions) {
      // Don't shuffle options because correctIndex relies on them
    }

    this.state = {
      bank,
      questions,
      currentIdx: 0,
      answers: [], // per question: {selectedIndex, value}
      startTime: Date.now(),
      timerInterval: null,
      timeLimit: (bank.examMode && bank.examMode.timeLimit) || 3600,
    };

    // Start timer
    this.state.timerInterval = setInterval(() => this.updateTimer(), 1000);
    this.updateTimer();

    showScreen('screenExam');
    this.renderQuestion();
  },

  updateTimer() {
    const elapsed = Math.floor((Date.now() - this.state.startTime) / 1000);
    const remaining = Math.max(0, this.state.timeLimit - elapsed);
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    $('examTimer').textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    if (remaining === 0) {
      clearInterval(this.state.timerInterval);
      showToast('הזמן נגמר — מסיימים ושולחים', false);
      this.finish();
    }
  },

  renderQuestion() {
    const s = this.state;
    const q = s.questions[s.currentIdx];
    const total = s.questions.length;
    const current = s.currentIdx + 1;
    $('examProgFill').style.width = (current / total * 100) + '%';
    $('examProgText').textContent = `שאלה ${current} מתוך ${total}`;

    const tags = [`<span class="q-tag tag-bagrut">⭐ בגרות${q.bagrutMeta && q.bagrutMeta.year ? ' · ' + q.bagrutMeta.year : ''}${q.bagrutMeta && q.bagrutMeta.questionNum ? ' · שאלה ' + q.bagrutMeta.questionNum : ''}</span>`];
    $('examQTags').innerHTML = tags.join('');

    $('examQText').innerHTML = q.question;

    const body = $('examQBody');
    body.innerHTML = '';

    const saved = s.answers[s.currentIdx];

    if (q.type === 'open_text') {
      body.innerHTML = `<input type="text" class="q-input" id="examOpenInput" placeholder="כתבי תשובה..." autocomplete="off" value="${saved ? escapeHtml(saved.value || '') : ''}">`;
      setTimeout(() => $('examOpenInput').focus(), 100);
    } else {
      const letters = ['א', 'ב', 'ג', 'ד'];
      const opts = q.options || [];
      const html = opts.map((opt, i) => {
        const isSelected = saved && saved.selectedIndex === i;
        return `
          <button class="opt-btn${isSelected ? ' selected' : ''}" data-i="${i}" onclick="Exam.select(${i})">
            <span class="opt-letter">${letters[i] || (i+1)}</span>
            <span>${opt}</span>
          </button>`;
      }).join('');
      body.innerHTML = `<div class="options">${html}</div>`;
    }

    $('examNextBtn').textContent = (s.currentIdx === total - 1) ? 'סיום וצפייה בתוצאות ←' : 'שאלה הבאה ←';
  },

  select(i) {
    const s = this.state;
    s.answers[s.currentIdx] = { selectedIndex: i };
    document.querySelectorAll('#examQBody .opt-btn').forEach(b => b.classList.remove('selected'));
    document.querySelector(`#examQBody .opt-btn[data-i="${i}"]`).classList.add('selected');
  },

  saveOpen() {
    const input = $('examOpenInput');
    if (input) {
      this.state.answers[this.state.currentIdx] = { value: input.value.trim() };
    }
  },

  next() {
    const s = this.state;
    this.saveOpen();
    if (s.currentIdx < s.questions.length - 1) {
      s.currentIdx++;
      this.renderQuestion();
    } else {
      this.finish();
    }
  },

  finish() {
    const s = this.state;
    if (s.timerInterval) clearInterval(s.timerInterval);

    // Score
    const skillStats = {};
    const answeredList = [];
    s.questions.forEach((q, idx) => {
      const a = s.answers[idx];
      let isCorrect = false;
      if (q.type === 'open_text') {
        const expected = q.expectedKeywords || [q.expectedAnswer || ''];
        const norm = (str) => String(str || '').replace(/[.,;'"\s־-]/g, '').toLowerCase();
        const userN = a ? norm(a.value) : '';
        isCorrect = userN && expected.some(k => k && norm(k) === userN);
      } else {
        isCorrect = a && a.selectedIndex === q.correctIndex;
      }
      answeredList.push({
        qid: q.id,
        level: q.level || 2,
        source: q.source,
        isCorrect: !!isCorrect,
        hintUsed: false,
        skillTags: q.skillTags || [],
        bagrutMeta: q.bagrutMeta || null,
      });
      (q.skillTags || []).forEach(tag => {
        if (!skillStats[tag]) skillStats[tag] = { correct: 0, total: 0 };
        skillStats[tag].total++;
        if (isCorrect) skillStats[tag].correct++;
      });
    });

    const fakeState = {
      bank: s.bank,
      answeredList,
      skillStats,
      hintsUsed: 0,
      currentLevel: 2,
      maxQuestions: s.questions.length,
    };
    Results.show(fakeState, 'exam');
  },
};

/* ================================================================
   RESULTS — scoring, AI insights, send to teacher
   ================================================================ */
const Results = {
  state: null,
  mode: null,

  show(practiceState, mode) {
    this.state = practiceState;
    this.mode = mode;

    const answers = practiceState.answeredList;
    const total = answers.length;
    const correct = answers.filter(a => a.isCorrect).length;
    const correctNoHint = answers.filter(a => a.isCorrect && !a.hintUsed).length;
    const correctWithHint = answers.filter(a => a.isCorrect && a.hintUsed).length;
    const score = total > 0 ? Math.round((correctNoHint * 100 + correctWithHint * 50) / total) : 0;

    $('rScore').textContent = score;
    $('rCorrect').textContent = correct;
    $('rTotal').textContent = total;
    $('rLevel').textContent = practiceState.currentLevel || 1;

    // Score message
    let msg = '';
    if (score >= 85) msg = '🌟 ציון מעולה! יש לך שליטה מצוינת בחומר.';
    else if (score >= 70) msg = '💪 כל הכבוד! המשך לתרגל ותגיע לציון גבוה יותר.';
    else if (score >= 50) msg = '📖 יש מה לשפר. סקור את ההסברים ותרגל שוב.';
    else msg = '💫 צריך עוד עבודה. אל תוותר — חזור על החומר ונסה שוב!';
    $('rMsg').textContent = msg;

    // AI Insights
    const insights = this.generateInsights(practiceState);
    $('insightsList').innerHTML = insights.map(i => `
      <div class="insight-item ${i.type}">
        <strong>${i.title}:</strong> ${i.text}
      </div>`).join('');

    // Store for sending
    window._results = {
      score,
      total,
      correct,
      correctNoHint,
      correctWithHint,
      hintsUsed: practiceState.hintsUsed || 0,
      level: practiceState.currentLevel || 1,
      mode,
      topicLabel: practiceState.bank.topicLabel,
      topicId: practiceState.bank.topicId,
      insights,
      skillStats: practiceState.skillStats || {},
      answeredList: answers,
    };

    showScreen('screenResults');
    $('sendBtn').disabled = false;
    $('sendBtn').textContent = '📨 שליחת תוצאות למורה';
    $('sendStatus').classList.remove('show', 'success', 'error');
  },

  generateInsights(state) {
    const insights = [];
    const skills = state.skillStats || {};
    const answers = state.answeredList;

    // Weak skills (< 50% correct, at least 2 questions)
    Object.entries(skills).forEach(([tag, stats]) => {
      if (stats.total >= 2) {
        const pct = stats.correct / stats.total;
        const label = SKILL_LABELS[tag] || tag;
        if (pct < 0.5) {
          insights.push({
            type: 'weak',
            title: 'דורש חיזוק',
            text: `${label} — ${stats.correct}/${stats.total} נכון. כדאי לתרגל את הנושא הזה שוב.`,
          });
        } else if (pct === 1 && stats.total >= 2) {
          insights.push({
            type: 'strong',
            title: 'נושא חזק',
            text: `${label} — ${stats.correct}/${stats.total} נכון. שליטה מצוינת.`,
          });
        }
      }
    });

    // Performance on Bagrut questions vs ours
    const bagrutAns = answers.filter(a => a.source === 'bagrut');
    const oursAns = answers.filter(a => a.source === 'ours');
    if (bagrutAns.length >= 2) {
      const bPct = bagrutAns.filter(a => a.isCorrect).length / bagrutAns.length;
      if (bPct < 0.5) {
        insights.push({
          type: 'weak',
          title: 'שאלות בגרות',
          text: `${Math.round(bPct*100)}% נכון מתוך ${bagrutAns.length} שאלות בגרות אמיתיות. כדאי לתרגל שאלות בגרות נוספות.`,
        });
      } else if (bPct >= 0.8 && bagrutAns.length >= 3) {
        insights.push({
          type: 'strong',
          title: 'מוכן לבגרות',
          text: `${Math.round(bPct*100)}% נכון בשאלות בגרות. רמת מוכנות גבוהה.`,
        });
      }
    }

    // Hint usage
    const hintsUsed = answers.filter(a => a.hintUsed).length;
    if (hintsUsed >= Math.ceil(answers.length / 2)) {
      insights.push({
        type: 'weak',
        title: 'שימוש ברמזים',
        text: `השתמשת ברמזים ב-${hintsUsed} מתוך ${answers.length} שאלות. נסה לפתור ללא רמזים בפעם הבאה.`,
      });
    }

    // Level reached
    if (state.currentLevel === 3) {
      insights.push({
        type: 'strong',
        title: 'התקדמות',
        text: 'הגעת לרמה מתקדמת (רמה 3) — שאלות בקושי בגרות. המשך כך.',
      });
    } else if (state.currentLevel === 1 && answers.length >= 5) {
      insights.push({
        type: 'weak',
        title: 'התקדמות',
        text: 'נשארת ברמה הבסיסית. כדאי לחזק את היסודות לפני המעבר לרמה גבוהה.',
      });
    }

    if (insights.length === 0) {
      insights.push({
        type: 'neutral',
        title: 'התקדמות יציבה',
        text: 'ביצוע יציב. המשך לתרגל בכל הנושאים לקראת הבגרות.',
      });
    }

    return insights;
  },

  send() {
    const r = window._results;
    if (!r) return;

    const btn = $('sendBtn');
    const status = $('sendStatus');
    btn.disabled = true;
    btn.textContent = 'שולח...';

    const insightsText = r.insights.map(i => `${i.title}: ${i.text}`).join(' | ');
    const skillsText = Object.entries(r.skillStats)
      .map(([tag, s]) => `${SKILL_LABELS[tag] || tag}: ${s.correct}/${s.total}`)
      .join(' | ');

    const params = new URLSearchParams({
      action: 'submit',
      quizName: `${r.mode === 'exam' ? 'בגרות מלאה' : 'תרגול נושא'} — ${r.topicLabel}`,
      studentName: App.state.student.name,
      classroom: App.state.student.class,
      score: r.score,
      totalQuestions: r.total,
      correctAnswers: r.correct,
      hintsUsed: r.hintsUsed,
      level: r.mode === 'exam' ? 'בגרות' : ('רמה ' + r.level),
      teacherEmail: 'meytalp@bethaarava.ort.org.il',
      insights: insightsText.slice(0, 1000),
      skillStats: skillsText.slice(0, 500),
      topicId: r.topicId,
      mode: r.mode,
    });

    const cb = 'cb_' + Date.now();
    window[cb] = () => {
      status.classList.add('show', 'success');
      status.textContent = '✅ התוצאות נשלחו בהצלחה למורה!';
      btn.textContent = '✅ נשלח';
      delete window[cb];
    };
    const s = document.createElement('script');
    s.src = APPS_SCRIPT_URL + '?' + params.toString() + '&callback=' + cb;
    s.onerror = () => {
      status.classList.add('show', 'error');
      status.textContent = '❌ שגיאה בשליחה — אנא נסי שוב.';
      btn.disabled = false;
      btn.textContent = '📨 ניסיון נוסף';
    };
    document.body.appendChild(s);

    // Fallback success after 4 seconds (Apps Script JSONP often doesn't callback)
    setTimeout(() => {
      if (!status.classList.contains('show')) {
        status.classList.add('show', 'success');
        status.textContent = '✅ התוצאות נשלחו למורה!';
        btn.textContent = '✅ נשלח';
      }
    }, 4000);
  },
};

/* ================================================================
   SKILL_LABELS — Hebrew names for skill tags
   ================================================================ */
const SKILL_LABELS = {
  'zihui-shoresh': 'זיהוי שורש',
  'zihui-mishkal': 'זיהוי משקל',
  'mashma-mishkal': 'משמעות המשקל',
  'zihui-gizra': 'זיהוי גזרה',
  'binyan-shlemim': 'בניינים בשלמים',
  'kal-nifal': 'קל ונפעל',
  'piel-pual-hitpael': 'פיעל / פועל / התפעל',
  'hifil-hofal': 'הפעיל / הופעל',
  'gufim-zmanim': 'גופים וזמנים',
  'tezurat-hashem': 'תצורת השם',
  'helhem': 'הלחם בסיסים',
  'laaz': 'שאילה מלעז',
  'merubaim': 'פעלים מרובעים',
  'shlemim': 'גזרת השלמים',
  'nala': 'גזרת נל"א/נלי"ה',
  'naoy': 'גזרת נעו"י',
  'kfulim': 'גזרת כפולים (ע"ע)',
  'guttural': 'אותיות גרון',
  'tricky': 'מקרים מורכבים',
  'advanced': 'רמה מתקדמת',
  'ayin-doubled': 'גזרת ע"ע',
  'all-binyanim': 'הבניינים — סקירה',
};

/* ================================================================
   BOOT
   ================================================================ */
window.App = App;
window.Practice = Practice;
window.Exam = Exam;
window.Results = Results;

document.addEventListener('DOMContentLoaded', () => {
  App.init();

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if ($('screenPractice').classList.contains('active')) {
      if (!Practice.state || Practice.state.answered) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const next = $('nextBtn');
          if (next && next.style.display !== 'none') Practice.next();
        }
        return;
      }
      const q = Practice.state.currentQ;
      if (q && q.type !== 'open_text') {
        if (e.key === '1' || e.key === 'א') Practice.selectOption(0);
        if (e.key === '2' || e.key === 'ב') Practice.selectOption(1);
        if (e.key === '3' || e.key === 'ג') Practice.selectOption(2);
        if (e.key === '4' || e.key === 'ד') Practice.selectOption(3);
      }
      if (e.key.toLowerCase() === 'h' || e.key === 'ר') Practice.showHint();
    }
  });
});
