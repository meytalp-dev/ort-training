/**
 * Vocabulary Activity — Spaced Retrieval of lexical chunks.
 *
 * Flow (per session): 4 chunks × 3-stage drill = ~4 minutes
 *   Stage 1: Recognition — show chunk in English, pick the Hebrew gloss.
 *   Stage 2: Recall — show Hebrew gloss, type the missing chunk word.
 *   Stage 3: Use — fill the chunk into a sentence.
 *
 * Per pedagogy: chunks > isolated words. Lexical Approach.
 */

(function () {
  'use strict';

  const CHUNKS_PER_SESSION = 4;

  function VocabularyActivity(container, allChunks, onComplete) {
    this.container = container;
    this.chunks = pickRandom(allChunks, CHUNKS_PER_SESSION);
    this.onComplete = onComplete;
    this.idx = 0;
    this.stage = 0; // 0 = recognition, 1 = recall, 2 = use
    this.correctCount = 0;
    this.totalAnswered = 0;
  }

  VocabularyActivity.prototype.render = function () {
    if (this.idx >= this.chunks.length) {
      this.finish();
      return;
    }
    const chunk = this.chunks[this.idx];
    if (this.stage === 0) this.renderRecognition(chunk);
    else if (this.stage === 1) this.renderRecall(chunk);
    else this.renderUse(chunk);
  };

  VocabularyActivity.prototype.renderRecognition = function (chunk) {
    const distractors = this.chunks
      .filter(c => c.id !== chunk.id)
      .map(c => c.gloss);
    const options = shuffle([chunk.gloss, ...distractors.slice(0, 3)]);
    const correctIdx = options.indexOf(chunk.gloss);

    this.container.innerHTML = `
      <div class="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <div class="text-xs uppercase tracking-wider text-lead-600 font-semibold mb-3">Vocabulary · ביטוי ${this.idx + 1}/${this.chunks.length}</div>
        <h2 class="text-lg font-semibold mb-1">מה הפירוש?</h2>
        <div class="english-text text-3xl font-bold text-gray-900 my-6 text-center">${chunk.chunk}</div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3" id="vocab-options"></div>
      </div>
    `;
    const optsEl = this.container.querySelector('#vocab-options');
    options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'p-4 rounded-xl border-2 border-gray-200 hover:border-lead-400 hover:bg-lead-50 transition text-start';
      btn.textContent = opt;
      btn.onclick = () => this.handleRecognitionAnswer(btn, i, correctIdx, chunk);
      optsEl.appendChild(btn);
    });
  };

  VocabularyActivity.prototype.handleRecognitionAnswer = function (btn, i, correctIdx, chunk) {
    const buttons = this.container.querySelectorAll('#vocab-options button');
    buttons.forEach(b => { b.disabled = true; b.classList.remove('hover:border-lead-400', 'hover:bg-lead-50'); });

    const isCorrect = i === correctIdx;
    if (isCorrect) {
      btn.className = 'p-4 rounded-xl border-2 border-create-500 bg-create-50 text-create-800 font-semibold text-start';
      this.correctCount++;
    } else {
      btn.className = 'p-4 rounded-xl border-2 border-red-400 bg-red-50 text-red-800 text-start';
      buttons[correctIdx].className = 'p-4 rounded-xl border-2 border-create-500 bg-create-50 text-create-800 font-semibold text-start';
    }
    this.totalAnswered++;
    this.appendExampleAndContinue(chunk);
  };

  VocabularyActivity.prototype.renderRecall = function (chunk) {
    const blank = chunk.chunk.split(' ').slice(-1)[0]; // last word as blank
    const stem = chunk.chunk.split(' ').slice(0, -1).join(' ');
    this._currentBlank = blank;

    this.container.innerHTML = `
      <div class="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <div class="text-xs uppercase tracking-wider text-lead-600 font-semibold mb-3">Vocabulary · השלמה</div>
        <h2 class="text-lg font-semibold mb-1">השלם.י את החסר</h2>
        <p class="text-sm text-gray-600 mb-4">פירוש: <span class="font-semibold">${chunk.gloss}</span></p>
        <div class="english-text text-2xl font-bold text-gray-900 my-6 text-center">
          ${stem} <input type="text" id="vocab-recall-input" class="english-text inline-block w-32 px-3 py-1 border-b-2 border-lead-400 focus:outline-none focus:border-lead-600 text-center font-bold" autocapitalize="off" autocomplete="off" />
        </div>
        <button id="vocab-recall-submit" class="w-full bg-lead-600 hover:bg-lead-700 text-white py-3 rounded-xl font-semibold transition">בדוק.י</button>
      </div>
    `;
    const input = this.container.querySelector('#vocab-recall-input');
    const submit = this.container.querySelector('#vocab-recall-submit');
    input.focus();
    const onSubmit = () => this.handleRecallAnswer(input.value, blank, chunk);
    submit.onclick = onSubmit;
    input.addEventListener('keydown', e => { if (e.key === 'Enter') onSubmit(); });
  };

  VocabularyActivity.prototype.handleRecallAnswer = function (value, expected, chunk) {
    const normalized = (value || '').trim().toLowerCase();
    const isCorrect = normalized === expected.toLowerCase();
    const input = this.container.querySelector('#vocab-recall-input');
    const submit = this.container.querySelector('#vocab-recall-submit');
    input.disabled = true;
    submit.disabled = true;
    submit.classList.add('opacity-50');

    if (isCorrect) {
      input.classList.add('border-create-600', 'text-create-700');
      this.correctCount++;
    } else {
      input.classList.add('border-red-500', 'text-red-700');
      const hint = document.createElement('div');
      hint.className = 'mt-2 text-sm text-gray-600 text-center';
      hint.innerHTML = 'המילה הנכונה: <span class="english-text font-bold text-create-700">' + escapeHtml(expected) + '</span>';
      input.parentElement.appendChild(hint);
    }
    this.totalAnswered++;
    this.appendExampleAndContinue(chunk);
  };

  VocabularyActivity.prototype.renderUse = function (chunk) {
    // Build a fill-in-the-blank from the example sentence.
    const targetWords = chunk.chunk.toLowerCase().split(' ');
    const exampleWords = chunk.example.split(' ');
    const masked = exampleWords.map(w => {
      const lower = w.toLowerCase().replace(/[.,!?]/g, '');
      return targetWords.includes(lower) ? '___' : w;
    }).join(' ');

    this.container.innerHTML = `
      <div class="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <div class="text-xs uppercase tracking-wider text-lead-600 font-semibold mb-3">Vocabulary · שימוש בהקשר</div>
        <h2 class="text-lg font-semibold mb-1">השתמש.י בביטוי במשפט</h2>
        <p class="text-sm text-gray-600 mb-4">הביטוי: <span class="english-text font-bold">${chunk.chunk}</span> · ${chunk.gloss}</p>
        <div class="english-text text-xl text-gray-900 my-4 p-4 bg-lead-50 rounded-xl">${masked}</div>
        <input type="text" id="vocab-use-input" class="english-text w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-lead-500" placeholder="כתוב.י את המשפט המלא" autocapitalize="off" autocomplete="off" />
        <button id="vocab-use-submit" class="mt-3 w-full bg-lead-600 hover:bg-lead-700 text-white py-3 rounded-xl font-semibold transition">שלח.י</button>
      </div>
    `;
    const input = this.container.querySelector('#vocab-use-input');
    const submit = this.container.querySelector('#vocab-use-submit');
    input.focus();
    const onSubmit = () => this.handleUseAnswer(input.value, chunk);
    submit.onclick = onSubmit;
    input.addEventListener('keydown', e => { if (e.key === 'Enter') onSubmit(); });
  };

  VocabularyActivity.prototype.handleUseAnswer = function (value, chunk) {
    const normalized = (value || '').toLowerCase();
    const isCorrect = chunk.chunk.toLowerCase().split(' ').every(w => normalized.includes(w));
    const input = this.container.querySelector('#vocab-use-input');
    const submit = this.container.querySelector('#vocab-use-submit');
    input.disabled = true;
    submit.disabled = true;

    const feedback = document.createElement('div');
    feedback.className = 'mt-3 p-3 rounded-xl text-sm';
    if (isCorrect) {
      feedback.className += ' bg-create-50 text-create-800';
      feedback.innerHTML = '✓ יפה! השתמשת בביטוי. דוגמה מקורית: <span class="english-text">' + escapeHtml(chunk.example) + '</span>';
      this.correctCount++;
    } else {
      feedback.className += ' bg-amber-50 text-amber-800';
      feedback.innerHTML = 'הביטוי לא הופיע במלואו. דוגמה: <span class="english-text">' + escapeHtml(chunk.example) + '</span>';
    }
    this.totalAnswered++;
    input.parentElement.appendChild(feedback);
    this.appendContinue();
  };

  VocabularyActivity.prototype.appendExampleAndContinue = function (chunk) {
    const card = this.container.querySelector('.bg-white');
    const ex = document.createElement('div');
    ex.className = 'mt-4 p-3 bg-gray-50 rounded-xl text-sm text-gray-700';
    ex.innerHTML = 'דוגמה: <span class="english-text">' + escapeHtml(chunk.example) + '</span>';
    card.appendChild(ex);
    this.appendContinue();
  };

  VocabularyActivity.prototype.appendContinue = function () {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = '<button class="w-full bg-gradient-to-r from-lead-600 to-dream-600 hover:from-lead-700 hover:to-dream-700 text-white py-3 rounded-xl font-semibold transition">המשך</button>';
    const btn = wrapper.firstElementChild;
    btn.onclick = () => this.next();
    this.container.appendChild(wrapper);
  };

  VocabularyActivity.prototype.next = function () {
    this.stage++;
    if (this.stage > 2) {
      this.stage = 0;
      this.idx++;
    }
    this.render();
  };

  VocabularyActivity.prototype.finish = function () {
    const correct = this.totalAnswered > 0 && this.correctCount / this.totalAnswered >= 0.6;
    const learned = this.chunks.map(c => c.chunk + ' · ' + c.gloss).join('; ');
    this.onComplete({
      isCorrect: correct,
      response: { correct: this.correctCount, total: this.totalAnswered, chunks: this.chunks.map(c => c.id) },
      summary: 'למדתי ' + this.chunks.length + ' ביטויים: ' + learned,
    });
  };

  // ===== utils =====

  function pickRandom(arr, n) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, n);
  }

  function shuffle(arr) {
    return pickRandom(arr, arr.length);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  window.VocabularyActivity = VocabularyActivity;
})();
