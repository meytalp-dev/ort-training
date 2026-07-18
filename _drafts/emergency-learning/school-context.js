/* ============================================================
   רֶצֶף — שירות ההקשר הבית-ספרי (School Context · Resef.School)
   school-context.js · שכבת שירות משותפת
   נלווה ל: publish-service.js · favorites.js · seen-service.js (אחים)
   מקור הנתונים: tracks-data.js (window.RETZEF_TRACKS)
   האפיון: data-model.md §5.1 · multi-school-model.md
   ------------------------------------------------------------
   🌐 מה השירות הזה עושה — במשפט אחד:

     מחזיק את בית הספר הפעיל (מי אני), ועונה על שאלה אחת לכל מסך:
     "האם היחידה הזו נראית לבית הספר הנוכחי?" — לפי שלוש שכבות §5.1.

   ------------------------------------------------------------
   🧩 "מקור אמת יחיד" — הכלל שהקוד אוכף:

     הלוגיקה של שלוש שכבות הנראות (בעלות · מגמה · מגזר) נכתבת **פה פעם
     אחת**. אף מסך לא משכפל אותה — כל מסך קורא Resef.School.visible(r).
     כך תיקון כלל-נראות = שורה אחת, בקובץ אחד.

   ------------------------------------------------------------
   ⚖️  למה מותר localStorage:

     "איזה בית ספר נבחר בבורר" הוא העדפת-תצוגה תפעולית (🟢) — לא נתון על
     קטין, לא ציון. בפרוטוטייפ הבורר מדמה את הזהות; במסך אמיתי בית הספר
     יגיע מהשרת ו-set() פשוט יוזן משם.

   ------------------------------------------------------------
   📋 API (Resef.School):
     .id                    → מזהה בית הספר הפעיל
     .school()              → אובייקט בית הספר המלא (או null)
     .schools()             → כל בתי הספר (לבורר)
     .trackIds()            → { track_id: true } — המגמות של בית הספר הנוכחי
     .trackNames()          → [שמות המגמות] להצגה
     .track(id)             → אובייקט מגמה לפי track_id
     .visible(resource)     → true/false לפי §5.1 (שלוש שכבות)
     .set(schoolId)         → קובע בית ספר + משדר onChange
     .mountPicker(selectEl) → ממלא <select> ומחבר אותו
     .onChange(fn)          → מנוי לשינוי בית ספר (מחזיר off())
   ============================================================ */
(function (global) {
  'use strict';

  var KEY = 'retzef-school';
  var TD = global.RETZEF_TRACKS || { tracks: [], schools: [], schoolTracks: [] };

  var TRACK_BY_ID = {};
  TD.tracks.forEach(function (t) { TRACK_BY_ID[t.id] = t; });

  var current = null;
  var listeners = [];

  /* ---------- זהות בית הספר ---------- */
  function school() {
    for (var i = 0; i < TD.schools.length; i++) {
      if (TD.schools[i].id === current) return TD.schools[i];
    }
    return null;
  }

  function trackIds() {
    var out = {};
    TD.schoolTracks.forEach(function (st) {
      if (st.school_id === current && st.active) out[st.track_id] = true;
    });
    return out;
  }

  function trackNames() {
    return Object.keys(trackIds()).map(function (id) {
      return TRACK_BY_ID[id] ? TRACK_BY_ID[id].name : id;
    });
  }

  /* ---------- לב השירות: שלוש שכבות הנראות (data-model §5.1) ----------
     כולן null-סובלניות: null = "שייך לכולם". */
  function visible(r) {
    if (!current || !r) return true;
    // 1. בעלות — null = ספרייה ארצית משותפת
    if (r.owner_school_id && r.owner_school_id !== current) return false;
    // 2. מגמה — null = תוכן לא-מגמתי (ליבה עיונית)
    if (r.track_ref_id && !trackIds()[r.track_ref_id]) return false;
    // 3. מגזר — null = חוצה-מגזר. [לאימות] — אין נתוני sector עדיין
    var sec = school() && school().sector;
    if (r.sector_scope && sec && r.sector_scope !== sec) return false;
    return true;
  }

  /* ---------- קביעה + שידור ---------- */
  function set(id) {
    var ok = TD.schools.some(function (s) { return s.id === id; });
    if (!ok) return;
    current = id;
    try { localStorage.setItem(KEY, id); } catch (e) {}
    emit();
  }

  function emit() {
    listeners.forEach(function (fn) { try { fn(current); } catch (e) {} });
  }

  function onChange(fn) {
    if (typeof fn !== 'function') return function () {};
    listeners.push(fn);
    return function off() {
      var i = listeners.indexOf(fn);
      if (i > -1) listeners.splice(i, 1);
    };
  }

  /* ---------- בורר בית ספר (פרוטוטייפ) ----------
     ממלא <select> ומחבר אותו. במסך אמיתי אין בורר — set() מוזן מהשרת. */
  function mountPicker(sel) {
    if (!sel) return;
    sel.innerHTML = TD.schools.map(function (s) {
      return '<option value="' + s.id + '">' + esc(s.name) + '</option>';
    }).join('');
    sel.value = current;
    sel.addEventListener('change', function () { set(sel.value); });
    onChange(function (id) { if (sel.value !== id) sel.value = id; });
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- אתחול: localStorage → בית ספר ראשון ---------- */
  (function init() {
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    var ok = TD.schools.some(function (s) { return s.id === saved; });
    current = ok ? saved : (TD.schools[0] ? TD.schools[0].id : null);
  })();

  var api = {
    get id() { return current; },
    school: school,
    schools: function () { return TD.schools.slice(); },
    trackIds: trackIds,
    trackNames: trackNames,
    track: function (id) { return TRACK_BY_ID[id] || null; },
    visible: visible,
    set: set,
    mountPicker: mountPicker,
    onChange: onChange
  };

  global.Resef = global.Resef || {};
  global.Resef.School = api;

})(typeof window !== 'undefined' ? window : this);
