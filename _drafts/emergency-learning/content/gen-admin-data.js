/* רֶצֶף — גנרטור נתוני-אדמין (פנימי).
 * מאחד: curriculum-data.js (מתוכנן) + units-data.js (בנוי) + produced.js (שלב) +
 *        tracks-data.js (בתי-ספר/מגמות/מגזר)  →  ../admin-data.js (window.ADMIN)
 * הרצה:  node content/gen-admin-data.js   (אחרי gen-units.js)
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

function loadWindow(rel){
  const w = {};
  const txt = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  new Function('window', txt)(w);
  return w;
}
const CUR    = loadWindow('content/curriculum-data.js').CURRICULUM || {};
const PROD   = loadWindow('content/produced.js').PRODUCED || {};
const TRACKS = loadWindow('tracks-data.js').RETZEF_TRACKS || {tracks:[],schools:[],schoolTracks:[]};
const UNITS  = loadWindow('units-data.js').RETZEF_UNITS || [];

/* שמות עבריים לכל 22 המקצועות המתוכננים (+financial שהוא רק-בנוי) */
const HE = {
  'hair-design':'עיצוב שיער','confectionery':'קונדיטוריה','media-design':'עיצוב מדיה',
  'textile-design':'עיצוב טקסטיל','ict-systems':'מערכות ICT','green-building':'בנייה ירוקה',
  'auto-tech':'אוטוטרוניקה','welding':'ריתוך','cooling-hvac':'קירור ומיזוג','logistics':'לוגיסטיקה',
  'driving-instruction':'הוראת נהיגה','football':'כדורגל','hebrew':'עברית','arabic':'ערבית',
  'english':'אנגלית','civics':'אזרחות','literature':'ספרות','history-arabic':'היסטוריה · ערבי',
  'history-diploma':'היסטוריה · תעודה','kodesh':'קודש','tanach':'תנ"ך','math':'מתמטיקה',
  'financial':'ניהול פיננסי'
};

/* יחידות בנויות מקובצות לפי מקצוע|מודולה */
const byMod = {}; // "subj|n" → [units]
UNITS.forEach(u => {
  const key = u.subject + '|' + parseInt(u.module,10);
  (byMod[key] = byMod[key] || []).push(u);
});
const builtBySubj = {}; // subj → count
UNITS.forEach(u => builtBySubj[u.subject] = (builtBySubj[u.subject]||0)+1);

/* אוסף כל מפתחות-המקצוע: מתוכנן ∪ בנוי */
const allSubjKeys = Array.from(new Set([...Object.keys(CUR), ...Object.keys(builtBySubj)]));

const subjects = allSubjKeys.map(key => {
  const planned = CUR[key];
  const plannedMods = planned ? planned.mods : [];
  const built = builtBySubj[key] > 0;

  // אינדקס מודולות בנויות בפועל (לפי מספר)
  const builtModNums = new Set(UNITS.filter(u=>u.subject===key).map(u=>parseInt(u.module,10)));

  // מיזוג: כל מספרי-המודולה (מתוכנן ∪ בנוי)
  const modNums = Array.from(new Set([
    ...plannedMods.map(m=>m.n),
    ...Array.from(builtModNums)
  ])).sort((a,b)=>a-b);

  const modules = modNums.map(n => {
    const pm = plannedMods.find(m=>m.n===n) || {};
    const units = (byMod[key+'|'+n] || []).slice().sort((a,b)=> a.id.localeCompare(b.id,'he'));
    const prod = PROD[key+'|'+n];
    const plannedKnow = (pm.knowledge||[]).length;
    return {
      n,
      title: pm.title || ('מודולה '+n),
      knowledge: pm.knowledge || [],
      skills: pm.skills || [],
      responsibility: pm.responsibility || '',
      assess: pm.assess || '',
      stage: prod ? prod.stage : null,       // built | reviewed | null
      units: units.map((u,i)=>({
        order: i+1, id:u.id, title:u.title, idea:u.idea, skill:u.skill,
        levels:u.levels, status:u.status, pedagogy:u.pedagogy, file:u.file,
        format: (u.levels&&u.levels.length)?'ok':'check'
      })),
      builtCount: units.length,
      plannedKnowledge: plannedKnow,
      coverage: plannedKnow ? Math.round(units.length/plannedKnow*100) : (units.length?100:0)
    };
  });

  const unitCount = builtBySubj[key] || 0;
  const builtMods = modules.filter(m=>m.builtCount>0).length;
  return {
    key, he: HE[key] || key,
    planned: !!planned, built,
    unitCount,
    moduleCount: modules.length,
    plannedModuleCount: plannedMods.length,
    builtModuleCount: builtMods,
    unverified: UNITS.filter(u=>u.subject===key && u.pedagogy==='unverified').length,
    modules
  };
}).sort((a,b)=> (b.unitCount-a.unitCount) || a.he.localeCompare(b.he,'he'));

/* בתי-ספר עם שמות-מגמות ומגזר */
const trackById = {};
(TRACKS.tracks||[]).forEach(t=>trackById[t.id]=t);
const schoolTrackMap = {};
(TRACKS.schoolTracks||[]).forEach(st=>{
  if(st.active!==false){ (schoolTrackMap[st.school_id]=schoolTrackMap[st.school_id]||[]).push(st.track_id); }
});
const schools = (TRACKS.schools||[]).map(s=>({
  id:s.id, name:s.name, district:s.district||'', code:s.code||'',
  sector:s.sector, sectorDetail:s.sector_detail||'',
  confidence:s.sector_confidence||'',
  tracks: (schoolTrackMap[s.id]||[]).map(id=> (trackById[id]||{}).name || id)
})).sort((a,b)=>a.name.localeCompare(b.name,'he'));

const tracks = (TRACKS.tracks||[]).map(t=>({id:t.id,name:t.name,domain:t.domain||'',active:t.active!==false}))
  .sort((a,b)=>a.name.localeCompare(b.name,'he'));

const meta = {
  plannedSubjects: Object.keys(CUR).length,
  builtSubjects: Object.keys(builtBySubj).length,
  plannedModules: Object.values(CUR).reduce((s,x)=>s+(x.mods?x.mods.length:0),0),
  builtUnits: UNITS.length,
  schools: schools.length,
  tracks: tracks.length,
  sectorHe: schools.filter(s=>s.sector==='he').length,
  sectorAr: schools.filter(s=>s.sector==='ar').length,
  districts: schools.reduce((m,s)=>{ if(s.district){m[s.district]=(m[s.district]||0)+1;} return m; },{})
};

const out =
`/* 🤖 נוצר אוטומטית ע"י content/gen-admin-data.js — אל תערוך ידנית.
   הרץ: node content/gen-units.js && node content/gen-admin-data.js */
window.ADMIN = ${JSON.stringify({meta, subjects, schools, tracks})};
`;
fs.writeFileSync(path.join(ROOT,'admin-data.js'), out, 'utf8');
console.log('נכתב admin-data.js');
console.log(meta);
