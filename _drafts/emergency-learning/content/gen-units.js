/* רֶצֶף — גנרטור פרוטוטייפ-בדיקה (לא הפקה סופית).
 * סורק content/<מקצוע>/module-XX/unit-*.md, מחלץ frontmatter + כותרת,
 * ומייצר ../units-data.js: window.RETZEF_UNITS (מטא-דאטה לכל 444) +
 * window.RETZEF_SAMPLES (טקסט-md גולמי ל-3 יחידות-דוגמה, לרינדור אופליין).
 * הרצה:  node content/gen-units.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname; // .../content
const SUBJECTS_HE = {
  'hebrew':'עברית','math':'מתמטיקה','media-design':'עיצוב מדיה','hair-design':'עיצוב שיער',
  'logistics':'לוגיסטיקה','ict-systems':'מערכות ICT','football':'כדורגל','confectionery':'קונדיטוריה',
  'textile-design':'עיצוב טקסטיל','financial':'ניהול פיננסי','welding':'ריתוך'
};
const SAMPLE_SUBJECTS = ['hebrew','media-design','hair-design'];

function parseFront(txt){
  const m = txt.match(/^---\n([\s\S]*?)\n---/);
  const fm = {};
  if(m){
    m[1].split('\n').forEach(line=>{
      const i = line.indexOf(':');
      if(i>0){ let k=line.slice(0,i).trim(); let v=line.slice(i+1).trim().replace(/^"|"$/g,''); fm[k]=v; }
    });
  }
  return fm;
}
function title(txt){
  const m = txt.match(/^#\s+(.+)$/m);
  return m ? m[1].replace(/^יחידה\s+\d+\s*[—-]\s*/,'').trim() : '(ללא כותרת)';
}
function idea(txt){
  const m = txt.match(/^>\s*רעיון מרכזי[^:]*:\s*(.+)$/m);
  return m ? m[1].trim() : '';
}
function levels(txt){
  const L=[];
  if(/##\s*🟢.*basic/i.test(txt)) L.push('basic');
  if(/##\s*🔵.*standard/i.test(txt)) L.push('standard');
  if(/##\s*🟣.*advanced/i.test(txt)) L.push('advanced');
  return L;
}
function clean(s){ return (s||'').replace(/\[לאימות[^\]]*\]/g,'').replace(/["`]/g,'').trim(); }

const units=[]; const samples={}; const perSubject={};
for(const subj of Object.keys(SUBJECTS_HE)){
  const sdir = path.join(ROOT, subj);
  if(!fs.existsSync(sdir)) continue;
  const mods = fs.readdirSync(sdir).filter(d=>/^module-\d+/.test(d)).sort();
  for(const mod of mods){
    const mdir = path.join(sdir, mod);
    const files = fs.readdirSync(mdir).filter(f=>/^unit-.*\.md$/.test(f)).sort();
    const modNum = (mod.match(/module-(\d+)/)||[])[1] || '?';
    for(const f of files){
      const fp = path.join(mdir, f);
      const txt = fs.readFileSync(fp,'utf8');
      const fm = parseFront(txt);
      const rel = ['content',subj,mod,f].join('/');
      const id = `${subj}/m${modNum}/${f.replace(/^unit-|\.md$/g,'')}`;
      const lv = levels(txt);
      const u = {
        id, file: rel, subject: subj, subjectHe: SUBJECTS_HE[subj],
        module: modNum, moduleHe: clean(fm.module) || ('מ'+modNum),
        title: title(txt), idea: idea(txt), skill: clean(fm.skill),
        levels: lv, status: clean(fm.status)||'טיוטה',
        pedagogy: /לאימות/.test(fm.pedagogy_verified||'') ? 'unverified' : 'ok',
        palette: fm.palette_primary || '#0B8F98'
      };
      units.push(u);
      perSubject[subj]=(perSubject[subj]||0)+1;
      // דגימת raw ליחידה הראשונה בכל מקצוע-דוגמה
      if(SAMPLE_SUBJECTS.includes(subj) && !samples[subj]){
        samples[subj] = { id, title: u.title, subjectHe: u.subjectHe, moduleHe: u.moduleHe, palette: u.palette, raw: txt };
      }
    }
  }
}

const out =
`/* 🤖 נוצר אוטומטית ע"י content/gen-units.js — פרוטוטייפ-בדיקה. אל תערוך ידנית. */
window.RETZEF_UNITS = ${JSON.stringify(units)};
window.RETZEF_UNITS_BY_SUBJECT = ${JSON.stringify(perSubject)};
window.RETZEF_SAMPLES = ${JSON.stringify(samples)};
`;
fs.writeFileSync(path.join(ROOT,'..','units-data.js'), out, 'utf8');
console.log(`נכתב units-data.js — ${units.length} יחידות, ${Object.keys(samples).length} דוגמאות מרונדרות.`);
console.log('לפי מקצוע:', perSubject);
