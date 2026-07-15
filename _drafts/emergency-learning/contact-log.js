/* ============================================================
   רֶצֶף — שירות יומן קשר (W0-S3)  ·  שדות מובנים בלבד
   contact-log.js  ·  תואם security-minimization.md §3 שורה 4 · data-model.md §3.11
   ------------------------------------------------------------
   מה זה: שכבת אכיפה יחידה ל"יומן קשר" של המחנך. כל תצוגה שכותבת/קוראת
   יומן קשר (למשל W2-06) חייבת לעבור דרך השירות הזה — כדי שהאכיפה תהיה
   במקום אחד ולא תשוכפל.

   שלושת קווי האדום שהשירות אוכף (הסיבה שזו משימת אבטחה, לא מסך):
   1. 🔒 שדות מובנים בלבד — אין שדה טקסט חופשי, בכלל.
      "שדה חופשי הוא הכי מסוכן" — דרכו מחלחל מידע רווחה/משפחה שהופך
      את הרשומה למב"ר (מידע בעל רגישות מיוחדת, תיקון 13). לכן create()
      *דוחה* כל מפתח שאינו ברשימת השדות המובנים — בפרט note/comment/text.
      אין כאן "לחתוך את השדה" — אין שדה כזה להתחיל איתו.
   2. 🔒 גישה למחנך מורשה בלבד — מחנך/ת הכיתה של התלמיד, או יועצת ביה"ס.
      מורה מקצועי, מנהל (drill), ופיקוח ארצי — אין להם גישה ליומן הקשר.
   3. 🔒 מחיקה אוטומטית — לכל רשומה delete_after; purgeExpired() מסירה
      רשומות שעבר זמנן. אין ארכיון רגשי מתמשך על קטין.

   השירות אגנוסטי ל-DOM/מסגרת. אחסון בזיכרון כברירת מחדל, עם persist
   אופציונלי ל-localStorage (לדמו). ניתן לבדיקה גם ב-Node (CommonJS).

   שימוש:
     RetzefContactLog.create(entry, actor)      // מאמת + אוכף + שומר
     RetzefContactLog.list(targetStudent, actor)// קריאה מגודרת-הרשאה
     RetzefContactLog.purgeExpired(nowISO)      // מחיקה אוטומטית
   ============================================================ */
(function (root) {
  'use strict';

  /* ---------- 1. אוצר המילים המובנה (מקור: data-model.md §3.11) ----------
     אלה הערכים היחידים החוקיים. אין ערך "אחר" ואין שדה חופשי להשלמה.
     כל שינוי כאן = שינוי בשכבת הפרטיות, ומחייב אישור DPO. */
  var CHANNELS = {
    whatsapp: 'וואטסאפ',
    sms:      'SMS',
    phone:    'שיחת טלפון'
  };
  var OUTCOMES = {
    contacted:          'נוצר קשר',
    no_answer:          'אין מענה',
    referred_to_parent: 'הופנה להורה'
  };
  var FOLLOWUPS = {
    none:     'אין המשך נדרש',
    retry:    'לנסות שוב',
    parent:   'לפנות להורה',
    escalate: 'להסלים ליועצת/מנהל'
  };

  /* השדות המובנים היחידים שקלט חיצוני רשאי לספק.
     id / delete_after / created_at — מיוצרים ע"י השירות, לא מתקבלים מבחוץ. */
  var INPUT_FIELDS  = ['student_id', 'staff_id', 'day', 'mode', 'outcome', 'channel', 'followup'];
  var SYSTEM_FIELDS = ['id', 'delete_after', 'created_at'];

  /* רשימת חסימה מפורשת — שמות נפוצים לשדה טקסט חופשי. לא נחוצה טכנית
     (הרשימה הלבנה כבר חוסמת), אבל נותנת שגיאה ברורה + מתעדת את הכוונה:
     "לא שכחנו את ההערה החופשית — הסרנו אותה במכוון". */
  var FORBIDDEN_FREE_TEXT = ['note', 'notes', 'comment', 'comments', 'text', 'freetext',
                             'free_text', 'description', 'details', 'body', 'message', 'remark'];

  var MODES = ['routine', 'remote', 'emergency'];

  /* ---------- 2. מדיניות שמירה ----------
     🟡 הערך טעון אישור DPO (data-model.md §6). ברירת מחדל שמרנית: שנה.
     ההנחה: מוחקים ברגע שאין צורך תפעולי — כל יום שמירה נוסף = סיכון נוסף. */
  var DEFAULT_RETENTION_DAYS = 365;
  var retentionDays = DEFAULT_RETENTION_DAYS;
  var DAY_MS = 24 * 60 * 60 * 1000;

  /* ---------- 3. עזרי אימות ---------- */
  function isNonEmptyString(v) { return typeof v === 'string' && v.trim() !== ''; }

  // day = תאריך בפורמט YYYY-MM-DD (בלי שעה — רזולוציית יום גסה, לא חותמת מדויקת).
  function isDayString(v) { return isNonEmptyString(v) && /^\d{4}-\d{2}-\d{2}$/.test(v); }

  function addDaysISO(dayStr, days) {
    var d = new Date(dayStr + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
  }

  /* ---------- 4. ליבת האכיפה: אימות רשומה נכנסת ----------
     מחזיר רשומה תקינה ומנוקה, או זורק ValidationError עם סיבה ברורה.
     כאן נאכף "שדות מובנים בלבד" — לפני כל שמירה. */
  function ValidationError(message, code) {
    this.name = 'ContactLogValidationError';
    this.message = message;
    this.code = code || 'invalid';
  }
  ValidationError.prototype = Object.create(Error.prototype);

  function validate(input) {
    if (!input || typeof input !== 'object') {
      throw new ValidationError('רשומת יומן קשר חייבת להיות אובייקט.', 'not_object');
    }

    // 4א. חסימת שדה טקסט חופשי — הקו האדום המרכזי.
    Object.keys(input).forEach(function (key) {
      if (FORBIDDEN_FREE_TEXT.indexOf(key.toLowerCase()) !== -1) {
        throw new ValidationError(
          'שדה טקסט חופשי אסור ביומן קשר ("' + key + '"). יומן הקשר מובנה בלבד ' +
          '(ערוץ/תוצאה/משימת המשך) — שדה חופשי מחלחל מב"ר. ראו security-minimization §3.',
          'free_text_forbidden'
        );
      }
      // כל מפתח שאינו שדה קלט מוכר ואינו שדה-מערכת — נדחה (רשימה לבנה).
      if (INPUT_FIELDS.indexOf(key) === -1 && SYSTEM_FIELDS.indexOf(key) === -1) {
        throw new ValidationError(
          'שדה לא מוכר ביומן קשר ("' + key + '"). מותרים רק: ' + INPUT_FIELDS.join(', ') + '.',
          'unknown_field'
        );
      }
    });

    // 4ב. שדות חובה + טיפוסים.
    if (!isNonEmptyString(input.student_id)) throw new ValidationError('חסר student_id.', 'missing_student');
    if (!isNonEmptyString(input.staff_id))   throw new ValidationError('חסר staff_id.', 'missing_staff');
    if (!isDayString(input.day))             throw new ValidationError('day חייב להיות תאריך YYYY-MM-DD.', 'bad_day');

    // 4ג. ערכי enum — חייבים להיות מהאוצר המובנה בלבד.
    if (MODES.indexOf(input.mode) === -1) {
      throw new ValidationError('mode לא חוקי (' + MODES.join('/') + ').', 'bad_mode');
    }
    if (!OUTCOMES.hasOwnProperty(input.outcome))   throw new ValidationError('outcome לא חוקי.', 'bad_outcome');
    if (!CHANNELS.hasOwnProperty(input.channel))   throw new ValidationError('channel לא חוקי.', 'bad_channel');
    if (!FOLLOWUPS.hasOwnProperty(input.followup)) throw new ValidationError('followup לא חוקי.', 'bad_followup');

    // רשומה מנוקה: רק השדות המובנים, בסדר קבוע. שום דבר מעבר לא עובר הלאה.
    return {
      student_id: input.student_id,
      staff_id:   input.staff_id,
      day:        input.day,
      mode:       input.mode,
      outcome:    input.outcome,
      channel:    input.channel,
      followup:   input.followup
    };
  }

  /* ---------- 5. גדר ההרשאה: מי רשאי לגעת ביומן הקשר ----------
     actor = { staff_id, roles:[{role, school_id, class_id?}] }
     target = { student_id, school_id, homeroom_teacher_id } — השיוך של התלמיד.
     מורשה: מחנך/ת הכיתה של התלמיד, או יועצת באותו בית ספר.
     נדחים במפורש: מורה מקצועי, מנהל (רואה מצרפי בלבד), פיקוח ארצי. */
  var AUTHORIZED_ROLES = ['homeroom', 'counselor'];

  function isAuthorized(actor, target) {
    if (!actor || !Array.isArray(actor.roles) || !target) return false;
    return actor.roles.some(function (r) {
      if (!r || !r.active && r.active !== undefined && r.active === false) return false;
      if (AUTHORIZED_ROLES.indexOf(r.role) === -1) return false;
      // חייב אותו בית ספר (הפרדת בתי ספר — RBAC).
      if (target.school_id && r.school_id && r.school_id !== target.school_id) return false;
      // מחנך/ת: רק כיתת התלמיד, ורק אם הוא המחנך הרשום שלה.
      if (r.role === 'homeroom') {
        var ownsClass = !target.class_id || !r.class_id || r.class_id === target.class_id;
        var isHomeroom = !target.homeroom_teacher_id || target.homeroom_teacher_id === actor.staff_id;
        return ownsClass && isHomeroom;
      }
      // יועצת: כל תלמידי ביה"ס (דפוס/רוחב) — מוגדר בפרוטוקול הדגלים.
      return true;
    });
  }

  function requireAuthorized(actor, target) {
    if (!isAuthorized(actor, target)) {
      throw new ValidationError('גישה ליומן קשר מותרת למחנך/ת הכיתה או ליועצת בלבד.', 'forbidden');
    }
  }

  /* ---------- 6. אחסון (בזיכרון; persist אופציונלי לדמו) ---------- */
  var STORAGE_KEY = 'resef.contactLog';
  var store = [];       // מערך הרשומות
  var persistEnabled = false;
  var idSeq = 0;

  function loadFromStorage() {
    try {
      var raw = root.localStorage && root.localStorage.getItem(STORAGE_KEY);
      if (raw) { store = JSON.parse(raw) || []; }
    } catch (e) { store = []; }
  }
  function saveToStorage() {
    if (!persistEnabled) return;
    try {
      if (root.localStorage) root.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (e) { /* אחסון חסום — ממשיכים בזיכרון */ }
  }

  function nextId(nowISO) {
    idSeq += 1;
    // מזהה יציב בלי Date.now (עובד גם בבדיקת Node): חותמת + רץ.
    return 'cl_' + (nowISO || '').replace(/[^0-9]/g, '').slice(0, 12) + '_' + idSeq;
  }

  /* ---------- 7. ה-API הציבורי ---------- */

  // יצירת רשומה: מאמת (שדות מובנים בלבד) → מגדר הרשאה → מחשב מחיקה → שומר.
  // now = ISO (ברירת מחדל: תאריך ה-day של הרשומה) — מוזרק לבדיקות דטרמיניסטיות.
  function create(entry, actor, opts) {
    opts = opts || {};
    var clean = validate(entry);                       // 🔒 אכיפת מבנה
    var target = opts.target || {
      student_id: clean.student_id,
      school_id: opts.school_id,
      class_id: opts.class_id,
      homeroom_teacher_id: opts.homeroom_teacher_id
    };
    // המחנך שכותב חייב להיות מורשה על התלמיד הזה.
    requireAuthorized(actor || { staff_id: clean.staff_id, roles: opts.actorRoles || [] }, target);

    var nowISO = opts.now || (clean.day + 'T00:00:00Z');
    clean.id = nextId(nowISO);
    clean.created_at = nowISO;
    clean.delete_after = addDaysISO(clean.day, retentionDays);  // 🔒 מחיקה אוטומטית

    store.push(clean);
    saveToStorage();
    return shallow(clean);
  }

  // קריאה מגודרת: מחזיר את רשומות התלמיד — רק אם ה-actor מורשה עליו.
  function list(target, actor) {
    requireAuthorized(actor, target);                  // 🔒 גישה מורשה בלבד
    var sid = target && target.student_id;
    return store
      .filter(function (r) { return r.student_id === sid; })
      .map(shallow);
  }

  // מחיקה אוטומטית: מסיר כל רשומה שעבר תאריך delete_after שלה. מחזיר כמה נמחקו.
  function purgeExpired(nowISO) {
    var today = (nowISO || '').slice(0, 10);
    if (!isDayString(today)) return 0;
    var before = store.length;
    store = store.filter(function (r) { return r.delete_after > today; });
    var removed = before - store.length;
    if (removed) saveToStorage();
    return removed;
  }

  function isExpired(entry, nowISO) {
    var today = (nowISO || '').slice(0, 10);
    return isDayString(today) && entry && entry.delete_after <= today;
  }

  function shallow(o) { var c = {}; for (var k in o) if (o.hasOwnProperty(k)) c[k] = o[k]; return c; }

  /* ---------- 8. תצורה + עזרי UI (מבניים בלבד) ---------- */
  function setRetentionDays(n) {
    if (typeof n === 'number' && n > 0) retentionDays = Math.floor(n);
    return retentionDays;
  }
  function getRetentionDays() { return retentionDays; }

  function enablePersistence(on) {
    persistEnabled = !!on;
    if (persistEnabled) loadFromStorage();
    return persistEnabled;
  }

  // איפוס (לבדיקות/דמו).
  function _reset() { store = []; idSeq = 0; saveToStorage(); }

  root.RetzefContactLog = {
    // אוצר מובנה — לבניית תפריטי-בחירה בלבד (בלי שדה חופשי):
    CHANNELS: CHANNELS,
    OUTCOMES: OUTCOMES,
    FOLLOWUPS: FOLLOWUPS,
    MODES: MODES.slice(),
    INPUT_FIELDS: INPUT_FIELDS.slice(),
    FORBIDDEN_FREE_TEXT: FORBIDDEN_FREE_TEXT.slice(),
    AUTHORIZED_ROLES: AUTHORIZED_ROLES.slice(),
    // ליבה:
    validate: validate,
    isAuthorized: isAuthorized,
    create: create,
    list: list,
    purgeExpired: purgeExpired,
    isExpired: isExpired,
    // תצורה:
    setRetentionDays: setRetentionDays,
    getRetentionDays: getRetentionDays,
    enablePersistence: enablePersistence,
    ValidationError: ValidationError,
    _all: function () { return store.map(shallow); },
    _reset: _reset
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = root.RetzefContactLog;

})(typeof window !== 'undefined' ? window : this);
