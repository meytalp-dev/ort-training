/* ============================================================
   teacher-store.js — מקור-אמת יחיד לנתוני המורה ברֶצֶף (דמו).
   נשמר ב-localStorage תחת retzef.teacher.v1. משותף ל:
   · teacher-setup.html   — כותב (אשף ההרשמה)
   · teacher-dashboard.html — קורא (בורר כיתות + דשבורד לכל כיתה)
   · teacher-class-board.html — קורא (לוח הכיתה)
   הנתונים נובעים מהמורה — לא נופלים מהשמיים.
   ============================================================ */
(function () {
  var KEY = 'retzef.teacher.v1';

  /* נתוני-דמו ברירת-מחדל — כשעדיין לא נרשם אף מורה (כדי שהמסכים לא יהיו ריקים) */
  function demo() {
    return {
      name: 'רותם לוי', school: 'אורט בית הערבה', role: 'homeroom',
      activeKey: 'c1',
      classes: [
        { key:'c1', subject:'לשון', grade:'ט', cls:"ט'2", homeroom:true,
          topic:'הבנת הנקרא — טקסט טיעון', photo:'',
          students:['דנה בר־און','אליה נסאר','רון אלקבץ','מאיה כהן','יואב לוי'] },
        { key:'c2', subject:'ספרות', grade:'ט', cls:"ט'2", homeroom:false,
          topic:'סיפור קצר — נקודת מבט', photo:'',
          students:['דנה בר־און','אליה נסאר','רון אלקבץ'] },
        { key:'c3', subject:'לשון', grade:'י', cls:"י'1", homeroom:false,
          topic:'תחביר — הפְּסוקית', photo:'',
          students:['נועה שלו','עידן ברק','לינוי אבו'] }
      ]
    };
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
    /* מחזיר נתוני מורה — מ-localStorage, ואם אין → דמו. never null */
    get: function () {
      try {
        var raw = localStorage.getItem(KEY);
        if (raw) { var d = normalize(JSON.parse(raw)); if (d && d.classes.length) return d; }
      } catch (e) {}
      return normalize(demo());
    },
    /* האם יש נתונים אמיתיים (מורה שנרשם), להבדיל מדמו */
    hasReal: function () {
      try { return !!localStorage.getItem(KEY); } catch (e) { return false; }
    },
    save: function (d) {
      d = normalize(d);
      try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {}
      return d;
    },
    classes: function () { return this.get().classes; },
    activeKey: function () { return this.get().activeKey; },
    activeClass: function () {
      var d = this.get();
      return d.classes.find(function (c) { return c.key === d.activeKey; }) || d.classes[0] || null;
    },
    setActive: function (key) {
      var d = this.get(); d.activeKey = key; this.save(d); return d;
    },
    /* עדכון שדה בכיתה (topic / photo / students…) */
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
