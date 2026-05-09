/**
 * Grammar Activity — Text-based grammar (not PPP).
 *
 * 3 stages:
 *   1. Notice — read short text with target form highlighted.
 *   2. Rule — short HE explanation.
 *   3. Apply — fill-in-the-blank tasks (with selective correction).
 *
 * Per pedagogy: grammar is taught through context, not in isolation.
 */

(function () {
  'use strict';

  function GrammarActivity(container, content, onComplete) {
    this.container = container;
    this.content = content;
    this.onComplete = onComplete;
    this.stage = 0; // 0 = notice, 1 = rule, 2 = apply
    this.taskIdx = 0;
    this.correctCount = 0;
  }

  GrammarActivity.prototype.render = function () {
    if (this.stage === 0) this.renderNotice();
    else if (this.stage === 1) this.renderRule();
    else this.renderApply();
  };

  GrammarActivity.prototype.renderNotice = function () {
    const text = this.content.noticeText.replace(/\{\{(.+?)\}\}/g, (_, w) =>
      '<span class="bg-dream-100 text-dream-800 px-1 rounded font-bold">' + escapeHtml(w) + '</span>'
    );
    this.container.innerHTML = `
      <div class="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <div class="text-xs uppercase tracking-wider text-lead-600 font-semibold mb-3">Grammar · שלב 1: הבחנה</div>
        <h2 class="text-lg font-semibold mb-1">${escapeHtml(this.content.focusHe)}</h2>
        <p class="text-sm text-gray-600 mb-4">קרא.י את הטקסט. שים.י לב לצורות המודגשות.</p>
        <div class="english-text text-base leading-relaxed bg-lead-50/40 rounded-xl p-4 mb-4">${text}</div>
        <button id="grammar-next" class="w-full bg-gradient-to-r from-lead-600 to-dream-600 hover:from-lead-700 hover:to-dream-700 text-white py-3 rounded-xl font-semibold transition">המשך</button>
      </div>
    `;
    this.container.querySelector('#grammar-next').onclick = () => {
      this.stage = 1;
      this.render();
    };
  };

  GrammarActivity.prototype.renderRule = function () {
    this.container.innerHTML = `
      <div class="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <div class="text-xs uppercase tracking-wider text-lead-600 font-semibold mb-3">Grammar · שלב 2: הכלל</div>
        <h2 class="text-lg font-semibold mb-3">${escapeHtml(this.content.focus)}</h2>
        <div class="bg-create-50 border border-create-200 rounded-xl p-5 mb-4">
          <p class="text-create-900 font-medium">${escapeHtml(this.content.noticeRule)}</p>
        </div>
        <div class="text-sm text-gray-600 mb-4">דוגמה: <span class="english-text font-bold">She <span class="text-dream-700">walks</span> to school.</span></div>
        <button id="grammar-to-apply" class="w-full bg-gradient-to-r from-lead-600 to-dream-600 hover:from-lead-700 hover:to-dream-700 text-white py-3 rounded-xl font-semibold transition">בוא.י לתרגל</button>
      </div>
    `;
    this.container.querySelector('#grammar-to-apply').onclick = () => {
      this.stage = 2;
      this.render();
    };
  };

  GrammarActivity.prototype.renderApply = function () {
    const task = this.content.applyTasks[this.taskIdx];
    if (!task) {
      this.finish();
      return;
    }

    const sentenceHtml = escapeHtml(task.sentence).replace('___',
      '<input type="text" id="grammar-input" class="english-text inline-block w-32 px-3 py-1 mx-1 border-b-2 border-lead-400 focus:outline-none focus:border-lead-600 text-center font-bold" autocapitalize="off" autocomplete="off" />');

    this.container.innerHTML = `
      <div class="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <div class="text-xs uppercase tracking-wider text-lead-600 font-semibold mb-3">Grammar · תרגיל ${this.taskIdx + 1}/${this.content.applyTasks.length}</div>
        <h2 class="text-lg font-semibold mb-4">השלם.י את המשפט</h2>
        <div class="english-text text-xl leading-relaxed text-gray-900 my-4 p-4 bg-lead-50 rounded-xl">${sentenceHtml}</div>
        <button id="grammar-submit" class="w-full bg-lead-600 hover:bg-lead-700 text-white py-3 rounded-xl font-semibold transition">בדוק.י</button>
      </div>
    `;
    const input = this.container.querySelector('#grammar-input');
    const submit = this.container.querySelector('#grammar-submit');
    input.focus();
    const onSubmit = () => this.handleApplyAnswer(input.value, task);
    submit.onclick = onSubmit;
    input.addEventListener('keydown', e => { if (e.key === 'Enter') onSubmit(); });
  };

  GrammarActivity.prototype.handleApplyAnswer = function (value, task) {
    const normalized = (value || '').trim().toLowerCase();
    const accept = (task.accept || [task.answer]).map(s => s.toLowerCase());
    const isCorrect = accept.includes(normalized);

    const input = this.container.querySelector('#grammar-input');
    const submit = this.container.querySelector('#grammar-submit');
    input.disabled = true;
    submit.disabled = true;
    submit.classList.add('opacity-50');

    if (isCorrect) {
      input.classList.add('border-create-600', 'text-create-700');
      this.correctCount++;
    } else {
      input.classList.add('border-red-500', 'text-red-700');
    }

    const feedback = document.createElement('div');
    feedback.className = 'mt-3 p-3 rounded-xl text-sm';
    if (isCorrect) {
      feedback.className += ' bg-create-50 text-create-800';
      feedback.textContent = '✓ נכון!';
    } else {
      feedback.className += ' bg-amber-50 text-amber-800';
      feedback.innerHTML = 'התשובה הנכונה: <span class="english-text font-bold">' + escapeHtml(task.answer) + '</span>';
    }

    const continueBtn = document.createElement('button');
    continueBtn.className = 'mt-3 w-full bg-gradient-to-r from-lead-600 to-dream-600 hover:from-lead-700 hover:to-dream-700 text-white py-3 rounded-xl font-semibold transition';
    continueBtn.textContent = this.taskIdx < this.content.applyTasks.length - 1 ? 'תרגיל הבא' : 'סיים.י';
    continueBtn.onclick = () => {
      this.taskIdx++;
      this.render();
    };

    const card = this.container.querySelector('.bg-white');
    card.appendChild(feedback);
    card.appendChild(continueBtn);
  };

  GrammarActivity.prototype.finish = function () {
    const ratio = this.correctCount / Math.max(this.content.applyTasks.length, 1);
    this.onComplete({
      isCorrect: ratio >= 0.6,
      response: { correct: this.correctCount, total: this.content.applyTasks.length },
      summary: 'תרגלתי ' + this.content.focusHe + ' (' + this.correctCount + '/' + this.content.applyTasks.length + ').',
    });
  };

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  window.GrammarActivity = GrammarActivity;
})();
