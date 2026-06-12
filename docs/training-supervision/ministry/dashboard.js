// Ministry / National Inspector Dashboard — רויטל אמיר
let state = {
  filter: { subject: '', availableSubjects: [] },
  summary: {},
  networkBreakdown: [],
  schoolBreakdown: []
};
let currentSubject = '';

document.addEventListener('DOMContentLoaded', async () => {
  await load();
});

async function load() {
  if (!TS.getAppsScriptUrl()) {
    state = demoState();
    render();
    return;
  }
  const res = await TS.api('ministry.dashboard', { subject: currentSubject });
  if (res.ok && res.data) {
    state = res.data;
  } else {
    state = demoState();
  }
  render();
}

function render() {
  renderSubjectTabs();
  renderStats();
  renderNetworkCards();
  renderWeakSchools();
}

function renderSubjectTabs() {
  const container = document.getElementById('subject-tabs');
  const subjects = state.filter?.availableSubjects || [];
  container.innerHTML = `
    <button class="subject-tab ${currentSubject === '' ? 'active' : ''}" data-subject="">כל המקצועות</button>
    ${subjects.map(s => `
      <button class="subject-tab ${currentSubject === s ? 'active' : ''}" data-subject="${s}">${s}</button>
    `).join('')}
  `;
  container.querySelectorAll('.subject-tab').forEach(btn => {
    btn.addEventListener('click', async () => {
      currentSubject = btn.dataset.subject;
      await load();
    });
  });

  const sub = currentSubject
    ? 'מקצוע נבחר: ' + currentSubject + '. סקירה של כל הרשתות.'
    : 'סקירה של כל הרשתות בפיקוח. סינון לפי מקצוע, ושליחת דוחות לכל רשת.';
  document.getElementById('page-sub').textContent = sub;
}

function renderStats() {
  const s = state.summary || {};
  document.getElementById('stat-networks').textContent = s.networks || 0;
  document.getElementById('stat-schools').textContent = s.schools || 0;
  document.getElementById('stat-teachers').textContent = s.teachers || 0;
  document.getElementById('stat-trainings').textContent = s.trainings || 0;
  document.getElementById('stat-rate').textContent = (s.avgRate || 0) + '%';
  document.getElementById('stat-rate').className = 'stat-value ' +
    (s.avgRate >= 80 ? 'ok' : s.avgRate >= 50 ? 'warn' : 'err');
  document.getElementById('stat-records').textContent = s.attendanceRecords || 0;
}

function renderNetworkCards() {
  const cards = document.getElementById('cards');
  const nets = state.networkBreakdown || [];
  if (!nets.length) {
    cards.innerHTML = '<div class="empty card">אין נתונים עבור הסינון הנוכחי</div>';
    return;
  }
  cards.innerHTML = nets.map(n => {
    const rate = n.rate || 0;
    const rateClass = rate >= 80 ? 'ok' : rate >= 50 ? 'warn' : 'err';
    return `
      <div class="card net-card">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
          <div>
            <div class="net-chip ${n.color || ''}" style="margin-bottom:8px;">${escapeHtml(n.name)}</div>
            <div style="color:var(--text-2); font-size:14px;">${n.teachers} מורים · ${n.schools} בתי ספר</div>
          </div>
          <div style="text-align:left;">
            <div style="font-family:'Frank Ruhl Libre'; font-size:28px; font-weight:800; line-height:1;" class="${rateClass}">${rate}%</div>
            <div style="font-size:12px; color:var(--text-3);">נוכחות ממוצעת</div>
          </div>
        </div>
        <div style="display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap; font-size:13px; color:var(--text-2);">
          <span><strong style="color:var(--ok);">${n.present}</strong> עומדים ביעד</span>
          ${n.missed > 0 ? `<span>· <strong style="color:var(--err);">${n.missed}</strong> בסיכון</span>` : ''}
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <a class="btn btn-secondary" href="../admin-network/?network=${encodeURIComponent(n.id)}" style="flex:1; justify-content:center;">פתח דשבורד</a>
          <button class="btn btn-soft" onclick="sendToNetwork('${n.id}', '${escapeAttr(n.name)}', '${n.contactEmail || ''}')" style="flex:1; justify-content:center;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            שליחה
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function renderWeakSchools() {
  const tbody = document.getElementById('weak-schools-body');
  const schools = (state.schoolBreakdown || []).slice(0, 10);
  if (!schools.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty">אין נתוני בתי ספר</td></tr>';
    return;
  }
  tbody.innerHTML = schools.map(s => {
    const school = s.school || {};
    const rate = s.rate || 0;
    const rateClass = rate >= 80 ? 'ok' : rate >= 50 ? 'warn' : 'err';
    const networkChip = school.network ? `<span class="net-chip ${school.network.replace(/^net_/, '')}">${school.network.replace(/^net_/, '')}</span>` : '—';
    return `
      <tr>
        <td><strong>${escapeHtml(school.name || '')}</strong></td>
        <td>${networkChip}</td>
        <td>${s.teachers}</td>
        <td><span class="badge ${rateClass}">${rate}%</span></td>
        <td><a class="btn btn-secondary" href="../admin-school/?school=${encodeURIComponent(school.id)}&network=${encodeURIComponent(school.network || '')}">פתח</a></td>
      </tr>
    `;
  }).join('');
}

function sendToNetwork(netId, netName, netEmail) {
  const n = (state.networkBreakdown || []).find(x => x.id === netId);
  if (!n) return;
  const subjLabel = currentSubject ? ('— מקצוע: ' + currentSubject) : '';
  const subject = `דוח חודשי — רשת ${netName} ${subjLabel} — ${TS.monthLabel()}`;
  const body = [
    `שלום,`,
    ``,
    `מצורף דוח חודשי על הדרכות מורים ברשת ${netName} עבור ${TS.monthLabel()}.`,
    currentSubject ? `מקצוע: ${currentSubject}` : 'כל המקצועות',
    ``,
    `סיכום:`,
    `• מורים ברשת: ${n.teachers}`,
    `• בתי ספר: ${n.schools}`,
    `• אחוז נוכחות ממוצע: ${n.rate}%`,
    `• עומדים ביעד (80%+): ${n.present}`,
    `• בסיכון (מתחת ל-50%): ${n.missed}`,
    ``,
    `דשבורד מלא של הרשת:`,
    `${location.origin}${location.pathname.replace('/ministry/', '/admin-network/')}?network=${netId}${currentSubject ? '&subject=' + encodeURIComponent(currentSubject) : ''}`,
    ``,
    `בברכה,`,
    `רויטל אמיר`,
    `מפקחת ארצית · יחידת הפיקוח על הדרכות`,
    `משרד העבודה`
  ].join('\n');
  window.open(TS.gmailCompose({ to: netEmail, subject, body }), '_blank');
}

function escapeHtml(s) {
  return (s || '').toString()
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function escapeAttr(s) {
  return (s || '').toString().replace(/'/g, "\\'");
}

function demoState() {
  return {
    filter: { subject: '', availableSubjects: ['מתמטיקה', 'אנגלית', 'עברית'] },
    summary: { networks: 8, schools: 34, teachers: 95, trainings: 5, attendanceRecords: 176, avgRate: 38 },
    networkBreakdown: [
      { id:'net_atid', name:'עתיד', color:'atid', teachers:32, schools:12, present:8, missed:14, rate:35 },
      { id:'net_ort',  name:'אורט', color:'ort',  teachers:18, schools:6,  present:7, missed:6,  rate:48 },
      { id:'net_amal', name:'עמל',  color:'amal', teachers:12, schools:5,  present:5, missed:4,  rate:50 },
      { id:'net_dror', name:'דרור', color:'dror', teachers:13, schools:5,  present:3, missed:7,  rate:30 }
    ],
    schoolBreakdown: [
      { school:{id:'s1', name:'בית ספר א׳', network:'atid'}, teachers:3, rate:10 },
      { school:{id:'s2', name:'בית ספר ב׳', network:'ort'},  teachers:2, rate:25 }
    ]
  };
}
