/* ============================================================
   רֶצֶף — Library Filters  ·  library-filters.js  ·  Resef.Library
   ------------------------------------------------------------
   מנוע סינון + סכימת סוגי-תוכן אחידה למדף הרציפות (spec.md §5.5,
   taxonomy.md). סינון רב-ממדי לפי 4 פאות:
       מקצוע (subject) · שכבה (grade) · רמה (level) · סוג (type)
   בשילוב חיפוש-טקסט. צורך את SearchField (components.css · W0-08)
   ואת מנוע החיפוש Resef.Search (search-service.js).

   ------------------------------------------------------------
   סכימת סוגי-התוכן האחידה (content_type) — 7 סוגים
   ------------------------------------------------------------
   כל פריט על המדף — לא משנה איך נבנה — נושא content_type אחיד אחד:

     unit         · יחידה      · יחידת 5-מסכים מלאה (content-standard §1)
     presentation · מצגת       · שקפי הקנייה / הצגה
     video        · סרטון      · וידאו לימודי (פנימי או מוטמע)
     quiz         · בוחן       · הערכה נושאת-ציון / חידון
     worksheet    · דף עבודה   · דף תרגול / משימה להדפסה או מילוי
     simulation   · סימולציה   · מדמה אינטראקטיבי / חקר
     link         · קישור      · הפניה לתוכן חיצוני (קמפוס IL / מטח)

   מיפוי מ-data-model (ContentUnit.unit_type = task/assessment/reference):
       task        → unit
       assessment  → quiz
       reference   → link
   פריט שנושא content_type מפורש (מצגת/סרטון/דף-עבודה/סימולציה) גובר
   על המיפוי — כך הספרייה מחזיקה סוגי-אובייקט מעבר ל-ContentUnit.

   ------------------------------------------------------------
   שימוש
   ------------------------------------------------------------
     // מנוע טהור (ללא DOM):
     var out = Resef.Library.filterItems(items, { q:'משוואה', subject:['מתמטיקה'], grade:['י'] });

     // בר-מסננים מלא (SearchField + צ'יפים + ספירה חיה):
     Resef.Library.mount('#lib', {
       items: LIBRARY,
       onResult: function (rows, state) { render(rows); }
     });

   ============================================================ */
(function (global) {
  'use strict';

  var doc = global.document;

  /* ---------- אייקוני-קו (SVG · לא-אימוג'י) ---------- */
  var IC = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
    clear:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    broom:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 4 8.5 14"/><path d="M5 20c-.5-2 .5-4 2.5-5l8-4"/><path d="M11 15c2 1 3.5 3 3 5H8c-.5-2 .5-4 3-5z"/></svg>',
    // סוגי-תוכן
    unit:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 8 4-8 4-8-4 8-4z"/><path d="m4 12 8 4 8-4"/><path d="m4 17 8 4 8-4"/></svg>',
    presentation: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M12 16v4M8 21h8"/></svg>',
    video:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3V9z" fill="currentColor" stroke="none"/></svg>',
    quiz:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/></svg>',
    worksheet:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3v5h5"/><path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8l-5-5z"/><path d="M8 13h8M8 17h5"/></svg>',
    simulation:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h10M18 8h2M4 16h2M10 16h10"/><circle cx="16" cy="8" r="2.4"/><circle cx="8" cy="16" r="2.4"/></svg>',
    link:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>'
  };

  /* ============================================================
     חלק א' — טקסונומיית הפאות (taxonomy.md)
     ============================================================ */

  // 8 מקצועות (taxonomy §א). id = הערך שהפריט נושא בשדה subject.
  var SUBJECTS = [
    { id: 'לשון',        label: 'לשון והבעה' },
    { id: 'מתמטיקה',     label: 'מתמטיקה' },
    { id: 'אנגלית',      label: 'אנגלית' },
    { id: 'אזרחות',      label: 'אזרחות' },
    { id: 'היסטוריה',    label: 'היסטוריה' },
    { id: 'תנ"ך',        label: 'תנ"ך' },
    { id: 'מדעים',       label: 'מדעים' },
    { id: 'מדעי המחשב',  label: 'מדעי המחשב' }
  ];

  // שכבות ט–יב (taxonomy §א).
  var GRADES = [
    { id: 'ט',  label: 'ט׳' },
    { id: 'י',  label: 'י׳' },
    { id: 'יא', label: 'יא׳' },
    { id: 'יב', label: 'יב׳' }
  ];

  // 3 רמות קנוניות (content-standard.md §183 · data-model.md v4 §3.4).
  // standard = ברירת המחדל. התלמיד לא רואה את שם הרמה — זה סינון למורה.
  var LEVELS = [
    { id: 'basic',    label: 'נגישה' },
    { id: 'standard', label: 'רגילה' },
    { id: 'advanced', label: 'מתקדמת' }
  ];

  // סכימת סוגי-התוכן האחידה (7 סוגים).
  var CONTENT_TYPES = [
    { id: 'unit',         label: 'יחידה',    icon: IC.unit },
    { id: 'presentation', label: 'מצגת',     icon: IC.presentation },
    { id: 'video',        label: 'סרטון',    icon: IC.video },
    { id: 'quiz',         label: 'בוחן',     icon: IC.quiz },
    { id: 'worksheet',    label: 'דף עבודה', icon: IC.worksheet },
    { id: 'simulation',   label: 'סימולציה', icon: IC.simulation },
    { id: 'link',         label: 'קישור',    icon: IC.link }
  ];

  // מיפוי unit_type (data-model) → content_type אחיד.
  var UNIT_TYPE_TO_CONTENT_TYPE = {
    task:       'unit',
    assessment: 'quiz',
    reference:  'link'
  };

  // רישום הפאות: id, תווית, ומקור-הערכים.
  var FACET_DEFS = {
    subject: { key: 'subject', label: 'מקצוע', values: SUBJECTS },
    grade:   { key: 'grade',   label: 'שכבה',  values: GRADES },
    level:   { key: 'level',   label: 'רמה',   values: LEVELS },
    type:    { key: 'type',    label: 'סוג',   values: CONTENT_TYPES }
  };
  var FACET_ORDER = ['subject', 'grade', 'level', 'type'];

  function labelFor(facet, id) {
    var def = FACET_DEFS[facet];
    if (!def) return id;
    for (var i = 0; i < def.values.length; i++) if (def.values[i].id === id) return def.values[i].label;
    return id;
  }

  /* ============================================================
     חלק ב' — מנוע הסינון (טהור, ללא DOM)
     ============================================================ */

  // סוג-התוכן של פריט: content_type מפורש → מיפוי unit_type → type.
  function typeOf(item) {
    if (!item) return null;
    if (item.content_type) return item.content_type;
    if (item.unit_type && UNIT_TYPE_TO_CONTENT_TYPE[item.unit_type]) return UNIT_TYPE_TO_CONTENT_TYPE[item.unit_type];
    return item.type || null;
  }

  // ערך-פאה של פריט. accessors ניתנים לדריסה דרך opts.
  function valueOf(item, facet, acc) {
    acc = acc || {};
    switch (facet) {
      case 'subject': return acc.getSubject ? acc.getSubject(item) : item.subject;
      case 'grade':   return acc.getGrade   ? acc.getGrade(item)   : item.grade;
      case 'level':   return acc.getLevel   ? acc.getLevel(item)   : item.level;
      case 'type':    return acc.getType    ? acc.getType(item)    : typeOf(item);
      default:        return null;
    }
  }

  function toArr(v) {
    if (v == null) return [];
    return Object.prototype.toString.call(v) === '[object Array]' ? v.slice() : [v];
  }

  // נירמול state: כל פאה = מערך (ריק = "הכל"); q = מחרוזת.
  function normalizeState(state) {
    state = state || {};
    return {
      q:       state.q != null ? String(state.q) : '',
      subject: toArr(state.subject),
      grade:   toArr(state.grade),
      level:   toArr(state.level),
      type:    toArr(state.type)
    };
  }

  // האם הפריט עובר את כל הפאות הפעילות — מלבד exceptFacet (לחישוב ספירות).
  // בתוך פאה: OR (אחד מהערכים). בין פאות: AND.
  function facetPass(item, state, exceptFacet, acc) {
    for (var i = 0; i < FACET_ORDER.length; i++) {
      var f = FACET_ORDER[i];
      if (f === exceptFacet) continue;
      var sel = state[f];
      if (!sel || !sel.length) continue;
      if (sel.indexOf(valueOf(item, f, acc)) < 0) return false;
    }
    return true;
  }

  // התאמת-טקסט דרך מנוע Resef.Search (נורמליזציה עברית, ניקוד/סופיות).
  function textPass(item, q, acc) {
    if (!q) return true;
    if (global.Resef && global.Resef.Search) {
      return global.Resef.Search.matches(item, q, { getText: acc.getText });
    }
    // fallback עצמאי אם מנוע החיפוש לא נטען
    var hay = (acc.getText ? JSON.stringify(acc.getText(item)) :
      [item.title, item.desc, item.description, (item.tags || []).join(' ')].join(' '));
    return String(hay).toLowerCase().indexOf(String(q).toLowerCase()) >= 0;
  }

  /* filterItems(items, state, opts) → מערך פריטים שעברו את כל הפאות + הטקסט.
       state : { q, subject[], grade[], level[], type[] }
       opts  : { getText, getSubject, getGrade, getLevel, getType }
     כשיש q — התוצאה ממוינת לפי רלוונטיות (Resef.Search.rank); אחרת סדר-מקור. */
  function filterItems(items, state, opts) {
    items = items || [];
    var acc = opts || {};
    var st = normalizeState(state);

    var pool = items.filter(function (it) {
      return textPass(it, st.q, acc) && facetPass(it, st, null, acc);
    });

    if (st.q && global.Resef && global.Resef.Search) {
      return global.Resef.Search.rank(pool, st.q, { getText: acc.getText });
    }
    return pool;
  }

  /* deriveCounts(items, state, opts) → { subject:{id:count}, grade:{...}, ... }
     לכל ערך-פאה: כמה תוצאות יתקבלו אם הוא ייבחר, בהינתן שאר הפאות והטקסט.
     משמש להצגת ספירות חיות ולהשבתת ערכים אפסיים. */
  function deriveCounts(items, state, opts) {
    items = items || [];
    var acc = opts || {};
    var st = normalizeState(state);
    var out = {};

    FACET_ORDER.forEach(function (f) {
      out[f] = {};
      // מאגר-הבסיס לפאה: פריטים שעברו טקסט + כל הפאות האחרות (לא F).
      var base = items.filter(function (it) {
        return textPass(it, st.q, acc) && facetPass(it, st, f, acc);
      });
      base.forEach(function (it) {
        var v = valueOf(it, f, acc);
        if (v == null) return;
        out[f][v] = (out[f][v] || 0) + 1;
      });
    });
    return out;
  }

  /* ============================================================
     חלק ג' — UI: בר-מסננים מלא (SearchField + צ'יפים)
     ============================================================ */
  var _seq = 0;
  function uid(p) { _seq += 1; return (p || 'lf') + '_' + _seq; }

  function resolveEl(t) { return typeof t === 'string' ? doc.querySelector(t) : t; }

  function el(tag, cls, html) {
    var n = doc.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  /* בונה שדה-חיפוש בשפת components.css (SearchField · W0-08).
     מחזיר { root, input } — הלוגיקה מחווטת ע"י הקורא. */
  function buildSearchField(opts) {
    var wrap = el('div', 'search-field search-field--block');
    var box = el('div', 'search-field__box');
    var icon = el('span', 'search-field__icon', IC.search);
    var input = doc.createElement('input');
    input.type = 'search';
    input.className = 'search-field__input';
    input.setAttribute('autocomplete', 'off');
    input.placeholder = opts.searchPlaceholder || 'חיפוש — כותרת, תיאור או תגית…';
    input.setAttribute('aria-label', opts.searchLabel || 'חיפוש בספרייה');
    var clearBtn = doc.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'search-field__clear';
    clearBtn.setAttribute('aria-label', 'ניקוי חיפוש');
    clearBtn.innerHTML = IC.clear;
    clearBtn.hidden = true;
    box.appendChild(icon); box.appendChild(input); box.appendChild(clearBtn);
    wrap.appendChild(box);
    return { root: wrap, input: input, clearBtn: clearBtn };
  }

  /* mount(target, opts) — בר-מסננים מלא.
     opts:
       items          : מערך | פונקציה→מערך
       facets         : סדר/בחירת פאות (ברירת מחדל: ['subject','grade','level','type'])
       getText        : item → {title,desc,tags} לחיפוש
       getSubject/getGrade/getLevel/getType : accessors לדריסה
       onResult       : (rows[], state) → נקרא בכל שינוי (הקורא מרנדר)
       initial        : state התחלתי { q, subject, grade, level, type }
       showCounts     : true (ברירת מחדל) — ספירות חיות + השבתת ערך אפסי
       debounce       : ms (ברירת מחדל 90)
     מחזיר controller: { root, getState, setState, setItems, clear, refresh, destroy }.
  */
  function mount(target, opts) {
    opts = opts || {};
    var host = resolveEl(target);
    if (!host) { if (global.console) console.warn('[Resef.Library] mount: target not found', target); return null; }

    var facets = opts.facets || FACET_ORDER.slice();
    var showCounts = opts.showCounts !== false;
    var acc = {
      getText: opts.getText,
      getSubject: opts.getSubject, getGrade: opts.getGrade,
      getLevel: opts.getLevel, getType: opts.getType
    };
    var state = normalizeState(opts.initial);

    function getItems() {
      return typeof opts.items === 'function' ? (opts.items() || []) : (opts.items || []);
    }

    /* --- שלד ה-DOM --- */
    var root = el('div', 'facet-bar');
    root.setAttribute('role', 'search');

    // שדה חיפוש
    var searchWrap = el('div', 'facet-bar__search');
    var sf = buildSearchField(opts);
    searchWrap.appendChild(sf.root);
    root.appendChild(searchWrap);

    // קבוצות-פאה
    var groupsWrap = el('div', 'facet-groups');
    var chipIndex = {}; // facet → { valueId → buttonEl }
    facets.forEach(function (f) {
      var def = FACET_DEFS[f];
      if (!def) return;
      chipIndex[f] = {};
      var group = el('div', 'facet-group');
      group.setAttribute('role', 'group');
      var groupId = uid('facetlbl');
      var lbl = el('span', 'facet-group__label', def.label);
      lbl.id = groupId;
      group.setAttribute('aria-labelledby', groupId);
      var chips = el('div', 'facet-group__chips');
      def.values.forEach(function (v) {
        var btn = doc.createElement('button');
        btn.type = 'button';
        btn.className = 'facet-chip';
        btn.setAttribute('aria-pressed', 'false');
        btn.setAttribute('data-facet', f);
        btn.setAttribute('data-value', v.id);
        var inner = (v.icon ? v.icon : '') + '<span>' + v.label + '</span>' +
          (showCounts ? '<span class="facet-chip__count" aria-hidden="true"></span>' : '');
        btn.innerHTML = inner;
        btn.addEventListener('click', function () { toggle(f, v.id); });
        chips.appendChild(btn);
        chipIndex[f][v.id] = btn;
      });
      group.appendChild(lbl);
      group.appendChild(chips);
      groupsWrap.appendChild(group);
    });
    root.appendChild(groupsWrap);

    // תחתית — ספירה + ניקוי הכל
    var foot = el('div', 'facet-bar__foot');
    var countEl = el('span', 'facet-count');
    countEl.setAttribute('role', 'status');
    countEl.setAttribute('aria-live', 'polite');
    var clearAll = doc.createElement('button');
    clearAll.type = 'button';
    clearAll.className = 'facet-clear';
    clearAll.innerHTML = IC.broom + '<span>ניקוי כל המסננים</span>';
    clearAll.hidden = true;
    clearAll.addEventListener('click', clear);
    foot.appendChild(countEl);
    foot.appendChild(clearAll);
    root.appendChild(foot);

    host.appendChild(root);

    /* --- חיווט שדה-החיפוש (צריכת SearchField + Resef.Search) --- */
    var debounceMs = opts.debounce != null ? opts.debounce : 90;
    var timer = null;
    function onType() {
      state.q = sf.input.value;
      sf.clearBtn.hidden = !sf.input.value;
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () { timer = null; apply(); }, debounceMs);
    }
    sf.input.addEventListener('input', onType);
    sf.input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sf.input.value) { e.preventDefault(); sf.input.value = ''; state.q = ''; sf.clearBtn.hidden = true; apply(); }
    });
    sf.clearBtn.addEventListener('click', function () {
      sf.input.value = ''; state.q = ''; sf.clearBtn.hidden = true; apply(); sf.input.focus();
    });

    /* --- מצב --- */
    function toggle(facet, valueId) {
      var arr = state[facet];
      var i = arr.indexOf(valueId);
      if (i >= 0) arr.splice(i, 1); else arr.push(valueId);
      apply();
    }

    function isDirty() {
      return !!state.q || facets.some(function (f) { return state[f] && state[f].length; });
    }

    function apply() {
      var items = getItems();
      var rows = filterItems(items, state, acc);
      var counts = showCounts ? deriveCounts(items, state, acc) : null;

      // עדכון צ'יפים — pressed + ספירה + השבתת אפסים
      facets.forEach(function (f) {
        var sel = state[f];
        Object.keys(chipIndex[f]).forEach(function (vid) {
          var btn = chipIndex[f][vid];
          var on = sel.indexOf(vid) >= 0;
          btn.setAttribute('aria-pressed', on ? 'true' : 'false');
          if (counts) {
            var c = counts[f][vid] || 0;
            var cEl = btn.querySelector('.facet-chip__count');
            if (cEl) cEl.textContent = c ? String(c) : '';
            // אל תשבית ערך שכבר נבחר (כדי שאפשר יהיה לבטלו)
            var disable = !on && c === 0;
            btn.disabled = disable;
            btn.setAttribute('aria-disabled', disable ? 'true' : 'false');
          }
        });
      });

      // ספירת-תוצאות + ניקוי-הכל
      var n = rows.length;
      countEl.innerHTML = n === 0 ? 'לא נמצאו תוצאות' :
        n === 1 ? 'נמצאה <b>תוצאה אחת</b>' :
        'נמצאו <b>' + n + '</b> תוצאות';
      clearAll.hidden = !isDirty();

      if (typeof opts.onResult === 'function') opts.onResult(rows, getState());
    }

    function clear() {
      state = normalizeState({});
      sf.input.value = '';
      sf.clearBtn.hidden = true;
      apply();
    }

    function getState() {
      return {
        q: state.q,
        subject: state.subject.slice(), grade: state.grade.slice(),
        level: state.level.slice(), type: state.type.slice()
      };
    }

    function setState(next) {
      state = normalizeState(next);
      sf.input.value = state.q;
      sf.clearBtn.hidden = !state.q;
      apply();
    }

    // סנכרון ערכי-initial לתוך שדה-החיפוש
    sf.input.value = state.q;
    sf.clearBtn.hidden = !state.q;
    apply();

    return {
      root: root,
      input: sf.input,
      getState: getState,
      setState: setState,
      setItems: function (arr) { opts.items = arr; apply(); },
      refresh: apply,
      clear: clear,
      destroy: function () { if (root.parentNode) root.parentNode.removeChild(root); }
    };
  }

  /* ============================================================
     ייצוא
     ============================================================ */
  var Resef = global.Resef || (global.Resef = {});
  Resef.Library = {
    // טקסונומיה
    SUBJECTS: SUBJECTS,
    GRADES: GRADES,
    LEVELS: LEVELS,
    CONTENT_TYPES: CONTENT_TYPES,
    UNIT_TYPE_TO_CONTENT_TYPE: UNIT_TYPE_TO_CONTENT_TYPE,
    FACET_DEFS: FACET_DEFS,
    FACET_ORDER: FACET_ORDER,
    // עזרי-סכימה
    typeOf: typeOf,
    labelFor: labelFor,
    // מנוע טהור
    filterItems: filterItems,
    deriveCounts: deriveCounts,
    normalizeState: normalizeState,
    // UI
    mount: mount
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = Resef.Library;

})(typeof window !== 'undefined' ? window : this);
