// School Principal — Initial Setup Form
// טופס ראשוני: מנהל ממלא את כל המורים בבית ספר

let schoolId = TS.urlParam('school', '');
const networkParam = TS.urlParam('network', '');
let teachers = [];
let school = null;
let allSchools = [];

document.addEventListener('DOMContentLoaded', async () => {
  populateSelects();
  document.getElementById('form-add').addEventListener('submit', addTeacher);
  document.getElementById('file-import').addEventListener('change', importCsv);

  if (schoolId || !TS.getAppsScriptUrl()) {
    // לינק ישיר עם ?school= (או מצב דמו) — זרימה רגילה
    document.getElementById('main-content').hidden = false;
    await loadInitial();
  } else {
    // לינק כללי — המנהל בוחר את בית הספר שלו
    await showSchoolPicker();
  }
});

// ============================================================
// School picker — לינק אחד לכולם, כל מנהל בוחר את בית ספרו
// ============================================================

async function showSchoolPicker() {
  document.getElementById('school-picker').hidden = false;

  const nsNet = document.getElementById('ns-network');
  TS.NETWORKS.forEach(n => nsNet.insertAdjacentHTML('beforeend', `<option value="${n.id}">${n.name}</option>`));

  document.getElementById('school-search').addEventListener('input', e => renderSchoolList(e.target.value));
  document.getElementById('btn-show-create').addEventListener('click', () => {
    const f = document.getElementById('form-new-school');
    f.hidden = !f.hidden;
    if (!f.hidden) f.querySelector('[name="name"]').focus();
  });
  document.getElementById('form-new-school').addEventListener('submit', createNewSchool);

  const res = await TS.api('schools.list', {}, { cache: 'no' });
  allSchools = (res.data || []).filter(s => s.name).sort((a, b) => a.name.localeCompare(b.name, 'he'));
  renderSchoolList('');
  document.getElementById('school-search').focus();
}

function renderSchoolList(query) {
  const listEl = document.getElementById('school-list');
  const q = (query || '').trim();
  const matches = q ? allSchools.filter(s => s.name.includes(q)) : allSchools;
  if (!matches.length) {
    listEl.innerHTML = `<div class="empty-msg">לא נמצא בית ספר כזה — אפשר להוסיף אותו בכפתור למטה</div>`;
    return;
  }
  listEl.innerHTML = matches.map(s => `
    <button type="button" class="school-item" data-id="${s.id}">
      <span class="s-name">${s.name}</span>
      ${s.network ? TS.netChip(String(s.network).replace(/^net_/, '')) : '<span style="font-size:12px; color:var(--text-3, #98A8B5);">רשת טרם הוגדרה</span>'}
    </button>
  `).join('');
  listEl.querySelectorAll('.school-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const chosen = allSchools.find(s => s.id === btn.dataset.id);
      if (chosen) enterSchool(chosen);
    });
  });
}

async function createNewSchool(e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  if (!data.name || !data.network) { TS.toast('יש למלא שם ורשת'); return; }

  // מניעת כפילות — אם כבר קיים בית ספר בשם הזה, נכנסים אליו במקום ליצור חדש
  const existing = allSchools.find(s => s.name.trim() === data.name.trim());
  if (existing) {
    TS.toast('בית הספר כבר קיים ברשימה — נכנסנו אליו');
    enterSchool(existing);
    return;
  }

  data.network = 'net_' + data.network;
  const res = await TS.apiPost('school.create', data);
  if (res.ok && res.data) {
    TS.toast('בית הספר נוסף');
    enterSchool(res.data);
  } else {
    TS.toast('שגיאה — ' + (res.error || ''));
  }
}

async function enterSchool(chosen) {
  school = chosen;
  schoolId = chosen.id;
  // הלינק בסרגל הכתובות מתעדכן — רענון ישאיר את המנהל בבית הספר שבחר
  const url = new URL(location.href);
  url.searchParams.set('school', schoolId);
  history.replaceState(null, '', url);

  document.getElementById('school-picker').hidden = true;
  document.getElementById('main-content').hidden = false;

  // קישורי "לדשבורד" שומרים על בית הספר שנבחר
  document.querySelectorAll('a[href="./"]').forEach(a => { a.href = './?school=' + schoolId; });

  // הרשת של בית הספר נבחרת מראש בטופס המורה
  const netSelect = document.getElementById('t-network');
  const netId = (chosen.network || '').replace(/^net_/, '');
  if (netId && netSelect.querySelector(`option[value="${netId}"]`)) netSelect.value = netId;

  renderHeader();
  const res = await TS.api('teachers.list', { school: schoolId }, { cache: 'no' });
  teachers = res.data || [];
  renderTable();
}

function populateSelects() {
  const networks = document.getElementById('t-network');
  TS.NETWORKS.forEach(n => networks.insertAdjacentHTML('beforeend', `<option value="${n.id}">${n.name}</option>`));
  if (networkParam) networks.value = networkParam;

  const subj = document.getElementById('t-subject');
  TS.SUBJECTS.forEach(s => subj.insertAdjacentHTML('beforeend', `<option value="${s}">${s}</option>`));
}

async function loadInitial() {
  if (!TS.getAppsScriptUrl()) {
    school = { id: schoolId || 'demo', name: 'אורט בית הערבה (דמו)', network: 'ort', principalName: 'מיטל פלג' };
    teachers = [];
    renderHeader();
    renderTable();
    return;
  }
  const [schoolRes, teachersRes] = await Promise.all([
    schoolId ? TS.api('school.get', { id: schoolId }) : Promise.resolve({ data: null }),
    TS.api('teachers.list', { school: schoolId })
  ]);
  school = schoolRes.data;
  teachers = teachersRes.data || [];
  renderHeader();
  renderTable();
}

function renderHeader() {
  if (!school) return;
  document.getElementById('school-name').textContent = school.name || '—';
  const prEl = document.getElementById('principal-name');
  if (school.principalName) {
    prEl.textContent = school.principalName;
  } else {
    renderPrincipalFix(prEl);
  }
  const chipEl = document.getElementById('network-chip');
  const netId = (school.network || '').toString().replace(/^net_/, '');
  if (netId) {
    chipEl.innerHTML = TS.netChip(netId);
  } else {
    renderNetworkFix(chipEl);
  }
}

// שם המנהל.ת חסר — נכתב כאן פעם אחת ונשמר לגיליון
function renderPrincipalFix(el) {
  el.innerHTML = `<input class="input" id="fix-principal" placeholder="מה שמך? (שם המנהל.ת)"
      style="width:auto; display:inline-block; padding:4px 10px; font-size:13px;">
    <button type="button" class="btn btn-secondary" id="fix-principal-save" style="padding:4px 12px; font-size:13px;">שמירה</button>`;
  const save = async () => {
    const v = el.querySelector('#fix-principal').value.trim();
    if (!v) return;
    if (TS.getAppsScriptUrl()) {
      const res = await TS.apiPost('school.update', { id: school.id || schoolId, principalName: v });
      if (!res.ok) { TS.toast('שגיאה בשמירת השם — ' + (res.error || '')); return; }
    }
    school.principalName = v;
    TS.toast('נעים מאוד, ' + v + '!');
    renderHeader();
  };
  el.querySelector('#fix-principal-save').addEventListener('click', save);
  el.querySelector('#fix-principal').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); save(); }
  });
}

// לבית ספר בלי רשת — המנהל משלים אותה כאן והיא נשמרת לגיליון
function renderNetworkFix(el) {
  el.innerHTML = `<select class="select" id="fix-network" style="width:auto; display:inline-block; padding:4px 10px; font-size:13px;">
    <option value="">לאיזו רשת שייך בית הספר?</option>
    ${TS.NETWORKS.map(n => `<option value="${n.id}">${n.name}</option>`).join('')}
  </select>`;
  el.querySelector('#fix-network').addEventListener('change', async e => {
    const v = e.target.value;
    if (!v) return;
    if (TS.getAppsScriptUrl()) {
      const res = await TS.apiPost('school.update', { id: school.id || schoolId, network: 'net_' + v });
      if (!res.ok) { TS.toast('שגיאה בשמירת הרשת — ' + (res.error || '')); return; }
    }
    school.network = 'net_' + v;
    TS.toast('הרשת נשמרה');
    renderHeader();
    const netSelect = document.getElementById('t-network');
    if (netSelect.querySelector(`option[value="${v}"]`)) netSelect.value = v;
  });
}

function renderTable() {
  document.getElementById('count').textContent = teachers.length;

  const tbody = document.getElementById('list-body');
  if (!teachers.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
      <div>עדיין לא הוספת מורים</div>
      <div style="font-size:13px; margin-top:4px;">מלא את הטופס למעלה ולחץ "הוסיפי לרשימה"</div>
    </td></tr>`;
    return;
  }
  tbody.innerHTML = teachers.map((t, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${t.name}</strong></td>
      <td>${t.subject}</td>
      <td>${TS.typeChip(t.type)}</td>
      <td>${TS.netChip(t.network)}</td>
      <td>${TS.secChip(t.sector)}</td>
      <td>${t.seniority || 0}</td>
      <td>${t.students || '—'}</td>
      <td>
        <button class="btn btn-secondary" onclick="removeTeacher(${i})" style="padding:6px 10px;">הסירי</button>
      </td>
    </tr>
  `).join('');
}

async function addTeacher(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const data = Object.fromEntries(fd);
  data.school = schoolId || (school && school.id) || '';
  data.moeApproval = false;
  data.pdActive = false;

  // Validate required
  if (!data.name || !data.subject || !data.network || !data.sector) {
    TS.toast('יש למלא שדות חובה');
    return;
  }

  if (!TS.getAppsScriptUrl()) {
    teachers.push({ id: 'demo_' + Date.now(), ...data });
    TS.toast('נוסף לרשימה (דמו)');
    e.target.reset();
    document.getElementById('t-name').focus();
    renderTable();
    return;
  }

  const res = await TS.apiPost('teachers.create', data);
  if (res.ok) {
    teachers.push(res.data);
    TS.toast('המורה נשמר/ה');
    e.target.reset();
    document.getElementById('t-name').focus();
    renderTable();
  } else {
    TS.toast('שגיאה — ' + (res.error || ''));
  }
}

function removeTeacher(i) {
  if (!confirm('להסיר את ' + teachers[i].name + ' מהרשימה?')) return;
  teachers.splice(i, 1);
  renderTable();
  // Note: full delete from sheet requires a delete endpoint, which we can add later.
  // For now this only removes from the local view in demo mode.
  TS.toast('הוסר מהתצוגה');
}

// CSV import — מקבל CSV עם כותרות: שם, מקצוע, סוג, רשת, מגזר, ותק, יח"ל, תלמידים, טלפון, מייל
async function importCsv(e) {
  const file = e.target.files[0];
  if (!file) return;
  const text = await file.text();
  const rows = parseCsv(text);
  if (rows.length < 2) {
    TS.toast('הקובץ ריק או לא תקין');
    return;
  }
  const [headers, ...data] = rows;

  const colMap = {
    'שם': 'name', 'name': 'name',
    'מקצוע': 'subject', 'subject': 'subject',
    'סוג': 'type', 'type': 'type',
    'רשת': 'network', 'network': 'network',
    'מגזר': 'sector', 'sector': 'sector',
    'ותק': 'seniority', 'seniority': 'seniority',
    'יחל': 'units', 'יח"ל': 'units', 'units': 'units',
    'תלמידים': 'students', 'students': 'students',
    'טלפון': 'phone', 'phone': 'phone',
    'מייל': 'email', 'email': 'email'
  };

  const typeMap = { 'בגרות':'bagrut', 'גמר':'gemer', 'bagrut':'bagrut', 'gemer':'gemer' };
  const sectorMap = { 'חרדי':'haredi', 'ערבי':'arab', 'כללי':'kelali', 'haredi':'haredi', 'arab':'arab', 'kelali':'kelali' };
  const netMap = { 'אורט':'ort','עמל':'amal','עתיד':'atid','סכנין':'sakhnin','דרור':'dror', 'ort':'ort','amal':'amal','atid':'atid','sakhnin':'sakhnin','dror':'dror' };

  let added = 0;
  for (const row of data) {
    const obj = { school: schoolId };
    headers.forEach((h, idx) => {
      const key = colMap[h.trim().toLowerCase().replace(/"/g, '')];
      if (key) obj[key] = row[idx] ? row[idx].trim() : '';
    });
    if (!obj.name) continue;
    if (obj.type) obj.type = typeMap[obj.type] || 'bagrut';
    if (obj.sector) obj.sector = sectorMap[obj.sector] || 'kelali';
    if (obj.network) obj.network = netMap[obj.network] || obj.network;

    if (!TS.getAppsScriptUrl()) {
      teachers.push({ id: 'demo_' + Date.now() + '_' + added, ...obj });
    } else {
      const res = await TS.apiPost('teachers.create', obj);
      if (res.ok) teachers.push(res.data);
    }
    added++;
  }
  TS.toast(`יובאו ${added} מורים`);
  renderTable();
  e.target.value = '';
}

function parseCsv(text) {
  return text.trim().split(/\r?\n/).map(line => {
    // simple CSV split — supports basic comma/tab
    const sep = line.includes('\t') ? '\t' : ',';
    return line.split(sep).map(c => c.replace(/^"|"$/g, ''));
  });
}

function exportCsv() {
  const headers = ['שם','מקצוע','סוג','רשת','מגזר','ותק','יח"ל','תלמידים','טלפון','מייל'];
  const lines = [headers.join(',')];
  teachers.forEach(t => {
    const row = [
      t.name, t.subject,
      t.type === 'bagrut' ? 'בגרות' : 'גמר',
      TS.netById(t.network).name,
      TS.secById(t.sector).name,
      t.seniority || '', t.units || '', t.students || '',
      t.phone || '', t.email || ''
    ].map(v => `"${(v || '').toString().replace(/"/g, '""')}"`);
    lines.push(row.join(','));
  });
  const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'morim-' + (school?.name || 'export') + '.csv';
  a.click();
}

function downloadTemplate() {
  const csv = 'שם,מקצוע,סוג,רשת,מגזר,ותק,יח"ל,תלמידים,טלפון,מייל\n' +
              'שרה כהן,מתמטיקה,בגרות,אורט,כללי,8,5 יח"ל,28,050-1234567,sara@example.com\n' +
              'אחמד עלי,אנגלית,בגרות,אורט,ערבי,12,4 יח"ל,24,050-7654321,';
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'template-morim.csv';
  a.click();
}
