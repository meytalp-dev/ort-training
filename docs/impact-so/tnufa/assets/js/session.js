/**
 * ImpactOS Tnufa English — Session Controller
 *
 * Orchestrates a daily session:
 *   1. Loads the unit content (UNIT_1)
 *   2. Walks through the sequence of activities
 *   3. Logs each activity to the backend
 *   4. Tracks time + correct count
 *   5. Shows a summary screen at the end
 *
 * Each activity module exposes a class with:
 *   constructor(container, content, onComplete)
 *   render()  → puts UI into container
 *   stop()    → optional cleanup (used by listening for TTS)
 *
 * onComplete is called with: { isCorrect, response, summary }
 *   - summary: short HE string for the "what I learned" list
 */

(function () {
  'use strict';

  // Resume state — persists in localStorage so the student can leave mid-session
  // and pick up where they stopped (within 12 hours, same unit).
  const STATE_KEY = 'tnufa_active_session_v1';
  const STATE_TTL_MS = 12 * 3600 * 1000;

  let currentUser = null;
  let unit = null;
  let sessionId = null;
  let stepIndex = 0;
  let sessionStart = 0;
  let stepStart = 0;
  let totalCorrect = 0;
  let activitiesCompleted = 0;
  let learnedItems = [];
  let timerHandle = null;
  let activeActivity = null;

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    currentUser = requireAuth(['student']);
    if (!currentUser) return;

    unit = window.UNIT_1;
    if (!unit) {
      showFatal('תוכן היחידה לא נטען. נסה.י לרענן את הדף.');
      return;
    }

    document.getElementById('step-total').textContent = unit.sessionSequence.length;

    const saved = loadState();
    if (saved && saved.stepIndex < unit.sessionSequence.length) {
      showResumePrompt(saved);
      return;
    }

    await startNewSession();
  }

  async function startNewSession() {
    clearState();
    try {
      sessionId = await API.startSession();
    } catch (error) {
      console.error('startSession error:', error);
      showFatal('שגיאה בפתיחת הסשן. נסה.י לרענן.');
      return;
    }
    sessionStart = Date.now();
    totalCorrect = 0;
    activitiesCompleted = 0;
    learnedItems = [];
    startTimer();
    runStep(0);
  }

  function resumeSession(saved) {
    sessionId = saved.sessionId;
    totalCorrect = saved.totalCorrect || 0;
    activitiesCompleted = saved.activitiesCompleted || 0;
    learnedItems = saved.learnedItems || [];
    sessionStart = Date.now() - (saved.elapsed || 0);
    startTimer();
    runStep(saved.stepIndex || 0);
  }

  function showResumePrompt(saved) {
    const loading = document.getElementById('loading');
    const total = unit.sessionSequence.length;
    const remaining = total - saved.stepIndex;
    const nextStep = unit.sessionSequence[saved.stepIndex];
    const stepLabels = {
      vocabulary: 'אוצר מילים',
      reading: 'הבנת הנקרא',
      listening: 'האזנה',
      grammar: 'דקדוק',
      writing: 'כתיבה',
    };
    const nextLabel = (nextStep && stepLabels[nextStep.type]) || '';

    loading.innerHTML =
      '<div class="bg-white rounded-2xl border border-gray-100 p-6 max-w-md mx-auto text-center">' +
        '<svg class="w-14 h-14 mx-auto mb-3 text-lead-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' +
        '<h2 class="text-lg font-bold mb-2">להמשיך מאיפה שעצרת?</h2>' +
        '<p class="text-sm text-gray-600 mb-1">השלמת ' + saved.stepIndex + ' מתוך ' + total + ' פעילויות.</p>' +
        '<p class="text-sm text-gray-600 mb-5">הפעילות הבאה: <span class="font-semibold text-lead-700">' + nextLabel + '</span> · נשארו ' + remaining + '</p>' +
        '<button id="resume-btn" class="w-full bg-gradient-to-r from-lead-600 to-dream-600 hover:from-lead-700 hover:to-dream-700 text-white py-3 rounded-xl font-semibold transition mb-2">המשך מהמקום שלי</button>' +
        '<button id="new-btn" class="w-full text-gray-500 hover:text-gray-900 py-2 rounded-xl text-sm transition">להתחיל סשן מחדש</button>' +
      '</div>';

    document.getElementById('resume-btn').onclick = () => resumeSession(saved);
    document.getElementById('new-btn').onclick = async () => {
      // Close the abandoned session in the backend, then start fresh.
      try {
        await API.endSession(saved.sessionId, {
          activitiesCompleted: saved.activitiesCompleted || 0,
          timeOnTaskSeconds: Math.round((saved.elapsed || 0) / 1000),
        });
      } catch (e) { /* ignore */ }
      document.getElementById('loading').innerHTML = '<div class="spinner mx-auto mb-4"></div><p class="text-gray-500 text-sm">פותח סשן חדש...</p>';
      await startNewSession();
    };
  }

  // ===== State persistence =====

  function saveState(nextStepIndex) {
    if (!sessionId || !unit) return;
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify({
        sessionId,
        stepIndex: nextStepIndex !== undefined ? nextStepIndex : stepIndex,
        totalCorrect,
        activitiesCompleted,
        learnedItems,
        elapsed: Date.now() - sessionStart,
        unitId: unit.id,
        savedAt: Date.now(),
      }));
    } catch (e) { /* ignore quota */ }
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (!s || !s.sessionId) return null;
      if ((Date.now() - s.savedAt) > STATE_TTL_MS) {
        localStorage.removeItem(STATE_KEY);
        return null;
      }
      if (s.unitId !== window.UNIT_1.id) {
        localStorage.removeItem(STATE_KEY);
        return null;
      }
      return s;
    } catch (e) {
      return null;
    }
  }

  function clearState() {
    try { localStorage.removeItem(STATE_KEY); } catch (e) { /* ignore */ }
  }

  function runStep(index) {
    stopActiveActivity();

    if (index >= unit.sessionSequence.length) {
      showSummary();
      return;
    }

    stepIndex = index;
    stepStart = Date.now();

    const step = unit.sessionSequence[index];
    const content = resolveContent(step);
    const slot = document.getElementById('activity-slot');
    const loading = document.getElementById('loading');

    loading.classList.add('hidden');
    slot.classList.remove('hidden');
    slot.innerHTML = '';
    slot.classList.remove('activity-enter');
    void slot.offsetWidth;
    slot.classList.add('activity-enter');

    document.getElementById('step-current').textContent = index + 1;
    updateProgressBar((index / unit.sessionSequence.length) * 100);

    const ActivityCtor = ACTIVITY_REGISTRY[step.type];
    if (!ActivityCtor) {
      console.error('Unknown activity type:', step.type);
      runStep(index + 1);
      return;
    }

    activeActivity = new ActivityCtor(slot, content, onActivityComplete.bind(null, step));
    activeActivity.render();
  }

  function resolveContent(step) {
    if (step.type === 'vocabulary') return unit.chunks;
    if (step.type === 'reading') {
      return unit.readings.find(r => r.id === step.contentRef) || unit.readings[0];
    }
    if (step.type === 'listening') return unit.listening;
    if (step.type === 'grammar') return unit.grammar;
    if (step.type === 'writing') return unit.writing;
    return null;
  }

  async function onActivityComplete(step, result) {
    activitiesCompleted++;
    if (result && result.isCorrect) totalCorrect++;
    if (result && result.summary) learnedItems.push(result.summary);

    // Log to backend (fire-and-forget — don't block UX on network)
    try {
      await API.logActivity({
        sessionId,
        type: step.type,
        unitId: unit.id,
        lessonId: step.contentRef || '',
        studentResponse: result ? result.response : '',
        aiFeedback: result ? (result.aiFeedback || '') : '',
        isCorrect: !!(result && result.isCorrect),
      });
    } catch (error) {
      console.warn('logActivity failed (continuing):', error.message);
    }

    const nextIndex = stepIndex + 1;
    saveState(nextIndex);
    runStep(nextIndex);
  }

  async function showSummary() {
    stopActiveActivity();
    stopTimer();

    const totalSeconds = Math.round((Date.now() - sessionStart) / 1000);

    try {
      await API.endSession(sessionId, {
        activitiesCompleted,
        timeOnTaskSeconds: totalSeconds,
      });
    } catch (error) {
      console.warn('endSession failed:', error.message);
    }
    clearState();

    document.getElementById('activity-slot').classList.add('hidden');
    document.getElementById('summary').classList.remove('hidden');
    updateProgressBar(100);

    document.getElementById('sum-activities').textContent = activitiesCompleted;
    document.getElementById('sum-correct').textContent = totalCorrect;
    document.getElementById('sum-time').textContent = Math.max(1, Math.round(totalSeconds / 60));

    const tagline = pickTagline(activitiesCompleted, totalCorrect);
    document.getElementById('summary-tagline').textContent = tagline;

    const list = document.getElementById('learned-list');
    list.innerHTML = '';
    if (learnedItems.length === 0) {
      list.innerHTML = '<li class="text-gray-500">השלמת.ה את כל הפעילויות.</li>';
    } else {
      learnedItems.forEach(item => {
        const li = document.createElement('li');
        li.className = 'flex items-start gap-2';
        li.innerHTML = '<svg class="w-4 h-4 text-create-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg><span>' + escapeHtml(item) + '</span>';
        list.appendChild(li);
      });
    }
  }

  function pickTagline(activities, correct) {
    if (activities === 0) return 'נסה.י שוב מחר!';
    const ratio = correct / Math.max(activities, 1);
    if (ratio >= 0.8) return 'מצוין! התקדמת יפה היום.';
    if (ratio >= 0.5) return 'עבודה טובה. ממשיכים.';
    return 'כל סשן עוזר. תחזור.י מחר.';
  }

  // ===== UI helpers =====

  function startTimer() {
    timerHandle = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
      const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
      const s = (elapsed % 60).toString().padStart(2, '0');
      document.getElementById('timer').textContent = m + ':' + s;
    }, 1000);
  }

  function stopTimer() {
    if (timerHandle) {
      clearInterval(timerHandle);
      timerHandle = null;
    }
  }

  function updateProgressBar(pct) {
    document.getElementById('progress-bar').style.width = Math.min(100, Math.max(0, pct)) + '%';
  }

  function stopActiveActivity() {
    if (activeActivity && typeof activeActivity.stop === 'function') {
      try { activeActivity.stop(); } catch (e) { /* ignore */ }
    }
    activeActivity = null;
  }

  function showFatal(message) {
    const loading = document.getElementById('loading');
    loading.innerHTML = '<p class="text-red-600">' + escapeHtml(message) + '</p><a href="student.html" class="inline-block mt-4 underline text-lead-700">חזור.י לדשבורד</a>';
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  // ===== Exit modal =====

  window.confirmExit = function () {
    document.getElementById('exit-modal').classList.remove('hidden');
  };

  window.closeExitModal = function () {
    document.getElementById('exit-modal').classList.add('hidden');
  };

  window.exitSession = function () {
    // Save state so the student can resume; do NOT close the session in backend.
    stopActiveActivity();
    stopTimer();
    saveState();
    window.location.href = 'student.html';
  };

  // ===== Activity registry =====

  const ACTIVITY_REGISTRY = {
    vocabulary: window.VocabularyActivity,
    reading: window.ReadingActivity,
    listening: window.ListeningActivity,
    grammar: window.GrammarActivity,
    writing: window.WritingActivity,
  };

})();
