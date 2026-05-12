/* ================================================================
   מסע הצורות · לשון 70% · v2
   Adaptive practice engine with Hebrew letter streak,
   journey map progress, bagrut seal, and journey certificate.
   ================================================================ */

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyLwo3jrseEDJ4GLnVNCzoJTRJBK_IAkJE0IiGGcx18buwJQ0XSRgOcJ2FmbMtA5ojU/exec';
const STORAGE_KEY = 'lashonPracticeV2';
const HEB_LETTERS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י'];

const $ = (id) => document.getElementById(id);
const escapeHtml = (str) => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function showToast(msg, isError) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.toggle('error', !!isError);
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2400);
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ================================================================
   APP — orchestration & navigation
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
      showToast('שגיאה בטעינת המערכת', true);
    }
  },

  startSession() {
    const name = $('nameInput').value.trim();
    const cls = $('classInput').value.trim();
    $('nameError').classList.toggle('show', !name);
    $('classError').classList.toggle('show', !cls);
    if (!name || !cls) return;

    this.state.student = { name, class: cls };
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, class: cls }));
    $('topbarUser').innerHTML = `<span class="user-tag">${escapeHtml(name)}</span><button class="btn-icon" onclick="App.signOut()">החלפת משתמש</button>`;

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

    // ===== Exam cards (4 options) =====
    const exams = idx.exams || [];
    $('examGrid').innerHTML = exams.map(ex => {
      const sealClass = ex.badgeType === 'real' ? 'seal-real' : (ex.badgeType === 'focused' ? 'seal-focused' : 'seal-practice');
      const sealLines = ex.badge.split(' ');
      return `
        <a class="exam-card" onclick="App.startExam('${ex.id}', '${ex.bank}');return false;">
          <div class="seal ${sealClass}">${sealLines.map(s => `<div>${escapeHtml(s)}</div>`).join('')}</div>
          <h3>${escapeHtml(ex.label)}</h3>
          <div class="sublabel">${escapeHtml(ex.fullLabel || '')}</div>
          <div class="desc">${escapeHtml(ex.description || '')}</div>
          <div class="meta">
            <span>${ex.questionCount} שאלות</span>
            <span>·</span>
            <span>${ex.timeMinutes} דקות</span>
          </div>
        </a>`;
    }).join('');

    // ===== Topic categories =====
    const html = idx.categories.map((cat, idx_) => {
      const letter = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז'][idx_] || '·';
      const cards = cat.topics.map(topic => {
        const isAvailable = topic.status === 'draft' || topic.status === 'active';
        const statusLabel = topic.status === 'soon' ? 'בקרוב' : 'תרגול חי';
        return `
          <a class="topic-card ${isAvailable ? '' : 'disabled'}" ${isAvailable ? `onclick="App.startTopic('${topic.id}', '${topic.bank}');return false;"` : ''}>
            <div class="topic-card-title">${escapeHtml(topic.label)}</div>
            <div class="topic-card-status ${topic.status === 'soon' ? 'soon' : 'active'}">${statusLabel}</div>
          </a>`;
      }).join('');
      return `
        <div class="category-block">
          <div class="category-label">
            <span class="category-letter">${letter}</span>
            <span class="category-name">${escapeHtml(cat.label)}</span>
          </div>
          <p class="category-desc">${escapeHtml(cat.description)}</p>
          <div class="topic-grid">${cards}</div>
        </div>`;
    }).join('');
    $('topicsContainer').innerHTML = html;
  },

  async loadBank(bankFile) {
    try {
      const res = await fetch(`banks/${bankFile}`);
      if (!res.ok) throw new Error('not found');
      return await res.json();
    } catch (e) {
      showToast(`בנק ${bankFile} לא נמצא`, true);
      return null;
    }
  },

  async startTopic(topicId, bankFile) {
    const bank = await this.loadBank(bankFile);
    if (!bank || !bank.questions || !bank.questions.length) {
      showToast('בנק שאלות ריק', true);
      return;
    }
    this.state.currentTopic = topicId;
    this.state.currentBank = bank;
    Practice.start(bank);
  },

  async startExam(examId, bankFile) {
    const bank = await this.loadBank(bankFile);
    if (!bank) return;
    this.state.currentTopic = examId;
    this.state.currentBank = bank;
    Exam.start(bank);
  },

  goTopics() {
    this.renderTopics();
    showScreen('screenTopics');
  },

  confirmExitPractice() {
    if (confirm('לצאת מהתרגול? ההתקדמות תאבד.')) this.goTopics();
  },
};

/* ================================================================
   STREAK CHAIN — Hebrew letters animate as streak grows
   ================================================================ */
function renderStreakChain(streakCount) {
  const max = 5; // show up to 5 letters
  const arr = [];
  for (let i = 0; i < max; i++) {
    const lit = i < streakCount;
    arr.push(`<span class="streak-chain-letter ${lit ? 'lit' : ''}">${HEB_LETTERS[i]}</span>`);
  }
  return arr.join('');
}

function renderLevelDots(currentLevel) {
  for (let i = 1; i <= 3; i++) {
    const el = $('lvl' + i);
    el.classList.remove('filled', 'current');
    if (i < currentLevel) el.classList.add('filled');
    if (i === currentLevel) el.classList.add('current');
  }
}

function renderJourneyMap(containerId, answered, total, currentIdx, bagrutFlags) {
  const c = $(containerId);
  if (!c) return;
  const parts = [];
  for (let i = 0; i < total; i++) {
    let cls = 'journey-station';
    if (i < answered) {
      cls += ' passed';
      if (bagrutFlags && bagrutFlags[i]) cls += ' bagrut';
    }
    if (i === currentIdx) cls += ' current';
    parts.push(`<span class="${cls}"></span>`);
    if (i < total - 1) {
      parts.push(`<span class="journey-connector ${i < answered ? 'passed' : ''}"></span>`);
    }
  }
  c.innerHTML = parts.join('');
}

function bagrutSealSVG(meta) {
  const year = (meta && meta.year) || '';
  const moed = (meta && meta.moed) || '';
  return `
    <div class="bagrut-seal">
      <svg class="bagrut-seal-svg" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="36"/>
        <circle cx="40" cy="40" r="31"/>
        <text x="40" y="30" text-anchor="middle" font-size="8">בגרות</text>
        <text x="40" y="46" text-anchor="middle" font-size="10">${escapeHtml(year)}</text>
        <text x="40" y="58" text-anchor="middle" font-size="7">${escapeHtml(moed)}</text>
      </svg>
    </div>`;
}

/* ================================================================
   PRACTICE — adaptive engine
   ================================================================ */
const Practice = {
  state: null,

  start(bank) {
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
      maxQuestions: Math.min(bank.questions.length, 12),
      hintShown: false,
      answered: false,
      skillStats: {},
    };

    $('practiceTopic').textContent = bank.topicLabel;
    $('practiceSub').textContent = bank.subtopics ? bank.subtopics.map(s => s.label).join(' · ') : '';
    $('journeyHeading').textContent = bank.topicLabel;
    this.renderTeaching();
    showScreen('screenPractice');
    this.nextQuestion();
  },

  renderTeaching() {
    const t = this.state.bank.lesson;
    if (!t) { $('teachingArea').innerHTML = ''; return; }
    let html = `<div class="teaching-paper"><h4>${escapeHtml(t.title)}</h4>`;
    if (t.intro) html += `<p>${t.intro}</p>`;
    if (t.rules && t.rules.length) html += '<ul>' + t.rules.map(r => `<li>${r}</li>`).join('') + '</ul>';
    if (t.examples && t.examples.length) {
      html += `<div class="examples">` +
        t.examples.map(ex => typeof ex === 'string' ? ex : `<strong>${ex.word}</strong> → שורש: ${ex.shoresh || '—'} · משקל: ${ex.mishkal || '—'}${ex.meaning ? ' · ' + ex.meaning : ''}`).join('<br>') +
        `</div>`;
    }
    if (t.warning) html += `<div class="warning">${t.warning}</div>`;
    html += `</div>`;
    $('teachingArea').innerHTML = html;
  },

  pickNextQuestion() {
    const s = this.state;
    const pool = s.byLevel[s.currentLevel].filter(q => !s.asked.has(q.id));
    if (pool.length > 0) return pool[Math.floor(Math.random() * pool.length)];
    for (const lvl of [s.currentLevel - 1, s.currentLevel + 1, 1, 2, 3]) {
      if (lvl < 1 || lvl > 3) continue;
      const alt = s.byLevel[lvl].filter(q => !s.asked.has(q.id));
      if (alt.length > 0) return alt[Math.floor(Math.random() * alt.length)];
    }
    return null;
  },

  nextQuestion() {
    const s = this.state;
    if (s.answeredList.length >= s.maxQuestions) { this.finish(); return; }
    const q = this.pickNextQuestion();
    if (!q) { this.finish(); return; }
    s.currentQ = q;
    s.asked.add(q.id);
    s.hintShown = false;
    s.answered = false;
    this.render(q);
  },

  render(q) {
    const s = this.state;
    const total = s.maxQuestions;
    const current = s.answeredList.length;

    // Streak chain
    $('streakChain').innerHTML = renderStreakChain(s.streak);
    renderLevelDots(s.currentLevel);

    // Journey map
    const bagrutFlags = s.answeredList.map(a => a.source === 'bagrut');
    renderJourneyMap('journeyStations', current, total, current, bagrutFlags);
    $('progText').textContent = `שאלה ${current + 1} מתוך ${total}`;

    // Bagrut seal
    if (q.source === 'bagrut') {
      $('bagrutSealArea').innerHTML = bagrutSealSVG(q.bagrutMeta);
    } else {
      $('bagrutSealArea').innerHTML = '';
    }

    // Tags
    const tags = [];
    if (q.source === 'bagrut') {
      tags.push(`<span class="q-tag bagrut-tag">בגרות אמיתית</span>`);
    } else {
      tags.push(`<span class="q-tag ours">תרגול שלנו</span>`);
    }
    tags.push(`<span class="q-tag level">רמה ${q.level || 1}</span>`);
    $('qTags').innerHTML = tags.join('');

    $('qContext').innerHTML = q.context ? `<div class="q-context">${q.context}</div>` : '';
    $('qText').innerHTML = q.question || '';

    // Body
    const body = $('qBody');
    body.innerHTML = '';
    if (q.type === 'open_text') {
      body.innerHTML = `<input type="text" class="q-input" id="openInput" placeholder="כתבי את התשובה...">`;
      $('submitBtn').style.display = 'inline-flex';
      setTimeout(() => $('openInput').focus(), 100);
      $('openInput').addEventListener('keydown', e => { if (e.key === 'Enter') this.submitAnswer(); });
    } else {
      const letters = ['א', 'ב', 'ג', 'ד', 'ה'];
      body.innerHTML = `<div class="options">${(q.options || []).map((opt, i) => `
        <button class="opt" data-i="${i}" onclick="Practice.selectOption(${i})">
          <span class="opt-letter">${letters[i] || (i+1)}</span>
          <span>${opt}</span>
        </button>`).join('')}</div>`;
      $('submitBtn').style.display = 'none';
    }

    $('hintBox').classList.remove('show');
    $('hintBox').textContent = '';
    $('feedbackBox').classList.remove('show', 'correct-fb', 'wrong-fb');
    $('feedbackBox').innerHTML = '';
    $('nextBtn').style.display = 'none';
    $('hintBtn').disabled = false;
    $('hintBtn').style.display = q.hint ? 'inline-flex' : 'none';
  },

  showHint() {
    const s = this.state;
    if (!s || s.answered || s.hintShown) return;
    s.hintShown = true;
    s.hintsUsed++;
    $('hintBox').textContent = s.currentQ.hint || 'אין רמז';
    $('hintBox').classList.add('show');
    $('hintBtn').disabled = true;
  },

  selectOption(i) {
    if (this.state.answered) return;
    const q = this.state.currentQ;
    this.recordAnswer(i === q.correctIndex, i);
  },

  submitAnswer() {
    if (this.state.answered) return;
    const q = this.state.currentQ;
    const input = $('openInput');
    if (!input) return;
    const value = input.value.trim();
    if (!value) { showToast('כתבי תשובה תחילה', true); return; }
    const expected = q.expectedKeywords || [q.expectedAnswer || ''];
    const norm = (str) => str.replace(/[.,;'"\s־-]/g, '').toLowerCase();
    const userN = norm(value);
    const isCorrect = expected.some(k => k && (norm(k) === userN || userN.includes(norm(k)) || norm(k).includes(userN)));
    this.recordAnswer(isCorrect, value);
  },

  recordAnswer(isCorrect, response) {
    const s = this.state;
    const q = s.currentQ;
    s.answered = true;

    s.answeredList.push({
      qid: q.id,
      level: q.level || 1,
      source: q.source,
      isCorrect,
      hintUsed: s.hintShown,
      skillTags: q.skillTags || [],
      bagrutMeta: q.bagrutMeta || null,
    });

    (q.skillTags || []).forEach(tag => {
      if (!s.skillStats[tag]) s.skillStats[tag] = { correct: 0, total: 0 };
      s.skillStats[tag].total++;
      if (isCorrect) s.skillStats[tag].correct++;
    });

    if (isCorrect) { s.streak++; s.streakWrong = 0; }
    else { s.streak = 0; s.streakWrong++; }

    // Visual feedback
    if (q.type !== 'open_text') {
      document.querySelectorAll('.opt').forEach(b => {
        b.classList.add('disabled');
        const i = parseInt(b.dataset.i);
        if (i === q.correctIndex) b.classList.add('correct');
        if (i === response && !isCorrect) b.classList.add('wrong');
      });
    } else {
      const input = $('openInput');
      input.disabled = true;
      input.style.borderColor = isCorrect ? 'var(--sage)' : 'var(--crimson)';
      input.style.background = isCorrect ? 'var(--sage-soft)' : 'var(--crimson-soft)';
      $('submitBtn').style.display = 'none';
    }

    // Update streak chain
    $('streakChain').innerHTML = renderStreakChain(s.streak);

    // Feedback box
    const fb = $('feedbackBox');
    fb.classList.add('show', isCorrect ? 'correct-fb' : 'wrong-fb');
    let html = `<div class="fb-title">${isCorrect ? 'מצוין' : 'לא נכון'}${s.hintShown && isCorrect ? ' · עם רמז' : ''}</div>`;
    if (q.teaching) {
      html += `<div class="fb-teach"><strong>${escapeHtml(q.teaching.title || '')}</strong><br>${q.teaching.text || ''}${q.teaching.example ? '<br><em>' + q.teaching.example + '</em>' : ''}</div>`;
    }
    if (q.solution) html += `<div class="fb-solution"><strong>פתרון:</strong> ${q.solution}</div>`;
    fb.innerHTML = html;

    $('hintBtn').style.display = 'none';
    $('nextBtn').style.display = 'inline-flex';
    $('nextBtn').textContent = (s.answeredList.length >= s.maxQuestions) ? 'תעודת המסע' : 'המשך';

    this.adjustLevel();
  },

  adjustLevel() {
    const s = this.state;
    if (s.streak >= 2 && s.currentLevel < 3) {
      s.currentLevel++; s.streak = 0;
      $('streakChain').innerHTML = renderStreakChain(0);
      renderLevelDots(s.currentLevel);
      this.celebrateLevelUp();
    } else if (s.streakWrong >= 2 && s.currentLevel > 1) {
      s.currentLevel--; s.streakWrong = 0;
      renderLevelDots(s.currentLevel);
      showToast(`חוזרים לרמה ${s.currentLevel} — מחזקים יסודות`);
    }
  },

  celebrateLevelUp() {
    const lvl = this.state.currentLevel;
    const msgs = { 2: 'השאלות הבאות מאתגרות יותר', 3: 'הגעת לרמת בגרות — מצוין' };
    $('levelUpText').textContent = msgs[lvl] || 'ממשיכים במסע';
    $('levelUp').classList.add('show');
    setTimeout(() => $('levelUp').classList.remove('show'), 1800);
  },

  next() { this.nextQuestion(); },

  finish() { Results.show(this.state, 'topic'); },
};

/* ================================================================
   EXAM — full Bagrut mode with sections + hourglass
   ================================================================ */
const Exam = {
  state: null,

  start(bank) {
    this.state = {
      bank,
      questions: [...bank.questions],
      currentIdx: 0,
      answers: [],
      startTime: Date.now(),
      timerInterval: null,
      timeLimit: (bank.examMode && bank.examMode.timeLimit) || 3600,
    };

    $('examTitle').textContent = bank.topicLabel;
    $('examSubtitle').textContent = (bank.examMeta && bank.examMeta.fullLabel) || bank.instructions || '';

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

    // Animate hourglass sand based on progress
    const ratio = elapsed / this.state.timeLimit;
    const sandTop = $('sandTop');
    const sandBottom = $('sandBottom');
    if (sandTop && sandBottom) {
      // Top sand shrinks: clip path scales down
      const topScale = Math.max(0.05, 1 - ratio);
      sandTop.setAttribute('transform', `translate(14, 4) scale(1, ${topScale}) translate(-14, -4)`);
      // Bottom sand grows
      const botScale = Math.max(0.05, ratio);
      sandBottom.setAttribute('transform', `translate(14, 30) scale(1, ${botScale}) translate(-14, -30)`);
    }

    if (remaining === 0) {
      clearInterval(this.state.timerInterval);
      showToast('הזמן נגמר — מסיימים');
      this.finish();
    }
  },

  renderQuestion() {
    const s = this.state;
    const q = s.questions[s.currentIdx];
    const total = s.questions.length;
    const current = s.currentIdx;

    // Journey map
    const bagrutFlags = s.questions.map(_ => true);
    renderJourneyMap('examJourneyStations', current, total, current, bagrutFlags);
    $('examProgText').textContent = `שאלה ${current + 1} מתוך ${total}`;

    // Section banner — show when section changes
    const prevQ = current > 0 ? s.questions[current - 1] : null;
    const showBanner = !prevQ || prevQ.examSection !== q.examSection;
    if (showBanner && q.sectionLabel) {
      $('examSectionBanner').innerHTML = `
        <div class="section-banner">
          <span class="label">פרק חדש</span>
          <span class="name">${escapeHtml(q.sectionLabel)}</span>
        </div>`;
    } else {
      $('examSectionBanner').innerHTML = '';
    }

    // Bagrut seal
    $('examBagrutSeal').innerHTML = bagrutSealSVG(q.bagrutMeta);

    // Tags
    const tags = [];
    if (q.sectionLabel) tags.push(`<span class="q-tag section">${escapeHtml(q.sectionLabel)}</span>`);
    if (q.tag) tags.push(`<span class="q-tag">${escapeHtml(q.tag)}</span>`);
    $('examQTags').innerHTML = tags.join('');

    $('examQContext').innerHTML = q.context ? `<div class="q-context">${q.context}</div>` : '';
    $('examQText').innerHTML = q.question || '';

    const body = $('examQBody');
    body.innerHTML = '';
    const saved = s.answers[current];
    const letters = ['א', 'ב', 'ג', 'ד', 'ה'];
    if (q.type === 'open_text') {
      body.innerHTML = `<input type="text" class="q-input" id="examOpenInput" value="${saved ? escapeHtml(saved.value || '') : ''}">`;
      setTimeout(() => $('examOpenInput').focus(), 100);
    } else {
      body.innerHTML = `<div class="options">${(q.options || []).map((opt, i) => {
        const sel = saved && saved.selectedIndex === i ? 'selected' : '';
        return `<button class="opt ${sel}" data-i="${i}" onclick="Exam.select(${i})">
          <span class="opt-letter">${letters[i] || (i+1)}</span>
          <span>${opt}</span>
        </button>`;
      }).join('')}</div>`;
    }

    $('examNextBtn').textContent = (current === total - 1) ? 'סיום וצפייה בתעודה' : 'המשך';
  },

  select(i) {
    this.state.answers[this.state.currentIdx] = { selectedIndex: i };
    document.querySelectorAll('#examQBody .opt').forEach(b => b.classList.remove('selected'));
    const btn = document.querySelector(`#examQBody .opt[data-i="${i}"]`);
    if (btn) btn.classList.add('selected');
  },

  saveOpen() {
    const input = $('examOpenInput');
    if (input) this.state.answers[this.state.currentIdx] = { value: input.value.trim() };
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
        qid: q.id, level: q.level || 2, source: q.source,
        isCorrect: !!isCorrect, hintUsed: false,
        skillTags: q.skillTags || [], bagrutMeta: q.bagrutMeta || null,
        examSection: q.examSection,
      });
      (q.skillTags || []).forEach(tag => {
        if (!skillStats[tag]) skillStats[tag] = { correct: 0, total: 0 };
        skillStats[tag].total++;
        if (isCorrect) skillStats[tag].correct++;
      });
    });

    Results.show({
      bank: s.bank, answeredList, skillStats,
      hintsUsed: 0, currentLevel: 2, maxQuestions: s.questions.length,
    }, 'exam');
  },
};

/* ================================================================
   RESULTS — Journey certificate + insights + send to teacher
   ================================================================ */
const Results = {
  state: null, mode: null,

  show(practiceState, mode) {
    this.state = practiceState; this.mode = mode;
    const answers = practiceState.answeredList;
    const total = answers.length;
    const correct = answers.filter(a => a.isCorrect).length;
    const correctNoHint = answers.filter(a => a.isCorrect && !a.hintUsed).length;
    const correctWithHint = answers.filter(a => a.isCorrect && a.hintUsed).length;
    const score = total > 0 ? Math.round((correctNoHint * 100 + correctWithHint * 50) / total) : 0;

    $('certName').textContent = App.state.student.name;
    $('rScore').textContent = score;
    $('rCorrect').textContent = correct;
    $('rTotal').textContent = total;
    $('rLevel').textContent = practiceState.currentLevel || 1;

    let msg = '';
    if (score >= 85) msg = 'מסע מצוין! יש לך שליטה גבוהה בחומר. המשך כך, ותגיע מוכן לבגרות.';
    else if (score >= 70) msg = 'מסע יפה. נקודות חזקות לצד אזורים שצריכים חיזוק. סקור את התובנות.';
    else if (score >= 50) msg = 'דרך טובה התחלת. כדאי לחזור על הנושאים שסומנו כחלשים ולתרגל שוב.';
    else msg = 'הצעד הראשון הוא להבין את החומר. סקור את ההסברים ותרגל שוב — תגיע רחוק.';
    $('rMsg').textContent = msg;

    const insights = this.generateInsights(practiceState);
    $('insightsList').innerHTML = insights.map(i => `
      <div class="insight-row ${i.type}">
        <strong>${escapeHtml(i.title)}:</strong> ${escapeHtml(i.text)}
      </div>`).join('');

    window._results = {
      score, total, correct, correctNoHint, correctWithHint,
      hintsUsed: practiceState.hintsUsed || 0,
      level: practiceState.currentLevel || 1,
      mode, topicLabel: practiceState.bank.topicLabel,
      topicId: practiceState.bank.topicId,
      insights, skillStats: practiceState.skillStats || {},
      answeredList: answers,
    };

    showScreen('screenResults');
    $('sendBtn').disabled = false;
    $('sendBtn').textContent = 'שליחת התעודה למורה';
    $('sendStatus').classList.remove('show', 'success', 'error');
  },

  generateInsights(state) {
    const insights = [];
    const skills = state.skillStats || {};
    const answers = state.answeredList;

    Object.entries(skills).forEach(([tag, stats]) => {
      if (stats.total >= 2) {
        const pct = stats.correct / stats.total;
        const label = SKILL_LABELS[tag] || tag;
        if (pct < 0.5) insights.push({ type: 'weak', title: 'דורש חיזוק', text: `${label} — ${stats.correct} מתוך ${stats.total} נכון. כדאי לתרגל שוב.` });
        else if (pct === 1 && stats.total >= 2) insights.push({ type: 'strong', title: 'נושא חזק', text: `${label} — ${stats.correct} מתוך ${stats.total} נכון. שליטה מצוינת.` });
      }
    });

    // Per-section analysis for exams
    if (answers.some(a => a.examSection)) {
      const bySection = {};
      answers.forEach(a => {
        const sec = a.examSection || 'other';
        if (!bySection[sec]) bySection[sec] = { correct: 0, total: 0 };
        bySection[sec].total++;
        if (a.isCorrect) bySection[sec].correct++;
      });
      const secLabels = { reading: 'חלק א — הבנה והבעה', mispar: 'חלק ב — שם המספר', morphology: 'חלק ג — מערכת הצורות' };
      Object.entries(bySection).forEach(([sec, stats]) => {
        const pct = Math.round(stats.correct / stats.total * 100);
        const label = secLabels[sec] || sec;
        if (pct < 50) insights.push({ type: 'weak', title: label, text: `${pct}% — נושא לחיזוק.` });
        else if (pct >= 80) insights.push({ type: 'strong', title: label, text: `${pct}% — שליטה גבוהה.` });
      });
    }

    const bagrutAns = answers.filter(a => a.source === 'bagrut');
    if (bagrutAns.length >= 3) {
      const bPct = bagrutAns.filter(a => a.isCorrect).length / bagrutAns.length;
      if (bPct < 0.5) insights.push({ type: 'weak', title: 'שאלות בגרות', text: `${Math.round(bPct*100)}% נכון מתוך ${bagrutAns.length} שאלות בגרות אמיתיות.` });
      else if (bPct >= 0.8) insights.push({ type: 'strong', title: 'מוכן לבגרות', text: `${Math.round(bPct*100)}% נכון בשאלות בגרות. רמת מוכנות גבוהה.` });
    }

    if (state.currentLevel === 3) {
      insights.push({ type: 'strong', title: 'התקדמות', text: 'הגעת לרמה מתקדמת — שאלות ברמת בגרות.' });
    } else if (state.currentLevel === 1 && answers.length >= 5) {
      insights.push({ type: 'weak', title: 'התקדמות', text: 'נשארת ברמה הבסיסית. כדאי לחזק יסודות לפני המעבר.' });
    }

    if (insights.length === 0) {
      insights.push({ type: 'neutral', title: 'מסע יציב', text: 'ביצוע טוב. המשך לתרגל לקראת בגרות.' });
    }
    return insights;
  },

  send() {
    const r = window._results;
    if (!r) return;
    const btn = $('sendBtn'); const status = $('sendStatus');
    btn.disabled = true; btn.textContent = 'שולח...';

    const insightsText = r.insights.map(i => `${i.title}: ${i.text}`).join(' | ');
    const skillsText = Object.entries(r.skillStats).map(([tag, s]) => `${SKILL_LABELS[tag] || tag}: ${s.correct}/${s.total}`).join(' | ');

    const params = new URLSearchParams({
      action: 'submit',
      quizName: `${r.mode === 'exam' ? 'בגרות' : 'תרגול'} — ${r.topicLabel}`,
      studentName: App.state.student.name, classroom: App.state.student.class,
      score: r.score, totalQuestions: r.total, correctAnswers: r.correct,
      hintsUsed: r.hintsUsed, level: r.mode === 'exam' ? 'בגרות' : ('רמה ' + r.level),
      teacherEmail: 'meytalp@bethaarava.ort.org.il',
      insights: insightsText.slice(0, 1000), skillStats: skillsText.slice(0, 500),
      topicId: r.topicId, mode: r.mode,
    });

    const cb = 'cb_' + Date.now();
    window[cb] = () => {
      status.classList.add('show', 'success');
      status.textContent = 'התעודה נשלחה למורה';
      btn.textContent = 'נשלח';
      delete window[cb];
    };
    const s = document.createElement('script');
    s.src = APPS_SCRIPT_URL + '?' + params.toString() + '&callback=' + cb;
    s.onerror = () => {
      status.classList.add('show', 'error');
      status.textContent = 'שגיאה בשליחה — אנא נסי שוב';
      btn.disabled = false; btn.textContent = 'ניסיון נוסף';
    };
    document.body.appendChild(s);

    setTimeout(() => {
      if (!status.classList.contains('show')) {
        status.classList.add('show', 'success');
        status.textContent = 'התעודה נשלחה למורה';
        btn.textContent = 'נשלח';
      }
    }, 4000);
  },
};

/* ================================================================
   SKILL_LABELS
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
  'kfulim': 'גזרת כפולים',
  'guttural': 'אותיות גרון',
  'tricky': 'מקרים מורכבים',
  'advanced': 'רמה מתקדמת',
  'ayin-doubled': 'גזרת ע"ע',
  'all-binyanim': 'הבניינים',
};

window.App = App; window.Practice = Practice; window.Exam = Exam; window.Results = Results;

document.addEventListener('DOMContentLoaded', () => {
  App.init();
  document.addEventListener('keydown', e => {
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
    }
  });
});
