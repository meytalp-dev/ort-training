/* ============================================================
   רֶצֶף — שירות מצב מערכת גלובלי (W0-04)
   system-mode.js · מקור אמת יחיד למצב המערכת (שגרה / מרחוק / חירום)
   ------------------------------------------------------------
   עיקרון: מתג אחד שמשנה כללי הפעלה בכל התצוגות — לא רק צבע.
   • המצב נשמר כ- data-mode על <html>, ומושך צבעים מ-tokens.css (בלי צבע קשיח).
   • כללי ההפעלה (עומס · check-in · ברירת משך) הם *נתונים* ב-MODE_CONFIG,
     כדי שכל תצוגה תצרוך את אותה לוגיקה במקום לשכפל if-ים.
   • שינוי מצב => אירוע 'resef:modechange' על document; כל תצוגה מאזינה ומתעדכנת.
   • חירום = כתום רגוע (--emergency), לא אדום. אדום שמור להתראה נקודתית.

   שימוש בסיסי:
     <html data-mode="routine">  (או ריק — ברירת מחדל שגרה)
     <script src="tokens.css">... <script src="system-mode.js"></script>
     Resef.setMode('emergency', { reason:'החלטת מנהל' });
     Resef.getMode();            // 'emergency'
     Resef.getRules();           // כללי ההפעלה של המצב הפעיל
     Resef.onModeChange(fn);     // מאזין (מוחזרת פונקציית ביטול)
   ============================================================ */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'resef.systemMode';
  var MODES = ['routine', 'remote', 'emergency'];

  /* --- כללי ההפעלה לכל מצב (נתונים, לא קוד מסועף) ---
     load     — עומס יומי: כמה, האם רשות, ומשפט לתלמיד.
     checkin  — סוג ה-check-in: יחיד ("מה נלמד היום") מול 4-אפשרויות בחירום.
                🔒 מזעור: check-in מתריע ונמחק — בלי היסטוריה רגשית (security-minimization).
     duration — ברירת מחדל של משך יחידה (מיושר ל-LearningDuration של W0-05).
     בכל מצב הצבע נמשך אוטומטית דרך [data-mode] ב-tokens.css. */
  var MODE_CONFIG = {
    routine: {
      key: 'routine',
      label: 'שגרה',
      headline: 'שגרה — הוראה שוטפת',
      tagline: 'המורה קובע את מבנה השיעור והזמן.',
      colorVar: '--routine',
      load: {
        level: 'full',
        maxDailyUnits: null,      // null = ללא תקרה מובנית; המורה קובע
        optional: false,
        label: 'עומס מלא — לפי מבנה השיעור של המורה'
      },
      checkin: {
        type: 'single',
        prompt: 'מה נלמד היום?',
        options: [{ id: 'start', label: 'מתחילים' }]
      },
      duration: {
        mode: 'teacher_controlled',
        targetMinutes: null,
        label: 'בהנחיית המורה'
      },
      rescuePath: false
    },
    remote: {
      key: 'remote',
      label: 'מרחוק',
      headline: 'מרחוק — למידה מהבית',
      tagline: 'משימות א-סינכרוניות, שמירת רצף, ניטור השתתפות.',
      colorVar: '--remote',
      load: {
        level: 'medium',
        maxDailyUnits: 3,
        optional: false,
        label: 'עומס מותאם — עד 3 משימות א-סינכרוניות'
      },
      checkin: {
        type: 'single',
        prompt: 'מוכנים להתחיל?',
        options: [{ id: 'start', label: 'מתחילים' }]
      },
      duration: {
        mode: 'estimated',
        targetMinutes: 12,
        label: 'כ-10–15 דקות · בקצב שלך'
      },
      rescuePath: false
    },
    emergency: {
      key: 'emergency',
      label: 'חירום',
      headline: 'חירום — קשר ורצף',
      tagline: 'עומס מופחת, check-in קצר, יחידות קצרות ומסלול הצלה.',
      colorVar: '--emergency',
      load: {
        level: 'light',
        maxDailyUnits: 1,
        optional: true,          // בחירום — למידה רשות, לא חובה
        label: 'עומס מופחת — יחידה אחת קצרה (רשות)'
      },
      checkin: {
        type: 'four',
        prompt: 'איך מתחילים היום?',
        options: [
          { id: 'ready',   label: 'מוכן/ה' },
          { id: 'slow',    label: 'להתחיל לאט' },
          { id: 'help',    label: 'צריך/ה עזרה' },
          { id: 'notnow',  label: 'לא יכול/ה עכשיו' }
        ]
      },
      duration: {
        mode: 'self_paced',
        targetMinutes: 5,
        label: 'כ-5 דקות · אפשר לעצור ולהמשיך'
      },
      rescuePath: true            // מסלול הצלה קצר משמעותית מהמלא
    }
  };

  /* --- מצב פנימי --- */
  var listeners = [];

  function isMode(m) { return MODES.indexOf(m) !== -1; }

  function root() {
    return document.documentElement;
  }

  function readStored() {
    try {
      var v = global.localStorage && global.localStorage.getItem(STORAGE_KEY);
      return isMode(v) ? v : null;
    } catch (e) { return null; }
  }

  function writeStored(m) {
    try {
      if (global.localStorage) global.localStorage.setItem(STORAGE_KEY, m);
    } catch (e) { /* אחסון חסום — ממשיכים בלי לשמור */ }
  }

  /* המצב הנוכחי: נשמר > data-mode על <html> > ברירת מחדל שגרה */
  function currentMode() {
    var attr = root().getAttribute('data-mode');
    if (isMode(attr)) return attr;
    var stored = readStored();
    return stored || 'routine';
  }

  function getRules(mode) {
    var m = isMode(mode) ? mode : currentMode();
    return MODE_CONFIG[m];
  }

  /* --- ברירת משך לפי מצב (מיושר ל-LearningDuration של W0-05) ---
     allowExtension תמיד true — לתלמיד עם קשיי קשב, לעצור ולהמשיך זה ברירת מחדל. */
  function defaultDuration(mode) {
    var d = getRules(mode).duration;
    return {
      mode: d.mode,
      targetMinutes: d.targetMinutes,
      allowExtension: true,
      label: d.label
    };
  }

  /* --- החלת המצב על ה-DOM + הפצת אירוע --- */
  function applyMode(mode, meta) {
    var prev = root().getAttribute('data-mode') || 'routine';
    root().setAttribute('data-mode', mode);

    var detail = {
      mode: mode,
      prev: prev,
      rules: MODE_CONFIG[mode],
      reason: (meta && meta.reason) || null,
      silent: !!(meta && meta.silent)
    };

    // אירוע DOM — כל תצוגה מאזינה ומתעדכנת (מקור אמת אחד, בלי לוגיקה כפולה)
    try {
      document.dispatchEvent(new CustomEvent('resef:modechange', { detail: detail }));
    } catch (e) {
      // דפדפן ישן — fallback ידני
      var evt = document.createEvent('CustomEvent');
      evt.initCustomEvent('resef:modechange', false, false, detail);
      document.dispatchEvent(evt);
    }

    listeners.slice().forEach(function (fn) {
      try { fn(detail); } catch (e) { /* מאזין תקול לא מפיל את השאר */ }
    });
    return detail;
  }

  /* --- ה-API הציבורי --- */
  var Resef = global.Resef || (global.Resef = {});

  Resef.MODES = MODES.slice();
  Resef.MODE_CONFIG = MODE_CONFIG;

  Resef.getMode = currentMode;
  Resef.getRules = getRules;
  Resef.defaultDuration = defaultDuration;

  /* שינוי מצב. meta.reason — סיבה (לתיעוד/אישור בתצוגת המנהל, W3-02).
     meta.silent — לא לשמור לאחסון (למשל תרגולת / תצוגה מקדימה). */
  Resef.setMode = function (mode, meta) {
    if (!isMode(mode)) {
      throw new Error('Resef.setMode: מצב לא חוקי "' + mode + '" (מותר: ' + MODES.join(', ') + ')');
    }
    if (!(meta && meta.silent)) writeStored(mode);
    return applyMode(mode, meta);
  };

  /* רישום מאזין. מחזיר פונקציה שמבטלת את הרישום. */
  Resef.onModeChange = function (fn) {
    if (typeof fn !== 'function') return function () {};
    listeners.push(fn);
    return function off() {
      var i = listeners.indexOf(fn);
      if (i !== -1) listeners.splice(i, 1);
    };
  };

  /* מחזיר HTML של ModeChip (תווית מצב) — טקסט + אייקון-קו + צבע-מצב.
     לא-רק-צבע: תמיד עם מלל, מיושר לנגישות (WCAG AA). */
  Resef.modeChipHTML = function (mode) {
    var r = getRules(mode || currentMode());
    return '<span class="resef-mode-chip" data-for-mode="' + r.key + '">' +
             '<svg class="resef-mode-chip__mark" width="20" height="14" viewBox="0 0 20 14" ' +
             'aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" ' +
             'stroke-linecap="round"><path d="M2 7h4M9 7h2M14 7h4"/>' +
             '<circle cx="7.5" cy="7" r="1.6" fill="currentColor" stroke="none"/></svg>' +
             '<span>' + r.label + '</span>' +
           '</span>';
  };

  /* --- אתחול: קבע data-mode בעליית הדף (אם עוד לא נקבע במפורש) --- */
  function init() {
    var attr = root().getAttribute('data-mode');
    var start = isMode(attr) ? attr : (readStored() || 'routine');
    // silent: אתחול לא מפיץ "מעבר" למשתמשים; רק מיישר את ה-DOM.
    root().setAttribute('data-mode', start);
    // הודעה ראשונית למאזינים שכבר נרשמו לפני load (אם יש)
    applyMode(start, { silent: true, initial: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  Resef.init = init;

})(typeof window !== 'undefined' ? window : this);
