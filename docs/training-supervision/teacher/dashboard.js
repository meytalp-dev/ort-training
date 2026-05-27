// Teacher self-view
const teacherId = TS.urlParam('id', '');
let teacher = null;
let attendance = [];
let questions = [];

document.addEventListener('DOMContentLoaded', async () => {
  await load();
  document.getElementById('form-question').addEventListener('submit', submitQuestion);
});

async function load() {
  if (!TS.getAppsScriptUrl()) {
    teacher = { id:'t1', name:'שרה כהן', subject:'מתמטיקה', type:'bagrut', sector:'kelali', seniority:8, units:'5 יח"ל', students:28, pdActive:true, moeApproval:true };
    attendance = demoAttendance();
    questions = demoQuestions();
    render();
    return;
  }
  const [teacherRes, attRes, qRes] = await Promise.all([
    TS.api('teacher.get', { id: teacherId }),
    TS.api('attendance.teacher', { teacherId }),
    TS.api('questions.list', { teacherId })
  ]);
  teacher = teacherRes.data;
  attendance = attRes.data || [];
  questions = qRes.data || [];
  render();
}

function render() {
  if (!teacher) {
    document.querySelector('main').innerHTML = '<div class="empty">לא נמצאו פרטים. נסי לפתוח את הקישור ששלחה לך המנהלת שלך.</div>';
    return;
  }
  document.getElementById('user-name').textContent = teacher.name;
  document.getElementById('user-meta').textContent = teacher.subject;

  // Profile
  document.getElementById('p-subject').textContent = teacher.subject;
  document.getElementById('p-type').innerHTML = TS.typeChip(teacher.type);
  document.getElementById('p-sector').innerHTML = TS.secChip(teacher.sector);
  document.getElementById('p-seniority').textContent = (teacher.seniority || 0) + ' שנים';
  document.getElementById('p-units').textContent = teacher.units || '—';
  document.getElementById('p-students').textContent = teacher.students || '—';

  // Stats
  const total = attendance.length;
  const present = attendance.filter(a => a.status === 'present').length;
  const missed = attendance.filter(a => a.status === 'absent').length;
  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-present').textContent = present;
  document.getElementById('stat-missed').textContent = missed;
  const rate = total ? Math.round((present / total) * 100) : 0;
  document.getElementById('stat-rate').textContent = rate + '%';
  document.getElementById('stat-rate').className = 'stat-value ' + (rate >= 90 ? 'ok' : rate >= 70 ? 'warn' : 'err');

  // PD badge
  document.getElementById('pd-status').innerHTML = teacher.pdActive
    ? '<span class="badge ok">בהשתלמות פעילה</span>'
    : '<span class="badge neutral">לא בהשתלמות</span>';

  document.getElementById('moe-status').innerHTML = teacher.moeApproval
    ? '<span class="badge info">מודרך גם במשרד החינוך</span>'
    : '<span class="badge neutral">לא מודרך במשה"ח</span>';

  // Attendance history
  const tbody = document.getElementById('history-body');
  if (!attendance.length) {
    tbody.innerHTML = '<tr><td colspan="3" class="empty">אין רישומים עדיין</td></tr>';
  } else {
    tbody.innerHTML = attendance.map(a => {
      const tr = a.training || {};
      const status = a.status === 'present'
        ? '<span class="badge ok">נכחתי</span>'
        : '<span class="badge err">חסרתי</span>';
      return `
        <tr>
          <td>${TS.formatDate(tr.date || a.timestamp)}</td>
          <td>${tr.subject || '—'}</td>
          <td>${status}</td>
        </tr>`;
    }).join('');
  }

  // Questions
  renderQuestions();
}

function renderQuestions() {
  const cont = document.getElementById('questions-list');
  if (!questions.length) {
    cont.innerHTML = '<div class="empty" style="padding:24px;">עדיין לא שאלת שאלות. הטופס למטה ↓</div>';
    return;
  }
  cont.innerHTML = questions.slice().reverse().map(q => `
    <div class="card" style="margin-bottom:12px; padding: 16px;">
      <div style="display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; margin-bottom:8px;">
        <strong>שאלה</strong>
        <span class="badge ${q.status==='answered'?'ok':'warn'}">${q.status==='answered' ? 'נענתה' : 'בהמתנה'}</span>
      </div>
      <div style="margin-bottom:12px;">${q.question || ''}</div>
      ${q.answer ? `<div style="background:var(--info-soft); padding:12px; border-radius:8px;"><strong style="color:var(--info);">תשובה:</strong><br>${q.answer}</div>` : ''}
      <div style="margin-top:8px; font-size:12px; color:var(--text-3);">נשלחה ${TS.formatDate(q.createdAt)}</div>
    </div>
  `).join('');
}

async function submitQuestion(e) {
  e.preventDefault();
  const text = document.getElementById('q-text').value.trim();
  if (!text) return;

  if (!TS.getAppsScriptUrl()) {
    TS.toast('דמו — לא נשלח');
    document.getElementById('q-text').value = '';
    return;
  }
  const res = await TS.apiPost('questions.create', { teacherId, question: text });
  if (res.ok) {
    TS.toast('השאלה נשלחה למדריכה');
    document.getElementById('q-text').value = '';
    questions.push(res.data);
    renderQuestions();
  } else {
    TS.toast('שגיאה');
  }
}

function demoAttendance() {
  return [
    { id:'a1', status:'missed', timestamp:'2026-05-05', training:{ date:'2026-05-05', subject:'מתמטיקה' } },
    { id:'a2', status:'present', timestamp:'2026-04-21', training:{ date:'2026-04-21', subject:'מתמטיקה' } },
    { id:'a3', status:'present', timestamp:'2026-04-07', training:{ date:'2026-04-07', subject:'מתמטיקה' } }
  ];
}
function demoQuestions() {
  return [
    { id:'q1', question:'איך מתמודדים עם תלמיד שלא מצליח בנושא טריגונומטריה?', answer:'יש ב"מאגר ידע" מערך שלם לטריגו עם דוגמאות מדורגות.', status:'answered', createdAt:'2026-05-02' }
  ];
}
