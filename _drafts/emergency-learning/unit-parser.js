/* ============================================================
   רֶצֶף — פרסר-יחידות משותף  ·  מקור-אמת יחיד
   ------------------------------------------------------------
   נטען גם ב-unit-view.html (מנוע-התצוגה) וגם ב-qa-engine.js (בדיקות).
   כך שה-QA בודק את *אותה* לוגיקת-פרסור שהתלמיד רואה בפועל (עקרון 1).
   כלל: כל שינוי בפירוש-שאלה נעשה כאן — לא בשני מקומות.
   ============================================================ */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RetzefParser = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function stripMeta(s) {
    // מסיר תגי-מקור/מטא-מחבר שאסור שיגיעו לתלמיד
    return String(s)
      .replace(/`\[[^\]]*\]`/g, '')
      .replace(/\[(מקור|לאימות|source)[^\]]*\]/g, '')
      .replace(/\{error_type[^}]*\}/g, '')
      .replace(/`[^`]*`/g, '')
      .replace(/[ \t]{2,}/g, ' ');
  }

  function inline(s) { // **מודגש** ו-*נטוי* → HTML
    return esc(stripMeta(s))
      .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
      .replace(/\*([^*]+)\*/g, '<i>$1</i>');
  }

  function hexSoft(hex) { // פלטה רכה מאוד לרקע הרעיון
    var m = /^#?([0-9a-f]{6})$/i.exec(hex || ''); if (!m) return '#FBF3DE';
    var n = parseInt(m[1], 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return 'rgba(' + r + ',' + g + ',' + b + ',.10)';
  }

  function phaseOf(t) {
    if (/פתיח/.test(t)) return 1;
    if (/סיכום/.test(t)) return 4;
    if (/שאל|תיוג|ביצוע|סימולצי|תרגול|משימ|מחוון|תשוב|^משוב|בדיקה/.test(t)) return 3;
    return 2;
  }

  /* פיצול יחידה ל-3 רמות (basic/standard/advanced) — זהה למנוע-התצוגה */
  function splitLevels(raw) {
    var body = String(raw).replace(/^---[\s\S]*?---\s*/, '');
    var parts = body.split(/\n##\s+/).slice(1);
    var levels = {};
    parts.forEach(function (p) {
      var head = p.split('\n')[0];
      var k = /basic/i.test(head) ? 'basic' : /standard/i.test(head) ? 'standard' : /advanced/i.test(head) ? 'advanced' : null;
      if (k) levels[k] = p.slice(head.length);
    });
    var levelKeys = ['basic', 'standard', 'advanced'].filter(function (k) { return levels[k]; });
    var flatChunk = levelKeys.length ? null : parts.map(function (p) { return '\n### ' + p; }).join('');
    return { body: body, parts: parts, levels: levels, levelKeys: levelKeys, flatChunk: flatChunk, hasLevels: levelKeys.length > 0 };
  }

  /* פיצול טקסט לבלוקי-שאלות ("1. …", "2. …") */
  function questionBlocks(txt) {
    return String(txt).split(/\n(?=\d+\.\s)/).filter(function (b) { return /\d+\.\s/.test(b); });
  }

  /* ------------------------------------------------------------
     parseQuestion — הפירוש הקנוני של שאלה בודדת.
     מזהה שלושה מקורות-אפשרויות:
       inline : "שאלה? (א) x (ב) **y** (ג) z"   ← מה שהמנוע פיספס
       line   : "- א. x\n- ב. y **נכון**"
       none   : שאלה פתוחה
     מחזיר מבנה שממנו גם המנוע מרנדר HTML וגם ה-QA מסיק כשלים.
     ------------------------------------------------------------ */
  /* משחזר את האפשרות-הנכונה ממשוב שלא סימן bold/אות ישירה.
     שמרני במכוון: מיפוי-שגוי גרוע ממיפוי-חסר, לכן דורש התאמה חד-משמעית. */
  function normOpt(s) {
    return String(s).replace(/^[-*]?\s*[א-ת]\.\s*/, '').replace(/["״׳'.,!?:()–—-]/g, '').replace(/\s+/g, ' ').trim();
  }
  function resolveFromFeedback(feedback, options) {
    var fb = String(feedback || ''); if (!fb.trim()) return -1;
    // (א) אזכור-אות: "משפט ג" · "אפשרות ב" · "סעיף א" · "תשובה: ג" · "(ד)".
    //     האות חייבת לעמוד בפני-עצמה (אחריה גבול-מילה) — לא אות ראשונה של מילה.
    var lm = fb.match(/(?:משפט|אפשרות|סעיף|תגובה|פריט|תשובה|נכונה|הנכונה)\s*:?\s*\(?([א-ת])\)?(?=[\s.,:!)\]]|$)/)
          || fb.match(/\(([א-ת])\)/);
    if (lm) {
      var byLetter = options.map(function (o) { return o.letter; }).indexOf(lm[1]);
      if (byLetter >= 0) return byLetter;
    }
    // (ב) התאמת-שם ייחודית: בדיוק אפשרות אחת (באורך משמעותי) מופיעה כלשונה במשוב.
    var nfb = normOpt(fb);
    var hits = [];
    options.forEach(function (o, i) { var t = normOpt(o.text); if (t.length >= 3 && nfb.indexOf(t) >= 0) hits.push(i); });
    if (hits.length === 1) return hits[0];
    return -1;
  }
  function parseQuestion(block) {
    var lines = String(block).split('\n');
    var firstRaw = lines[0].replace(/^\s*\d+[.)]\s*/, '');
    var options = [], feedback = '', hint = '', fbLetter = null, sourceForm = 'none';

    // (1) אפשרויות-בשורה: "(א) … (ב) … (ג) …" בתוך שורת-השאלה
    var inlineRe = /\(([א-ת])\)/g, marks = [], mm;
    while ((mm = inlineRe.exec(firstRaw))) marks.push({ letter: mm[1], at: mm.index, end: inlineRe.lastIndex });
    var stem;
    if (marks.length >= 2) {
      sourceForm = 'inline';
      stem = firstRaw.slice(0, marks[0].at);
      for (var i = 0; i < marks.length; i++) {
        var segEnd = i + 1 < marks.length ? marks[i + 1].at : firstRaw.length;
        var seg = firstRaw.slice(marks[i].end, segEnd).trim();
        var correct = /\*\*[^*]+\*\*/.test(seg) || /—\s*נכון|נכון\s*$/.test(seg);
        var clean = stripMeta(seg)
          .replace(/^[—-]\s*/, '')
          .replace(/\s*[—-]?\s*\*\*נכון\*\*\s*$/, '')
          .replace(/\s*[—-]?\s*נכון\s*$/, '')
          .replace(/\*\*/g, '')
          .trim();
        options.push({ letter: marks[i].letter, text: clean, correct: correct });
      }
    } else {
      stem = firstRaw;
    }
    stem = stem.replace(/\*/g, '').trim();

    // (2) שורות-המשך: אפשרויות-בשורה · משוב (✅) · רמז (💡)
    lines.slice(1).forEach(function (l) {
      var raw = l.trim(); if (!raw) return;
      var lm = stripMeta(raw).trim();
      if (/[✅✓]/.test(raw)) {
        feedback = lm.replace(/^[-*]\s*/, '').replace(/^משוב:\s*/, '').replace(/[✅✓]\s*/, '').trim();
        var fm = feedback.match(/^([א-ת])[\s.]*נכון/) || feedback.match(/^([א-ת])\b/);
        if (fm) { fbLetter = fm[1]; feedback = feedback.replace(/^[א-ת][\s.]*נכון[.:]?\s*/, '').trim(); }
        feedback = feedback.replace(/^נכון\s*[—.-]?\s*/, '').trim();
      } else if (/💡/.test(raw)) {
        if (!/error_type/.test(raw)) hint = lm.replace(/^[-*]\s*/, '').replace(/💡\s*/, '').trim();
      } else if (sourceForm !== 'inline' && /^[-*]?\s*[א-ת]\.\s/.test(lm)) {
        sourceForm = 'line';
        var letter = (lm.match(/^[-*]?\s*([א-ת])\.\s/) || [])[1];
        var ok = /\*\*נכון\*\*|—\s*\*\*נכון|נכון\s*$/.test(raw);
        var clean = lm.replace(/^[-*]\s*/, '').replace(/\s*[—-]?\s*\*\*נכון\*\*/, '').replace(/\s*[—-]?\s*נכון\s*$/, '');
        options.push({ letter: letter, text: clean, correct: ok });
      }
    });

    var correctIndex = options.map(function (o) { return o.correct; }).indexOf(true);
    if (correctIndex < 0 && fbLetter) correctIndex = options.map(function (o) { return o.letter; }).indexOf(fbLetter);
    // כשאין סימון-נכון מפורש — משחזרים מהמשוב עצמו:
    //  (א) "תשובה: משפט ג" → אות · (ב) "תשובה: <שם-אפשרות מדויק>" → התאמת-טקסט ייחודית.
    if (correctIndex < 0 && options.length) correctIndex = resolveFromFeedback(feedback, options);

    return {
      stem: stem,
      options: options,
      correctIndex: correctIndex,
      feedback: feedback,
      hint: hint,
      type: options.length ? 'mcq' : 'open',
      sourceForm: sourceForm
    };
  }

  return {
    esc: esc, stripMeta: stripMeta, inline: inline, hexSoft: hexSoft, phaseOf: phaseOf,
    splitLevels: splitLevels, questionBlocks: questionBlocks, parseQuestion: parseQuestion
  };
});
