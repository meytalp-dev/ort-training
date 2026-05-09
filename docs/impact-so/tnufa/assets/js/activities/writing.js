/**
 * Writing Activity — Scaffolded writing with AI feedback.
 *
 * Stages:
 *   1. Brief — show task + chunk bank + sentence starters.
 *   2. Draft — student writes (live word counter + chunk-use indicator).
 *   3. Submit — call API.aiFeedback() for selective correction.
 *   4. Reflect — show feedback (Praise + Focus + Hint).
 *
 * Per pedagogy: SELECTIVE correction (one focus error), not exhaustive.
 */

(function () {
  'use strict';

  function WritingActivity(container, content, onComplete) {
    this.container = container;
    this.content = content;
    this.onComplete = onComplete;
    this.studentText = '';
    this.aiFeedbackText = '';
  }

  WritingActivity.prototype.render = function () {
    this.renderBrief();
  };

  WritingActivity.prototype.renderBrief = function () {
    const chunkBank = (this.content.chunkBank || []).map(c =>
      '<span class="english-text inline-block bg-dream-100 text-dream-800 px-2 py-1 rounded-lg text-sm m-0.5">' + escapeHtml(c) + '</span>'
    ).join('');
    const starters = (this.content.scaffold && this.content.scaffold.sentenceStarters || []).map(s =>
      '<li class="english-text">' + escapeHtml(s) + '</li>'
    ).join('');

    this.container.innerHTML = `
      <div class="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <div class="text-xs uppercase tracking-wider text-lead-600 font-semibold mb-3">Writing · ${this.content.cefr}</div>
        <h2 class="text-lg font-semibold mb-2">${escapeHtml(this.content.titleHe)}</h2>
        <p class="text-sm text-gray-700 mb-2">${escapeHtml(this.content.promptHe)}</p>
        <p class="english-text text-sm text-gray-500 mb-4 italic">${escapeHtml(this.content.prompt)}</p>

        <div class="bg-lead-50 rounded-xl p-4 mb-3">
          <div class="text-xs font-semibold text-lead-700 mb-2">ביטויים שאפשר להשתמש בהם:</div>
          <div>${chunkBank}</div>
        </div>

        ${starters ? `<div class="bg-create-50 rounded-xl p-4 mb-4"><div class="text-xs font-semibold text-create-700 mb-2">פתיחים אפשריים:</div><ul class="space-y-1 text-sm">${starters}</ul></div>` : ''}

        <button id="writing-start" class="w-full bg-gradient-to-r from-lead-600 to-dream-600 hover:from-lead-700 hover:to-dream-700 text-white py-3 rounded-xl font-semibold transition">להתחיל לכתוב</button>
      </div>
    `;
    this.container.querySelector('#writing-start').onclick = () => this.renderDraft();
  };

  WritingActivity.prototype.renderDraft = function () {
    const { min, max } = this.content.targetWords;
    this.container.innerHTML = `
      <div class="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <div class="text-xs uppercase tracking-wider text-lead-600 font-semibold mb-3">Writing · טיוטה</div>
        <h2 class="text-lg font-semibold mb-2">כתבו את הפסקה</h2>
        <p class="text-xs text-gray-500 mb-3">היעד: ${min}-${max} מילים. קלוד יבדוק את העבודה ויחזיר משוב.</p>

        <textarea id="writing-textarea" dir="ltr" class="english-text w-full min-h-[180px] p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-lead-500 leading-relaxed" placeholder="Start writing here..."></textarea>

        <div class="flex items-center justify-between mt-3 mb-4 text-sm">
          <div class="text-gray-600">מילים: <span id="word-count" class="font-semibold">0</span> / ${max}</div>
          <div class="text-gray-600">ביטויים בשימוש: <span id="chunk-count" class="font-semibold">0</span> / ${this.content.chunkBank.length}</div>
        </div>

        <button id="writing-submit" class="w-full bg-gradient-to-r from-lead-600 to-dream-600 hover:from-lead-700 hover:to-dream-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50" disabled>שלחו לבדיקה</button>
      </div>
    `;

    const textarea = this.container.querySelector('#writing-textarea');
    const wordCount = this.container.querySelector('#word-count');
    const chunkCount = this.container.querySelector('#chunk-count');
    const submit = this.container.querySelector('#writing-submit');

    const updateStats = () => {
      const text = textarea.value || '';
      const words = text.trim().split(/\s+/).filter(Boolean);
      wordCount.textContent = words.length;
      const lower = text.toLowerCase();
      const used = (this.content.chunkBank || []).filter(c => lower.includes(c.toLowerCase())).length;
      chunkCount.textContent = used;
      submit.disabled = words.length < Math.max(20, min - 10);
    };

    textarea.addEventListener('input', updateStats);
    textarea.focus();
    submit.onclick = () => {
      this.studentText = textarea.value.trim();
      this.renderSubmitting();
    };
  };

  WritingActivity.prototype.renderSubmitting = function () {
    this.container.innerHTML = `
      <div class="bg-white rounded-2xl border border-gray-100 p-6 mb-4 text-center">
        <div class="spinner mx-auto mb-4"></div>
        <h2 class="text-lg font-semibold mb-2">קלוד בודק את הטקסט שלך...</h2>
        <p class="text-sm text-gray-500">זה לוקח כמה שניות</p>
      </div>
    `;

    API.aiFeedback('writing', this.studentText, {
      cefrLevel: this.content.cefr,
      task: this.content.prompt,
      chunkBank: this.content.chunkBank,
    })
      .then(feedback => {
        this.aiFeedbackText = feedback || '';
        this.renderFeedback();
      })
      .catch(error => {
        console.error('AI feedback error:', error);
        this.aiFeedbackText = '';
        this.renderFeedback();
      });
  };

  WritingActivity.prototype.renderFeedback = function () {
    const fb = this.aiFeedbackText || 'לא הצלחנו לקבל משוב כרגע — אבל הטקסט שלך נשמר.';

    this.container.innerHTML = `
      <div class="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <div class="text-xs uppercase tracking-wider text-lead-600 font-semibold mb-3">Writing · משוב</div>
        <h2 class="text-lg font-semibold mb-3">הטקסט שלך</h2>
        <div class="english-text bg-lead-50/40 rounded-xl p-4 mb-4 leading-relaxed">${escapeHtml(this.studentText)}</div>

        <h3 class="text-base font-semibold mb-2">המשוב של קלוד:</h3>
        <div class="bg-gradient-to-br from-create-50 to-lead-50 border border-create-200 rounded-xl p-5 mb-4 leading-relaxed text-gray-800 whitespace-pre-line">${escapeHtml(fb)}</div>

        <button id="writing-finish" class="w-full bg-gradient-to-r from-lead-600 to-dream-600 hover:from-lead-700 hover:to-dream-700 text-white py-3 rounded-xl font-semibold transition">המשך</button>
      </div>
    `;
    this.container.querySelector('#writing-finish').onclick = () => this.finish();
  };

  WritingActivity.prototype.finish = function () {
    const words = this.studentText.split(/\s+/).filter(Boolean).length;
    const inRange = words >= this.content.targetWords.min - 10 && words <= this.content.targetWords.max + 20;
    const lower = this.studentText.toLowerCase();
    const chunksUsed = (this.content.chunkBank || []).filter(c => lower.includes(c.toLowerCase())).length;

    this.onComplete({
      isCorrect: inRange && chunksUsed >= 1,
      response: { text: this.studentText, words, chunksUsed },
      aiFeedback: this.aiFeedbackText,
      summary: 'כתבתי פסקה (' + words + ' מילים) על השבוע שלי + השתמשתי ב-' + chunksUsed + ' ביטויים.',
    });
  };

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  window.WritingActivity = WritingActivity;
})();
