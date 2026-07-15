/* ============================================================
   רֶצֶף — שירות "ראיתי" (Seen · נראות אנושית)
   seen-service.js · שכבת שירות משותפת · מקור אמת יחיד ל"המורה ראה"
   מחבר בין: teacher-class-board.html (W2-02) → student-home.html (W1-01)
   נלווה ל: data-model.md (Submission.seen) · prd.md · checkin-service.js (אח מקביל)
   ------------------------------------------------------------
   👁️  מה השירות הזה עושה — במשפט אחד:

     כשהמורה לוחצת "ראיתי" על הגשה בלוח הכיתה, השירות הזה מעביר לתלמיד/ה
     סימן אנושי אחד — "המורה ראה/ראתה את מה שהגשת" — **בלי ציון, בלי ציון-משנה,
     בלי משוב.** רק נראות. רק לדעת שלא הגשת אל תוך חלל ריק.

   ------------------------------------------------------------
   ⚖️  למה מותר לשמור את זה (בניגוד ל-check-in הרגשי):

     ה-check-in הרגשי נשאר בזיכרון ונמחק (checkin-service.js) כי הוא חושף מצב נפשי
     של קטין — "מידע בעל רגישות מיוחדת". "ראיתי", לעומת זאת, הוא **עובדה תפעולית
     לא-רגישה (🟢)**: מורה עבר/ה על עבודה. אין בו mood, אין distress, אין ציון.
     לכן מותר וגם *רצוי* לשמור אותו — כי השמירה היא בדיוק מה שמאפשר לו להגיע
     לתלמיד/ה גם אם המסך שלו/ה נטען מאוחר יותר, במכשיר אחר, אחרי ריענון.

   ------------------------------------------------------------
   🔒 שני כללים שהקוד אוכף (לא רק מצהיר):

     1. **אף פעם לא ציון.** markSeen() מקלף כל שדה grade/score/mood/feedback שמישהו
        ינסה להעביר. "ראיתי" הוא נראות בלבד — assertNoGrade() מוכיח את זה ל-QA.
     2. **בלי חותמת-זמן מדויקת על הקטין.** נשמר "today" גס בלבד — לא שנייה מדויקת,
        בעקבות אותה מדיניות מינימיזציה של שאר המערכת.

   ------------------------------------------------------------
   שימוש:
     <script src="seen-service.js"></script>

     // צד המורה (teacher-class-board.html) — סימון "ראיתי":
     Resef.Seen.markSeen({
       studentId:'std_noa', studentName:'נועה בר-און',
       assignmentId:'unit', assignmentTitle:'שם הפועל',
       teacherName:'רותם לוי', teacherRole:'המחנכת', verb:'ראתה'
     });

     // צד התלמיד (student-home.html) — האזנה + השמעה חוזרת של מה שכבר נשמר:
     Resef.Seen.subscribeStudent('std_noa', function (rec) {
       showBanner(rec);   // rec.teacherName, rec.assignmentTitle … בלי grade
     });

     // דמו / איפוס:
     Resef.Seen.clearAll();
   ============================================================ */
(function (global) {
  'use strict';

  var STORE_KEY = 'resef.seen.v1';   // המפה הנשמרת: studentId → [רשומות]
  var PING_KEY  = 'resef.seen.ping'; // מפתח-דופק שמפעיל storage event בין טאבים
  var CHAN_NAME = 'resef-seen';      // ערוץ BroadcastChannel
  var MSG_TYPE  = 'resef-seen';      // סוג הודעת postMessage (גשר בין iframes)

  /* שדות אסורים — כל אלה מקולפים ב-markSeen. "ראיתי" ≠ הערכה. */
  var FORBIDDEN = ['grade', 'score', 'mark', 'points', 'mood', 'emotion',
                   'distress', 'feedback', 'rubric', 'comment', 'note'];

  var _seq = 0;
  var _listeners = [];      // מאזינים בתוך הדף הנוכחי
  var _delivered = {};      // eventId → true — מונע השמעה כפולה מכמה ערוצים
  var _relayed = {};        // eventId → true — מונע לולאת-ריליי בין iframes
  var _bc = null;           // BroadcastChannel אם נתמך

  function nextEventId() { _seq += 1; return 'seen_' + _seq + '_' + _seq * 7; }

  /* ---------- 1. אחסון מתמשך (localStorage) — מותר, כי לא-רגיש ---------- */
  function readStore() {
    try {
      var raw = global.localStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }
  function writeStore(map) {
    try { global.localStorage.setItem(STORE_KEY, JSON.stringify(map)); }
    catch (e) { /* מצב פרטי / חסום — נמשיך עם ערוצי-זיכרון בלבד */ }
  }

  /* ---------- 2. ניקוי הרשומה — הגנה שאוכפת "בלי ציון" ---------- */
  function sanitize(input) {
    input = input || {};
    var rec = {
      eventId:        input.eventId || nextEventId(),
      kind:           'submission',                 // סוג הנראות: הגשה נצפתה
      studentId:      input.studentId || null,
      studentName:    input.studentName || null,
      assignmentId:   input.assignmentId || 'default',
      assignmentTitle:input.assignmentTitle || 'המשימה',
      teacherName:    input.teacherName || 'המורה',
      teacherRole:    input.teacherRole || 'המורה',
      verb:           input.verb || 'ראה/ראתה',     // ניטרלי כברירת מחדל
      mode:           input.mode ||
                        (typeof Resef !== 'undefined' && typeof Resef.getMode === 'function'
                          ? Resef.getMode() : 'routine'),
      day:            'today'                        // גס במכוון — בלי timestamp מדויק
    };
    /* קילוף אכיפתי: אם הגיע ציון/משוב/מצב-רוח — הוא לא ישרוד לרשומה. */
    FORBIDDEN.forEach(function (k) { if (k in rec) delete rec[k]; });
    return rec;
  }

  /* ---------- 3. שמירת רשומה במפה (dedup לפי assignmentId) ---------- */
  function persist(rec) {
    if (!rec.studentId) return;
    var map = readStore();
    var arr = map[rec.studentId] || [];
    arr = arr.filter(function (r) { return r.assignmentId !== rec.assignmentId; });
    arr.push(rec);
    map[rec.studentId] = arr;
    writeStore(map);
  }

  /* ---------- 4. השמעה למאזינים בתוך הדף (dedup לפי eventId) ---------- */
  function dispatchLocal(rec) {
    if (!rec || !rec.eventId) return;
    if (_delivered[rec.eventId]) return;   // כבר הושמע כאן — לא פעמיים
    _delivered[rec.eventId] = true;
    _listeners.slice().forEach(function (fn) {
      try { fn(rec); } catch (e) { /* מאזין תקול לא מפיל את השאר */ }
    });
  }

  /* ---------- 5. ריליי בין מסגרות (iframes) — לדמו seen-flow.html ----------
     הגשר הזה מבטיח שהאירוע יעבור בין iframe של המורה ל-iframe של התלמיד
     גם כשה-storage event / BroadcastChannel לא זמינים (למשל file://).
     שומר-לולאה: כל מסמך מרלה כל eventId פעם אחת בלבד. */
  function postToFrames(payload, exclude) {
    var targets = [];
    try { if (global.parent && global.parent !== global) targets.push(global.parent); } catch (e) {}
    try { if (global.top && global.top !== global && global.top !== global.parent) targets.push(global.top); } catch (e) {}
    try {
      for (var i = 0; i < global.frames.length; i++) targets.push(global.frames[i]);
    } catch (e) {}
    targets.forEach(function (w) {
      if (w === exclude) return;
      try { w.postMessage(payload, '*'); } catch (e) {}
    });
  }
  function relay(rec, from) {
    if (!rec || !rec.eventId || _relayed[rec.eventId]) return;
    _relayed[rec.eventId] = true;
    postToFrames({ type: MSG_TYPE, rec: rec }, from);
  }

  /* ---------- 6. השמעה מלאה: מקומי + כל הערוצים ---------- */
  function broadcast(rec) {
    dispatchLocal(rec);                       // מנויים בדף הזה
    try { if (_bc) _bc.postMessage({ type: MSG_TYPE, rec: rec }); } catch (e) {}
    try { global.localStorage.setItem(PING_KEY, JSON.stringify({ rec: rec, r: rec.eventId })); } catch (e) {}
    relay(rec, null);                         // גשר ל-iframes
  }

  /* ---------- 7. קליטה מהערוצים החיצוניים ---------- */
  function ingest(rec, from) {
    if (!rec || !rec.eventId) return;
    dispatchLocal(rec);   // dedup פנימי מונע כפילות
    relay(rec, from);     // המשך העברה למסגרות אחרות (פעם אחת)
  }

  function initChannels() {
    /* 7א. BroadcastChannel — בין טאבים/מסגרות באותו origin */
    try {
      if (typeof global.BroadcastChannel === 'function') {
        _bc = new global.BroadcastChannel(CHAN_NAME);
        _bc.onmessage = function (e) {
          var d = e.data;
          if (d && d.type === MSG_TYPE && d.rec) ingest(d.rec, null);
          else if (d && d.type === 'clear') handleClear();
        };
      }
    } catch (e) { _bc = null; }

    /* 7ב. storage event — טאב אחר כתב ל-localStorage */
    try {
      global.addEventListener('storage', function (e) {
        if (!e) return;
        if (e.key === PING_KEY && e.newValue) {
          try { var d = JSON.parse(e.newValue); if (d && d.rec) ingest(d.rec, null); } catch (x) {}
        } else if (e.key === STORE_KEY && e.newValue == null) {
          handleClear();
        }
      });
    } catch (e) {}

    /* 7ג. postMessage — גשר בין iframes (seen-flow.html) */
    try {
      global.addEventListener('message', function (e) {
        var d = e && e.data;
        if (!d) return;
        if (d.type === MSG_TYPE && d.rec) ingest(d.rec, e.source);
        else if (d.type === 'resef-seen-clear') { handleClear(); relayClear(e.source); }
      });
    } catch (e) {}
  }

  /* ---------- 8. איפוס (דמו) ---------- */
  var _clearListeners = [];
  function handleClear() {
    _delivered = {}; _relayed = {};
    _clearListeners.slice().forEach(function (fn) { try { fn(); } catch (e) {} });
  }
  function relayClear(from) {
    postToFrames({ type: 'resef-seen-clear' }, from);
  }

  /* ============================================================
     ה-API הציבורי
     ============================================================ */
  var Resef = global.Resef || (global.Resef = {});
  var Seen = {};

  /* markSeen — המורה סימן/ה "ראיתי". שומר, ומשדר לכל מי שמאזין.
     קלט: { studentId, studentName?, assignmentId?, assignmentTitle?,
             teacherName?, teacherRole?, verb?, mode? }
     פלט: הרשומה שנשמרה (בלי שום שדה ציון — מובטח). */
  Seen.markSeen = function (input) {
    var rec = sanitize(input);
    persist(rec);
    broadcast(rec);
    return rec;
  };

  /* onSeen — מאזין לכל אירוע "ראיתי" נכנס (כל התלמידים). מחזיר off(). */
  Seen.onSeen = function (fn) {
    if (typeof fn !== 'function') return function () {};
    _listeners.push(fn);
    return function off() {
      var i = _listeners.indexOf(fn);
      if (i !== -1) _listeners.splice(i, 1);
    };
  };

  /* subscribeStudent — נוחות לצד-התלמיד:
     (1) משמיע מיד את מה שכבר נשמר עבור התלמיד/ה (replay),
     (2) ואז מאזין רק לאירועים ששייכים לאותו studentId.
     מחזיר off(). */
  Seen.subscribeStudent = function (studentId, fn) {
    if (typeof fn !== 'function') return function () {};
    // replay — הרשומה האחרונה שכבר קיימת באחסון
    var latest = Seen.latestForStudent(studentId);
    if (latest) { try { fn(latest); } catch (e) {} }
    // האזנה להמשך — מסונן ל-studentId
    return Seen.onSeen(function (rec) {
      if (rec.studentId === studentId) fn(rec);
    });
  };

  /* getForStudent — כל רשומות ה"ראיתי" של תלמיד/ה (עותק). */
  Seen.getForStudent = function (studentId) {
    var map = readStore();
    return (map[studentId] || []).slice();
  };

  /* latestForStudent — הרשומה העדכנית ביותר, או null. */
  Seen.latestForStudent = function (studentId) {
    var arr = Seen.getForStudent(studentId);
    return arr.length ? arr[arr.length - 1] : null;
  };

  /* isSeen — האם הגשה מסוימת כבר נצפתה (לצד המורה, לשמירת מצב הכפתור). */
  Seen.isSeen = function (studentId, assignmentId) {
    return Seen.getForStudent(studentId).some(function (r) {
      return r.assignmentId === (assignmentId || 'default');
    });
  };

  /* onClear — מאזין לאיפוס (דמו). מחזיר off(). */
  Seen.onClear = function (fn) {
    if (typeof fn !== 'function') return function () {};
    _clearListeners.push(fn);
    return function off() {
      var i = _clearListeners.indexOf(fn);
      if (i !== -1) _clearListeners.splice(i, 1);
    };
  };

  /* clearAll — מחיקת כל רשומות ה"ראיתי" (לדמו / החלפת משתמש). */
  Seen.clearAll = function () {
    try { global.localStorage.removeItem(STORE_KEY); } catch (e) {}
    try { global.localStorage.setItem(PING_KEY, JSON.stringify({ clear: true, r: nextEventId() })); } catch (e) {}
    try { if (_bc) _bc.postMessage({ type: 'clear' }); } catch (e) {}
    relayClear(null);
    handleClear();
  };

  /* ---------- QA / DPO ---------- */

  /* assertNoGrade — מוכיח שאין ולו שדה-ציון אחד באחסון "ראיתי".
     סורק את כל הרשומות ומחזיר { clean, findings }. */
  Seen.assertNoGrade = function () {
    var findings = [];
    var map = readStore();
    Object.keys(map).forEach(function (sid) {
      (map[sid] || []).forEach(function (rec) {
        FORBIDDEN.forEach(function (k) {
          if (k in rec) findings.push({ studentId: sid, assignmentId: rec.assignmentId, field: k });
        });
      });
    });
    return { clean: findings.length === 0, findings: findings };
  };

  /* describe — הצהרת המדיניות בקוד (לעמוד אימות / מסירה). */
  Seen.describe = function () {
    return {
      policy: '"ראיתי" — נראות אנושית, בלי ציון',
      delivers: 'סימן אחד לתלמיד/ה: "המורה ראה/ראתה את מה שהגשת"',
      stored: [
        'עובדה תפעולית לא-רגישה: מי-ראה-מה-הגשה (studentId + assignmentId)',
        'שם המורה + כותרת המשימה — לניסוח הבאנר בלבד'
      ],
      neverStored: FORBIDDEN.slice(),
      channels: ['listeners בדף', 'BroadcastChannel', 'storage event', 'postMessage בין iframes'],
      basis: 'נראות = עובדה תפעולית (🟢) · אין mood/ציון → מותר לשמור · data-model.md Submission.seen'
    };
  };

  Resef.Seen = Seen;
  initChannels();

})(typeof window !== 'undefined' ? window : this);
