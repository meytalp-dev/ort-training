/* פיננסקלאס · קורס תלמידים — JS משותף
 * Login flow, progress tracking, task SPA navigation, encouraging feedback, confetti.
 */
(function () {
  'use strict';

  // ===== Storage =====
  const KEY_USER = 'finansklass.student.user.v1';
  const KEY_PROG = 'finansklass.student.progress.v1';

  function getUser() {
    try { return JSON.parse(localStorage.getItem(KEY_USER) || 'null'); }
    catch (e) { return null; }
  }
  function setUser(u) {
    try { localStorage.setItem(KEY_USER, JSON.stringify(u)); } catch (e) {}
  }
  function clearUser() {
    try { localStorage.removeItem(KEY_USER); } catch (e) {}
  }
  function getProgress() {
    try { return JSON.parse(localStorage.getItem(KEY_PROG) || '{}'); }
    catch (e) { return {}; }
  }
  function setProgress(p) {
    try { localStorage.setItem(KEY_PROG, JSON.stringify(p)); } catch (e) {}
  }
  function isLessonDone(id) {
    const p = getProgress();
    return !!(p[id] && p[id].done);
  }
  function markLessonDone(id) {
    const p = getProgress();
    p[id] = { done: true, at: Date.now() };
    setProgress(p);
  }
  function setTaskDone(lessonId, taskIdx) {
    const p = getProgress();
    if (!p[lessonId]) p[lessonId] = { tasks: {} };
    if (!p[lessonId].tasks) p[lessonId].tasks = {};
    p[lessonId].tasks[taskIdx] = true;
    setProgress(p);
  }

  // ===== Helpers =====
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // ===== Course meta (for unit/lesson labels) =====
  const COURSE = {
    name: 'פיננסקלאס',
    units: [
      { id: 1, title: 'תקציב אישי ומשפחתי', month: 'ספטמבר', slug: 'unit-01', published: true,
        lessons: [
          { id: '1.1', slug: 'lesson-1-1.html', title: 'איפה הכסף שלי?', tasks: 9 },
          { id: '1.2', slug: 'lesson-1-2.html', title: 'מאיפה הכסף, ולאן הוא הולך?', tasks: 6 },
          { id: '1.3', slug: 'lesson-1-3.html', title: 'תקציב שעובד', tasks: 9 },
          { id: '1.4', slug: 'lesson-1-4.html', title: 'מה אם הכל משתבש?', tasks: 8 }
        ]},
      { id: 2, title: 'בנקאות', month: 'אוקטובר', slug: 'unit-02', published: false, lessons: [] },
      { id: 3, title: 'שיח פיננסי במשפחה', month: 'נובמבר', slug: 'unit-03', published: false, lessons: [] }
    ]
  };

  // ===== Greeting based on hour =====
  function greeting(name) {
    const h = new Date().getHours();
    let g = 'שלום';
    if (h >= 5 && h < 12) g = 'בוקר טוב';
    else if (h >= 12 && h < 17) g = 'צהריים טובים';
    else if (h >= 17 && h < 22) g = 'ערב טוב';
    else g = 'לילה טוב';
    return name ? `${g}, ${name}!` : `${g}!`;
  }

  // ===== Confetti =====
  function confetti() {
    const colors = ['#6E54E8','#FFC93C','#4FB76C','#FF6B9D','#4D96FF','#FF8C42'];
    const root = document.createElement('div');
    root.className = 's-confetti';
    document.body.appendChild(root);
    for (let i = 0; i < 50; i++) {
      const s = document.createElement('span');
      s.style.left = Math.random() * 100 + 'vw';
      s.style.background = colors[Math.floor(Math.random() * colors.length)];
      s.style.animationDelay = (Math.random() * .3) + 's';
      s.style.animationDuration = (1.2 + Math.random() * .8) + 's';
      s.style.transform = `rotate(${Math.random()*360}deg)`;
      const isCircle = Math.random() > .6;
      if (isCircle) s.style.borderRadius = '50%';
      root.appendChild(s);
    }
    setTimeout(() => root.remove(), 2500);
  }

  // ===== Encouraging feedback messages =====
  const CHEERS = [
    { title: 'מעולה!', sub: 'ככה זה נראה כשעושים את זה רציני.' },
    { title: 'כל הכבוד!', sub: 'אתם בקצב הנכון.' },
    { title: 'יפה מאוד!', sub: 'עוד צעד קדימה.' },
    { title: 'אש!', sub: 'בדיוק ככה.' },
    { title: 'חזק!', sub: 'ממשיכים.' },
    { title: 'איזה כיף!', sub: 'אתם מתקדמים יפה.' },
    { title: 'נהדר!', sub: 'התקדמתם בלי לשים לב.' },
    { title: 'אוהבת את זה!', sub: 'תמשיכו ככה.' },
    { title: 'מצוין!', sub: 'אתם בכיוון.' }
  ];

  function showFeedback(opts) {
    opts = opts || {};
    const cheer = CHEERS[Math.floor(Math.random() * CHEERS.length)];
    const title = opts.title || cheer.title;
    const sub = opts.sub || cheer.sub;
    const overlay = document.createElement('div');
    overlay.className = 's-feedback' + (opts.big ? ' big' : '');
    const iconSize = opts.big ? 72 : 42;
    overlay.innerHTML = `
      <div class="s-feedback-card">
        <div class="s-feedback-icon">
          <svg viewBox="0 0 24 24" width="${iconSize}" height="${iconSize}" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2>${title}</h2>
        <p>${sub}</p>
      </div>
    `;
    document.body.appendChild(overlay);
    // Force reflow then add .on
    void overlay.offsetWidth;
    overlay.classList.add('on');
    if (opts.confetti) confetti();
    setTimeout(() => {
      overlay.classList.remove('on');
      setTimeout(() => overlay.remove(), 300);
      if (typeof opts.onClose === 'function') opts.onClose();
    }, opts.duration || 1200);
  }

  // ===== Toast (small saved indicator) =====
  function toast(text) {
    let t = $('#sToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'sToast';
      t.className = 's-toast';
      document.body.appendChild(t);
    }
    t.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> ${text}`;
    t.classList.add('on');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('on'), 1600);
  }

  // ===== Avatar — first letter of name =====
  function avatarLetter(name) {
    if (!name) return '?';
    return name.trim().charAt(0);
  }

  // ===== Top bar render =====
  function renderTopbar() {
    const el = $('#sTopbar');
    if (!el) return;
    const u = getUser();
    const backHref = el.dataset.back || '../index.html';
    const title = el.dataset.title || '';
    el.innerHTML = `
      <a class="s-topbar-back" href="${backHref}" aria-label="חזרה">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
      </a>
      <div class="s-topbar-title">${title}</div>
      ${u ? `<a class="s-topbar-user" href="${el.dataset.userHref || '#'}" aria-label="חשבון">
        <span class="s-topbar-user-avatar">${avatarLetter(u.name)}</span>
        <span class="s-topbar-user-name">${u.name || ''}</span>
      </a>` : `<span></span>`}
      <div class="s-prog-strip"><div class="s-prog-strip-fill" id="sProgStripFill"></div></div>
    `;
  }

  // ===== Task SPA navigation =====
  function initTaskRunner(opts) {
    opts = opts || {};
    const lessonId = opts.lessonId;
    const completeHref = opts.completeHref || '../index.html';
    const tasks = $$('.s-task');
    const total = tasks.length;
    if (!total) return;

    // Try to resume from saved progress
    const prog = getProgress();
    const lp = prog[lessonId] || { tasks: {} };
    // Find the first incomplete task or 0
    let current = 0;
    if (lp.tasks) {
      for (let i = 0; i < total; i++) {
        if (!lp.tasks[i]) { current = i; break; }
        if (i === total - 1) current = total - 1;
      }
    }

    function showTask(idx) {
      tasks.forEach((t, i) => t.classList.toggle('active', i === idx));
      // Update top progress strip
      const fill = $('#sProgStripFill');
      if (fill) fill.style.width = ((idx) / total * 100) + '%';
      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Focus the active task heading for screen readers
      const heading = tasks[idx]?.querySelector('h1, h2');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        try { heading.focus({ preventScroll: true }); } catch (e) {}
      }
    }

    function advance() {
      setTaskDone(lessonId, current);
      const isLast = current >= total - 1;
      const fill = $('#sProgStripFill');
      if (fill) fill.style.width = ((current + 1) / total * 100) + '%';
      if (isLast) {
        markLessonDone(lessonId);
        showFeedback({
          title: 'סיימת את השיעור!',
          sub: 'באמת ככה זה נראה. כל הכבוד.',
          duration: 2200,
          confetti: true,
          big: true,
          onClose: () => { window.location.href = completeHref; }
        });
        return;
      }
      // No mid-lesson cheer — just advance silently
      current++;
      showTask(current);
    }

    // Bind all .s-next buttons
    $$('.s-next').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        // Allow disabled buttons to be skipped
        if (btn.disabled) return;
        // If a task wants to validate before advancing, it can set data-validate="fnName"
        const fnName = btn.dataset.validate;
        if (fnName && typeof window[fnName] === 'function') {
          if (window[fnName]() === false) return;
        }
        advance();
      });
    });

    // Show initial task
    showTask(current);

    // Expose API for in-task scripts
    window.studentShell = window.studentShell || {};
    window.studentShell.advance = advance;
    window.studentShell.showFeedback = showFeedback;
    window.studentShell.confetti = confetti;
    window.studentShell.toast = toast;
    window.studentShell.setTaskDone = setTaskDone;
    window.studentShell.markLessonDone = markLessonDone;
  }

  // ===== Login flow =====
  function renderLogin(target, onLoggedIn) {
    target.innerHTML = `
      <div class="s-login-card">
        <div class="s-login-emoji">פ</div>
        <h1>בואו נכיר</h1>
        <p class="s-login-sub">נשמור את ההתקדמות שלך כדי שתוכל/י לחזור מאוחר יותר בלי להפסיד.</p>

        <form id="sLoginForm" autocomplete="off">
          <div class="s-form-group">
            <label class="s-form-label" for="sLoginName">איך קוראים לך?</label>
            <input type="text" id="sLoginName" class="s-input" placeholder="שם פרטי" autocomplete="given-name" required>
          </div>

          <div class="s-form-group">
            <label class="s-form-label">באיזו כיתה?</label>
            <div class="s-form-row" role="radiogroup" aria-label="כיתה">
              <button type="button" class="s-radio-chip" data-grade="ט">ט'</button>
              <button type="button" class="s-radio-chip" data-grade="י">י'</button>
              <button type="button" class="s-radio-chip" data-grade="יא">יא'</button>
              <button type="button" class="s-radio-chip" data-grade="יב">יב'</button>
            </div>
          </div>

          <div class="s-spacer"></div>
          <button type="submit" class="s-btn s-btn-block" id="sLoginSubmit" disabled>יאללה נתחיל
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </form>
      </div>
    `;
    const form = $('#sLoginForm', target);
    const nameInput = $('#sLoginName', target);
    const submitBtn = $('#sLoginSubmit', target);
    const grades = $$('.s-radio-chip', target);
    let selectedGrade = null;

    function validate() {
      const valid = nameInput.value.trim().length >= 2 && selectedGrade;
      submitBtn.disabled = !valid;
    }

    grades.forEach(b => b.addEventListener('click', () => {
      grades.forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      selectedGrade = b.dataset.grade;
      validate();
    }));
    nameInput.addEventListener('input', validate);

    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = nameInput.value.trim();
      if (!name || !selectedGrade) return;
      setUser({ name, grade: selectedGrade, at: Date.now() });
      if (typeof onLoggedIn === 'function') onLoggedIn();
    });

    // Auto-focus name input
    setTimeout(() => nameInput.focus(), 200);
  }

  // ===== Public API =====
  window.studentShell = {
    getUser, setUser, clearUser,
    getProgress, setProgress, isLessonDone, markLessonDone, setTaskDone,
    showFeedback, confetti, toast,
    greeting, avatarLetter,
    renderTopbar, renderLogin, initTaskRunner,
    COURSE
  };

  // ===== Auto-init: topbar if present =====
  function init() {
    if ($('#sTopbar')) renderTopbar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
