/* ============================================================
   רֶצֶף — שירות התקדמות (Progress · מאגר הגשות אמיתי)
   progress-service.js · שכבת שירות משותפת · מקור אמת יחיד לתוצאות-תרגול
   מחבר בין: practice-engine.html (כותב) → assign-practice.html / class-tracking.html (קוראים)
   נלווה ל: data-model.md v3.0 §3.7 (Submission) · §3.4 (level↔support_level) · seen-service.js (אח מקביל)
   ------------------------------------------------------------
   📊  מה השירות הזה עושה — במשפט אחד:

     כשתלמיד/ה מסיים/ת תרגול או בוחן, השירות רושם **הגשה אחת** עם
     "סימני-הרגע" (איך עבד/ה — לא רק כמה נכון) ושומר אותה לכל תלמיד לאורך זמן.
     זה המאגר שממנו נגזרת ההמלצה על מסלול (מתקשה/רגיל/אתגר).

   ------------------------------------------------------------
   🎯  העיקרון (data-model.md §3.7, שורה 535):

     האות האמיתי איננו הציון — אלא **סימני-הרגע**: האם נעזר ברמז?
     האם התאושש מטעות? האם שלט בליבה או בליבה+הרחבה? באיזו רמת-תמיכה עבד?
     הציון (grade) נשמר **רק על מופע-הערכה** (assessment), אישי לתלמיד+מורה.
     על תרגול רגיל — אין ציון. יש רק סימני-רגע.

   ------------------------------------------------------------
   🔒  מינימיזציה (security-minimization.md §3):
     • חותמת גסה בלבד — `day` (תאריך), לא שנייה מדויקת. אין משך, אין activeSeconds.
     • סימני-הרגע הם enum/בוליאן גסים פר-הגשה — לא מעקב רציף.
     • grade מקולף אוטומטית מכל הגשה שאיננה assessment.

   ------------------------------------------------------------
   מיפוי קנוני (data-model.md §3.4, שורה 18) — track ↔ support_level:
       basic     ↔ with_you  ↔ "מתקשה"
       standard  ↔ on_own    ↔ "רגיל"
       advanced  ↔ ahead     ↔ "אתגר"
     התלמיד לא רואה את שם המסלול — הוא מופיע רק במסכי-המורה.

   ------------------------------------------------------------
   שימוש:
     <script src="seed-pilot.js"></script>   <!-- אופציונלי — לזריעת ההגשות הקיימות -->
     <script src="progress-service.js"></script>

     // צד התלמיד/מנוע (practice-engine) — רישום הגשה בסיום:
     Resef.Progress.record({
       studentId:'std_01', unitId:'unt_mishpat_test', unitType:'assessment',
       support_level:'on_own', mastery:'core',
       hint_used:true, recovered_after_error:true, grade:80
     });

     // צד המורה (assign-practice / class-tracking) — המלצת-מסלול + היסטוריה:
     var s = Resef.Progress.suggestTrack('std_01');   // {track:'basic', support_level, why}
     var hist = Resef.Progress.getForStudent('std_01');

     // האזנה חיה (עדכון בין טאבים):
     var off = Resef.Progress.onChange(function(){ redraw(); });

     // דמו / איפוס:
     Resef.Progress.clearAll();
   ============================================================ */
(function (global) {
  'use strict';

  var STORE_KEY = 'resef.progress.v1';   // המפה: studentId → [הגשות]
  var SEED_FLAG = 'resef.progress.seeded';
  var PING_KEY  = 'resef.progress.ping';  // דופק לאירוע storage בין טאבים
  var CHAN_NAME = 'resef-progress';
  var MSG_TYPE  = 'resef-progress';

  /* מיפוי קנוני track ↔ support_level ↔ תווית-מורה */
  var TRACK_OF_SUPPORT = { with_you: 'basic', on_own: 'standard', ahead: 'advanced' };
  var SUPPORT_OF_TRACK = { basic: 'with_you', standard: 'on_own', advanced: 'ahead' };
  var LABELS = { basic: 'מתקשה', standard: 'רגיל', advanced: 'אתגר' };

  var _seq = 0;
  var _listeners = [];
  var _bc = null;

  function nextId() { _seq += 1; return 'sub_live_' + _seq + '_' + _seq * 13; }

  /* ---------- אחסון ---------- */
  function readStore() {
    try { var raw = global.localStorage.getItem(STORE_KEY); return raw ? JSON.parse(raw) : {}; }
    catch (e) { return {}; }
  }
  function writeStore(map) {
    try { global.localStorage.setItem(STORE_KEY, JSON.stringify(map)); } catch (e) {}
  }

  /* ---------- ניקוי/מינימיזציה של רשומה (אוכף §3.7) ---------- */
  function sanitize(input) {
    input = input || {};
    var unitType = input.unitType === 'assessment' ? 'assessment' : 'task';
    // support_level — מתקבל ישירות, או נגזר מ-track אם הועבר כך
    var sup = input.support_level ||
              (input.track && SUPPORT_OF_TRACK[input.track]) || null;
    if (sup && !TRACK_OF_SUPPORT[sup]) sup = null;   // ערך לא-חוקי → null

    var rec = {
      id:                    input.id || nextId(),
      studentId:             input.studentId || null,
      unitId:                input.unitId || null,
      assignmentId:          input.assignmentId || null,
      unitType:              unitType,
      support_level:         sup,                                  // with_you/on_own/ahead
      mastery:               input.mastery === 'full' ? 'full' :
                               input.mastery === 'core' ? 'core' : null,
      hint_used:             !!input.hint_used,
      recovered_after_error: !!input.recovered_after_error,
      rescue_path:           !!input.rescue_path,
      // ציון — רק על מופע-הערכה. על משימה רגילה מקולף ל-null (§3.7 שורה 525).
      grade:                 unitType === 'assessment' && input.grade != null
                               ? Number(input.grade) : null,
      mode:                  input.mode ||
                               (global.Resef && typeof global.Resef.getMode === 'function'
                                 ? global.Resef.getMode() : 'routine'),
      // חותמת גסה בלבד — תאריך, לא שעה מדויקת (מינימיזציה §3)
      day:                   input.day || 'today',
      status:                input.status || 'completed'
    };
    return rec;
  }

  /* ---------- שמירה (append פר-תלמיד) ---------- */
  function persist(rec) {
    if (!rec.studentId) return;
    var map = readStore();
    var arr = map[rec.studentId] || [];
    arr.push(rec);
    map[rec.studentId] = arr;
    writeStore(map);
  }

  /* ---------- השמעה למאזינים + ערוצים ---------- */
  function dispatchLocal(rec) {
    _listeners.slice().forEach(function (fn) { try { fn(rec); } catch (e) {} });
  }
  function broadcast(rec) {
    dispatchLocal(rec);
    try { if (_bc) _bc.postMessage({ type: MSG_TYPE, rec: rec }); } catch (e) {}
    try { global.localStorage.setItem(PING_KEY, JSON.stringify({ r: rec.id })); } catch (e) {}
  }
  function initChannels() {
    try {
      if (typeof global.BroadcastChannel === 'function') {
        _bc = new global.BroadcastChannel(CHAN_NAME);
        _bc.onmessage = function (e) {
          var d = e.data;
          if (d && d.type === MSG_TYPE) dispatchLocal(d.rec || null);
          else if (d && d.type === 'clear') dispatchLocal(null);
        };
      }
    } catch (e) { _bc = null; }
    try {
      global.addEventListener('storage', function (e) {
        if (!e) return;
        if (e.key === PING_KEY) dispatchLocal(null);           // מישהו כתב בטאב אחר
        else if (e.key === STORE_KEY && e.newValue == null) dispatchLocal(null);
      });
    } catch (e) {}
  }

  /* ---------- זריעה חד-פעמית מנתוני-הפיילוט ---------- */
  // ממפה את PILOT_SEED.submissions (assignment_id → unit) לשכבת-האחסון.
  function seedFromPilot() {
    var seed = global.PILOT_SEED;
    if (!seed || !seed.submissions) return;
    try { if (global.localStorage.getItem(SEED_FLAG)) return; } catch (e) {}
    var map = readStore();
    if (Object.keys(map).length) { markSeeded(); return; }  // כבר יש נתונים חיים

    var unitOfAssignment = {};
    (seed.assignments || []).forEach(function (a) { unitOfAssignment[a.id] = a.content_unit_id; });
    var typeOfUnit = {};
    (seed.contentUnits || []).forEach(function (u) { typeOfUnit[u.id] = u.unit_type || 'task'; });

    seed.submissions.forEach(function (s) {
      var unitId = unitOfAssignment[s.assignment_id] || null;
      var rec = sanitize({
        id: s.id, studentId: s.student_id, unitId: unitId, assignmentId: s.assignment_id,
        unitType: unitId ? (typeOfUnit[unitId] || 'task') : 'task',
        support_level: s.support_level, mastery: s.mastery,
        hint_used: s.hint_used, recovered_after_error: s.recovered_after_error,
        rescue_path: s.rescue_path, grade: s.grade,
        mode: s.mode, status: s.status,
        day: (s.completed_at ? String(s.completed_at).slice(0, 10) : 'today')
      });
      persist(rec);
    });
    markSeeded();
  }
  function markSeeded() { try { global.localStorage.setItem(SEED_FLAG, '1'); } catch (e) {} }

  /* ============================================================
     ה-API הציבורי
     ============================================================ */
  var Resef = global.Resef || (global.Resef = {});
  var Progress = {};

  Progress.LABELS = LABELS;
  Progress.trackOfSupport = function (sup) { return TRACK_OF_SUPPORT[sup] || null; };
  Progress.supportOfTrack = function (tr) { return SUPPORT_OF_TRACK[tr] || null; };
  Progress.trackLabel = function (tr) { return LABELS[tr] || tr; };

  /* record — רישום הגשה חדשה. מחזיר את הרשומה שנשמרה. */
  Progress.record = function (input) {
    var rec = sanitize(input);
    persist(rec);
    broadcast(rec);
    return rec;
  };

  /* getForStudent — כל ההגשות של תלמיד/ה (עותק, לפי סדר הרישום). */
  Progress.getForStudent = function (studentId) {
    var map = readStore();
    return (map[studentId] || []).slice();
  };

  /* latestForStudent — ההגשה שהושלמה אחרונה (או null). */
  Progress.latestForStudent = function (studentId) {
    var arr = Progress.getForStudent(studentId).filter(function (r) {
      return r.status === 'completed';
    });
    return arr.length ? arr[arr.length - 1] : null;
  };

  /* getForUnit — כל ההגשות ליחידה מסוימת (חתך על פני התלמידים). */
  Progress.getForUnit = function (unitId) {
    var out = [], map = readStore();
    Object.keys(map).forEach(function (sid) {
      map[sid].forEach(function (r) { if (r.unitId === unitId) out.push(r); });
    });
    return out;
  };

  /* all — כל ההגשות (שטוח). */
  Progress.all = function () {
    var out = [], map = readStore();
    Object.keys(map).forEach(function (sid) { map[sid].forEach(function (r) { out.push(r); }); });
    return out;
  };

  /* suggestTrack — המלצת-מסלול מסימני-הרגע של ההגשה האחרונה.
     מקור-אמת יחיד להיגיון-ההמלצה (הועבר מ-assign-practice.suggestLevel).
     מחזיר {track, support_level, why}. ברירת-מחדל: "רגיל".
     ⚠️ זו הצעה בלבד — ההקצאה בפועל טעונה אישור מורה (שלב 3). */
  Progress.suggestTrack = function (studentId) {
    var last = Progress.latestForStudent(studentId);
    if (!last) return { track: 'standard', support_level: 'on_own', why: 'ברירת מחדל (אין ביצוע קודם)' };
    var track, why;
    if (last.support_level === 'with_you' || (last.hint_used && !last.recovered_after_error)) {
      track = 'basic'; why = 'נעזר ברמז / התקשה';
    } else if (last.mastery === 'full' && !last.hint_used) {
      track = 'advanced'; why = 'שלט בליבה+הרחבה בלי רמז';
    } else {
      track = 'standard'; why = 'עבד בקצב, התאושש מטעות';
    }
    return { track: track, support_level: SUPPORT_OF_TRACK[track], why: why };
  };

  /* onChange — מאזין לכל שינוי במאגר (רישום חדש / איפוס / עדכון בין טאבים).
     ה-callback מקבל את הרשומה החדשה אם ידועה, אחרת null. מחזיר off(). */
  Progress.onChange = function (fn) {
    if (typeof fn !== 'function') return function () {};
    _listeners.push(fn);
    return function off() { var i = _listeners.indexOf(fn); if (i !== -1) _listeners.splice(i, 1); };
  };

  /* clearAll — מחיקת המאגר כולו (דמו / החלפת משתמש). זורע מחדש מהפיילוט. */
  Progress.clearAll = function () {
    try { global.localStorage.removeItem(STORE_KEY); } catch (e) {}
    try { global.localStorage.removeItem(SEED_FLAG); } catch (e) {}
    try { global.localStorage.setItem(PING_KEY, JSON.stringify({ clear: 1 })); } catch (e) {}
    try { if (_bc) _bc.postMessage({ type: 'clear' }); } catch (e) {}
    seedFromPilot();
    dispatchLocal(null);
  };

  /* describe — הצהרת מדיניות בקוד (לעמוד אימות / מסירה). */
  Progress.describe = function () {
    return {
      policy: 'מאגר הגשות — סימני-רגע, לא ציון-בלבד',
      signal: ['support_level', 'mastery', 'hint_used', 'recovered_after_error', 'rescue_path'],
      gradeRule: 'grade נשמר רק על unit_type=assessment; מקולף מכל משימה רגילה',
      minimization: 'day גס בלבד — בלי timestamp/משך/activeSeconds',
      mapping: { basic: 'with_you/מתקשה', standard: 'on_own/רגיל', advanced: 'ahead/אתגר' },
      recommendation: 'suggestTrack נגזר מההגשה האחרונה — הצעה בלבד, טעון אישור מורה (שלב 3)',
      basis: 'data-model.md §3.7 + §3.4 · security-minimization.md §3'
    };
  };

  Resef.Progress = Progress;
  initChannels();
  seedFromPilot();

})(typeof window !== 'undefined' ? window : this);
