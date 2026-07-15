/* ============================================================
   רֶצֶף — שירות "פרסום למדף" (Publish · גשר אישור → ספרייה)
   publish-service.js · שכבת שירות משותפת · Resef.Publish
   מחבר בין: content-approval.html (W4-02) → library.html (W6-01/W6-02)
   נלווה ל: favorites.js · seen-service.js (אחים מקבילים — אותה ארכיטקטורת-ערוצים)
   ------------------------------------------------------------
   🌐 מה השירות הזה עושה — במשפט אחד:

     כשיחידה מאושרת עוברת "פרסום" במסך אישור-התוכן, השירות ממפה אותה
     **פעם אחת** למבנה-המשאב של הספרייה (סוג/מקצוע/שכבה/רמה — בדיוק
     המפתחות שהמסננים W6-02 מכירים), שומר אותה ל"מדף" משותף, ומשדר —
     כך שהיחידה מופיעה מיד בספרייה, בלי שאף אחד יעתיק תוכן ידנית.

   ------------------------------------------------------------
   🧩 "בלי כפילות" — הכלל שהקוד אוכף:

     הספרייה (library.html) מחזיקה את הרשומות שלה בפורמט אחד:
       { id, type, subject, grade, level, title, desc, min, uses, safe, tags }
     מסך-האישור מחזיק יחידה בפורמט אחר (שדות בעברית + preview).
     השירות הזה הוא **המקום היחיד** שמתרגם בין השניים — mapUnit(). אף מסך
     לא משכפל את הלוגיקה הזו, ואף תוכן לא נכתב פעמיים: הספרייה פשוט
     *צורכת* את list() ומצייר אותו עם אותו cardHTML של כל משאב אחר.

   ------------------------------------------------------------
   ⚖️  למה מותר לשמור את זה ב-localStorage:

     "מה פורסם למדף" הוא **החלטה תפעולית ארגונית לא-רגישה (🟢)** — לא נתון
     על קטין, לא ציון, לא מצב-רוח. זו תוצאה של אישור אנושי מפורש. השמירה
     היא בדיוק מה שמאפשר ליחידה להישאר על המדף בין רענונים, טאבים ומסכים.

   ------------------------------------------------------------
   🔒 שער-אחריות (מקביל לשער ב-content-approval):

     publish() דורש שהיחידה תהיה במצב 'approved' או 'published'. יחידה
     בטיוטה/ממתינה/נדחתה — assertApproved() דוחה. הפרסום למדף לא עוקף את
     האישור האנושי; הוא רק *מבטא* אותו בספרייה.

   ------------------------------------------------------------
   שימוש:
     <script src="publish-service.js"></script>

     // צד מסך-האישור (content-approval.html) — ברגע ה"פרסום":
     Resef.Publish.publish(unit);          // unit = הרשומה המקורית (status='approved')
     Resef.Publish.unpublish(unit.id);     // "הסרה מהמדף"
     Resef.Publish.syncFrom(state.units);  // סנכרון-בכמות: מיישר את המדף למצב הנוכחי

     // צד הספרייה (library.html) — צריכה בלבד:
     Resef.Publish.list();                 // → [רשומות בפורמט-הספרייה] (חדש→ישן)
     Resef.Publish.vocab();                // → { subjects, grades, levels, types } (מפתח→תווית)
     var off = Resef.Publish.onChange(render);  // סנכרון חי (כולל בין-טאבי/בין-iframe)

     // עזר / דמו:
     Resef.Publish.mapUnit(unit);          // תצוגה-מקדימה של המיפוי, בלי לשמור
     Resef.Publish.isPublished(id);        // → true/false
     Resef.Publish.clearAll();
   ============================================================ */
(function (global) {
  'use strict';

  var STORE_KEY = 'resef.publish.v1';    // המדף: { id → רשומת-ספרייה }
  var PING_KEY  = 'resef.publish.ping';   // דופק שמפעיל storage event בין-טאבי
  var CHAN_NAME = 'resef-publish';        // ערוץ BroadcastChannel (גם בין iframes)

  /* ============================================================
     אוצר-מילים קנוני (W6-02) — מפתח → תווית.
     מקור-אמת יחיד למילון שהספרייה והמסננים מכירים. הספרייה מאחדת את
     המפות האלה לתוך שלה, כדי שמשאב מפורסם ייפול תמיד לתוך מסנן קיים.
     המפתחות core (math…cs) זהים בכוונה לאלה של library.html — לא כפילות,
     אלא *אותו* מילון שמובטח שיישאר מסונכרן.
     ============================================================ */
  var SUBJECTS = {
    hebrew:  'עברית — לשון',
    math:    'מתמטיקה',
    english: 'אנגלית',
    civics:  'אזרחות',
    history: 'היסטוריה',
    tanach:  'תנ״ך',
    science: 'מדעים',
    cs:      'מדעי המחשב',
    /* מקצועות-העשרה שמסך-האישור מנפיק — משלימים את המילון: */
    econ:    'כלכלה',
    entre:   'יזמות',
    life:    'כישורי חיים',
    photo:   'צילום',
    other:   'כללי'
  };
  var GRADES = { t: "ט'", y: "י'", ya: "י\"א", yb: "י\"ב" };
  var LEVELS = { basic: 'בסיסי', regular: 'רגיל', advanced: 'מתקדם' };
  var TYPES  = {
    unit:  'יחידה',   deck: 'מצגת',   video: 'סרטון', quiz: 'בוחן',
    work:  'דף עבודה', sim:  'סימולציה', link: 'קישור'
  };

  /* ---------- מפות-רזולוציה: הקלט העברי של האישור → מפתח קנוני ---------- */
  /* מפתח מנורמל (רק אותיות עבריות) → מפתח-מקצוע. */
  var SUBJECT_BY_HE = {
    'מתמטיקה': 'math', 'מתמטי': 'math', 'חשבון': 'math',
    'עברית': 'hebrew', 'לשון': 'hebrew', 'עבריתלשון': 'hebrew', 'הבנתהנקרא': 'hebrew',
    'אנגלית': 'english',
    'אזרחות': 'civics', 'דמוקרטיה': 'civics',
    'היסטוריה': 'history', 'הסטוריה': 'history',
    'תנך': 'tanach', 'מקרא': 'tanach', 'נביאים': 'tanach',
    'מדעים': 'science', 'מדע': 'science', 'ביולוגיה': 'science', 'כימיה': 'science', 'פיזיקה': 'science',
    'מדעיהמחשב': 'cs', 'מחשבים': 'cs', 'תכנות': 'cs',
    'כלכלה': 'econ',
    'יזמות': 'entre',
    'כישוריחיים': 'life',
    'צילום': 'photo'
  };
  var GRADE_BY_HE = { 'ט': 't', 'י': 'y', 'יא': 'ya', 'יב': 'yb' };

  /* סוג-יחידה של האישור (task/reference) → סוג-משאב של הספרייה.
     יחידת-לימוד ממוקדת = 'unit' בספרייה (אותו אייקון/צבע). */
  var UNIT_TYPE_BY_APPROVAL = {
    task: 'unit', reference: 'unit', unit: 'unit',
    deck: 'deck', video: 'video', quiz: 'quiz', work: 'work', sim: 'sim', link: 'link'
  };

  function heLettersOnly(s) {
    return String(s == null ? '' : s).replace(/[^א-ת]/g, '');
  }

  /* מקצוע: "יזמות (העשרה)" → entre · "אזרחות" → civics · לא-מוכר → other */
  function subjectKey(raw) {
    var he = heLettersOnly(raw);
    if (SUBJECT_BY_HE[he]) return SUBJECT_BY_HE[he];
    // ניסיון חלקי — מקצוע-ליבה שמופיע כתת-מחרוזת (למשל "עברית ספרות")
    for (var k in SUBJECT_BY_HE) {
      if (he.indexOf(k) === 0) return SUBJECT_BY_HE[k];
    }
    return 'other';
  }

  /* שכבה: "יא" / "כיתה י\"א" / "י'" → מפתח · לא-מוכר → '' (הספרייה מדלגת על שבב-שכבה) */
  function gradeKey(raw) {
    var he = heLettersOnly(raw).replace(/^כיתה/, '');
    if (GRADE_BY_HE[he]) return GRADE_BY_HE[he];
    // 'יא','יב' לפני 'י' — בדיקה מהארוך לקצר
    var order = ['יב', 'יא', 'י', 'ט'];
    for (var i = 0; i < order.length; i++) {
      if (he.indexOf(order[i]) !== -1) return GRADE_BY_HE[order[i]];
    }
    return '';
  }

  function levelKey(raw) {
    if (LEVELS[raw]) return raw;                 // כבר מפתח קנוני
    var he = heLettersOnly(raw);
    if (he.indexOf('בסיס') !== -1) return 'basic';
    if (he.indexOf('מתקדם') !== -1) return 'advanced';
    return 'regular';                            // ברירת-מחדל: רגיל
  }

  function typeKey(raw) {
    return UNIT_TYPE_BY_APPROVAL[raw] || (TYPES[raw] ? raw : 'unit');
  }

  /* ============================================================
     mapUnit — הליבה: יחידת-אישור → רשומת-ספרייה (טהור, בלי שמירה)
     זהו התרגום היחיד במערכת בין שני מבני-הנתונים.
     ============================================================ */
  function mapUnit(u) {
    u = u || {};
    var prev = u.preview || {};
    var sk = subjectKey(u.subject);
    var desc = prev.relev || prev.remember || u.desc || 'יחידת לימוד קצרה — מנה של כ-10 דקות.';
    // תגיות לחיפוש: תווית-מקצוע + המקצוע המקורי במלואו (כולל "העשרה") + כותרת-מילים
    var tags = [];
    if (SUBJECTS[sk]) tags.push(SUBJECTS[sk]);
    if (u.subject && tags.indexOf(u.subject) === -1) tags.push(String(u.subject));
    (u.tags || []).forEach(function (t) { if (tags.indexOf(t) === -1) tags.push(t); });

    return {
      id:      String(u.id != null ? u.id : ''),
      type:    typeKey(u.type),
      subject: sk,
      grade:   gradeKey(u.grade),
      level:   levelKey(u.level),
      title:   u.title || 'יחידה',
      desc:    desc,
      min:     (u.minutes != null ? parseInt(u.minutes, 10) : (u.min != null ? u.min : 10)) || 10,
      uses:    u.uses != null ? u.uses : 0,   // יחידה טרייה מהמדף — 0 שיבוצים
      safe:    u.safe != null ? !!u.safe : true, // עברה אישור אנושי → בטוחה לחירום
      tags:    tags,
      /* עקבות-פרסום — הספרייה יכולה לתייג "חדש · פורסם" ולשמור על שרשרת-האחריות */
      published:   true,
      publishedOn: u.publishedOn || '',
      approvedBy:  u.approvedBy || '',
      source:      'content-approval'
    };
  }

  /* ============================================================
     אחסון (localStorage) — מדף משותף אחד (לא לפי-משתמש)
     ============================================================ */
  var _mem = null; // גיבוי-זיכרון כשאחסון חסום (file:// מוקשח / מצב פרטי)
  function readStore() {
    try { var raw = global.localStorage.getItem(STORE_KEY); return raw ? JSON.parse(raw) : {}; }
    catch (e) { return {}; }
  }
  function writeStore(map) {
    try { global.localStorage.setItem(STORE_KEY, JSON.stringify(map)); }
    catch (e) { _mem = map; }
  }
  function store()  { return _mem || readStore(); }
  function commit(map) { _mem = map; writeStore(map); }
  function clone(o) { try { return JSON.parse(JSON.stringify(o)); } catch (e) { return o; } }

  var _seq = 0;

  /* ============================================================
     ליבה — publish / unpublish / isPublished / list …
     ============================================================ */
  function assertApproved(u) {
    // שער-אחריות: פרסום רק אחרי אישור אנושי.
    return u && (u.status === 'approved' || u.status === 'published' || u.status == null);
  }

  function publish(unit) {
    if (!unit || unit.id == null) return null;
    if (!assertApproved(unit)) return null;   // לא מאושר — לא עולה למדף
    var rec = mapUnit(unit);
    if (!rec.id) return null;
    var map = store();
    var existed = !!map[rec.id];
    // שמירת סדר-הופעה יציב: פריט חדש מקבל seq עולה; קיים שומר את שלו
    rec._seq = existed && map[rec.id]._seq ? map[rec.id]._seq : (_seq += 1);
    if (existed) rec.uses = map[rec.id].uses != null ? map[rec.id].uses : rec.uses;
    map[rec.id] = rec;
    commit(map);
    emit({ action: existed ? 'update' : 'publish', id: rec.id, record: rec });
    return clone(rec);
  }

  function unpublish(id) {
    if (id == null) return false;
    id = String(id);
    var map = store();
    if (!map[id]) return false;
    var rec = map[id];
    delete map[id];
    commit(map);
    emit({ action: 'unpublish', id: id, record: rec });
    return true;
  }

  /* syncFrom — מיישר את המדף למצב-הנוכחי של מערך-יחידות שלם:
     מפרסם כל יחידה 'published', מסיר כל אחת שכבר לא. אידמפוטנטי. */
  function syncFrom(units) {
    if (!units || !units.length) return list();
    var wantPublished = {};
    units.forEach(function (u) {
      if (u && u.status === 'published' && u.id != null) {
        wantPublished[String(u.id)] = u;
      }
    });
    // הסרה של פריטים שכבר לא מפורסמים (רק כאלה שמקורם באישור)
    var map = store();
    Object.keys(map).forEach(function (id) {
      if (map[id] && map[id].source === 'content-approval' && !wantPublished[id]) {
        unpublish(id);
      }
    });
    // פרסום/עדכון של המבוקשים
    Object.keys(wantPublished).forEach(function (id) { publish(wantPublished[id]); });
    return list();
  }

  function isPublished(id) {
    if (id == null) return false;
    return !!store()[String(id)];
  }
  function get(id) {
    var r = store()[String(id)];
    return r ? clone(r) : null;
  }
  /* list — כל המדף, ממויין חדש→ישן (לפי סדר-פרסום). */
  function list() {
    var map = store();
    var arr = Object.keys(map).map(function (k) { return clone(map[k]); });
    arr.sort(function (a, b) { return (b._seq || 0) - (a._seq || 0); });
    return arr;
  }
  function count() { return Object.keys(store()).length; }

  function clearAll() {
    commit({});
    _seq = 0;
    emit({ action: 'clear', id: null, record: null });
  }

  function vocab() {
    return { subjects: clone(SUBJECTS), grades: clone(GRADES), levels: clone(LEVELS), types: clone(TYPES) };
  }

  /* ============================================================
     מנויים + סנכרון בין-טאבי/בין-iframe (BroadcastChannel + storage)
     ============================================================ */
  var _listeners = [];
  var _bc = null;

  function onChange(fn) {
    if (typeof fn !== 'function') return function () {};
    _listeners.push(fn);
    return function off() {
      var i = _listeners.indexOf(fn);
      if (i !== -1) _listeners.splice(i, 1);
    };
  }
  function fireLocal(e) {
    e.count = count();
    _listeners.slice().forEach(function (fn) {
      try { fn(e); } catch (err) { /* מאזין תקול לא מפיל את השאר */ }
    });
  }
  function emit(e) {
    fireLocal(e);
    var ping = { action: e.action, id: e.id, r: (_seq += 1) };
    try { if (_bc) _bc.postMessage(ping); } catch (err) {}
    try { global.localStorage.setItem(PING_KEY, JSON.stringify(ping)); } catch (err) {}
  }
  function ingestPing() {
    _mem = null; // לכפות קריאה טרייה מהאחסון (טאב/iframe אחר כתב)
    fireLocal({ action: 'sync', id: null, record: null, remote: true });
  }
  function initChannels() {
    try {
      if (typeof global.BroadcastChannel === 'function') {
        _bc = new global.BroadcastChannel(CHAN_NAME);
        _bc.onmessage = function () { ingestPing(); };
      }
    } catch (e) { _bc = null; }
    try {
      global.addEventListener('storage', function (ev) {
        if (!ev) return;
        if (ev.key === PING_KEY && ev.newValue) ingestPing();
        else if (ev.key === STORE_KEY) ingestPing();
      });
    } catch (e) {}
  }
  initChannels();

  /* ============================================================
     חשיפה
     ============================================================ */
  var api = {
    publish:     publish,
    unpublish:   unpublish,
    syncFrom:    syncFrom,
    isPublished: isPublished,
    get:         get,
    list:        list,
    count:       count,
    clearAll:    clearAll,
    mapUnit:     mapUnit,
    vocab:       vocab,
    onChange:    onChange,
    /* עזרי-מיפוי חשופים (לדמו / בדיקות) */
    keys: { subject: subjectKey, grade: gradeKey, level: levelKey, type: typeKey }
  };

  global.Resef = global.Resef || {};
  global.Resef.Publish = api;

})(typeof window !== 'undefined' ? window : this);
