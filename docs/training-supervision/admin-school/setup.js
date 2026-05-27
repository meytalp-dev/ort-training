// School Principal — Initial Setup Form
// טופס ראשוני: מנהל ממלא את כל המורים בבית ספר

const schoolId = TS.urlParam('school', '');
const networkParam = TS.urlParam('network', '');
let teachers = [];
let school = null;

document.addEventListener('DOMContentLoaded', async () => {
  populateSelects();
  await loadInitial();
  document.getElementById('form-add').addEventListener('submit', addTeacher);
  document.getElementById('file-import').addEventListener('change', importCsv);
});

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
  document.getElementById('principal-name').textContent = school.principalName || '—';
  const net = TS.netById(school.network);
  document.getElementById('network-chip').innerHTML = TS.netChip(net.id.replace(/^net_/, ''));
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
