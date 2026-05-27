// Guide Dashboard
const guideEmail = TS.urlParam('guide', '');
let trainings = [];

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('month-label').textContent = TS.monthLabel();
  await loadTrainings();
  document.getElementById('btn-new-training').addEventListener('click', () => openNewTraining());
  document.getElementById('form-training').addEventListener('submit', submitTraining);
});

async function loadTrainings() {
  if (!TS.getAppsScriptUrl()) {
    trainings = demoTrainings();
    document.getElementById('user-name').textContent = 'דמו — מדריך/ה';
    render();
    return;
  }
  const res = await TS.api('trainings.list', { guide: guideEmail, month: thisMonthKey() });
  trainings = res.data || [];
  render();
}

function thisMonthKey() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}

function render() {
  document.getElementById('stat-trainings').textContent = trainings.length;

  const tbody = document.getElementById('trainings-body');
  if (!trainings.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      <div>אין הדרכות החודש</div>
      <div style="font-size:13px; margin-top:4px;">לחצי "הדרכה חדשה" כדי להתחיל</div>
    </td></tr>`;
    return;
  }
  tbody.innerHTML = trainings.map(t => {
    const audience = t.sector
      ? `<span class="sec-chip ${t.sector}">${TS.secById(t.sector).name}</span>`
      : `<span class="badge info">כל המגזרים</span>`;
    return `
    <tr>
      <td>${TS.formatDate(t.date)}</td>
      <td><strong>${t.subject}</strong></td>
      <td>${audience}</td>
      <td>${t.location || '—'}</td>
      <td>
        <a class="btn btn-primary" href="attendance.html?training=${t.id}">רישום נוכחות</a>
      </td>
    </tr>`;
  }).join('');
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
    // Navigate to attendance
    window.location.href = 'attendance.html?training=' + res.data.id;
  } else {
    TS.toast('שגיאה');
  }
}

function demoTrainings() {
  return [
    { id:'tr1', date:'2026-05-05', subject:'מתמטיקה', guideName:'דנה לוי', network:'ort', sector:'kelali', location:'אורט בית הערבה', notes:'' },
    { id:'tr2', date:'2026-05-19', subject:'מתמטיקה', guideName:'דנה לוי', network:'ort', sector:'kelali', location:'זום', notes:'' },
    { id:'tr3', date:'2026-05-12', subject:'אנגלית', guideName:'דנה לוי', network:'amal', sector:'arab', location:'מעלה אדומים', notes:'' }
  ];
}
