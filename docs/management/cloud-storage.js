/**
 * cloud-storage.js — שכבת סנכרון מאוחדת לכל מערכות הניהול
 *
 * מחליפה את localStorage בכתיבה דו-כיוונית: דפדפן (cache) ↔ Google Sheet (מקור אמת).
 *
 * שימוש:
 *   <script src="cloud-storage.js"></script>
 *   <script>
 *     // טעינה ראשונית — קודם מנסה לקרוא מהענן, אם נכשל חוזר ל-localStorage
 *     const data = await cloudStorage.get('ort_therapy_data', { fallback: {} });
 *
 *     // שמירה — תמיד כותב למקומי מיד, ובמקביל לענן (לא חוסם UI)
 *     await cloudStorage.set('ort_therapy_data', data);
 *
 *     // מחיקה
 *     await cloudStorage.remove('ort_therapy_data');
 *   </script>
 *
 * עיצוב:
 * - הענן הוא מקור האמת לקריאה ראשונית. localStorage רק cache.
 * - שמירה תמיד כותבת ל-localStorage מיידית (מניעת אובדן offline) ואז מסנכרנת לענן.
 * - אם הענן לא מוגדר (URL ריק) — חוזר להתנהגות localStorage נטו.
 */

(function (global) {
  'use strict';

  // ⚠️ אחרי Deploy של cloud-storage-apps-script.js — להדביק כאן את ה-Web App URL
  var CLOUD_STORAGE_URL = 'https://script.google.com/macros/s/AKfycbxdaXKS18Q5az6UZgJ3QG65ngaDe0wzLTi5NmM3SlwrCBE27IqhnVQ3TM0SX4oaXko9/exec';

  var IDENTITY_KEY = 'cloud_storage_user';
  var STATUS_LISTENERS = [];
  var lastStatus = { state: 'idle', message: '' };

  function setStatus(state, message) {
    lastStatus = { state: state, message: message || '', at: Date.now() };
    STATUS_LISTENERS.forEach(function (fn) { try { fn(lastStatus); } catch (e) {} });
  }

  function getUser() {
    try { return localStorage.getItem(IDENTITY_KEY) || ''; } catch (e) { return ''; }
  }

  function setUser(name) {
    try { localStorage.setItem(IDENTITY_KEY, name || ''); } catch (e) {}
  }

  function localGet(key) {
    try {
      var raw = localStorage.getItem(key);
      if (raw === null || raw === undefined) return undefined;
      try { return JSON.parse(raw); } catch (e) { return raw; }
    } catch (e) { return undefined; }
  }

  function localSet(key, value) {
    try {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    } catch (e) {}
  }

  function localRemove(key) {
    try { localStorage.removeItem(key); } catch (e) {}
  }

  function isConfigured() {
    return !!CLOUD_STORAGE_URL && CLOUD_STORAGE_URL.indexOf('http') === 0;
  }

  // ---------- Cloud calls ----------

  function cloudGet(key) {
    if (!isConfigured()) return Promise.resolve({ result: 'offline' });
    var url = CLOUD_STORAGE_URL + '?action=get&key=' + encodeURIComponent(key);
    return fetch(url, { method: 'GET' })
      .then(function (r) { return r.json(); })
      .catch(function (err) {
        console.warn('[cloud-storage] get failed', key, err);
        return { result: 'error', message: String(err) };
      });
  }

  function cloudGetAll(keys) {
    if (!isConfigured()) return Promise.resolve({ result: 'offline' });
    var url = CLOUD_STORAGE_URL + '?action=getAll';
    if (keys && keys.length) url += '&keys=' + encodeURIComponent(keys.join(','));
    return fetch(url, { method: 'GET' })
      .then(function (r) { return r.json(); })
      .catch(function (err) {
        console.warn('[cloud-storage] getAll failed', err);
        return { result: 'error', message: String(err) };
      });
  }

  function cloudSet(key, value) {
    if (!isConfigured()) return Promise.resolve({ result: 'offline' });
    var body = { action: 'set', key: key, value: value, updated_by: getUser() };
    return fetch(CLOUD_STORAGE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body)
    })
      .then(function (r) { return r.json(); })
      .catch(function (err) {
        console.warn('[cloud-storage] set failed', key, err);
        return { result: 'error', message: String(err) };
      });
  }

  function cloudSetMany(items) {
    if (!isConfigured()) return Promise.resolve({ result: 'offline' });
    var body = { action: 'setMany', items: items, updated_by: getUser() };
    return fetch(CLOUD_STORAGE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body)
    })
      .then(function (r) { return r.json(); })
      .catch(function (err) {
        console.warn('[cloud-storage] setMany failed', err);
        return { result: 'error', message: String(err) };
      });
  }

  function cloudDelete(key) {
    if (!isConfigured()) return Promise.resolve({ result: 'offline' });
    var body = { action: 'delete', key: key };
    return fetch(CLOUD_STORAGE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body)
    })
      .then(function (r) { return r.json(); })
      .catch(function (err) { return { result: 'error', message: String(err) }; });
  }

  // ---------- Public API ----------

  /**
   * get(key, opts?) → Promise<value>
   * מנסה ענן קודם. אם הצליח — שומר ב-localStorage כ-cache ומחזיר.
   * אם נכשל / לא קיים בענן — חוזר ל-localStorage.
   * אם גם זה ריק — מחזיר opts.fallback (ברירת מחדל undefined).
   */
  function get(key, opts) {
    opts = opts || {};
    setStatus('loading', 'טוען מהענן…');
    return cloudGet(key).then(function (res) {
      if (res && res.result === 'success' && res.found) {
        localSet(key, res.value);
        setStatus('synced', 'מסונכרן');
        return res.value;
      }
      // ענן לא זמין או key לא קיים שם — נסה מקומי
      var local = localGet(key);
      if (local !== undefined) {
        setStatus(res.result === 'offline' ? 'offline' : 'cache', 'טוען מהמטמון המקומי');
        // אם הענן זמין אך לא היה ערך — להעלות את המקומי כדי לסנכרן ראשוני
        if (res.result === 'success' && !res.found && isConfigured()) {
          cloudSet(key, local);
        }
        return local;
      }
      setStatus('empty', 'אין נתונים');
      return opts.fallback !== undefined ? opts.fallback : undefined;
    });
  }

  /**
   * getMany(keys) → Promise<{[key]: value}>
   * קריאה מצטברת ב-call יחיד.
   */
  function getMany(keys) {
    setStatus('loading', 'טוען מהענן…');
    return cloudGetAll(keys).then(function (res) {
      var out = {};
      if (res && res.result === 'success') {
        keys.forEach(function (k) {
          if (res.items && res.items[k]) {
            out[k] = res.items[k].value;
            localSet(k, res.items[k].value);
          } else {
            var local = localGet(k);
            if (local !== undefined) out[k] = local;
          }
        });
        setStatus('synced', 'מסונכרן');
      } else {
        keys.forEach(function (k) {
          var local = localGet(k);
          if (local !== undefined) out[k] = local;
        });
        setStatus('offline', 'מטמון מקומי');
      }
      return out;
    });
  }

  /**
   * set(key, value) → Promise<{result}>
   * שומר ל-localStorage מיידית, ואז מסנכרן לענן ברקע.
   * ה-Promise מתממש מיד אחרי שמירה מקומית — לא חוסם UI.
   */
  function set(key, value) {
    localSet(key, value);
    setStatus('saving', 'שומר לענן…');
    return cloudSet(key, value).then(function (res) {
      if (res && res.result === 'success') {
        setStatus('synced', 'מסונכרן · ' + new Date().toLocaleTimeString('he-IL'));
      } else {
        setStatus('offline', 'נשמר מקומית — סנכרון נכשל');
      }
      return res;
    });
  }

  function setMany(items) {
    items.forEach(function (it) { localSet(it.key, it.value); });
    setStatus('saving', 'שומר לענן…');
    return cloudSetMany(items).then(function (res) {
      if (res && res.result === 'success') setStatus('synced', 'מסונכרן');
      else setStatus('offline', 'נשמר מקומית בלבד');
      return res;
    });
  }

  function remove(key) {
    localRemove(key);
    return cloudDelete(key);
  }

  /**
   * prefetchAll(prefixes?) — מושך את כל ה-keys מהענן (או כאלה שמתחילים בקידומת)
   * וכותב אותם ל-localStorage. משמש למערכות שקוראות סינכרונית — אחרי prefetch הן
   * פשוט ממשיכות לקרוא מ-localStorage כרגיל.
   * מחזיר Promise שמתממש כש-localStorage מוכן.
   */
  function prefetchAll(prefixes) {
    setStatus('loading', 'טוען מהענן…');
    return cloudGetAll([]).then(function (res) {
      if (!res || res.result !== 'success' || !res.items) {
        setStatus('offline', 'מטמון מקומי');
        return 0;
      }
      var count = 0;
      Object.keys(res.items).forEach(function (k) {
        if (prefixes && prefixes.length) {
          var match = false;
          for (var i = 0; i < prefixes.length; i++) {
            if (k.indexOf(prefixes[i]) === 0) { match = true; break; }
          }
          if (!match) return;
        }
        localSet(k, res.items[k].value);
        count++;
      });
      setStatus('synced', 'מסונכרן · ' + count + ' פריטים');
      return count;
    });
  }

  function onStatus(fn) {
    STATUS_LISTENERS.push(fn);
    fn(lastStatus);
    return function () {
      STATUS_LISTENERS = STATUS_LISTENERS.filter(function (f) { return f !== fn; });
    };
  }

  /**
   * mountStatusBadge(parentEl?) — תג סטטוס קטן בפינה
   */
  function mountStatusBadge(parent) {
    var el = document.createElement('div');
    el.id = 'cloudStatusBadge';
    el.style.cssText = 'position:fixed;bottom:12px;left:12px;z-index:9999;padding:6px 12px;border-radius:20px;font-size:.78rem;font-family:inherit;background:#fff;box-shadow:0 4px 12px rgba(0,0,0,.08);border:1px solid #e5e7eb;color:#475569;transition:all .2s;direction:rtl;display:flex;align-items:center;gap:6px';
    (parent || document.body).appendChild(el);
    onStatus(function (s) {
      var icons = { idle: '○', loading: '◌', saving: '◌', synced: '●', offline: '◐', cache: '◐', empty: '○', error: '✕' };
      var colors = { synced: '#10b981', offline: '#f59e0b', cache: '#f59e0b', error: '#ef4444', loading: '#6366f1', saving: '#6366f1' };
      el.innerHTML = '<span style="color:' + (colors[s.state] || '#94a3b8') + '">' + (icons[s.state] || '○') + '</span><span>' + (s.message || s.state) + '</span>';
    });
    return el;
  }

  global.cloudStorage = {
    get: get,
    getMany: getMany,
    set: set,
    setMany: setMany,
    remove: remove,
    prefetchAll: prefetchAll,
    onStatus: onStatus,
    mountStatusBadge: mountStatusBadge,
    setUser: setUser,
    getUser: getUser,
    isConfigured: isConfigured,
    _url: function () { return CLOUD_STORAGE_URL; }
  };
})(window);
