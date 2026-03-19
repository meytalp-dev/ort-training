import { readFileSync, writeFileSync } from 'fs';

let html = readFileSync('docs/management/index.html', 'utf8');

// === 1. CSS: Add new styles after .grade-sep ===
html = html.replace(
  '.grade-sep td{border-top:3px solid var(--primary)!important}\n\n/* Teacher Forms Panel */',
  `.grade-sep td{border-top:3px solid var(--primary)!important}
.stats-row-5{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:16px}
@media(max-width:900px){.stats-row-5{grid-template-columns:repeat(3,1fr)}}
.class-section{border-bottom:3px solid var(--primary)}.class-section:last-child{border-bottom:none}
.class-section-header{background:linear-gradient(135deg,#D4F3EF,#f0faf8);padding:14px 20px;font-weight:700;font-size:1rem;color:var(--primary-dark);display:flex;align-items:center;justify-content:space-between}
.grade-total{background:linear-gradient(135deg,var(--accent),#d4a93a);color:#1E293B;padding:14px 20px;font-weight:700;font-size:.95rem;display:flex;justify-content:space-between}
.pos-bar-wrap{width:80px;height:8px;background:var(--border);border-radius:4px;display:inline-block;vertical-align:middle;margin-right:6px}
.pos-bar{height:100%;border-radius:4px;transition:.3s}

/* Teacher Forms Panel */`
);

// === 2. HTML: Replace curriculum section ===
const curHTMLStart = html.indexOf('<!-- CURRICULUM -->');
const curHTMLEnd = html.indexOf('</div><!-- /container -->');
const newCurHTML = `<!-- CURRICULUM -->
<div id="page-curriculum" style="display:none">
  <div class="section-header">
    <div class="section-icon">\u{1F4CB}</div>
    <div><h2>\u05EA\u05DB\u05E0\u05D5\u05DF \u05E4\u05D3\u05D2\u05D5\u05D2\u05D9</h2><p>\u05E4\u05E8\u05D9\u05E1\u05EA \u05E9\u05E2\u05D5\u05EA \u05D5\u05E9\u05D9\u05D1\u05D5\u05E5 \u05DE\u05D5\u05E8\u05D9\u05DD \u05DC\u05E4\u05D9 \u05E9\u05DB\u05D1\u05D5\u05EA \u05D5\u05DB\u05D9\u05EA\u05D5\u05EA</p></div>
  </div>
  <div id="keyGateCurriculum"></div>
  <div id="curriculumContent" style="display:none">
    <div class="stats-row-5" id="curDashboard"></div>
    <div id="formsAlert"></div>
    <div class="card" style="margin-bottom:16px">
      <div class="card-header"><h3>\u05DE\u05D7\u05E0\u05DB\u05D9\u05DD \u05DC\u05E9\u05E0\u05D4 \u05D4\u05D1\u05D0\u05D4</h3></div>
      <div class="card-body"><div id="homeroomCards"></div></div>
    </div>
    <div class="card" style="margin-bottom:16px">
      <div class="card-header" style="flex-wrap:wrap;gap:6px">
        <h3>\u05E9\u05DB\u05D1\u05D4:</h3>
        <div class="class-tabs" id="gradeTabs"></div>
      </div>
      <div class="card-body" style="padding:0" id="gradeContent"></div>
    </div>
    <div class="split">
      <div>
        <div class="card">
          <div class="card-header">
            <h3>\u05E1\u05D9\u05DB\u05D5\u05DD \u05E9\u05E2\u05D5\u05EA \u05DE\u05D5\u05E8\u05D9\u05DD</h3>
            <button class="btn btn-sm btn-ghost" onclick="loadTeacherForms()">\u{1F441} \u05E6\u05E4\u05D4 \u05D1\u05D8\u05E4\u05E1\u05D9\u05DD</button>
          </div>
          <div class="card-body" style="padding:0;overflow-x:auto" id="teacherSummary"></div>
        </div>
        <div class="card" style="margin-top:16px">
          <div class="card-header"><h3>\u05E1\u05D9\u05DB\u05D5\u05DD \u05E9\u05E2\u05D5\u05EA \u05DC\u05E4\u05D9 \u05DE\u05E7\u05E6\u05D5\u05E2</h3></div>
          <div class="card-body" style="padding:0"><table class="summary-tbl" id="subjectSummary"></table></div>
        </div>
      </div>
      <div class="card" style="display:flex;flex-direction:column">
        <div class="card-header"><h3>\u{1F916} \u05E1\u05D5\u05DB\u05DF AI \u2013 \u05EA\u05DB\u05E0\u05D5\u05DF \u05E4\u05D3\u05D2\u05D5\u05D2\u05D9</h3></div>
        <div class="chat-area" id="curChatArea">
          <div class="chat-messages" id="curChatMsgs">
            <div class="chat-empty">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 3v18"/></svg>
              \u05E9\u05D0\u05DC\u05D5 \u05D0\u05D5\u05EA\u05D9 \u05E2\u05DC \u05E4\u05E8\u05D9\u05E1\u05EA \u05E9\u05E2\u05D5\u05EA, \u05E9\u05D9\u05D1\u05D5\u05E5 \u05DE\u05D5\u05E8\u05D9\u05DD, \u05E4\u05E2\u05E8\u05D9\u05DD...
            </div>
          </div>
          <div class="chat-input">
            <textarea id="curChatIn" placeholder="\u05DB\u05EA\u05D1\u05D5 \u05D4\u05D5\u05D3\u05E2\u05D4..." rows="1" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendChat('curriculum')}"></textarea>
            <button class="chat-send" onclick="sendChat('curriculum')">\u27A4</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

`;
html = html.substring(0, curHTMLStart) + newCurHTML + html.substring(curHTMLEnd);

// === 3. JS: Replace curriculum section ===
const jsStart = html.indexOf('// ===================== CURRICULUM =====================');
const jsEnd = html.indexOf('function num(v)');

const newCurJS = `// ===================== CURRICULUM =====================
const HOMEROOMS=[
  {grade:'\u05D9\u05D0',cls:'\u05D9\u05D0\u0031',teacher:'\u05E8\u05E2\u05D9\u05D4 \u05D9\u05E6\u05D7\u05E7\u05D9'},{grade:'\u05D9\u05D0',cls:'\u05D9\u05D0\u0032',teacher:'\u05D0\u05D5\u05E4\u05D9\u05E8\u05D4 \u05DE\u05DC\u05DB\u05D4'},{grade:'\u05D9\u05D0',cls:'\u05D9\u05D0\u0033',teacher:'\u05E4\u05E8\u05DC\u05D4 \u05E9\u05D0\u05D6\u05D5'},
  {grade:'\u05D9\u05D1',cls:'\u05D9\u05D1\u0031',teacher:'\u05D9\u05E2\u05E7\u05D1 \u05D2\u05E8\u05D5\u05E0\u05E1\u05E4\u05DC\u05D3'},{grade:'\u05D9\u05D1',cls:'\u05D9\u05D1\u0032',teacher:'\u05E0\u05E2\u05DE\u05D4 \u05E7\u05D5\u05E1\u05D8\u05DF'},{grade:'\u05D9\u05D1',cls:'\u05D9\u05D1\u0033',teacher:'\u05D2\u05D9\u05D0 \u05E0\u05EA\u05E0\u05D0\u05DC'}
];
const CLASS_LIST=['\u05D81','\u05D91','\u05D92','\u05D93','\u05D9\u05D01','\u05D9\u05D02','\u05D9\u05D03','\u05D9\u05D11','\u05D9\u05D12','\u05D9\u05D13'];
const GRADE_CLASSES={'\u05D8':['\u05D81'],'\u05D9':['\u05D91','\u05D92','\u05D93'],'\u05D9\u05D0':['\u05D9\u05D01','\u05D9\u05D02','\u05D9\u05D03'],'\u05D9\u05D1':['\u05D9\u05D11','\u05D9\u05D12','\u05D9\u05D13']};
const GRADE_LIST=['\u05D8','\u05D9','\u05D9\u05D0','\u05D9\u05D1'];
const DEFAULT_SUBJECTS=['\u05E2\u05D1\u05E8\u05D9\u05EA','\u05DC\u05E9\u05D5\u05DF','\u05E1\u05E4\u05E8\u05D5\u05EA','\u05DE\u05EA\u05DE\u05D8\u05D9\u05E7\u05D4','\u05D0\u05E0\u05D2\u05DC\u05D9\u05EA','\u05D4\u05D9\u05E1\u05D8\u05D5\u05E8\u05D9\u05D4','\u05D0\u05D6\u05E8\u05D7\u05D5\u05EA','\u05EA\u05E0"\u05DA','\u05D7\u05D9\u05E0\u05D5\u05DA \u05D2\u05D5\u05E4\u05E0\u05D9','\u05DE\u05D2\u05DE\u05EA \u05E2\u05D9\u05E6\u05D5\u05D1 \u05E9\u05D9\u05E2\u05E8','\u05DE\u05D2\u05DE\u05EA \u05DE\u05D7\u05E9\u05D1\u05D9\u05DD','\u05DE\u05D2\u05DE\u05EA \u05D0\u05D5\u05D8\u05D5\u05D8\u05E8\u05D5\u05E0\u05D9\u05E7\u05D4'];
const TEACHER_LIST=['\u05D0\u05D5\u05E4\u05D9\u05E8\u05D4 \u05DE\u05DC\u05DB\u05D4','\u05D0\u05DC\u05D9\u05D0\u05DC \u05E7\u05D5\u05E1\u05E7\u05D0\u05E1','\u05D0\u05E4\u05E8\u05EA \u05D1\u05E8 \u05D0\u05E9\u05E8','\u05D1\u05EA \u05E9\u05D1\u05E2 \u05D0\u05D3\u05DC\u05E8','\u05D2\u05D9\u05D0 \u05E0\u05EA\u05E0\u05D0\u05DC','\u05D5\u05D9\u05E7\u05D9 \u05E7\u05DC\u05D3\u05E8\u05D5\u05DF','\u05D7\u05D5\u05D4','\u05D9\u05D5\u05D0\u05D1 \u05E8\u05D5\u05D8','\u05D9\u05E2\u05E7\u05D1 \u05D2\u05E8\u05D5\u05E0\u05E1\u05E4\u05DC\u05D3','\u05DC\u05D9\u05D0\u05EA \u05D1\u05E0\u05D2\\'\\u05D5','\u05DE\u05DC\u05D9 \u05E0\u05DE\u05D9\u05E8','\u05DE\u05E0\u05D5 \u05D3\u05D4\u05D0\u05DF','\u05DE\u05E8\u05D9\u05D0\u05DF','\u05DE\u05E9\u05D4 \u05E6\u05D1\u05E8\u05D9','\u05E0\u05E2\u05DE\u05D4 \u05E7\u05D5\u05E1\u05D8\u05DF','\u05E4\u05E8\u05DC\u05D4 \u05E9\u05D0\u05D6\u05D5','\u05E8\u05E2\u05D9\u05D4 \u05D9\u05E6\u05D7\u05E7\u05D9','\u05E9\u05D9 \u05D1\u05D2\u05DC\u05E8'];
const FULL_POSITION_HOURS=25;
let selectedGrade='\u05D8';
let teacherForms=[];

function buildDefaultSchedule(){
  const sched={};
  CLASS_LIST.forEach(cls=>{sched[cls]=DEFAULT_SUBJECTS.map(subj=>({subject:subj,hours:'',teacher:''}))});
  return sched;
}
let classSchedule=JSON.parse(localStorage.getItem('mgmt-class-schedule')||'null')||buildDefaultSchedule();
CLASS_LIST.forEach(cls=>{if(!classSchedule[cls])classSchedule[cls]=DEFAULT_SUBJECTS.map(subj=>({subject:subj,hours:'',teacher:''}))});

function initCurriculum(){
  if(!checkKey('curriculum'))return;
  document.getElementById('keyGateCurriculum').innerHTML='';
  document.getElementById('curriculumContent').style.display='';
  if(!teacherForms.length){
    const cb='cbAutoForms_'+Date.now();
    window[cb]=function(d){delete window[cb];if(d.forms){teacherForms=d.forms;renderCurriculum()}};
    const s=document.createElement('script');s.src=\`\${APPS_SCRIPT}?action=getTeacherForms&callback=\${cb}\`;s.onerror=()=>delete window[cb];document.head.appendChild(s);
  }
  renderCurriculum();
}

`;

// Wait - this approach with unicode escapes is getting out of hand. Let me use a different strategy.
// I'll write the new JS to a separate file, then splice it in.

writeFileSync('docs/management/index.html', html, 'utf8');
console.log('Updated!');
