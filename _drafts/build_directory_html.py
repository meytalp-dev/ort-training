import json

with open(r"c:\Users\meyta\Downloads\ort-presentation-builder\_drafts\students.json", encoding="utf-8") as f:
    students = json.load(f)

data_js = json.dumps(students, ensure_ascii=False, separators=(",",":"))

html = r"""<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>אלפון תלמידים — אורט בית הערבה</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playpen+Sans+Hebrew:wght@400;600;700;800&family=Assistant:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#FBFAF7;--card:#FFFFFF;--text:#2A2F3A;--muted:#7C8597;--border:#EDE9E0;
  --cyan:#4EC5D4;--cyan-dark:#2AA3B3;--cyan-bg:#E6F7FA;
  --pink:#E08AB5;--pink-dark:#C86599;--pink-bg:#FCEDF5;
  --turq:#6CCFC0;--turq-dark:#3FA898;--turq-bg:#E4F7F3;
  --amber:#E8A838;--amber-dark:#B8801F;--amber-bg:#FDF3E0;
  --danger:#D96A6A;--danger-dark:#B84848;--danger-bg:#FBEAEA;
  --green:#5FB87B;--green-bg:#E5F4EA;
  --radius:20px;
  --shadow-sm:0 2px 8px rgba(42,47,58,.05),0 1px 3px rgba(42,47,58,.04);
  --shadow-md:0 6px 22px rgba(42,47,58,.07),0 2px 6px rgba(42,47,58,.04);
  --shadow-lg:0 14px 44px rgba(42,47,58,.10),0 4px 12px rgba(42,47,58,.05);
}
body{font-family:'Assistant','Playpen Sans Hebrew',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;line-height:1.55;-webkit-font-smoothing:antialiased}
h1,h2,h3,h4{font-family:'Playpen Sans Hebrew','Assistant',sans-serif;font-weight:700}
body::before{content:'';position:fixed;inset:0;background:
  radial-gradient(circle at 12% 10%,rgba(78,197,212,.12) 0%,transparent 40%),
  radial-gradient(circle at 88% 18%,rgba(108,207,192,.10) 0%,transparent 42%),
  radial-gradient(circle at 50% 92%,rgba(224,138,181,.10) 0%,transparent 45%);
  z-index:-2;pointer-events:none}
body::after{content:'';position:fixed;inset:0;background-image:radial-gradient(circle,rgba(42,47,58,.025) 1px,transparent 1px);background-size:22px 22px;z-index:-1;pointer-events:none}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}

.header{background:linear-gradient(180deg,rgba(108,207,192,.10),#FFFFFF);padding:14px 28px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;position:sticky;top:0;z-index:50;box-shadow:0 2px 12px rgba(42,47,58,.05);border-bottom:1px solid var(--border)}
.header::before{content:'';position:absolute;bottom:-1px;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--turq),var(--cyan),var(--pink));opacity:.7}
.brand{display:flex;align-items:center;gap:14px}
.brand-icon{width:42px;height:42px;border-radius:14px;background:linear-gradient(135deg,var(--turq),var(--cyan));display:grid;place-items:center;box-shadow:var(--shadow-sm)}
.brand-icon svg{width:22px;height:22px;color:#fff}
.brand h1{font-size:1.15rem;font-weight:800;color:var(--text)}
.brand p{font-size:.72rem;color:var(--muted);font-weight:500}
.back-link{color:var(--muted);text-decoration:none;font-size:.82rem;font-weight:600;display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:10px;transition:.2s}
.back-link:hover{background:var(--turq-bg);color:var(--turq-dark)}

.container{max-width:1500px;margin:0 auto;padding:22px 26px 60px}

.search-bar{background:var(--card);border:1px solid var(--border);border-radius:18px;padding:18px 22px;box-shadow:var(--shadow-sm);margin-bottom:20px;animation:slideUp .4s ease}
.search-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.search-input{flex:1;min-width:240px;padding:13px 18px;border:1.5px solid var(--border);border-radius:14px;font-family:'Assistant';font-size:.95rem;background:#fff;color:var(--text)}
.search-input:focus{outline:none;border-color:var(--turq);box-shadow:0 0 0 3px var(--turq-bg)}
.kpi-mini{display:flex;gap:14px;font-size:.82rem;color:var(--muted);font-weight:700;padding:0 8px}
.kpi-mini b{color:var(--turq-dark);font-family:'Playpen Sans Hebrew';font-size:1.1rem}

.chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
.chip{padding:8px 14px;border:1.5px solid var(--border);border-radius:20px;background:#fff;font-family:'Assistant';font-size:.78rem;font-weight:700;color:var(--muted);cursor:pointer;transition:.15s}
.chip:hover{border-color:var(--turq);color:var(--turq-dark)}
.chip.active{background:var(--turq);color:#fff;border-color:var(--turq)}
.chip-label{font-size:.74rem;font-weight:700;color:var(--muted);align-self:center;margin-left:4px}

.class-section{margin-bottom:24px;animation:fadeIn .35s ease}
.class-header{display:flex;align-items:center;gap:12px;margin-bottom:10px;padding:0 6px}
.class-title{font-family:'Playpen Sans Hebrew';font-size:1.2rem;font-weight:800;color:var(--turq-dark)}
.class-count{background:var(--turq-bg);color:var(--turq-dark);padding:3px 12px;border-radius:12px;font-size:.78rem;font-weight:700}

.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px}
.card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:16px 18px;box-shadow:var(--shadow-sm);transition:.2s;position:relative;overflow:hidden}
.card:hover{transform:translateY(-2px);box-shadow:var(--shadow-md);border-color:var(--turq)}
.card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:12px}
.card-name{font-weight:800;font-size:1.02rem;color:var(--text);line-height:1.3}
.card-name .given{color:var(--turq-dark);display:block;font-size:1.05rem}
.card-name .fam{font-weight:600;color:var(--muted);font-size:.92rem}
.status-badge{padding:3px 10px;border-radius:10px;font-size:.68rem;font-weight:800;white-space:nowrap;flex-shrink:0}
.status-active{background:var(--green-bg);color:var(--green)}
.status-visible{background:var(--pink-bg);color:var(--pink-dark)}
.status-hidden{background:var(--turq-bg);color:var(--turq-dark)}
.status-removed{background:var(--amber-bg);color:var(--amber-dark)}

.contact-row{display:flex;align-items:center;gap:8px;padding:7px 0;border-top:1px solid var(--border);font-size:.84rem}
.contact-row:first-of-type{border-top:none;padding-top:4px}
.contact-icon{width:28px;height:28px;border-radius:9px;background:#FBF8F2;display:grid;place-items:center;flex-shrink:0;color:var(--muted)}
.contact-icon svg{width:14px;height:14px}
.contact-row.student .contact-icon{background:var(--turq-bg);color:var(--turq-dark)}
.contact-row.parent1 .contact-icon{background:var(--cyan-bg);color:var(--cyan-dark)}
.contact-row.parent2 .contact-icon{background:var(--pink-bg);color:var(--pink-dark)}
.contact-info{flex:1;min-width:0}
.contact-label{font-size:.7rem;color:var(--muted);font-weight:700}
.contact-name{font-size:.82rem;font-weight:600;color:var(--text)}
.contact-actions{display:flex;gap:5px}
.contact-actions a{width:30px;height:30px;border-radius:9px;display:grid;place-items:center;background:#FBF8F2;color:var(--muted);text-decoration:none;transition:.15s;border:1px solid var(--border)}
.contact-actions a:hover{background:var(--turq);color:#fff;border-color:var(--turq)}
.contact-actions a svg{width:14px;height:14px}
.contact-actions a.wa:hover{background:#25D366;border-color:#25D366}
.no-phone{font-size:.74rem;color:var(--muted);font-style:italic}

.empty{padding:80px 20px;text-align:center;color:var(--muted)}
.empty svg{width:48px;height:48px;opacity:.4;margin-bottom:12px}
.empty h3{font-size:1.05rem;font-weight:700;margin-bottom:4px;color:var(--text)}
</style>
</head>
<body>

<header class="header">
  <div class="brand">
    <div class="brand-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
    </div>
    <div>
      <h1>אלפון תלמידים</h1>
      <p>אורט בית הערבה ירושלים · לשימוש הצוות בלבד</p>
    </div>
  </div>
  <a class="back-link" href="student-roster.html">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
    חזרה למצבת
  </a>
</header>

<main class="container">

  <section class="search-bar">
    <div class="search-row">
      <input type="text" class="search-input" id="search" placeholder="חיפוש לפי שם, כיתה, הורה או טלפון...">
      <div class="kpi-mini"><span><b id="kpi-shown">0</b> מוצגים</span><span>/</span><span><b id="kpi-total">0</b> סה״כ</span></div>
    </div>
    <div class="chips">
      <span class="chip-label">שכבה:</span>
      <button class="chip active" data-grade="all">הכל</button>
      <button class="chip" data-grade="ט">ט</button>
      <button class="chip" data-grade="י'">י</button>
      <button class="chip" data-grade='י"א'>י״א</button>
      <button class="chip" data-grade='י"ב'>י״ב</button>
      <span class="chip-label" style="margin-right:14px">סטטוס:</span>
      <button class="chip active" data-status="all">הכל</button>
      <button class="chip" data-status="active">פעילים</button>
      <button class="chip" data-status="visible">נשירה גלויה</button>
      <button class="chip" data-status="hidden">נשירה סמויה</button>
    </div>
  </section>

  <div id="results"></div>
</main>

<script>
const STUDENTS = __DATA__;
const STORAGE_KEY = 'ort-student-roster-v1';
const STATUS_LABELS = {active:'פעיל',visible:'נשירה גלויה',hidden:'נשירה סמויה',remove:'הוסר'};
const STATUS_CLASSES = {active:'status-active',visible:'status-visible',hidden:'status-hidden',remove:'status-removed'};

let rosterState = {};
try { rosterState = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch(e){}
const TAB_TO_STATUS = {all:'active',remove:'remove',visible:'visible',hidden:'hidden'};
function statusOf(s){
  const t = rosterState[s.tz];
  if(t) return TAB_TO_STATUS[t] || 'active';
  return s.status || 'active';
}

let filters = { q:'', grade:'all', status:'all' };

function escapeHtml(s){return (s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);}

function digitsOnly(p){ return (p||'').replace(/[^\d]/g,''); }
function waLink(p){
  let d = digitsOnly(p);
  if(!d) return '';
  if(d.startsWith('0')) d = '972' + d.substring(1);
  return 'https://api.whatsapp.com/send?phone=' + d;
}

const ICONS = {
  student:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
  parent:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
  phone:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  wa:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.4-.1-.6.1-.2.3-.7.9-.8 1.1-.1.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2 0 1.3.9 2.5 1 2.7.1.2 1.8 2.7 4.3 3.8.6.3 1.1.4 1.4.5.6.2 1.2.2 1.6.1.5-.1 1.7-.7 1.9-1.3.2-.7.2-1.2.2-1.3-.1-.2-.3-.2-.5-.3zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.3C8.6 21.5 10.3 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2z"/></svg>'
};

function cardHtml(s){
  const status = statusOf(s);
  const stPhone = s.student_phone || '';
  const p1 = s.p1_phone || '';
  const p2 = s.p2_phone || '';

  function row(cls, label, name, phone){
    if(!phone){
      return `<div class="contact-row ${cls}"><div class="contact-icon">${ICONS[cls==='student'?'student':'parent']}</div><div class="contact-info"><div class="contact-label">${label}</div><div class="contact-name">${escapeHtml(name||'—')}</div></div><div class="no-phone">אין מספר</div></div>`;
    }
    const tel = digitsOnly(phone);
    return `<div class="contact-row ${cls}">
      <div class="contact-icon">${ICONS[cls==='student'?'student':'parent']}</div>
      <div class="contact-info">
        <div class="contact-label">${label}${name?' · '+escapeHtml(name):''}</div>
        <div class="contact-name">${escapeHtml(phone)}</div>
      </div>
      <div class="contact-actions">
        <a href="tel:${tel}" title="חיוג">${ICONS.phone}</a>
        <a class="wa" href="${waLink(phone)}" target="_blank" rel="noopener noreferrer" title="WhatsApp">${ICONS.wa}</a>
      </div>
    </div>`;
  }

  return `<div class="card">
    <div class="card-top">
      <div class="card-name">
        <span class="given">${escapeHtml(s.given)}</span>
        <span class="fam">${escapeHtml(s.fam)}</span>
      </div>
      <span class="status-badge ${STATUS_CLASSES[status]}">${STATUS_LABELS[status]}</span>
    </div>
    ${row('student','תלמיד','',stPhone)}
    ${row('parent1','הורה',s.p1_name,p1)}
    ${row('parent2','הורה',s.p2_name,p2)}
  </div>`;
}

function matchQuery(s, q){
  if(!q) return true;
  q = q.toLowerCase();
  const hay = (s.fam+' '+s.given+' '+s.class+' '+s.p1_name+' '+s.p2_name+' '+(s.student_phone||'')+' '+s.p1_phone+' '+s.p2_phone+' '+s.city).toLowerCase();
  return hay.includes(q);
}
function matchGrade(s, g){ return g === 'all' || s.class.startsWith(g); }
function matchStatus(s, st){
  if(st === 'all') return statusOf(s) !== 'remove';
  return statusOf(s) === st;
}

function render(){
  const list = STUDENTS
    .filter(s=>matchQuery(s, filters.q))
    .filter(s=>matchGrade(s, filters.grade))
    .filter(s=>matchStatus(s, filters.status));

  document.getElementById('kpi-shown').textContent = list.length;
  document.getElementById('kpi-total').textContent = STUDENTS.filter(s=>statusOf(s)!=='remove').length;

  const container = document.getElementById('results');
  if(list.length === 0){
    container.innerHTML = `<div class="empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <h3>לא נמצאו תוצאות</h3><p>נסי לשנות חיפוש או סינון</p></div>`;
    return;
  }

  // group by class
  const groups = {};
  list.forEach(s=>{ (groups[s.class] = groups[s.class] || []).push(s); });
  const order = (c)=>{
    const m = {"ט' 1":91,"ט' 2":92,"י' 1":101,"י' 2":102,"י' 3":103,'י"א 1':111,'י"א 2':112,'י"א 3':113,'י"ב 1':121,'י"ב 2':122,'י"ב 3':123};
    return m[c] || 999;
  };
  const classes = Object.keys(groups).sort((a,b)=>order(a)-order(b));

  container.innerHTML = classes.map(cls=>{
    const cards = groups[cls].sort((a,b)=>a.fam.localeCompare(b.fam,'he')).map(cardHtml).join('');
    return `<section class="class-section">
      <div class="class-header"><h2 class="class-title">${escapeHtml(cls)}</h2><span class="class-count">${groups[cls].length}</span></div>
      <div class="cards">${cards}</div>
    </section>`;
  }).join('');
}

document.getElementById('search').addEventListener('input', e=>{ filters.q = e.target.value; render(); });
document.querySelectorAll('.chip[data-grade]').forEach(c=>c.addEventListener('click',()=>{
  document.querySelectorAll('.chip[data-grade]').forEach(x=>x.classList.remove('active'));
  c.classList.add('active');
  filters.grade = c.dataset.grade; render();
}));
document.querySelectorAll('.chip[data-status]').forEach(c=>c.addEventListener('click',()=>{
  document.querySelectorAll('.chip[data-status]').forEach(x=>x.classList.remove('active'));
  c.classList.add('active');
  filters.status = c.dataset.status; render();
}));

render();
</script>
</body>
</html>
"""

html = html.replace("__DATA__", data_js)
out = r"c:\Users\meyta\Downloads\ort-presentation-builder\docs\management\student-directory.html"
with open(out, "w", encoding="utf-8") as f:
    f.write(html)
print(f"Wrote: {out}")
