/**
 * Reading Activity — Read a short text and answer comprehension questions.
 *
 * Mix of literal + inferential questions per pedagogy.
 * Reading is ~75% of the test, but in a session we keep it tight: 1 text, 3 questions.
 */

(function () {
  'use strict';

  function ReadingActivity(container, content, onComplete) {
    this.container = container;
    this.content = content;
    this.onComplete = onComplete;
    this.qIdx = 0;
    this.correctCount = 0;
    this.responses = [];
  }

  ReadingActivity.prototype.render = function () {
    this.container.innerHTML = `
      <div class="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <div class="text-xs uppercase tracking-wider text-lead-600 font-semibold mb-3">Reading · ${this.content.cefr}</div>
        <h2 class="text-lg font-semibold mb-3">${escapeHtml(this.content.title)}</h2>
        <div class="english-text text-base leading-relaxed text-gray-800 bg-lead-50/40 rounded-xl p-4 mb-4">
          ${escapeHtml(this.content.text)}
        </div>
        <p class="text-xs text-gray-500 mb-4">קרא.י את הטקסט וענה.י על השאלות</p>
        <button id="reading-start-questions" class="w-full bg-gradient-to-r from-lead-600 to-dream-600 hover:from-lead-700 hover:to-dream-700 text-white py-3 rounded-xl font-semibold transition">המשך לשאלות</button>
      </div>
    `;
    this.container.querySelector('#reading-start-questions').onclick = () => this.renderQuestion();
  };

  ReadingActivity.prototype.renderQuestion = function () {
    const q = this.content.questions[this.qIdx];
    if (!q) {
      this.finish();
      return;
    }

    this.container.innerHTML = `
      <div class="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <div class="text-xs uppercase tracking-wider text-lead-600 font-semibold mb-3">Reading · שאלה ${this.qIdx + 1}/${this.content.questions.length}</div>
        <details class="mb-4 text-sm text-gray-600">
          <summary class="cursor-pointer hover:text-lead-700">📖 לקריאה חוזרת של הטקסט</summary>
          <div class="english-text mt-2 p-3 bg-gray-50 rounded-lg leading-relaxed">${escapeHtml(this.content.text)}</div>
        </details>
        <h3 class="english-text text-lg font-semibold mb-4">${escapeHtml(q.q)}</h3>
        <div class="space-y-2" id="reading-options"></div>
      </div>
    `;

    const optsEl = this.container.querySelector('#reading-options');
    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'w-full english-text p-4 rounded-xl border-2 border-gray-200 hover:border-lead-400 hover:bg-lead-50 transition text-start';
      btn.textContent = opt;
      btn.onclick = () => this.handleAnswer(btn, i, q);
      optsEl.appendChild(btn);
    });
  };

  ReadingActivity.prototype.handleAnswer = function (btn, i, q) {
    const buttons = this.container.querySelectorAll('#reading-options button');
    buttons.forEach(b => { b.disabled = true; b.classList.remove('hover:border-lead-400', 'hover:bg-lead-50'); });

    const isCorrect = i === q.correct;
    if (isCorrect) {
      btn.className = 'w-full english-text p-4 rounded-xl border-2 border-create-500 bg-create-50 text-create-800 font-semibold text-start';
      this.correctCount++;
    } else {
      btn.className = 'w-full english-text p-4 rounded-xl border-2 border-red-400 bg-red-50 text-red-800 text-start';
      buttons[q.correct].className = 'w-full english-text p-4 rounded-xl border-2 border-create-500 bg-create-50 text-create-800 font-semibold text-start';
    }

    this.responses.push({ qIdx: this.qIdx, type: q.type, isCorrect });

    const continueBtn = document.createElement('button');
    continueBtn.className = 'mt-4 w-full bg-gradient-to-r from-lead-600 to-dream-600 hover:from-lead-700 hover:to-dream-700 text-white py-3 rounded-xl font-semibold transition';
    continueBtn.textContent = this.qIdx < this.content.questions.length - 1 ? 'שאלה הבאה' : 'סיים.י';
    continueBtn.onclick = () => {
      this.qIdx++;
      this.renderQuestion();
    };
    this.container.querySelector('.bg-white').appendChild(continueBtn);
  };

  ReadingActivity.prototype.finish = function () {
    const ratio = this.correctCount / Math.max(this.content.questions.length, 1);
    this.onComplete({
      isCorrect: ratio >= 0.6,
      response: { correct: this.correctCount, total: this.content.questions.length, perQuestion: this.responses },
      summary: 'קראתי "' + this.content.title + '" וצדקתי ב-' + this.correctCount + '/' + this.content.questions.length + ' שאלות.',
    });
  };

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  window.ReadingActivity = ReadingActivity;
})();
