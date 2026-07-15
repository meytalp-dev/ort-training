/* ============================================================
   רֶצֶף — שירות check-in "מתריע ונמחק" (W0-S2)
   checkin-service.js · שכבת שירות משותפת · מקור אמת יחיד לטיפול ב-check-in
   נלווה ל: security-minimization.md §3 שורה 3 · data-model.md §3.8 · prd.md §10
   ------------------------------------------------------------
   ⚖️  למה השירות הזה קיים — הנימוק המחייב (תיקון 13 לחוק הגנת הפרטיות):

     ה-check-in הרגשי ("קשה לי" / "רוצה לדבר" / "לא יכול/ה עכשיו") יכול לחשוף
     מצב נפשי או חיי משפחה של קטין. ברגע שרשומה כזו *נשמרת לאורך זמן* היא נכנסת
     ל"מידע בעל רגישות מיוחדת" (מב"ר / ISS) — הקטגוריה שמעלה את כל המערכת לרמת
     אבטחה גבוהה ומחייבת הגנות כבדות. לכן ההחלטה המבנית:

       » ה-check-in הרגשי **מתריע למחנך עכשיו — ואז נמחק.**
       » לא נבנית **היסטוריה רגשית** על קטין. אין לוג רגשי. אין מגמת-מצב-רוח.
       » מה שנשאר הוא **דגל חי חד-פעמי** (signal, לא תיעוד קליני) שהמחנך רואה,
         מטפל, ומאשר — וברגע האישור הוא נעלם. שום תוכן רגשי לא יורד לאחסון קבוע.

     "כל שדה שלא אוספים — הוא שדה שלא צריך להגן עליו, להצפין, לגבות ולמחוק."
     (security-minimization.md §1)

   ------------------------------------------------------------
   🔒 שלושה כללים שהקוד הזה אוכף (לא רק מצהיר):

     1. תוכן רגשי (mood / distress) לעולם **לא** נכתב ל-localStorage / אחסון קבוע.
        ההתראה חיה ב**זיכרון בלבד** (_alerts) — נמחקת בסגירת הדף או באישור המחנך.
        (שימו לב: system-mode.js *כן* שומר את המצב ל-localStorage. כאן — במכוון לא.)
     2. ההתראה למחנך נושאת **סימן מינימלי** ("ביקש/ה עזרה") — לא ציטוט, לא היסטוריה,
        לא ניקוד רגשי. distress_flag נגזר מהבחירה ומיד נזרק.
     3. מה שכן מותר להישמר הוא **עובדת הנוכחות הלא-רגישה** בלבד (הילד נראה היום),
        שמנוהלת ב-DailyPresence (W0-S1) — פעיל/חלקי/לא-נראה, בלי מעקב-שניות,
        בלי mood. שני המסלולים מופרדים כאן במפורש.

   ------------------------------------------------------------
   שימוש:
     <script src="checkin-service.js"></script>
     // תלמיד עושה check-in:
     var r = Resef.CheckIn.submit({ studentId:'std_noa', studentName:'נועה',
                                    classId:'cls_i2', response:'help', mode:'emergency' });
     r.alertRaised;   // true — יצאה התראה למחנך
     r.emotionPurged; // true — התוכן הרגשי כבר נמחק, לא נשמר
     r.studentStatus; // סטטוס חד-פעמי להצגה לתלמיד ("המחנכת יודעת שאתה כאן")
     // מחנך מאזין להתראות חיות:
     Resef.CheckIn.onAlert(function(list){ renderPulse(list); });
     Resef.CheckIn.acknowledge(alertId);  // "ראיתי" → ההתראה נעלמת לגמרי
   ============================================================ */
(function (global) {
  'use strict';

  /* ---------- 1. מיפוי בחירה → סימן (לא תוכן רגשי נשמר) ----------
     כל בחירת check-in ממופה כאן ל"סימן" תפעולי בלבד:
       raiseAlert — האם להתריע למחנך עכשיו.
       urgency    — עוצמת ההתראה: 'calm' (בלי התראה) / 'attention' (כדאי לבדוק) / 'reach' (ליצור קשר).
       signal     — מלל מינימלי ונייטרלי מגדרית שהמחנך רואה. סימן, לא ציטוט ולא אבחון.
     ⚠️ אין כאן שמירה של הבחירה עצמה (mood) לאורך זמן — היא משמשת רק לגזירת הסימן,
        ומיד נזרקת (ראו deriveAndForget למטה).
     המפתחות מכסים גם את 4 אפשרויות החירום (system-mode.js) וגם את מצבי-הרוח שבמסך התלמיד. */
  var SIGNAL_MAP = {
    /* --- שגרה/מרחוק: check-in נוכחות בלבד. אין רכיב רגשי כלל --- */
    start:  { raiseAlert:false, urgency:'calm',      signal:null },

    /* --- חירום: 4 אפשרויות (מוכן/להתחיל לאט/צריך עזרה/לא יכול עכשיו) --- */
    ready:  { raiseAlert:false, urgency:'calm',      signal:null },
    slow:   { raiseAlert:false, urgency:'calm',      signal:null },
    help:   { raiseAlert:true,  urgency:'attention', signal:'ביקש/ה עזרה' },
    notnow: { raiseAlert:true,  urgency:'reach',     signal:'סימן/ה שלא יכול/ה עכשיו — כדאי ליצור קשר' },

    /* --- מצבי-רוח (check-in רגשי במסך התלמיד) --- */
    good:   { raiseAlert:false, urgency:'calm',      signal:null },
    great:  { raiseAlert:false, urgency:'calm',      signal:null },
    ok:     { raiseAlert:false, urgency:'calm',      signal:null },
    hard:   { raiseAlert:true,  urgency:'attention', signal:'סימן/ה שקשה היום — כדאי לבדוק' },
    talk:   { raiseAlert:true,  urgency:'reach',     signal:'ביקש/ה לדבר' }
  };

  /* מילים-נרדפות מהמסכים הקיימים (עברית) → מזהה תקני */
  var ALIASES = {
    'מוכן':'ready', 'מתחיל ללמוד':'start', 'מתחילים':'start',
    'להתחיל לאט':'slow', 'צריך עזרה':'help', 'לא יכול עכשיו':'notnow',
    'טוב':'good', 'בסדר':'ok', 'קשה לי':'hard', 'רוצה לדבר':'talk'
  };

  function normalizeResponse(resp) {
    if (resp == null) return 'start';
    var key = String(resp).trim();
    if (SIGNAL_MAP[key]) return key;
    if (ALIASES[key]) return ALIASES[key];
    return 'start'; // ברירת מחדל בטוחה: נוכחות בלבד, בלי רכיב רגשי
  }

  /* ---------- 2. אחסון חי בלבד — במכוון לא נשמר לאחסון קבוע ----------
     _alerts הוא תור התראות **בזיכרון בלבד**. אין localStorage, אין sessionStorage.
     נמחק אוטומטית בסגירת הדף — וזו בדיוק המשמעות של "מתריע ונמחק".
     מזהה רץ פשוט (בלי חותמת-זמן מדויקת שנשמרת על הקטין). */
  var _alerts = [];      // התראות חיות שממתינות לעיני המחנך
  var _seq = 0;          // מונה מזהים בתוך הסשן
  var _listeners = [];   // מאזיני תצוגת מחנך (דופק כיתתי)

  function nextId() { _seq += 1; return 'alert_' + _seq; }

  function notify() {
    var snapshot = Resef_CheckIn.liveAlerts();
    _listeners.slice().forEach(function (fn) {
      try { fn(snapshot); } catch (e) { /* מאזין תקול לא מפיל את השאר */ }
    });
  }

  /* ---------- 3. הלב: גזור-סימן-ואז-שכח ----------
     מקבל את הבחירה הרגשית, גוזר ממנה סימן תפעולי, ומיד "שוכח" את הבחירה עצמה.
     שום mood/distress לא יוצא מהפונקציה הזו כערך שנשמר.
     מחזיר { raiseAlert, urgency, signal } — סימן בלבד. */
  function deriveAndForget(responseKey) {
    var rule = SIGNAL_MAP[responseKey] || SIGNAL_MAP.start;
    // עותק שטוח של הסימן בלבד. responseKey (התוכן הרגשי) נשאר משתנה מקומי
    // ונאסף ע"י ה-GC בסיום הפונקציה — הוא לא מוחזר ולא נשמר בשום שדה.
    return { raiseAlert:rule.raiseAlert, urgency:rule.urgency, signal:rule.signal };
  }

  /* ---------- 4. ה-API הציבורי ---------- */
  var Resef = global.Resef || (global.Resef = {});
  var Resef_CheckIn = {};

  /* submit — תלמיד מוסר check-in.
     קלט: { studentId, studentName?, classId?, response, mode? }
       response — מזהה בחירה (ready/help/hard/talk/...) או מלל עברי מהמסך.
       mode     — מצב מערכת; אם חסר נלקח מ-Resef.getMode() (system-mode.js).
     פלט (סטטוס חד-פעמי — לא נשמר כלוג):
       { presence, alertRaised, alertId, urgency, emotionPurged, studentStatus }
     ⚖️ הערה: הפונקציה לא מקבלת ולא שומרת טקסט חופשי. אם יעבירו כזה — יתעלמו ממנו. */
  Resef_CheckIn.submit = function (input) {
    input = input || {};
    var responseKey = normalizeResponse(input.response);
    var mode = input.mode ||
               (typeof Resef.getMode === 'function' ? Resef.getMode() : 'routine');

    /* 4א. עובדת נוכחות לא-רגישה — המסלול היחיד שכן נשמר.
       הילד נראה היום. זו עובדה תפעולית (🟢), בלי mood ובלי חותמת-זמן מדויקת.
       ההכרעה הסופית active/partial חיה ב-DailyPresence (W0-S1); כאן רק נגזרת גסה:
       'notnow' = נכנס אך לא ילמד עכשיו → partial; אחרת → active. */
    var presence = {
      studentId: input.studentId || null,
      day: 'today',                          // גס במכוון — בלי timestamp על הקטין
      state: (responseKey === 'notnow') ? 'partial' : 'active',
      mode: mode
    };

    /* 4ב. גזירת הסימן — ואז שכחה מיידית של התוכן הרגשי. */
    var sig = deriveAndForget(responseKey);
    // responseKey לא ישוכפל לשום מבנה שנשמר מעבר לנקודה הזו.

    var out = {
      presence: presence,
      alertRaised: false,
      alertId: null,
      urgency: sig.urgency,
      emotionPurged: true,      // התוכן הרגשי כבר לא קיים כרשומה — נגזר ונמחק
      studentStatus: null
    };

    /* 4ג. אם יש מצוקה — מרימים התראה חיה למחנך (זיכרון בלבד). */
    if (sig.raiseAlert) {
      var alert = {
        id: nextId(),
        studentId: input.studentId || null,
        studentName: input.studentName || null,   // שם לתצוגה למחנך המורשה בלבד
        classId: input.classId || null,
        signal: sig.signal,      // סימן מינימלי — לא ציטוט, לא אבחון, לא היסטוריה
        urgency: sig.urgency,    // 'attention' / 'reach'
        mode: mode,
        seen: false              // "המחנך ראה" — הופך ל-true ואז ההתראה נמחקת
      };
      _alerts.push(alert);
      out.alertRaised = true;
      out.alertId = alert.id;
      notify();
    }

    /* 4ד. סטטוס חד-פעמי לתלמיד (להצגה עכשיו, לא לוג). */
    out.studentStatus = sig.raiseAlert
      ? { kind:'alerted', text:'המחנכת יודעת — היא תיצור קשר בקרוב.' }
      : { kind:'present', text:'רשום/ה כאן היום. אפשר להתחיל בקצב שלך.' };

    return out;
  };

  /* liveAlerts — ההתראות החיות שממתינות למחנך (עותק בלבד, לא הפניה למקור). */
  Resef_CheckIn.liveAlerts = function () {
    return _alerts.map(function (a) {
      return {
        id:a.id, studentId:a.studentId, studentName:a.studentName,
        classId:a.classId, signal:a.signal, urgency:a.urgency,
        mode:a.mode, seen:a.seen
      };
    });
  };

  /* acknowledge — "ראיתי". המחנך אישר → ההתראה **נמחקת לגמרי**.
     זה רגע ה"נמחק": אחרי אישור לא נשאר שום עקבות רגשי במערכת. */
  Resef_CheckIn.acknowledge = function (alertId) {
    var i = -1, j;
    for (j = 0; j < _alerts.length; j++) {
      if (_alerts[j].id === alertId) { i = j; break; }
    }
    if (i === -1) return false;
    _alerts.splice(i, 1);   // מחיקה מלאה מהזיכרון — לא ארכוב, לא "seen-log"
    notify();
    return true;
  };

  /* purgeAll — מחיקת כל ההתראות החיות (למשל בסוף יום / בהחלפת משתמש).
     מדגים שאין שום היסטוריה להחזיק — הכול מתאפס. */
  Resef_CheckIn.purgeAll = function () {
    _alerts.length = 0;
    notify();
  };

  /* onAlert — תצוגת המחנך נרשמת לעדכוני התראות חיות. מחזיר פונקציית ביטול. */
  Resef_CheckIn.onAlert = function (fn) {
    if (typeof fn !== 'function') return function () {};
    _listeners.push(fn);
    try { fn(Resef_CheckIn.liveAlerts()); } catch (e) {}
    return function off() {
      var k = _listeners.indexOf(fn);
      if (k !== -1) _listeners.splice(k, 1);
    };
  };

  /* ---------- 5. בקרת-אימות למינימיזציה (ל-QA / DPO) ----------
     assertNoPersistence — מוכיח שאין תוכן רגשי באחסון קבוע.
     סורק localStorage + sessionStorage ומחזיר { clean, findings }.
     כל מפתח שנמצא הפרה = באג מינימיזציה שחייב תיקון. */
  Resef_CheckIn.assertNoPersistence = function () {
    var findings = [];
    var suspect = /(mood|emotion|distress|checkin.*mood|feel)/i;
    ['localStorage', 'sessionStorage'].forEach(function (storeName) {
      var store;
      try { store = global[storeName]; } catch (e) { return; }
      if (!store) return;
      for (var i = 0; i < store.length; i++) {
        var key = store.key(i);
        var val = '';
        try { val = store.getItem(key) || ''; } catch (e) {}
        if (suspect.test(key) || suspect.test(val)) {
          findings.push({ store:storeName, key:key });
        }
      }
    });
    return { clean: findings.length === 0, findings: findings };
  };

  /* describeMinimization — הצהרת המדיניות בקוד (לשימוש בעמוד אימות / מסירה). */
  Resef_CheckIn.describeMinimization = function () {
    return {
      policy: 'check-in מתריע ונמחק',
      stored: [
        'עובדת נוכחות לא-רגישה (פעיל/חלקי) — DailyPresence, בלי mood ובלי מעקב-שניות',
        'עובדה תפעולית: יצאה התראה / המחנך ראה (בזיכרון החי בלבד, נמחק באישור)'
      ],
      neverStored: [
        'mood / מצב-רוח כרשומה מתמשכת',
        'distress_flag כהיסטוריה',
        'טקסט חופשי מהתלמיד',
        'מגמת מצב-רוח לאורך זמן',
        'חותמת-זמן מדויקת של הרגע הרגשי'
      ],
      basis: 'תיקון 13 לחוק הגנת הפרטיות (מב"ר) · security-minimization.md §3 שורה 3'
    };
  };

  Resef.CheckIn = Resef_CheckIn;

})(typeof window !== 'undefined' ? window : this);
