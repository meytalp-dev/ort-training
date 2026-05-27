// Network Admin Dashboard
const networkId = TS.urlParam('network', '');
let report = {};

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('month-label').textContent = TS.monthLabel();
  await loadData();
});

async function loadData() {
  if (!TS.getAppsScriptUrl()) {
    report = demoReport();
    document.getElementById('user-name').textContent = 'דמו';
    document.getElementById('user-network').textContent = 'רשת אורט';
    render();
    return;
  }

  const [reportRes, netsRes] = await Promise.all([
    TS.api('reports.network', { network: networkId, month: '' }),
    TS.api('networks.list')
  ]);

  report = reportRes.data || {};
  const net = (netsRes.data || []).find(n => n.id === networkId);
  if (net) {
    document.getElementById('user-network').textContent = 'רשת ' + net.name;
    document.querySelector('.network-tag').innerHTML = TS.netChip(net.color);
  }
  render();
}

function render() {
  document.getElementById('stat-schools').textContent = report.schools || 0;
  document.getElementById('stat-teachers').textContent = report.teachers || 0;
  document.getElementById('stat-attendance').textContent = (report.rate || 0) + '%';
  document.getElementById('stat-attendance').className = 'stat-value ' +
    (report.rate >= 90 ? 'ok' : report.rate >= 70 ? 'warn' : 'err');
  document.getElementById('stat-pd').textContent = report.inPD || 0;
  document.getElementById('stat-missed').textContent = report.missed || 0;

  // Sector breakdown
  const sec = report.bySector || {};
  const total = (sec.haredi || 0) + (sec.arab || 0) + (sec.kelali || 0);
  document.getElementById('sec-haredi').textContent = sec.haredi || 0;
  document.getElementById('sec-arab').textContent = sec.arab || 0;
  document.getElementById('sec-kelali').textContent = sec.kelali || 0;
  document.getElementById('sec-haredi-pct').textContent = total ? Math.round((sec.haredi||0)/total*100)+'%' : '—';
  document.getElementById('sec-arab-pct').textContent = total ? Math.round((sec.arab||0)/total*100)+'%' : '—';
  document.getElementById('sec-kelali-pct').textContent = total ? Math.round((sec.kelali||0)/total*100)+'%' : '—';

  // Schools table
  const tbody = document.getElementById('schools-body');
  const schools = report.schoolBreakdown || [];
  if (!schools.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty">אין בתי ספר ברשת</td></tr>`;
    return;
  }
  tbody.innerHTML = schools.map(s => `
    <tr>
      <td><strong>${s.name}</strong></td>
      <td>${s.teachers}</td>
      <td>${s.present}</td>
      <td>${TS.attendanceBadge(s.rate)}</td>
      <td>
        <a class="btn btn-secondary" href="../admin-school/?school=${s.id}&network=${networkId}">פתח</a>
      </td>
    </tr>
  `).join('');
}

function sendReport() {
  const subject = `דוח הדרכות חודשי — ${document.getElementById('user-network').textContent} — ${TS.monthLabel()}`;
  const body = [
    `דוח חודשי — ${document.getElementById('user-network').textContent}`,
    `${TS.monthLabel()}`,
    '',
    `בתי ספר ברשת: ${report.schools || 0}`,
    `מורים: ${report.teachers || 0}`,
    `נוכחות החודש: ${report.rate || 0}%`,
    `בהשתלמות פעילה: ${report.inPD || 0}`,
    `פספסו: ${report.missed || 0}`,
    '',
    'פילוח לפי מגזר:',
    `- חרדי: ${report.bySector?.haredi || 0}`,
    `- ערבי: ${report.bySector?.arab || 0}`,
    `- כללי: ${report.bySector?.kelali || 0}`,
    '',
    'פירוט לפי בית ספר:',
    ...(report.schoolBreakdown || []).map(s => `- ${s.name}: ${s.present}/${s.teachers} (${s.rate}%)`)
  ].join('\n');
  window.open(TS.gmailCompose({ subject, body }), '_blank');
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btn-send-report');
  if (btn) btn.addEventListener('click', sendReport);
});

function demoReport() {
  return {
    schools: 12,
    teachers: 187,
    present: 168,
    missed: 19,
    inPD: 54,
    rate: 90,
    bySector: { haredi: 28, arab: 45, kelali: 114 },
    schoolBreakdown: [
      { id:'sch_ort_beit_haarava', name:'אורט בית הערבה', teachers:18, present:17, rate:94 },
      { id:'s2', name:'אורט אבן יהודה', teachers:22, present:20, rate:91 },
      { id:'s3', name:'אורט גוש דן',     teachers:15, present:13, rate:87 },
      { id:'s4', name:'אורט יד ליבוביץ', teachers:24, present:22, rate:92 },
      { id:'s5', name:'אורט רחובות',     teachers:19, present:16, rate:84 },
      { id:'s6', name:'אורט אופקים',     teachers:14, present:13, rate:93 }
    ]
  };
}
