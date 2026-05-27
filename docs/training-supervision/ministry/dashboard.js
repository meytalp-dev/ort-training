// Ministry of Labor Dashboard
let report = {};
let networks = [];

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('month-label').textContent = TS.monthLabel();
  await load();
});

async function load() {
  if (!TS.getAppsScriptUrl()) {
    networks = TS.NETWORKS.map(n => ({ id: 'net_'+n.id, name: n.name, color: n.color, contactEmail: '' }));
    report = demoReport();
    render();
    return;
  }
  const [rptRes, netsRes] = await Promise.all([
    TS.api('reports.ministry', { month: '' }),
    TS.api('networks.list')
  ]);
  report = rptRes.data || {};
  networks = netsRes.data || [];
  render();
}

function render() {
  document.getElementById('stat-networks').textContent = report.networks || 0;
  document.getElementById('stat-schools').textContent = report.schools || 0;
  document.getElementById('stat-teachers').textContent = report.teachers || 0;
  const rate = report.teachers ? Math.round((report.present / report.teachers) * 100) : 0;
  document.getElementById('stat-rate').textContent = rate + '%';
  document.getElementById('stat-rate').className = 'stat-value ' + (rate >= 90 ? 'ok' : rate >= 70 ? 'warn' : 'err');
  document.getElementById('stat-pd').textContent = report.inPD || 0;
  document.getElementById('stat-missed').textContent = report.missed || 0;

  const breakdown = report.networkBreakdown || [];
  document.getElementById('cards').innerHTML = breakdown.map(n => {
    const sec = n.sector || { haredi:0, arab:0, kelali:0 };
    const total = (sec.haredi||0)+(sec.arab||0)+(sec.kelali||0);
    const net = networks.find(x => x.id === n.id);
    const netEmail = net?.contactEmail || '';
    return `
      <div class="card net-card">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
          <div>
            <div class="net-chip ${n.color || ''}" style="margin-bottom:8px;">${n.name}</div>
            <div style="color:var(--text-2); font-size:14px;">${n.teachers} מורים</div>
          </div>
          <div style="text-align:left;">
            <div style="font-family:'Playpen Sans Hebrew'; font-size:28px; font-weight:800; line-height:1;">${n.rate}%</div>
            <div style="font-size:12px; color:var(--text-3);">נוכחות</div>
          </div>
        </div>
        <div style="display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap;">
          ${sec.haredi ? `<span class="sec-chip haredi">חרדי ${sec.haredi}</span>` : ''}
          ${sec.arab   ? `<span class="sec-chip arab">ערבי ${sec.arab}</span>` : ''}
          ${sec.kelali ? `<span class="sec-chip kelali">כללי ${sec.kelali}</span>` : ''}
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <a class="btn btn-secondary" href="../admin-network/?network=${n.id}" style="flex:1; justify-content:center;">פתח דשבורד</a>
          <button class="btn btn-soft" onclick="sendToNetwork('${n.id}', '${n.name}', '${netEmail}')" style="flex:1; justify-content:center;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            שליחה
          </button>
        </div>
      </div>
    `;
  }).join('') || `<div class="empty card">אין נתונים עדיין</div>`;
}

function sendToNetwork(netId, netName, netEmail) {
  const n = (report.networkBreakdown || []).find(x => x.id === netId);
  if (!n) return;
  const sec = n.sector || {};
  const subject = `דוח חודשי — רשת ${netName} — ${TS.monthLabel()}`;
  const body = [
    `שלום,`,
    ``,
    `מצורף דוח חודשי על הדרכות מורים ברשת ${netName} עבור ${TS.monthLabel()}.`,
    ``,
    `סיכום:`,
    `• מורים ברשת: ${n.teachers}`,
    `• השתתפו בהדרכות החודש: ${n.present} (${n.rate}%)`,
    `• פספסו: ${n.missed}`,
    ``,
    `פילוח לפי מגזר:`,
    `• חרדי: ${sec.haredi || 0}`,
    `• ערבי: ${sec.arab || 0}`,
    `• כללי: ${sec.kelali || 0}`,
    ``,
    `דשבורד מלא של הרשת: ${window.location.origin}${window.location.pathname.replace('/ministry/', '/admin-network/')}?network=${netId}`,
    ``,
    `בברכה,`,
    `יחידת הפיקוח על הדרכות`,
    `משרד העבודה`
  ].join('\n');
  window.open(TS.gmailCompose({ to: netEmail, subject, body }), '_blank');
}

function demoReport() {
  return {
    networks: 5,
    schools: 47,
    teachers: 712,
    present: 638,
    missed: 74,
    inPD: 198,
    networkBreakdown: [
      { id:'net_ort',     name:'אורט',  color:'ort',     teachers:187, present:168, missed:19, rate:90, sector:{haredi:28, arab:45, kelali:114} },
      { id:'net_amal',    name:'עמל',   color:'amal',    teachers:163, present:148, missed:15, rate:91, sector:{haredi:12, arab:38, kelali:113} },
      { id:'net_atid',    name:'עתיד',  color:'atid',    teachers:142, present:122, missed:20, rate:86, sector:{haredi:8,  arab:24, kelali:110} },
      { id:'net_sakhnin', name:'סכנין', color:'sakhnin', teachers:128, present:118, missed:10, rate:92, sector:{haredi:0,  arab:128, kelali:0  } },
      { id:'net_dror',    name:'דרור',  color:'dror',    teachers:92,  present:82,  missed:10, rate:89, sector:{haredi:0,  arab:8,  kelali:84 } }
    ]
  };
}
