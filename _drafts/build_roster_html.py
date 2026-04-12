import json

with open(r"c:\Users\meyta\Downloads\ort-presentation-builder\_drafts\students.json", encoding="utf-8") as f:
    students = json.load(f)

data_js = json.dumps(students, ensure_ascii=False, separators=(",",":"))

html = r"""<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>מצבת תלמידים — אורט בית הערבה</title>
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
  --radius:20px;
  --shadow-sm:0 2px 8px rgba(42,47,58,.05),0 1px 3px rgba(42,47,58,.04);
  --shadow-md:0 6px 22px rgba(42,47,58,.07),0 2px 6px rgba(42,47,58,.04);
  --shadow-lg:0 14px 44px rgba(42,47,58,.10),0 4px 12px rgba(42,47,58,.05);
}
body{font-family:'Assistant','Playpen Sans Hebrew',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;line-height:1.55;-webkit-font-smoothing:antialiased}
h1,h2,h3,h4{font-family:'Playpen Sans Hebrew','Assistant',sans-serif;font-weight:700}

/* floating shapes background */
body::before{content:'';position:fixed;inset:0;background:
  radial-gradient(circle at 12% 10%,rgba(78,197,212,.12) 0%,transparent 40%),
  radial-gradient(circle at 88% 18%,rgba(224,138,181,.10) 0%,transparent 42%),
  radial-gradient(circle at 50% 92%,rgba(108,207,192,.10) 0%,transparent 45%);
  z-index:-2;pointer-events:none}
body::after{content:'';position:fixed;inset:0;background-image:radial-gradient(circle,rgba(42,47,58,.025) 1px,transparent 1px);background-size:22px 22px;z-index:-1;pointer-events:none}

@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes pop{0%{transform:scale(.96)}60%{transform:scale(1.04)}100%{transform:scale(1)}}

/* HEADER */
.header{background:linear-gradient(180deg,rgba(78,197,212,.10),#FFFFFF);padding:14px 28px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;position:sticky;top:0;z-index:50;box-shadow:0 2px 12px rgba(42,47,58,.05);border-bottom:1px solid var(--border)}
.header::before{content:'';position:absolute;bottom:-1px;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--cyan),var(--turq),var(--pink));opacity:.7}
.brand{display:flex;align-items:center;gap:14px}
.brand-icon{width:42px;height:42px;border-radius:14px;background:linear-gradient(135deg,var(--cyan),var(--turq));display:grid;place-items:center;box-shadow:var(--shadow-sm)}
.brand-icon svg{width:22px;height:22px;color:#fff}
.brand h1{font-size:1.15rem;font-weight:800;color:var(--text)}
.brand p{font-size:.72rem;color:var(--muted);font-family:'Assistant';font-weight:500}
.back-link{color:var(--muted);text-decoration:none;font-size:.82rem;font-weight:600;display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:10px;transition:.2s}
.back-link:hover{background:var(--cyan-bg);color:var(--cyan-dark)}

/* CONTAINER */
.container{max-width:1500px;margin:0 auto;padding:22px 26px 60px}

/* KPI */
.kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px}
@media(max-width:900px){.kpi-row{grid-template-columns:repeat(2,1fr)}}
.kpi{background:var(--card);border:1px solid var(--border);border-radius:18px;padding:18px 20px;box-shadow:var(--shadow-sm);position:relative;overflow:hidden;transition:.25s;animation:slideUp .5s ease}
.kpi:hover{transform:translateY(-3px);box-shadow:var(--shadow-md)}
.kpi::before{content:'';position:absolute;top:-30px;left:-30px;width:100px;height:100px;border-radius:50%;opacity:.15}
.kpi.cyan::before{background:var(--cyan)}
.kpi.amber::before{background:var(--amber)}
.kpi.pink::before{background:var(--pink)}
.kpi.turq::before{background:var(--turq)}
.kpi-label{font-size:.78rem;font-weight:700;color:var(--muted);display:flex;align-items:center;gap:7px;margin-bottom:8px;position:relative}
.kpi-label svg{width:15px;height:15px}
.kpi-value{font-size:2.2rem;font-weight:800;font-family:'Playpen Sans Hebrew';line-height:1;position:relative}
.kpi.cyan .kpi-value{color:var(--cyan-dark)}
.kpi.amber .kpi-value{color:var(--amber-dark)}
.kpi.pink .kpi-value{color:var(--pink-dark)}
.kpi.turq .kpi-value{color:var(--turq-dark)}
.kpi-sub{font-size:.72rem;color:var(--muted);margin-top:4px;position:relative}

/* TABS */
.tabs{display:flex;gap:4px;background:var(--card);border-radius:18px 18px 0 0;border:1px solid var(--border);border-bottom:none;padding:6px 6px 0;overflow-x:auto;box-shadow:var(--shadow-sm)}
.tab-btn{background:transparent;border:none;color:var(--muted);padding:14px 20px;font-family:'Assistant';font-size:.9rem;font-weight:700;cursor:pointer;transition:.2s;border-radius:14px 14px 0 0;display:flex;align-items:center;gap:8px;white-space:nowrap;position:relative}
.tab-btn:hover{color:var(--text);background:rgba(78,197,212,.06)}
.tab-btn.active{color:var(--cyan-dark);background:linear-gradient(180deg,var(--cyan-bg),#fff)}
.tab-btn.active::after{content:'';position:absolute;bottom:0;left:12px;right:12px;height:3px;background:var(--cyan);border-radius:3px 3px 0 0}
.tab-btn svg{width:16px;height:16px}
.tab-btn .tab-count{background:var(--muted);color:#fff;font-size:.7rem;padding:2px 9px;border-radius:12px;font-weight:800;min-width:24px;text-align:center}
.tab-btn.active .tab-count{background:var(--cyan)}
.tab-btn[data-tab="remove"].active .tab-count{background:var(--amber)}
.tab-btn[data-tab="remove"].active{color:var(--amber-dark);background:linear-gradient(180deg,var(--amber-bg),#fff)}
.tab-btn[data-tab="remove"].active::after{background:var(--amber)}
.tab-btn[data-tab="visible"].active .tab-count{background:var(--pink)}
.tab-btn[data-tab="visible"].active{color:var(--pink-dark);background:linear-gradient(180deg,var(--pink-bg),#fff)}
.tab-btn[data-tab="visible"].active::after{background:var(--pink)}
.tab-btn[data-tab="hidden"].active .tab-count{background:var(--turq)}
.tab-btn[data-tab="hidden"].active{color:var(--turq-dark);background:linear-gradient(180deg,var(--turq-bg),#fff)}
.tab-btn[data-tab="hidden"].active::after{background:var(--turq)}

.tab-panel{display:none;background:var(--card);border:1px solid var(--border);border-top:none;border-radius:0 0 18px 18px;padding:22px;box-shadow:var(--shadow-sm);animation:fadeIn .3s ease}
.tab-panel.active{display:block}

/* FILTERS */
.filters{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:18px;padding-bottom:16px;border-bottom:1px dashed var(--border)}
.filter-search{flex:1;min-width:220px;padding:11px 16px;border:1.5px solid var(--border);border-radius:12px;font-family:'Assistant';font-size:.9rem;background:#fff;color:var(--text)}
.filter-search:focus{outline:none;border-color:var(--cyan);box-shadow:0 0 0 3px var(--cyan-bg)}
.filter-chip{padding:8px 14px;border:1.5px solid var(--border);border-radius:20px;background:#fff;font-family:'Assistant';font-size:.8rem;font-weight:700;color:var(--muted);cursor:pointer;transition:.15s}
.filter-chip:hover{border-color:var(--cyan);color:var(--cyan-dark)}
.filter-chip.active{background:var(--cyan);color:#fff;border-color:var(--cyan)}

/* TABLE */
.table-wrap{overflow-x:auto;border-radius:14px;border:1px solid var(--border)}
table{width:100%;border-collapse:separate;border-spacing:0;font-size:.86rem;background:var(--card)}
thead th{background:#FBF8F2;color:var(--muted);font-family:'Assistant';font-weight:800;padding:12px 10px;text-align:right;font-size:.76rem;text-transform:none;letter-spacing:.02em;border-bottom:1.5px solid var(--border);position:sticky;top:0;z-index:1}
tbody td{padding:12px 10px;border-bottom:1px solid var(--border);vertical-align:middle}
tbody tr{transition:.15s}
tbody tr:hover{background:#FBF8F2}
tbody tr:last-child td{border-bottom:none}
.col-num{width:42px;color:var(--muted);font-weight:700;font-size:.78rem;text-align:center}
.col-name{font-weight:700;color:var(--text)}
.col-name .given{color:var(--cyan-dark)}
.class-badge{display:inline-block;padding:3px 10px;border-radius:10px;background:var(--cyan-bg);color:var(--cyan-dark);font-weight:700;font-size:.75rem}
.phone-cell{display:flex;flex-direction:column;gap:2px;font-size:.78rem}
.phone-cell .pname{color:var(--muted);font-weight:600;font-size:.72rem}
.phone-cell a{color:var(--cyan-dark);text-decoration:none;font-weight:700;font-feature-settings:"tnum"}
.phone-cell a:hover{text-decoration:underline}
.addr{font-size:.78rem;color:var(--muted)}

/* row actions (move menu) */
.actions{display:flex;gap:4px;justify-content:flex-start;position:relative}
.move-btn{background:#FBF8F2;border:1px solid var(--border);color:var(--muted);width:30px;height:30px;border-radius:9px;cursor:pointer;display:grid;place-items:center;transition:.15s}
.move-btn:hover{background:var(--cyan-bg);color:var(--cyan-dark);border-color:var(--cyan)}
.move-btn svg{width:15px;height:15px}
.move-menu{position:absolute;top:34px;right:0;background:#fff;border:1px solid var(--border);border-radius:12px;box-shadow:var(--shadow-lg);padding:6px;min-width:180px;z-index:20;display:none}
.move-menu.open{display:block;animation:fadeIn .15s ease}
.move-menu button{display:flex;align-items:center;gap:8px;width:100%;padding:9px 12px;background:transparent;border:none;text-align:right;font-family:'Assistant';font-size:.82rem;font-weight:600;color:var(--text);border-radius:8px;cursor:pointer;transition:.15s}
.move-menu button:hover{background:var(--cyan-bg);color:var(--cyan-dark)}
.move-menu button .dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
.move-menu button[data-target="all"] .dot{background:var(--cyan)}
.move-menu button[data-target="remove"] .dot{background:var(--amber)}
.move-menu button[data-target="visible"] .dot{background:var(--pink)}
.move-menu button[data-target="hidden"] .dot{background:var(--turq)}

.empty{padding:60px 20px;text-align:center;color:var(--muted)}
.empty svg{width:44px;height:44px;opacity:.4;margin-bottom:10px}
.empty h3{font-size:1rem;font-weight:700;margin-bottom:4px;color:var(--text)}
.empty p{font-size:.85rem}

/* toolbar */
.toolbar{display:flex;gap:8px;justify-content:flex-end;margin-bottom:14px;flex-wrap:wrap}
.tb-btn{padding:9px 16px;border:1.5px solid var(--border);background:#fff;font-family:'Assistant';font-size:.82rem;font-weight:700;color:var(--text);border-radius:11px;cursor:pointer;display:flex;align-items:center;gap:6px;transition:.15s}
.tb-btn:hover{border-color:var(--cyan);color:var(--cyan-dark)}
.tb-btn svg{width:14px;height:14px}
.tb-btn.primary{background:var(--cyan);color:#fff;border-color:var(--cyan)}
.tb-btn.primary:hover{background:var(--cyan-dark);color:#fff}

.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--text);color:#fff;padding:12px 20px;border-radius:12px;font-family:'Assistant';font-weight:700;font-size:.85rem;box-shadow:var(--shadow-lg);z-index:100;opacity:0;transition:.25s;pointer-events:none}
.toast.show{opacity:1;transform:translateX(-50%) translateY(-6px)}
</style>
</head>
<body>

<header class="header">
  <div class="brand">
    <div class="brand-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    </div>
    <div>
      <h1>מצבת תלמידים</h1>
      <p>אורט בית הערבה ירושלים · תשפ"ו</p>
    </div>
  </div>
  <a class="back-link" href="index.html">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
    חזרה לניהול
  </a>
</header>

<main class="container">

  <section class="kpi-row">
    <div class="kpi cyan">
      <div class="kpi-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>כל התלמידים</div>
      <div class="kpi-value" id="kpi-all">0</div>
      <div class="kpi-sub">מצבת פעילה</div>
    </div>
    <div class="kpi amber">
      <div class="kpi-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>להוריד</div>
      <div class="kpi-value" id="kpi-remove">0</div>
      <div class="kpi-sub">להסיר מהמצבת</div>
    </div>
    <div class="kpi pink">
      <div class="kpi-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>נשירה גלויה</div>
      <div class="kpi-value" id="kpi-visible">0</div>
      <div class="kpi-sub">נשירה מזוהה</div>
    </div>
    <div class="kpi turq">
      <div class="kpi-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>נשירה סמויה</div>
      <div class="kpi-value" id="kpi-hidden">0</div>
      <div class="kpi-sub">סיכון לנשירה</div>
    </div>
  </section>

  <nav class="tabs">
    <button class="tab-btn active" data-tab="all">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
      כל התלמידים
      <span class="tab-count" id="count-all">0</span>
    </button>
    <button class="tab-btn" data-tab="remove">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
      להוריד
      <span class="tab-count" id="count-remove">0</span>
    </button>
    <button class="tab-btn" data-tab="visible">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/></svg>
      נשירה גלויה
      <span class="tab-count" id="count-visible">0</span>
    </button>
    <button class="tab-btn" data-tab="hidden">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      נשירה סמויה
      <span class="tab-count" id="count-hidden">0</span>
    </button>
  </nav>

  <section id="panel-all" class="tab-panel active">
    <div class="toolbar">
      <button class="tb-btn" id="export-csv">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        ייצוא CSV
      </button>
      <button class="tb-btn" id="reset-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
        איפוס
      </button>
    </div>
    <div class="filters">
      <input type="text" class="filter-search" placeholder="חיפוש לפי שם, כיתה, הורה..." id="search-all">
      <button class="filter-chip active" data-class="all">הכל</button>
      <button class="filter-chip" data-class="ט">ט</button>
      <button class="filter-chip" data-class="י'">י</button>
      <button class="filter-chip" data-class='י"א'>י״א</button>
      <button class="filter-chip" data-class='י"ב'>י״ב</button>
    </div>
    <div class="table-wrap">
      <table id="table-all"><thead><tr>
        <th class="col-num">#</th><th>שם</th><th>כיתה</th><th>נייד תלמיד</th><th>ת.ז</th>
        <th>תאריך לידה</th><th>עיר</th><th>הורה 1</th><th>הורה 2</th><th>פעולות</th>
      </tr></thead><tbody></tbody></table>
    </div>
  </section>

  <section id="panel-remove" class="tab-panel">
    <div class="filters"><input type="text" class="filter-search" placeholder="חיפוש..." id="search-remove"></div>
    <div class="table-wrap">
      <table id="table-remove"><thead><tr>
        <th class="col-num">#</th><th>שם</th><th>כיתה</th><th>ת.ז</th><th>הורה 1</th><th>הורה 2</th><th>פעולות</th>
      </tr></thead><tbody></tbody></table>
    </div>
  </section>

  <section id="panel-visible" class="tab-panel">
    <div class="filters"><input type="text" class="filter-search" placeholder="חיפוש..." id="search-visible"></div>
    <div class="table-wrap">
      <table id="table-visible"><thead><tr>
        <th class="col-num">#</th><th>שם</th><th>כיתה</th><th>ת.ז</th><th>הורה 1</th><th>הורה 2</th><th>פעולות</th>
      </tr></thead><tbody></tbody></table>
    </div>
  </section>

  <section id="panel-hidden" class="tab-panel">
    <div class="filters"><input type="text" class="filter-search" placeholder="חיפוש..." id="search-hidden"></div>
    <div class="table-wrap">
      <table id="table-hidden"><thead><tr>
        <th class="col-num">#</th><th>שם</th><th>כיתה</th><th>ת.ז</th><th>הורה 1</th><th>הורה 2</th><th>פעולות</th>
      </tr></thead><tbody></tbody></table>
    </div>
  </section>

</main>

<div class="toast" id="toast"></div>

<script>
const STUDENTS = __DATA__;
const STORAGE_KEY = 'ort-student-roster-v1';
const TAB_NAMES = {all:'כל התלמידים',remove:'להוריד',visible:'נשירה גלויה',hidden:'נשירה סמויה'};

// state: { [tz]: tab }
let state = {};
try { state = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch(e){}

function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
const STATUS_TO_TAB = {active:'all',removed:'remove',visible:'visible',hidden:'hidden'};
function tabOf(s){
  if(state[s.tz]) return state[s.tz];
  return STATUS_TO_TAB[s.status] || 'all';
}
function moveStudent(tz, target){
  if(target === 'all') delete state[tz]; else state[tz] = target;
  saveState(); renderAll();
  const s = STUDENTS.find(x=>x.tz===tz);
  showToast(`${s.fam} ${s.given} → ${TAB_NAMES[target]}`);
}

let filters = { all:{q:'',cls:'all'}, remove:{q:''}, visible:{q:''}, hidden:{q:''} };

function matchQuery(s, q){
  if(!q) return true;
  q = q.toLowerCase();
  return (s.fam+' '+s.given+' '+s.class+' '+s.p1_name+' '+s.p2_name+' '+s.city+' '+s.tz).toLowerCase().includes(q);
}
function matchClass(s, cls){
  if(cls === 'all') return true;
  return s.class.startsWith(cls);
}

function escapeHtml(s){return (s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);}

function rowHtml(s, showFull){
  const addr = [s.street, s.house, s.apt && `דירה ${s.apt}`, s.city].filter(Boolean).join(' ');
  const phone = (name, ph) => ph ? `<div class="phone-cell"><span class="pname">${escapeHtml(name)}</span><a href="tel:${ph}">${ph}</a></div>` : '<span class="pname">—</span>';
  const menuBtns = ['all','remove','visible','hidden'].filter(t=>t!==tabOf(s)).map(t=>
    `<button data-target="${t}" data-tz="${s.tz}"><span class="dot"></span>${TAB_NAMES[t]}</button>`
  ).join('');
  const actions = `<div class="actions"><button class="move-btn" data-tz="${s.tz}" title="העבר">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
  </button><div class="move-menu" data-for="${s.tz}">${menuBtns}</div></div>`;

  const stuPh = s.student_phone ? `<a href="tel:${s.student_phone.replace(/-/g,'')}" style="color:var(--pink-dark);font-weight:700;text-decoration:none">${s.student_phone}</a>` : '<span class="pname">—</span>';
  if(showFull){
    return `<tr>
      <td class="col-num">${s.num}</td>
      <td class="col-name"><span class="given">${escapeHtml(s.given)}</span> ${escapeHtml(s.fam)}</td>
      <td><span class="class-badge">${escapeHtml(s.class)}</span></td>
      <td>${stuPh}</td>
      <td>${escapeHtml(s.tz)}</td>
      <td>${escapeHtml(s.birth)}</td>
      <td class="addr">${escapeHtml(s.city)}</td>
      <td>${phone(s.p1_name, s.p1_phone)}</td>
      <td>${phone(s.p2_name, s.p2_phone)}</td>
      <td>${actions}</td>
    </tr>`;
  }
  return `<tr>
    <td class="col-num">${s.num}</td>
    <td class="col-name"><span class="given">${escapeHtml(s.given)}</span> ${escapeHtml(s.fam)}</td>
    <td><span class="class-badge">${escapeHtml(s.class)}</span></td>
    <td>${escapeHtml(s.tz)}</td>
    <td>${phone(s.p1_name, s.p1_phone)}</td>
    <td>${phone(s.p2_name, s.p2_phone)}</td>
    <td>${actions}</td>
  </tr>`;
}

function renderTab(tab){
  const tbody = document.querySelector(`#table-${tab} tbody`);
  const list = STUDENTS.filter(s=>tabOf(s)===tab)
    .filter(s=>matchQuery(s, filters[tab].q))
    .filter(s=>tab==='all' ? matchClass(s, filters.all.cls) : true);
  if(list.length === 0){
    const colspan = tab === 'all' ? 10 : 7;
    tbody.innerHTML = `<tr><td colspan="${colspan}" class="empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <h3>אין תלמידים להצגה</h3><p>אין תלמידים בטאב זה או שהסינון לא מתאים.</p></td></tr>`;
  } else {
    tbody.innerHTML = list.map(s=>rowHtml(s, tab==='all')).join('');
  }
  // counts
  document.getElementById('count-'+tab).textContent = STUDENTS.filter(s=>tabOf(s)===tab).length;
  document.getElementById('kpi-'+tab).textContent = STUDENTS.filter(s=>tabOf(s)===tab).length;
}

function renderAll(){
  ['all','remove','visible','hidden'].forEach(renderTab);
}

// tab switching
document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const t = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.toggle('active', b===btn));
    document.querySelectorAll('.tab-panel').forEach(p=>p.classList.toggle('active', p.id==='panel-'+t));
  });
});

// filters
['all','remove','visible','hidden'].forEach(tab=>{
  const inp = document.getElementById('search-'+tab);
  if(inp) inp.addEventListener('input', e=>{ filters[tab].q = e.target.value; renderTab(tab); });
});
document.querySelectorAll('#panel-all .filter-chip').forEach(chip=>{
  chip.addEventListener('click', ()=>{
    document.querySelectorAll('#panel-all .filter-chip').forEach(c=>c.classList.remove('active'));
    chip.classList.add('active');
    filters.all.cls = chip.dataset.class;
    renderTab('all');
  });
});

// move menu (event delegation)
document.addEventListener('click', e=>{
  const mb = e.target.closest('.move-btn');
  const mi = e.target.closest('.move-menu button');
  if(mi){
    e.stopPropagation();
    moveStudent(mi.dataset.tz, mi.dataset.target);
    document.querySelectorAll('.move-menu.open').forEach(m=>m.classList.remove('open'));
    return;
  }
  if(mb){
    e.stopPropagation();
    const menu = mb.parentElement.querySelector('.move-menu');
    const wasOpen = menu.classList.contains('open');
    document.querySelectorAll('.move-menu.open').forEach(m=>m.classList.remove('open'));
    if(!wasOpen) menu.classList.add('open');
    return;
  }
  document.querySelectorAll('.move-menu.open').forEach(m=>m.classList.remove('open'));
});

// reset
document.getElementById('reset-btn').addEventListener('click', ()=>{
  if(!confirm('לאפס את כל השיוכים? כל התלמידים יחזרו לטאב "כל התלמידים".')) return;
  state = {}; saveState(); renderAll(); showToast('אופס בהצלחה');
});

// export
document.getElementById('export-csv').addEventListener('click', ()=>{
  const rows = [['מס','שם משפחה','שם פרטי','כיתה','נייד תלמיד','ת.ז','מין','תאריך לידה','רחוב','מס','דירה','עיר','הורה 1','טל הורה 1','הורה 2','טל הורה 2','סטטוס']];
  STUDENTS.forEach(s=>rows.push([s.num,s.fam,s.given,s.class,s.student_phone||'',s.tz,s.gender,s.birth,s.street,s.house,s.apt,s.city,s.p1_name,s.p1_phone,s.p2_name,s.p2_phone,TAB_NAMES[tabOf(s)]]));
  const csv = '\uFEFF' + rows.map(r=>r.map(c=>`"${String(c||'').replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'student-roster.csv';
  a.click();
});

// toast
let toastTimer;
function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove('show'), 2400);
}

renderAll();
</script>
</body>
</html>
"""

html = html.replace("__DATA__", data_js)

out = r"c:\Users\meyta\Downloads\ort-presentation-builder\docs\management\student-roster.html"
with open(out, "w", encoding="utf-8") as f:
    f.write(html)
print(f"Wrote: {out}  ({len(html)} bytes, {len(students)} students)")
