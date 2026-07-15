/* ============================================================
   רֶצֶף — שירות "המועדפים שלי" (Favorites · אוסף אישי לכל משתמש)
   favorites.js · שכבת שירות משותפת · Resef.Favorites
   מחבר בין: library.html (W6-01) · resource-page.html (W6-03) · favorites.html
   נלווה ל: seen-service.js (אח מקביל — אותה ארכיטקטורת-ערוצים) · components.css
   ------------------------------------------------------------
   ⭐ מה השירות הזה עושה — במשפט אחד:

     נותן לכל משתמש/ת (מורה) מדף אישי משלו/ה — לסמן משאב בכוכב, לשלוף את
     האוסף בכל מסך, ולשתף משאב בקישור. האוסף **פרטי לכל משתמש/ת** ונשמר
     בין רענונים וטאבים.

   ------------------------------------------------------------
   ⚖️  למה מותר לשמור את זה:

     "מועדף" הוא **סימנייה תפעולית לא-רגישה (🟢) של המורה** — לא נתון על קטין,
     לא ציון, לא מצב-רוח. זו העדפת-עבודה של המשתמש/ת עצמו/ה. לכן מותר וגם
     *רצוי* לשמור אותה ב-localStorage — השמירה היא בדיוק מה שהופך אותה למדף
     שנשאר. אין כאן שום שדה שנוגע בתלמיד/ה.

   ------------------------------------------------------------
   👤 "לכל משתמש" — איך:

     המדף ממופתח לפי מזהה-משתמש/ת (userId). ברירת המחדל: 'me'. מסך שמכיר את
     המשתמש/ת המחובר/ת קורא setUser(id, name) פעם אחת — ומאותו רגע add/list/
     count פועלים על המדף שלו/ה בלבד. החלפת-משתמש/ת לא נוגעת במדף של אחר/ת.

   ------------------------------------------------------------
   שימוש:
     <script src="favorites.js"></script>

     // (רשות) לזהות את המשתמש/ת המחובר/ת:
     Resef.Favorites.setUser('t_rotem', 'רותם לוי');

     // סימון/ביטול — מקבל snapshot של המשאב (חובה id):
     Resef.Favorites.toggle({
       id:'r05', typeKey:'work', typeLabel:'דף עבודה',
       title:'שם הפועל והשורש — דף עבודה', desc:'…',
       subject:'עברית — לשון', grade:"ט'", level:'רגיל',
       min:10, uses:131
     });   // → true אם נוסף, false אם הוסר

     Resef.Favorites.isFavorite('r05');   // → true/false
     Resef.Favorites.list();              // → [records] (חדש→ישן)
     Resef.Favorites.count();             // → מספר

     // שיתוף (קישור / העתקה / שיתוף-מכשיר):
     Resef.Favorites.openShare(item);     // מודל שיתוף מוכן (מוזרק אוטומטית)
     Resef.Favorites.copyLink(item);      // → Promise<url>  (מעתיק ללוח)

     // האזנה לשינויים (בין-טאבית):
     var off = Resef.Favorites.onChange(function (e) { render(); });

     // דמו / איפוס:
     Resef.Favorites.clearAll();
   ============================================================ */
(function (global) {
  'use strict';

  var doc = global.document;

  var STORE_KEY = 'resef.favorites.v1';  // המפה: userId → { itemId → record }
  var USER_KEY  = 'resef.favorites.user'; // מזהה המשתמש/ת הפעיל/ה (מתמשך)
  var PING_KEY  = 'resef.favorites.ping'; // מפתח-דופק שמפעיל storage event
  var CHAN_NAME = 'resef-favorites';      // ערוץ BroadcastChannel

  /* שדות אסורים — אוכפים ש"מועדף" לעולם לא יבלע נתון על קטין/ציון. */
  var FORBIDDEN = ['grade_score', 'score', 'mark', 'points', 'mood', 'emotion',
                   'distress', 'feedback', 'studentId', 'studentName'];

  /* ---------- רישום סוגי-תוכן: תווית + צבע-מבטא (מקביל ל--t-* בדפים) ---------- */
  var TYPES = {
    unit:  { label: 'יחידה',    color: '#0B8F98' },
    deck:  { label: 'מצגת',     color: '#2D8CFF' },
    video: { label: 'סרטון',    color: '#E5533B' },
    quiz:  { label: 'בוחן',     color: '#7A5AF8' },
    work:  { label: 'דף עבודה', color: '#C88A16' },
    sim:   { label: 'סימולציה', color: '#12A594' },
    link:  { label: 'קישור',    color: '#5B7280' }
  };
  /* מיפוי מפתחות-סוג לא-קנוניים (resource-page) → קנוני (library). */
  var TYPE_ALIAS = {
    presentation: 'deck', worksheet: 'work', simulation: 'sim',
    // כבר-קנוניים עוברים כמו שהם:
    unit: 'unit', deck: 'deck', video: 'video', quiz: 'quiz',
    work: 'work', sim: 'sim', link: 'link'
  };
  function normalizeType(t) { return TYPE_ALIAS[t] || (TYPES[t] ? t : 'unit'); }

  /* אייקוני-קו מוטבעים — כדי שה-UI המוזרק לא יסתמך על סמלי-הדף. */
  var SVG = {
    x:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>',
    link:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5"/></svg>',
    copy:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 6"/></svg>',
    star:  '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 18.8 6.2 21.9l1.1-6.5L2.6 10.8l6.5-.9z"/></svg>'
  };

  /* ============================================================
     אחסון מתמשך (localStorage) — מותר, כי לא-רגיש
     ============================================================ */
  function readStore() {
    try {
      var raw = global.localStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }
  function writeStore(map) {
    try { global.localStorage.setItem(STORE_KEY, JSON.stringify(map)); }
    catch (e) { /* מצב פרטי / חסום — נמשיך עם עותק-זיכרון בלבד */ _mem = map; }
  }
  var _mem = null; // גיבוי-זיכרון כשאחסון חסום (למשל file:// מוקשח)
  function store() { return _mem || readStore(); }
  function commit(map) { _mem = map; writeStore(map); }

  /* ---------- זהות המשתמש/ת ---------- */
  var _user = { id: 'me', name: 'המשתמש/ת שלי' };
  (function bootUser() {
    try {
      var raw = global.localStorage.getItem(USER_KEY);
      if (raw) { var u = JSON.parse(raw); if (u && u.id) _user = u; }
    } catch (e) {}
  })();
  function persistUser() {
    try { global.localStorage.setItem(USER_KEY, JSON.stringify(_user)); } catch (e) {}
  }

  function bucket(map, userId) {
    if (!map[userId]) map[userId] = {};
    return map[userId];
  }

  /* ---------- ניקוי הרשומה — הגנת-מינימיזציה אוכפת ---------- */
  function sanitize(item) {
    item = item || {};
    var rec = {
      id:        String(item.id != null ? item.id : ''),
      typeKey:   normalizeType(item.typeKey || item.type),
      typeLabel: item.typeLabel || (TYPES[normalizeType(item.typeKey || item.type)] || {}).label || 'משאב',
      title:     item.title || 'משאב',
      desc:      item.desc || item.description || '',
      subject:   item.subject || '',
      grade:     item.grade || '',
      level:     item.level || '',
      min:       item.min != null ? item.min : null,
      uses:      item.uses != null ? item.uses : null,
      url:       item.url || '',
      source:    item.source || '',    // מאיזה מסך נוסף (library / resource-page)
      addedAt:   nowStamp(),
      addedSeq:  (_seq += 1)           // סדר יציב למיון חדש→ישן
    };
    FORBIDDEN.forEach(function (k) { if (k in rec) delete rec[k]; });
    return rec;
  }
  var _seq = 0;
  function nowStamp() {
    try { return new Date().toISOString(); } catch (e) { return ''; }
  }

  /* ============================================================
     ליבה — add / remove / toggle / isFavorite / list / count
     ============================================================ */
  function isFavorite(id) {
    if (id == null) return false;
    var b = store()[_user.id];
    return !!(b && b[String(id)]);
  }

  function add(item) {
    var rec = sanitize(item);
    if (!rec.id) return null;
    var map = store();
    var b = bucket(map, _user.id);
    if (b[rec.id]) {                 // כבר קיים — לא לדרוס addedAt/סדר
      rec.addedAt = b[rec.id].addedAt;
      rec.addedSeq = b[rec.id].addedSeq;
    }
    b[rec.id] = rec;
    commit(map);
    emit({ action: 'add', id: rec.id, record: rec });
    return rec;
  }

  function remove(id) {
    id = String(id);
    var map = store();
    var b = map[_user.id];
    if (!b || !b[id]) return false;
    var rec = b[id];
    delete b[id];
    commit(map);
    emit({ action: 'remove', id: id, record: rec });
    return true;
  }

  function toggle(item) {
    var id = String(item && item.id != null ? item.id : '');
    if (!id) return false;
    if (isFavorite(id)) { remove(id); return false; }
    add(item); return true;
  }

  function get(id) {
    var b = store()[_user.id];
    return (b && b[String(id)]) ? clone(b[String(id)]) : null;
  }

  /* list — האוסף של המשתמש/ת הפעיל/ה, ממויין חדש→ישן. */
  function list() {
    var b = store()[_user.id] || {};
    var arr = Object.keys(b).map(function (k) { return clone(b[k]); });
    arr.sort(function (a, c) { return (c.addedSeq || 0) - (a.addedSeq || 0); });
    return arr;
  }
  function count() {
    var b = store()[_user.id];
    return b ? Object.keys(b).length : 0;
  }
  function ids() {
    var b = store()[_user.id] || {};
    return Object.keys(b);
  }

  function clearAll() {
    var map = store();
    if (map[_user.id]) { delete map[_user.id]; commit(map); }
    emit({ action: 'clear', id: null, record: null });
  }

  function clone(o) { try { return JSON.parse(JSON.stringify(o)); } catch (e) { return o; } }

  /* ============================================================
     מנויים + סנכרון בין-טאבי (BroadcastChannel + storage event)
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
    e.userId = _user.id;
    e.count = count();
    _listeners.slice().forEach(function (fn) {
      try { fn(e); } catch (err) { /* מאזין תקול לא מפיל את השאר */ }
    });
  }

  function emit(e) {
    fireLocal(e);
    // שידור בין-טאבי — רק סימן ש"משהו השתנה"; כל טאב קורא מחדש מהאחסון.
    var ping = { userId: _user.id, action: e.action, id: e.id, r: (_seq += 1) };
    try { if (_bc) _bc.postMessage(ping); } catch (err) {}
    try { global.localStorage.setItem(PING_KEY, JSON.stringify(ping)); } catch (err) {}
  }

  function ingestPing(ping) {
    if (!ping) return;
    // עדכון מטאב אחר — רלוונטי רק אם נוגע במשתמש/ת הפעיל/ה כאן.
    if (ping.userId && ping.userId !== _user.id) return;
    _mem = null; // לכפות קריאה טרייה מהאחסון
    fireLocal({ action: ping.action || 'sync', id: ping.id || null, record: null, remote: true });
  }

  function initChannels() {
    try {
      if (typeof global.BroadcastChannel === 'function') {
        _bc = new global.BroadcastChannel(CHAN_NAME);
        _bc.onmessage = function (ev) { ingestPing(ev && ev.data); };
      }
    } catch (e) { _bc = null; }
    try {
      global.addEventListener('storage', function (ev) {
        if (!ev) return;
        if (ev.key === PING_KEY && ev.newValue) {
          try { ingestPing(JSON.parse(ev.newValue)); } catch (x) {}
        } else if (ev.key === STORE_KEY) {
          _mem = null; fireLocal({ action: 'sync', id: null, record: null, remote: true });
        }
      });
    } catch (e) {}
  }

  /* ============================================================
     שיתוף — buildShareUrl / copyLink / share / openShare (מודל)
     ============================================================ */

  /* buildShareUrl — קישור אבסולוטי שפותח את המשאב בעמוד-המשאב.
     item.url מפורש גובר; אחרת נבנה resource-page.html?res=<id>[&type=]. */
  function buildShareUrl(item) {
    item = item || {};
    if (item.shareUrl) return item.shareUrl;
    var id = item.id != null ? String(item.id) : '';
    var typeKey = normalizeType(item.typeKey || item.type);
    try {
      var base = new global.URL('resource-page.html', global.location.href);
      if (id) base.searchParams.set('res', id);
      if (typeKey) base.searchParams.set('type', typeKey);
      return base.href;
    } catch (e) {
      // fallback ל-file:// שבו URL/searchParams עלול להיכשל
      var href = (global.location && global.location.href) || '';
      var dir = href.replace(/[^/]*$/, '');
      return dir + 'resource-page.html?res=' + encodeURIComponent(id) +
             (typeKey ? '&type=' + encodeURIComponent(typeKey) : '');
    }
  }

  /* copyLink — מעתיק את קישור-השיתוף ללוח. מחזיר Promise<url>. */
  function copyLink(item) {
    var url = buildShareUrl(item);
    return writeClipboard(url).then(function () { return url; });
  }

  function writeClipboard(text) {
    // מסלול מודרני
    try {
      if (global.navigator && global.navigator.clipboard && global.navigator.clipboard.writeText) {
        return global.navigator.clipboard.writeText(text);
      }
    } catch (e) {}
    // fallback — textarea + execCommand (עובד גם ב-file://)
    return new global.Promise(function (resolve, reject) {
      try {
        var ta = doc.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.top = '-1000px';
        ta.style.opacity = '0';
        doc.body.appendChild(ta);
        ta.select();
        var ok = doc.execCommand && doc.execCommand('copy');
        doc.body.removeChild(ta);
        ok ? resolve() : reject(new Error('copy-failed'));
      } catch (err) { reject(err); }
    });
  }

  /* share — שיתוף-מכשיר (Web Share) אם נתמך; אחרת פתיחת המודל.
     מחזיר Promise<{ method }>. */
  function share(item) {
    var url = buildShareUrl(item);
    var title = (item && item.title) || 'משאב ברֶצֶף';
    if (global.navigator && typeof global.navigator.share === 'function') {
      return global.navigator.share({ title: title, text: title, url: url })
        .then(function () { return { method: 'native' }; })
        .catch(function () { openShare(item); return { method: 'modal' }; });
    }
    openShare(item);
    return global.Promise.resolve({ method: 'modal' });
  }

  /* ---------- מודל-שיתוף מוזרק (self-contained · components.css) ---------- */
  var _shareEl = null;
  var _shareLastFocus = null;

  function buildShareModal() {
    var scrim = doc.createElement('div');
    scrim.className = 'scrim';
    scrim.setAttribute('data-fav-share', '');
    scrim.hidden = true;
    scrim.innerHTML =
      '<div class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="favShareTitle" style="max-width:460px">' +
        '<div class="modal__head">' +
          '<h2 class="modal__title" id="favShareTitle">שיתוף משאב</h2>' +
          '<button class="icon-btn modal__close" type="button" data-fav-close aria-label="סגירה">' + SVG.x + '</button>' +
        '</div>' +
        '<div class="modal__body">' +
          '<div data-fav-res style="display:flex; align-items:center; gap:10px; padding:10px 12px; background:var(--surface-muted); border-radius:var(--radius-btn); margin-bottom:var(--space-4)">' +
            '<span data-fav-res-dot style="width:10px;height:10px;border-radius:50%;flex:none"></span>' +
            '<span data-fav-res-title style="font-weight:700; color:var(--ink-strong); font-size:var(--text-small)"></span>' +
          '</div>' +
          '<label style="display:block; font-size:var(--text-label); font-weight:700; color:var(--ink-soft); margin-bottom:8px">קישור למשאב</label>' +
          '<div style="display:flex; gap:8px; align-items:stretch">' +
            '<input type="text" data-fav-url readonly aria-label="קישור לשיתוף" ' +
              'style="flex:1; min-width:0; font-family:var(--font-body); font-size:var(--text-small); color:var(--ink); direction:ltr; text-align:left; ' +
              'background:var(--card); border:1px solid var(--line-strong); border-radius:var(--radius-btn); min-height:var(--tap); padding:0 12px">' +
            '<button class="btn btn--primary" type="button" data-fav-copy style="flex:none">' + SVG.copy + '<span data-fav-copy-label>העתקה</span></button>' +
          '</div>' +
          '<p style="font-size:var(--text-label); color:var(--ink-soft); margin:var(--space-3) 0 0; line-height:1.5">' +
            'הקישור פותח את המשאב בעמוד-המשאב. אפשר לשלוח בוואטסאפ, במייל או להדביק במערכת אחרת.</p>' +
        '</div>' +
        '<div class="modal__foot">' +
          '<button class="btn btn--secondary" type="button" data-fav-native hidden>' + SVG.share + 'שיתוף דרך המכשיר</button>' +
          '<button class="btn btn--ghost" type="button" data-fav-close>סגירה</button>' +
        '</div>' +
      '</div>';
    doc.body.appendChild(scrim);

    // אירועים
    scrim.addEventListener('click', function (e) {
      if (e.target === scrim || e.target.closest('[data-fav-close]')) closeShare();
    });
    scrim.__copyBtn = scrim.querySelector('[data-fav-copy]');
    scrim.__copyLabel = scrim.querySelector('[data-fav-copy-label]');
    scrim.__urlInput = scrim.querySelector('[data-fav-url]');
    scrim.__resTitle = scrim.querySelector('[data-fav-res-title]');
    scrim.__resDot = scrim.querySelector('[data-fav-res-dot]');
    scrim.__nativeBtn = scrim.querySelector('[data-fav-native]');
    return scrim;
  }

  function openShare(item) {
    if (!_shareEl) _shareEl = buildShareModal();
    var el = _shareEl;
    var url = buildShareUrl(item);
    var typeKey = normalizeType(item && (item.typeKey || item.type));
    el.__urlInput.value = url;
    el.__resTitle.textContent = (item && item.title) || 'משאב';
    el.__resDot.style.background = (TYPES[typeKey] || {}).color || 'var(--brand)';

    // כפתור-העתקה
    el.__copyBtn.onclick = function () {
      writeClipboard(url).then(function () {
        el.__copyLabel.textContent = 'הועתק!';
        el.__copyBtn.innerHTML = SVG.check + '<span data-fav-copy-label>הועתק!</span>';
        setTimeout(function () {
          el.__copyBtn.innerHTML = SVG.copy + '<span data-fav-copy-label>העתקה</span>';
          el.__copyLabel = el.__copyBtn.querySelector('[data-fav-copy-label]');
        }, 1800);
      }).catch(function () {
        el.__urlInput.select();
      });
    };

    // שיתוף-מכשיר — רק אם נתמך
    var canNative = !!(global.navigator && typeof global.navigator.share === 'function');
    el.__nativeBtn.hidden = !canNative;
    el.__nativeBtn.onclick = function () {
      try {
        global.navigator.share({ title: (item && item.title) || 'משאב', url: url });
      } catch (e) {}
    };

    _shareLastFocus = doc.activeElement;
    el.hidden = false;
    global.requestAnimationFrame(function () { el.setAttribute('data-open', 'true'); });
    el.__copyBtn.focus();
    doc.addEventListener('keydown', onShareEsc);
  }

  function closeShare() {
    if (!_shareEl) return;
    _shareEl.removeAttribute('data-open');
    doc.removeEventListener('keydown', onShareEsc);
    setTimeout(function () { _shareEl.hidden = true; }, 180);
    if (_shareLastFocus && _shareLastFocus.focus) _shareLastFocus.focus();
  }
  function onShareEsc(e) { if (e.key === 'Escape') closeShare(); }

  /* ============================================================
     זהות + QA
     ============================================================ */
  function setUser(id, name) {
    if (!id) return;
    _user = { id: String(id), name: name || String(id) };
    persistUser();
    _mem = null;
    fireLocal({ action: 'user', id: _user.id, record: null });
  }
  function getUser() { return { id: _user.id, name: _user.name }; }

  /* assertClean — מוכיח שאין ולו שדה-אסור אחד באחסון (ל-DPO/QA). */
  function assertClean() {
    var findings = [];
    var map = store();
    Object.keys(map).forEach(function (uid) {
      Object.keys(map[uid] || {}).forEach(function (id) {
        var rec = map[uid][id];
        FORBIDDEN.forEach(function (k) {
          if (rec && k in rec) findings.push({ userId: uid, id: id, field: k });
        });
      });
    });
    return { clean: findings.length === 0, findings: findings };
  }

  function describe() {
    return {
      policy: '"המועדפים שלי" — אוסף אישי לכל משתמש/ת, לא-רגיש',
      keyedBy: 'userId (ברירת מחדל: me) — מדף פרטי, מבודד בין משתמשים',
      stored: ['snapshot של המשאב: id, סוג, כותרת, תיאור, מקצוע/שכבה/רמה, מטא-שימוש, url'],
      neverStored: FORBIDDEN.slice(),
      channels: ['listeners בדף', 'BroadcastChannel', 'storage event'],
      share: 'buildShareUrl → resource-page.html?res=<id> · copyLink · Web Share · מודל-שיתוף מוזרק',
      basis: 'סימנייה תפעולית של המורה (🟢) — אין נתון על קטין → מותר לשמור'
    };
  }

  /* ============================================================
     ייצוא
     ============================================================ */
  var Resef = global.Resef || (global.Resef = {});
  Resef.Favorites = {
    // זהות
    setUser: setUser, getUser: getUser,
    // ליבה
    add: add, remove: remove, toggle: toggle,
    isFavorite: isFavorite, get: get, list: list, count: count, ids: ids,
    clearAll: clearAll,
    // מנויים
    onChange: onChange,
    // שיתוף
    buildShareUrl: buildShareUrl, copyLink: copyLink, share: share, openShare: openShare,
    // סכימה / QA
    TYPES: TYPES, normalizeType: normalizeType,
    assertClean: assertClean, describe: describe
  };

  initChannels();

  if (typeof module !== 'undefined' && module.exports) module.exports = Resef.Favorites;

})(typeof window !== 'undefined' ? window : this);
