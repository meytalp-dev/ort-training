/* ============================================================
   רֶצֶף — רכיב CheckInPanel (W1-07)
   checkin-panel.js · רכיב check-in יומי לתלמיד · drop-in, מובייל-first
   נלווה ל: system-mode.js (W0-04) · checkin-service.js (W0-S2) ·
            worlds-detailed-spec.md §1.1 · security-minimization.md §3 שורה 3
   ------------------------------------------------------------
   מה הרכיב עושה — לפי המצב הפעיל של המערכת (Resef.getMode):
     • שגרה / מרחוק  →  check-in יחיד: "מה נלמד היום" (עם תצוגת היום) + כפתור "מתחילים".
                        רושם *נוכחות בלבד* — בלי רכיב רגשי, בלי התראה.
     • חירום         →  4 אפשרויות בלחיצה אחת (מוכן / להתחיל לאט / צריך עזרה / לא יכול עכשיו),
                        עם אייקוני-קו (לא אימוג'י). "צריך עזרה"/"לא יכול עכשיו" מרימים
                        התראה חיה למחנך — ומיד נמחקים. בלי היסטוריה רגשית.

   🔒 מינימיזציה (תיקון 13): הרכיב **לא** שומר את הבחירה. כל הטיפול —
      גזירת סימן, התראה, מחיקה — מתבצע ב-checkin-service.js. הרכיב הוא רק ה-UI.
      אין כאן localStorage, אין לוג בחירות, אין מגמת מצב-רוח. סטטוס חד-פעמי בלבד.

   〰️ מוטיב קו-הרצף: פס דק מחבר בין ה-check-in לצעד הבא (רצף שלא נשבר).

   שימוש:
     <link rel="stylesheet" href="tokens.css">
     <script src="system-mode.js"></script>
     <script src="checkin-service.js"></script>
     <script src="checkin-panel.js"></script>

     var panel = Resef.CheckInPanel.mount(el, {
       student: { id:'std_noa', name:'נועה', classId:'cls_i2' },
       today:   [{ subject:'לשון', title:'סימני פיסוק' }, { subject:'מתמטיקה', title:'שברים' }],
       // mode: 'emergency',   // אופציונלי — לכפות מצב; אחרת נגזר מ-Resef.getMode()
       onSubmit: function (res) { console.log(res.studentStatus, res.alertRaised); }
     });
     panel.reset();    // חזרה לבחירה
     panel.destroy();  // הסרה + ניקוי מאזינים
   ============================================================ */
(function (global) {
  'use strict';

  var Resef = global.Resef || (global.Resef = {});
  var doc = global.document;

  /* ---------- 1. אייקוני-קו (outline בלבד, בלי אימוג'י, עובי אחיד) ----------
     כל אייקון = SVG קו יחיד. currentColor יורש מצבע-המצב (--mode). */
  function svg(inner, w, sw) {
    w = w || 20; sw = sw || 2.2;
    return '<svg class="rcip__ico" width="' + w + '" height="' + w + '" viewBox="0 0 24 24" ' +
           'fill="none" stroke="currentColor" stroke-width="' + sw + '" ' +
           'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
  }
  var ICONS = {
    ready:  svg('<path d="M5 12l5 5 9-11"/>'),                                   // וי — מוכן
    slow:   svg('<path d="M5 12h14"/>'),                                         // קו — לאט/רגוע
    help:   svg('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.7-.9 1.4M12 16.5h.01"/>'), // עזרה
    notnow: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5M12 16h.01"/>'),// עצירה עדינה
    start:  svg('<path d="M19 12H5M11 6l-6 6 6 6"/>'),                            // חץ (RTL: קדימה=שמאלה)
    ok:     svg('<path d="M5 12l5 5 9-11"/>', 18, 2.4)                           // אישור בסטטוס
  };

  /* ---------- 2. הזרקת סגנון פעם אחת (רכיב drop-in עצמאי) ----------
     כל הצבעים/מרווחים דרך משתני tokens.css — אין צבע קשיח. */
  var STYLE_ID = 'resef-checkin-panel-style';
  function injectStyleOnce() {
    if (!doc || doc.getElementById(STYLE_ID)) return;
    var css =
      '.rcip{background:var(--card);border:1px solid var(--line);border-radius:var(--radius-lg);' +
        'box-shadow:var(--shadow-card);padding:var(--space-4);' +
        'font-family:var(--font-body);color:var(--ink);position:relative;overflow:hidden}' +
      '.rcip__edge{position:absolute;inset-block-start:0;inset-inline:0;height:3px;background:var(--mode)}' +
      '.rcip__head{display:flex;align-items:center;gap:var(--space-2);margin-bottom:2px}' +
      '.rcip__mode{display:inline-flex;align-items:center;gap:6px;padding:3px 9px;border-radius:var(--radius-pill);' +
        'background:var(--mode-soft);color:var(--mode);border:1px solid var(--mode-line);' +
        'font-family:var(--font-head);font-weight:600;font-size:var(--text-label);margin-inline-start:auto}' +
      '.rcip__mode svg{flex:none}' +
      '.rcip__q{font-family:var(--font-head);font-weight:700;color:var(--ink-strong);font-size:var(--text-h3);line-height:1.25}' +
      '.rcip__sub{color:var(--ink-soft);font-size:var(--text-small);margin:2px 0 var(--space-3)}' +

      /* --- שגרה/מרחוק: תצוגת "מה נלמד היום" + כפתור מתחילים --- */
      '.rcip__today{list-style:none;margin:0 0 var(--space-3);padding:0;display:flex;flex-direction:column;gap:var(--space-2)}' +
      '.rcip__today li{display:flex;align-items:center;gap:var(--space-3);background:var(--surface-muted);' +
        'border:1px solid var(--line);border-radius:var(--radius-sm);padding:var(--space-2) var(--space-3)}' +
      '.rcip__dot{width:12px;height:12px;border-radius:50%;background:var(--card);border:3px solid var(--mode);flex:none}' +
      '.rcip__t-sub{font-family:var(--font-head);font-weight:650;color:var(--ink-strong);font-size:var(--text-small)}' +
      '.rcip__t-title{color:var(--ink-soft);font-size:var(--text-small);margin-inline-start:auto;text-align:start}' +
      '.rcip__start{width:100%;min-height:var(--tap);display:inline-flex;align-items:center;justify-content:center;gap:8px;' +
        'background:var(--mode);color:#fff;border:none;border-radius:var(--radius-btn);' +
        'font-family:var(--font-head);font-weight:600;font-size:var(--text-body);cursor:pointer;padding:0 var(--space-4);' +
        'transition:filter 160ms ease}' +
      '.rcip__start:hover{filter:brightness(.94)}' +
      '.rcip__start .rcip__ico{color:#fff}' +

      /* --- חירום: 4 אפשרויות --- */
      '.rcip__four{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2)}' +
      '.rcip__opt{display:flex;align-items:center;gap:var(--space-2);min-height:var(--tap);' +
        'border:1px solid var(--line-strong);border-radius:var(--radius-sm);background:var(--card);color:var(--ink);' +
        'font-family:var(--font-body);font-weight:600;font-size:var(--text-small);cursor:pointer;' +
        'padding:var(--space-2) var(--space-3);text-align:start;line-height:1.2;' +
        'transition:border-color 160ms ease,background 160ms ease}' +
      '.rcip__opt .rcip__ico{color:var(--mode);flex:none}' +
      '.rcip__opt:hover{border-color:var(--mode);background:var(--mode-soft)}' +

      /* מיקוד ברור — לא רק צבע */
      '.rcip__opt:focus-visible,.rcip__start:focus-visible,.rcip__reset:focus-visible{' +
        'outline:3px solid var(--brand-bright);outline-offset:2px}' +

      /* --- סטטוס חד-פעמי (לא לוג) --- */
      '.rcip__status{display:flex;align-items:flex-start;gap:var(--space-2);background:var(--brand-soft);' +
        'border:1px solid var(--brand-line);border-radius:var(--radius-sm);padding:var(--space-3);' +
        'font-size:var(--text-small);color:var(--ink)}' +
      '.rcip__status[data-kind="alerted"]{background:var(--emergency-soft);border-color:var(--emergency-line)}' +
      '.rcip__status .rcip__ico{color:var(--brand-deep);flex:none;margin-top:1px}' +
      '.rcip__status[data-kind="alerted"] .rcip__ico{color:var(--emergency)}' +
      '.rcip__reset{align-self:flex-start;background:none;border:none;color:var(--brand);' +
        'font-family:var(--font-body);font-weight:600;font-size:var(--text-small);cursor:pointer;' +
        'padding:6px 0;margin-top:var(--space-2);text-decoration:underline;border-radius:6px}' +

      /* 〰️ קו-רצף לצעד הבא */
      '.rcip__seq{display:flex;align-items:center;gap:0;margin-top:var(--space-3);padding-top:var(--space-3);' +
        'border-top:1px solid var(--line)}' +
      '.rcip__seq .n{width:11px;height:11px;border-radius:50%;background:var(--card);border:3px solid var(--mode);flex:none}' +
      '.rcip__seq .n.dim{border-color:var(--line-strong)}' +
      '.rcip__seq .l{height:2px;background:var(--mode-line);border-radius:var(--radius-pill);flex:1}' +
      '.rcip__seq .lbl{font-size:var(--text-label);color:var(--ink-soft);margin-inline-start:var(--space-2);white-space:nowrap}' +

      '@media (prefers-reduced-motion:reduce){.rcip *{transition:none !important;animation:none !important}}';
    var s = doc.createElement('style');
    s.id = STYLE_ID;
    s.textContent = css;
    (doc.head || doc.documentElement).appendChild(s);
  }

  /* ---------- 3. עזר ---------- */
  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function rules(mode) {
    // נשען על system-mode.js אם קיים; אחרת ברירת-מחדל בטוחה (single/שגרה).
    if (typeof Resef.getRules === 'function') return Resef.getRules(mode);
    return { key: mode || 'routine',
             checkin: { type: 'single', prompt: 'מה נלמד היום?', options: [{ id: 'start', label: 'מתחילים' }] } };
  }
  function activeMode(forced) {
    if (forced) return forced;
    return (typeof Resef.getMode === 'function') ? Resef.getMode() : 'routine';
  }
  function modeLabel(mode) {
    var r = rules(mode);
    return (r && r.label) || mode;
  }

  /* ---------- 4. הרכיב ---------- */
  function CheckInPanel(el, opts) {
    this.el = el;
    this.opts = opts || {};
    this.student = this.opts.student || {};
    this.forcedMode = this.opts.mode || null;   // אם נכפה — לא מגיב לשינוי מצב גלובלי
    this._answered = false;
    this._off = null;

    injectStyleOnce();
    this.el.classList.add('rcip');
    this.el.setAttribute('lang', 'he');
    this.el.setAttribute('dir', 'rtl');

    var self = this;
    // מאזין ללחיצות (delegation) — עמיד לרינדור חוזר
    this._onClick = function (e) { self._handleClick(e); };
    this.el.addEventListener('click', this._onClick);

    // תגובה לשינוי מצב מערכת גלובלי (אלא אם המצב נכפה)
    if (!this.forcedMode && typeof Resef.onModeChange === 'function') {
      this._off = Resef.onModeChange(function () { self.render(); });
    }
    this.render();
  }

  CheckInPanel.prototype.mode = function () { return activeMode(this.forcedMode); };

  CheckInPanel.prototype.render = function () {
    this._answered = false;
    var mode = this.mode();
    var ci = rules(mode).checkin || { type: 'single', prompt: 'מה נלמד היום?', options: [] };
    var html =
      '<span class="rcip__edge" aria-hidden="true"></span>' +
      '<div class="rcip__head">' +
        '<span class="rcip__q">' + esc(ci.prompt) + '</span>' +
        '<span class="rcip__mode">' +
          '<svg class="rcip__ico" width="18" height="12" viewBox="0 0 20 14" aria-hidden="true" fill="none" ' +
            'stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
            '<path d="M2 7h4M9 7h2M14 7h4"/><circle cx="7.5" cy="7" r="1.6" fill="currentColor" stroke="none"/></svg>' +
          '<span>' + esc(modeLabel(mode)) + '</span>' +
        '</span>' +
      '</div>';

    if (ci.type === 'four') {
      html += this._renderFour(ci);
    } else {
      html += this._renderSingle(ci);
    }
    html += this._renderSeq(mode);
    this.el.innerHTML = html;
  };

  /* שגרה/מרחוק: "מה נלמד היום" + כפתור מתחילים */
  CheckInPanel.prototype._renderSingle = function (ci) {
    var today = this.opts.today || [];
    var startLabel = (ci.options && ci.options[0] && ci.options[0].label) || 'מתחילים';
    var startId = (ci.options && ci.options[0] && ci.options[0].id) || 'start';
    var out = '<p class="rcip__sub">לחיצה אחת פותחת את היום. הצעד הבא מחכה למטה.</p>';
    if (today.length) {
      out += '<ul class="rcip__today" aria-label="מה נלמד היום">';
      today.forEach(function (t) {
        out += '<li><span class="rcip__dot" aria-hidden="true"></span>' +
               '<span class="rcip__t-sub">' + esc(t.subject) + '</span>' +
               '<span class="rcip__t-title">' + esc(t.title) + '</span></li>';
      });
      out += '</ul>';
    }
    out += '<div class="rcip__body" role="group" aria-label="check-in יומי">' +
           '<button type="button" class="rcip__start" data-response="' + esc(startId) + '">' +
             ICONS.start + esc(startLabel) + '</button></div>';
    return out;
  };

  /* חירום: 4 אפשרויות עם אייקוני-קו */
  CheckInPanel.prototype._renderFour = function (ci) {
    var opts = (ci.options && ci.options.length) ? ci.options : [
      { id: 'ready', label: 'מוכן/ה' }, { id: 'slow', label: 'להתחיל לאט' },
      { id: 'help', label: 'צריך/ה עזרה' }, { id: 'notnow', label: 'לא יכול/ה עכשיו' }
    ];
    var out = '<p class="rcip__sub">בלי לחץ. אם צריך — המחנך/ת יודע/ת מיד.</p>' +
              '<div class="rcip__four rcip__body" role="group" aria-label="check-in יומי — חירום">';
    opts.forEach(function (o) {
      out += '<button type="button" class="rcip__opt" data-response="' + esc(o.id) + '">' +
             (ICONS[o.id] || ICONS.ready) + esc(o.label) + '</button>';
    });
    return out + '</div>';
  };

  /* 〰️ קו-רצף לצעד הבא — חתימה ויזואלית קבועה */
  CheckInPanel.prototype._renderSeq = function () {
    return '<div class="rcip__seq" aria-hidden="true">' +
             '<span class="n"></span><span class="l"></span>' +
             '<span class="n dim"></span><span class="l"></span><span class="n dim"></span>' +
             '<span class="lbl">הצעד הבא</span>' +
           '</div>';
  };

  CheckInPanel.prototype._handleClick = function (e) {
    var target = e.target;
    var reset = target.closest ? target.closest('.rcip__reset') : null;
    if (reset) { this.reset(); return; }
    if (this._answered) return;
    var btn = target.closest ? target.closest('[data-response]') : null;
    if (!btn || !this.el.contains(btn)) return;
    this._submit(btn.getAttribute('data-response'));
  };

  CheckInPanel.prototype._submit = function (response) {
    this._answered = true;
    var mode = this.mode();
    var res;
    // כל הטיפול (סימן → התראה → מחיקה) עובר דרך השירות המשותף — אין כפילות.
    if (Resef.CheckIn && typeof Resef.CheckIn.submit === 'function') {
      res = Resef.CheckIn.submit({
        studentId: this.student.id || null,
        studentName: this.student.name || null,
        classId: this.student.classId || null,
        response: response,
        mode: mode
      });
    } else {
      // fallback ללא השירות — סטטוס נוכחות בלבד, בלי שמירה
      res = { studentStatus: { kind: 'present', text: 'רשום/ה כאן היום. אפשר להתחיל בקצב שלך.' },
              alertRaised: false, emotionPurged: true };
    }
    this._showStatus(res.studentStatus || { kind: 'present', text: 'רשום/ה כאן היום.' });
    if (typeof this.opts.onSubmit === 'function') {
      try { this.opts.onSubmit(res); } catch (err) { /* callback לא מפיל את הרכיב */ }
    }
  };

  CheckInPanel.prototype._showStatus = function (status) {
    var body = this.el.querySelector('.rcip__body');
    if (!body) return;
    var kind = (status && status.kind) || 'present';
    var text = (status && status.text) || 'רשום/ה כאן היום.';
    var box = doc.createElement('div');
    box.className = 'rcip__status';
    box.setAttribute('data-kind', kind);
    box.setAttribute('role', 'status');
    box.setAttribute('aria-live', 'polite');
    box.innerHTML = ICONS.ok + '<span class="rcip__status-txt"></span>';
    box.querySelector('.rcip__status-txt').textContent = text;  // textContent — לא innerHTML
    var reset = doc.createElement('button');
    reset.type = 'button';
    reset.className = 'rcip__reset';
    reset.textContent = 'לבחור שוב';
    body.replaceWith(box);
    box.insertAdjacentElement('afterend', reset);
  };

  CheckInPanel.prototype.reset = function () { this.render(); };

  CheckInPanel.prototype.destroy = function () {
    if (this._off) { try { this._off(); } catch (e) {} this._off = null; }
    if (this._onClick) this.el.removeEventListener('click', this._onClick);
    this.el.classList.remove('rcip');
    this.el.innerHTML = '';
  };

  /* ---------- 5. API ציבורי ---------- */
  Resef.CheckInPanel = {
    mount: function (el, opts) {
      if (typeof el === 'string') el = doc.querySelector(el);
      if (!el) throw new Error('Resef.CheckInPanel.mount: אלמנט יעד לא נמצא');
      return new CheckInPanel(el, opts);
    }
  };

})(typeof window !== 'undefined' ? window : this);
