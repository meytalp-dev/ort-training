/* ============================================================
   רֶצֶף — חיפוש חכם משותף (SearchField) · W0-08
   search-service.js · שכבת שירות משותפת · מקור אמת יחיד לחיפוש בכל התצוגות
   נלווה ל: design-system-brief.md §7 · components.css (מקטע Search) · search-field.html
   ------------------------------------------------------------
   מה זה: מנוע חיפוש אחד + רכיב SearchField אחד לכל התצוגות (ספרייה / כיתות / ניהול).
   במקום שכל מסך יכתוב חיפוש משלו — כולם צורכים את Resef.Search.

   שני מצבי שימוש (אותו מנוע דירוג בבסיס):
     1. mount()  — "קפיצה": שדה + פאנל תוצאות (ARIA combobox). בחירה → onSelect(item).
                    מתאים לחיפוש-על בספרייה/כיתות: מקלידים, רואים תוצאות, קופצים לפריט.
     2. filter() — "סינון במקום": משדרג <input> קיים, ומחזיר את הפריטים התואמים
                    לקולבק כדי שהמסך יסנן רשימה/טבלה שהוא כבר מציג (ניהול/ספרייה).

   דירוג: חיפוש לפי כותרת (משקל 3) / תגית (2) / תיאור (1). כל מילות-החיפוש חייבות
   להימצא (AND). התאמה בתחילת-מילה מדורגת מעל התאמה באמצע. עברית: ניקוד וסופיות
   מנוטרלים כדי ש"שלום"="שָׁלוֹם" ו"ספר"="ספרים" (prefix) יתפסו.

   מינימיזציה: מנוע חיפוש על טקסט של פריטים (יחידות/כיתות/משתמשים שכבר בתצוגה).
   אינו שומר דבר, אינו שולח דבר, אינו רושם היסטוריית חיפוש. חיפוש = פעולת-קריאה בלבד.

   שימוש:
     <script src="search-service.js"></script>
     // מצב קפיצה:
     var ctl = Resef.Search.mount('#libSearch', {
       items: units, getLabel: function(u){return u.title}, getMeta: function(u){return u.subject},
       placeholder: 'חיפוש יחידה…', label: 'חיפוש בספרייה',
       onSelect: function(u){ openUnit(u); }
     });
     // מצב סינון:
     Resef.Search.filter('#tblSearch', {
       items: function(){ return rows; },
       onResult: function(matches, term){ renderRows(matches); }
     });
   ============================================================ */
(function (global) {
  'use strict';

  var doc = global.document;

  /* ============================================================
     חלק א' — מנוע הדירוג (טהור, בלי DOM)
     ============================================================ */

  /* ---------- נורמליזציה עברית ---------- */
  // מסיר ניקוד וטעמים (U+0591–U+05C7), מנרמל אותיות סופיות (ךםןףץ → כמנפצ),
  // מוריד רישיות, ומצמצם רווחים. כך "שָׁלוֹם"==="שלום" ו"ארגון"/"ארגן" מתלכדים בבסיס.
  var NIKUD = /[֑-ׇ]/g;
  var FINALS = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' };
  var PUNCT = /["'`׳״.,;:!?()\[\]{}\/\\|_\-–—]/g;

  function normalize(str) {
    if (str == null) return '';
    var s = String(str).replace(NIKUD, '').toLowerCase();
    var out = '';
    for (var i = 0; i < s.length; i++) {
      var ch = s[i];
      out += FINALS[ch] || ch;
    }
    return out.replace(PUNCT, ' ').replace(/\s+/g, ' ').trim();
  }

  // פירוק מחרוזת-חיפוש למילים מנורמלות (בלי כפילויות ריקות).
  function tokenize(term) {
    var n = normalize(term);
    if (!n) return [];
    return n.split(' ').filter(Boolean);
  }

  /* ---------- קריאת שדות מפריט ---------- */
  // ברירת מחדל: title / desc|description / tags. אפשר להחליף דרך opts.fields
  // או opts.getText(item) שמחזיר { title, desc, tags:[] }.
  var DEFAULT_FIELDS = [
    { get: function (it) { return it && (it.title != null ? it.title : it.name); }, weight: 3, kind: 'title' },
    { get: function (it) { return it && (it.tags || it.tag); }, weight: 2, kind: 'tag' },
    { get: function (it) { return it && (it.desc != null ? it.desc : it.description); }, weight: 1, kind: 'desc' }
  ];

  // ממיר ערך-שדה (מחרוזת / מערך תגיות) לרשימת מחרוזות מנורמלות.
  function fieldTexts(raw) {
    if (raw == null) return [];
    if (Array.isArray(raw)) {
      return raw.map(normalize).filter(Boolean);
    }
    var n = normalize(raw);
    return n ? [n] : [];
  }

  // ניקוד התאמה של מילה בודדת מול טקסט-שדה מנורמל:
  //   0 = אין התאמה · 1 = התאמה באמצע-מילה · 2 = התאמה בתחילת-מילה (prefix) · 3 = מילה מלאה.
  function scoreTermInText(term, text) {
    var idx = text.indexOf(term);
    if (idx === -1) return 0;
    // התאמה מלאה של מילה שלמה?
    var words = text.split(' ');
    for (var w = 0; w < words.length; w++) {
      if (words[w] === term) return 3;
      if (words[w].indexOf(term) === 0) return 2; // תחילת מילה
    }
    return 1; // באמצע
  }

  // ניקוד מילה מול כל הטקסטים של שדה — לוקח את הטוב ביותר.
  function scoreTermInField(term, texts) {
    var best = 0;
    for (var i = 0; i < texts.length; i++) {
      var s = scoreTermInText(term, texts[i]);
      if (s > best) best = s;
      if (best === 3) break;
    }
    return best;
  }

  /* ---------- דירוג פריט בודד ---------- */
  // מחזיר { matched:bool, score:number } — matched=false אם ולו מילה אחת לא נמצאה בשום שדה (AND).
  function scoreItem(item, terms, fields, getText) {
    // אוסף טקסטים לכל "kind" (title/tag/desc)
    var buckets;
    if (typeof getText === 'function') {
      var t = getText(item) || {};
      buckets = [
        { texts: fieldTexts(t.title), weight: 3 },
        { texts: fieldTexts(t.tags), weight: 2 },
        { texts: fieldTexts(t.desc), weight: 1 }
      ];
    } else {
      buckets = fields.map(function (f) {
        return { texts: fieldTexts(f.get(item)), weight: f.weight };
      });
    }

    var total = 0;
    for (var ti = 0; ti < terms.length; ti++) {
      var term = terms[ti];
      var termBest = 0;
      for (var bi = 0; bi < buckets.length; bi++) {
        var s = scoreTermInField(term, buckets[bi].texts);
        if (s > 0) {
          var weighted = s * buckets[bi].weight;
          if (weighted > termBest) termBest = weighted;
        }
      }
      if (termBest === 0) return { matched: false, score: 0 }; // מילה לא נמצאה → פריט נפסל
      total += termBest;
    }
    return { matched: true, score: total };
  }

  /* ---------- ה-API הטהור ---------- */
  // rank(items, term, opts) → מערך פריטים תואמים בלבד, ממוין לפי רלוונטיות ואז לפי הסדר המקורי.
  // opts: { fields?, getText?, limit? }
  function rank(items, term, opts) {
    opts = opts || {};
    items = items || [];
    var terms = tokenize(term);
    if (!terms.length) {
      // חיפוש ריק = הכל (בלי דירוג), עד limit אם הוגדר.
      return opts.limit ? items.slice(0, opts.limit) : items.slice();
    }
    var fields = opts.fields || DEFAULT_FIELDS;
    var scored = [];
    for (var i = 0; i < items.length; i++) {
      var r = scoreItem(items[i], terms, fields, opts.getText);
      if (r.matched) scored.push({ item: items[i], score: r.score, idx: i });
    }
    scored.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return a.idx - b.idx; // יציבות: שומר סדר מקורי בין שווי-ניקוד
    });
    var out = scored.map(function (s) { return s.item; });
    return opts.limit ? out.slice(0, opts.limit) : out;
  }

  // matches(item, term, opts) → bool. שימושי לסינון ידני של מסך.
  function matches(item, term, opts) {
    opts = opts || {};
    var terms = tokenize(term);
    if (!terms.length) return true;
    var fields = opts.fields || DEFAULT_FIELDS;
    return scoreItem(item, terms, fields, opts.getText).matched;
  }

  /* ---------- הדגשת התאמות (בטוח מפני HTML) ---------- */
  // מחזיר מחרוזת HTML עם <mark> סביב התאמות. עוטף escape על כל טקסט המקור.
  // הדגשה literal לפי מילות-החיפוש (חסינת-רישיות); best-effort, לא חסינת-ניקוד.
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function highlight(text, term) {
    var raw = String(text == null ? '' : text);
    var terms = String(term == null ? '' : term).trim().split(/\s+/).filter(Boolean);
    if (!terms.length) return escapeHtml(raw);
    // בונים regex מכל המילים (הארוכה קודם למניעת חיתוך), עם escape לתווי-regex.
    var esc = terms
      .sort(function (a, b) { return b.length - a.length; })
      .map(function (t) { return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); });
    var re = new RegExp('(' + esc.join('|') + ')', 'gi');
    var result = '';
    var last = 0, m;
    re.lastIndex = 0;
    while ((m = re.exec(raw)) !== null) {
      result += escapeHtml(raw.slice(last, m.index));
      result += '<mark class="search-hit">' + escapeHtml(m[0]) + '</mark>';
      last = m.index + m[0].length;
      if (m.index === re.lastIndex) re.lastIndex++; // הגנה מלולאה על התאמה-ריקה
    }
    result += escapeHtml(raw.slice(last));
    return result;
  }

  /* ============================================================
     חלק ב' — עזרי DOM משותפים לרכיב
     ============================================================ */

  var _seq = 0;
  function uid(prefix) { _seq += 1; return (prefix || 'sf') + '_' + _seq; }

  var SEARCH_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>';
  var CLEAR_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';

  function resolveEl(target) {
    if (!target) return null;
    if (typeof target === 'string') return doc.querySelector(target);
    return target; // כבר אלמנט
  }

  function prefersReducedMotion() {
    return !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  // debounce קטן — מונע ריצת-דירוג על כל הקשה בודדת ברשימות גדולות.
  function debounce(fn, ms) {
    var timer = null;
    var wrapped = function () {
      var args = arguments, self = this;
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () { timer = null; fn.apply(self, args); }, ms);
    };
    wrapped.flush = function () {
      if (timer) { clearTimeout(timer); timer = null; }
    };
    return wrapped;
  }

  /* ============================================================
     חלק ג' — mount(): SearchField מלא עם פאנל תוצאות (ARIA combobox)
     ============================================================ */
  /* opts:
       items      : מערך פריטים | פונקציה שמחזירה מערך (נקרא בכל חיפוש → תמיד עדכני).
       getLabel   : item → כותרת להצגה (ברירת מחדל: title/name).
       getMeta    : item → שורת-משנה קטנה (מקצוע/כיתה/תגית) — אופציונלי.
       getText    : item → {title,desc,tags} לחיפוש (אופציונלי; אחרת שדות ברירת מחדל).
       onSelect   : item → נקרא בבחירה (Enter/קליק). חובה ב-mode קפיצה.
       placeholder, label (aria), limit (ברירת מחדל 8),
       emptyText  : טקסט כשאין תוצאות (ברירת מחדל "לא נמצאו תוצאות").
       size       : 'sm' | 'md'(ברירת מחדל) | 'lg'.
       block      : true → רוחב מלא (מובייל).
     מחזיר controller: { input, setItems, clear, focus, destroy, root }.
  */
  function mount(target, opts) {
    opts = opts || {};
    var host = resolveEl(target);
    if (!host) { if (global.console) console.warn('[Resef.Search] mount: target not found', target); return null; }

    var getLabel = opts.getLabel || function (it) { return it && (it.title != null ? it.title : it.name != null ? it.name : String(it)); };
    var getMeta = opts.getMeta || null;
    var limit = opts.limit || 8;
    var emptyText = opts.emptyText || 'לא נמצאו תוצאות';
    var listId = uid('sf-list');
    var statusId = uid('sf-status');

    /* --- בניית DOM --- */
    var root = doc.createElement('div');
    root.className = 'search-field' + (opts.size ? ' search-field--' + opts.size : '') + (opts.block ? ' search-field--block' : '');

    var box = doc.createElement('div');
    box.className = 'search-field__box';
    box.setAttribute('role', 'combobox');
    box.setAttribute('aria-haspopup', 'listbox');
    box.setAttribute('aria-expanded', 'false');
    box.setAttribute('aria-owns', listId);

    var icon = doc.createElement('span');
    icon.className = 'search-field__icon';
    icon.innerHTML = SEARCH_ICON;

    var input = doc.createElement('input');
    input.type = 'search';
    input.className = 'search-field__input';
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('autocapitalize', 'off');
    input.setAttribute('spellcheck', 'false');
    input.setAttribute('role', 'searchbox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-controls', listId);
    input.setAttribute('aria-expanded', 'false');
    if (opts.placeholder) input.placeholder = opts.placeholder;
    if (opts.label) input.setAttribute('aria-label', opts.label);
    // חיבור ה-combobox ל-input כדי ש-VoiceOver/NVDA יקראו את המצב
    box.setAttribute('aria-controls', listId);

    var clearBtn = doc.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'search-field__clear';
    clearBtn.setAttribute('aria-label', 'ניקוי חיפוש');
    clearBtn.innerHTML = CLEAR_ICON;
    clearBtn.hidden = true;

    box.appendChild(icon);
    box.appendChild(input);
    box.appendChild(clearBtn);

    var panel = doc.createElement('div');
    panel.className = 'search-field__panel';
    panel.hidden = true;

    var list = doc.createElement('ul');
    list.className = 'search-field__list';
    list.id = listId;
    list.setAttribute('role', 'listbox');
    if (opts.label) list.setAttribute('aria-label', opts.label);

    panel.appendChild(list);

    // אזור-חי להכרזת מספר תוצאות לקוראי-מסך (לא-חזותי)
    var status = doc.createElement('div');
    status.id = statusId;
    status.className = 'sr-only';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');

    root.appendChild(box);
    root.appendChild(panel);
    root.appendChild(status);
    host.appendChild(root);

    /* --- מצב פנימי --- */
    var current = [];       // התוצאות המוצגות כרגע
    var activeIndex = -1;    // האפשרות המסומנת (aria-activedescendant)
    var open = false;

    function getItems() {
      return typeof opts.items === 'function' ? (opts.items() || []) : (opts.items || []);
    }

    function announce(msg) { status.textContent = msg; }

    function setOpen(v) {
      open = v;
      panel.hidden = !v;
      box.setAttribute('aria-expanded', v ? 'true' : 'false');
      input.setAttribute('aria-expanded', v ? 'true' : 'false');
      if (!v) {
        activeIndex = -1;
        input.removeAttribute('aria-activedescendant');
      }
    }

    function renderEmpty() {
      list.innerHTML = '';
      var li = doc.createElement('li');
      li.className = 'search-field__empty';
      li.setAttribute('role', 'presentation');
      // קו-רצף קצר + נקודה (Empty State גאומטרי לפי הבריף) + טקסט
      li.innerHTML =
        '<span class="search-field__empty-mark" aria-hidden="true">' +
          '<svg viewBox="0 0 48 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h14M30 6h14"/><circle cx="24" cy="6" r="3.2" fill="currentColor" stroke="none"/></svg>' +
        '</span>' +
        '<span class="search-field__empty-text"></span>';
      li.querySelector('.search-field__empty-text').textContent = emptyText;
      list.appendChild(li);
    }

    function optionId(i) { return listId + '-opt-' + i; }

    function render(term) {
      var items = getItems();
      var results = rank(items, term, { getText: opts.getText, fields: opts.fields, limit: limit });
      current = results;
      activeIndex = -1;
      input.removeAttribute('aria-activedescendant');

      if (!term) { setOpen(false); list.innerHTML = ''; announce(''); return; }

      if (!results.length) {
        renderEmpty();
        setOpen(true);
        announce(emptyText);
        return;
      }

      list.innerHTML = '';
      results.forEach(function (item, i) {
        var li = doc.createElement('li');
        li.className = 'search-field__opt';
        li.id = optionId(i);
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', 'false');

        var main = doc.createElement('span');
        main.className = 'search-field__opt-label';
        main.innerHTML = highlight(getLabel(item), term); // מודגש; escape בפנים

        li.appendChild(main);

        if (getMeta) {
          var metaVal = getMeta(item);
          if (metaVal != null && metaVal !== '') {
            var meta = doc.createElement('span');
            meta.className = 'search-field__opt-meta';
            meta.innerHTML = highlight(metaVal, term);
            li.appendChild(meta);
          }
        }

        // עכבר: מעבר מסמן בלי לגנוב פוקוס מה-input
        li.addEventListener('mousemove', function () { setActive(i); });
        li.addEventListener('mousedown', function (e) { e.preventDefault(); }); // שמירת פוקוס
        li.addEventListener('click', function () { choose(i); });

        list.appendChild(li);
      });

      setOpen(true);
      announce(results.length === 1 ? 'תוצאה אחת' : results.length + ' תוצאות');
    }

    function setActive(i) {
      var opts_ = list.querySelectorAll('.search-field__opt');
      if (activeIndex >= 0 && opts_[activeIndex]) {
        opts_[activeIndex].classList.remove('is-active');
        opts_[activeIndex].setAttribute('aria-selected', 'false');
      }
      activeIndex = i;
      if (i >= 0 && opts_[i]) {
        opts_[i].classList.add('is-active');
        opts_[i].setAttribute('aria-selected', 'true');
        input.setAttribute('aria-activedescendant', opts_[i].id);
        // גלילה לתצוגה בתוך הפאנל
        var el = opts_[i];
        var pTop = panel.scrollTop, pBot = pTop + panel.clientHeight;
        if (el.offsetTop < pTop) panel.scrollTop = el.offsetTop;
        else if (el.offsetTop + el.offsetHeight > pBot) panel.scrollTop = el.offsetTop + el.offsetHeight - panel.clientHeight;
      } else {
        input.removeAttribute('aria-activedescendant');
      }
    }

    function move(delta) {
      if (!open || !current.length) { if (input.value) render(input.value); return; }
      var n = current.length;
      var next;
      if (activeIndex === -1) next = delta > 0 ? 0 : n - 1;
      else next = (activeIndex + delta + n) % n;
      setActive(next);
    }

    function choose(i) {
      if (i < 0 || i >= current.length) return;
      var item = current[i];
      if (typeof opts.onSelect === 'function') opts.onSelect(item, input.value);
      // מנהג-על: ממלא את הכותרת ומסגר (אפשר לבטל דרך opts.keepOpenOnSelect)
      if (!opts.keepOpenOnSelect) {
        input.value = getLabel(item);
        toggleClear();
        setOpen(false);
      }
    }

    function toggleClear() { clearBtn.hidden = !input.value; }

    function clear() {
      input.value = '';
      toggleClear();
      setOpen(false);
      list.innerHTML = '';
      announce('');
    }

    /* --- אירועים --- */
    var onInput = debounce(function () { render(input.value); }, opts.debounce != null ? opts.debounce : 90);

    input.addEventListener('input', function () {
      toggleClear();
      onInput();
    });

    input.addEventListener('keydown', function (e) {
      switch (e.key) {
        case 'ArrowDown': e.preventDefault(); onInput.flush(); if (!open && input.value) render(input.value); move(1); break;
        case 'ArrowUp':   e.preventDefault(); onInput.flush(); if (!open && input.value) render(input.value); move(-1); break;
        case 'Home':      if (open) { e.preventDefault(); setActive(0); } break;
        case 'End':       if (open) { e.preventDefault(); setActive(current.length - 1); } break;
        case 'Enter':
          if (open && activeIndex >= 0) { e.preventDefault(); choose(activeIndex); }
          else if (open && current.length === 1) { e.preventDefault(); choose(0); }
          break;
        case 'Escape':
          if (open) { e.preventDefault(); setOpen(false); }
          else if (input.value) { e.preventDefault(); clear(); }
          break;
        case 'Tab':
          setOpen(false); // Tab יוצא מהרכיב — סוגרים בלי לבחור
          break;
      }
    });

    input.addEventListener('focus', function () { if (input.value && current.length) setOpen(true); });

    clearBtn.addEventListener('click', function () { clear(); input.focus(); });

    // סגירה בלחיצה מחוץ לרכיב
    function onDocClick(e) { if (!root.contains(e.target)) setOpen(false); }
    doc.addEventListener('click', onDocClick);

    toggleClear();

    /* --- controller --- */
    return {
      root: root,
      input: input,
      setItems: function (arr) { opts.items = arr; if (input.value) render(input.value); },
      clear: clear,
      focus: function () { input.focus(); },
      destroy: function () {
        doc.removeEventListener('click', onDocClick);
        if (root.parentNode) root.parentNode.removeChild(root);
      }
    };
  }

  /* ============================================================
     חלק ד' — filter(): שדרוג <input> קיים לסינון-במקום
     ============================================================ */
  /* משדרג input קיים (או יוצר SearchField ריק אם target הוא container).
     opts:
       items    : מערך | פונקציה שמחזירה מערך.
       onResult : (matches[], term) → נקרא בכל שינוי; המסך מרנדר את התוצאות בעצמו.
       getText, fields : כמו במנוע.
       debounce : ברירת מחדל 120ms.
       decorate : true (ברירת מחדל) → עוטף input באריזת search-field עם אייקון+ניקוי,
                  אם הוא input חשוף. false → משאיר את ה-DOM כמו שהוא.
     מחזיר controller: { input, refresh, clear, value }.
  */
  function filter(target, opts) {
    opts = opts || {};
    var el = resolveEl(target);
    if (!el) { if (global.console) console.warn('[Resef.Search] filter: target not found', target); return null; }

    var input;
    // אם קיבלנו container ריק — נבנה input בתוכו. אם קיבלנו input — נשתמש בו.
    if (el.tagName === 'INPUT') {
      input = el;
    } else {
      input = el.querySelector('input');
      if (!input) {
        input = doc.createElement('input');
        input.type = 'search';
        el.appendChild(input);
      }
    }
    input.classList.add('search-field__input');
    input.setAttribute('autocomplete', 'off');
    if (opts.placeholder && !input.placeholder) input.placeholder = opts.placeholder;
    if (opts.label && !input.getAttribute('aria-label')) input.setAttribute('aria-label', opts.label);

    // עיטוף חזותי (אייקון + כפתור ניקוי) אם אין כבר אריזה
    var clearBtn = null, statusEl = null;
    if (opts.decorate !== false && !input.closest('.search-field__box')) {
      var box = doc.createElement('div');
      box.className = 'search-field__box';
      var icon = doc.createElement('span');
      icon.className = 'search-field__icon';
      icon.innerHTML = SEARCH_ICON;
      clearBtn = doc.createElement('button');
      clearBtn.type = 'button';
      clearBtn.className = 'search-field__clear';
      clearBtn.setAttribute('aria-label', 'ניקוי חיפוש');
      clearBtn.innerHTML = CLEAR_ICON;
      clearBtn.hidden = true;
      input.parentNode.insertBefore(box, input);
      box.appendChild(icon);
      box.appendChild(input);
      box.appendChild(clearBtn);
      // אזור-חי לספירת תוצאות
      statusEl = doc.createElement('div');
      statusEl.className = 'sr-only';
      statusEl.setAttribute('role', 'status');
      statusEl.setAttribute('aria-live', 'polite');
      box.parentNode.insertBefore(statusEl, box.nextSibling);
    }

    function getItems() {
      return typeof opts.items === 'function' ? (opts.items() || []) : (opts.items || []);
    }

    function run() {
      var term = input.value;
      var results = rank(getItems(), term, { getText: opts.getText, fields: opts.fields });
      if (clearBtn) clearBtn.hidden = !term;
      if (statusEl) {
        statusEl.textContent = !term ? '' :
          (results.length === 0 ? 'לא נמצאו תוצאות' :
            results.length === 1 ? 'תוצאה אחת' : results.length + ' תוצאות');
      }
      if (typeof opts.onResult === 'function') opts.onResult(results, term);
    }

    var debounced = debounce(run, opts.debounce != null ? opts.debounce : 120);
    input.addEventListener('input', debounced);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && input.value) { e.preventDefault(); input.value = ''; run(); }
    });
    if (clearBtn) clearBtn.addEventListener('click', function () { input.value = ''; run(); input.focus(); });

    run(); // ריצה ראשונית (מציג הכל)

    return {
      input: input,
      refresh: run,
      clear: function () { input.value = ''; run(); },
      value: function () { return input.value; }
    };
  }

  /* ============================================================
     ייצוא
     ============================================================ */
  var Resef = global.Resef || (global.Resef = {});
  Resef.Search = {
    // מנוע טהור
    normalize: normalize,
    tokenize: tokenize,
    rank: rank,
    matches: matches,
    highlight: highlight,
    // רכיב
    mount: mount,
    filter: filter
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = Resef.Search;

})(typeof window !== 'undefined' ? window : this);
