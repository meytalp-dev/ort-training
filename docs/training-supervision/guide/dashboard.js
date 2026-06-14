// Guide Dashboard — מציג כל מורי המדריכ/ה + היסטוריית נוכחות + הדרכות
const guideSlug = TS.urlParam('g', '');
let guideEmail = TS.urlParam('guide', '');
const GUIDE_CFG = (window.TS_resolveGuide ? (window.TS_resolveGuide(guideSlug, guideEmail) || {}) : {});
if (!guideEmail && GUIDE_CFG.email) guideEmail = GUIDE_CFG.email;

let state = {
  guide: '',
  guideName: '',
  subject: '',
  trainings: [],
  teachers: []
};

document.addEventListener('DOMContentLoaded', async () => {
  bindTabs();
  document.getElementById('btn-new-training').addEventListener('click', openNewTraining);
  document.getElementById('form-training').addEventListener('submit', submitTraining);
  document.getElementById('teacher-search').addEventListener('input', renderTeachers);
  const addBtn = document.getElementById('btn-add-teacher');
  if (addBtn) addBtn.addEventListener('click', () => openTeacherModal());
  const teacherForm = document.getElementById('form-teacher');
  if (teacherForm) teacherForm.addEventListener('submit', submitTeacher);
  renderResources();
  await loadData();
});

function bindTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
  });
}

async function loadData() {
  if (!TS.getAppsScriptUrl() || !guideEmail) {
    loadDemoData();
    renderAll();
    return;
  }
  const res = await TS.api('guide.dashboard', { guide: guideEmail });
  if (res.ok && res.data) {
    state = res.data;
  } else {
    loadDemoData();
  }
  renderAll();
}

function loadDemoData() {
  state.guide = guideEmail || (GUIDE_CFG.email || 'demo@example.com');
  state.guideName = GUIDE_CFG.name || 'דמו — מדריכה';
  state.subject = GUIDE_CFG.subject || 'מתמטיקה';
  state.trainings = [
    { id:'tr_01_26', date:'2026-01-15', subject:'מתמטיקה', guideName:'דמו', location:'זום', notes:'ינואר' },
    { id:'tr_02_26', date:'2026-02-15', subject:'מתמטיקה', guideName:'דמו', location:'זום', notes:'פברואר' },
    { id:'tr_03_26', date:'2026-03-15', subject:'מתמטיקה', guideName:'דמו', location:'זום', notes:'מרץ (לא חובה)' },
    { id:'tr_04_26', date:'2026-04-15', subject:'מתמטיקה', guideName:'דמו', location:'זום', notes:'אפריל' },
    { id:'tr_05_26', date:'2026-05-15', subject:'מתמטיקה', guideName:'דמו', location:'זום', notes:'מאי' },
    { id:'tr_06_26', date:'2026-06-15', subject:'מתמטיקה', guideName:'דמו', location:'זום', qrToken:'demo-token', notes:'יוני' }
  ];
  state.teachers = [
    { id:'t1', name:'שרה כהן',   schoolName:'אורט בית הערבה', network:'ort',  networkName:'אורט', attendance:{tr_01_26:{status:'present'}, tr_02_26:{status:'present'}}, stats:{present:2, partial:0, total:5, rate:40} },
    { id:'t2', name:'יעל לוי',   schoolName:'אורט בית הערבה', network:'ort',  networkName:'אורט', attendance:{tr_01_26:{status:'present'}, tr_04_26:{status:'partial'}}, stats:{present:1, partial:1, total:5, rate:30} },
    { id:'t3', name:'אחמד עלי',  schoolName:'עמל יעד',           network:'amal', networkName:'עמל',  attendance:{}, stats:{present:0, partial:0, total:5, rate:0} }
  ];
}

function renderAll() {
  const gName = GUIDE_CFG.name || state.guideName || state.guide || 'מדריכה';
  const gSubject = GUIDE_CFG.subject || state.subject || '';
  document.getElementById('user-name').textContent = gName;
  document.getElementById('page-title').textContent = gName + (gSubject ? ' · ' + gSubject : '');
  document.getElementById('page-subtitle').textContent =
    state.teachers.length + ' מורים · ' + new Set(state.teachers.map(t => t.schoolName)).size + ' בתי ספר';

  const totalRate = state.teachers.length
    ? Math.round(state.teachers.reduce((sum, t) => sum + (t.stats.rate || 0), 0) / state.teachers.length)
    : 0;
  document.getElementById('stat-teachers').textContent = state.teachers.length;
  document.getElementById('stat-schools').textContent = new Set(state.teachers.map(t => t.schoolName)).size;
  document.getElementById('stat-trainings').textContent = state.trainings.length;
  document.getElementById('stat-rate').textContent = totalRate + '%';

  renderTeachers();
  renderTrainings();
  renderStats();
}

function renderTeachers() {
  const search = (document.getElementById('teacher-search').value || '').trim().toLowerCase();
  const filtered = state.teachers.filter(t =>
    !search || (t.name || '').toLowerCase().includes(search) ||
               (t.schoolName || '').toLowerCase().includes(search)
  );

  // קיבוץ לפי בית ספר
  const bySchool = {};
  filtered.forEach(t => {
    const key = t.schoolName || '— ללא שיוך —';
    if (!bySchool[key]) bySchool[key] = { name: key, network: t.networkName, networkColor: t.network, teachers: [] };
    bySchool[key].teachers.push(t);
  });

  const container = document.getElementById('teachers-container');
  if (!Object.keys(bySchool).length) {
    container.innerHTML = '<div class="empty" style="padding:32px;">לא נמצאו מורים</div>';
    return;
  }

  const today = new Date();
  container.innerHTML = Object.values(bySchool).map(group => {
    const teachersHtml = group.teachers.map(t => `
      <tr>
        <td class="name-cell">
          <div class="te-row-head">
            <span class="te-name-text">${escapeHtml(t.name)}</span>
            <span class="te-actions">
              <button class="te-icon" title="עריכת מורה" onclick='editTeacherById(${JSON.stringify(String(t.id))})'>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
              </button>
              <button class="te-icon te-icon-danger" title="הסרת מורה" onclick='deleteTeacherById(${JSON.stringify(String(t.id))}, ${JSON.stringify(String(t.name))})'>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </span>
          </div>
          ${t.notes ? `<div class="te-note" onclick='editNoteById(${JSON.stringify(String(t.id))})' title="עריכת ההערה">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:2px;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span>${escapeHtml(t.notes)}</span>
          </div>` : `<button class="te-addnote" onclick='editNoteById(${JSON.stringify(String(t.id))})'>+ הוספת הערה</button>`}
        </td>
        ${state.trainings.map(tr => attCell(t.attendance[tr.id], tr.date, today)).join('')}
        <td class="rate-cell ${rateClass(t.stats.rate)}">${t.stats.rate}%</td>
      </tr>
    `).join('');
    return `
      <div class="school-group">
        <div class="school-header">
          <h3>${escapeHtml(group.name)}</h3>
          <span class="meta">
            <span class="net-chip ${group.networkColor}">${escapeHtml(group.network || group.networkColor)}</span>
            · ${group.teachers.length} מורים
          </span>
        </div>
        <div class="table-wrap" style="border:none;">
          <table class="att-grid">
            <thead>
              <tr>
                <th style="text-align:right;">שם המורה</th>
                ${state.trainings.map(tr => `<th class="att-cell">${shortDate(tr.date)}</th>`).join('')}
                <th>נוכחות</th>
              </tr>
            </thead>
            <tbody>${teachersHtml}</tbody>
          </table>
        </div>
      </div>
    `;
  }).join('');
}

function attCell(att, trainingDate, today) {
  const trDate = new Date(trainingDate);
  if (trDate > today) {
    return '<td class="att-cell"><span class="att-mark future" title="עתידי">·</span></td>';
  }
  if (!att) return '<td class="att-cell"><span class="att-mark absent" title="לא נוכחה">—</span></td>';
  if (att.status === 'present') return '<td class="att-cell"><span class="att-mark present" title="נוכחה">V</span></td>';
  if (att.status === 'partial') return '<td class="att-cell"><span class="att-mark partial" title="חצי נוכחות">½</span></td>';
  const title = att.notes ? att.notes.replace(/"/g, '&quot;') : 'לא נוכחה';
  return `<td class="att-cell"><span class="att-mark absent" title="${title}">—</span></td>`;
}

function shortDate(d) {
  const dt = new Date(d);
  return ('0' + (dt.getMonth() + 1)).slice(-2) + '/' + String(dt.getFullYear()).slice(-2);
}

function rateClass(r) {
  if (r >= 80) return 'high';
  if (r >= 50) return 'mid';
  return 'low';
}

function escapeHtml(s) {
  return (s || '').toString()
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function renderTrainings() {
  const list = document.getElementById('trainings-list');
  if (!state.trainings.length) {
    list.innerHTML = '<div class="empty" style="padding:32px;">אין הדרכות עדיין</div>';
    return;
  }
  const baseUrl = location.origin + location.pathname.replace(/\/guide\/?$/, '');
  const today = new Date();
  list.innerHTML = state.trainings.map(t => {
    const trDate = new Date(t.date);
    const isFuture = trDate >= today;
    const checkinUrl = t.qrToken
      ? baseUrl + '/checkin/?t=' + encodeURIComponent(t.qrToken)
      : '';
    const presentCount = state.teachers.filter(tch => {
      const a = tch.attendance[t.id];
      return a && a.status === 'present';
    }).length;
    return `
      <div class="training-row">
        <div>
          <div class="when">${TS.formatDate(t.date)}</div>
          <div class="where">${escapeHtml(t.location || '—')} · ${escapeHtml(t.notes || '')}</div>
        </div>
        <div class="actions">
          ${!isFuture ? `<span style="color:var(--text-2); font-size:13px;">${presentCount} מתוך ${state.teachers.length} נוכחו</span>` : ''}
          ${isFuture && checkinUrl ? `
            <button class="copy-link-btn" data-url="${checkinUrl}" onclick="copyCheckinUrl(this)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              העתק קישור צ'ק-אין
            </button>` : ''}
          ${!isFuture ? `<a class="btn btn-secondary" href="attendance.html?training=${t.id}">רישום ידני</a>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function copyCheckinUrl(btn) {
  const url = btn.dataset.url;
  navigator.clipboard.writeText(url).then(() => {
    const original = btn.innerHTML;
    btn.classList.add('copied');
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> הקישור הועתק';
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = original;
    }, 2200);
  });
}

function renderStats() {
  const container = document.getElementById('stats-chart');
  if (!state.trainings.length || !state.teachers.length) {
    container.innerHTML = '<div class="empty">אין מספיק נתונים</div>';
    return;
  }
  const rows = state.trainings.map(t => {
    const present = state.teachers.filter(tch => {
      const a = tch.attendance[t.id];
      return a && a.status === 'present';
    }).length;
    const total = state.teachers.length;
    const rate = Math.round((present / total) * 100);
    return { date: t.date, label: TS.formatDate(t.date), present, total, rate };
  });
  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px; margin-top:16px;">
      ${rows.map(r => `
        <div>
          <div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:4px;">
            <span><strong>${r.label}</strong></span>
            <span style="color:var(--text-2);">${r.present} / ${r.total} (${r.rate}%)</span>
          </div>
          <div style="background:var(--surface-2); border-radius:6px; height:20px; overflow:hidden;">
            <div style="background:${r.rate>=80?'var(--ok)':r.rate>=50?'#f59e0b':'var(--err)'};
                        width:${r.rate}%; height:100%; transition:width .3s;"></div>
          </div>
        </div>
      `).join('')}
    </div>
    <div style="margin-top:20px; padding:12px; background:var(--surface-2); border-radius:8px; color:var(--text-2); font-size:13px;">
      <strong>יעד נוכחות:</strong> 80%. מורים מתחת ל-50% נוכחות שנתית נחשבים בסיכון.
    </div>
  `;
}

/* ===== חומרים וקישורים (Drive / זום / שליחת חומרים) ===== */
function renderResources() {
  const card = document.getElementById('resources-card');
  const grid = document.getElementById('resources-grid');
  if (!card || !grid) return;
  const items = [];
  if (GUIDE_CFG.drive) {
    items.push(`<a class="resource-link" href="${GUIDE_CFG.drive}" target="_blank" rel="noopener">
      <span class="ic drive"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-7l-2-3H5a2 2 0 0 0-2 2z"/></svg></span>
      <span class="tx"><strong>חומרי ההוראה ב-Drive</strong><span>פתיחת התיקייה</span></span></a>`);
  }
  if (GUIDE_CFG.zoom) {
    items.push(`<a class="resource-link" href="${GUIDE_CFG.zoom}" target="_blank" rel="noopener">
      <span class="ic zoom"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 10l5-3v10l-5-3v-4z"/><rect x="3" y="6" width="12" height="12" rx="2"/></svg></span>
      <span class="tx"><strong>הזום הקבוע</strong><span>כניסה למפגש</span></span></a>`);
  }
  if (GUIDE_CFG.drive) {
    items.push(`<button type="button" class="resource-link" onclick="sendMaterials(this)">
      <span class="ic send"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></span>
      <span class="tx"><strong>שליחת חומרים למורים</strong><span>העתקת הודעה מוכנה לוואטסאפ</span></span></button>`);
  }
  if (!items.length) { card.hidden = true; return; }
  grid.innerHTML = items.join('');
  card.hidden = false;
}

function sendMaterials(btn) {
  const subject = GUIDE_CFG.subject || '';
  const lines = ['שלום,', '', `מצורפים חומרי ההוראה${subject ? ' ל' + subject : ''}:`, GUIDE_CFG.drive];
  if (GUIDE_CFG.zoom) lines.push('', 'הזום הקבוע למפגשים:', GUIDE_CFG.zoom);
  lines.push('', 'בהצלחה!');
  navigator.clipboard.writeText(lines.join('\n')).then(() => {
    const tx = btn.querySelector('.tx span');
    const orig = tx ? tx.textContent : '';
    btn.classList.add('copied');
    if (tx) tx.textContent = '✓ ההודעה הועתקה — הדביקי בוואטסאפ';
    setTimeout(() => { btn.classList.remove('copied'); if (tx) tx.textContent = orig; }, 2600);
  });
}

/* ===== הוספה / עריכת מורה ===== */
function editTeacherById(id) {
  const t = state.teachers.find(x => String(x.id) === String(id));
  if (t) openTeacherModal(t);
}

// פתיחת המודאל עם פוקוס ישיר על שדה ההערה
function editNoteById(id) {
  const t = state.teachers.find(x => String(x.id) === String(id));
  if (!t) return;
  openTeacherModal(t);
  const notes = document.getElementById('te-notes');
  if (notes) { notes.focus(); notes.scrollIntoView({ block: 'center' }); }
}

// הסרת מורה
async function deleteTeacherById(id, name) {
  if (!confirm('להסיר את ' + (name || 'המורה') + ' מהרשימה?\nהפעולה אינה הפיכה.')) return;

  if (!TS.getAppsScriptUrl() || !guideEmail) {
    state.teachers = state.teachers.filter(x => String(x.id) !== String(id));
    TS.toast('דמו — הוסר מקומית בלבד');
    renderAll();
    return;
  }
  const res = await TS.apiPost('teachers.delete', { id });
  if (res.ok) {
    TS.toast('המורה הוסרה');
    await loadData();
  } else {
    TS.toast('שגיאה — ' + (res.error || ''));
  }
}
function openTeacherModal(teacher) {
  const f = document.getElementById('form-teacher');
  f.reset();
  document.getElementById('te-id').value = teacher ? (teacher.id || '') : '';
  document.getElementById('teacher-modal-title').textContent = teacher ? 'עריכת מורה' : 'הוספת מורה';
  if (teacher) {
    document.getElementById('te-name').value = teacher.name || '';
    document.getElementById('te-school').value = teacher.schoolName || '';
    document.getElementById('te-network').value = (teacher.network || '').replace(/^net_/, '');
    document.getElementById('te-phone').value = teacher.phone || '';
    document.getElementById('te-email').value = teacher.email || '';
    document.getElementById('te-notes').value = teacher.notes || '';
  }
  document.getElementById('modal-teacher').classList.add('open');
}
function closeTeacherModal() {
  document.getElementById('modal-teacher').classList.remove('open');
}
async function submitTeacher(e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  data.subject = GUIDE_CFG.subject || state.subject || '';
  data.guide = guideEmail || (GUIDE_CFG.email || '');
  const editing = !!data.id;

  if (!TS.getAppsScriptUrl()) {
    if (editing) {
      const t = state.teachers.find(x => String(x.id) === String(data.id));
      if (t) Object.assign(t, { name: data.name, schoolName: data.schoolName, network: data.network, networkName: data.network, phone: data.phone, email: data.email, notes: data.notes });
    } else {
      state.teachers.push({
        id: 'local_' + Object.keys(state.teachers).length + '_' + state.teachers.length,
        name: data.name, schoolName: data.schoolName || '— ללא שיוך —',
        network: data.network, networkName: data.network, phone: data.phone, email: data.email, notes: data.notes,
        attendance: {}, stats: { present: 0, partial: 0, total: state.trainings.length, rate: 0 }
      });
    }
    TS.toast('דמו — נשמר מקומית בלבד (ללא Apps Script)');
    closeTeacherModal();
    renderAll();
    return;
  }

  const res = await TS.apiPost(editing ? 'teachers.update' : 'teachers.create', data);
  if (res.ok) {
    TS.toast(editing ? 'המורה עודכן' : 'המורה נוסף');
    closeTeacherModal();
    await loadData();
  } else {
    TS.toast('שגיאה — ' + (res.error || ''));
  }
}

function openNewTraining() {
  document.getElementById('form-training').reset();
  document.getElementById('t-date').value = new Date().toISOString().slice(0,10);
  populateSubjects('t-subject');
  document.getElementById('modal-training').classList.add('open');
}
function closeNewTraining() {
  document.getElementById('modal-training').classList.remove('open');
}
function populateSubjects(id) {
  const sel = document.getElementById(id);
  if (sel.options.length > 1) return;
  TS.SUBJECTS.forEach(s => sel.insertAdjacentHTML('beforeend', `<option value="${s}">${s}</option>`));
}

async function submitTraining(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const data = Object.fromEntries(fd);
  if (!TS.getAppsScriptUrl()) {
    TS.toast('דמו — לא נשמר');
    closeNewTraining();
    return;
  }
  const res = await TS.apiPost('training.create', data);
  if (res.ok) {
    TS.toast('ההדרכה נוצרה');
    closeNewTraining();
    await loadData();
  } else {
    TS.toast('שגיאה');
  }
}
