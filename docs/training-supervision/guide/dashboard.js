// Guide Dashboard — מציג כל מורי המדריכ/ה + היסטוריית נוכחות + הדרכות
const guideEmail = TS.urlParam('guide', '');

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
  state.guide = guideEmail || 'demo@example.com';
  state.guideName = 'דמו — מדריכה';
  state.subject = 'מתמטיקה';
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
  document.getElementById('user-name').textContent = state.guideName || state.guide || '—';
  document.getElementById('page-title').textContent = (state.guideName || 'מדריכה') + ' · ' + (state.subject || '');
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
        <td class="name-cell">${escapeHtml(t.name)}</td>
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
