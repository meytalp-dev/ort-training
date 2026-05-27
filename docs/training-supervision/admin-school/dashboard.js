// School Principal Dashboard
const schoolId = TS.urlParam('school', '');
const networkId = TS.urlParam('network', '');
let teachers = [];
let attendance = {};

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('month-label').textContent = TS.monthLabel();
  populateSubjectFilter();
  await loadData();
  setupFormHandlers();
});

function populateSubjectFilter() {
  const sel = document.getElementById('filter-subject');
  const tsel = document.getElementById('t-subject');
  TS.SUBJECTS.forEach(s => {
    sel.insertAdjacentHTML('beforeend', `<option value="${s}">${s}</option>`);
    tsel.insertAdjacentHTML('beforeend', `<option value="${s}">${s}</option>`);
  });
  [
    document.getElementById('filter-search'),
    document.getElementById('filter-subject'),
    document.getElementById('filter-type'),
    document.getElementById('filter-sector')
  ].forEach(el => el.addEventListener('input', renderTeachers));
}

async function loadData() {
  if (!TS.getAppsScriptUrl()) {
    // Demo mode
    teachers = demoTeachers();
    attendance = demoAttendance();
    document.getElementById('user-name').textContent = 'דמו — מיטל פלג';
    document.getElementById('user-school').textContent = 'אורט בית הערבה';
    renderAll();
    return;
  }

  const [teachersRes, schoolRes, attendanceRes] = await Promise.all([
    TS.api('teachers.list', { school: schoolId }),
    TS.api('school.get', { id: schoolId }),
    TS.api('attendance.monthly', { school: schoolId })
  ]);

  teachers = teachersRes.data || [];
  attendance = attendanceRes.data || {};

  if (schoolRes.data) {
    document.getElementById('user-name').textContent = schoolRes.data.principalName || '—';
    document.getElementById('user-school').textContent = schoolRes.data.name + ' · רשת ' + (TS.netById(schoolRes.data.network).name);
  }

  renderAll();
}

function renderAll() {
  renderStats();
  renderAlerts();
  renderTeachers();
}

function renderStats() {
  const total = teachers.length;
  const present = teachers.filter(t => attendance[t.id]?.thisMonth === 'present').length;
  const missed = teachers.filter(t => attendance[t.id]?.thisMonth === 'missed').length;
  const inPD = teachers.filter(t => t.pdActive).length;
  const attRate = total ? Math.round((present / total) * 100) : 0;

  document.getElementById('stat-teachers').textContent = total;
  document.getElementById('stat-attendance').textContent = attRate + '%';
  const subEl = document.getElementById('stat-attendance-sub');
  subEl.textContent = `${present} מתוך ${total} השתתפו`;
  document.getElementById('stat-pd').textContent = inPD;
  document.getElementById('stat-missed').textContent = missed;

  const valueEl = document.getElementById('stat-attendance');
  valueEl.className = 'stat-value ' + (attRate >= 90 ? 'ok' : attRate >= 70 ? 'warn' : 'err');
}

function renderAlerts() {
  const missed = teachers.filter(t => attendance[t.id]?.thisMonth === 'missed');
  const container = document.getElementById('alerts-section');
  if (!missed.length) {
    container.innerHTML = '';
    return;
  }
  const items = missed.slice(0, 5).map(t => {
    const reminder = TS.gmailCompose({
      to: t.email || '',
      subject: 'תזכורת — השתתפות בהדרכת ' + t.subject,
      body: `שלום ${t.name},\n\nלא ראיתי אותך בהדרכה החודש.\nההדרכה הבאה: יום ראשון הקרוב 18:00.\n\nתודה,\nמיטל`
    });
    const wa = TS.whatsappLink(t.phone, `שלום ${t.name}, תזכורת להדרכת ${t.subject} השבוע 18:00`);
    return `
      <div class="alert warn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/></svg>
        <div class="alert-body">
          <div class="alert-title">${t.name} פספסה החודש</div>
          ${t.subject} · ${attendance[t.id]?.lastMissedDate || ''}
          <div class="btn-row" style="margin:8px 0 0;">
            <a class="btn btn-soft" href="${reminder}" target="_blank">שליחת תזכורת במייל</a>
            <a class="btn btn-soft" href="${wa}" target="_blank">תזכורת WhatsApp</a>
          </div>
        </div>
      </div>`;
  }).join('');
  container.innerHTML = items;
}

function renderTeachers() {
  const search = document.getElementById('filter-search').value.trim().toLowerCase();
  const fSubject = document.getElementById('filter-subject').value;
  const fType = document.getElementById('filter-type').value;
  const fSector = document.getElementById('filter-sector').value;

  const filtered = teachers.filter(t => {
    if (search && !(t.name || '').toLowerCase().includes(search)) return false;
    if (fSubject && t.subject !== fSubject) return false;
    if (fType && t.type !== fType) return false;
    if (fSector && t.sector !== fSector) return false;
    return true;
  });

  const tbody = document.getElementById('teachers-body');
  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="11" class="empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <div>אין מורים להצגה</div>
      </td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(t => {
    const a = attendance[t.id] || {};
    const attBadge = a.thisMonth === 'present'
      ? '<span class="badge ok">השתתף</span>'
      : a.thisMonth === 'missed'
        ? '<span class="badge err">חסר</span>'
        : '<span class="badge neutral">—</span>';
    const pdBadge = t.pdActive
      ? `<a class="badge info" href="${t.pdFile || '#'}" target="_blank">פעילה</a>`
      : '<span class="badge neutral">—</span>';
    const moeBadge = t.moeApproval
      ? (t.moeFile
          ? `<a class="badge info" href="${t.moeFile}" target="_blank">צפייה</a>`
          : '<span class="badge ok">✓</span>')
      : '<span class="badge neutral">—</span>';
    return `
      <tr>
        <td><strong>${t.name}</strong></td>
        <td>${t.subject}</td>
        <td>${TS.typeChip(t.type)}</td>
        <td>${TS.secChip(t.sector)}</td>
        <td>${t.seniority || 0}</td>
        <td>${t.units || '—'}</td>
        <td>${t.students || '—'}</td>
        <td>${attBadge}</td>
        <td>${pdBadge}</td>
        <td>${moeBadge}</td>
        <td>
          <div class="actions">
            <button class="btn btn-secondary" onclick="editTeacher('${t.id}')">עריכה</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

function openAddTeacher(t) {
  document.getElementById('modal-title').textContent = t ? 'עריכת מורה' : 'הוספת מורה חדש';
  document.getElementById('form-teacher').reset();
  document.getElementById('t-id').value = '';
  document.getElementById('moe-file-row').hidden = true;
  if (t) {
    document.getElementById('t-id').value = t.id;
    document.getElementById('t-name').value = t.name || '';
    document.getElementById('t-subject').value = t.subject || '';
    document.getElementById('t-type').value = t.type || 'bagrut';
    document.getElementById('t-sector').value = t.sector || 'kelali';
    document.getElementById('t-seniority').value = t.seniority || 0;
    document.getElementById('t-units').value = t.units || '';
    document.getElementById('t-students').value = t.students || '';
    document.getElementById('t-phone').value = t.phone || '';
    document.getElementById('t-email').value = t.email || '';
    document.getElementById('t-moe').checked = !!t.moeApproval;
    document.getElementById('t-moe-file').value = t.moeFile || '';
    document.getElementById('moe-file-row').hidden = !t.moeApproval;
  }
  document.getElementById('modal-add').classList.add('open');
}
function closeAddTeacher() {
  document.getElementById('modal-add').classList.remove('open');
}
function editTeacher(id) {
  const t = teachers.find(x => x.id === id);
  if (t) openAddTeacher(t);
}

function setupFormHandlers() {
  document.getElementById('t-moe').addEventListener('change', e => {
    document.getElementById('moe-file-row').hidden = !e.target.checked;
  });

  document.getElementById('form-teacher').addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd);
    data.moeApproval = !!fd.get('moeApproval');
    data.school = schoolId;
    data.network = networkId;

    if (!TS.getAppsScriptUrl()) {
      TS.toast('דמו — לא נשמר באמת');
      closeAddTeacher();
      return;
    }
    const res = await TS.apiPost(data.id ? 'teachers.update' : 'teachers.create', data);
    if (res.ok) {
      TS.toast('נשמר בהצלחה');
      closeAddTeacher();
      loadData();
    } else {
      TS.toast('שגיאה — ' + (res.error || ''));
    }
  });

  document.getElementById('btn-send-report').addEventListener('click', sendReport);
}

function sendReport() {
  const url = TS.gmailCompose({
    to: '',
    subject: `דוח חודשי — ${document.getElementById('user-school').textContent} — ${TS.monthLabel()}`,
    body: buildReportBody()
  });
  window.open(url, '_blank');
}

function buildReportBody() {
  const total = teachers.length;
  const present = teachers.filter(t => attendance[t.id]?.thisMonth === 'present').length;
  const missed = teachers.filter(t => attendance[t.id]?.thisMonth === 'missed').length;
  const inPD = teachers.filter(t => t.pdActive).length;
  const missedNames = teachers.filter(t => attendance[t.id]?.thisMonth === 'missed').map(t => `- ${t.name} (${t.subject})`).join('\n');
  return [
    `דוח חודשי — ${TS.monthLabel()}`,
    `בית ספר: ${document.getElementById('user-school').textContent}`,
    '',
    `מורים בבית הספר: ${total}`,
    `אחוז נוכחות החודש: ${total ? Math.round((present/total)*100) : 0}%`,
    `השתתפו: ${present}`,
    `פספסו: ${missed}`,
    `בהשתלמות פעילה: ${inPD}`,
    '',
    missed ? `מורים שפספסו:\n${missedNames}` : '',
    '',
    'בברכה,',
    document.getElementById('user-name').textContent
  ].filter(Boolean).join('\n');
}

// Demo data
function demoTeachers() {
  return [
    { id:'t1', name:'שרה כהן', subject:'מתמטיקה', type:'bagrut', sector:'kelali', seniority:8, units:'5 יח"ל', students:28, phone:'0501234567', email:'sara@example.com', moeApproval:true, moeFile:'#', pdActive:true, pdFile:'#' },
    { id:'t2', name:'אחמד עלי', subject:'אנגלית',  type:'bagrut', sector:'arab',   seniority:12, units:'4 יח"ל', students:24, phone:'0507654321', email:'ahmad@example.com', moeApproval:false, pdActive:false },
    { id:'t3', name:'יעל לוי',   subject:'עיצוב שיער', type:'gemer', sector:'kelali', seniority:5, units:'—', students:18, moeApproval:true, pdActive:true },
    { id:'t4', name:'מרים פרידמן', subject:'עברית', type:'bagrut', sector:'haredi', seniority:15, units:'5 יח"ל', students:32, moeApproval:false, pdActive:false },
    { id:'t5', name:'דני אבן',    subject:'היסטוריה', type:'bagrut', sector:'kelali', seniority:6, units:'2 יח"ל', students:25, moeApproval:false, pdActive:true, pdFile:'#' }
  ];
}
function demoAttendance() {
  return {
    t1: { thisMonth: 'missed', lastMissedDate: '5 במאי' },
    t2: { thisMonth: 'present' },
    t3: { thisMonth: 'present' },
    t4: { thisMonth: 'present' },
    t5: { thisMonth: 'missed', lastMissedDate: '5 במאי' }
  };
}
