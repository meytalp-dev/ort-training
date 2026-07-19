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

  /* מחלץ את גוף מקטע(י)-השאלות מתוך רמה — כמו parseSections במנוע-התצוגה:
     סמן = "### כותרת" או "**כותרת:**"; מחזיר את גוף המקטעים שכותרתם כוללת "שאל".
     כך ה-QA בודק את אותן שאלות שהתלמיד רואה, בלי לכלול פתיח/הסבר/דוגמה. */
  function questionText(chunk) {
    chunk = String(chunk);
    var marks = [], m;
    var re1 = /(?:^|\n)###\s+([^\n]+)/g;
    while ((m = re1.exec(chunk))) marks.push({ title: m[1].trim(), start: m.index + m[0].indexOf('###'), cs: re1.lastIndex });
    var re2 = /\*\*([^*\n]+?):\*\*/g;
    while ((m = re2.exec(chunk))) marks.push({ title: m[1].trim().replace(/\s*\(\d+\)\s*[—-]?.*$/, ''), start: m.index, cs: re2.lastIndex });
    // כותרות רלוונטיות-לשאלה: שאלות + מקטעי-מחוון/תשובה/משוב (הם חלק מההערכה,
    // ולכן חייבים להישאר מחוברים לשאלה כדי ש-hasRubric יזהה אותם).
    var Q = /שאל|מחוון|תשוב|^משוב|פתרון|רובריק/;
    if (!marks.length) return /שאל/.test(chunk) ? chunk : '';   // בלי סמנים — אם יש "שאל" ניקח הכל
    marks.sort(function (a, b) { return a.start - b.start; });
    var out = [];
    for (var i = 0; i < marks.length; i++) {
      if (!Q.test(marks[i].title)) continue;
      var end = i + 1 < marks.length ? marks[i + 1].start : chunk.length;
      // כלול גם את שורת-הסמן עצמה (למשל "**מחוון:**") כדי ש-hasRubric יתפוס
      out.push((/שאל/.test(marks[i].title) ? '' : marks[i].title + ': ') + chunk.slice(marks[i].cs, end));
    }
    return out.join('\n');
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
  /* זיהוי שאלת נכון/לא-נכון שנכתבה כפרוזה + משוב ✅.
     מומרת ל-2 אפשרויות (נכון/לא-נכון) → משתמשת בכל תשתית-ה-MCQ הקיימת.
     ה"נכון" נגזר מהמשוב: "לא נכון"/"שגוי" → הקביעה שגויה. */
  function detectTrueFalse(stem, feedback) {
    if (!feedback || !feedback.trim()) return null;
    if (!/נכון\s*או\s*לא\s*נכון|נכון\s*\/\s*לא.?נכון|נכון\s*או\s*שגוי|האם\s[\s\S]*\bנכון\b/.test(stem)) return null;
    var isFalse = /לא\s*נכון|שגוי|לא\s*מדויק|לא\s*תמיד|לא\s*בהכרח/.test(feedback);
    var isTrue = !isFalse && /נכון|מדויק|אכן|בהחלט/.test(feedback);
    if (!isFalse && !isTrue) return null;
    var correctVal = !isFalse;
    return {
      options: [
        { letter: 'נ', text: 'נכון', correct: correctVal },
        { letter: 'ל', text: 'לא נכון', correct: !correctVal }
      ],
      correctIndex: correctVal ? 0 : 1
    };
  }

  /* ---- שיטות-הערכה אינטראקטיביות (משפחת בחירה/סגור) · DSL אחיד ----
     תגית בסוף-הגזע בוחרת רכיב:  {סידור} {התאמה} {מיון}  (או order/match/sort).
     שורות-פריט:  "- A :: B"  (התאמה/מיון)  ·  "- A"  (סידור, בסדר-הנכון).
     כל הלוגיקה (עירבוב-דטרמיניסטי + אימות) טהורה כאן → נבדקת ב-node,
     שכבת-ה-DOM דקה ומחווטת לפונקציות האלה. */
  var METHOD_TAGS = [
    { re: /\{\s*(סידור|order)\s*\}/, m: 'order' },
    { re: /\{\s*(התאמה|match)\s*\}/, m: 'match' },
    { re: /\{\s*(מיון|sort)\s*\}/, m: 'sort' }
  ];
  function methodTag(s) {
    for (var i = 0; i < METHOD_TAGS.length; i++) if (METHOD_TAGS[i].re.test(s)) return METHOD_TAGS[i];
    return null;
  }
  // עירבוב דטרמיניסטי (Fisher–Yates עם מחולל-זרע) — בלי Math.random, לכן ניתן-לבדיקה.
  function seededShuffle(arr, seed) {
    var a = arr.slice(), s = (seed >>> 0) || 1;
    for (var i = a.length - 1; i > 0; i--) {
      s = (s * 1664525 + 1013904223) >>> 0;
      var j = s % (i + 1);
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  // אימות טהור — מחזיר {ok, correct:[bool...]} מול הפתרון-הנכון.
  function checkOrder(userIdx, n) {          // userIdx = הסדר שהתלמיד בנה (אינדקסים למקור-הנכון)
    var res = userIdx.map(function (v, i) { return v === i; });
    return { ok: res.every(Boolean), correct: res };
  }
  function checkAssign(userCats, correctCats) { // מיון: לכל פריט הקטגוריה שנבחרה מול הנכונה
    var res = correctCats.map(function (c, i) { return userCats[i] === c; });
    return { ok: res.every(Boolean), correct: res };
  }
  function parseInteractive(firstRaw, lines, tag) {
    var stem = firstRaw.replace(tag.re, '').replace(/\*/g, '').trim();
    var feedback = '', hint = '', items = [], pairs = [];
    lines.slice(1).forEach(function (l) {
      var raw = l.trim(); if (!raw) return;
      if (/^#/.test(raw)) return;
      var lm = stripMeta(raw).trim();
      if (/[✅✓]/.test(raw)) { feedback = lm.replace(/^[-*]\s*/, '').replace(/^משוב:\s*/, '').replace(/[✅✓]\s*/, '').trim(); return; }
      if (/💡/.test(raw)) { hint = lm.replace(/^[-*]\s*/, '').replace(/💡\s*/, '').trim(); return; }
      var im = lm.match(/^[-*]\s*(.+)$/); if (!im) return;
      var parts = im[1].split(/\s*::\s*/);
      if (parts.length >= 2) pairs.push({ l: parts[0].replace(/\*/g, '').trim(), r: parts[1].replace(/\*/g, '').trim() });
      else items.push(im[1].replace(/\*/g, '').trim());
    });
    var out = { stem: stem, feedback: feedback, hint: hint, method: tag.m, type: 'interactive', options: [], correctIndex: -1, sourceForm: 'none' };
    if (tag.m === 'order') out.items = items;                 // בסדר-הנכון
    else { out.pairs = pairs; }                               // match/sort: זוגות
    return out;
  }

  function parseQuestion(block) {
    var lines = String(block).split('\n');
    var firstRaw = lines[0].replace(/^\s*\d+[.)]\s*/, '');
    var options = [], feedback = '', hint = '', fbLetter = null, sourceForm = 'none';

    // (0) שיטה אינטראקטיבית מתויגת — מסלול-פרסור נפרד.
    var tag = methodTag(firstRaw);
    if (tag) return parseInteractive(firstRaw, lines, tag);

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

    // (2) שורות-המשך: אפשרויות-בשורה · משוב (✅) · רמז (💡) · המשך-שאלה (פרוזה לפני האפשרויות)
    var stemExtra = '', sawOptOrFb = false;
    lines.slice(1).forEach(function (l) {
      var raw = l.trim(); if (!raw) return;
      if (/^#/.test(raw)) { sawOptOrFb = true; return; }           // גבול-מקטע — עוצר צבירת-גזע
      var lm = stripMeta(raw).trim();
      if (/[✅✓]/.test(raw)) {
        sawOptOrFb = true;
        feedback = lm.replace(/^[-*]\s*/, '').replace(/^משוב:\s*/, '').replace(/[✅✓]\s*/, '').trim();
        var fm = feedback.match(/^([א-ת])[\s.]*נכון/) || feedback.match(/^([א-ת])\b/);
        if (fm) { fbLetter = fm[1]; feedback = feedback.replace(/^[א-ת][\s.]*נכון[.:]?\s*/, '').trim(); }
        feedback = feedback.replace(/^נכון\s*[—.-]?\s*/, '').trim();
      } else if (/💡/.test(raw)) {
        if (!/error_type/.test(raw)) hint = lm.replace(/^[-*]\s*/, '').replace(/💡\s*/, '').trim();
      } else if (sourceForm !== 'inline' && /^[-*]?\s*[א-ת]\.\s/.test(lm)) {
        sawOptOrFb = true;
        sourceForm = 'line';
        var letter = (lm.match(/^[-*]?\s*([א-ת])\.\s/) || [])[1];
        var ok = /\*\*נכון\*\*|—\s*\*\*נכון|נכון\s*$/.test(raw);
        var clean = lm.replace(/^[-*]\s*/, '').replace(/\s*[—-]?\s*\*\*נכון\*\*/, '').replace(/\s*[—-]?\s*נכון\s*$/, '');
        options.push({ letter: letter, text: clean, correct: ok });
      } else if (!sawOptOrFb && lm && !/^error_type\s*:|^\[מקור|^\*?\*?מסיחים/.test(lm)) {
        // המשך-שאלה (למשל משפט-ההיגד ב"נכון או לא נכון") — נצבר לגזע לפני האפשרויות.
        stemExtra += (stemExtra ? ' ' : '') + lm.replace(/\*/g, '').trim();
      }
    });
    if (stemExtra) stem = (stem ? stem + ' ' : '') + stemExtra;

    var correctIndex = options.map(function (o) { return o.correct; }).indexOf(true);
    if (correctIndex < 0 && fbLetter) correctIndex = options.map(function (o) { return o.letter; }).indexOf(fbLetter);
    // כשאין סימון-נכון מפורש — משחזרים מהמשוב עצמו:
    //  (א) "תשובה: משפט ג" → אות · (ב) "תשובה: <שם-אפשרות מדויק>" → התאמת-טקסט ייחודית.
    if (correctIndex < 0 && options.length) correctIndex = resolveFromFeedback(feedback, options);

    // אין אפשרויות מפורשות → נסה נכון/לא-נכון (פרוזה + משוב).
    var method = options.length ? (sourceForm === 'inline' ? 'mcq' : 'mcq') : 'open';
    if (!options.length) {
      var tf = detectTrueFalse(stem, feedback);
      if (tf) {
        options = tf.options; correctIndex = tf.correctIndex; method = 'truefalse';
        stem = stem.replace(/^נכון\s*או\s*לא\s*נכון\s*[:—.-]?\s*/, '').trim() || stem;
      }
    }

    return {
      stem: stem,
      options: options,
      correctIndex: correctIndex,
      feedback: feedback,
      hint: hint,
      type: options.length ? 'mcq' : 'open',
      method: method,
      sourceForm: sourceForm
    };
  }

  return {
    esc: esc, stripMeta: stripMeta, inline: inline, hexSoft: hexSoft, phaseOf: phaseOf,
    splitLevels: splitLevels, questionBlocks: questionBlocks, questionText: questionText, parseQuestion: parseQuestion,
    seededShuffle: seededShuffle, checkOrder: checkOrder, checkAssign: checkAssign
  };
});
