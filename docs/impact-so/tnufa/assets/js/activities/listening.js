/**
 * Listening Activity — Voice message + comprehension questions.
 *
 * Uses the Web Speech API (SpeechSynthesis) for TTS — works offline-ish in modern browsers.
 * Per pedagogy: 25-30% of class time should be listening.
 */

(function () {
  'use strict';

  function ListeningActivity(container, content, onComplete) {
    this.container = container;
    this.content = content;
    this.onComplete = onComplete;
    this.qIdx = 0;
    this.correctCount = 0;
    this.playCount = 0;
    this.utterance = null;
  }

  ListeningActivity.prototype.render = function () {
    const supported = 'speechSynthesis' in window;
    this.container.innerHTML = `
      <div class="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <div class="text-xs uppercase tracking-wider text-lead-600 font-semibold mb-3">Listening · ${this.content.cefr}</div>
        <h2 class="text-lg font-semibold mb-2">${escapeHtml(this.content.title)}</h2>
        <p class="text-sm text-gray-600 mb-4">${escapeHtml(this.content.transcriptHe || '')}</p>

        <div class="bg-gradient-to-br from-lead-50 to-dream-50 rounded-2xl p-6 mb-4 text-center">
          <button id="play-btn" class="inline-flex items-center justify-center w-20 h-20 bg-lead-600 hover:bg-lead-700 text-white rounded-full transition pulse-ring" ${supported ? '' : 'disabled'}>
            <svg class="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </button>
          <p class="text-xs text-gray-600 mt-3">לחיצה להפעלה · ניתן להאזין שוב</p>
          <p class="text-xs text-gray-500 mt-1">האזנות: <span id="play-count">0</span></p>
          ${!supported ? '<p class="text-xs text-amber-700 mt-2">הדפדפן לא תומך בהשמעה אוטומטית</p>' : ''}
        </div>

        <button id="listen-start-questions" class="w-full bg-gradient-to-r from-lead-600 to-dream-600 hover:from-lead-700 hover:to-dream-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50" ${supported ? 'disabled' : ''}>
          ${supported ? 'תחילה — האזן.י' : 'המשך לשאלות'}
        </button>

        ${!supported ? '<details class="mt-3 text-sm"><summary class="cursor-pointer text-lead-700">קריאת הטקסט</summary><div class="english-text mt-2 p-3 bg-gray-50 rounded-lg">' + escapeHtml(this.content.transcript) + '</div></details>' : ''}
      </div>
    `;

    if (supported) {
      this.container.querySelector('#play-btn').onclick = () => this.play();
    }
    this.container.querySelector('#listen-start-questions').onclick = () => this.renderQuestion();
  };

  ListeningActivity.prototype.play = function () {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const u = new SpeechSynthesisUtterance(this.content.transcript);
    u.lang = this.content.voicePref || 'en-US';
    u.rate = this.content.speakingRate || 0.9;
    u.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => /en[-_]/i.test(v.lang));
    if (englishVoice) u.voice = englishVoice;

    u.onend = () => {
      const cont = this.container.querySelector('#listen-start-questions');
      if (cont) {
        cont.disabled = false;
        cont.textContent = 'המשך לשאלות';
      }
    };

    this.utterance = u;
    window.speechSynthesis.speak(u);
    this.playCount++;
    const counter = this.container.querySelector('#play-count');
    if (counter) counter.textContent = this.playCount;
  };

  ListeningActivity.prototype.renderQuestion = function () {
    this.stop();
    const q = this.content.questions[this.qIdx];
    if (!q) {
      this.finish();
      return;
    }

    this.container.innerHTML = `
      <div class="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <div class="text-xs uppercase tracking-wider text-lead-600 font-semibold mb-3">Listening · שאלה ${this.qIdx + 1}/${this.content.questions.length}</div>
        ${'speechSynthesis' in window ? '<button id="replay-btn" class="mb-4 text-sm text-lead-700 hover:text-lead-900 flex items-center gap-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>השמע.י שוב</button>' : ''}
        <h3 class="english-text text-lg font-semibold mb-4">${escapeHtml(q.q)}</h3>
        <div class="space-y-2" id="listening-options"></div>
      </div>
    `;

    const replayBtn = this.container.querySelector('#replay-btn');
    if (replayBtn) replayBtn.onclick = () => this.play();

    const optsEl = this.container.querySelector('#listening-options');
    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'w-full english-text p-4 rounded-xl border-2 border-gray-200 hover:border-lead-400 hover:bg-lead-50 transition text-start';
      btn.textContent = opt;
      btn.onclick = () => this.handleAnswer(btn, i, q);
      optsEl.appendChild(btn);
    });
  };

  ListeningActivity.prototype.handleAnswer = function (btn, i, q) {
    const buttons = this.container.querySelectorAll('#listening-options button');
    buttons.forEach(b => { b.disabled = true; b.classList.remove('hover:border-lead-400', 'hover:bg-lead-50'); });

    const isCorrect = i === q.correct;
    if (isCorrect) {
      btn.className = 'w-full english-text p-4 rounded-xl border-2 border-create-500 bg-create-50 text-create-800 font-semibold text-start';
      this.correctCount++;
    } else {
      btn.className = 'w-full english-text p-4 rounded-xl border-2 border-red-400 bg-red-50 text-red-800 text-start';
      buttons[q.correct].className = 'w-full english-text p-4 rounded-xl border-2 border-create-500 bg-create-50 text-create-800 font-semibold text-start';
    }

    const continueBtn = document.createElement('button');
    continueBtn.className = 'mt-4 w-full bg-gradient-to-r from-lead-600 to-dream-600 hover:from-lead-700 hover:to-dream-700 text-white py-3 rounded-xl font-semibold transition';
    continueBtn.textContent = this.qIdx < this.content.questions.length - 1 ? 'שאלה הבאה' : 'סיים.י';
    continueBtn.onclick = () => {
      this.qIdx++;
      this.renderQuestion();
    };
    this.container.querySelector('.bg-white').appendChild(continueBtn);
  };

  ListeningActivity.prototype.stop = function () {
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) { /* ignore */ }
    }
  };

  ListeningActivity.prototype.finish = function () {
    const ratio = this.correctCount / Math.max(this.content.questions.length, 1);
    this.onComplete({
      isCorrect: ratio >= 0.6,
      response: { correct: this.correctCount, total: this.content.questions.length, plays: this.playCount },
      summary: 'הקשבתי להודעה והבנתי ' + this.correctCount + '/' + this.content.questions.length + ' שאלות.',
    });
  };

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  window.ListeningActivity = ListeningActivity;
})();
