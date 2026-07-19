/* ============================================================
   teacher-store.js — מקור-אמת יחיד לנתוני המורה ברֶצֶף (דמו).
   נשמר ב-localStorage תחת retzef.teacher.v1. משותף ל:
   · teacher-setup.html      — כותב (אשף ההרשמה)
   · teacher-dashboard.html  — קורא (בורר כיתות + דשבורד לכל כיתה)
   · teacher-class-board.html — קורא (לוח הכיתה)

   ROSTER = 3 מורי-בדיקה מיושרים לחלוטין לקטלוג (admin-data):
   כל מורה מלמד רק מקצוע שיש לו יחידות אמיתיות בקטלוג — כדי שלא יופיעו
   נתונים על לשון אצל מורה למתמטיקה. הבחירה בין מורי-הבדיקה נעשית בדשבורד.
   ============================================================ */
(function () {
  var KEY = 'retzef.teacher.v1';
  var SCHOOL = 'אורט בית הערבה';

  /* מאגר שמות מעורב (עברי/ערבי) — נחתך לכל כיתה דטרמיניסטית */
  var NAMES = [
    'דנה כהן', 'רון אלמוג', 'מאיה לוי', 'יובל בר', 'נועה שלו', 'איתי גל',
    'שירה דוד', 'עומר נחום', 'ליאן חדד', 'אחמד זועבי', 'סארה נסאר', 'מוחמד עלי',
    'יסמין אבו־ראס', 'טל מזרחי', 'עדן ביטון', 'רותם אבו־קף', 'לינוי סבן', 'אורי פרץ',
    'הדר כץ', 'נדב אשר', 'מרים חורי', 'כרם סאלח', 'נור עבאס', 'דניאל רון',
    'אלין טאהא', 'יונתן מור', 'רים דראושה', 'עידו לביא', 'שני אוחיון', 'פאדי חמד'
  ];
  var pick = function (a, b) { return NAMES.slice(a, b); };

  /* ---- ROSTER: 3 מורי-בדיקה מיושרים ---- */
  function roster() {
    return [
      /* 1 · מורה מקצועי — מתמטיקה (יחידות: math/*) */
      { id: 'yossi', name: 'יוסי אבו־קף', school: SCHOOL, role: 'subject', activeKey: 'yossi-ia2',
        classes: [
          { key: 'yossi-ia2', subject: 'מתמטיקה', grade: 'יא', cls: 'י״א2', homeroom: false, topic: '', photo: '', students: pick(0, 7) },
          { key: 'yossi-ia1', subject: 'מתמטיקה', grade: 'יא', cls: 'י״א1', homeroom: false, topic: '', photo: '', students: pick(7, 14) },
          { key: 'yossi-i4',  subject: 'מתמטיקה', grade: 'י',  cls: 'י׳4',  homeroom: false, topic: '', photo: '', students: pick(14, 20) }
        ] },

      /* 2 · מחנכת + מורה מקצועי — עברית (יחידות: hebrew/*) */
      { id: 'nura', name: 'נורה סאלח', school: SCHOOL, role: 'homeroom', activeKey: 'nura-hr',
        classes: [
          { key: 'nura-hr',  subject: 'כיתת אם', grade: 'י', cls: 'י׳2', homeroom: true,  topic: '', photo: '', note: 'מחנכת · מלמדת גם עברית', students: pick(0, 10) },
          { key: 'nura-he2', subject: 'עברית',   grade: 'י', cls: 'י׳2', homeroom: false, topic: '', photo: '', students: pick(0, 10) },
          { key: 'nura-he1', subject: 'עברית',   grade: 'י', cls: 'י׳1', homeroom: false, topic: '', photo: '', students: pick(10, 18) }
        ] },

      /* 3 · מורה מגמה — עיצוב מדיה (יחידות: media-design/*, 105 יחידות) */
      { id: 'rami', name: 'רמי חדד', school: SCHOOL, role: 'subject', activeKey: 'rami-ia1',
        classes: [
          { key: 'rami-ia1', subject: 'עיצוב מדיה', grade: 'יא', cls: 'י״א1', homeroom: false, topic: '', photo: '', students: pick(0, 8) },
          { key: 'rami-ib1', subject: 'עיצוב מדיה', grade: 'יב', cls: 'י״ב1', homeroom: false, topic: '', photo: '', students: pick(8, 15) }
        ] }
    ];
  }

  function normalize(d) {
    if (!d || !Array.isArray(d.classes)) return null;
    d.classes.forEach(function (c, i) {
      if (!c.key) c.key = 'k' + i;
      if (!Array.isArray(c.students)) c.students = [];
      if (typeof c.topic !== 'string') c.topic = '';
      if (typeof c.photo !== 'string') c.photo = '';
      c.label = (c.subject || 'מקצוע') + ' · ' + (c.cls || ('כיתה ' + (c.grade || '')));
    });
    if (!d.activeKey || !d.classes.some(function (c) { return c.key === d.activeKey; }))
      d.activeKey = d.classes.length ? d.classes[0].key : null;
    return d;
  }

  var Store = {
    KEY: KEY,
    roster: roster,
    /* מחזיר את המורה הפעיל — מ-localStorage, ואם אין → ROSTER[0]. never null */
    get: function () {
      try {
        var raw = localStorage.getItem(KEY);
        if (raw) { var d = normalize(JSON.parse(raw)); if (d && d.classes.length) return d; }
      } catch (e) {}
      return normalize(roster()[0]);
    },
    hasReal: function () { try { return !!localStorage.getItem(KEY); } catch (e) { return false; } },
    save: function (d) {
      d = normalize(d);
      try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {}
      return d;
    },
    /* החלפת מורה-בדיקה פעיל לפי id מה-ROSTER */
    useTeacher: function (id) {
      var t = roster().find(function (x) { return x.id === id; });
      if (t) return this.save(JSON.parse(JSON.stringify(t)));
      return this.get();
    },
    classes: function () { return this.get().classes; },
    activeKey: function () { return this.get().activeKey; },
    activeClass: function () {
      var d = this.get();
      return d.classes.find(function (c) { return c.key === d.activeKey; }) || d.classes[0] || null;
    },
    setActive: function (key) { var d = this.get(); d.activeKey = key; this.save(d); return d; },
    updateClass: function (key, patch) {
      var d = this.get();
      var c = d.classes.find(function (x) { return x.key === key; });
      if (c) { Object.assign(c, patch); this.save(d); }
      return c;
    },
    clear: function () { try { localStorage.removeItem(KEY); } catch (e) {} }
  };

  window.RetzefTeacher = Store;
})();
