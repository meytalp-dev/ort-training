// Training Supervision — Shared utilities
// קישור ל-Apps Script + פונקציות עזר משותפות

const TS = (() => {
  // *** APPS SCRIPT URL — מיטל תעדכן אחרי deploy ***
  const APPS_SCRIPT_URL = localStorage.getItem('ts.appsScriptUrl') || '';

  const NETWORKS = [
    { id: 'ort',     name: 'אורט',  color: 'ort'    },
    { id: 'amal',    name: 'עמל',   color: 'amal'   },
    { id: 'atid',    name: 'עתיד',  color: 'atid'   },
    { id: 'sakhnin', name: 'סכנין', color: 'sakhnin'},
    { id: 'dror',    name: 'דרור',  color: 'dror'   }
  ];

  const SECTORS = [
    { id: 'haredi', name: 'חרדי' },
    { id: 'arab',   name: 'ערבי' },
    { id: 'kelali', name: 'כללי' }
  ];

  const SUBJECTS = [
    'מתמטיקה','אנגלית','עברית','היסטוריה','אזרחות','תנ"ך',
    'ביולוגיה','כימיה','פיזיקה','מדעי המחשב',
    'עיצוב שיער','איפור ויופי','חינוך גופני','אומנות'
  ];

  const TYPES = [
    { id: 'bagrut', name: 'בגרות' },
    { id: 'gemer',  name: 'גמר'   }
  ];

  async function api(action, params = {}) {
    if (!APPS_SCRIPT_URL) {
      console.warn('Apps Script URL לא הוגדר. בעמוד הראשי יש כפתור להגדרה.');
      return { ok: false, error: 'no_url' };
    }
    try {
      const url = new URL(APPS_SCRIPT_URL);
      url.searchParams.set('action', action);
      Object.entries(params).forEach(([k,v]) => {
        if (v !== undefined && v !== null) url.searchParams.set(k, v);
      });
      const res = await fetch(url.toString());
      return await res.json();
    } catch (e) {
      console.error('API error', e);
      return { ok: false, error: e.message };
    }
  }

  async function apiPost(action, body) {
    if (!APPS_SCRIPT_URL) return { ok: false, error: 'no_url' };
    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ action, ...body }),
        headers: { 'Content-Type': 'text/plain' }
      });
      return await res.json();
    } catch (e) {
      console.error('API error', e);
      return { ok: false, error: e.message };
    }
  }

  function netById(id) {
    return NETWORKS.find(n => n.id === id) || { id, name: id, color: '' };
  }
  function secById(id) {
    return SECTORS.find(s => s.id === id) || { id, name: id };
  }

  function netChip(netId) {
    const n = netById(netId);
    return `<span class="net-chip ${n.color}">${n.name}</span>`;
  }
  function secChip(secId) {
    const s = secById(secId);
    return `<span class="sec-chip ${secId}">${s.name}</span>`;
  }
  function typeChip(typeId) {
    const t = TYPES.find(x => x.id === typeId);
    return `<span class="badge neutral">${t ? t.name : typeId}</span>`;
  }

  function attendanceBadge(percent) {
    if (percent === null || percent === undefined) return `<span class="badge neutral">—</span>`;
    if (percent >= 90) return `<span class="badge ok">${percent}%</span>`;
    if (percent >= 70) return `<span class="badge warn">${percent}%</span>`;
    return `<span class="badge err">${percent}%</span>`;
  }

  function toast(msg) {
    let el = document.querySelector('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2500);
  }

  function urlParam(name, def = '') {
    return new URLSearchParams(location.search).get(name) || def;
  }

  function monthLabel(date = new Date()) {
    const months = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  function formatDate(d) {
    if (!d) return '';
    const date = new Date(d);
    if (isNaN(date)) return d;
    return date.toLocaleDateString('he-IL');
  }

  // Gmail compose
  function gmailCompose({to='', subject='', body=''} = {}) {
    const u = new URL('https://mail.google.com/mail/');
    u.searchParams.set('view', 'cm');
    u.searchParams.set('fs', '1');
    if (to) u.searchParams.set('to', to);
    if (subject) u.searchParams.set('su', subject);
    if (body) u.searchParams.set('body', body);
    return u.toString();
  }

  // WhatsApp
  function whatsappLink(phone, text='') {
    const u = new URL('https://api.whatsapp.com/send');
    if (phone) u.searchParams.set('phone', phone.replace(/[^\d]/g, ''));
    if (text) u.searchParams.set('text', text);
    return u.toString();
  }

  function setAppsScriptUrl(url) {
    localStorage.setItem('ts.appsScriptUrl', url);
    location.reload();
  }
  function getAppsScriptUrl() {
    return APPS_SCRIPT_URL;
  }

  return {
    NETWORKS, SECTORS, SUBJECTS, TYPES,
    api, apiPost,
    netById, secById, netChip, secChip, typeChip,
    attendanceBadge, toast, urlParam,
    monthLabel, formatDate,
    gmailCompose, whatsappLink,
    setAppsScriptUrl, getAppsScriptUrl
  };
})();
